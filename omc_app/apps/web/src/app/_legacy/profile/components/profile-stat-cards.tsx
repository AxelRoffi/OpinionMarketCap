'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Plus, Target } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { type UserStats } from '../hooks/use-user-profile';

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
  const animatedInvested = useAnimatedCounter(stats.totalInvested, 800);
  const animatedPnL = useAnimatedCounter(stats.totalPnL, 800);
  const animatedCreated = useAnimatedCounter(stats.questionsCreated, 600);
  const animatedShare = useAnimatedCounter(stats.marketShare, 600);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Invested */}
      <motion.div {...fadeUp(0.1)}>
        <div className="group bg-card rounded-lg border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
              <DollarSign className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground">Cost Basis</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{formatAnimated(animatedInvested)}</div>
          <div className="text-xs text-muted-foreground">Total Invested</div>
        </div>
      </motion.div>

      {/* Unrealized P&L */}
      <motion.div {...fadeUp(0.15)}>
        <div className={`group bg-card rounded-lg border p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
          stats.totalPnL >= 0
            ? 'border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-emerald-500/5'
            : 'border-red-500/10 hover:border-red-500/30 hover:shadow-red-500/5'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              stats.totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              {stats.totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">Unrealized</span>
          </div>
          <div className={`text-lg font-bold mt-2 ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}{formatAnimated(animatedPnL)}
          </div>
          <div className="text-xs text-muted-foreground">P&L</div>
        </div>
      </motion.div>

      {/* Questions Created */}
      <motion.div {...fadeUp(0.2)}>
        <div className="group bg-card rounded-lg border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/20 transition-all duration-300">
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
        <div className="group bg-card rounded-lg border border-border p-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground">Share</span>
          </div>
          <div className="text-lg font-bold text-foreground mt-2">{animatedShare.toFixed(3)}%</div>
          <div className="text-xs text-muted-foreground">of Platform TVL</div>
        </div>
      </motion.div>
    </div>
  );
}
