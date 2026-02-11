'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuyShares, useChainSwitch } from '@/hooks';
import { formatUSDC, formatShares, parseUSDCInput } from '@/lib/utils';
import { parseContractError, isUserRejection } from '@/lib/errors';
import { SHARES_DECIMALS, type Answer } from '@/lib/contracts';

interface BuySharesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answer: Answer;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = ['5', '10', '25', '50'];

export function BuySharesModal({
  open,
  onOpenChange,
  answer,
  onSuccess,
}: BuySharesModalProps) {
  const { isConnected } = useAccount();
  const { isCorrectChain, switchToTargetChain, isSwitching, targetChainName } = useChainSwitch();
  const [amount, setAmount] = useState('10');

  const {
    buy,
    reset,
    error,
    isApproving,
    isPending,
    isSuccess,
    balance,
    txHash,
  } = useBuyShares({
    onSuccess: () => {
      toast.success('Shares purchased!', {
        description: `Bought ~${estimatedShares.toFixed(1)} shares`,
        action: txHash
          ? {
              label: 'View TX',
              onClick: () => window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank'),
            }
          : undefined,
      });
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 1500);
    },
    onError: (err) => {
      if (!isUserRejection(err)) {
        toast.error('Transaction failed', {
          description: parseContractError(err),
        });
      }
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAmount('10');
      reset();
    }
  }, [open, reset]);

  // Approval toast
  useEffect(() => {
    if (isApproving) {
      toast.loading('Approving USDC...', {
        id: 'approve-toast',
        description: 'Confirm in your wallet',
      });
    } else {
      toast.dismiss('approve-toast');
    }
  }, [isApproving]);

  // Parse input
  const usdcAmount = parseUSDCInput(amount);

  // Calculate price per share from pool
  // poolValue is in USDC (1e6 format), totalShares is in contract units (e.g., 500 = 5.00 shares)
  // Price per 1 displayed share = poolValue / (totalShares / SHARES_DECIMALS)
  const pricePerShare = answer.totalShares > 0n
    ? (Number(answer.poolValue) * SHARES_DECIMALS) / Number(answer.totalShares) / 1e6
    : 1.0; // Default $1.00 for new answers

  // Fees: 2% total
  const grossAmount = Number(usdcAmount) / 1e6;
  const fees = grossAmount * 0.02;
  const netAmount = grossAmount - fees;

  // Estimated shares (after fees)
  const estimatedShares = pricePerShare > 0 ? netAmount / pricePerShare : 0;

  const hasEnoughBalance = balance !== undefined && balance >= usdcAmount;

  const handleBuy = async () => {
    if (!amount || usdcAmount === 0n) return;

    // Min shares with 3% slippage buffer
    // estimatedShares is display value (e.g., 4.90), multiply by SHARES_DECIMALS for contract
    const minShares = BigInt(Math.floor(estimatedShares * 0.97 * SHARES_DECIMALS));

    toast.loading('Buying shares...', {
      id: 'buy-toast',
      description: 'Confirm in your wallet',
    });

    try {
      await buy(answer.id, amount, minShares);
      toast.dismiss('buy-toast');
    } catch {
      toast.dismiss('buy-toast');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Buy Shares: {answer.text}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Market Info */}
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
            <div>
              <div className="text-xs text-muted-foreground">Share Price</div>
              <div className="font-bold text-primary">${pricePerShare.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Pool Size</div>
              <div className="font-semibold">{formatUSDC(answer.poolValue)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total Shares</div>
              <div className="font-semibold">{formatShares(answer.totalShares)}</div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount (USDC)</span>
              {balance !== undefined && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setAmount((Number(balance) / 1e6).toFixed(2))}
                  disabled={isPending}
                >
                  Balance: {formatUSDC(balance)}
                </button>
              )}
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="text-lg h-12"
            />
            <div className="flex gap-1">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => setAmount(preset)}
                  disabled={isPending}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">You Pay</span>
              <span className="font-medium">${grossAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fees (2%)</span>
              <span>-${fees.toFixed(2)}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between">
              <span className="font-semibold">You Get</span>
              <span className="font-bold text-lg text-primary">~{estimatedShares.toFixed(2)} shares</span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              @ ${pricePerShare.toFixed(2)} per share
            </div>
          </div>

          {/* Error Message */}
          {error && !isUserRejection(error) && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{parseContractError(error)}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-xs text-green-500">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span>Purchase successful!</span>
            </div>
          )}

          {/* Action Button */}
          {isConnected && !isCorrectChain ? (
            <Button
              className="w-full"
              onClick={switchToTargetChain}
              disabled={isSwitching}
            >
              {isSwitching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                `Switch to ${targetChainName}`
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleBuy}
              disabled={!isConnected || isPending || !hasEnoughBalance || usdcAmount === 0n || isSuccess}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApproving ? 'Approving...' : 'Buying...'}
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Bought!
                </>
              ) : !isConnected ? (
                'Connect Wallet'
              ) : !hasEnoughBalance ? (
                'Insufficient USDC'
              ) : usdcAmount === 0n ? (
                'Enter Amount'
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Buy ~{estimatedShares.toFixed(1)} Shares
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
