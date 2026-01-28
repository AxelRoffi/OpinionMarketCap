'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import {
  parseTransactionError,
  validatePreSubmission,
  validateAnswerInputs,
  validateOpinionInputs,
  type ParsedError,
  type ValidationResult,
  type PreValidationParams,
  type AnswerValidationParams,
  type OpinionValidationParams,
} from '@/lib/errors';
import { USDC_ADDRESS, USDC_ABI, CONTRACTS } from '@/lib/contracts';

// ============================================================================
// Types
// ============================================================================

export interface UseTransactionErrorReturn {
  // Current error state
  error: ParsedError | null;
  hasError: boolean;

  // Pre-validation state
  preValidation: ValidationResult | null;
  isPreValidating: boolean;

  // Error handling
  handleError: (error: unknown) => ParsedError;
  clearError: () => void;

  // Pre-submission validation
  validateBeforeSubmit: (requiredAmount: bigint, spender?: `0x${string}`) => ValidationResult;

  // Input validation
  validateAnswer: (params: AnswerValidationParams) => ValidationResult;
  validateOpinion: (params: OpinionValidationParams) => ValidationResult;

  // Balance/allowance data
  balance: bigint | undefined;
  allowance: bigint | undefined;
  hasEnoughBalance: (amount: bigint) => boolean;
  hasEnoughAllowance: (amount: bigint) => boolean;
  needsApproval: (amount: bigint) => boolean;

  // Utility
  formatErrorForToast: (error: ParsedError) => { title: string; description: string };
}

// ============================================================================
// Hook
// ============================================================================

export function useTransactionError(
  spenderAddress: `0x${string}` = CONTRACTS.OPINION_CORE
): UseTransactionErrorReturn {
  const { address } = useAccount();
  const [error, setError] = useState<ParsedError | null>(null);
  const [preValidation, setPreValidation] = useState<ValidationResult | null>(null);
  const [isPreValidating, setIsPreValidating] = useState(false);

  // Fetch user's USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Fetch user's USDC allowance for the spender
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, spenderAddress] : undefined,
    query: { enabled: !!address },
  });

  // Handle any error and parse it
  const handleError = useCallback((rawError: unknown): ParsedError => {
    const parsed = parseTransactionError(rawError);
    setError(parsed);
    return parsed;
  }, []);

  // Clear current error
  const clearError = useCallback(() => {
    setError(null);
    setPreValidation(null);
  }, []);

  // Check if user has enough balance
  const hasEnoughBalance = useCallback((amount: bigint): boolean => {
    if (!balance) return false;
    return balance >= amount;
  }, [balance]);

  // Check if user has enough allowance
  const hasEnoughAllowance = useCallback((amount: bigint): boolean => {
    if (!allowance) return false;
    return allowance >= amount;
  }, [allowance]);

  // Check if approval is needed
  const needsApproval = useCallback((amount: bigint): boolean => {
    return !hasEnoughAllowance(amount);
  }, [hasEnoughAllowance]);

  // Validate before transaction submission
  const validateBeforeSubmit = useCallback((
    requiredAmount: bigint,
    spender: `0x${string}` = spenderAddress
  ): ValidationResult => {
    setIsPreValidating(true);

    const params: PreValidationParams = {
      userAddress: address,
      balance,
      allowance,
      requiredAmount,
      spenderAddress: spender,
    };

    const result = validatePreSubmission(params);
    setPreValidation(result);
    setIsPreValidating(false);

    // If validation fails, set the first error
    if (!result.valid && result.errors.length > 0) {
      setError(result.errors[0]);
    }

    return result;
  }, [address, balance, allowance, spenderAddress]);

  // Validate answer inputs
  const validateAnswer = useCallback((params: AnswerValidationParams): ValidationResult => {
    const result = validateAnswerInputs(params);

    if (!result.valid && result.errors.length > 0) {
      setError(result.errors[0]);
    }

    return result;
  }, []);

  // Validate opinion inputs
  const validateOpinion = useCallback((params: OpinionValidationParams): ValidationResult => {
    const result = validateOpinionInputs(params);

    if (!result.valid && result.errors.length > 0) {
      setError(result.errors[0]);
    }

    return result;
  }, []);

  // Format error for toast notifications
  const formatErrorForToast = useCallback((parsedError: ParsedError): { title: string; description: string } => {
    return {
      title: parsedError.title,
      description: parsedError.suggestion || parsedError.message,
    };
  }, []);

  // Refetch balance and allowance when address changes
  useEffect(() => {
    if (address) {
      refetchBalance();
      refetchAllowance();
    }
  }, [address, refetchBalance, refetchAllowance]);

  return {
    // Error state
    error,
    hasError: error !== null,

    // Pre-validation
    preValidation,
    isPreValidating,

    // Error handling
    handleError,
    clearError,

    // Validation
    validateBeforeSubmit,
    validateAnswer,
    validateOpinion,

    // Balance/allowance
    balance,
    allowance,
    hasEnoughBalance,
    hasEnoughAllowance,
    needsApproval,

    // Utility
    formatErrorForToast,
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook specifically for trading modals
 */
export function useTradingError() {
  return useTransactionError(CONTRACTS.OPINION_CORE);
}

/**
 * Hook specifically for pool operations
 */
export function usePoolError() {
  return useTransactionError(CONTRACTS.POOL_MANAGER);
}

export default useTransactionError;
