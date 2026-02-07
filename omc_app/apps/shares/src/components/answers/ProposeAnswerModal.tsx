'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProposeAnswer } from '@/hooks/useProposeAnswer';
import { formatUSDC } from '@/lib/utils';
import type { Question } from '@/lib/contracts';

interface ProposeAnswerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  onSuccess?: (answerId: bigint) => void;
}

const MAX_ANSWER_LENGTH = 200;

export function ProposeAnswerModal({
  open,
  onOpenChange,
  question,
  onSuccess,
}: ProposeAnswerModalProps) {
  const { isConnected } = useAccount();
  const [answerText, setAnswerText] = useState('');

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
      }, 2000);
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handlePropose = async () => {
    if (!answerText.trim()) return;
    await propose(question.id, answerText.trim());
  };

  const isValid = answerText.trim().length > 0 && answerText.length <= MAX_ANSWER_LENGTH;

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

        <div className="space-y-6 py-4">
          {/* Answer Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="answer">Your Answer</Label>
              <span className={`text-xs ${answerText.length > MAX_ANSWER_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {answerText.length}/{MAX_ANSWER_LENGTH}
              </span>
            </div>
            <Textarea
              id="answer"
              placeholder="Enter your answer to this question..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isPending}
              rows={3}
              maxLength={MAX_ANSWER_LENGTH + 10}
            />
            <p className="text-xs text-muted-foreground">
              Be clear and concise. Great answers attract more buyers.
            </p>
          </div>

          {/* Stake Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Proposal Stake</span>
              <span className="font-medium">
                {proposalStake ? formatUSDC(proposalStake) : '$5.00'}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your stake is converted to initial shares, making you the first holder of your answer.
            </p>
          </div>

          {/* What You Get */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h4 className="font-medium text-primary">What you get:</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Initial shares of your answer</li>
              <li>• 0.5% creator fee on all trades</li>
              <li>• Your answer competes for #1 spot</li>
            </ul>
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
            disabled={!isConnected || isPending || !isValid || !hasEnoughBalance}
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
            ) : (
              `Propose Answer for ${proposalStake ? formatUSDC(proposalStake) : '$5.00'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
