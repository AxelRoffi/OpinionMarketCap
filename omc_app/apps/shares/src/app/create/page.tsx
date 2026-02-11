'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Link as LinkIcon,
  Tag,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateQuestionWithAnswer, useChainSwitch } from '@/hooks';
import { CATEGORIES } from '@/lib/contracts';

const MAX_QUESTION_LENGTH = 100;
const MAX_ANSWER_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 280;
const MAX_LINK_LENGTH = 200;

export default function CreateQuestionPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isCorrectChain, switchToTargetChain, isSwitching, targetChainName } = useChainSwitch();

  // Question fields (simple)
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState<string>(''); // Empty by default - user must select

  // Answer fields (with context)
  const [answerText, setAnswerText] = useState('');
  const [answerDescription, setAnswerDescription] = useState('');
  const [answerLink, setAnswerLink] = useState('');

  const {
    create,
    reset,
    status,
    error,
    isPending,
    isSuccess,
    totalCost,
  } = useCreateQuestionWithAnswer({
    onSuccess: () => {
      setTimeout(() => {
        router.push('/');
      }, 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !answerText.trim()) return;
    await create(
      questionText.trim(),
      category,
      answerText.trim(),
      answerDescription.trim(),
      answerLink.trim()
    );
  };

  const isValid =
    questionText.trim().length >= 5 &&
    questionText.length <= MAX_QUESTION_LENGTH &&
    category !== '' && // Category must be selected
    answerText.trim().length >= 1 &&
    answerText.length <= MAX_ANSWER_LENGTH;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Questions
      </Link>

      {/* How It Works - Expanded Explanation */}
      <Card variant="glass" className="mb-6 animate-fade-in-up">
        <CardContent className="p-4">
          <details className="group" open>
            <summary className="flex cursor-pointer items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                How does this work?
              </div>
              <span className="text-xs text-muted-foreground">Click to collapse</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 text-sm font-medium">📝 Questions</div>
                <p className="text-xs text-muted-foreground">
                  You ask a debatable question. This becomes a tradeable topic where people can propose and trade on different answers.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 text-sm font-medium">💡 Answers</div>
                <p className="text-xs text-muted-foreground">
                  Each answer has its own market. You stake $5 to propose an answer and receive 5 shares at $1 each.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 text-sm font-medium">📈 Trading</div>
                <p className="text-xs text-muted-foreground">
                  Others can buy shares in answers they believe in. More buyers = higher price. Sell anytime to profit (or cut losses).
                </p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="mb-2 text-sm font-medium text-primary">💰 Earn Forever</div>
                <p className="text-xs text-muted-foreground">
                  As the question creator, you earn 0.5% of all trading volume on ALL answers to your question. Forever.
                </p>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card variant="glass" className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-gradient">Create a Question</CardTitle>
          <CardDescription>
            Ask a question and propose the first answer. Your answer becomes tradeable shares.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* === QUESTION SECTION === */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Your Question
              </h3>

              {/* Question Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="question">Question</Label>
                  <span className="text-sm text-muted-foreground">
                    {questionText.length}/{MAX_QUESTION_LENGTH}
                  </span>
                </div>
                <Input
                  id="question"
                  placeholder="What's the best L2 for DeFi?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  maxLength={MAX_QUESTION_LENGTH}
                  disabled={isPending || isSuccess}
                />
                <p className="text-sm text-muted-foreground">
                  Keep it simple, specific, and debatable.
                </p>
              </div>

              {/* Category - Required */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <Label>Category</Label>
                    <span className="text-xs text-red-400">*required</span>
                  </div>
                  {!category && (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Please select a category
                    </span>
                  )}
                </div>
                <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 rounded-lg border ${
                  !category ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50 bg-muted/20'
                }`}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      disabled={isPending || isSuccess}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                        category === cat
                          ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30'
                          : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted'
                      } disabled:opacity-50`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose the category that best fits your question. This helps traders discover it.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">Your First Answer</span>
              </div>
            </div>

            {/* === ANSWER SECTION === */}
            <div className="space-y-4">
              {/* Answer Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <Label htmlFor="answer">Your Answer</Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {answerText.length}/{MAX_ANSWER_LENGTH}
                  </span>
                </div>
                <Input
                  id="answer"
                  placeholder="Base"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  maxLength={MAX_ANSWER_LENGTH}
                  disabled={isPending || isSuccess}
                />
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive 5 shares at $1 each for staking this answer.
                </p>
              </div>

              {/* Answer Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Why this answer? (optional)</Label>
                  <span className="text-sm text-muted-foreground">
                    {answerDescription.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Base has the lowest fees, best developer tools, and strongest ecosystem growth..."
                  value={answerDescription}
                  onChange={(e) => setAnswerDescription(e.target.value)}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={3}
                  disabled={isPending || isSuccess}
                />
                <p className="text-xs text-muted-foreground">
                  Explain your reasoning to convince others to buy shares in your answer.
                </p>
              </div>

              {/* Answer Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="link">Evidence Link (optional)</Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {answerLink.length}/{MAX_LINK_LENGTH}
                  </span>
                </div>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com/why-base-is-best"
                  value={answerLink}
                  onChange={(e) => setAnswerLink(e.target.value)}
                  maxLength={MAX_LINK_LENGTH}
                  disabled={isPending || isSuccess}
                />
                <p className="text-xs text-muted-foreground">
                  Link to data, articles, or sources that support your answer.
                </p>
              </div>
            </div>

            {/* Fee Info */}
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Total Cost: $7 USDC</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• $2 question creation fee</li>
                    <li>• $5 answer stake (you receive 5 shares)</li>
                  </ul>
                  <p className="mt-2 text-muted-foreground">
                    As the question creator, you earn 0.5% of all trading volume.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Question and answer created successfully! Redirecting...
                </span>
              </div>
            )}

            {/* Submit Button */}
            {isConnected && !isCorrectChain ? (
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={switchToTargetChain}
                disabled={isSwitching}
              >
                {isSwitching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Switching Network...
                  </>
                ) : (
                  `Switch to ${targetChainName}`
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!isConnected || !isValid || isPending || isSuccess}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Created!
                  </>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question + Answer ($7)
                  </>
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">💡 Tips for success</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium">Be specific</p>
                <p className="text-xs text-muted-foreground">
                  &quot;Best DEX on Base?&quot; beats &quot;Best DEX?&quot;
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium">Make it debatable</p>
                <p className="text-xs text-muted-foreground">
                  Controversial questions get more trades
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium">Back it up</p>
                <p className="text-xs text-muted-foreground">
                  Add links and reasoning to convince traders
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium">Stake = conviction</p>
                <p className="text-xs text-muted-foreground">
                  Your 5 shares show you believe in your answer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
