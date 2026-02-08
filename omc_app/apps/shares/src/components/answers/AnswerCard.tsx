'use client';

import { TrendingUp, Users, User, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUSDC, shortenAddress, formatShares } from '@/lib/utils';
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
  const hasPosition = userPosition && userPosition.shares > 0n;
  const profitLoss = hasPosition ? userPosition.profitLoss : 0n;
  const isProfitable = profitLoss > 0n;

  // Rank badge styling
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { emoji: '🥇', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 2:
        return { emoji: '🥈', className: 'bg-gray-400/20 text-gray-400 border-gray-400/30' };
      case 3:
        return { emoji: '🥉', className: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
      default:
        return { emoji: `#${rank}`, className: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <Card
      variant="glass"
      className={`transition-all ${
        isLeading ? 'border-primary/50 bg-primary/5 glow-primary-sm' : 'hover:border-primary/20'
      } ${!answer.isActive ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Rank + Answer Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {rank && (
                <Badge variant="outline" className={getRankBadge(rank).className}>
                  {getRankBadge(rank).emoji}
                </Badge>
              )}
              {isLeading && (
                <Badge className="bg-primary/20 text-primary">Leading</Badge>
              )}
              {answer.isFlagged && (
                <Badge variant="destructive">Flagged</Badge>
              )}
            </div>

            <h4 className="text-lg font-medium">{answer.text}</h4>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{shortenAddress(answer.proposer)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{Number(answer.holderCount || 0)} holders</span>
              </div>
            </div>
          </div>

          {/* Right: Price + Actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Market Cap */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Market Cap</div>
              <div className="text-lg font-bold text-primary">
                {formatUSDC(answer.poolValue)}
              </div>
            </div>

            {/* Share Price */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Share Price</div>
              <div className="font-medium">{formatUSDC(answer.pricePerShare)}</div>
            </div>

            {/* User Position */}
            {hasPosition && (
              <div className="mt-2 rounded-lg bg-muted/50 p-2 text-right">
                <div className="text-xs text-muted-foreground">Your Position</div>
                <div className="font-medium">{formatShares(userPosition.shares)} shares</div>
                <div className="text-sm">
                  Worth{' '}
                  <span className="font-medium">{formatUSDC(userPosition.currentValue)}</span>
                </div>
                <div
                  className={`text-xs ${
                    isProfitable ? 'text-green-500' : profitLoss < 0n ? 'text-red-500' : ''
                  }`}
                >
                  {isProfitable ? '+' : ''}
                  {formatUSDC(profitLoss)} P&L
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {answer.isActive && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={onBuy}>
                  <DollarSign className="mr-1 h-4 w-4" />
                  Buy
                </Button>
                {hasPosition && (
                  <Button size="sm" variant="outline" onClick={onSell}>
                    Sell
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loader for AnswerCard
export function AnswerCardSkeleton() {
  return (
    <Card variant="glass">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-16 rounded-lg animate-shimmer" />
            <div className="h-6 w-3/4 rounded-lg animate-shimmer delay-75" />
            <div className="flex gap-4">
              <div className="h-4 w-24 rounded-lg animate-shimmer delay-100" />
              <div className="h-4 w-20 rounded-lg animate-shimmer delay-100" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 rounded-lg animate-shimmer delay-150" />
            <div className="h-6 w-20 rounded-lg animate-shimmer delay-150" />
            <div className="h-4 w-16 rounded-lg animate-shimmer delay-200" />
            <div className="h-5 w-16 rounded-lg animate-shimmer delay-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
