'use client';

import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { OpinionDetail } from '../types/opinion-types';
import { formatUSDC, formatAddress, calculateChange } from '../hooks/use-opinion-detail';
import { ClickableAddress } from '@/components/ui/clickable-address';

interface PriceBarProps {
  opinion: OpinionDetail;
  totalTrades: number;
}

export function PriceBar({ opinion, totalTrades }: PriceBarProps) {
  const change = calculateChange(opinion.nextPrice, opinion.lastPrice);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Answer */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-xs text-muted-foreground mb-1">Current Answer</div>
          <div className="flex items-center gap-1.5">
            {opinion.link ? (
              <a
                href={opinion.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-semibold text-base hover:text-blue-400 transition-colors flex items-center gap-1 group truncate"
              >
                {opinion.currentAnswer}
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-blue-400 flex-shrink-0" />
              </a>
            ) : (
              <span className="text-foreground font-semibold text-base truncate">{opinion.currentAnswer}</span>
            )}
          </div>
          {opinion.currentAnswerDescription && (
            <p className="text-muted-foreground text-xs mt-0.5 truncate">{opinion.currentAnswerDescription}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            by{' '}
            <ClickableAddress
              address={opinion.currentAnswerOwner}
              className="text-foreground hover:text-blue-400 cursor-pointer"
            >
              {formatAddress(opinion.currentAnswerOwner)}
            </ClickableAddress>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Price</div>
          <div className="text-xl font-bold text-foreground">{formatUSDC(opinion.nextPrice)}</div>
          <div className={`flex items-center gap-1 text-xs mt-0.5 ${change.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="font-medium">{change.isPositive ? '+' : '-'}{change.percentage.toFixed(1)}%</span>
            <span className="text-muted-foreground">(${change.absolute.toFixed(2)})</span>
          </div>
        </div>

        {/* Volume */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Volume</div>
          <div className="text-xl font-bold text-foreground">{formatUSDC(opinion.totalVolume)}</div>
        </div>

        {/* Trades */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Trades</div>
          <div className="text-xl font-bold text-foreground">{totalTrades}</div>
        </div>
      </div>
    </div>
  );
}
