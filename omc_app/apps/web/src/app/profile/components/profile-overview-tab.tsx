'use client';

import { motion } from 'framer-motion';
import { Award, Clock, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
          {/* Recent Activity */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-2.5">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="p-3 rounded-lg bg-muted/20 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'BUY' ? 'bg-emerald-500/20' :
                    transaction.type === 'SELL' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    {transaction.type === 'BUY' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : transaction.type === 'SELL' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Plus className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{transaction.type}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {transaction.opinionTitle.substring(0, 30)}...
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-foreground">
                      {formatUSDC(transaction.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(transaction.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-6">No recent activity</div>
              )}
            </div>
          </div>

          {/* Top Performing Opinions */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Top Performing</h3>
            <div className="space-y-2.5">
              {opinions
                .filter(opinion => opinion.pnl > 0)
                .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
                .slice(0, 5)
                .map((opinion) => (
                  <div key={opinion.id} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                        {opinion.question.substring(0, 30)}...
                      </div>
                      <Badge className="bg-blue-600/20 text-blue-400 text-xs flex-shrink-0">
                        {opinion.categories[0]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground truncate">
                        {opinion.currentAnswer.substring(0, 20)}...
                      </div>
                      <div className="text-emerald-500 font-medium text-sm">
                        {formatPercentage(opinion.pnlPercentage)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-muted-foreground">
                        Value: {formatUSDC(opinion.currentValue)}
                      </div>
                      <div className="text-xs text-emerald-400">
                        +{formatUSDC(opinion.pnl)}
                      </div>
                    </div>
                  </div>
                ))}
              {opinions.filter(o => o.pnl > 0).length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-6">No profitable positions yet</div>
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
