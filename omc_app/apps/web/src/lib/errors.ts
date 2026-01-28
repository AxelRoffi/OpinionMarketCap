/**
 * Transaction Error Handling Library
 *
 * Parses contract errors and wallet errors into user-friendly messages.
 * Provides pre-submission validation utilities.
 */

// ============================================================================
// Types
// ============================================================================

export type ErrorType =
  | 'insufficient_balance'
  | 'insufficient_allowance'
  | 'user_rejected'
  | 'network_error'
  | 'gas_estimation_failed'
  | 'contract_error'
  | 'validation_error'
  | 'opinion_not_found'
  | 'opinion_not_active'
  | 'unauthorized'
  | 'pool_error'
  | 'slippage'
  | 'unknown';

export interface ParsedError {
  type: ErrorType;
  title: string;
  message: string;
  suggestion?: string;
  retryable: boolean;
  technicalDetails?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ParsedError[];
}

// ============================================================================
// Contract Error Mappings
// ============================================================================

/**
 * Custom Solidity errors from OpinionCore, PoolManager, etc.
 */
const CUSTOM_ERROR_PATTERNS: Record<string, (args?: string) => ParsedError> = {
  // Opinion Errors
  'OpinionNotFound': () => ({
    type: 'opinion_not_found',
    title: 'Opinion Not Found',
    message: 'This opinion does not exist or has been removed.',
    suggestion: 'Please refresh the page and try again.',
    retryable: false,
  }),

  'OpinionNotActive': () => ({
    type: 'opinion_not_active',
    title: 'Opinion Deactivated',
    message: 'This opinion has been deactivated by a moderator.',
    suggestion: 'You cannot trade on deactivated opinions.',
    retryable: false,
  }),

  'SameOwner': () => ({
    type: 'validation_error',
    title: 'Already the Answer Owner',
    message: 'You already own the current answer for this opinion.',
    suggestion: 'Wait for someone else to submit an answer first.',
    retryable: false,
  }),

  'InvalidLinkLength': () => ({
    type: 'validation_error',
    title: 'Link Too Long',
    message: 'The external link you provided exceeds the maximum length.',
    suggestion: 'Please shorten the link or use a URL shortener.',
    retryable: true,
  }),

  'InsufficientAllowance': (args) => ({
    type: 'insufficient_allowance',
    title: 'USDC Approval Required',
    message: 'You need to approve USDC spending before this transaction.',
    suggestion: 'Click "Approve USDC" and confirm in your wallet.',
    retryable: true,
    technicalDetails: args,
  }),

  'NotTheOwner': () => ({
    type: 'unauthorized',
    title: 'Not the Owner',
    message: 'You do not own this question and cannot perform this action.',
    suggestion: 'Only the question owner can list, transfer, or cancel sales.',
    retryable: false,
  }),

  'NotForSale': () => ({
    type: 'validation_error',
    title: 'Not For Sale',
    message: 'This question is not currently listed for sale.',
    suggestion: 'The owner may have canceled the listing.',
    retryable: false,
  }),

  'ZeroAddressNotAllowed': () => ({
    type: 'validation_error',
    title: 'Invalid Address',
    message: 'Cannot use the zero address for this operation.',
    suggestion: 'Please provide a valid wallet address.',
    retryable: true,
  }),

  'UnauthorizedCreator': () => ({
    type: 'unauthorized',
    title: 'Not Authorized',
    message: 'Public opinion creation is currently disabled.',
    suggestion: 'Contact the platform administrators for access.',
    retryable: false,
  }),

  // Pool Errors
  'PoolNotActive': () => ({
    type: 'pool_error',
    title: 'Pool Not Active',
    message: 'This pool is no longer accepting contributions.',
    suggestion: 'The pool may have been completed, expired, or cancelled.',
    retryable: false,
  }),

  'PoolDeadlinePassed': () => ({
    type: 'pool_error',
    title: 'Pool Expired',
    message: 'The deadline for this pool has passed.',
    suggestion: 'You can withdraw your contribution if the pool failed.',
    retryable: false,
  }),

  'PoolAlreadyFunded': () => ({
    type: 'pool_error',
    title: 'Pool Already Funded',
    message: 'This pool has already reached its funding goal.',
    suggestion: 'The pool is ready to be completed.',
    retryable: false,
  }),

  'PoolContributionTooLow': () => ({
    type: 'validation_error',
    title: 'Contribution Too Small',
    message: 'The contribution amount is below the minimum.',
    suggestion: 'Please increase your contribution amount.',
    retryable: true,
  }),

  'PoolInvalidPoolId': () => ({
    type: 'pool_error',
    title: 'Pool Not Found',
    message: 'This pool does not exist.',
    suggestion: 'Please refresh the page and try again.',
    retryable: false,
  }),

  'PoolNextPriceTooLow': () => ({
    type: 'pool_error',
    title: 'Price Too Low for Pool',
    message: 'The opinion price must be at least 100 USDC to create a pool.',
    suggestion: 'Pools can only be created for opinions with higher prices.',
    retryable: false,
  }),

  'PoolNotExpired': () => ({
    type: 'pool_error',
    title: 'Pool Still Active',
    message: 'Cannot withdraw while the pool deadline has not passed.',
    suggestion: 'Wait for the pool deadline to expire.',
    retryable: false,
  }),

  'PoolNoContribution': () => ({
    type: 'pool_error',
    title: 'No Contribution Found',
    message: 'You have not contributed to this pool.',
    suggestion: 'Only contributors can perform this action.',
    retryable: false,
  }),

  'PoolDeadlineTooLong': () => ({
    type: 'pool_error',
    title: 'Deadline Too Far',
    message: 'The pool deadline exceeds the maximum allowed duration.',
    suggestion: 'Pools can be set for a maximum of 60 days.',
    retryable: true,
  }),

  'PoolInsufficientFunds': () => ({
    type: 'pool_error',
    title: 'Insufficient Pool Funds',
    message: 'The pool does not have enough funds to complete.',
    suggestion: 'More contributions are needed.',
    retryable: false,
  }),

  // Access Control
  'AccessControlUnauthorizedAccount': () => ({
    type: 'unauthorized',
    title: 'Unauthorized',
    message: 'Your account does not have permission for this action.',
    suggestion: 'This action requires admin or moderator privileges.',
    retryable: false,
  }),
};

