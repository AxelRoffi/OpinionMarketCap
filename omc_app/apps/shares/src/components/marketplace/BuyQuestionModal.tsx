'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ShoppingCart, Loader2, Check, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ANSWER_SHARES_CORE_ABI, USDC_ABI, getContracts } from '@/lib/contracts';
import { useChainId } from 'wagmi';
import { formatUSDC, shortenAddress } from '@/lib/utils';

interface BuyQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: bigint;
  questionText: string;
  salePrice: bigint;
  seller: `0x${string}`;
  onSuccess?: () => void;
}

export function BuyQuestionModal({
  isOpen,
  onClose,
  questionId,
  questionText,
  salePrice,
  seller,
  onSuccess,
}: BuyQuestionModalProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const [step, setStep] = useState<'approve' | 'buy' | 'success'>('approve');
  const [error, setError] = useState('');

  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.USDC,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.ANSWER_SHARES_CORE] : undefined,
  });

  // Check USDC balance
  const { data: balance } = useReadContract({
    address: contracts.USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Approval transaction
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Buy transaction
  const {
    writeContract: buy,
    data: buyHash,
    isPending: isBuying,
    reset: resetBuy,
  } = useWriteContract();

  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Calculate fees
  const platformFee = (salePrice * 10n) / 100n; // 10%
  const sellerReceives = salePrice - platformFee;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      resetApprove();
      resetBuy();
      refetchAllowance();

      // Check if we need approval
      if (allowance !== undefined && allowance >= salePrice) {
        setStep('buy');
      } else {
        setStep('approve');
      }
    }
  }, [isOpen, allowance, salePrice, refetchAllowance, resetApprove, resetBuy]);

  // Update step after approval success
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
      setStep('buy');
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Handle buy success
  useEffect(() => {
    if (isBuySuccess) {
      setStep('success');
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isBuySuccess, onSuccess, onClose]);

  const handleApprove = async () => {
    setError('');
    try {
      approve({
        address: contracts.USDC,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [contracts.ANSWER_SHARES_CORE, salePrice],
      });
    } catch (err) {
      console.error('Approve error:', err);
      setError('Failed to approve USDC');
    }
  };

  const handleBuy = async () => {
    setError('');
    try {
      buy({
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'buyQuestion',
        args: [questionId],
      });
    } catch (err) {
      console.error('Buy error:', err);
      setError('Failed to buy question');
    }
  };

  const hasInsufficientBalance = balance !== undefined && balance < salePrice;
  const isLoading = isApproving || isApproveConfirming || isBuying || isBuyConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-500" />
            Buy Question
          </DialogTitle>
          <DialogDescription>
            Purchase ownership of this question
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Question #{questionId.toString()}</p>
            <p className="text-foreground font-medium">{questionText}</p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sale Price</span>
              <span className="text-foreground font-medium">{formatUSDC(salePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (10%)</span>
              <span className="text-yellow-500">{formatUSDC(platformFee)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Seller Receives</span>
              <span className="text-emerald-500">{formatUSDC(sellerReceives)}</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Owner</span>
            <span className="text-foreground font-mono">{shortenAddress(seller)}</span>
          </div>

          {/* Balance Warning */}
          {hasInsufficientBalance && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">
                Insufficient USDC balance. You have {formatUSDC(balance || 0n)}.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-400">Purchase successful! You now own this question.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'approve' && (
            <Button
              onClick={handleApprove}
              disabled={isLoading || hasInsufficientBalance}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isApproving ? 'Confirm in wallet...' : 'Approving...'}
                </>
              ) : (
                'Approve USDC'
              )}
            </Button>
          )}

          {step === 'buy' && (
            <Button
              onClick={handleBuy}
              disabled={isLoading || hasInsufficientBalance}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isBuying ? 'Confirm in wallet...' : 'Processing...'}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy for {formatUSDC(salePrice)}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
