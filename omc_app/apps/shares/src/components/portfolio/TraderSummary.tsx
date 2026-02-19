'use client';

import { Crown, BarChart3, Target, DollarSign, Plus, TrendingUp, Clock, Layers } from 'lucide-react';
import { type UserStats } from '@/hooks/useUserProfile';

interface TraderSummaryProps {
  stats: UserStats;
}

export function TraderSummary({ stats }: TraderSummaryProps) {
  const topCategory = stats.topCategories.length > 0 ? stats.topCategories[0].category : null;

  const memberSinceLabel = stats.memberSince > 0
    ? new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  // Build subtitle parts
  const subtitleParts: string[] = [];
  if (memberSinceLabel) subtitleParts.push(`Active since ${memberSinceLabel}`);
  if (stats.positionCount > 0) subtitleParts.push(`${stats.positionCount} positions`);
  if (topCategory) subtitleParts.push(`Trades in ${topCategory}`);

  const hasActivity = stats.positionCount > 0 || stats.questionsCreated > 0 || stats.answersProposed > 0;

  if (!hasActivity) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Subtitle line */}
      {subtitleParts.length > 0 && (
        <div className="text-sm text-muted-foreground mb-3">
          {subtitleParts.join(' \u00B7 ')}
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {/* Positions */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{stats.positionCount}</div>
            <div className="text-[10px] text-muted-foreground">Positions</div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-green-400" />
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

        {/* Questions Created */}
        {stats.questionsCreated > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.questionsCreated}</div>
              <div className="text-[10px] text-muted-foreground">Created</div>
            </div>
          </div>
        )}

        {/* Answers Proposed */}
        {stats.answersProposed > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.answersProposed}</div>
              <div className="text-[10px] text-muted-foreground">Proposed</div>
            </div>
          </div>
        )}

        {/* Market Share */}
        {stats.marketShare > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.marketShare.toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">Share</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Category breakdown component
export function CategoryBreakdown({ topCategories }: { topCategories: { category: string; count: number }[] }) {
  if (topCategories.length === 0) return null;

  const maxCount = Math.max(...topCategories.map(c => c.count));

  // Category colors (matching all categories)
  const categoryColors: Record<string, string> = {
    // Crypto/Web3
    'Crypto': 'bg-orange-500',
    'DeFi': 'bg-blue-500',
    'NFTs': 'bg-purple-500',
    'Gaming': 'bg-pink-500',
    'Memes': 'bg-amber-500',
    // General
    'AI': 'bg-cyan-500',
    'Automotive': 'bg-slate-500',
    'Books & Literature': 'bg-emerald-500',
    'Business': 'bg-indigo-500',
    'Celebrities': 'bg-fuchsia-500',
    'Conspiracy': 'bg-violet-500',
    'Dating & Relationships': 'bg-rose-500',
    'Entertainment': 'bg-yellow-500',
    'Investing': 'bg-lime-500',
    'Luxury': 'bg-amber-600',
    'Mobile Apps': 'bg-sky-500',
    'Movies & TV': 'bg-red-500',
    'Music': 'bg-violet-500',
    'Parenting': 'bg-teal-500',
    'Podcasts': 'bg-orange-600',
    'Politics': 'bg-red-600',
    'Real Estate': 'bg-green-500',
    'Social Media': 'bg-blue-600',
    'Sports': 'bg-green-600',
    'Other': 'bg-gray-500',
    'Adult': 'bg-pink-600',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Category Activity</h3>
      <div className="space-y-2">
        {topCategories.map((cat) => {
          const percentage = (cat.count / maxCount) * 100;
          const color = categoryColors[cat.category] || 'bg-primary';

          return (
            <div key={cat.category} className="flex items-center gap-3">
              <div className="w-20 text-xs text-muted-foreground truncate">{cat.category}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-6 text-xs text-muted-foreground text-right">{cat.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