/**
 * require() error message mappings
 */
const REQUIRE_ERROR_PATTERNS: Record<string, ParsedError> = {
  'Zero address': {
    type: 'validation_error',
    title: 'Invalid Address',
    message: 'A valid address is required.',
    suggestion: 'Please provide a valid wallet address.',
    retryable: true,
  },
  'Below minimum': {
    type: 'validation_error',
    title: 'Price Too Low',
    message: 'The price is below the minimum allowed.',
    suggestion: 'Minimum price is 1 USDC.',
    retryable: true,
  },
  'Opinion not found': {
    type: 'opinion_not_found',
    title: 'Opinion Not Found',
    message: 'This opinion does not exist.',
    retryable: false,
  },
  'Not opinion creator': {
    type: 'unauthorized',
    title: 'Not the Creator',
    message: 'Only the opinion creator can perform this action.',
    retryable: false,
  },
  'Category already exists': {
    type: 'validation_error',
    title: 'Duplicate Category',
    message: 'This category already exists.',
    retryable: false,
  },
  'At least one category required': {
    type: 'validation_error',
    title: 'Category Required',
    message: 'You must select at least one category.',
    suggestion: 'Please select a category for your opinion.',
    retryable: true,
  },
  'Too many categories': {
    type: 'validation_error',
    title: 'Too Many Categories',
    message: 'You can select a maximum of 3 categories.',
    suggestion: 'Please remove some categories.',
    retryable: true,
  },
  'Invalid category': {
    type: 'validation_error',
    title: 'Invalid Category',
    message: 'One or more selected categories are not valid.',
    suggestion: 'Please select from the available categories.',
    retryable: true,
  },
  'Unauthorized caller': {
    type: 'unauthorized',
    title: 'Unauthorized',
    message: 'This action can only be performed by authorized contracts.',
    retryable: false,
  },
  'No pending change': {
    type: 'validation_error',
    title: 'No Pending Change',
    message: 'There is no pending treasury change to confirm.',
    retryable: false,
  },
  'Too early': {
    type: 'validation_error',
    title: 'Timelock Active',
    message: 'The timelock period has not passed yet.',
    suggestion: 'Please wait for the timelock to expire.',
    retryable: false,
  },
};

