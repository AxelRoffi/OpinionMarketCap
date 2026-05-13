'use client';

import { type CategoryCount } from '../hooks/use-user-profile';

interface CategoryBreakdownProps {
  topCategories: CategoryCount[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  'Technology': { bg: 'bg-blue-500/15', text: 'text-blue-400', bar: 'bg-blue-500' },
  'Crypto': { bg: 'bg-orange-500/15', text: 'text-orange-400', bar: 'bg-orange-500' },
  'DeFi': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  'AI': { bg: 'bg-violet-500/15', text: 'text-violet-400', bar: 'bg-violet-500' },
  'Gaming': { bg: 'bg-pink-500/15', text: 'text-pink-400', bar: 'bg-pink-500' },
  'Sports': { bg: 'bg-green-500/15', text: 'text-green-400', bar: 'bg-green-500' },
  'Politics': { bg: 'bg-red-500/15', text: 'text-red-400', bar: 'bg-red-500' },
  'Entertainment': { bg: 'bg-amber-500/15', text: 'text-amber-400', bar: 'bg-amber-500' },
  'Science': { bg: 'bg-teal-500/15', text: 'text-teal-400', bar: 'bg-teal-500' },
  'Finance': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  'Culture': { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', bar: 'bg-fuchsia-500' },
  'Music': { bg: 'bg-rose-500/15', text: 'text-rose-400', bar: 'bg-rose-500' },
};

const DEFAULT_COLOR = { bg: 'bg-slate-500/15', text: 'text-slate-400', bar: 'bg-slate-500' };

function getCatColor(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

export function CategoryBreakdown({ topCategories }: CategoryBreakdownProps) {
  if (topCategories.length === 0) return null;

  const maxCount = topCategories[0]?.count || 1;

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Most Active Categories</h3>
      <div className="space-y-2.5">
        {topCategories.map(({ category, count }) => {
          const color = getCatColor(category);
          const widthPercent = Math.max((count / maxCount) * 100, 8);

          return (
            <div key={category} className="flex items-center gap-3">
              <span className={`text-xs font-medium w-24 truncate ${color.text}`}>
                {category}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color.bar} transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
