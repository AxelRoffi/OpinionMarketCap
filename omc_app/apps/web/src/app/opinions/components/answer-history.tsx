'use client';

import { useAnswerHistory, getAnswerColor, formatHistoryPrice, formatHistoryTime } from '@/hooks/useAnswerHistory';
import { ClickableAddress } from '@/components/ui/clickable-address';
import { formatAddress } from '../hooks/use-opinion-detail';
import { Repeat, Crown } from 'lucide-react';
import { useState } from 'react';

interface AnswerHistoryProps {
  opinionId: number;
  currentAnswer: string;
  onSelectAnswer?: (answer: string, description: string) => void;
}

export function AnswerHistoryPanel({ opinionId, currentAnswer, onSelectAnswer }: AnswerHistoryProps) {
  const { rankedAnswers, totalUniqueAnswers, isLoading } = useAnswerHistory(opinionId);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Answer History</div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (rankedAnswers.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Answer History</div>
        <p className="text-muted-foreground text-sm text-center py-4">No answer history yet. Be the first to trade!</p>
      </div>
    );
  }

  // Sort chronologically (newest first) instead of by rank
  const chronologicalAnswers = [...rankedAnswers].sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  const displayedAnswers = showAll ? chronologicalAnswers : chronologicalAnswers.slice(0, 5);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-foreground">
          Answer History
          <span className="text-muted-foreground font-normal ml-1.5">({totalUniqueAnswers})</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {displayedAnswers.map((entry, index) => {
          const isCurrent = entry.answer.toLowerCase().trim() === currentAnswer.toLowerCase().trim();
          const color = getAnswerColor(index);

          return (
            <button
              key={index}
              onClick={() => !isCurrent && onSelectAnswer?.(entry.answer, entry.description)}
              disabled={isCurrent}
              className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all duration-200 ${
                isCurrent
                  ? 'bg-emerald-500/10 border-emerald-500/40 cursor-default'
                  : `${color.bg} ${color.border} hover:brightness-125 hover:scale-[1.01] cursor-pointer`
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isCurrent && <Crown className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  <span className={`font-medium text-sm truncate ${isCurrent ? 'text-emerald-400' : color.text}`}>
                    {entry.answer}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.submissionCount > 1 && (
                    <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${isCurrent ? 'bg-emerald-500/20 text-emerald-300' : color.badge}`}>
                      <Repeat className="w-2.5 h-2.5" />
                      {entry.submissionCount}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatHistoryPrice(entry.peakPrice)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <ClickableAddress
                  address={entry.lastOwner}
                  className="hover:text-foreground cursor-pointer"
                >
                  {formatAddress(entry.lastOwner)}
                </ClickableAddress>
                <span>{formatHistoryTime(entry.lastTimestamp)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {chronologicalAnswers.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-xs text-blue-400 hover:text-blue-300 mt-2 py-1.5 transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${chronologicalAnswers.length} answers`}
        </button>
      )}
    </div>
  );
}
