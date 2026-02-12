'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress } from 'viem';
import { Send, Loader2, Check, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ANSWER_SHARES_CORE_ABI, getContracts } from '@/lib/contracts';
import { useChainId } from 'wagmi';

interface TransferQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: bigint;
  questionText: string;
  onSuccess?: () => void;
}

export function TransferQuestionModal({
  isOpen,
  onClose,
  questionId,
  questionText,
  onSuccess,
}: TransferQuestionModalProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipient('');
      setError('');
    }
  }, [isOpen]);

  // Transfer transaction
  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const validateRecipient = (addr: string): string | null => {
    if (!addr) return 'Please enter a recipient address';
    if (!isAddress(addr)) return 'Invalid Ethereum address';
    if (addr.toLowerCase() === address?.toLowerCase()) {
      return 'Cannot transfer to yourself';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateRecipient(recipient);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    try {
      writeContract({
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'transferQuestionOwnership',
        args: [questionId, recipient as `0x${string}`],
      });
    } catch (err) {
      console.error('Transfer error:', err);
      setError('Failed to transfer question');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      setTimeout(() => {
        reset();
        onClose();
      }, 2000);
    }
  }, [isSuccess, onSuccess, onClose, reset]);

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Transfer Question Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer this question to another wallet for free
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Question #{questionId.toString()}</p>
            <p className="text-foreground font-medium">{questionText}</p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-400">
                <p className="font-medium">Free Transfer</p>
                <p className="text-blue-400/80">
                  No fees are charged. The new owner will receive all future creator fees from trading activity.
                </p>
              </div>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setError('');
              }}
              className="font-mono text-sm"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-400">Transfer successful!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !recipient}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isPending ? 'Confirm in wallet...' : 'Processing...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