// ============================================================================
// Wallet Error Patterns
// ============================================================================

const WALLET_ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  error: ParsedError;
}> = [
  {
    pattern: /user rejected|user denied|rejected the request/i,
    error: {
      type: 'user_rejected',
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      suggestion: 'Click the button again to retry.',
      retryable: true,
    },
  },
  {
    pattern: /insufficient funds for gas/i,
    error: {
      type: 'insufficient_balance',
      title: 'Insufficient ETH for Gas',
      message: 'You don\'t have enough ETH to pay for transaction fees.',
      suggestion: 'Add ETH to your wallet for gas fees.',
      retryable: false,
    },
  },
  {
    pattern: /insufficient funds|exceeds balance|transfer amount exceeds balance/i,
    error: {
      type: 'insufficient_balance',
      title: 'Insufficient USDC Balance',
      message: 'You don\'t have enough USDC for this transaction.',
      suggestion: 'Add more USDC to your wallet.',
      retryable: false,
    },
  },
  {
    pattern: /allowance|ERC20: insufficient allowance/i,
    error: {
      type: 'insufficient_allowance',
      title: 'USDC Approval Required',
      message: 'You need to approve USDC spending first.',
      suggestion: 'Approve USDC and try again.',
      retryable: true,
    },
  },
  {
    pattern: /nonce too low|replacement transaction underpriced/i,
    error: {
      type: 'network_error',
      title: 'Transaction Conflict',
      message: 'A previous transaction is still pending.',
      suggestion: 'Wait a moment and try again.',
      retryable: true,
    },
  },
  {
    pattern: /network|timeout|failed to fetch|disconnected/i,
    error: {
      type: 'network_error',
      title: 'Network Error',
      message: 'Unable to connect to the blockchain.',
      suggestion: 'Check your internet connection and try again.',
      retryable: true,
    },
  },
  {
    pattern: /gas required exceeds allowance|out of gas/i,
    error: {
      type: 'gas_estimation_failed',
      title: 'Transaction Would Fail',
      message: 'This transaction would fail if submitted.',
      suggestion: 'Check your inputs and try again.',
      retryable: true,
    },
  },
  {
    pattern: /intrinsic gas too low/i,
    error: {
      type: 'gas_estimation_failed',
      title: 'Gas Too Low',
      message: 'The gas limit is too low for this transaction.',
      suggestion: 'Try again with higher gas settings.',
      retryable: true,
    },
  },
  {
    pattern: /max fee per gas less than block base fee/i,
    error: {
      type: 'network_error',
      title: 'Gas Price Too Low',
      message: 'Network fees increased since you started.',
      suggestion: 'Try again with updated gas settings.',
      retryable: true,
    },
  },
];

// ============================================================================
// Main Error Parser
// ============================================================================

/**
 * Parse any error into a user-friendly format
 */
export function parseTransactionError(error: unknown): ParsedError {
  const errorMessage = getErrorMessage(error);
  const errorName = (error as Error)?.name || '';

  // Log for debugging
  console.error('[Error Parser] Raw error:', {
    message: errorMessage,
    name: errorName,
    error,
  });

  // 1. Check for custom Solidity errors
  for (const [errorKey, createError] of Object.entries(CUSTOM_ERROR_PATTERNS)) {
    if (errorMessage.includes(errorKey)) {
      const argsMatch = errorMessage.match(new RegExp(`${errorKey}\\(([^)]+)\\)`));
      return createError(argsMatch?.[1]);
    }
  }

  // 2. Check for require() error messages
  for (const [pattern, parsedError] of Object.entries(REQUIRE_ERROR_PATTERNS)) {
    if (errorMessage.includes(pattern)) {
      return parsedError;
    }
  }

  // 3. Check for wallet/network errors
  for (const { pattern, error: parsedError } of WALLET_ERROR_PATTERNS) {
    const matches = typeof pattern === 'string'
      ? errorMessage.includes(pattern)
      : pattern.test(errorMessage);

    if (matches) {
      return parsedError;
    }
  }

  // 4. Check for execution reverted with reason
  const revertMatch = errorMessage.match(/execution reverted:?\s*(.+)/i);
  if (revertMatch) {
    const reason = revertMatch[1].trim();

    // Check if the reason matches any known patterns
    for (const [pattern, parsedError] of Object.entries(REQUIRE_ERROR_PATTERNS)) {
      if (reason.includes(pattern)) {
        return parsedError;
      }
    }

    return {
      type: 'contract_error',
      title: 'Transaction Failed',
      message: reason || 'The smart contract rejected this transaction.',
      suggestion: 'Please check your inputs and try again.',
      retryable: true,
      technicalDetails: reason,
    };
  }

  // 5. Check for UserRejectedRequestError by name
  if (errorName === 'UserRejectedRequestError' || errorMessage.includes('UserRejectedRequestError')) {
    return {
      type: 'user_rejected',
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      suggestion: 'Click the button again if you want to retry.',
      retryable: true,
    };
  }

  // 6. Default unknown error
  return {
    type: 'unknown',
    title: 'Transaction Failed',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again. If the problem persists, refresh the page.',
    retryable: true,
    technicalDetails: errorMessage,
  };
}

