/**
 * Enhanced error handling utilities for OpinionMarketCap transactions
 * Maps smart contract custom errors to user-friendly messages with actionable solutions
 */

export interface ContractError {
  name: string;
  message: string;
  solution: string;
  canRetry: boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface TransactionContext {
  nextPrice?: bigint;
  opinionId?: number;
  userAddress?: string;
}

/**
 * Comprehensive contract error parser that maps custom errors to user-friendly messages
 */
export function parseContractError(error: unknown, context?: TransactionContext): ContractError {
  const errorString = error?.message || error?.toString() || '';
  
  // Custom error mappings based on smart contract definitions
  const customErrorMappings: Record<string, (context?: TransactionContext) => ContractError> = {
    'OpinionNotFound': () => ({
      name: 'Opinion Not Found',
      message: 'This opinion does not exist or has been removed.',
      solution: 'Please refresh the page and try a different opinion.',
      canRetry: false,
      severity: 'error'
    }),
    
    'OpinionNotActive': () => ({
      name: 'Opinion Inactive',
      message: 'This opinion has been deactivated and cannot accept new answers.',
      solution: 'Try trading on an active opinion instead.',
      canRetry: false,
      severity: 'error'
    }),
    
    'SameOwner': () => ({
      name: 'You Already Own This',
      message: 'You already own the current answer for this opinion.',
      solution: 'You cannot buy your own answer. Try a different opinion.',
      canRetry: false,
      severity: 'error'
    }),
    
    'InsufficientAllowance': (context) => ({
      name: 'Insufficient USDC Approval',
      message: `You need to approve ${context?.nextPrice ? formatUSDC(context.nextPrice) : 'more'} USDC for this transaction.`,
      solution: 'Increase your USDC approval amount and try again.',
      canRetry: true,
      severity: 'warning'
    }),
    
    'MaxTradesPerBlockExceeded': () => ({
      name: 'Rate Limit Exceeded',
      message: 'You have exceeded the maximum number of trades per block (3 trades).',
      solution: 'Wait for the next block (~12 seconds) before trading again.',
      canRetry: true,
      severity: 'warning'
    }),
    
    'OneTradePerBlock': () => ({
      name: 'One Trade Per Block',
      message: 'You can only trade this opinion once per block.',
      solution: 'Wait for the next block (~12 seconds) to trade this opinion again.',
      canRetry: true,
      severity: 'warning'
    }),
    
    'InvalidAnswerLength': () => ({
      name: 'Answer Too Long',
      message: 'Your answer exceeds the maximum length of 52 characters.',
      solution: 'Shorten your answer to 52 characters or less.',
      canRetry: true,
      severity: 'error'
    }),
    
    'EmptyString': () => ({
      name: 'Empty Answer',
      message: 'Your answer cannot be empty.',
      solution: 'Please provide a valid answer.',
      canRetry: true,
      severity: 'error'
    }),
    
    'InvalidDescriptionLength': () => ({
      name: 'Description Too Long',
      message: 'Your description exceeds the maximum length of 120 characters.',
      solution: 'Shorten your description to 120 characters or less.',
      canRetry: true,
      severity: 'error'
    }),
    
    'NotTheOwner': () => ({
      name: 'Not Authorized',
      message: 'You are not authorized to perform this action.',
      solution: 'Only the owner can perform this operation.',
      canRetry: false,
      severity: 'error'
    }),
    
    'InvalidInitialPrice': () => ({
      name: 'Invalid Price Range',
      message: 'The initial price must be between 1 and 100 USDC.',
      solution: 'Choose a price between $1.00 and $100.00.',
      canRetry: true,
      severity: 'error'
    }),
    
    'UnauthorizedCreator': () => ({
      name: 'Creation Not Allowed',
      message: 'Public opinion creation is currently disabled.',
      solution: 'Contact an administrator for opinion creation privileges.',
      canRetry: false,
      severity: 'error'
    }),
    
    'NoCategoryProvided': () => ({
      name: 'Category Required',
      message: 'You must select at least one category for your opinion.',
      solution: 'Choose 1-3 categories from the available options.',
      canRetry: true,
      severity: 'error'
    }),
    
    'TooManyCategories': () => ({
      name: 'Too Many Categories',
      message: 'You can select a maximum of 3 categories per opinion.',
      solution: 'Remove some categories to stay within the 3-category limit.',
      canRetry: true,
      severity: 'error'
    }),
    
    'InvalidCategory': () => ({
      name: 'Invalid Category',
      message: 'One or more selected categories are not valid.',
      solution: 'Choose only from the available category options.',
      canRetry: true,
      severity: 'error'
    }),
    
    'DuplicateCategory': () => ({
      name: 'Duplicate Categories',
      message: 'You cannot select the same category multiple times.',
      solution: 'Remove duplicate categories from your selection.',
      canRetry: true,
      severity: 'error'
    })
  };

  // Try to match known custom errors
  for (const [errorName, errorFactory] of Object.entries(customErrorMappings)) {
    if (errorString.includes(errorName)) {
      return errorFactory(context);
    }
  }

  // Handle common Web3 errors
  if (errorString.includes('insufficient') && errorString.includes('balance')) {
    return {
      name: 'Insufficient USDC Balance',
      message: `You need at least ${context?.nextPrice ? formatUSDC(context.nextPrice) : 'more'} USDC to complete this transaction.`,
      solution: 'Add more USDC to your wallet and try again.',
      canRetry: true,
      severity: 'error'
    };
  }

  if (errorString.includes('rejected') || errorString.includes('denied') || errorString.includes('cancelled')) {
    return {
      name: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      solution: 'Click submit again and approve the transaction in your wallet.',
      canRetry: true,
      severity: 'info'
    };
  }

  if (errorString.includes('network') || errorString.includes('timeout') || errorString.includes('connection')) {
    return {
      name: 'Network Error',
      message: 'There was a network connectivity issue.',
      solution: 'Check your internet connection and try again.',
      canRetry: true,
      severity: 'warning'
    };
  }

  if (errorString.includes('gas') || errorString.includes('fee')) {
    return {
      name: 'Gas Fee Error',
      message: 'Transaction failed due to gas fee issues.',
      solution: 'Try increasing your gas limit or wait for lower network congestion.',
      canRetry: true,
      severity: 'warning'
    };
  }

  if (errorString.includes('nonce')) {
    return {
      name: 'Transaction Nonce Error',
      message: 'Transaction nonce conflict detected.',
      solution: 'Reset your wallet account or wait a moment and try again.',
      canRetry: true,
      severity: 'warning'
    };
  }

  // Default error for unknown cases
  return {
    name: 'Transaction Failed',
    message: errorString || 'An unknown error occurred during the transaction.',
    solution: 'Please try again. If the problem persists, contact support with the error details.',
    canRetry: true,
    severity: 'error'
  };
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(wei: bigint): string {
  const usdc = Number(wei) / 1_000_000;
  return `$${usdc.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Validation rules for transaction inputs
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTransactionInputs(
  answer: string,
  description: string,
  balance?: bigint,
  nextPrice?: bigint,
  opinionData?: { isActive: boolean; currentAnswerOwner: string; currentAnswer: string; },
  userAddress?: string
): ValidationResult {
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
  if (!userAddress) {
    errors.push('Wallet not connected');
    return { isValid: false, errors, warnings };
  }

  // Balance validation
  if (nextPrice && (!balance || balance < nextPrice)) {
    errors.push(`Insufficient USDC balance. Need ${formatUSDC(nextPrice)}`);
  }

  // Opinion state validation
  if (opinionData) {
    if (!opinionData.isActive) {
      errors.push('This opinion is no longer active');
    }
    
    if (opinionData.currentAnswerOwner === userAddress) {
      errors.push('You already own the current answer');
    }

    // Check if answer is the same as current
    if (opinionData.currentAnswer.toLowerCase() === answer.trim().toLowerCase()) {
      warnings.push('Your answer is the same as the current answer');
    }
  }

  // Rate limiting warnings
  warnings.push('Rate limiting: You can only trade once per block (~12 seconds)');

  return { 
    isValid: errors.length === 0, 
    errors, 
    warnings 
  };
}

/**
 * Generate user-friendly retry suggestions based on error type
 */
export function getRetryStrategy(error: ContractError): {
  waitTime?: number;
  action: string;
  automated?: boolean;
} {
  if (error.name.includes('Rate Limit') || error.name.includes('One Trade Per Block')) {
    return {
      waitTime: 12000, // 12 seconds
      action: 'Wait for next block',
      automated: true
    };
  }

  if (error.name.includes('Network') || error.name.includes('Timeout')) {
    return {
      waitTime: 3000, // 3 seconds
      action: 'Retry connection',
      automated: false
    };
  }

  if (error.name.includes('Cancelled')) {
    return {
      action: 'Resubmit transaction',
      automated: false
    };
  }

  return {
    action: 'Try again',
    automated: false
  };
}

/**
 * Enhanced logging for debugging transaction issues
 */
export function logTransactionError(
  error: ContractError,
  context: {
    opinionId?: number;
    userAddress?: string;
    step?: string;
    timestamp?: number;
  }
) {
  const logData = {
    ...error,
    context,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Transaction Error');
    console.error('Error Details:', logData);
    console.groupEnd();
  }
  
  // In production, you would send this to your analytics service
  // Analytics.track('transaction_error', logData);
}