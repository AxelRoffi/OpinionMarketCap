'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ExtensionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an extension-related error
    const errorMessage = error.message || String(error);
    
    if (
      errorMessage.includes('chrome.runtime.sendMessage') ||
      errorMessage.includes('Extension ID') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('Error in invocation of runtime.sendMessage') ||
      errorMessage.includes('must specify an Extension ID (string) for its first argument') ||
      errorMessage.includes('inpage.js')
    ) {
      // Don't update state for extension errors - just continue rendering
      console.debug('Suppressed extension error:', errorMessage);
      return { hasError: false };
    }

    // For non-extension errors, update state to show error UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = error.message || String(error);
    
    // Suppress extension-related errors
    if (
      errorMessage.includes('chrome.runtime.sendMessage') ||
      errorMessage.includes('Extension ID') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('Error in invocation of runtime.sendMessage') ||
      errorMessage.includes('must specify an Extension ID (string) for its first argument') ||
      errorMessage.includes('inpage.js')
    ) {
      console.debug('Suppressed extension error in componentDidCatch:', errorMessage);
      return;
    }

    // Log non-extension errors
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}