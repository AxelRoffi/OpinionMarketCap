'use client';

import { motion } from 'framer-motion';
import { Award, Clock, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { formatUSDC, formatPercentage, formatTimeAgo, type UserStats, type UserOpinion, type Transaction } from '../hooks/use-user-profile';
import { EnhancedPortfolioPerformanceChart } from './enhanced-portfolio-performance-chart';
import { EnhancedPortfolioChart } from './enhanced-portfolio-chart';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

interface ProfileOverviewTabProps {
  stats: UserStats;
  opinions: UserOpinion[];
  transactions: Transaction[];
  loading: boolean;
}

export function ProfileOverviewTab({ stats, opinions, transactions, loading }: ProfileOverviewTabProps) {
  const animatedBestTrade = useAnimatedCounter(stats.bestTrade, 800);
  const animatedCreatorFees = useAnimatedCounter(stats.creatorFees, 800);
  const animatedTradingProfits = useAnimatedCounter(stats.tradingProfits, 800);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <motion.div {...fadeUp(0)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Best Trade */}
          <div className="bg-card rounded-lg border border-border p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-yellow-400 font-medium">Best</span>
            </div>
            <div className="text-xl font-bold text-foreground">{formatAnimated(animatedBestTrade)}</div>
            <div className="text-xs text-muted-foreground">Best Trade</div>
          </div>

          {/* Average Hold Time */}
          <div className="bg-card rounded-lg border border-border p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-purple-400 font-medium">Avg</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {stats.avgHoldTime === -1 ? '—' : `${stats.avgHoldTime}d`}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.avgHoldTime === -1 ? 'Coming soon' : 'Hold Time'}
            </div>
          </div>

          {/* Creator Fees */}
          <div className="bg-card rounded-lg border border-border p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-blue-400 font-medium">3%</span>
            </div>
            <div className="text-xl font-bold text-foreground">{formatAnimated(animatedCreatorFees)}</div>
            <div className="text-xs text-muted-foreground">Creator Fees</div>
          </div>

          {/* Trading Profits */}
          <div className="bg-card rounded-lg border border-border p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-xs text-emerald-400 font-medium">P&L</span>
            </div>
            <div className="text-xl font-bold text-foreground">{formatAnimated(animatedTradingProfits)}</div>
            <div className="text-xs text-muted-foreground">Trading Profits</div>
          </div>
        </div>
      </motion.div>

      {/* Portfolio Performance Chart */}
      <motion.div {...fadeUp(0.1)}>
        <EnhancedPortfolioPerformanceChart opinions={opinions} loading={loading} />
      </motion.div>

      {/* Recent Activity + Top Performing side-by-side */}
      <motion.div {...fadeUp(0.15)}>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Activity — built from opinions data */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-2.5">
              {(() => {
                // Build activity from opinions: each opinion the user is involved with is an activity entry
                const activityItems = opinions
                  .map(op => ({
                    id: op.id,
                    question: op.question,
                    answer: op.currentAnswer,
                    value: op.currentValue,
                    type: op.isCreator && !op.isOwner ? 'CREATED' as const : 'POSITION' as const,
                    pnl: op.pnl,
                    timestamp: op.timestamp,
                  }))
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 5);

                if (activityItems.length === 0) {
                  return <div className="text-center text-muted-foreground text-sm py-6">No recent activity</div>;
                }

                return activityItems.map(item => (
                  <div key={item.id} className="p-3 rounded-lg bg-muted/20 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === 'CREATED' ? 'bg-blue-500/20' : item.pnl >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      {item.type === 'CREATED' ? (
                        <Plus className="w-4 h-4 text-blue-500" />
                      ) : item.pnl >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {item.type === 'CREATED' ? 'Created' : 'Position'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.question.length > 35 ? `${item.question.substring(0, 35)}...` : item.question}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium text-foreground">
                        {formatUSDC(item.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.timestamp)}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Top Positions (by P&L) */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Top Positions</h3>
            <div className="space-y-2.5">
              {opinions
                .filter(opinion => opinion.isOwner)
                .sort((a, b) => b.pnl - a.pnl)
                .slice(0, 3)
                .map((opinion, idx) => {
                  const isProfit = opinion.pnl >= 0;
                  return (
                    <div key={opinion.id} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                              {opinion.question.length > 30 ? `${opinion.question.substring(0, 30)}...` : opinion.question}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {opinion.currentAnswer}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-sm font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}{formatUSDC(opinion.pnl)}
                          </div>
                          <div className={`text-xs ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatPercentage(opinion.pnlPercentage)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {opinions.filter(o => o.isOwner).length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-6">No positions yet</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Portfolio Analytics (merged from Analytics tab) */}
      <motion.div {...fadeUp(0.2)}>
        <EnhancedPortfolioChart opinions={opinions} transactions={transactions} loading={loading} />
      </motion.div>
    </div>
  );
}
