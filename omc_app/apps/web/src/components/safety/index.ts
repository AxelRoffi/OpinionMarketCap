/**
 * 🛡️ SAFETY COMPONENTS INDEX
 * 
 * Comprehensive production safety system for OpinionMarketCap
 * All components designed for mainnet real money transactions
 */

// Core Safety Components
export { TransactionSafetyModal } from './TransactionSafetyModal';
export type { TransactionDetails, SafetyConfirmationOptions } from './TransactionSafetyModal';

export { SlippageProtection } from './SlippageProtection';
export { GasPriceWarning } from './GasPriceWarning';
export { default as TransactionErrorBoundary } from './TransactionErrorBoundary';
export { SystemStatus } from './SystemStatus';
export { TransactionHistory, useTransactionHistory } from './TransactionHistory';

// Education Components
export { UserEducationModal } from '../education/UserEducationModal';

// Safety Hooks and Utilities
export const SafetyUtils = {
  /**
   * Check if user has completed required education
   */
  hasCompletedEducation: (variant: 'first-time' | 'mainnet-warning' = 'first-time'): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`opinionmarket.education.${variant}`) === 'completed';
  },

  /**
   * Mark education as completed
   */
  markEducationCompleted: (variant: 'first-time' | 'mainnet-warning' = 'first-time'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`opinionmarket.education.${variant}`, 'completed');
    localStorage.setItem(`opinionmarket.education.${variant}.timestamp`, Date.now().toString());
  },

  /**
   * Check if education needs refresh (older than 30 days for mainnet warning)
   */
  needsEducationRefresh: (variant: 'first-time' | 'mainnet-warning' = 'mainnet-warning'): boolean => {
    if (typeof window === 'undefined') return false;
    
    const timestamp = localStorage.getItem(`opinionmarket.education.${variant}.timestamp`);
    if (!timestamp) return true;
    
    const daysSince = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
    return variant === 'mainnet-warning' ? daysSince > 30 : daysSince > 90;
  },

  /**
   * Get user's safety settings
   */
  getSafetySettings: () => {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('opinionmarket.safety.settings');
    return stored ? JSON.parse(stored) : {
      defaultSlippageTolerance: 2.0,
      maxGasPrice: 5, // gwei
      requireConfirmation: true,
      showWarnings: true,
      enableEducation: true
    };
  },

  /**
   * Update user's safety settings
   */
  updateSafetySettings: (settings: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('opinionmarket.safety.settings', JSON.stringify(settings));
  },

  /**
   * Log a safety event for analytics
   */
  logSafetyEvent: (event: string, data?: any): void => {
    console.log(`[Safety] ${event}:`, data);
    
    // In production, send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'safety_interaction', {
        event_category: 'safety',
        event_label: event,
        custom_parameter: data
      });
    }
  },

  /**
   * Check system readiness for transactions
   */
  checkSystemReadiness: async (): Promise<{
    ready: boolean;
    issues: string[];
    warnings: string[];
  }> => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if education is completed
    if (!SafetyUtils.hasCompletedEducation('first-time')) {
      issues.push('User education not completed');
    }

    // Check for mainnet education
    const { isMainnet } = await import('../../lib/environment');
    if (isMainnet() && !SafetyUtils.hasCompletedEducation('mainnet-warning')) {
      issues.push('Mainnet safety education not completed');
    }

    // Check if education needs refresh
    if (SafetyUtils.needsEducationRefresh('mainnet-warning')) {
      warnings.push('Safety education may need refreshing');
    }

    // Check wallet connection
    if (typeof window !== 'undefined') {
      const walletConnected = localStorage.getItem('opinionmarket.wallet.state');
      if (!walletConnected) {
        issues.push('Wallet not connected');
      }
    }

    return {
      ready: issues.length === 0,
      issues,
      warnings
    };
  }
};

// Safety Configuration Constants
export const SAFETY_CONFIG = {
  // Minimum delays for safety confirmation
  CONFIRMATION_DELAYS: {
    TESTNET: 0, // seconds
    MAINNET_SMALL: 3, // < $100
    MAINNET_MEDIUM: 5, // $100-$1000
    MAINNET_LARGE: 10 // > $1000
  },

  // Default slippage tolerances
  SLIPPAGE_DEFAULTS: {
    CONSERVATIVE: 0.5, // %
    NORMAL: 2.0, // %
    AGGRESSIVE: 5.0 // %
  },

  // Gas price thresholds (gwei)
  GAS_THRESHOLDS: {
    LOW: 2,
    NORMAL: 5,
    HIGH: 15,
    EXTREME: 30
  },

  // Education refresh intervals (days)
  EDUCATION_REFRESH: {
    FIRST_TIME: 90,
    MAINNET_WARNING: 30,
    SAFETY_FEATURES: 60
  }
} as const;

// Safety Component Props Templates
export interface SafetyComponentProps {
  className?: string;
  onSafetyEvent?: (event: string, data?: any) => void;
}

// Safety Context Types
export interface SafetyContextValue {
  isEducationRequired: boolean;
  hasCompletedMainnetEducation: boolean;
  safetySettings: any;
  updateSafetySettings: (settings: any) => void;
  checkTransactionSafety: (details: any) => Promise<boolean>;
}

// Import the type for internal use
import type { TransactionDetails } from './TransactionSafetyModal';

// Export safety validation functions
export const validateTransactionSafety = async (
  transactionDetails: TransactionDetails
): Promise<{
  safe: boolean;
  warnings: string[];
  blockingIssues: string[];
}> => {
  const warnings: string[] = [];
  const blockingIssues: string[] = [];

  // Check education completion
  const { isMainnet } = await import('../../lib/environment');
  if (isMainnet() && !SafetyUtils.hasCompletedEducation('mainnet-warning')) {
    blockingIssues.push('Mainnet safety education required');
  }

  // Check transaction amount
  const amountUSD = Number(transactionDetails.amount) / 1_000_000;
  if (amountUSD > 1000) {
    warnings.push('Large transaction amount detected');
  }

  // Check for price impact
  if (transactionDetails.additionalInfo?.newPrice && transactionDetails.additionalInfo?.oldPrice) {
    const oldPrice = Number(transactionDetails.additionalInfo.oldPrice);
    const newPrice = Number(transactionDetails.additionalInfo.newPrice);
    const impact = ((newPrice - oldPrice) / oldPrice) * 100;
    
    if (Math.abs(impact) > 50) {
      warnings.push('Extreme price impact detected');
    } else if (Math.abs(impact) > 20) {
      warnings.push('High price impact');
    }
  }

  return {
    safe: blockingIssues.length === 0,
    warnings,
    blockingIssues
  };
};