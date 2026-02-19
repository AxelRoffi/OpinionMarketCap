'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Plus, Target, BarChart3, Coins } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { type UserStats } from '@/hooks/useUserProfile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

interface ProfileStatCardsProps {
  stats: UserStats;
}

export function ProfileStatCards({ stats }: ProfileStatCardsProps) {
  const animatedCostBasis = useAnimatedCounter(stats.totalCostBasis, 800);
  const animatedPnL = useAnimatedCounter(stats.totalPnL, 800);
  const animatedCreated = useAnimatedCounter(stats.questionsCreated, 600);
  const animatedShare = useAnimatedCounter(stats.marketShare, 600);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Invested (Cost Basis) */}
      <motion.div {...fadeUp(0.1)}>
        <div className="group bg-card rounded-xl border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <DollarSign className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground">Cost Basis</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{formatAnimated(animatedCostBasis)}</div>
          <div className="text-xs text-muted-foreground">Total Invested</div>
        </div>
      </motion.div>

      {/* Unrealized P&L */}
      <motion.div {...fadeUp(0.15)}>
        <div className={`group bg-card rounded-xl border p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
          stats.totalPnL >= 0
            ? 'border-green-500/10 hover:border-green-500/30 hover:shadow-green-500/5'
            : 'border-red-500/10 hover:border-red-500/30 hover:shadow-red-500/5'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              stats.totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {stats.totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">Unrealized</span>
          </div>
          <div className={`text-lg font-bold mt-2 ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}{formatAnimated(animatedPnL)}
          </div>
          <div className="text-xs text-muted-foreground">P&L</div>
        </div>
      </motion.div>

      {/* Questions Created */}
      <motion.div {...fadeUp(0.2)}>
        <div className="group bg-card rounded-xl border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
              <Plus className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground">Created</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{Math.round(animatedCreated)}</div>
          <div className="text-xs text-muted-foreground">Questions</div>
        </div>
      </motion.div>

      {/* Market Share */}
      <motion.div {...fadeUp(0.25)}>
        <div className="group bg-card rounded-xl border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground">Share</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{animatedShare.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">of Platform TVL</div>
        </div>
      </motion.div>
    </div>
  );
}

// Secondary stat cards for additional metrics
export function SecondaryStatCards({ stats }: ProfileStatCardsProps) {
  const animatedVolume = useAnimatedCounter(stats.totalVolume, 800);
  const animatedFees = useAnimatedCounter(stats.accumulatedFees, 800);
  const animatedBest = useAnimatedCounter(stats.bestPosition, 600);
  const animatedProposed = useAnimatedCounter(stats.answersProposed, 600);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Volume Generated */}
      <motion.div {...fadeUp(0.1)}>
        <div className="group bg-card rounded-xl border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/5 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs text-muted-foreground">Volume</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{formatAnimated(animatedVolume)}</div>
          <div className="text-xs text-muted-foreground">Generated</div>
        </div>
      </motion.div>

      {/* Claimable Fees */}
      <motion.div {...fadeUp(0.15)}>
        <div className={`group bg-card rounded-xl border p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
          stats.accumulatedFees > 0
            ? 'border-primary/30 hover:border-primary/50 hover:shadow-primary/10'
            : 'border-border hover:border-yellow-500/20 hover:shadow-yellow-500/5'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.accumulatedFees > 0 ? 'bg-primary/10' : 'bg-muted group-hover:bg-yellow-500/10'
            } transition-colors`}>
              <Coins className={`w-4 h-4 ${stats.accumulatedFees > 0 ? 'text-primary' : 'text-yellow-400'}`} />
            </div>
            <span className="text-xs text-muted-foreground">Fees</span>
          </div>
          <div className={`text-lg font-bold mt-2 ${stats.accumulatedFees > 0 ? 'text-primary' : 'text-foreground'}`}>
            {formatAnimated(animatedFees)}
          </div>
          <div className="text-xs text-muted-foreground">Claimable</div>
        </div>
      </motion.div>

      {/* Best Trade */}
      <motion.div {...fadeUp(0.2)}>
        <div className="group bg-card rounded-xl border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/5 hover:border-green-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground">Best</span>
          </div>
          <div className="text-lg font-bold text-green-400 mt-2">
            {stats.bestPosition > 0 ? `+${formatAnimated(animatedBest)}` : '$0.00'}
          </div>
          <div className="text-xs text-muted-foreground">Trade P&L</div>
        </div>
      </motion.div>

      {/* Answers Proposed */}
      <motion.div {...fadeUp(0.25)}>
        <div className="group bg-card rounded-xl border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/5 hover:border-orange-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
              <Plus className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs text-muted-foreground">Proposed</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{Math.round(animatedProposed)}</div>
          <div className="text-xs text-muted-foreground">Answers</div>
        </div>
      </motion.div>
    </div>
  );
}
