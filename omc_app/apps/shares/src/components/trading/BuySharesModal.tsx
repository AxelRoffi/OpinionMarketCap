'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { formatUSDC, parseUSDCInput } from '@/lib/utils';
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
  } = useBuyShares({
    onSuccess: () => {
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 2000);
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAmount('10');
      reset();
    }
  }, [open, reset]);

  // Calculate estimated shares
  const usdcAmount = parseUSDCInput(amount);
  const currentPrice = answer.pricePerShare;
  const estimatedShares = currentPrice > 0n ? (usdcAmount * BigInt(1e6)) / currentPrice : 0n;

  // Calculate fees (2% total: 1.5% platform + 0.5% creator)
  const feeAmount = (usdcAmount * 2n) / 100n;
  const netAmount = usdcAmount - feeAmount;

  const hasEnoughBalance = balance !== undefined && balance >= usdcAmount;

  const handleBuy = async () => {
    if (!amount || usdcAmount === 0n) return;

    // Calculate min shares with slippage
    const minShares = (estimatedShares * BigInt(100 - slippage)) / 100n;

    await buy(answer.id, amount, minShares);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Shares</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {answer.text}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Price */}
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <div className="text-sm text-muted-foreground">Current Share Price</div>
            <div className="text-2xl font-bold text-primary">
              {formatUSDC(answer.pricePerShare)}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
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
            {balance !== undefined && (
              <div className="text-xs text-muted-foreground">
                Balance: {formatUSDC(balance)} USDC
              </div>
            )}
          </div>

          {/* Slippage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Slippage Tolerance</Label>
              <span className="text-sm text-muted-foreground">{slippage}%</span>
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
          <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You pay</span>
              <span className="font-medium">{formatUSDC(usdcAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform fee (1.5%)</span>
              <span>{formatUSDC((usdcAmount * 15n) / 1000n)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creator fee (0.5%)</span>
              <span>{formatUSDC((usdcAmount * 5n) / 1000n)}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between font-medium">
                <span>Est. shares received</span>
                <span className="text-primary">
                  ~{(Number(estimatedShares) / 1e6).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error.message}</span>
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
                {isApproving ? 'Approving...' : 'Buying...'}
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !hasEnoughBalance ? (
              'Insufficient Balance'
            ) : (
              `Buy for ${formatUSDC(usdcAmount)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
