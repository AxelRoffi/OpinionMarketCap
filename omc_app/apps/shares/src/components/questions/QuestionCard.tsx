'use client';

import Link from 'next/link';
import { MessageSquare, TrendingUp, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUSDC, shortenAddress, formatTimeAgo } from '@/lib/utils';
import type { Question } from '@/lib/contracts';

interface QuestionCardProps {
  question: Question & {
    leadingAnswerId?: bigint;
    leadingMarketCap?: bigint;
    leadingAnswerText?: string;
  };
  onClick?: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const hasLeadingAnswer = question.leadingAnswerId && question.leadingAnswerId > 0n;

  return (
    <Link href={`/questions/${question.id}`}>
      <Card
        variant="interactive"
        className="group"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary">
              {question.text}
            </h3>
            {!question.isActive && (
              <Badge variant="secondary" className="shrink-0">
                Inactive
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Leading Answer */}
          {hasLeadingAnswer && (
            <div className="rounded-lg bg-primary/5 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span>Leading Answer</span>
              </div>
              <p className="line-clamp-1 text-sm font-medium">
                {question.leadingAnswerText || `Answer #${question.leadingAnswerId}`}
              </p>
              <p className="mt-1 text-xs text-primary">
                {formatUSDC(question.leadingMarketCap || 0n)} market cap
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{Number(question.answerCount)} answers</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{formatUSDC(question.totalVolume)} vol</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{shortenAddress(question.creator)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(question.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton loader for QuestionCard
export function QuestionCardSkeleton() {
  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <div className="h-6 w-3/4 rounded-lg animate-shimmer" />
        <div className="h-4 w-full rounded-lg animate-shimmer delay-75" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="h-3 w-24 rounded-lg animate-shimmer delay-100" />
          <div className="mt-2 h-4 w-3/4 rounded-lg animate-shimmer delay-150" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-20 rounded-lg animate-shimmer delay-200" />
          <div className="h-4 w-20 rounded-lg animate-shimmer delay-200" />
        </div>
        <div className="flex justify-between border-t border-border/40 pt-3">
          <div className="h-3 w-24 rounded-lg animate-shimmer delay-300" />
          <div className="h-3 w-16 rounded-lg animate-shimmer delay-300" />
        </div>
      </CardContent>
    </Card>
  );
}
