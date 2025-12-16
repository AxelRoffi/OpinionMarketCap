'use client';

import React from 'react';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import { 
  getCurrentEnvironment, 
  getEnvironmentDisplayName, 
  getEnvironmentWarning,
  isMainnet,
  isTestnet,
  ENV 
} from '@/lib/environment';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

/**
 * 🌍 ENVIRONMENT BANNER
 * 
 * Displays current environment status and warnings
 * Critical for user awareness of mainnet vs testnet
 */

interface EnvironmentBannerProps {
  className?: string;
  showDetails?: boolean;
}

export function EnvironmentBanner({ className = "", showDetails = false }: EnvironmentBannerProps) {
  const environment = getCurrentEnvironment();
  const displayName = getEnvironmentDisplayName();
  const warning = getEnvironmentWarning();
  
  // Don't show banner in production mainnet (unless explicitly requested)
  if (isMainnet() && !showDetails && !process.env.NEXT_PUBLIC_SHOW_ENV_BANNER) {
    return null;
  }
  
  const isMainnetEnv = isMainnet();
  const isTestnetEnv = isTestnet();
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Environment Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isMainnetEnv ? "destructive" : "secondary"}
            className={`
              ${isMainnetEnv ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'}
              font-medium px-3 py-1
            `}
          >
            {isMainnetEnv && <Zap className="w-3 h-3 mr-1" />}
            {isTestnetEnv && <Info className="w-3 h-3 mr-1" />}
            {displayName}
          </Badge>
          
          <span className="text-sm text-gray-500">
            Chain ID: {ENV.chainId}
          </span>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isMainnetEnv ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-xs text-gray-500">
            {isMainnetEnv ? 'Live' : 'Test'}
          </span>
        </div>
      </div>
      
      {/* Warning Alert */}
      {warning && (
        <Alert className={isMainnetEnv ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
          <AlertTriangle className={`h-4 w-4 ${isMainnetEnv ? 'text-red-600' : 'text-yellow-600'}`} />
          <AlertDescription className={isMainnetEnv ? 'text-red-800' : 'text-yellow-800'}>
            {warning}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Detailed Information */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Network Details</h4>
              <div className="space-y-1 text-gray-600">
                <div>Environment: <code className="bg-gray-200 px-1 rounded">{environment}</code></div>
                <div>Chain ID: <code className="bg-gray-200 px-1 rounded">{ENV.chainId}</code></div>
                <div>Explorer: <a href={ENV.blockExplorer.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{ENV.blockExplorer.name}</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Contract Addresses</h4>
              <div className="space-y-1 text-gray-600 text-xs">
                <div>USDC: <code className="bg-gray-200 px-1 rounded">{ENV.usdc.ADDRESS.slice(0, 10)}...{ENV.usdc.ADDRESS.slice(-8)}</code></div>
                <div>OpinionCore: <code className="bg-gray-200 px-1 rounded">{ENV.contracts.OPINION_CORE.slice(0, 10)}...{ENV.contracts.OPINION_CORE.slice(-8)}</code></div>
                <div>Treasury: <code className="bg-gray-200 px-1 rounded">{ENV.treasury.slice(0, 10)}...{ENV.treasury.slice(-8)}</code></div>
              </div>
            </div>
          </div>
          
          {/* Feature Flags */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Active Features</h4>
            <div className="flex flex-wrap gap-2">
              {ENV.features.ENABLE_PUBLIC_CREATION && (
                <Badge variant="outline" className="text-xs">Public Creation</Badge>
              )}
              {ENV.features.ENABLE_DEBUG_MODE && (
                <Badge variant="outline" className="text-xs">Debug Mode</Badge>
              )}
              {ENV.features.ENABLE_ADMIN_PANEL && (
                <Badge variant="outline" className="text-xs">Admin Panel</Badge>
              )}
              {isMainnetEnv && (
                <Badge variant="outline" className="text-xs text-red-600 border-red-200">Production Mode</Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for environment status
export function useEnvironmentStatus() {
  const environment = getCurrentEnvironment();
  const displayName = getEnvironmentDisplayName();
  const warning = getEnvironmentWarning();
  
  return {
    environment,
    displayName,
    warning,
    isMainnet: isMainnet(),
    isTestnet: isTestnet(),
    config: ENV,
  };
}

// Environment-aware transaction warning
export function TransactionWarning({ className = "" }: { className?: string }) {
  const { isMainnet: isMainnetEnv, warning } = useEnvironmentStatus();
  
  if (!isMainnetEnv) return null;
  
  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <strong>Real Money Transaction:</strong> You are about to spend real USDC on Base Mainnet. 
        Please verify all details before confirming.
      </AlertDescription>
    </Alert>
  );
}

export default EnvironmentBanner;