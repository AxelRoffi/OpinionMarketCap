'use client';

import { Copy, Check, TrendingUp, TrendingDown, ExternalLink, Bookmark, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ENSAvatar } from '@/components/ENSComponents';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { formatPercentage, formatAddress, type UserStats } from '../hooks/use-user-profile';
import Link from 'next/link';

interface ProfileHeroProps {
  stats: UserStats;
  targetAddress: string;
  isOwnProfile: boolean;
  ensName: string | null;
  ensLoading: boolean;
  copied: boolean;
  onCopy: () => void;
  watchlistCount: number;
}

export function ProfileHero({
  stats,
  targetAddress,
  isOwnProfile,
  ensName,
  ensLoading,
  copied,
  onCopy,
  watchlistCount,
}: ProfileHeroProps) {
  const animatedValue = useAnimatedCounter(stats.totalValue, 800);
  const animatedPnL = useAnimatedCounter(stats.totalPnL, 800);
  const animatedWinRate = useAnimatedCounter(stats.winRate, 600);
  const animatedPositions = useAnimatedCounter(stats.opinionsOwned, 600);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden relative">
      {/* Gradient Banner — taller, animated, more vivid */}
      <div className="h-28 sm:h-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 via-cyan-600/15 to-purple-600/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
        {/* Animated shimmer sweep across banner */}
        <div className="absolute inset-0 animate-shimmer opacity-30" />
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Rank badge */}
        {stats.rank > 0 && (
          <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-amber-500/30 rounded-full px-3 py-1 shadow-lg shadow-amber-500/10">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-bold text-foreground">#{stats.rank}</span>
            <span className="text-xs text-muted-foreground">
              Top {stats.totalUsers > 0 ? ((stats.rank / stats.totalUsers) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="-mt-12 px-4 sm:px-6 pb-5">
        {/* Avatar with glow */}
        <div className="relative w-fit">
          <div className="absolute inset-0 w-[84px] h-[84px] rounded-full bg-emerald-500/20 blur-md" />
          <ENSAvatar
            address={targetAddress}
            size={84}
            className="ring-4 ring-background shadow-xl relative"
          />
        </div>

        {/* Name + Address row */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {ensName || (isOwnProfile ? 'Your Portfolio' : 'User Portfolio')}
              </h1>
              {ensLoading && (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono text-sm">
                {formatAddress(targetAddress)}
              </span>
              <Button variant="ghost" size="sm" onClick={onCopy} className="p-1 h-6 w-6 hover:bg-emerald-400/20">
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground hover:text-emerald-400" />
                )}
              </Button>
              <a
                href={`https://basescan.org/address/${targetAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 hover:bg-blue-400/20">
                  <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-blue-400" />
                </Button>
              </a>
            </div>
            {ensName && (
              <div className="text-xs text-emerald-500 mt-1 font-medium">ENS Verified</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <Link href="/watchlist">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 relative"
                >
                  <Bookmark className="w-4 h-4 mr-1.5" />
                  Watchlist
                  {watchlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {watchlistCount > 9 ? '9+' : watchlistCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* P&L Banner - 4 animated metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
          {/* Portfolio Value */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              Portfolio Value
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {formatAnimated(animatedValue)}
            </div>
          </div>

          {/* Total P&L */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
            <div className={`text-xl sm:text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}{formatAnimated(animatedPnL)}
            </div>
            <div className={`inline-flex items-center gap-1 text-xs mt-0.5 px-1.5 py-0.5 rounded-full animate-shimmer ${stats.totalPnL >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
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
              {Math.round((stats.winRate / 100) * stats.opinionsOwned)}/{stats.opinionsOwned} profitable
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
