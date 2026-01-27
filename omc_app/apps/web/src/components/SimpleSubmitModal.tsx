'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts';
import { formatQuestion } from '@/lib/format-utils';

interface SimpleSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  opinionId: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
}

export default function SimpleSubmitModal({
  isOpen,
  onClose,
  opinionId,
  question,
  currentAnswer,
  nextPrice
}: SimpleSubmitModalProps) {
  const [answer, setAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<'form' | 'approve' | 'submit' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const { address } = useAccount();

  // Format USDC for display
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000;
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Check USDC allowance
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
    query: { enabled: !!address }
  });

  // Check USDC balance
  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // USDC approval transaction
  const { 
    writeContract: approveUSDC, 
    data: approveHash
  } = useWriteContract();

  // Submit answer transaction
  const { 
    writeContract: submitAnswer, 
    data: submitHash
  } = useWriteContract();

  // Wait for approval transaction
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for submit transaction
  const { isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({
    hash: submitHash,
  });

  // Check if we need approval
  const needsApproval = allowance ? allowance < nextPrice : true;
  const hasBalance = balance ? balance >= nextPrice : false;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setErrorMessage('Please enter your answer');
      return;
    }

    if (!hasBalance) {
      setErrorMessage('Insufficient USDC balance');
      setStep('error');
      return;
    }

    try {
      if (needsApproval) {
        setStep('approve');
        await approveUSDC({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.OPINION_CORE, nextPrice],
        });
      } else {
        setStep('submit');
        await submitAnswer({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'submitAnswer',
          args: [BigInt(opinionId), answer, description || '', ''],
        });
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Transaction failed');
      setStep('error');
    }
  };

  // Auto-advance after approval
  if (isApproveSuccess && step === 'approve') {
    setStep('submit');
    submitAnswer({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'submitAnswer',
      args: [BigInt(opinionId), answer, description || '', ''],
    });
  }

  // Handle success
  if (isSubmitSuccess && step === 'submit') {
    setStep('success');
  }

  const handleClose = () => {
    setAnswer('');
    setDescription('');
    setStep('form');
    setErrorMessage('');
    onClose();
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step === 'form') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  return (
    <>
      {/* Portal-like backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          
          {step === 'form' && (
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Submit Your Answer</h1>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Question */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="text-sm text-emerald-500 mb-2">Question #{opinionId}</div>
                <div className="text-foreground font-semibold mb-2">{formatQuestion(question)}</div>
                <div className="text-sm text-muted-foreground">
                  Current: <span className="text-foreground">{currentAnswer}</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-semibold">Price:</span>
                  <span className="text-emerald-400 font-bold text-xl">{formatUSDC(nextPrice)}</span>
                </div>
                {!hasBalance && (
                  <div className="text-red-400 text-sm mt-2">
                    Insufficient USDC balance
                  </div>
                )}
              </div>

              {/* Payment Distribution */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="text-xs font-semibold text-gray-400 mb-3">Where your payment goes:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-emerald-400">Previous Owner</span>
                      <span className="text-gray-500 text-xs ml-1">(instant)</span>
                    </div>
                    <span className="text-emerald-400">{formatUSDC(nextPrice * BigInt(95) / BigInt(100))} (95%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-purple-400">Creator Royalty</span>
                      <span className="text-gray-500 text-xs ml-1">(claimable)</span>
                    </div>
                    <span className="text-purple-400">{formatUSDC(nextPrice * BigInt(3) / BigInt(100))} (3%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Platform Fee</span>
                    <span className="text-gray-400">{formatUSDC(nextPrice * BigInt(2) / BigInt(100))} (2%)</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Your Answer *
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full bg-muted border border-border rounded-lg px-3 py-3 text-foreground placeholder-muted-foreground focus:border-emerald-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add context..."
                    className="w-full bg-muted border border-border rounded-lg px-3 py-3 text-foreground placeholder-muted-foreground focus:border-emerald-500 resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6">
                  <div className="text-red-400">{errorMessage}</div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || !hasBalance}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {needsApproval ? 'Approve & Submit' : 'Submit Answer'}
                </button>
              </div>
            </div>
          )}

          {(step === 'approve' || step === 'submit') && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {step === 'approve' ? 'Approving USDC...' : 'Submitting Answer...'}
              </h2>
              <p className="text-muted-foreground">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Success!</h2>
              <p className="text-muted-foreground mb-6">Your answer has been submitted!</p>
              <button
                onClick={handleClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <div className="flex space-x-4">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-border text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}