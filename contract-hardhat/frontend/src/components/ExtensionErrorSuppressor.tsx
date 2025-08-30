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
        message.includes('opfgelmcmbiajamepnmloijbpoleiama')
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
      if (
        (error && typeof error === 'string' && (
          error.includes('chrome.runtime.sendMessage') ||
          error.includes('Extension ID') ||
          error.includes('chrome-extension://') ||
          error.includes('Connection interrupted while trying to subscribe')
        )) ||
        event.filename?.includes('chrome-extension://')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Global promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason && typeof reason === 'string' && (
          reason.includes('chrome.runtime.sendMessage') ||
          reason.includes('Extension ID') ||
          reason.includes('chrome-extension://') ||
          reason.includes('Connection interrupted while trying to subscribe')
        )
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