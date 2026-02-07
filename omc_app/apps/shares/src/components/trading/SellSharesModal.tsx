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
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSellShares } from '@/hooks/useSellShares';
import { formatUSDC, formatShares } from '@/lib/utils';
import type { Answer, UserPosition } from '@/lib/contracts';

interface SellSharesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answer: Answer;
  position: UserPosition;
  onSuccess?: () => void;
}

const PRESET_PERCENTAGES = [25, 50, 75, 100];

export function SellSharesModal({
  open,
  onOpenChange,
  answer,
  position,
  onSuccess,
}: SellSharesModalProps) {
  const { isConnected } = useAccount();
  const [percentage, setPercentage] = useState(100);
  const [slippage, setSlippage] = useState(1); // 1%

  const {
    sell,
    reset,
    status,
    error,
    isSelling,
    isPending,
    isSuccess,
  } = useSellShares({
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
      setPercentage(100);
      reset();
    }
  }, [open, reset]);

  // Calculate shares to sell
  const sharesToSell = (position.shares * BigInt(percentage)) / 100n;

  // Calculate estimated return
  const estimatedReturn = (sharesToSell * answer.pricePerShare) / BigInt(1e6);

  // Calculate fees (2% total)
  const feeAmount = (estimatedReturn * 2n) / 100n;
  const netReturn = estimatedReturn - feeAmount;

  // Calculate P&L for this sale
  const costBasisForSale = (position.costBasis * BigInt(percentage)) / 100n;
  const profitLoss = netReturn - costBasisForSale;
  const isProfitable = profitLoss > 0n;

  const handleSell = async () => {
    if (sharesToSell === 0n) return;

    // Calculate min USDC with slippage
    const minUsdcOut = (netReturn * BigInt(100 - slippage)) / 100n;

    await sell(answer.id, sharesToSell, minUsdcOut);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Shares</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {answer.text}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Position */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Position</span>
              <span className="font-medium">{formatShares(position.shares)} shares</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Current Value</span>
              <span className="font-medium text-primary">
                {formatUSDC(position.currentValue)}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Cost Basis</span>
              <span>{formatUSDC(position.costBasis)}</span>
            </div>
          </div>

          {/* Amount to Sell */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Amount to Sell</Label>
              <span className="text-lg font-bold text-primary">{percentage}%</span>
            </div>
            <Slider
              value={[percentage]}
              onValueChange={(v) => setPercentage(v[0])}
              min={1}
              max={100}
              step={1}
              disabled={isPending}
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_PERCENTAGES.map((preset) => (
                <Button
                  key={preset}
                  variant={percentage === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPercentage(preset)}
                  disabled={isPending}
                >
                  {preset}%
                </Button>
              ))}
            </div>
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
              <span className="text-muted-foreground">Shares to sell</span>
              <span className="font-medium">{formatShares(sharesToSell)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross return</span>
              <span>{formatUSDC(estimatedReturn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fees (2%)</span>
              <span>-{formatUSDC(feeAmount)}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between font-medium">
                <span>You receive</span>
                <span className="text-primary">{formatUSDC(netReturn)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-muted-foreground">P&L on this sale</span>
                <span className={isProfitable ? 'text-green-500' : profitLoss < 0n ? 'text-red-500' : ''}>
                  {isProfitable ? '+' : ''}{formatUSDC(profitLoss)}
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
              <span>Shares sold successfully!</span>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            variant={isProfitable ? 'default' : 'outline'}
            onClick={handleSell}
            disabled={!isConnected || isPending || sharesToSell === 0n}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Selling...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              `Sell for ${formatUSDC(netReturn)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