/**
 * Extract error message from various error formats
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    // wagmi/viem errors often have nested structures
    const e = error as Record<string, unknown>;

    // Check for shortMessage (viem)
    if (typeof e.shortMessage === 'string') return e.shortMessage;

    // Check for message
    if (typeof e.message === 'string') return e.message;

    // Check for cause.message
    if (e.cause && typeof (e.cause as Record<string, unknown>).message === 'string') {
      return (e.cause as Record<string, unknown>).message as string;
    }

    // Check for data.message
    if (e.data && typeof (e.data as Record<string, unknown>).message === 'string') {
      return (e.data as Record<string, unknown>).message as string;
    }

    // Try to stringify
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }

  return 'Unknown error';
}

// ============================================================================
// Pre-Submission Validation
// ============================================================================

export interface PreValidationParams {
  userAddress?: `0x${string}`;
  balance?: bigint;
  allowance?: bigint;
  requiredAmount: bigint;
  spenderAddress: `0x${string}`;
}

/**
 * Validate transaction prerequisites before submission
 */
export function validatePreSubmission(params: PreValidationParams): ValidationResult {
  const errors: ParsedError[] = [];

  // Check wallet connection
  if (!params.userAddress) {
    errors.push({
      type: 'validation_error',
      title: 'Wallet Not Connected',
      message: 'Please connect your wallet to continue.',
      suggestion: 'Click "Connect Wallet" in the top right.',
      retryable: false,
    });
    return { valid: false, errors };
  }

  // Check balance
  if (params.balance !== undefined && params.balance < params.requiredAmount) {
    const balanceUSDC = Number(params.balance) / 1_000_000;
    const requiredUSDC = Number(params.requiredAmount) / 1_000_000;
    const neededUSDC = requiredUSDC - balanceUSDC;

    errors.push({
      type: 'insufficient_balance',
      title: 'Insufficient USDC Balance',
      message: `You need $${requiredUSDC.toFixed(2)} USDC but only have $${balanceUSDC.toFixed(2)}.`,
      suggestion: `Add $${neededUSDC.toFixed(2)} more USDC to your wallet.`,
      retryable: false,
    });
  }

  // Check allowance
  if (params.allowance !== undefined && params.allowance < params.requiredAmount) {
    const allowanceUSDC = Number(params.allowance) / 1_000_000;
    const requiredUSDC = Number(params.requiredAmount) / 1_000_000;

    errors.push({
      type: 'insufficient_allowance',
      title: 'USDC Approval Needed',
      message: allowanceUSDC > 0
        ? `Current approval: $${allowanceUSDC.toFixed(2)}. Required: $${requiredUSDC.toFixed(2)}.`
        : 'You need to approve USDC spending for this transaction.',
      suggestion: 'Click "Approve USDC" to authorize the transaction.',
      retryable: true,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Input Validation (Client-side)
// ============================================================================

export interface AnswerValidationParams {
  answer: string;
  description?: string;
  link?: string;
}

const ANSWER_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 120; // Contract bug: defaults to 120, not 280
const LINK_MAX_LENGTH = 256;

/**
 * Validate answer inputs before submission
 */
export function validateAnswerInputs(params: AnswerValidationParams): ValidationResult {
  const errors: ParsedError[] = [];

  // Answer validation
  if (!params.answer.trim()) {
    errors.push({
      type: 'validation_error',
      title: 'Answer Required',
      message: 'Please enter your answer.',
      retryable: true,
    });
  } else if (params.answer.length > ANSWER_MAX_LENGTH) {
    errors.push({
      type: 'validation_error',
      title: 'Answer Too Long',
      message: `Answer must be ${ANSWER_MAX_LENGTH} characters or less. Currently: ${params.answer.length}.`,
      suggestion: `Remove ${params.answer.length - ANSWER_MAX_LENGTH} characters.`,
      retryable: true,
    });
  } else if (params.answer.trim().length < 3) {
    errors.push({
      type: 'validation_error',
      title: 'Answer Too Short',
      message: 'Answer must be at least 3 characters.',
      retryable: true,
    });
  }

  // Description validation
  if (params.description && params.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push({
      type: 'validation_error',
      title: 'Description Too Long',
      message: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less. Currently: ${params.description.length}.`,
      suggestion: `Remove ${params.description.length - DESCRIPTION_MAX_LENGTH} characters.`,
      retryable: true,
    });
  }

  // Link validation
  if (params.link) {
    if (params.link.length > LINK_MAX_LENGTH) {
      errors.push({
        type: 'validation_error',
        title: 'Link Too Long',
        message: 'The link exceeds the maximum length.',
        suggestion: 'Use a URL shortener or remove the link.',
        retryable: true,
      });
    } else {
      try {
        new URL(params.link);
      } catch {
        errors.push({
          type: 'validation_error',
          title: 'Invalid URL',
          message: 'Please enter a valid URL starting with http:// or https://.',
          retryable: true,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface OpinionValidationParams {
  question: string;
  answer: string;
  description?: string;
  categories: string[];
  initialPrice: number;
}

const QUESTION_MAX_LENGTH = 60;
const MIN_INITIAL_PRICE = 1;
const MAX_INITIAL_PRICE = 100;

/**
 * Validate opinion creation inputs
 */
export function validateOpinionInputs(params: OpinionValidationParams): ValidationResult {
  const errors: ParsedError[] = [];

  // Question validation
  if (!params.question.trim()) {
    errors.push({
      type: 'validation_error',
      title: 'Question Required',
      message: 'Please enter a question.',
      retryable: true,
    });
  } else if (params.question.length > QUESTION_MAX_LENGTH) {
    errors.push({
      type: 'validation_error',
      title: 'Question Too Long',
      message: `Question must be ${QUESTION_MAX_LENGTH} characters or less.`,
      retryable: true,
    });
  }

  // Answer validation (reuse)
  const answerValidation = validateAnswerInputs({
    answer: params.answer,
    description: params.description
  });
  errors.push(...answerValidation.errors);

  // Categories validation
  if (!params.categories || params.categories.length === 0) {
    errors.push({
      type: 'validation_error',
      title: 'Category Required',
      message: 'Please select at least one category.',
      retryable: true,
    });
  } else if (params.categories.length > 3) {
    errors.push({
      type: 'validation_error',
      title: 'Too Many Categories',
      message: 'You can select a maximum of 3 categories.',
      retryable: true,
    });
  }

  // Price validation
  if (params.initialPrice < MIN_INITIAL_PRICE) {
    errors.push({
      type: 'validation_error',
      title: 'Price Too Low',
      message: `Minimum initial price is ${MIN_INITIAL_PRICE} USDC.`,
      retryable: true,
    });
  } else if (params.initialPrice > MAX_INITIAL_PRICE) {
    errors.push({
      type: 'validation_error',
      title: 'Price Too High',
      message: `Maximum initial price is ${MAX_INITIAL_PRICE} USDC.`,
      retryable: true,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Utilities
// ============================================================================

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
 * Check if error is retryable
 */
export function isRetryableError(error: ParsedError): boolean {
  return error.retryable;
}

/**
 * Get error icon based on type
 */
export function getErrorIcon(type: ErrorType): 'warning' | 'error' | 'info' {
  switch (type) {
    case 'user_rejected':
      return 'info';
    case 'insufficient_allowance':
    case 'network_error':
    case 'validation_error':
      return 'warning';
    default:
      return 'error';
  }
}
