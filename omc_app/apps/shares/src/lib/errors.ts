/**
 * Error parsing utilities for contract revert messages
 */

// Common contract error patterns
const CONTRACT_ERROR_PATTERNS: Record<string, string> = {
  // Access Control
  'caller is not the owner': 'You are not authorized to perform this action',
  'AccessControl': 'You do not have permission for this action',
  'Pausable: paused': 'Trading is currently paused',

  // Token/Balance errors
  'ERC20: insufficient allowance': 'Please approve USDC spending first',
  'ERC20: transfer amount exceeds balance': 'Insufficient USDC balance',
  'InsufficientBalance': 'Insufficient USDC balance',
  'InsufficientAllowance': 'Please approve USDC spending first',

  // Trading errors
  'SlippageExceeded': 'Price changed too much. Try increasing slippage tolerance',
  'MinSharesNotMet': 'Minimum shares not met. Try increasing slippage',
  'MinUsdcNotMet': 'Minimum USDC not met. Try increasing slippage',
  'DeadlineExpired': 'Transaction took too long. Please try again',
  'InsufficientShares': 'You do not have enough shares to sell',
  'ZeroAmount': 'Amount must be greater than zero',
  'AnswerNotActive': 'This answer is no longer active for trading',
  'QuestionNotActive': 'This question is no longer active',
  'SharesReserveViolation': 'Cannot sell - pool must keep at least 1 share',
  'PoolReserveViolation': 'Cannot sell - pool must keep at least $1',
  'PoolOverflow': 'Transaction too large for this pool',
  'SharesOverflow': 'Transaction too large for this pool',
  'exceeds max transaction gas limit': 'Transaction would fail - try selling fewer shares',

  // Question/Answer errors
  'QuestionNotFound': 'Question not found',
  'AnswerNotFound': 'Answer not found',
  'QuestionAlreadyExists': 'A question with this text already exists',
  'AnswerAlreadyExists': 'This answer has already been proposed',
  'TextTooLong': 'Text exceeds maximum length',
  'EmptyText': 'Text cannot be empty',

  // Fee errors
  'NoFeesToClaim': 'No fees available to claim',
  'InsufficientCreationFee': 'Insufficient fee for question creation',
  'InsufficientProposalStake': 'Insufficient stake for answer proposal',

  // Generic
  'reverted': 'Transaction failed',
  'rejected': 'Transaction was rejected',
  'denied': 'Transaction was denied by user',
  'User rejected': 'Transaction cancelled',
  'user rejected': 'Transaction cancelled',
};

// Common RPC/network error patterns
const NETWORK_ERROR_PATTERNS: Record<string, string> = {
  'insufficient funds': 'Insufficient ETH for gas fees',
  'nonce too low': 'Transaction nonce conflict. Please try again',
  'replacement transaction underpriced': 'Gas price too low. Please try again',
  'already known': 'Transaction already submitted',
  'transaction failed': 'Transaction failed on chain',
  'network error': 'Network connection issue. Please check your connection',
  'timeout': 'Request timed out. Please try again',
};

/**
 * Parse an error and return a user-friendly message
 */
export function parseContractError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // Convert to string for pattern matching
  const errorString = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);

  // Check for contract error patterns
  for (const [pattern, message] of Object.entries(CONTRACT_ERROR_PATTERNS)) {
    if (errorString.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // Check for network error patterns
  for (const [pattern, message] of Object.entries(NETWORK_ERROR_PATTERNS)) {
    if (errorString.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // Try to extract revert reason from error data
  const revertMatch = errorString.match(/reverted with reason string ['"](.+?)['"]/i);
  if (revertMatch) {
    return revertMatch[1];
  }

  // Try to extract custom error name
  const customErrorMatch = errorString.match(/error (\w+)\(/i);
  if (customErrorMatch) {
    // Convert camelCase to readable text
    const errorName = customErrorMatch[1]
      .replace(/([A-Z])/g, ' $1')
      .trim();
    return errorName;
  }

  // Shorten very long error messages
  if (errorString.length > 150) {
    // Try to find a meaningful part
    const shortMessage = errorString.slice(0, 150);
    const lastPeriod = shortMessage.lastIndexOf('.');
    if (lastPeriod > 50) {
      return shortMessage.slice(0, lastPeriod + 1);
    }
    return shortMessage + '...';
  }

  return errorString;
}

/**
 * Check if error is a user rejection
 */
export function isUserRejection(error: unknown): boolean {
  const errorString = error instanceof Error ? error.message : String(error);
  const lowerError = errorString.toLowerCase();

  return (
    lowerError.includes('user rejected') ||
    lowerError.includes('user denied') ||
    lowerError.includes('rejected the request') ||
    lowerError.includes('user cancelled')
  );
}

/**
 * Get error type for styling purposes
 */
export function getErrorType(error: unknown): 'warning' | 'error' | 'info' {
  if (isUserRejection(error)) {
    return 'info'; // User cancellation is not really an error
  }

  const errorString = error instanceof Error ? error.message : String(error);
  const lowerError = errorString.toLowerCase();

  // These are warnings, not hard errors
  if (
    lowerError.includes('slippage') ||
    lowerError.includes('price changed') ||
    lowerError.includes('try again')
  ) {
    return 'warning';
  }

  return 'error';
}
