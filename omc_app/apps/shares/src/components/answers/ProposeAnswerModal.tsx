'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, AlertCircle, CheckCircle2, MessageSquare, AlertTriangle, Info, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProposeAnswer } from '@/hooks/useProposeAnswer';
import { formatUSDC, findSimilarAnswers } from '@/lib/utils';
import type { Question, Answer } from '@/lib/contracts';

interface ProposeAnswerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  existingAnswers?: Answer[];
  onSuccess?: (answerId: bigint) => void;
}

const MAX_ANSWER_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 280;
const MAX_LINK_LENGTH = 200;
const SIMILARITY_THRESHOLD = 0.7;

export function ProposeAnswerModal({
  open,
  onOpenChange,
  question,
  existingAnswers = [],
  onSuccess,
}: ProposeAnswerModalProps) {
  const { isConnected } = useAccount();
  const [answerText, setAnswerText] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  const {
    propose,
    reset,
    error,
    proposalStake,
    isApproving,
    isProposing,
    isPending,
    isSuccess,
    hasEnoughBalance,
  } = useProposeAnswer({
    onSuccess: (answerId) => {
      onSuccess?.(answerId);
      setTimeout(() => {
        onOpenChange(false);
        reset();
        setAnswerText('');
        setDescription('');
        setLink('');
      }, 2000);
    },
  });

  // Check for duplicate/similar answers
  const similarAnswers = useMemo(() => {
    if (answerText.trim().length < 2) return [];
    return findSimilarAnswers(answerText, existingAnswers, SIMILARITY_THRESHOLD);
  }, [answerText, existingAnswers]);

  const hasDuplicate = similarAnswers.length > 0;
  const isExactDuplicate = similarAnswers.some(s => s.score >= 0.95);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      reset();
      setAnswerText('');
      setDescription('');
      setLink('');
    }
  }, [open, reset]);

  const handlePropose = async () => {
    if (!answerText.trim()) return;
    await propose(question.id, answerText.trim(), description.trim(), link.trim());
  };

  const isValid =
    answerText.trim().length > 0 &&
    answerText.length <= MAX_ANSWER_LENGTH &&
    description.length <= MAX_DESCRIPTION_LENGTH &&
    link.length <= MAX_LINK_LENGTH &&
    !isExactDuplicate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Propose an Answer
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {question.text}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Answer Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="answer">Your Answer</Label>
              <span className={`text-xs ${answerText.length > MAX_ANSWER_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {answerText.length}/{MAX_ANSWER_LENGTH}
              </span>
            </div>
            <Input
              id="answer"
              placeholder="e.g., Base, Arbitrum, Optimism..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isPending || isSuccess}
              maxLength={MAX_ANSWER_LENGTH}
              className={hasDuplicate ? 'border-orange-500 focus-visible:ring-orange-500' : ''}
            />
          </div>

          {/* Duplicate Warning */}
          {hasDuplicate && (
            <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              isExactDuplicate
                ? 'bg-destructive/10 text-destructive'
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }`}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">
                  {isExactDuplicate ? 'This answer already exists!' : 'Similar answer found'}
                </p>
                <p className="mt-1 text-xs opacity-90">
                  Existing: &quot;{similarAnswers[0].text}&quot;
                </p>
                {!isExactDuplicate && (
                  <p className="mt-1 text-xs opacity-75">
                    Consider if your answer is different enough to add value.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Description (optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Why this answer? (optional)</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Explain your reasoning to convince others..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending || isSuccess}
              rows={2}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
          </div>

          {/* Link (optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                <Label htmlFor="link">Evidence Link (optional)</Label>
              </div>
              <span className="text-xs text-muted-foreground">
                {link.length}/{MAX_LINK_LENGTH}
              </span>
            </div>
            <Input
              id="link"
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={isPending || isSuccess}
              maxLength={MAX_LINK_LENGTH}
            />
          </div>

          {/* How It Works - UX Explanation */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">How Answer Shares Work</h4>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Your $5 stake buys you the first 5 shares at $1 each</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Others can buy shares → price goes up → your shares gain value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>You earn 0.5% of every trade on your answer forever</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Sell anytime to cash out your gains (or losses)</span>
              </li>
            </ul>
          </div>

          {/* Stake Info */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Stake</span>
              <span className="font-bold text-primary">
                {proposalStake ? formatUSDC(proposalStake) : '$5.00'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>You receive</span>
              <span>5 shares @ $1.00 each</span>
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
              <span>Answer proposed successfully!</span>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handlePropose}
            disabled={!isConnected || isPending || !isValid || !hasEnoughBalance || isSuccess}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApproving ? 'Approving USDC...' : 'Proposing Answer...'}
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !hasEnoughBalance ? (
              'Insufficient Balance'
            ) : isExactDuplicate ? (
              'Answer Already Exists'
            ) : (
              `Propose Answer for ${proposalStake ? formatUSDC(proposalStake) : '$5.00'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
