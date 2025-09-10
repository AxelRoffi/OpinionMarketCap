'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts';

interface SubmitAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opinionId: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
}

export default function SubmitAnswerModal({
  isOpen,
  onClose,
  opinionId,
  question,
  currentAnswer,
  nextPrice
}: SubmitAnswerModalProps) {
  const [answer, setAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
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
      args: [BigInt(opinionId), answer, description || ''],
    });
  }

  // Handle success
  if (isSubmitSuccess && step === 'submit') {
    setStep('success');
  }

  const handleClose = () => {
    setAnswer('');
    setDescription('');
    setLink('');
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
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          if (step === 'form') {
            handleClose();
          }
        }}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-gray-900 rounded-2xl border border-gray-600 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center">
            <div className="text-3xl">💭</div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Change the Narrative</h1>
          <p className="text-lg text-gray-300 mb-2">Submit your answer and become the opinion owner</p>
          <p className="text-sm text-gray-400">Your answer will replace the current one if your transaction succeeds</p>
        </div>

        {step === 'form' && (
          <>
            {/* Question Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Question #{opinionId}</span>
                <span className="text-xs text-gray-500">Active Opinion</span>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4 leading-relaxed">{question}</h3>
              
              <div className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-orange-400">
                <div className="text-sm text-gray-400 mb-1">Current Answer</div>
                <div className="text-gray-200 font-medium">{currentAnswer}</div>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 rounded-xl p-6 mb-8 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-emerald-400 font-semibold text-lg">Investment Required</div>
                  <div className="text-gray-400 text-sm">Price to submit your answer</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-3xl">{formatUSDC(nextPrice)}</div>
                  <div className="text-gray-400 text-sm">USDC</div>
                </div>
              </div>
              {!hasBalance && (
                <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Insufficient USDC balance - Please add funds to your wallet
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Your Answer *
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer to this question..."
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 resize-none text-lg"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context or explanation for your answer..."
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Supporting Link (optional)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/source"
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
                />
                <p className="text-sm text-gray-400 mt-2 ml-1">
                  📎 Optional link to support your answer with evidence or sources
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="text-red-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || !hasBalance}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-emerald-500/25"
              >
                {needsApproval ? '🔐 Approve & Submit Answer' : '🚀 Submit Answer'}
              </button>
              
              <button
                onClick={handleClose}
                className="w-full px-8 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {(step === 'approve' || step === 'submit') && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {step === 'approve' ? '🔐 Approving USDC...' : '🚀 Submitting Answer...'}
            </h2>
            <p className="text-lg text-gray-300 mb-2">
              {step === 'approve' 
                ? 'Please confirm the USDC approval in your wallet'
                : 'Please confirm the transaction in your wallet'
              }
            </p>
            <p className="text-sm text-gray-400">
              {step === 'approve' 
                ? 'This allows the contract to use your USDC for the transaction'
                : 'Your answer will become the new opinion once confirmed'
              }
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">🎉 Success!</h2>
            <p className="text-lg text-gray-300 mb-2">
              Your answer has been submitted successfully!
            </p>
            <p className="text-gray-400 mb-8">
              You are now the current answer owner for this opinion
            </p>
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              🚀 Back to Opinions
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">❌ Transaction Failed</h2>
            <p className="text-gray-300 text-lg mb-8">{errorMessage}</p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setStep('form')}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                🔄 Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full px-8 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}