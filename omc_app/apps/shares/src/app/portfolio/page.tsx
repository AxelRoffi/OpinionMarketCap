'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { BuySharesModal, SellSharesModal } from '@/components/trading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserPositions, useAccumulatedFees, useClaimFees, useQuestions, useAnswers } from '@/hooks';
import { formatUSDC, formatSharePrice, formatShares, shortenAddress } from '@/lib/utils';
import type { Answer, UserPosition } from '@/lib/contracts';

interface PositionWithAnswer {
  answer: Answer;
  position: UserPosition;
  questionText: string;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

  // Fetch all questions to get all answer IDs
  const { questions, isLoading: isLoadingQuestions } = useQuestions({ limit: 100 });

  // Get all answer IDs from all questions
  const allAnswerIds = questions.flatMap((q) => {
    const count = Number(q.answerCount);
    // Generate answer IDs based on count - this is a simplification
    // In reality, we'd need to fetch actual answer IDs
    return [];
  });

  // Accumulated fees
  const { accumulatedFees: fees, isLoading: isLoadingFees, refetch: refetchFees } = useAccumulatedFees(address);
  const { claim, isPending: isClaimingFees, isSuccess: claimSuccess } = useClaimFees({
    onSuccess: () => {
      refetchFees();
    },
  });

  // Modal states
  const [buyingAnswer, setBuyingAnswer] = useState<Answer | null>(null);
  const [sellingAnswer, setSellingAnswer] = useState<Answer | null>(null);
  const [sellingPosition, setSellingPosition] = useState<UserPosition | undefined>(undefined);

  // Mock positions for now - in production, we'd need to track this
  const positions: PositionWithAnswer[] = [];
  const isLoadingPositions = isLoadingQuestions;

  // Calculate portfolio stats
  const totalValue = positions.reduce((sum, p) => sum + p.position.currentValue, 0n);
  const totalCostBasis = positions.reduce((sum, p) => sum + p.position.costBasis, 0n);
  const totalPnL = positions.reduce((sum, p) => sum + p.position.profitLoss, 0n);
  const isProfitable = totalPnL > 0n;

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="py-12 text-center">
          <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-medium">Connect your wallet</h3>
          <p className="mb-4 text-muted-foreground">
            Connect your wallet to view your portfolio and positions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold animate-fade-in-up">Portfolio</h1>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Value */}
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">{formatUSDC(totalValue)}</div>
            </CardContent>
          </Card>

          {/* Total P&L */}
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center gap-1 text-2xl font-bold ${
                  isProfitable ? 'text-green-500' : totalPnL < 0n ? 'text-red-500' : ''
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="h-5 w-5" />
                ) : totalPnL < 0n ? (
                  <TrendingDown className="h-5 w-5" />
                ) : null}
                {isProfitable ? '+' : ''}
                {formatUSDC(totalPnL)}
              </div>
            </CardContent>
          </Card>

          {/* Positions Count */}
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positions.length}</div>
            </CardContent>
          </Card>

          {/* Claimable Fees */}
          <Card variant="glass" className={fees > 0n ? 'glow-primary-sm' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Claimable Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">{formatUSDC(fees)}</div>
                {fees > 0n && (
                  <Button size="sm" onClick={claim} disabled={isClaimingFees} className="animate-pulse-glow">
                    {isClaimingFees ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Claim'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions List */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Your Positions</h2>

          {isLoadingPositions ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-48 rounded-lg animate-shimmer" />
                        <div className="h-6 w-32 rounded-lg animate-shimmer delay-75" />
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="h-4 w-24 rounded-lg animate-shimmer delay-100" />
                        <div className="h-6 w-20 rounded-lg animate-shimmer delay-150" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : positions.length === 0 ? (
            <Card variant="glass">
              <CardContent className="py-12 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">No positions yet</h3>
                <p className="mb-4 text-muted-foreground">
                  Start trading by buying shares in answers you believe will become popular.
                </p>
                <Link href="/">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Browse Questions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {positions.map((item) => {
                const isProfitable = item.position.profitLoss > 0n;
                return (
                  <Card key={item.answer.id.toString()} variant="glass" className="interactive-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Answer Info */}
                        <div className="flex-1">
                          <Link
                            href={`/questions/${item.answer.questionId}`}
                            className="mb-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {item.questionText}
                          </Link>
                          <h3 className="text-lg font-medium">{item.answer.text}</h3>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatShares(item.position.shares)} shares</span>
                            <span>@ {formatSharePrice(item.answer.pricePerShare)}/share</span>
                          </div>
                        </div>

                        {/* Position Value */}
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Value</div>
                          <div className="text-lg font-bold">
                            {formatUSDC(item.position.currentValue)}
                          </div>
                          <div
                            className={`text-sm ${
                              isProfitable
                                ? 'text-green-500'
                                : item.position.profitLoss < 0n
                                ? 'text-red-500'
                                : ''
                            }`}
                          >
                            {isProfitable ? '+' : ''}
                            {formatUSDC(item.position.profitLoss)} P&L
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setBuyingAnswer(item.answer)}
                            >
                              Buy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSellingAnswer(item.answer);
                                setSellingPosition(item.position);
                              }}
                            >
                              Sell
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity History */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <Card variant="glass">
            <CardContent className="py-8 text-center text-muted-foreground">
              Activity history coming soon...
            </CardContent>
          </Card>
        </div>

        {/* Buy Modal */}
        {buyingAnswer && (
          <BuySharesModal
            open={!!buyingAnswer}
            onOpenChange={(open) => !open && setBuyingAnswer(null)}
            answer={buyingAnswer}
            onSuccess={() => {
              setBuyingAnswer(null);
            }}
          />
        )}

        {/* Sell Modal */}
        {sellingAnswer && (
          <SellSharesModal
            open={!!sellingAnswer}
            onOpenChange={(open) => !open && setSellingAnswer(null)}
            answer={sellingAnswer}
            position={sellingPosition!}
            onSuccess={() => {
              setSellingAnswer(null);
              setSellingPosition(undefined);
            }}
          />
        )}
      </div>
  );
}
