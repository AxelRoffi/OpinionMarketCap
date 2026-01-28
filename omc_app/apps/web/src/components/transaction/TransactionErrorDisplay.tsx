'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  Wallet,
  DollarSign,
  Shield,
  Wifi,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParsedError, ErrorType, ValidationResult } from '@/lib/errors';

// ============================================================================
// Error Icon Component
// ============================================================================

interface ErrorIconProps {
  type: ErrorType;
  className?: string;
}

export function ErrorIcon({ type, className = 'w-5 h-5' }: ErrorIconProps) {
  switch (type) {
    case 'insufficient_balance':
      return <DollarSign className={`${className} text-red-400`} />;
    case 'insufficient_allowance':
      return <Shield className={`${className} text-yellow-400`} />;
    case 'user_rejected':
      return <XCircle className={`${className} text-gray-400`} />;
    case 'network_error':
      return <Wifi className={`${className} text-orange-400`} />;
    case 'gas_estimation_failed':
      return <AlertTriangle className={`${className} text-orange-400`} />;
    case 'unauthorized':
      return <Shield className={`${className} text-red-400`} />;
    case 'validation_error':
      return <Info className={`${className} text-yellow-400`} />;
    case 'pool_error':
    case 'opinion_not_found':
    case 'opinion_not_active':
    case 'contract_error':
    default:
      return <AlertCircle className={`${className} text-red-400`} />;
  }
}

// ============================================================================
// Pre-Validation Alert
// ============================================================================

interface PreValidationAlertProps {
  validation: ValidationResult | null;
  onDismiss?: () => void;
}

export function PreValidationAlert({ validation, onDismiss }: PreValidationAlertProps) {
  if (!validation || validation.valid || validation.errors.length === 0) {
    return null;
  }

  const error = validation.errors[0];
  const bgColor = error.type === 'insufficient_balance'
    ? 'bg-red-900/20 border-red-500/50'
    : 'bg-yellow-900/20 border-yellow-500/50';
  const textColor = error.type === 'insufficient_balance'
    ? 'text-red-400'
    : 'text-yellow-400';

  return (
    <Alert className={bgColor}>
      <ErrorIcon type={error.type} className="w-4 h-4" />
      <AlertTitle className={textColor}>{error.title}</AlertTitle>
      <AlertDescription className={`${textColor} opacity-90`}>
        {error.message}
        {error.suggestion && (
          <span className="block mt-1 text-sm opacity-80">{error.suggestion}</span>
        )}
      </AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </Alert>
  );
}

// ============================================================================
// Inline Error Message
// ============================================================================

