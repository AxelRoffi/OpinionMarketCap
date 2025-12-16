'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, ExternalLink, Copy, CheckCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { isMainnet, getBlockExplorerUrl } from '@/lib/environment';

/**
 * 🚨 TRANSACTION ERROR BOUNDARY
 * 
 * Provides comprehensive error handling and recovery for transaction failures
 * Essential for production mainnet deployment
 */

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  timestamp: number;
  retryCount: number;
  isRecoverable: boolean;
  recoveryActions: RecoveryAction[];
}

interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  isPrimary?: boolean;
}

interface TransactionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
}

class TransactionErrorBoundary extends Component<TransactionErrorBoundaryProps, ErrorState> {
  private retryTimeouts: Set<NodeJS.Timeout> = new Set();

  constructor(props: TransactionErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: 0,
      retryCount: 0,
      isRecoverable: false,
      recoveryActions: []
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const isRecoverable = TransactionErrorBoundary.determineRecoverability(error);
    
    return {
      hasError: true,
      error,
      errorId,
      timestamp: Date.now(),
      isRecoverable
    };
  }

  static determineRecoverability(error: Error): boolean {
    const recoverablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /fetch/i,
      /rate limit/i,
      /gas/i,
      /user rejected/i,
      /insufficient funds/i
    ];

    const nonRecoverablePatterns = [
      /contract/i,
      /revert/i,
      /invalid/i,
      /unauthorized/i,
      /forbidden/i
    ];

    const errorMessage = error.message.toLowerCase();
    
    // Check non-recoverable first (more serious)
    if (nonRecoverablePatterns.some(pattern => pattern.test(errorMessage))) {
      return false;
    }
    
    // Check recoverable patterns
    return recoverablePatterns.some(pattern => pattern.test(errorMessage));
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const recoveryActions = this.generateRecoveryActions(error);
    
    this.setState(prev => ({
      ...prev,
      errorInfo,
      recoveryActions
    }));

    // Log error for monitoring
    this.logError(error, errorInfo);
    
