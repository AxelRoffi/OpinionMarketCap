'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Zap, ChevronDown, Loader2, AlertCircle, TrendingUp, DollarSign, Coins, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuyShares, useChainSwitch } from '@/hooks';
import { formatUSDC, formatSharePrice } from '@/lib/utils';
import { SHARES_DECIMALS, type Answer } from '@/lib/contracts';

interface InlineTradingPanelProps {
  answers: Answer[];
  onSuccess?: () => void;
}

export function InlineTradingPanel({ answers, onSuccess }: InlineTradingPanelProps) {
  const { isConnected } = useAccount();
  const { isCorrectChain, switchToTargetChain, isSwitching, targetChainName } = useChainSwitch();

  // Selected answer (default to leading/first answer)
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // USDC amount input (string for user-friendly input)
  const [usdcInput, setUsdcInput] = useState('5');

  // Set default selected answer when answers load
  useEffect(() => {
    if (answers.length > 0 && !selectedAnswerId) {
      setSelectedAnswerId(answers[0].id.toString());
    }
  }, [answers, selectedAnswerId]);

  const selectedAnswer = useMemo(() => {
    return answers.find((a) => a.id.toString() === selectedAnswerId);
  }, [answers, selectedAnswerId]);

  // Parse USDC input to bigint (1e6 format)
  const usdcAmount = useMemo(() => {
    const parsed = parseFloat(usdcInput) || 0;
    return BigInt(Math.floor(parsed * 1e6));
  }, [usdcInput]);

  // Calculate estimated shares from USDC amount (with decimal precision)
  // Returns a floating point number for display
  const estimatedSharesDecimal = useMemo(() => {
    if (!selectedAnswer) return 0;
    const usdcValue = parseFloat(usdcInput) || 0;
    if (usdcValue <= 0) return 0;

    // 2% total fee (1.5% platform + 0.5% creator)
    const effectiveUsdc = usdcValue * 0.98;

    // pricePerShare is in 1e12 format, so $1.00 = 1e12
    const priceInDollars = Number(selectedAnswer.pricePerShare) / 1e12;
    if (priceInDollars <= 0) return 0;

    // shares = effectiveUsdc / pricePerShare
    return effectiveUsdc / priceInDollars;
  }, [selectedAnswer, usdcInput]);

  // BigInt version for the actual transaction (with 2 decimal places: shares * 100)
  // Contract uses SHARES_DECIMALS = 100, so 4.90 shares = 490 in contract
  const estimatedSharesBigInt = useMemo(() => {
    return BigInt(Math.floor(estimatedSharesDecimal * SHARES_DECIMALS));
  }, [estimatedSharesDecimal]);

  const {
    buy,
    isPending,
    isApproving,
    error,
    reset,
  } = useBuyShares({
    onSuccess: () => {
      setUsdcInput('5');
      onSuccess?.();
    },
  });

  const handleBuy = async () => {
    if (!selectedAnswer || estimatedSharesBigInt <= 0n) return;
    // Add 5% buffer for price movement (buy hook expects string like "5.25")
    const usdcValue = parseFloat(usdcInput) || 0;
    const usdcWithBuffer = (usdcValue * 1.05).toFixed(6);
    await buy(selectedAnswer.id, usdcWithBuffer, estimatedSharesBigInt);
  };

  // Quick amount buttons
  const setQuickAmount = (amount: string) => setUsdcInput(amount);

  if (answers.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">No answers to trade yet.</p>
        <p className="text-xs mt-1">Propose the first answer!</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Zap className="h-4 w-4 text-emerald-400" />
        Quick Trade
      </h3>

      {/* Answer Selector - Compact */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border hover:border-emerald-500/50 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            {selectedAnswer ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{selectedAnswer.text}</span>
                <span className="text-xs text-emerald-400">{formatSharePrice(selectedAnswer.pricePerShare)}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Select answer...</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-auto">
            {answers.map((answer, index) => (
              <button
                key={answer.id.toString()}
                type="button"
                onClick={() => {
                  setSelectedAnswerId(answer.id.toString());
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50 transition-colors text-sm ${
                  answer.id.toString() === selectedAnswerId ? 'bg-emerald-500/10' : ''
                } ${index !== answers.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <span className="w-5 text-center text-xs">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className="flex-1 truncate">{answer.text}</span>
                <span className="text-xs text-muted-foreground">{formatSharePrice(answer.pricePerShare)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* USDC Amount Input */}
      <div className="space-y-2">
        {/* Amount Input */}
        <div className="relative">
          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="number"
            value={usdcInput}
            onChange={(e) => setUsdcInput(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="1"
            disabled={isPending}
            className="w-full pl-8 pr-3 py-2 text-lg font-bold bg-muted/50 border border-border rounded-lg focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDC</span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-1">
          {['5', '10', '25', '50'].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setQuickAmount(amount)}
              disabled={isPending}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                usdcInput === amount
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-muted/30 border-border hover:border-emerald-500/30'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Estimated Shares Output */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            <span>You'll receive</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-400">
              {estimatedSharesDecimal.toFixed(2)} shares
            </div>
            <div className="text-[10px] text-muted-foreground">
              @ {selectedAnswer ? formatSharePrice(selectedAnswer.pricePerShare) : '--'}/share (2% fee incl.)
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded p-1.5">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{error.message}</span>
        </div>
      )}

      {/* Buy Button */}
      {!isConnected ? (
        <Button className="w-full h-9 text-sm" variant="outline" disabled>
          Connect Wallet to Trade
        </Button>
      ) : !isCorrectChain ? (
        <Button className="w-full h-9 text-sm" onClick={switchToTargetChain} disabled={isSwitching}>
          {isSwitching ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Switching...</> : `Switch to ${targetChainName}`}
        </Button>
      ) : (
        <Button
          className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm"
          onClick={handleBuy}
          disabled={isPending || !selectedAnswer || estimatedSharesBigInt <= 0n}
        >
          {isPending ? (
            <><Loader2 className="mr-1 h-3 w-3 animate-spin" />{isApproving ? 'Approving...' : 'Buying...'}</>
          ) : (
            <><TrendingUp className="mr-1 h-3 w-3" />Buy ~{estimatedSharesDecimal.toFixed(2)} shares for {formatUSDC(usdcAmount)}</>
          )}
        </Button>
      )}

      {/* How it Works - Collapsible */}
      <details className="group">
        <summary className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <HelpCircle className="h-3 w-3" />
          How it works
        </summary>
        <div className="mt-2 p-2 bg-muted/20 rounded-lg space-y-1.5 text-[10px] text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">1.</span>
            <span><strong>Buy shares</strong> in the answer you believe will lead</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">2.</span>
            <span><strong>Price rises</strong> as more people buy (bonding curve)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">3.</span>
            <span><strong>Sell anytime</strong> to lock in profits or cut losses</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">4.</span>
            <span><strong>Leading answer</strong> = highest pool value (market cap)</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-border/30 text-[9px]">
            <span className="text-muted-foreground">Fee: 2% (1.5% platform + 0.5% creator)</span>
          </div>
        </div>
      </details>
    </div>
  );
}
