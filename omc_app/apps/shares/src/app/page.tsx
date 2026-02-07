'use client';

import { useState } from 'react';
import { TrendingUp, Plus, Wallet, Search } from 'lucide-react';
import { GlobalNavbar } from '@/components/layout';
import { QuestionCard, QuestionCardSkeleton } from '@/components/questions';
import { CreateQuestionModal } from '@/components/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuestions } from '@/hooks';
import { formatUSDC } from '@/lib/utils';

type SortOption = 'hot' | 'new' | 'top';

export default function HomePage() {
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { questions, totalQuestions, isLoading, refetch } = useQuestions({ limit: 50 });

  // Filter questions by search
  const filteredQuestions = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return b.createdAt - a.createdAt;
      case 'top':
        return Number(b.totalVolume - a.totalVolume);
      case 'hot':
      default:
        // Hot = combination of volume and recency
        const aScore = Number(a.totalVolume) / (Date.now() / 1000 - a.createdAt + 3600);
        const bScore = Number(b.totalVolume) / (Date.now() / 1000 - b.createdAt + 3600);
        return bScore - aScore;
    }
  });

  // Calculate stats
  const totalVolume = questions.reduce((sum, q) => sum + q.totalVolume, 0n);
  const totalAnswers = questions.reduce((sum, q) => sum + q.answerCount, 0n);

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavbar />

      {/* Hero Section */}
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Trade Opinions Like Stocks
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Buy shares in answers you believe will become popular.
            Sell anytime. The most popular answer leads.
          </p>

          {/* Quick Stats */}
          <div className="mb-8 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{formatUSDC(totalVolume)}</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold">{Number(totalAnswers)}</div>
              <div className="text-sm text-muted-foreground">Answers</div>
            </div>
          </div>

          {/* CTA Button */}
          <Button size="lg" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Create Question ($2)
          </Button>
        </div>
      </section>

      {/* Questions Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search & Sort */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['hot', 'new', 'top'] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Questions Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedQuestions.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No questions yet</h3>
            <p className="mb-4 text-muted-foreground">
              Be the first to create a question and start trading opinions.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Question
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedQuestions.map((question) => (
              <QuestionCard key={question.id.toString()} question={question} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="border-t border-border/40 bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-semibold">How It Works</h2>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">1. Create or Propose</h3>
              <p className="text-sm text-muted-foreground">
                Create a question ($2) or propose an answer ($5 stake becomes your first shares)
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">2. Buy & Sell Shares</h3>
              <p className="text-sm text-muted-foreground">
                Buy shares in answers you believe will gain popularity. Price goes up when more people buy.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">3. Sell Anytime</h3>
              <p className="text-sm text-muted-foreground">
                Sell your shares back to the pool anytime. No need to find a buyer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Answer Shares - Trade opinions like memecoins</p>
          <p className="mt-2">Built on Base</p>
        </div>
      </footer>

      {/* Create Question Modal */}
      <CreateQuestionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          refetch();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
