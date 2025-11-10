'use client';

import { useEffect } from 'react';

export function ExtensionErrorSuppressor() {
  useEffect(() => {
    // Additional wallet provider cleanup
    const cleanupWalletProviders = () => {
      try {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const ethereum = (window as any).ethereum;
          
          // Prevent wallet provider conflicts
          if (ethereum && ethereum.providers && Array.isArray(ethereum.providers)) {
            console.log('🔧 Multiple wallet providers detected, stabilizing...');
            // Keep the first stable provider
            const stableProvider = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
            if (stableProvider) {
              Object.defineProperty(window, 'ethereum', {
                value: stableProvider,
                writable: true,
                configurable: true,
                enumerable: true
              });
            }
          }
        }
      } catch (error) {
        // Silent cleanup failure
      }
    };

    cleanupWalletProviders();

    // Suppress chrome extension errors from wallet providers
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Suppress specific extension-related errors
      if (
        message.includes('chrome.runtime.sendMessage') ||
        message.includes('Extension ID') ||
        message.includes('chrome-extension://') ||
        message.includes('inpage.js') ||
        message.includes('WebSocket connection closed abnormally') ||
        message.includes('Fatal socket error') ||
        message.includes('Connection interrupted while trying to subscribe') ||
        message.includes('opfgelmcmbiajamepnmloijbpoleiama') ||
        message.includes('Error in invocation of runtime.sendMessage') ||
        message.includes('must specify an Extension ID (string) for its first argument') ||
        message.includes('An unexpected error occurred. Please refresh the page') ||
        message.includes('React caught an error thrown by one of your components') ||
        message.includes('Cannot redefine property: ethereum') ||
        message.includes('MetaMask encountered an error setting the global Ethereum provider') ||
        message.includes('Cannot set property ethereum') ||
        message.includes('which has only a getter') ||
        message.includes('evmAsk.js') ||
        message.includes('intercept-console-error.js')
      ) {
        return; // Suppress these errors
      }
      
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Suppress specific extension-related warnings
      if (
        message.includes('chrome.runtime.sendMessage') ||
        message.includes('Extension ID') ||
        message.includes('chrome-extension://') ||
        message.includes('inpage.js') ||
        message.includes('Connection interrupted while trying to subscribe')
      ) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };

    // Global error handler for runtime errors
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      const errorString = typeof error === 'string' ? error : String(error);
      
      if (
        errorString.includes('chrome.runtime.sendMessage') ||
        errorString.includes('Extension ID') ||
        errorString.includes('chrome-extension://') ||
        errorString.includes('Connection interrupted while trying to subscribe') ||
        errorString.includes('Error in invocation of runtime.sendMessage') ||
        errorString.includes('must specify an Extension ID (string) for its first argument') ||
        event.filename?.includes('chrome-extension://') ||
        event.filename?.includes('inpage.js')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Global promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonString = typeof reason === 'string' ? reason : String(reason);
      
      if (
        reasonString.includes('chrome.runtime.sendMessage') ||
        reasonString.includes('Extension ID') ||
        reasonString.includes('chrome-extension://') ||
        reasonString.includes('Connection interrupted while trying to subscribe') ||
        reasonString.includes('Error in invocation of runtime.sendMessage') ||
        reasonString.includes('must specify an Extension ID (string) for its first argument')
      ) {
        event.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    
    // Clean up on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleGlobalError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);
  
  return null; // This component doesn't render anything
}