'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PoolPageError({ error, reset }: ErrorProps) {
  const router = useRouter();

  const handleBackToPoolsClick = () => {
    router.push('/pools');
  };

  const getErrorMessage = (error: Error) => {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return {
        title: 'Pool Not Found',
        description: 'The pool you\'re looking for doesn\'t exist or may have been removed.',
        showRetry: false
      };
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Connection Error',
        description: 'Unable to load pool data. Please check your internet connection and try again.',
        showRetry: true
      };
    }

    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred while loading this pool.',
      showRetry: true
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          onClick={handleBackToPoolsClick}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pools
        </Button>

        {/* Error Content */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              
              <h1 className="text-2xl font-bold text-white mb-4">
                {errorInfo.title}
              </h1>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                {errorInfo.description}
              </p>

              <div className="space-y-3">
                {errorInfo.showRetry && (
                  <Button
                    onClick={reset}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleBackToPoolsClick}
                  className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Pools
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 bg-slate-900 p-3 rounded overflow-x-auto">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}