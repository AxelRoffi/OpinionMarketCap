'use client';

import { TrendingUp, TrendingDown, ExternalLink, Sparkles } from 'lucide-react';
import { OpinionDetail } from '../types/opinion-types';
import { formatAddress, calculateChange } from '../hooks/use-opinion-detail';
import { ClickableAddress } from '@/components/ui/clickable-address';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface PriceBarProps {
  opinion: OpinionDetail;
  totalTrades: number;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function PriceBar({ opinion, totalTrades }: PriceBarProps) {
  const change = calculateChange(opinion.nextPrice, opinion.lastPrice);

  const priceUsdc = Number(opinion.nextPrice) / 1_000_000;
  const volumeUsdc = Number(opinion.totalVolume) / 1_000_000;

  // V4 vacant-slot state — slot has been self-exited and is awaiting reclaim.
  const isVacant = opinion.currentAnswerOwner.toLowerCase() === ZERO_ADDRESS;
  const lastPriceUsdc = Number(opinion.lastPrice) / 1_000_000;
  const reclaimDiscountPct = isVacant && lastPriceUsdc > priceUsdc
    ? Math.round((1 - priceUsdc / lastPriceUsdc) * 100)
    : 0;

  const animatedPrice = useAnimatedCounter(priceUsdc, 800);
  const animatedVolume = useAnimatedCounter(volumeUsdc, 800);
  const animatedTrades = useAnimatedCounter(totalTrades, 600);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current / Last Answer */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isVacant ? 'bg-purple-500/70' : 'bg-emerald-500 animate-pulse-dot'
              }`}
            />
            {isVacant ? 'Last Answer (dormant)' : 'Current Answer'}
          </div>
          <div className="flex items-center gap-1.5">
            {opinion.link ? (
              <a
                href={opinion.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold text-base hover:text-blue-400 transition-colors flex items-center gap-1 group truncate ${
                  isVacant ? 'text-muted-foreground italic' : 'text-foreground'
                }`}
              >
                {opinion.currentAnswer}
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-blue-400 flex-shrink-0" />
              </a>
            ) : (
              <span
                className={`font-semibold text-base truncate ${
                  isVacant ? 'text-muted-foreground italic' : 'text-foreground'
                }`}
              >
                {opinion.currentAnswer}
              </span>
            )}
          </div>
          {opinion.currentAnswerDescription && (
            <p className="text-muted-foreground text-xs mt-0.5 truncate">{opinion.currentAnswerDescription}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {isVacant ? (
              <span className="inline-flex items-center gap-1 text-purple-400 font-medium uppercase tracking-wide text-[10px] px-1.5 py-[1px] rounded border border-purple-500/40 bg-purple-500/10">
                <Sparkles className="w-2.5 h-2.5" />
                vacant — claim it
              </span>
            ) : (
              <>
                by{' '}
                <ClickableAddress
                  address={opinion.currentAnswerOwner}
                  className="text-foreground hover:text-blue-400 cursor-pointer"
                >
                  {formatAddress(opinion.currentAnswerOwner)}
                </ClickableAddress>
              </>
            )}
          </div>
        </div>

        {/* Price (or Reclaim Price when vacant) */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            {isVacant ? 'Reclaim Price' : 'Price'}
          </div>
          <div className="text-xl font-bold text-foreground">{formatAnimated(animatedPrice)}</div>
          {isVacant ? (
            reclaimDiscountPct > 0 ? (
              <div className="inline-flex items-center gap-1 text-xs mt-0.5 px-1.5 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">
                <TrendingDown className="w-3 h-3" />
                <span className="font-medium">{reclaimDiscountPct}% off — was ${lastPriceUsdc.toFixed(2)}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-xs mt-0.5 px-1.5 py-0.5 rounded-full text-purple-400 bg-purple-500/10">
                <Sparkles className="w-3 h-3" />
                <span className="font-medium">min reclaim floor</span>
              </div>
            )
          ) : (
            <div className={`inline-flex items-center gap-1 text-xs mt-0.5 px-1.5 py-0.5 rounded-full animate-shimmer ${change.isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="font-medium">{change.isPositive ? '+' : '-'}{change.percentage.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Volume */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Volume</div>
          <div className="text-xl font-bold text-foreground">{formatAnimated(animatedVolume)}</div>
        </div>

        {/* Trades */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Trades</div>
          <div className="text-xl font-bold text-foreground">{Math.round(animatedTrades)}</div>
        </div>
      </div>
    </div>
  );
}
