'use client';

import { useEffect } from 'react';

export function ExtensionErrorSuppressor() {
  useEffect(() => {
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
        message.includes('must specify an Extension ID (string) for its first argument')
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