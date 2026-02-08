'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Info,
  Coins,
} from 'lucide-react';
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
import { parseContractError, isUserRejection } from '@/lib/errors';
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
    txHash,
  } = useSellShares({
    onSuccess: () => {
      toast.success('Shares sold successfully!', {
        description: `Sold ${percentage}% of your position in "${answer.text.slice(0, 30)}${answer.text.length > 30 ? '...' : ''}"`,
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
      setPercentage(100);
      reset();
    }
  }, [open, reset]);

  // Calculate shares to sell
  const sharesToSell = (position.shares * BigInt(percentage)) / 100n;

  // Calculate estimated return
  const estimatedReturn = (sharesToSell * answer.pricePerShare) / BigInt(1e6);

  // Calculate fees (2% total)
  const platformFee = (estimatedReturn * 15n) / 1000n;
  const creatorFee = (estimatedReturn * 5n) / 1000n;
  const totalFees = platformFee + creatorFee;
  const netReturn = estimatedReturn - totalFees;

  // Calculate P&L for this sale
  const costBasisForSale = (position.costBasis * BigInt(percentage)) / 100n;
  const profitLoss = netReturn - costBasisForSale;
  const isProfitable = profitLoss > 0n;

  // Calculate price impact (simplified)
  const newPoolValue = answer.poolValue - netReturn;
  const newTotalShares = answer.totalShares - sharesToSell;
  const newPrice = newTotalShares > 0n ? (newPoolValue * BigInt(1e6)) / newTotalShares : 0n;
  const currentPrice = answer.pricePerShare;
  const priceImpact = currentPrice > 0n
    ? Number((currentPrice - newPrice) * 10000n / currentPrice) / 100
    : 0;

  const handleSell = async () => {
    if (sharesToSell === 0n) return;

    // Calculate min USDC with slippage
    const minUsdcOut = (netReturn * BigInt(100 - slippage)) / 100n;

    toast.loading('Selling shares...', {
      id: 'sell-toast',
      description: 'Please confirm in your wallet',
    });

    try {
      await sell(answer.id, sharesToSell, minUsdcOut);
      toast.dismiss('sell-toast');
    } catch {
      toast.dismiss('sell-toast');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Sell Shares
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {answer.text}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Current Position */}
          <div className="rounded-lg bg-gradient-to-r from-muted/80 to-muted/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Info className="h-3 w-3" />
              Your Current Position
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Shares Owned</div>
                <div className="text-lg font-semibold">{formatShares(position.shares)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Value</div>
                <div className="text-lg font-semibold text-primary">
                  {formatUSDC(position.currentValue)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cost Basis</div>
                <div className="text-sm">{formatUSDC(position.costBasis)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total P&L</div>
                <div
                  className={`text-sm font-medium ${
                    position.profitLoss > 0n
                      ? 'text-green-500'
                      : position.profitLoss < 0n
                      ? 'text-red-500'
                      : ''
                  }`}
                >
                  {position.profitLoss > 0n ? '+' : ''}
                  {formatUSDC(position.profitLoss)}
                </div>
              </div>
            </div>
          </div>

          {/* Amount to Sell */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Amount to Sell</Label>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{percentage}%</span>
                <div className="text-xs text-muted-foreground">
                  {formatShares(sharesToSell)} shares
                </div>
              </div>
            </div>
            <Slider
              value={[percentage]}
              onValueChange={(v) => setPercentage(v[0])}
              min={1}
              max={100}
              step={1}
              disabled={isPending}
              className="py-2"
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
              <span className="text-muted-foreground">Shares to sell</span>
              <span className="font-medium">{formatShares(sharesToSell)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross return</span>
              <span>{formatUSDC(estimatedReturn)}</span>
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
                  -{priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2">
              <div className="flex justify-between font-medium">
                <span>You receive</span>
                <span className="text-primary">{formatUSDC(netReturn)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-muted-foreground">P&L on this sale</span>
                <span
                  className={`font-medium ${
                    isProfitable ? 'text-green-500' : profitLoss < 0n ? 'text-red-500' : ''
                  }`}
                >
                  {isProfitable ? '+' : ''}
                  {formatUSDC(profitLoss)}
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
            ) : sharesToSell === 0n ? (
              'Select Amount'
            ) : (
              <>
                <TrendingDown className="mr-2 h-4 w-4" />
                Sell for {formatUSDC(netReturn)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
