'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { Tag, DollarSign, Loader2, Check, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CONTRACTS, ANSWER_SHARES_CORE_ABI, getContracts } from '@/lib/contracts';
import { useChainId } from 'wagmi';

interface ListQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: bigint;
  questionText: string;
  currentSalePrice: bigint;
  onSuccess?: () => void;
}

export function ListQuestionModal({
  isOpen,
  onClose,
  questionId,
  questionText,
  currentSalePrice,
  onSuccess,
}: ListQuestionModalProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const isListed = currentSalePrice > 0n;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrice(isListed ? (Number(currentSalePrice) / 1e6).toString() : '');
      setError('');
    }
  }, [isOpen, currentSalePrice, isListed]);

  // List/Update question for sale
  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async () => {
    setError('');

    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    const priceInWei = parseUnits(price, 6);

    try {
      writeContract({
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'listQuestionForSale',
        args: [questionId, priceInWei],
      });
    } catch (err) {
      console.error('List error:', err);
      setError('Failed to list question');
    }
  };

  const handleCancel = async () => {
    setError('');

    try {
      writeContract({
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'cancelQuestionSale',
        args: [questionId],
      });
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Failed to cancel listing');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      setTimeout(() => {
        reset();
        onClose();
      }, 1500);
    }
  }, [isSuccess, onSuccess, onClose, reset]);

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-500" />
            {isListed ? 'Update Listing' : 'List Question for Sale'}
          </DialogTitle>
          <DialogDescription>
            {isListed
              ? 'Update or cancel your question listing'
              : 'Set a price to sell your question ownership'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Question</p>
            <p className="text-foreground font-medium">{questionText}</p>
          </div>

          {isListed && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400">Currently listed for</p>
              <p className="text-lg font-bold text-emerald-500">
                ${(Number(currentSalePrice) / 1e6).toFixed(2)} USDC
              </p>
            </div>
          )}

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Sale Price (USDC)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="10.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Fee Breakdown */}
          {price && parseFloat(price) > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue Split</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sale Price</span>
                <span className="text-foreground">${parseFloat(price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="text-yellow-500">-${(parseFloat(price) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted-foreground font-medium">You Receive (90%)</span>
                <span className="text-emerald-500 font-bold">${(parseFloat(price) * 0.9).toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-400">Transaction successful!</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {isListed && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Cancel Listing
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !price}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isPending ? 'Confirm in wallet...' : 'Processing...'}
              </>
            ) : (
              <>
                <Tag className="w-4 h-4 mr-2" />
                {isListed ? 'Update Price' : 'List for Sale'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
