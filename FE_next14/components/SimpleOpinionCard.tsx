'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import { formatUSDC, truncateAddress, getCategoryColor, cn } from '@/lib/utils';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface SimpleOpinionCardProps {
  opinionId: number;
}

const SimpleOpinionCard = ({ opinionId }: SimpleOpinionCardProps) => {
  const [retryCount, setRetryCount] = useState(0);

  // Read opinion details with retry logic
  const { 
    data: opinion, 
    isLoading, 
    error,
    refetch 
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(opinionId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    }
  });

  // Read next price
  const { data: nextPrice } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getNextPrice',
    args: [BigInt(opinionId)],
    query: {
      enabled: !!opinion && opinion.isActive,
      retry: 2,
    }
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Auto-retry after 3 seconds if error
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-600 font-medium">Error loading opinion #{opinionId}</p>
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
            {retryCount > 0 && (
              <p className="text-xs text-red-400 mt-1">Retry attempt {retryCount}/3</p>
            )}
          </div>
          <button
            onClick={handleRetry}
            disabled={retryCount >= 3}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className="card border-gray-200">
        <p className="text-gray-500">No data for opinion #{opinionId}</p>
      </div>
    );
  }

  if (!opinion.isActive) {
    return (
      <div className="card border-gray-200 opacity-50">
        <p className="text-gray-500">Opinion #{opinionId} is inactive</p>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow border-l-4 border-l-primary-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Opinion details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {opinion.question}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">#{opinionId}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div>
                <span className="text-sm font-medium text-gray-700">Answer: </span>
                <span className="text-sm font-semibold text-gray-900">{opinion.currentAnswer}</span>
              </div>
              
              {opinion.currentAnswerDescription && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Note: </span>
                  <span className="text-sm text-gray-600">{opinion.currentAnswerDescription}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>Owner: <code className="text-xs">{truncateAddress(opinion.currentAnswerOwner)}</code></span>
              <span>Volume: <strong>{formatUSDC(opinion.totalVolume)}</strong></span>
              <span>Last Price: <strong>{formatUSDC(opinion.lastPrice)}</strong></span>
            </div>
          </div>

          {/* Categories */}
          {opinion.categories && opinion.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {opinion.categories.map((category: string) => (
                <span
                  key={category}
                  className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoryColor(category))}
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Price and actions */}
        <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:text-right">
          <div>
            <div className="text-sm text-gray-600">Next Price</div>
            <div className="text-2xl font-bold text-primary-600">
              {nextPrice ? formatUSDC(nextPrice) : formatUSDC(opinion.nextPrice || opinion.lastPrice)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
              Buy Answer
            </button>
            {opinion.link && (
              <a
                href={opinion.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="External Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleOpinionCard;