'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import {
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  User,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { GlobalNavbar } from '@/components/layout';
import { AnswerCard, AnswerCardSkeleton, ProposeAnswerModal } from '@/components/answers';
import { BuySharesModal, SellSharesModal } from '@/components/trading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuestion, useAnswers, useUserPositions } from '@/hooks';
import { formatUSDC, shortenAddress, formatTimeAgo } from '@/lib/utils';
import type { Answer } from '@/lib/contracts';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const questionId = BigInt(params.id as string);

  const { question, leadingAnswer, answerIds, isLoading: isLoadingQuestion, refetch: refetchQuestion } = useQuestion(questionId);
  const { answers, isLoading: isLoadingAnswers, refetch: refetchAnswers } = useAnswers(questionId, answerIds);
  const { positions: positionsArray, isLoading: isLoadingPositions, refetch: refetchPositions } = useUserPositions(
    answers.map((a) => a.id),
    address
  );

  // Convert positions array to a map by answer ID for easy lookup
  const positions: Record<string, { shares: bigint; currentValue: bigint; costBasis: bigint; profitLoss: bigint }> = {};
  positionsArray.forEach((p) => {
    positions[p.answerId.toString()] = {
      shares: p.shares,
      currentValue: p.currentValue,
      costBasis: p.costBasis,
      profitLoss: p.profitLoss,
    };
  });
  const leadingAnswerId = leadingAnswer?.answerId;

  // Modal states
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [buyingAnswer, setBuyingAnswer] = useState<Answer | null>(null);
  const [sellingAnswer, setSellingAnswer] = useState<Answer | null>(null);

  // Sort answers by pool value (market cap)
  const sortedAnswers = [...answers].sort((a, b) => Number(b.poolValue - a.poolValue));

  const isLoading = isLoadingQuestion || isLoadingAnswers;

  const handleTradeSuccess = () => {
    refetchAnswers();
    refetchPositions();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNavbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Back button */}
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Link>

          {/* Question skeleton */}
          <Card className="mb-8 animate-pulse">
            <CardContent className="p-6">
              <div className="mb-4 h-8 w-3/4 rounded bg-muted" />
              <div className="mb-4 h-4 w-full rounded bg-muted" />
              <div className="flex gap-4">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* Answers skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <AnswerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNavbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">Question not found</h3>
            <p className="mb-4 text-muted-foreground">This question may not exist or has been removed.</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Questions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back button */}
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Link>

        {/* Question Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  {!question.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <h1 className="mb-2 text-2xl font-bold">{question.text}</h1>
                {question.description && (
                  <p className="mb-4 text-muted-foreground">{question.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Created by {shortenAddress(question.creator)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(question.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{Number(question.answerCount)} answers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{formatUSDC(question.totalVolume)} volume</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Answers ({answers.length})</h2>
          {question.isActive && (
            <Button onClick={() => setShowProposeModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Propose Answer ($5)
            </Button>
          )}
        </div>

        {sortedAnswers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">No answers yet</h3>
              <p className="mb-4 text-muted-foreground">
                Be the first to propose an answer and earn creator fees.
              </p>
              {question.isActive && (
                <Button onClick={() => setShowProposeModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Propose First Answer
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedAnswers.map((answer, index) => {
              const position = positions[answer.id.toString()];
              const isLeading = answer.id === leadingAnswerId;

              return (
                <AnswerCard
                  key={answer.id.toString()}
                  answer={answer}
                  rank={index + 1}
                  userPosition={position}
                  isLeading={isLeading}
                  onBuy={() => setBuyingAnswer(answer)}
                  onSell={() => setSellingAnswer(answer)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Propose Answer Modal */}
      {question && (
        <ProposeAnswerModal
          open={showProposeModal}
          onOpenChange={setShowProposeModal}
          question={question}
          onSuccess={() => {
            refetchAnswers();
            refetchQuestion();
            setShowProposeModal(false);
          }}
        />
      )}

      {/* Buy Shares Modal */}
      {buyingAnswer && (
        <BuySharesModal
          open={!!buyingAnswer}
          onOpenChange={(open) => !open && setBuyingAnswer(null)}
          answer={buyingAnswer}
          onSuccess={handleTradeSuccess}
        />
      )}

      {/* Sell Shares Modal */}
      {sellingAnswer && positions[sellingAnswer.id.toString()] && (
        <SellSharesModal
          open={!!sellingAnswer}
          onOpenChange={(open) => !open && setSellingAnswer(null)}
          answer={sellingAnswer}
          position={positions[sellingAnswer.id.toString()]}
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  );
}
