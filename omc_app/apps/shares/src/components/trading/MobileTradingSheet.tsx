'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useBuyShares, useSellShares, useChainSwitch, useConfetti } from '@/hooks';
import { formatUSDC, formatShares, parseUSDCInput } from '@/lib/utils';
import { parseContractError, isUserRejection } from '@/lib/errors';
import { SHARES_DECIMALS, type Answer, type UserPosition } from '@/lib/contracts';

type TradingMode = 'buy' | 'sell';

interface MobileTradingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answer: Answer;
  mode: TradingMode;
  position?: UserPosition;
  onSuccess?: () => void;
}

const PRESET_BUY_AMOUNTS = ['5', '10', '25', '50'];
const MIN_SHARES_RESERVE = BigInt(1 * SHARES_DECIMALS);
const MIN_POOL_RESERVE = 1_000_000n;

export function MobileTradingSheet({
  open,
  onOpenChange,
  answer,
  mode,
  position,
  onSuccess,
}: MobileTradingSheetProps) {
  const { isConnected } = useAccount();
  const { isCorrectChain, switchToTargetChain, isSwitching, targetChainName } = useChainSwitch();
  const { triggerBuySuccess, triggerSellSuccess } = useConfetti();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Buy state
  const [buyAmount, setBuyAmount] = useState('10');

  // Sell state - calculate max sellable first
  const { maxSellableShares, maxPercentage, limitReason } = useMemo(() => {
    if (!position || mode !== 'sell') {
      return { maxSellableShares: 0n, maxPercentage: 100, limitReason: '' };
    }

    const sharesLimit = answer.totalShares - MIN_SHARES_RESERVE;
    const poolBasedLimit = answer.poolValue > MIN_POOL_RESERVE
      ? ((answer.poolValue - MIN_POOL_RESERVE) * answer.totalShares) / answer.poolValue
      : 0n;

    const maxFromPool = sharesLimit < poolBasedLimit ? sharesLimit : poolBasedLimit;
    const maxSellable = position.shares < maxFromPool ? position.shares : maxFromPool;
    const maxPct = position.shares > 0n
      ? Number((maxSellable * 100n) / position.shares)
      : 0;

    let reason = '';
    if (maxSellable < position.shares) {
      reason = sharesLimit <= poolBasedLimit
        ? 'Pool must keep at least 1 share'
        : 'Pool must keep at least $1';
    }

    return {
      maxSellableShares: maxSellable,
      maxPercentage: Math.min(100, Math.max(0, maxPct)),
      limitReason: reason,
    };
  }, [answer.totalShares, answer.poolValue, position?.shares, mode]);

  const [sellPercentage, setSellPercentage] = useState(() => Math.min(100, maxPercentage));

  // Buy hook
  const buyHook = useBuyShares({
    onSuccess: () => {
      setShowSuccessAnimation(true);
      triggerBuySuccess();
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        buyHook.reset();
        setShowSuccessAnimation(false);
      }, 2500);
    },
    onError: (err) => {
      if (!isUserRejection(err)) {
        toast.error(parseContractError(err));
      }
    },
  });

  // Sell hook
  const sellHook = useSellShares({
    onSuccess: () => {
      setShowSuccessAnimation(true);
      triggerSellSuccess();
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        sellHook.reset();
        setShowSuccessAnimation(false);
      }, 2500);
    },
    onError: (err) => {
      if (!isUserRejection(err)) {
        toast.error(parseContractError(err));
      }
    },
  });

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setBuyAmount('10');
      setSellPercentage(Math.min(100, maxPercentage));
      buyHook.reset();
      sellHook.reset();
    }
  }, [open, maxPercentage]);

  // Price calculation (same for buy/sell display)
  const pricePerShare = answer.totalShares > 0n
    ? (Number(answer.poolValue) * SHARES_DECIMALS) / Number(answer.totalShares) / 1e6
    : 1.0;

  // Buy calculations
  const usdcAmount = parseUSDCInput(buyAmount);
  const grossAmount = Number(usdcAmount) / 1e6;
  const buyFees = grossAmount * 0.02;
  const netAmount = grossAmount - buyFees;
  const estimatedShares = pricePerShare > 0 ? netAmount / pricePerShare : 0;
  const hasEnoughBalance = buyHook.balance !== undefined && buyHook.balance >= usdcAmount;

  // Sell calculations
  const sharesToSell = position
    ? (Number(position.shares) / SHARES_DECIMALS) * sellPercentage / 100
    : 0;
  const sharesToSellBigInt = position
    ? (position.shares * BigInt(sellPercentage)) / 100n
    : 0n;
  const grossReturn = position
    ? (position.currentValue * BigInt(sellPercentage)) / 100n
    : 0n;
  const sellFees = (grossReturn * 2n) / 100n;
  const netReturn = grossReturn - sellFees;

  // Handle buy
  const handleBuy = async () => {
    if (!buyAmount || usdcAmount === 0n) return;
    const minShares = BigInt(Math.floor(estimatedShares * 0.97 * SHARES_DECIMALS));

    toast.loading('Buying shares...', { id: 'trade-toast' });
    try {
      await buyHook.buy(answer.id, buyAmount, minShares);
      toast.dismiss('trade-toast');
    } catch {
      toast.dismiss('trade-toast');
    }
  };

  // Handle sell
  const handleSell = async () => {
    if (sharesToSellBigInt === 0n) return;
    const minUsdcOut = (netReturn * 98n) / 100n;

    toast.loading('Selling shares...', { id: 'trade-toast' });
    try {
      await sellHook.sell(answer.id, sharesToSellBigInt, minUsdcOut);
      toast.dismiss('trade-toast');
    } catch {
      toast.dismiss('trade-toast');
    }
  };

  // Swipe to dismiss
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  const isPending = mode === 'buy' ? buyHook.isPending : sellHook.isPending;
  const isSuccess = mode === 'buy' ? buyHook.isSuccess : sellHook.isSuccess;
  const error = mode === 'buy' ? buyHook.error : sellHook.error;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl border-t border-border/50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                {mode === 'buy' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <h2 className="text-lg font-semibold">
                  {mode === 'buy' ? 'Buy' : 'Sell'} Shares
                </h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto pb-safe" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Answer Info */}
              <div className="p-4 rounded-2xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Answer</p>
                <p className="font-semibold text-base">{answer.text}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-bold text-emerald-500">${pricePerShare.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pool: </span>
                    <span className="font-semibold">{formatUSDC(answer.poolValue)}</span>
                  </div>
                </div>
              </div>

              {/* Buy Mode */}
              {mode === 'buy' && (
                <>
                  {/* Amount Input */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amount (USDC)</span>
                      {buyHook.balance !== undefined && (
                        <button
                          type="button"
                          className="text-xs text-emerald-500 font-medium"
                          onClick={() => setBuyAmount((Number(buyHook.balance) / 1e6).toFixed(2))}
                          disabled={isPending}
                        >
                          Balance: {formatUSDC(buyHook.balance)}
                        </button>
                      )}
                    </div>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      disabled={isPending}
                      className="text-2xl h-16 text-center font-bold"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_BUY_AMOUNTS.map((preset) => (
                        <Button
                          key={preset}
                          variant={buyAmount === preset ? 'default' : 'outline'}
                          size="lg"
                          className="h-12 text-base font-semibold"
                          onClick={() => setBuyAmount(preset)}
                          disabled={isPending}
                        >
                          ${preset}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You Pay</span>
                      <span className="font-semibold">${grossAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Fees (2%)</span>
                      <span>-${buyFees.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-emerald-500/20 pt-3 flex justify-between items-center">
                      <span className="font-semibold">You Get</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-500">
                          ~{estimatedShares.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">shares</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Sell Mode */}
              {mode === 'sell' && position && (
                <>
                  {/* Position Info */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Your Position</p>
                      <p className="text-lg font-bold">{formatShares(position.shares)} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Worth</p>
                      <p className="text-lg font-bold text-emerald-500">{formatUSDC(position.currentValue)}</p>
                    </div>
                  </div>

                  {/* Percentage Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sell Amount</span>
                      <span className="text-2xl font-bold text-red-500">{sellPercentage}%</span>
                    </div>

                    <Slider
                      value={[sellPercentage]}
                      onValueChange={(v) => setSellPercentage(Math.min(v[0], maxPercentage))}
                      min={1}
                      max={maxPercentage > 0 ? maxPercentage : 100}
                      step={1}
                      disabled={isPending || maxPercentage === 0}
                      className="py-4"
                    />

                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((preset) => {
                        const effectivePreset = Math.min(preset, maxPercentage);
                        const isDisabled = isPending || preset > maxPercentage;
                        return (
                          <Button
                            key={preset}
                            variant={sellPercentage === effectivePreset && !isDisabled ? 'default' : 'outline'}
                            size="lg"
                            className="h-12 text-base font-semibold"
                            onClick={() => setSellPercentage(effectivePreset)}
                            disabled={isDisabled}
                          >
                            {preset === 100 && maxPercentage < 100 ? `${maxPercentage}%` : `${preset}%`}
                          </Button>
                        );
                      })}
                    </div>

                    {limitReason && (
                      <p className="text-xs text-amber-500 text-center">
                        Max {maxPercentage}% sellable. {limitReason}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selling</span>
                      <span className="font-semibold">{sharesToSell.toFixed(2)} shares</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Fees (2%)</span>
                      <span>-{formatUSDC(sellFees)}</span>
                    </div>
                    <div className="border-t border-red-500/20 pt-3 flex justify-between items-center">
                      <span className="font-semibold">You Receive</span>
                      <span className="text-2xl font-bold text-red-500">{formatUSDC(netReturn)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Error */}
              {error && !isUserRejection(error) && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseContractError(error)}</span>
                </div>
              )}

              {/* Success */}
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-8 text-center"
                >
                  {/* Animated success icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
                    className="relative mx-auto w-20 h-20 mb-4"
                  >
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      {mode === 'buy' ? (
                        <PartyPopper className="w-10 h-10 text-white" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      )}
                    </div>
                    {/* Floating sparkles */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: [0, 1, 0], y: -20 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: [0, 1, 0], y: -15 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-1 -left-3"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                    </motion.div>
                  </motion.div>

                  {/* Success text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {mode === 'buy' ? 'Shares Purchased!' : 'Shares Sold!'}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {mode === 'buy'
                        ? `You now own shares in "${answer.text.substring(0, 30)}${answer.text.length > 30 ? '...' : ''}"`
                        : 'USDC has been sent to your wallet'}
                    </p>
                    <motion.p
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.3 }}
                      className={`text-xl font-bold ${mode === 'buy' ? 'text-emerald-500' : 'text-blue-500'}`}
                    >
                      {mode === 'buy'
                        ? `+${estimatedShares.toFixed(2)} shares`
                        : formatUSDC(netReturn)}
                    </motion.p>
                  </motion.div>

                  {/* Auto-close indicator */}
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 2.5, ease: 'linear' }}
                    className="h-1 bg-emerald-500/50 rounded-full mt-6 mx-auto max-w-[200px]"
                  />
                </motion.div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {isConnected && !isCorrectChain ? (
                  <Button
                    className="w-full h-14 text-lg font-semibold rounded-2xl"
                    onClick={switchToTargetChain}
                    disabled={isSwitching}
                  >
                    {isSwitching ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      `Switch to ${targetChainName}`
                    )}
                  </Button>
                ) : mode === 'buy' ? (
                  <Button
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-emerald-500 hover:bg-emerald-600"
                    onClick={handleBuy}
                    disabled={!isConnected || isPending || !hasEnoughBalance || usdcAmount === 0n || isSuccess}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {buyHook.isApproving ? 'Approving...' : 'Buying...'}
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Purchased!
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet'
                    ) : !hasEnoughBalance ? (
                      'Insufficient USDC'
                    ) : usdcAmount === 0n ? (
                      'Enter Amount'
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Buy ~{estimatedShares.toFixed(1)} Shares
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full h-14 text-lg font-semibold rounded-2xl"
                    variant="destructive"
                    onClick={handleSell}
                    disabled={!isConnected || isPending || sharesToSellBigInt === 0n || isSuccess || sharesToSellBigInt > maxSellableShares}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Selling...
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Sold!
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet'
                    ) : maxPercentage === 0 ? (
                      'Cannot Sell (Pool Reserve)'
                    ) : (
                      <>
                        <TrendingDown className="mr-2 h-5 w-5" />
                        Sell for {formatUSDC(netReturn)}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
