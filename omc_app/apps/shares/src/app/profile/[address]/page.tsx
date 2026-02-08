'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  TrendingUp,
  MessageSquare,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { GlobalNavbar } from '@/components/layout';
import { QuestionCard, QuestionCardSkeleton } from '@/components/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuestionsByCreator, useAccumulatedFees } from '@/hooks';
import { formatUSDC, shortenAddress } from '@/lib/utils';

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as `0x${string}`;
  const [copied, setCopied] = useState(false);

  const { questions, isLoading: isLoadingQuestions } = useQuestionsByCreator(address);
  const { accumulatedFees: fees } = useAccumulatedFees(address);

  // Calculate stats
  const totalVolume = questions.reduce((sum, q) => sum + q.totalVolume, 0n);
  const totalAnswers = questions.reduce((sum, q) => sum + q.answerCount, 0n);

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <Card variant="glass" className="mb-8 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 glow-primary-sm">
                <User className="h-8 w-8 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h1 className="text-xl font-bold">{shortenAddress(address)}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{questions.length} questions created</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{formatUSDC(totalVolume)} total volume</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{Number(totalAnswers)} answers received</span>
                  </div>
                </div>
              </div>

              {/* Accumulated Fees */}
              {fees > 0n && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Earned Fees</div>
                  <div className="text-lg font-bold text-primary">{formatUSDC(fees)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="questions">
          <TabsList className="mb-6">
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions">
            {isLoadingQuestions ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <QuestionCardSkeleton key={i} />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <Card variant="glass">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium">No questions created</h3>
                  <p className="text-muted-foreground">
                    This user hasn&apos;t created any questions yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {questions.map((question) => (
                  <QuestionCard key={question.id.toString()} question={question} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions">
            <Card variant="glass">
              <CardContent className="py-12 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">Positions</h3>
                <p className="text-muted-foreground">
                  Position tracking coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card variant="glass">
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">Activity History</h3>
                <p className="text-muted-foreground">
                  Activity tracking coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
