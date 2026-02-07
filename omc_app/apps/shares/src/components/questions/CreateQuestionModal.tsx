'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
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
import { useCreateQuestion } from '@/hooks/useCreateQuestion';
import { formatUSDC } from '@/lib/utils';

interface CreateQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (questionId: bigint) => void;
}

const MAX_QUESTION_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;

export function CreateQuestionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateQuestionModalProps) {
  const { isConnected } = useAccount();
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');

  const {
    create,
    reset,
    error,
    creationFee,
    isApproving,
    isCreating,
    isPending,
    isSuccess,
    hasEnoughBalance,
  } = useCreateQuestion({
    onSuccess: (questionId) => {
      onSuccess?.(questionId);
      setTimeout(() => {
        onOpenChange(false);
        reset();
        setText('');
        setDescription('');
      }, 2000);
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleCreate = async () => {
    if (!text.trim()) return;
    await create(text.trim(), description.trim());
  };

  const isValid = text.trim().length > 0 && text.length <= MAX_QUESTION_LENGTH;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Create a Question
          </DialogTitle>
          <DialogDescription>
            Ask a question for the community to answer. The best answers rise to the top.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="question">Question</Label>
              <span className={`text-xs ${text.length > MAX_QUESTION_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {text.length}/{MAX_QUESTION_LENGTH}
              </span>
            </div>
            <Input
              id="question"
              placeholder="What's the best programming language for beginners?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPending}
              maxLength={MAX_QUESTION_LENGTH + 10}
            />
            <p className="text-xs text-muted-foreground">
              Keep it clear and specific for better answers.
            </p>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description (optional)</Label>
              <span className={`text-xs ${description.length > MAX_DESCRIPTION_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Add context or details to help others understand your question..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              maxLength={MAX_DESCRIPTION_LENGTH + 10}
            />
          </div>

          {/* Fee Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Creation Fee</span>
              <span className="font-medium">
                {creationFee ? formatUSDC(creationFee) : '$2.00'}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This fee helps prevent spam and rewards you as the question creator.
            </p>
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
              <span>Question created successfully!</span>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreate}
            disabled={!isConnected || isPending || !isValid || !hasEnoughBalance}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApproving ? 'Approving USDC...' : 'Creating Question...'}
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !hasEnoughBalance ? (
              'Insufficient Balance'
            ) : (
              `Create Question for ${creationFee ? formatUSDC(creationFee) : '$2.00'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
