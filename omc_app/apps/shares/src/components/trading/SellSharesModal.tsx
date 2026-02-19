'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Coins,
  Info,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSellShares, useChainSwitch, useConfetti } from '@/hooks';
import { formatUSDC, formatShares } from '@/lib/utils';
import { parseContractError, isUserRejection } from '@/lib/errors';
import { SHARES_DECIMALS, type Answer, type UserPosition } from '@/lib/contracts';

interface SellSharesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answer: Answer;
  position: UserPosition;
  onSuccess?: () => void;
}

// Contract constants
// With 2 decimal places: 1.00 share = 100 internal units
const MIN_SHARES_RESERVE = BigInt(1 * SHARES_DECIMALS); // 1.00 share in contract units
const MIN_POOL_RESERVE = 1_000_000n; // $1 USDC

export function SellSharesModal({
  open,
  onOpenChange,
  answer,
  position,
  onSuccess,
}: SellSharesModalProps) {
  const { isConnected } = useAccount();
  const { isCorrectChain, switchToTargetChain, isSwitching, targetChainName } = useChainSwitch();
  const { triggerSellSuccess } = useConfetti();

  // Calculate max sellable shares (must leave MIN_SHARES_RESERVE in pool)
  const { maxSellableShares, maxPercentage, limitReason } = useMemo(() => {
    // How many shares can be sold while keeping MIN_SHARES_RESERVE in the pool?
    const sharesLimit = answer.totalShares - MIN_SHARES_RESERVE;

    // How many shares can be sold while keeping MIN_POOL_RESERVE in the pool?
    // grossReturn = (shareAmount * poolValue) / totalShares
    // We need: poolValue - grossReturn >= MIN_POOL_RESERVE
    // poolValue - (shareAmount * poolValue / totalShares) >= MIN_POOL_RESERVE
    // shareAmount <= (poolValue - MIN_POOL_RESERVE) * totalShares / poolValue
    const poolBasedLimit = answer.poolValue > MIN_POOL_RESERVE
      ? ((answer.poolValue - MIN_POOL_RESERVE) * answer.totalShares) / answer.poolValue
      : 0n;

    // Take the more restrictive limit
    const maxFromPool = sharesLimit < poolBasedLimit ? sharesLimit : poolBasedLimit;

    // User can only sell up to their own shares, capped by pool limit
    const maxSellable = position.shares < maxFromPool ? position.shares : maxFromPool;

    // Calculate percentage (avoid division by zero)
    const maxPct = position.shares > 0n
      ? Number((maxSellable * 100n) / position.shares)
      : 0;

    // Determine the reason for limit
    let reason = '';
    if (maxSellable < position.shares) {
      if (sharesLimit <= poolBasedLimit) {
        reason = 'Pool must keep at least 1 share';
      } else {
        reason = 'Pool must keep at least $1';
      }
    }

    return {
      maxSellableShares: maxSellable,
      maxPercentage: Math.min(100, Math.max(0, maxPct)),
      limitReason: reason
    };
  }, [answer.totalShares, answer.poolValue, position.shares]);

  const [percentage, setPercentage] = useState(() => Math.min(100, maxPercentage));

  const {
    sell,
    reset,
    error,
    isPending,
    isSuccess,
    txHash,
  } = useSellShares({
    onSuccess: () => {
      triggerSellSuccess();
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 2500);
    },
    onError: (err) => {
      if (!isUserRejection(err)) {
        toast.error('Transaction failed', {
          description: parseContractError(err),
        });
      }
    },
  });

  // Reset state when modal opens - use max percentage
  useEffect(() => {
    if (open) {
      setPercentage(Math.min(100, maxPercentage));
      reset();
    }
  }, [open, reset, maxPercentage]);

  // Calculate shares to sell
  // sharesToSell is for display (human-readable, e.g., 5.00)
  // sharesToSellBigInt is for contract (internal units, e.g., 500)
  const sharesToSell = (Number(position.shares) / SHARES_DECIMALS) * percentage / 100;
  const sharesToSellBigInt = (position.shares * BigInt(percentage)) / 100n;

  // Use position.currentValue for reliable calculation
  // This already shows the correct USD value from the contract
  const grossReturn = (position.currentValue * BigInt(percentage)) / 100n;

  // Fees: 2% platform + 0.5% creator + 0.5% king = 3% total
  const totalFees = (grossReturn * 3n) / 100n;
  const netReturn = grossReturn - totalFees;

  // P&L calculation
  const costBasisForSale = (position.costBasis * BigInt(percentage)) / 100n;
  const profitLoss = netReturn - costBasisForSale;
  const isProfitable = profitLoss > 0n;

  // Price per share (for display)
  // position.shares is in contract units (e.g., 500 = 5.00 shares)
  const pricePerShare = position.shares > 0n
    ? (Number(position.currentValue) * SHARES_DECIMALS) / Number(position.shares) / 1e6
    : 0;

  const handleSell = async () => {
    if (sharesToSellBigInt === 0n) return;

    // Min USDC with 2% slippage built in
    const minUsdcOut = (netReturn * 98n) / 100n;

    // Debug logging
    console.log('[SellShares] Attempting sale:', {
      answerId: answer.id.toString(),
      sharesToSell: sharesToSellBigInt.toString(),
      minUsdcOut: minUsdcOut.toString(),
      maxSellable: maxSellableShares.toString(),
      percentage,
      maxPercentage,
      totalSharesInPool: answer.totalShares.toString(),
      poolValue: answer.poolValue.toString(),
      userShares: position.shares.toString(),
    });

    toast.loading('Selling shares...', {
      id: 'sell-toast',
      description: 'Please confirm in your wallet',
    });

    try {
      await sell(answer.id, sharesToSellBigInt, minUsdcOut);
      toast.dismiss('sell-toast');
    } catch (err) {
      console.error('[SellShares] Transaction failed:', err);
      toast.dismiss('sell-toast');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Coins className="h-4 w-4 text-primary" />
            Sell Shares: {answer.text}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Your Position - Compact */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div>
              <div className="text-xs text-muted-foreground">Your Position</div>
              <div className="font-semibold">{formatShares(position.shares)} shares</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Worth</div>
              <div className="font-semibold text-primary">{formatUSDC(position.currentValue)}</div>
            </div>
          </div>

          {/* Amount Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sell Amount</span>
              <span className="text-lg font-bold text-primary">{percentage}%</span>
            </div>

            <Slider
              value={[percentage]}
              onValueChange={(v) => setPercentage(Math.min(v[0], maxPercentage))}
              min={1}
              max={maxPercentage > 0 ? maxPercentage : 100}
              step={1}
              disabled={isPending || maxPercentage === 0}
            />

            <div className="flex gap-1">
              {[25, 50, 75, 100].map((preset) => {
                const effectivePreset = Math.min(preset, maxPercentage);
                const isDisabled = isPending || preset > maxPercentage;
                return (
                  <Button
                    key={preset}
                    variant={percentage === effectivePreset && !isDisabled ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => setPercentage(effectivePreset)}
                    disabled={isDisabled}
                  >
                    {preset === 100 && maxPercentage < 100 ? `${maxPercentage}%` : `${preset}%`}
                  </Button>
                );
              })}
            </div>

            {/* Warning when can't sell 100% */}
            {limitReason && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-md p-2">
                <Info className="h-3 w-3 shrink-0" />
                <span>Max {maxPercentage}% sellable. {limitReason}.</span>
              </div>
            )}
          </div>

          {/* Sale Summary - Clean & Clear */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selling</span>
              <span className="font-medium">{sharesToSell.toFixed(1)} shares @ ${pricePerShare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Value</span>
              <span>{formatUSDC(grossReturn)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fees (3%)</span>
              <span>-{formatUSDC(totalFees)}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between">
              <span className="font-semibold">You Receive</span>
              <span className="font-bold text-lg text-primary">{formatUSDC(netReturn)}</span>
            </div>
            {profitLoss !== 0n && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">P&L on this sale</span>
                <span className={`font-medium ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                  {isProfitable ? '+' : ''}{formatUSDC(profitLoss)}
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && !isUserRejection(error) && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{parseContractError(error)}</span>
            </div>
          )}

          {/* Success Message */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="py-6 text-center"
              >
                {/* Animated success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  className="relative mx-auto w-16 h-16 mb-3"
                >
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">Shares Sold!</h3>
                  <p className="text-blue-500 text-xl font-bold">{formatUSDC(netReturn)}</p>
                  <p className="text-xs text-muted-foreground mt-1">sent to your wallet</p>
                  {txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 inline-block"
                    >
                      View transaction
                    </a>
                  )}
                </motion.div>

                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 2.5, ease: 'linear' }}
                  className="h-0.5 bg-blue-500/50 rounded-full mt-4 mx-auto"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button - Always Visible */}
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
              variant={isProfitable ? 'default' : 'destructive'}
              onClick={handleSell}
              disabled={!isConnected || isPending || sharesToSellBigInt === 0n || isSuccess || sharesToSellBigInt > maxSellableShares}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Sold!
                </>
              ) : !isConnected ? (
                'Connect Wallet'
              ) : sharesToSellBigInt > maxSellableShares ? (
                'Exceeds Max Sellable'
              ) : maxPercentage === 0 ? (
                'Cannot Sell (Pool Reserve)'
              ) : (
                <>
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Sell for {formatUSDC(netReturn)}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
