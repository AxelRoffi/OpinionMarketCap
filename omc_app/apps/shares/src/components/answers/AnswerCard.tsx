'use client';

import { Users, User, Zap, Target, TrendingUp, TrendingDown, Coins, GraduationCap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  // Fetch price history for the % change
  const { priceChange, isPositive } = usePriceHistory(answer.id, answer.pricePerShare);

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
      className={`transition-all h-full ${
        isLeading
          ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5'
          : 'hover:border-emerald-500/20'
      } ${!answer.isActive ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-2.5 flex flex-col h-full">
        {/* Header: Rank + Answer Text + % Change */}
        <div className="flex items-start gap-2 mb-2">
          {/* Rank Badge */}
          {rank && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold">
              {getRankEmoji(rank) || `#${rank}`}
            </div>
          )}

          {/* Answer Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold text-foreground line-clamp-2">
                {answer.text}
              </h4>
              {isLeading && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[8px] px-1 py-0 shrink-0">
                  Leading
                </Badge>
              )}
              {answer.hasGraduated && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[8px] px-1 py-0 shrink-0 gap-0.5">
                  <GraduationCap className="h-2 w-2" />
                  Graduated
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-0.5">
                <User className="h-2 w-2" />
                {shortenAddress(answer.proposer)}
              </span>
              {/* Price Change Badge */}
              <span className={`flex items-center gap-0.5 font-semibold ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-2 w-2" />
                ) : (
                  <TrendingDown className="h-2 w-2" />
                )}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid - 2x2 compact */}
        <div className="grid grid-cols-2 gap-1 mb-2 flex-1">
          <div className="bg-muted/30 rounded px-1.5 py-1">
            <div className="text-[7px] text-muted-foreground uppercase tracking-wide">Pool</div>
            <div className="text-[10px] font-bold text-emerald-400">{formatUSDC(answer.poolValue)}</div>
          </div>
          <div className="bg-muted/30 rounded px-1.5 py-1">
            <div className="text-[7px] text-muted-foreground uppercase tracking-wide">Price</div>
            <div className="text-[10px] font-semibold">{formatSharePrice(answer.pricePerShare)}</div>
          </div>
          <div className="bg-muted/30 rounded px-1.5 py-1">
            <div className="text-[7px] text-muted-foreground uppercase tracking-wide flex items-center gap-0.5">
              <Coins className="h-2 w-2" />
              Shares
            </div>
            <div className="text-[10px] font-semibold">{formatShares(answer.totalShares)}</div>
          </div>
          <div className="bg-muted/30 rounded px-1.5 py-1">
            <div className="text-[7px] text-muted-foreground uppercase tracking-wide flex items-center gap-0.5">
              <Users className="h-2 w-2" />
              Holders
            </div>
            <div className="text-[10px] font-semibold">{Number(answer.holderCount || 0)}</div>
          </div>
        </div>

        {/* Position info (compact) */}
        {hasPosition && userPosition && (
          <div className="mb-2 p-1.5 bg-muted/20 rounded border border-border/30">
            <div className="flex items-center justify-between text-[9px]">
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Target className="h-2.5 w-2.5 text-emerald-400" />
                {formatShares(userPosition.shares)} shares
              </span>
              <span className={`font-bold ${isProfitable ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-muted-foreground'}`}>
                {isProfitable ? '+' : ''}{formatUSDC(profitLoss)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {answer.isActive && (
          <div className="flex items-center gap-1 mt-auto">
            <Button
              size="sm"
              onClick={onBuy}
              className="bg-emerald-500 hover:bg-emerald-600 text-white h-6 px-2 text-[10px] rounded flex-1"
            >
              <Zap className="mr-0.5 h-2.5 w-2.5" />
              Buy
            </Button>
            {hasPosition && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSell}
                className="h-6 px-2 text-[10px] rounded border-border/50"
              >
                Sell
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton loader for AnswerCard (compact grid version)
export function AnswerCardSkeleton() {
  return (
    <Card variant="glass" className="h-full">
      <CardContent className="p-2.5 flex flex-col h-full">
        {/* Header skeleton */}
        <div className="flex items-start gap-2 mb-2">
          <div className="w-6 h-6 rounded-full animate-shimmer" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-full rounded animate-shimmer" />
            <div className="h-2 w-16 rounded animate-shimmer delay-75" />
          </div>
        </div>
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-1 mb-2 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted/30 rounded px-1.5 py-1">
              <div className="h-2 w-8 rounded animate-shimmer mb-0.5" />
              <div className="h-2.5 w-12 rounded animate-shimmer" />
            </div>
          ))}
        </div>
        {/* Button skeleton */}
        <div className="h-6 w-full rounded animate-shimmer mt-auto" />
      </CardContent>
    </Card>
  );
}
