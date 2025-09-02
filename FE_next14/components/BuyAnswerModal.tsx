'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Opinion, SubmitAnswerForm } from '@/lib/types';
import { CONTRACTS, OPINION_CORE_ABI, MOCK_USDC_ABI } from '@/lib/contracts';
import { formatUSDC, cn } from '@/lib/utils';

interface BuyAnswerModalProps {
  opinion: Opinion;
  onClose: () => void;
  onSuccess: () => void;
}

const BuyAnswerModal = ({ opinion, onClose, onSuccess }: BuyAnswerModalProps) => {
  const { address } = useAccount();
  const [form, setForm] = useState<SubmitAnswerForm>({
    answer: '',
    description: '',
  });
  const [step, setStep] = useState<'form' | 'approve' | 'submit' | 'success'>('form');
  const [error, setError] = useState<string>('');

  const { writeContract: approveUSDC, data: approveHash } = useWriteContract();
  const { writeContract: submitAnswer, data: submitHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isSubmitting } = useWaitForTransactionReceipt({
    hash: submitHash,
  });

  // Handle approval success
  if (approveHash && !isApproving && step === 'approve') {
    setStep('submit');
  }

  // Handle submit success
  if (submitHash && !isSubmitting && step === 'submit') {
    setStep('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setError('');

    // Validate form
    if (!form.answer.trim()) {
      setError('Answer is required');
      return;
    }

    if (form.answer.length > 52) {
      setError('Answer must be 52 characters or less');
      return;
    }

    if (form.description.length > 120) {
      setError('Description must be 120 characters or less');
      return;
    }

    try {
      // Step 1: Approve USDC spending
      setStep('approve');
      await approveUSDC({
        address: CONTRACTS.MOCK_USDC,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.OPINION_CORE, opinion.nextPrice],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to approve USDC');
      setStep('form');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!address) return;

    try {
      await submitAnswer({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'submitAnswer',
        args: [BigInt(opinion.id), form.answer, form.description],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
      setStep('form');
    }
  };

  // Auto-submit answer after approval
  if (step === 'submit' && !isSubmitting && !submitHash) {
    handleSubmitAnswer();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'success' ? 'Answer Submitted!' : 'Submit New Answer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isApproving || isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'success' ? (
            <SuccessContent />
          ) : (
            <>
              {/* Opinion Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">{opinion.question}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Current Answer:</span> {opinion.currentAnswer}</p>
                  <p><span className="font-medium">Price to Pay:</span> {formatUSDC(opinion.nextPrice)}</p>
                  <p><span className="font-medium">Current Owner:</span> {opinion.currentAnswerOwner.slice(0, 6)}...{opinion.currentAnswerOwner.slice(-4)}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer *
                  </label>
                  <input
                    type="text"
                    value={form.answer}
                    onChange={(e) => setForm(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter your answer (max 52 characters)"
                    maxLength={52}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={step !== 'form'}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.answer.length}/52 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Explain your answer (max 120 characters)"
                    maxLength={120}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={step !== 'form'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.description.length}/120 characters
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1"
                    disabled={isApproving || isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={!form.answer.trim() || isApproving || isSubmitting || !address}
                  >
                    {getButtonText(step, isApproving, isSubmitting)}
                  </button>
                </div>
              </form>

              {/* Transaction Steps */}
              {(step === 'approve' || step === 'submit') && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-3">
                    <TransactionStep
                      label="1. Approve USDC Spending"
                      status={step === 'approve' ? 'loading' : 'completed'}
                      isActive={step === 'approve'}
                    />
                    <TransactionStep
                      label="2. Submit Answer"
                      status={step === 'submit' ? 'loading' : step === 'form' ? 'pending' : 'completed'}
                      isActive={step === 'submit'}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SuccessContent = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Answer Submitted Successfully!
    </h3>
    <p className="text-gray-600 mb-4">
      Your answer is now live and you own this opinion.
    </p>
    <div className="animate-pulse text-sm text-gray-500">
      Refreshing data...
    </div>
  </div>
);

interface TransactionStepProps {
  label: string;
  status: 'pending' | 'loading' | 'completed';
  isActive: boolean;
}

const TransactionStep = ({ label, status, isActive }: TransactionStepProps) => (
  <div className={cn("flex items-center gap-3", isActive && "font-medium")}>
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
      status === 'completed' && "bg-green-100 text-green-600",
      status === 'loading' && "bg-blue-100 text-blue-600",
      status === 'pending' && "bg-gray-100 text-gray-400"
    )}>
      {status === 'completed' ? '✓' : status === 'loading' ? '...' : '○'}
    </div>
    <span className={cn(
      "text-sm",
      status === 'completed' && "text-green-700",
      status === 'loading' && "text-blue-700",
      status === 'pending' && "text-gray-500"
    )}>
      {label}
    </span>
  </div>
);

function getButtonText(step: string, isApproving: boolean, isSubmitting: boolean): string {
  if (step === 'approve' && isApproving) return 'Approving...';
  if (step === 'submit' && isSubmitting) return 'Submitting...';
  return 'Submit Answer';
}

export default BuyAnswerModal;