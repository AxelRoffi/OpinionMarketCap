'use client';

import { useState, useMemo } from 'react';
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
  AlertCircle,
  Crown,
  ExternalLink,
  Tag,
  Coins,
  BarChart3,
  Users,
  Activity,
} from 'lucide-react';
import { AnswerCard, AnswerCardSkeleton, ProposeAnswerModal } from '@/components/answers';
import { BuySharesModal, SellSharesModal, InlineTradingPanel, MobileTradingSheet } from '@/components/trading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuestion, useAnswers, useUserPositions, useIsMobile } from '@/hooks';
import { formatUSDC, shortenAddress, formatTimeAgo, formatSharePrice, formatShares } from '@/lib/utils';
import type { Answer } from '@/lib/contracts';
import { TotalMarketCapChart } from '@/components/charts';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const isMobile = useIsMobile();
  const questionId = BigInt(params.id as string);

  const { question, leadingAnswer, answerIds, isLoading: isLoadingQuestion, refetch: refetchQuestion } = useQuestion(questionId);
  const { answers, isLoading: isLoadingAnswers, refetch: refetchAnswers } = useAnswers(questionId, answerIds);
  const { positions: positionsArray, isLoading: isLoadingPositions, refetch: refetchPositions } = useUserPositions(
    answers.map((a) => a.id),
    address
  );

  // Convert positions array to a map by answer ID for easy lookup
  const positions: Record<string, { shares: bigint; currentValue: bigint; costBasis: bigint; profitLoss: bigint; pendingKingFees: bigint }> = {};
  positionsArray.forEach((p) => {
    positions[p.answerId.toString()] = {
      shares: p.shares,
      currentValue: p.currentValue,
      costBasis: p.costBasis,
      profitLoss: p.profitLoss,
      pendingKingFees: p.pendingKingFees,
    };
  });
  const leadingAnswerId = leadingAnswer?.answerId;

  // Modal states
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [buyingAnswer, setBuyingAnswer] = useState<Answer | null>(null);
  const [sellingAnswer, setSellingAnswer] = useState<Answer | null>(null);

  // Sort answers by pool value (market cap)
  const sortedAnswers = [...answers].sort((a, b) => Number(b.poolValue - a.poolValue));

  // Get leading answer details
  const leadingAnswerData = sortedAnswers.find((a) => a.id === leadingAnswerId);

  // Calculate total market cap across all answers
  const totalMarketCap = useMemo(() => {
    return answers.reduce((sum, a) => sum + a.poolValue, 0n);
  }, [answers]);

  // Calculate additional market stats
  const marketStats = useMemo(() => {
    const totalShares = answers.reduce((sum, a) => sum + a.totalShares, 0n);
    const totalHolders = answers.reduce((sum, a) => sum + (a.holderCount || 0n), 0n);
    const avgPrice = answers.length > 0
      ? answers.reduce((sum, a) => sum + a.pricePerShare, 0n) / BigInt(answers.length)
      : 0n;
    const highestPrice = answers.length > 0
      ? answers.reduce((max, a) => a.pricePerShare > max ? a.pricePerShare : max, 0n)
      : 0n;
    const lowestPrice = answers.length > 0
      ? answers.reduce((min, a) => a.pricePerShare < min ? a.pricePerShare : min, answers[0]?.pricePerShare || 0n)
      : 0n;
    return { totalShares, totalHolders, avgPrice, highestPrice, lowestPrice };
  }, [answers]);

  const isLoading = isLoadingQuestion || isLoadingAnswers;

  const handleTradeSuccess = () => {
    refetchAnswers();
    refetchPositions();
    refetchQuestion();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="h-48 rounded-xl animate-shimmer" />
          <div className="h-48 rounded-xl animate-shimmer delay-75" />
        </div>
        <div className="h-32 rounded-xl animate-shimmer mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnswerCardSkeleton />
          <AnswerCardSkeleton />
          <AnswerCardSkeleton />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
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
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Back button */}
      <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Questions
      </Link>

      {/* ========== TOP SECTION: 50/50 Split with equal heights ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-stretch">
        {/* LEFT: Question + Leading Answer (Compact) */}
        <Card variant="glass" className="overflow-hidden flex flex-col">
          <CardContent className="p-3 flex-1 flex flex-col">
            {/* Question */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <Tag className="mr-1 h-2.5 w-2.5" />
                  {question.category}
                </Badge>
                {!question.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
              </div>
              <h1 className="text-lg font-bold mb-1">{question.text}</h1>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <User className="h-2.5 w-2.5" />
                  {shortenAddress(question.creator)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatTimeAgo(question.createdAt)}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-2.5 w-2.5" />
                  {Number(question.answerCount)} answers
                </span>
                <span className="flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {formatUSDC(question.totalVolume)} vol
                </span>
              </div>
            </div>

            {/* Leading Answer */}
            <div className="flex-1">
              {leadingAnswerData ? (
                <div className="border-t border-border/30 pt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Crown className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] font-medium text-muted-foreground">Leading Answer</span>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg p-2">
                    <h2 className="text-base font-bold text-emerald-400 mb-0.5">
                      {leadingAnswerData.text}
                    </h2>
                    {leadingAnswerData.description && (
                      <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-1">
                        {leadingAnswerData.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px]">
                      <span>
                        <span className="text-muted-foreground">Pool:</span>{' '}
                        <span className="font-semibold text-emerald-400">{formatUSDC(leadingAnswerData.poolValue)}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Price:</span>{' '}
                        <span className="font-semibold">{formatSharePrice(leadingAnswerData.pricePerShare)}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Shares:</span>{' '}
                        <span className="font-semibold">{formatShares(leadingAnswerData.totalShares)}</span>
                      </span>
                      {leadingAnswerData.link && (
                        <a
                          href={leadingAnswerData.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-emerald-400 hover:underline ml-auto"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border/30 pt-2 text-center">
                  <p className="text-xs text-muted-foreground mb-1.5">No answers yet</p>
                  <Button size="sm" className="h-7 text-xs" onClick={() => setShowProposeModal(true)}>
                    <Plus className="mr-1 h-3 w-3" />
                    Propose First Answer
                  </Button>
                </div>
              )}
            </div>

            {/* Question Creator - moved from sidebar */}
            <div className="border-t border-border/30 pt-2 mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-[8px]">
                  {question.creator.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[10px]">{shortenAddress(question.creator)}</p>
                  <p className="text-[9px] text-muted-foreground">Creator • Earns 0.5% on trades</p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* RIGHT: Inline Trading Panel */}
        <Card variant="glass" className="border-emerald-500/20 flex flex-col">
          <InlineTradingPanel
            answers={sortedAnswers}
            onSuccess={handleTradeSuccess}
            onProposeNew={question.isActive ? () => setShowProposeModal(true) : undefined}
            proposalStake={5_000_000n}
          />
        </Card>
      </div>

      {/* ========== MARKET OVERVIEW ROW ========== */}
      <Card variant="glass" className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold">Market Overview</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Market Stats */}
            <div className="bg-muted/30 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Total Market Cap</div>
              <div className="text-base font-bold text-emerald-400">{formatUSDC(totalMarketCap)}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Activity className="h-2.5 w-2.5" />
                Volume
              </div>
              <div className="text-base font-bold">{formatUSDC(question.totalVolume)}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Coins className="h-2.5 w-2.5" />
                Total Shares
              </div>
              <div className="text-base font-bold">{formatShares(marketStats.totalShares)}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                Holders
              </div>
              <div className="text-base font-bold">{Number(marketStats.totalHolders)}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Answers</div>
              <div className="text-base font-bold">{answers.length}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Price Range</div>
              <div className="text-sm font-bold">
                {formatSharePrice(marketStats.lowestPrice)} - {formatSharePrice(marketStats.highestPrice)}
              </div>
            </div>
          </div>
          {/* Chart */}
          <div className="mt-3 pt-3 border-t border-border/30">
            <TotalMarketCapChart
              answerIds={answerIds || []}
              currentTotalMarketCap={totalMarketCap}
              height={120}
            />
          </div>
        </CardContent>
      </Card>

      {/* ========== ANSWERS SECTION (3-Column Grid) ========== */}
      <div>
        <h2 className="text-sm font-semibold mb-2">All Answers ({answers.length})</h2>

        {sortedAnswers.length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-6 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <h3 className="mb-1 font-medium text-sm">No answers yet</h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Be the first to propose an answer!
              </p>
              {question.isActive && (
                <Button size="sm" onClick={() => setShowProposeModal(true)}>
                  <Plus className="mr-1 h-3 w-3" />
                  Propose Answer ($5)
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* ========== MODALS ========== */}
      {question && (
        <ProposeAnswerModal
          open={showProposeModal}
          onOpenChange={setShowProposeModal}
          question={question}
          existingAnswers={answers}
          onSuccess={() => {
            refetchAnswers();
            refetchQuestion();
            setShowProposeModal(false);
          }}
        />
      )}

      {/* Mobile Trading Sheet */}
      {isMobile && buyingAnswer && (
        <MobileTradingSheet
          open={!!buyingAnswer}
          onOpenChange={(open) => !open && setBuyingAnswer(null)}
          answer={buyingAnswer}
          mode="buy"
          onSuccess={handleTradeSuccess}
        />
      )}

      {isMobile && sellingAnswer && positions[sellingAnswer.id.toString()] && (
        <MobileTradingSheet
          open={!!sellingAnswer}
          onOpenChange={(open) => !open && setSellingAnswer(null)}
          answer={sellingAnswer}
          mode="sell"
          position={positions[sellingAnswer.id.toString()]}
          onSuccess={handleTradeSuccess}
        />
      )}

      {/* Desktop Trading Modals */}
      {!isMobile && buyingAnswer && (
        <BuySharesModal
          open={!!buyingAnswer}
          onOpenChange={(open) => !open && setBuyingAnswer(null)}
          answer={buyingAnswer}
          onSuccess={handleTradeSuccess}
        />
      )}

      {!isMobile && sellingAnswer && positions[sellingAnswer.id.toString()] && (
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
