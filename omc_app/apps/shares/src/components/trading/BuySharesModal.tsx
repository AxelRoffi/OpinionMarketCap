'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useBuyShares } from '@/hooks/useBuyShares';
import { formatUSDC, formatShares, parseUSDCInput } from '@/lib/utils';
import { parseContractError, isUserRejection } from '@/lib/errors';
import type { Answer } from '@/lib/contracts';

interface BuySharesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answer: Answer;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = ['5', '10', '25', '50', '100'];

export function BuySharesModal({
  open,
  onOpenChange,
  answer,
  onSuccess,
}: BuySharesModalProps) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('10');
  const [slippage, setSlippage] = useState(1); // 1%

  const {
    buy,
    reset,
    status,
    error,
    isApproving,
    isBuying,
    isPending,
    isSuccess,
    balance,
    txHash,
  } = useBuyShares({
    onSuccess: () => {
      toast.success('Shares purchased successfully!', {
        description: `You bought shares in "${answer.text.slice(0, 30)}${answer.text.length > 30 ? '...' : ''}"`,
        action: txHash
          ? {
              label: 'View',
              onClick: () => window.open(`https://basescan.org/tx/${txHash}`, '_blank'),
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

  // Show toast when approving
  useEffect(() => {
    if (isApproving) {
      toast.loading('Approving USDC...', {
        id: 'approve-toast',
        description: 'Please confirm in your wallet',
      });
    } else {
      toast.dismiss('approve-toast');
    }
  }, [isApproving]);

  // Calculate estimated shares
  const usdcAmount = parseUSDCInput(amount);
  const currentPrice = answer.pricePerShare;
  const estimatedShares = currentPrice > 0n ? (usdcAmount * BigInt(1e6)) / currentPrice : 0n;

  // Calculate fees (2% total: 1.5% platform + 0.5% creator)
  const platformFee = (usdcAmount * 15n) / 1000n;
  const creatorFee = (usdcAmount * 5n) / 1000n;
  const totalFees = platformFee + creatorFee;
  const netAmount = usdcAmount - totalFees;

  // Calculate new price after purchase (simplified bonding curve)
  const newPoolValue = answer.poolValue + netAmount;
  const newTotalShares = answer.totalShares + estimatedShares;
  const newPrice = newTotalShares > 0n ? (newPoolValue * BigInt(1e6)) / newTotalShares : 0n;
  const priceImpact = currentPrice > 0n
    ? Number((newPrice - currentPrice) * 10000n / currentPrice) / 100
    : 0;

  const hasEnoughBalance = balance !== undefined && balance >= usdcAmount;

  const handleBuy = async () => {
    if (!amount || usdcAmount === 0n) return;

    // Calculate min shares with slippage
    const minShares = (estimatedShares * BigInt(100 - slippage)) / 100n;

    toast.loading('Buying shares...', {
      id: 'buy-toast',
      description: 'Please confirm in your wallet',
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Buy Shares
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {answer.text}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* How It Works - Collapsible Info */}
          <details className="group rounded-lg border border-border bg-muted/30">
            <summary className="flex cursor-pointer items-center justify-between p-3 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                How does buying shares work?
              </div>
              <span className="text-xs text-muted-foreground group-open:hidden">Click to learn</span>
            </summary>
            <div className="border-t border-border px-3 pb-3 pt-2 text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Shares = ownership in this answer.</strong> When you buy shares,
                you&apos;re betting this answer will gain popularity.
              </p>
              <p>
                <strong className="text-foreground">Price goes up</strong> when more people buy →
                your shares become worth more.
              </p>
              <p>
                <strong className="text-foreground">Sell anytime</strong> to cash out. If the price increased,
                you profit. If it dropped, you lose.
              </p>
            </div>
          </details>

          {/* Current Price */}
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 text-center">
            <div className="text-sm text-muted-foreground">Current Share Price</div>
            <div className="text-2xl font-bold text-primary">
              {formatUSDC(answer.pricePerShare)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Pool Size: {formatUSDC(answer.poolValue)} • {formatShares(answer.totalShares)} shares
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount (USDC)</Label>
              {balance !== undefined && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setAmount((Number(balance) / 1e6).toString())}
                  disabled={isPending}
                >
                  Max: {formatUSDC(balance)}
                </button>
              )}
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="text-lg"
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset)}
                  disabled={isPending}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Slippage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                Slippage Tolerance
                <Info className="h-3 w-3 text-muted-foreground" />
              </Label>
              <span className="text-sm font-medium">{slippage}%</span>
            </div>
            <Slider
              value={[slippage]}
              onValueChange={(v) => setSlippage(v[0])}
              min={0.5}
              max={5}
              step={0.5}
              disabled={isPending}
            />
          </div>

          {/* Summary */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You pay</span>
              <span className="font-medium">{formatUSDC(usdcAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Platform fee (1.5%)</span>
              <span className="text-muted-foreground">-{formatUSDC(platformFee)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Creator fee (0.5%)</span>
              <span className="text-muted-foreground">-{formatUSDC(creatorFee)}</span>
            </div>
            {priceImpact > 0.1 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Price impact</span>
                <span className={priceImpact > 5 ? 'text-orange-500' : 'text-muted-foreground'}>
                  +{priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2">
              <div className="flex justify-between font-medium">
                <span>Est. shares received</span>
                <span className="text-primary">
                  ~{(Number(estimatedShares) / 1e6).toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && !isUserRejection(error) && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{parseContractError(error)}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Shares purchased successfully!</span>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleBuy}
            disabled={!isConnected || isPending || !hasEnoughBalance || usdcAmount === 0n}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApproving ? 'Approving USDC...' : 'Buying Shares...'}
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !hasEnoughBalance ? (
              'Insufficient Balance'
            ) : usdcAmount === 0n ? (
              'Enter Amount'
            ) : (
              `Buy for ${formatUSDC(usdcAmount)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
