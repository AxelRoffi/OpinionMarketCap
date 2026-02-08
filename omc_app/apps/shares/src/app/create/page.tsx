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
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateQuestion } from '@/hooks';
import { CATEGORIES } from '@/lib/contracts';

const MAX_QUESTION_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LINK_LENGTH = 256;

export default function CreateQuestionPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<string>('Other');

  const [createdQuestionId, setCreatedQuestionId] = useState<bigint | null>(null);

  const {
    create,
    reset,
    status,
    error,
    isPending,
    isSuccess,
  } = useCreateQuestion({
    onSuccess: (id) => {
      setCreatedQuestionId(id);
      // Navigate to home after a short delay (can't get exact ID without event parsing)
      setTimeout(() => {
        router.push('/');
      }, 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await create(text.trim(), description.trim(), link.trim(), category);
  };

  const isValid = text.trim().length > 0 && text.length <= MAX_QUESTION_LENGTH;

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

        <Card variant="glass" className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-gradient">Create a Question</CardTitle>
            <CardDescription>
              Ask a question that people can propose answers to and trade shares on.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="question">Question</Label>
                  <span className="text-sm text-muted-foreground">
                    {text.length}/{MAX_QUESTION_LENGTH}
                  </span>
                </div>
                <Input
                  id="question"
                  placeholder="What's the best L2 for DeFi?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={MAX_QUESTION_LENGTH}
                  disabled={isPending || isSuccess}
                />
                <p className="text-sm text-muted-foreground">
                  Make it clear, specific, and debatable.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description (optional)</Label>
                  <span className="text-sm text-muted-foreground">
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Add context or criteria for answers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={4}
                  disabled={isPending || isSuccess}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="category">Category</Label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      disabled={isPending || isSuccess}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                        category === cat
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      } disabled:opacity-50`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* External Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="link">External Link (optional)</Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {link.length}/{MAX_LINK_LENGTH}
                  </span>
                </div>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com/relevant-article"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  maxLength={MAX_LINK_LENGTH}
                  disabled={isPending || isSuccess}
                />
                <p className="text-xs text-muted-foreground">
                  Add a link to relevant context, article, or source.
                </p>
              </div>

              {/* Fee Info */}
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Creation Fee: $2 USDC</p>
                    <p className="mt-1 text-muted-foreground">
                      As the question creator, you&apos;ll earn 0.5% of all trading volume on answers to your question.
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
                    Question created successfully! Redirecting...
                  </span>
                </div>
              )}

              {/* Submit Button */}
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
                    Create Question ($2)
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Tips for good questions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span>Be specific - &quot;Best DEX on Base?&quot; is better than &quot;Best DEX?&quot;</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span>Make it debatable - questions with clear answers aren&apos;t fun to trade</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span>Keep it timely - trending topics attract more traders</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span>Add description - context helps people understand what you&apos;re asking</span>
            </li>
          </ul>
        </div>
      </div>
  );
}
