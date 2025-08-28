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
        message.includes('Fatal socket error')
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
        message.includes('inpage.js')
      ) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };
    
    // Clean up on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
  
  return null; // This component doesn't render anything
}