interface InlineErrorProps {
  error: ParsedError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, onDismiss, className = '' }: InlineErrorProps) {
  if (!error) return null;

  const bgColor = error.type === 'user_rejected'
    ? 'bg-muted/50 border-border'
    : error.type.includes('insufficient') || error.type === 'unauthorized'
    ? 'bg-red-900/20 border-red-500/30'
    : 'bg-yellow-900/20 border-yellow-500/30';

  const textColor = error.type === 'user_rejected'
    ? 'text-muted-foreground'
    : error.type.includes('insufficient') || error.type === 'unauthorized'
    ? 'text-red-400'
    : 'text-yellow-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border p-4 ${bgColor} ${className}`}
    >
      <div className="flex items-start gap-3">
        <ErrorIcon type={error.type} className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${textColor}`}>{error.title}</h4>
          <p className={`text-sm mt-1 ${textColor} opacity-90`}>{error.message}</p>
          {error.suggestion && (
            <p className="text-sm mt-1 text-muted-foreground">{error.suggestion}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error.retryable && onRetry && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Full Error State Component
// ============================================================================

interface ErrorStateProps {
  error: ParsedError;
  onRetry?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  showTechnicalDetails?: boolean;
}

export function ErrorState({
  error,
  onRetry,
  onBack,
  onClose,
  showTechnicalDetails = false,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      {/* Error Icon */}
      <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
        <ErrorIcon type={error.type} className="w-8 h-8" />
      </div>

      {/* Error Message */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{error.title}</h3>
        <p className="text-muted-foreground">{error.message}</p>
        {error.suggestion && (
          <p className="text-sm text-muted-foreground mt-2">{error.suggestion}</p>
        )}
      </div>

      {/* Specific Help for Common Errors */}
      {error.type === 'insufficient_balance' && (
        <Card className="bg-blue-900/20 border-blue-500/30 text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              How to add USDC
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your wallet (MetaMask, Coinbase, etc.)</li>
              <li>Buy or bridge USDC to Base network</li>
              <li>Return here and try again</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {error.type === 'insufficient_allowance' && (
        <Card className="bg-yellow-900/20 border-yellow-500/30 text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              About USDC Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Before trading, you need to approve the contract to use your USDC.
              This is a one-time approval for security.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      {showTechnicalDetails && error.technicalDetails && (
        <div className="text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {showDetails ? 'Hide' : 'Show'} technical details
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
              {error.technicalDetails}
            </pre>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            Go Back
          </Button>
        )}
        {error.retryable && onRetry && (
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onClose && !error.retryable && (
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
          >
            Close
          </Button>
        )}
      </div>

      {/* Form Data Preserved Message */}
      {error.retryable && (
        <p className="text-xs text-muted-foreground">
          Your form data has been preserved
        </p>
      )}
    </motion.div>
  );
}

// ============================================================================
// Balance Warning Component
// ============================================================================

interface BalanceWarningProps {
  requiredAmount: bigint;
  currentBalance: bigint | undefined;
  label?: string;
}

export function BalanceWarning({ requiredAmount, currentBalance, label = 'USDC' }: BalanceWarningProps) {
  const formatAmount = (wei: bigint) => {
    const amount = Number(wei) / 1_000_000;
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const hasEnough = currentBalance !== undefined && currentBalance >= requiredAmount;

  if (hasEnough) return null;

  const needed = requiredAmount - (currentBalance || BigInt(0));

  return (
    <Alert className="bg-red-900/20 border-red-500/50">
      <DollarSign className="w-4 h-4 text-red-400" />
      <AlertDescription className="text-red-400">
        <span className="font-medium">Insufficient {label} balance.</span>
        <span className="block mt-1">
          You need {formatAmount(requiredAmount)} but only have {formatAmount(currentBalance || BigInt(0))}.
          <span className="font-medium"> Add {formatAmount(needed)} more.</span>
        </span>
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// Allowance Info Component
// ============================================================================

interface AllowanceInfoProps {
  requiredAmount: bigint;
  currentAllowance: bigint | undefined;
  onApprovalTypeChange?: (useInfinite: boolean) => void;
  useInfiniteApproval?: boolean;
}

export function AllowanceInfo({
  requiredAmount,
  currentAllowance,
  onApprovalTypeChange,
  useInfiniteApproval = true,
}: AllowanceInfoProps) {
  const needsApproval = !currentAllowance || currentAllowance < requiredAmount;

  if (!needsApproval) return null;

  const formatAmount = (wei: bigint) => {
    const amount = Number(wei) / 1_000_000;
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="bg-yellow-900/20 border-yellow-500/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          USDC Approval Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          This is your first transaction. You need to approve USDC spending.
          {currentAllowance && currentAllowance > BigInt(0) && (
            <span className="block text-yellow-400 mt-1">
              Current approval: {formatAmount(currentAllowance)} (need {formatAmount(requiredAmount)})
            </span>
          )}
        </p>

        {onApprovalTypeChange && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="infinite-approval"
              checked={useInfiniteApproval}
              onChange={(e) => onApprovalTypeChange(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <label htmlFor="infinite-approval" className="text-sm">
              Large approval for future trades (1M USDC)
            </label>
          </div>
        )}

        <p className="text-xs text-yellow-400">
          {useInfiniteApproval
            ? 'Recommended: Approve once for all future transactions'
            : 'You\'ll need to approve each transaction individually'}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default {
  ErrorIcon,
  PreValidationAlert,
  InlineError,
  ErrorState,
  BalanceWarning,
  AllowanceInfo,
};
