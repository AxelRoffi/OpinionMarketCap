'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Crown, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type PositionWithDetails } from '@/hooks/useUserProfile';
import { formatUSDC, formatShares } from '@/lib/utils';
import { type Answer, type UserPosition } from '@/lib/contracts';

interface PositionsListProps {
  positions: PositionWithDetails[];
  isLoading: boolean;
  onBuy: (answer: Answer) => void;
  onSell: (answer: Answer, position: UserPosition) => void;
  onClaimKingFees?: (answerId: bigint) => void;
  isClaimingKingFees?: boolean;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export function PositionsList({ positions, isLoading, onBuy, onSell, onClaimKingFees, isClaimingKingFees }: PositionsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-24 bg-muted rounded ml-auto" />
                <div className="h-6 w-20 bg-muted rounded ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No positions yet</h3>
        <p className="text-muted-foreground mb-4">
          Start trading by buying shares in answers you believe will become popular.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">
            <TrendingUp className="w-4 h-4 mr-2" />
            Browse Questions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {positions.map((item, index) => {
        const isProfitable = item.position.profitLoss > 0n;
        const pnlNum = Number(item.position.profitLoss) / 1_000_000;
        const costBasis = Number(item.position.costBasis) / 1_000_000;
        const pnlPercentage = costBasis > 0 ? (pnlNum / costBasis) * 100 : 0;
        const isKing = item.question.leadingAnswerId === item.answerId;
        const isGraduated = item.answer.hasGraduated;
        const kingFeesNum = Number(item.position.pendingKingFees) / 1_000_000;

        return (
          <motion.div key={item.answerId.toString()} {...fadeUp(index * 0.05)}>
            <div className={`group bg-card rounded-xl border p-4 hover:shadow-lg transition-all duration-300 ${
              isKing
                ? 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/5'
                : 'border-border hover:border-primary/20 hover:shadow-primary/5'
            }`}>
              <div className="flex items-start justify-between gap-4">
                {/* Position Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/questions/${item.question.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-1"
                  >
                    {item.question.text}
                  </Link>
                  <h3 className="text-lg font-medium text-foreground mt-1 line-clamp-1">
                    {item.answer.text}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {item.question.category}
                    </Badge>
                    {isKing && (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs gap-1">
                        <Crown className="w-3 h-3" />
                        King
                      </Badge>
                    )}
                    {isGraduated && (
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs gap-1">
                        <GraduationCap className="w-3 h-3" />
                        Graduated
                      </Badge>
                    )}
                    <span>{formatShares(item.position.shares)} shares</span>
                    <span className="text-muted-foreground/60">@</span>
                    <span>{formatUSDC(Number(item.answer.pricePerShare) / 1e12)}/share</span>
                  </div>

                  {/* King Fees row */}
                  {kingFeesNum > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <Crown className="w-3 h-3" />
                        <span>{formatUSDC(kingFeesNum)} king fees</span>
                      </div>
                      {onClaimKingFees && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onClaimKingFees(item.answerId)}
                          disabled={isClaimingKingFees}
                          className="h-6 text-xs px-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                          {isClaimingKingFees ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Claim'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Position Value */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-muted-foreground">Value</div>
                  <div className="text-lg font-bold text-foreground">
                    {formatUSDC(Number(item.position.currentValue) / 1_000_000)}
                  </div>
                  <div className={`flex items-center justify-end gap-1 text-sm ${
                    isProfitable ? 'text-green-500' : item.position.profitLoss < 0n ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {isProfitable ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : item.position.profitLoss < 0n ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    <span>
                      {pnlNum >= 0 ? '+' : ''}{formatUSDC(pnlNum)}
                    </span>
                    <span className="text-xs">
                      ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => onBuy(item.answer)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Buy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSell(item.answer, item.position)}
                      className="border-muted-foreground/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Top positions summary (for overview sections)
export function TopPositions({ positions, limit = 3 }: { positions: PositionWithDetails[]; limit?: number }) {
  const topPositions = positions
    .sort((a, b) => Number(b.position.profitLoss - a.position.profitLoss))
    .slice(0, limit);

  if (topPositions.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-green-400" />
        Top Positions by P&L
      </h3>
      <div className="space-y-3">
        {topPositions.map((item, index) => {
          const isProfitable = item.position.profitLoss > 0n;
          const pnlNum = Number(item.position.profitLoss) / 1_000_000;

          return (
            <Link
              key={item.answerId.toString()}
              href={`/questions/${item.question.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-bold text-muted-foreground w-6">#{index + 1}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {item.answer.text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.question.text}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-bold flex-shrink-0 ${
                isProfitable ? 'text-green-500' : item.position.profitLoss < 0n ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {pnlNum >= 0 ? '+' : ''}{formatUSDC(pnlNum)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
