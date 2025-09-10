'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { X, Loader2, AlertCircle, CheckCircle, Clock, Shield, Zap } from 'lucide-react';
import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts';

interface EnhancedSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  opinionId: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
}

type TransactionStep = 'form' | 'validate' | 'approve' | 'approving' | 'submit' | 'submitting' | 'success' | 'error';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ContractError {
  name: string;
  message: string;
  solution: string;
  canRetry: boolean;
}

export default function EnhancedSubmitModal({
  isOpen,
  onClose,
  opinionId,
  question,
  currentAnswer,
  nextPrice
}: EnhancedSubmitModalProps) {
  const [answer, setAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<TransactionStep>('form');
  const [error, setError] = useState<ContractError | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, errors: [], warnings: [] });
  const [retryCount, setRetryCount] = useState(0);

  const { address } = useAccount();

  // Format USDC for display
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000;
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Enhanced contract reads with error handling
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
    query: { 
      enabled: !!address,
      retry: 3,
      retryDelay: 1000
    }
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      retry: 3,
      retryDelay: 1000
    }
  });

  const { data: opinionData, refetch: refetchOpinion } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(opinionId)],
    query: {
      retry: 3,
      retryDelay: 1000
    }
  });

  // Transaction hooks
  const { 
    writeContract: approveUSDC, 
    data: approveHash,
    error: approveError
  } = useWriteContract();

  const { 
    writeContract: submitAnswerTx, 
    data: submitHash,
    error: submitError
  } = useWriteContract();

  // Wait for transactions with enhanced error handling
  const { 
    isSuccess: isApproveSuccess, 
    isError: isApproveError,
    error: approveReceiptError
  } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { retry: 3 }
  });

  const { 
    isSuccess: isSubmitSuccess, 
    isError: isSubmitError,
    error: submitReceiptError
  } = useWaitForTransactionReceipt({
    hash: submitHash,
    query: { retry: 3 }
  });

  // Enhanced custom error parsing
  const parseContractError = useCallback((error: unknown): ContractError => {
    const errorString = (error as Error)?.message || (error as unknown)?.toString() || '';
    
    // Custom error mappings
    const errorMappings: Record<string, ContractError> = {
      'OpinionNotFound': {
        name: 'Opinion Not Found',
        message: 'This opinion does not exist or has been removed.',
        solution: 'Please refresh the page and try a different opinion.',
        canRetry: false
      },
      'OpinionNotActive': {
        name: 'Opinion Inactive',
        message: 'This opinion has been deactivated and cannot accept new answers.',
        solution: 'Try trading on an active opinion instead.',
        canRetry: false
      },
      'SameOwner': {
        name: 'You Already Own This',
        message: 'You already own the current answer for this opinion.',
        solution: 'You cannot buy your own answer. Try a different opinion.',
        canRetry: false
      },
      'InsufficientAllowance': {
        name: 'Insufficient USDC Approval',
        message: 'You need to approve more USDC for this transaction.',
        solution: 'Increase your USDC approval amount and try again.',
        canRetry: true
      },
      'MaxTradesPerBlockExceeded': {
        name: 'Too Many Trades',
        message: 'You have exceeded the maximum number of trades per block.',
        solution: 'Wait for the next block (~12 seconds) before trading again.',
        canRetry: true
      },
      'OneTradePerBlock': {
        name: 'One Trade Per Block',
        message: 'You can only trade this opinion once per block.',
        solution: 'Wait for the next block (~12 seconds) to trade this opinion again.',
        canRetry: true
      },
      'InvalidAnswerLength': {
        name: 'Answer Too Long',
        message: 'Your answer exceeds the maximum length of 52 characters.',
        solution: 'Shorten your answer to 52 characters or less.',
        canRetry: true
      },
      'EmptyString': {
        name: 'Empty Answer',
        message: 'Your answer cannot be empty.',
        solution: 'Please provide a valid answer.',
        canRetry: true
      },
      'InvalidDescriptionLength': {
        name: 'Description Too Long',
        message: 'Your description exceeds the maximum length of 120 characters.',
        solution: 'Shorten your description to 120 characters or less.',
        canRetry: true
      }
    };

    // Try to match known custom errors
    for (const [errorName, errorInfo] of Object.entries(errorMappings)) {
      if (errorString.includes(errorName)) {
        return errorInfo;
      }
    }

    // Handle insufficient balance
    if (errorString.includes('insufficient') && errorString.includes('balance')) {
      return {
        name: 'Insufficient USDC Balance',
        message: `You need at least ${formatUSDC(nextPrice)} USDC to complete this transaction.`,
        solution: 'Add more USDC to your wallet and try again.',
        canRetry: true
      };
    }

    // Handle user rejection
    if (errorString.includes('rejected') || errorString.includes('denied')) {
      return {
        name: 'Transaction Cancelled',
        message: 'You cancelled the transaction in your wallet.',
        solution: 'Click submit again and approve the transaction in your wallet.',
        canRetry: true
      };
    }

    // Handle network errors
    if (errorString.includes('network') || errorString.includes('timeout')) {
      return {
        name: 'Network Error',
        message: 'There was a network connectivity issue.',
        solution: 'Check your internet connection and try again.',
        canRetry: true
      };
    }

    // Default error
    return {
      name: 'Transaction Failed',
      message: errorString || 'An unknown error occurred.',
      solution: 'Please try again. If the problem persists, contact support.',
      canRetry: true
    };
  }, [nextPrice]);

  // Enhanced pre-transaction validation
  const validateTransaction = useCallback(async (): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic field validation
    if (!answer.trim()) {
      errors.push('Answer is required');
    } else if (answer.trim().length > 52) {
      errors.push('Answer must be 52 characters or less');
    }

    if (description.length > 120) {
      errors.push('Description must be 120 characters or less');
    }

    // Account validation
    if (!address) {
      errors.push('Wallet not connected');
      return { isValid: false, errors, warnings };
    }

    // Balance validation
    if (!balance || balance < nextPrice) {
      errors.push(`Insufficient USDC balance. Need ${formatUSDC(nextPrice)}`);
    }

    // Opinion state validation
    if (opinionData) {
      if (!opinionData.isActive) {
        errors.push('This opinion is no longer active');
      }
      
      if (opinionData.currentAnswerOwner === address) {
        errors.push('You already own the current answer');
      }

      // Check if answer is the same as current
      if (opinionData.currentAnswer.toLowerCase() === answer.trim().toLowerCase()) {
        warnings.push('Your answer is the same as the current answer');
      }
    }

    // Rate limiting warning
    warnings.push('You can only trade once per block (~12 seconds)');

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }, [answer, description, address, balance, nextPrice, opinionData]);

  // Handle transaction submission with robust error handling
  const handleSubmit = useCallback(async () => {
    try {
      setStep('validate');
      
      // Run validation
      const validationResult = await validateTransaction();
      setValidation(validationResult);
      
      if (!validationResult.isValid) {
        setError({
          name: 'Validation Failed',
          message: validationResult.errors.join(', '),
          solution: 'Fix the validation errors and try again.',
          canRetry: true
        });
        setStep('error');
        return;
      }

      const needsApproval = !allowance || allowance < nextPrice;

      if (needsApproval) {
        setStep('approve');
        
        await approveUSDC({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.OPINION_CORE, nextPrice],
        });
        
        setStep('approving');
      } else {
        setStep('submit');
        
        await submitAnswerTx({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'submitAnswer',
          args: [BigInt(opinionId), answer.trim(), description.trim(), ''],
        });
        
        setStep('submitting');
      }
    } catch (error: unknown) {
      const contractError = parseContractError(error);
      setError(contractError);
      setStep('error');
    }
  }, [validateTransaction, allowance, nextPrice, approveUSDC, submitAnswerTx, opinionId, answer, description, parseContractError]);

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && step === 'approving') {
      // Refetch allowance and then proceed to submit
      refetchAllowance().then(() => {
        setStep('submit');
        try {
          submitAnswerTx({
            address: CONTRACTS.OPINION_CORE,
            abi: OPINION_CORE_ABI,
            functionName: 'submitAnswer',
            args: [BigInt(opinionId), answer.trim(), description.trim(), ''],
          });
          setStep('submitting');
        } catch (error) {
          const contractError = parseContractError(error);
          setError(contractError);
          setStep('error');
        }
      });
    }
  }, [isApproveSuccess, step, refetchAllowance, submitAnswerTx, opinionId, answer, description, parseContractError]);

  // Handle submit success
  useEffect(() => {
    if (isSubmitSuccess && step === 'submitting') {
      setStep('success');
    }
  }, [isSubmitSuccess, step]);

  // Handle errors
  useEffect(() => {
    if (isApproveError || approveError) {
      const contractError = parseContractError(approveError || approveReceiptError);
      setError(contractError);
      setStep('error');
    }
  }, [isApproveError, approveError, approveReceiptError, parseContractError]);

  useEffect(() => {
    if (isSubmitError || submitError) {
      const contractError = parseContractError(submitError || submitReceiptError);
      setError(contractError);
      setStep('error');
    }
  }, [isSubmitError, submitError, submitReceiptError, parseContractError]);

  const handleClose = useCallback(() => {
    setAnswer('');
    setDescription('');
    setStep('form');
    setError(null);
    setValidation({ isValid: false, errors: [], warnings: [] });
    setRetryCount(0);
    onClose();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setStep('form');
    
    // Refetch data to get latest state
    refetchBalance();
    refetchAllowance();
    refetchOpinion();
  }, [refetchBalance, refetchAllowance, refetchOpinion]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ['form', 'error'].includes(step)) {
        handleClose();
      }
      if (e.key === 'Enter' && e.ctrlKey && step === 'form') {
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, handleClose, handleSubmit]);

  if (!isOpen) return null;

  const needsApproval = !allowance || allowance < nextPrice;
  const hasBalance = balance ? balance >= nextPrice : false;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          
          {step === 'form' && (
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-emerald-500" />
                    Submit Your Answer
                  </h1>
                  {retryCount > 0 && (
                    <p className="text-sm text-gray-400 mt-1">Attempt #{retryCount + 1}</p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Question */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="text-sm text-emerald-400 mb-2">Question #{opinionId}</div>
                <div className="text-white font-semibold mb-2">{question}</div>
                <div className="text-sm text-gray-400">
                  Current: <span className="text-gray-300">{currentAnswer}</span>
                </div>
              </div>

              {/* Price & Status */}
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-400 font-semibold">Price:</span>
                  <span className="text-emerald-400 font-bold text-xl">{formatUSDC(nextPrice)}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">USDC Balance:</span>
                    <span className={hasBalance ? 'text-green-400' : 'text-red-400'}>
                      {balance ? formatUSDC(balance) : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">USDC Allowance:</span>
                    <span className={needsApproval ? 'text-yellow-400' : 'text-green-400'}>
                      {allowance ? formatUSDC(allowance) : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Your Answer * ({answer.length}/52)
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:border-emerald-500 resize-none"
                    rows={3}
                    maxLength={52}
                  />
                  {answer.length > 45 && (
                    <p className="text-yellow-400 text-xs mt-1">
                      {52 - answer.length} characters remaining
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Description (optional) ({description.length}/120)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add context..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:border-emerald-500 resize-none"
                    rows={2}
                    maxLength={120}
                  />
                </div>
              </div>

              {/* Validation warnings */}
              {validation.warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-yellow-400 font-medium text-sm">Warnings:</div>
                      {validation.warnings.map((warning, i) => (
                        <div key={i} className="text-yellow-300 text-sm">{warning}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || !hasBalance || answer.length > 52 || description.length > 120}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {needsApproval ? 'Approve & Submit' : 'Submit Answer'}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Tip: Press Ctrl+Enter to submit quickly
              </p>
            </div>
          )}

          {['validate', 'approve', 'approving', 'submit', 'submitting'].includes(step) && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center">
                {step === 'validate' ? (
                  <Shield className="w-8 h-8 text-white" />
                ) : (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {step === 'validate' && 'Validating Transaction...'}
                {step === 'approve' && 'Approve USDC'}
                {step === 'approving' && 'Approving USDC...'}
                {step === 'submit' && 'Submit Answer'}
                {step === 'submitting' && 'Submitting Answer...'}
              </h2>
              <p className="text-gray-400">
                {step === 'validate' && 'Checking transaction requirements...'}
                {['approve', 'submit'].includes(step) && 'Please confirm the transaction in your wallet'}
                {['approving', 'submitting'].includes(step) && 'Waiting for transaction confirmation...'}
              </p>
              
              {['approving', 'submitting'].includes(step) && (
                <div className="mt-4 text-xs text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  This may take 10-30 seconds
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
              <p className="text-gray-400 mb-6">
                Your answer has been submitted successfully!
              </p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Close
              </button>
            </div>
          )}

          {step === 'error' && error && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{error.name}</h2>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="text-red-400 mb-2">{error.message}</div>
                <div className="text-red-300 text-sm">{error.solution}</div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                {error.canRetry && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}