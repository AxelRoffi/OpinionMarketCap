'use client';

import { Crown, BarChart3, Target, DollarSign, Plus, TrendingUp } from 'lucide-react';
import { type UserStats } from '../hooks/use-user-profile';

interface TraderSummaryProps {
  stats: UserStats;
}

export function TraderSummary({ stats }: TraderSummaryProps) {
  const topPercentage = stats.totalUsers > 0 ? ((stats.rank / stats.totalUsers) * 100) : 0;
  const topCategory = stats.topCategories.length > 0 ? stats.topCategories[0].category : null;

  const memberSinceLabel = stats.memberSince > 0
    ? new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  // Build subtitle parts
  const subtitleParts: string[] = [];
  if (memberSinceLabel) subtitleParts.push(`Trader since ${memberSinceLabel}`);
  if (stats.totalTrades > 0) subtitleParts.push(`${stats.totalTrades} trades`);
  if (topCategory) subtitleParts.push(`Active in ${topCategory}`);

  const hasActivity = stats.totalTrades > 0 || stats.opinionsOwned > 0 || stats.questionsCreated > 0;

  if (!hasActivity) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Subtitle line */}
      {subtitleParts.length > 0 && (
        <div className="text-sm text-muted-foreground mb-3">
          {subtitleParts.join(' \u00B7 ')}
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {/* Rank */}
        {stats.rank > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">#{stats.rank}</div>
              <div className="text-[10px] text-muted-foreground">Rank</div>
            </div>
          </div>
        )}

        {/* Trades */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{stats.totalTrades}</div>
            <div className="text-[10px] text-muted-foreground">Trades</div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{stats.winRate.toFixed(0)}%</div>
            <div className="text-[10px] text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* TVL */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-muted-foreground">TVL</div>
          </div>
        </div>

        {/* Created */}
        {stats.questionsCreated > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.questionsCreated}</div>
              <div className="text-[10px] text-muted-foreground">Created</div>
            </div>
          </div>
        )}

        {/* Top % */}
        {topPercentage > 0 && topPercentage <= 100 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Top {topPercentage.toFixed(0)}%</div>
              <div className="text-[10px] text-muted-foreground">Rank</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
