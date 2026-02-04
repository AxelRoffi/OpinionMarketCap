'use client';

import { Pencil, Volume2, TrendingUp } from 'lucide-react';
import { type UserStats } from '../hooks/use-user-profile';

interface CreatorStatsProps {
  stats: UserStats;
}

function formatUSDCShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CreatorStats({ stats }: CreatorStatsProps) {
  if (stats.questionsCreated === 0) return null;

  const { totalVolumeGenerated, avgVolumePerQuestion } = stats.creatorVolumeStats;

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Creator Stats</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Pencil className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-muted-foreground">Created</span>
          </div>
          <div className="text-lg font-bold text-foreground">{stats.questionsCreated}</div>
          <div className="text-[10px] text-muted-foreground">Questions</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-muted-foreground">Volume</span>
          </div>
          <div className="text-lg font-bold text-foreground">{formatUSDCShort(totalVolumeGenerated)}</div>
          <div className="text-[10px] text-muted-foreground">Total Generated</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Avg</span>
          </div>
          <div className="text-lg font-bold text-foreground">{formatUSDCShort(avgVolumePerQuestion)}</div>
          <div className="text-[10px] text-muted-foreground">Per Question</div>
        </div>
      </div>
    </div>
  );
}
