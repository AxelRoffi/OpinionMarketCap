'use client';

import { Users, User, Zap, Target, TrendingUp, TrendingDown, Coins, BarChart3 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceSparkline } from '@/components/charts';
import { formatUSDC, formatSharePrice, shortenAddress, formatShares } from '@/lib/utils';
import { usePriceHistory } from '@/hooks';
import type { Answer, UserPosition } from '@/lib/contracts';

interface AnswerCardProps {
  answer: Answer & { holderCount?: bigint };
  rank?: number;
  userPosition?: UserPosition;
  onBuy?: () => void;
  onSell?: () => void;
  isLeading?: boolean;
}

export function AnswerCard({
  answer,
  rank,
  userPosition,
  onBuy,
  onSell,
  isLeading,
}: AnswerCardProps) {
  const { isConnected } = useAccount();

  // Fetch price history for the sparkline
  const { priceHistory, priceChange, isPositive, tradeCount } = usePriceHistory(answer.id, answer.pricePerShare);

  // Only show position if wallet is connected AND has shares
  const hasPosition = isConnected && userPosition && userPosition.shares > 0n;
  const profitLoss = hasPosition ? userPosition.profitLoss : 0n;
  const isProfitable = profitLoss > 0n;
  const isLoss = profitLoss < 0n;

  // Rank emoji
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  return (
    <Card
      variant="glass"
      className={`transition-all ${
        isLeading
          ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5'
          : 'hover:border-emerald-500/20'
      } ${!answer.isActive ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-2.5">
        {/* Main Grid: Left Info | Right Chart */}
        <div className="flex gap-3">
          {/* LEFT SIDE: Answer Info + Stats */}
          <div className="flex-1 min-w-0">
            {/* Header: Rank + Answer Text + Badges */}
            <div className="flex items-start gap-2 mb-2">
              {/* Rank Badge */}
              {rank && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold">
                  {getRankEmoji(rank) || `#${rank}`}
                </div>
              )}

              {/* Answer Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {answer.text}
                  </h4>
                  {isLeading && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-1 py-0 shrink-0">
                      Leading
                    </Badge>
                  )}
                  {answer.isFlagged && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 shrink-0">
                      Flagged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <User className="h-2.5 w-2.5" />
                    {shortenAddress(answer.proposer)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid - 4 items inline */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <div className="bg-muted/30 rounded px-2 py-1">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Pool</div>
                <div className="text-xs font-bold text-emerald-400">{formatUSDC(answer.poolValue)}</div>
              </div>
              <div className="bg-muted/30 rounded px-2 py-1">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Price</div>
                <div className="text-xs font-semibold">{formatSharePrice(answer.pricePerShare)}</div>
              </div>
              <div className="bg-muted/30 rounded px-2 py-1">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wide flex items-center gap-0.5">
                  <Coins className="h-2 w-2" />
                  Shares
                </div>
                <div className="text-xs font-semibold">{formatShares(answer.totalShares)}</div>
              </div>
              <div className="bg-muted/30 rounded px-2 py-1">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wide flex items-center gap-0.5">
                  <Users className="h-2 w-2" />
                  Holders
                </div>
                <div className="text-xs font-semibold">{Number(answer.holderCount || 0)}</div>
              </div>
            </div>

            {/* Actions */}
            {answer.isActive && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={onBuy}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 px-3 text-xs rounded flex-1"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Buy
                </Button>
                {hasPosition && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onSell}
                    className="h-7 px-3 text-xs rounded border-border/50"
                  >
                    Sell
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Chart with Axes */}
          <div className="w-[160px] shrink-0 flex flex-col">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <BarChart3 className="h-2.5 w-2.5" />
                Price
              </span>
              {/* Price Change Badge */}
              <div className={`flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0 rounded ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-2 w-2" />
                ) : (
                  <TrendingDown className="h-2 w-2" />
                )}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </div>
            </div>

            {/* Chart with Axes */}
            <div className="flex-1 min-h-[70px]">
              <PriceSparkline
                data={priceHistory}
                isPositive={isPositive}
                height={70}
                width={160}
                showAxes={true}
                showGradient={true}
                compact={false}
              />
            </div>

            {/* Trade count */}
            <div className="text-[8px] text-muted-foreground text-center">
              {tradeCount} trade{tradeCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Bottom Row: Position info OR Connect wallet CTA */}
        {hasPosition && userPosition ? (
          <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Target className="h-3 w-3 text-emerald-400" />
              <span className="font-medium">Your Position</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span>
                <span className="text-muted-foreground">Shares:</span>{' '}
                <span className="font-semibold">{formatShares(userPosition.shares)}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Value:</span>{' '}
                <span className="font-semibold">{formatUSDC(userPosition.currentValue)}</span>
              </span>
              <span className={`font-bold ${isProfitable ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-muted-foreground'}`}>
                {isProfitable ? '+' : ''}{formatUSDC(profitLoss)} P&L
              </span>
            </div>
          </div>
        ) : !isConnected ? (
          <div className="mt-2 pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground text-center">
              Connect wallet to trade this answer
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// Skeleton loader for AnswerCard
export function AnswerCardSkeleton() {
  return (
    <Card variant="glass">
      <CardContent className="p-2.5">
        <div className="flex gap-3">
          {/* Left side skeleton */}
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-28 rounded animate-shimmer" />
                <div className="h-2.5 w-20 rounded animate-shimmer delay-75" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted/30 rounded px-2 py-1">
                  <div className="h-2 w-6 rounded animate-shimmer mb-0.5" />
                  <div className="h-3 w-10 rounded animate-shimmer" />
                </div>
              ))}
            </div>
            <div className="h-7 w-full rounded animate-shimmer" />
          </div>
          {/* Right side skeleton */}
          <div className="w-[160px]">
            <div className="h-2.5 w-16 rounded animate-shimmer mb-1" />
            <div className="h-[70px] w-full rounded-lg animate-shimmer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