    // Call parent error handler
    this.props.onError?.(error, errorInfo);
  }

  private generateRecoveryActions(error: Error): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    const errorMessage = error.message.toLowerCase();

    // Network-related errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      actions.push({
        id: 'retry',
        label: 'Retry Connection',
        description: 'Attempt to reconnect to the network',
        action: this.handleRetry,
        isPrimary: true
      });
      
      actions.push({
        id: 'refresh',
        label: 'Refresh Page',
        description: 'Reload the page completely',
        action: this.handleRefresh
      });
    }

    // Wallet-related errors
    if (errorMessage.includes('user rejected') || errorMessage.includes('wallet')) {
      actions.push({
        id: 'reconnect',
        label: 'Reconnect Wallet',
        description: 'Try connecting your wallet again',
        action: this.handleWalletReconnect,
        isPrimary: true
      });
    }

    // Gas-related errors
    if (errorMessage.includes('gas') || errorMessage.includes('fee')) {
      actions.push({
        id: 'adjust-gas',
        label: 'Adjust Gas Price',
        description: 'Try again with different gas settings',
        action: this.handleGasAdjustment,
        isPrimary: true
      });
    }

    // Insufficient funds
    if (errorMessage.includes('insufficient')) {
      actions.push({
        id: 'check-balance',
        label: 'Check Balance',
        description: 'Verify your USDC and ETH balance',
        action: this.handleBalanceCheck,
        isPrimary: true
      });
    }

    // Always include generic retry if recoverable
    if (this.state.isRecoverable && actions.length === 0) {
      actions.push({
        id: 'retry',
        label: 'Try Again',
        description: 'Attempt the operation again',
        action: this.handleRetry,
        isPrimary: true
      });
    }

    // Support actions
    actions.push({
      id: 'support',
      label: 'Get Help',
      description: 'Contact support with error details',
      action: this.handleSupport
    });

    return actions;
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      isMainnet: isMainnet()
    };

    // In production, send to error tracking service
    console.error('Transaction Error:', errorData);
    
    // Store in localStorage for debugging
    try {
      const errorHistory = JSON.parse(localStorage.getItem('opinionmarket_errors') || '[]');
      errorHistory.push(errorData);
      // Keep only last 10 errors
      if (errorHistory.length > 10) errorHistory.shift();
      localStorage.setItem('opinionmarket_errors', JSON.stringify(errorHistory));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount >= (this.props.maxRetries || 3)) {
      alert('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    this.setState(prev => ({
      ...prev,
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1
    }));
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleWalletReconnect = () => {
    // Clear wallet connection storage
    localStorage.removeItem('opinionmarket.wallet.state');
    localStorage.removeItem('opinionmarket.wallet.state.backup');
    
    // Trigger page refresh to reset wallet state
    window.location.reload();
  };

  private handleGasAdjustment = () => {
    // Reset error and return to transaction with suggestion to adjust gas
    alert('Try adjusting your gas price settings in the transaction modal.');
    this.handleRetry();
  };

  private handleBalanceCheck = () => {
    // Open user's wallet or profile to check balance
    alert('Please check your USDC and ETH balance before trying again.');
    this.handleRetry();
  };

  private handleSupport = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: new Date(this.state.timestamp).toISOString(),
      message: this.state.error?.message || 'Unknown error',
      isMainnet: isMainnet()
    };
    
    const supportUrl = `mailto:support@opinionmarketcap.com?subject=Transaction Error ${this.state.errorId}&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorDetails, null, 2)}\n\nPlease describe what you were trying to do when this error occurred.`
    )}`;
    
    window.open(supportUrl);
  };

  private copyErrorId = async () => {
    try {
      await navigator.clipboard.writeText(this.state.errorId);
      // Show temporary success feedback
      const button = document.getElementById('copy-error-button');
      if (button) {
        button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Copied!';
        setTimeout(() => {
          if (button) button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 011-1h2a1 1 0 011 1v3h3a1 1 0 011 1v2a1 1 0 01-1 1h-3v3a1 1 0 01-1 1H9a1 1 0 01-1-1v-3H5a1 1 0 01-1-1V7a1 1 0 011-1h3V3z"></path></svg>Copy Error ID';
        }, 2000);
      }
    } catch (e) {
      console.error('Failed to copy error ID:', e);
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { error, errorId, timestamp, retryCount, isRecoverable, recoveryActions } = this.state;
    const isMainnetEnv = isMainnet();

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">
              {isRecoverable ? 'Transaction Error' : 'Critical System Error'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isRecoverable 
                ? 'Something went wrong with your transaction, but it may be recoverable.'
                : 'A serious error occurred. Please contact support for assistance.'
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mainnet Warning */}
            {isMainnetEnv && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Mainnet Transaction Error</strong><br />
                  Your real money transaction failed. Please review the error and try the suggested recovery actions.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Details */}
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">Error Details</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {error?.message || 'An unknown error occurred'}
                    </p>
                  </div>
                  <Badge variant={isRecoverable ? "secondary" : "destructive"}>
                    {isRecoverable ? 'Recoverable' : 'Critical'}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Error ID:</span>
                    <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                      {errorId}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <div className="text-xs mt-1">
                      {new Date(timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {retryCount > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">Retry attempts:</span> {retryCount}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recovery Actions */}
            {recoveryActions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Recovery Options</h4>
                <div className="grid gap-2">
                  {recoveryActions.map(action => (
                    <Button
                      key={action.id}
                      variant={action.isPrimary ? "default" : "outline"}
                      onClick={action.action}
                      className="justify-start text-left h-auto py-3"
                    >
                      <div>
                        <div className="font-medium">{action.label}</div>
                        <div className="text-sm opacity-75">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Support Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                id="copy-error-button"
                variant="outline"
                size="sm"
                onClick={this.copyErrorId}
                className="text-xs"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Error ID
              </Button>
              
              {isMainnetEnv && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getBlockExplorerUrl(), '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              )}
            </div>

            {/* Emergency Contact */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Need immediate help?</strong><br />
                Contact our support team with Error ID: <code className="bg-white px-1 rounded">{errorId}</code>
                <br />
                Email: <a href={`mailto:support@opinionmarketcap.com?subject=Error ${errorId}`} className="underline">
                  support@opinionmarketcap.com
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  componentWillUnmount() {
    // Clear any pending timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }
}

export default TransactionErrorBoundary;