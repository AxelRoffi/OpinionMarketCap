'use client';

import { Copy, Check, TrendingUp, TrendingDown, ExternalLink, Crown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { type UserStats, formatPercentage, formatAddress } from '@/hooks/useUserProfile';

interface ProfileHeroProps {
  stats: UserStats;
  targetAddress: string;
  isOwnProfile: boolean;
}

export function ProfileHero({ stats, targetAddress, isOwnProfile }: ProfileHeroProps) {
  const [copied, setCopied] = useState(false);

  const animatedValue = useAnimatedCounter(stats.totalValue, 800);
  const animatedPnL = useAnimatedCounter(stats.totalPnL, 800);
  const animatedWinRate = useAnimatedCounter(stats.winRate, 600);
  const animatedPositions = useAnimatedCounter(stats.positionCount, 600);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(targetAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate rank percentage (mock - would need leaderboard data)
  const rankPercentage = stats.positionCount > 0 ? Math.min(95, Math.max(5, 100 - stats.marketShare * 10)) : 0;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden relative">
      {/* Gradient Banner */}
      <div className="h-28 sm:h-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-cyan-600/15 to-purple-600/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Rank badge */}
        {stats.positionCount > 0 && (
          <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-amber-500/30 rounded-full px-3 py-1 shadow-lg shadow-amber-500/10">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-muted-foreground">
              Top {rankPercentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="-mt-12 px-4 sm:px-6 pb-5">
        {/* Avatar placeholder with glow */}
        <div className="relative w-fit">
          <div className="absolute inset-0 w-[84px] h-[84px] rounded-full bg-primary/20 blur-md" />
          <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-primary/40 to-purple-600/40 ring-4 ring-background shadow-xl relative flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {targetAddress.slice(2, 4).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Name + Address row */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isOwnProfile ? 'Your Portfolio' : 'Trader Portfolio'}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono text-sm">
                {formatAddress(targetAddress)}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="p-1 h-6 w-6 hover:bg-primary/20">
                {copied ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                )}
              </Button>
              <a
                href={`https://sepolia.basescan.org/address/${targetAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 hover:bg-blue-400/20">
                  <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-blue-400" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* P&L Banner - 4 animated metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
          {/* Portfolio Value */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Portfolio Value
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {formatAnimated(animatedValue)}
            </div>
          </div>

          {/* Total P&L */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
            <div className={`text-xl sm:text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}{formatAnimated(animatedPnL)}
            </div>
            <div className={`inline-flex items-center gap-1 text-xs mt-0.5 px-1.5 py-0.5 rounded-full ${stats.totalPnL >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {stats.totalPnL >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="font-medium">{formatPercentage(stats.totalPnLPercentage)}</span>
            </div>
          </div>

          {/* Win Rate */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {animatedWinRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.winningPositions}/{stats.positionCount} profitable
            </div>
          </div>

          {/* Positions */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Positions</div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {Math.round(animatedPositions)}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.questionsCreated > 0 && `+${stats.questionsCreated} created`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
