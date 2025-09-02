'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import { formatUSDC, truncateAddress, getCategoryColor, cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

const SimpleOpinionsList = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get total number of opinions
  const { data: nextOpinionId, isLoading, error } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
    query: {
      enabled: mounted,
      retry: 3,
      retryDelay: 1000,
    }
  });

  const totalOpinions = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  if (!mounted) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Opinions</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (totalOpinions === 0) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opinions Yet</h3>
        <p className="text-gray-600 mb-4">Be the first to create an opinion on the market!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {totalOpinions} Opinion{totalOpinions !== 1 ? 's' : ''} Available
      </h2>
      
      {/* Opinion Cards */}
      <div className="grid gap-4">
        {Array.from({ length: totalOpinions }, (_, i) => (
          <OpinionCard key={i + 1} opinionId={i + 1} />
        ))}
      </div>
    </div>
  );
};

interface OpinionCardProps {
  opinionId: number;
}

const OpinionCard = ({ opinionId }: OpinionCardProps) => {
  // Read opinion details
  const { data: opinion, isLoading, error } = useReadContract({
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
      retry: 3,
      retryDelay: 1000,
    }
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !opinion) {
    return (
      <div className="card border-red-200">
        <p className="text-red-600 text-sm">Error loading opinion #{opinionId}</p>
      </div>
    );
  }

  if (!opinion.isActive) {
    return null; // Don't show inactive opinions
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Opinion details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {opinion.question}
            </h3>
            <span className="text-xs text-gray-500 ml-2">#{opinionId}</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Current Answer: </span>
              <span className="text-sm text-gray-900">{opinion.currentAnswer}</span>
            </div>
            
            {opinion.currentAnswerDescription && (
              <div>
                <span className="text-sm font-medium text-gray-700">Description: </span>
                <span className="text-sm text-gray-600">{opinion.currentAnswerDescription}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Owner: {truncateAddress(opinion.currentAnswerOwner)}</span>
              <span>Volume: {formatUSDC(opinion.totalVolume)}</span>
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
        <div className="flex sm:flex-col items-center sm:items-end gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">Next Price</div>
            <div className="text-xl font-bold text-gray-900">
              {nextPrice ? formatUSDC(nextPrice) : formatUSDC(opinion.nextPrice)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="btn-primary text-sm px-4 py-2">
              Buy Answer
            </button>
            {opinion.link && (
              <a
                href={opinion.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

export default SimpleOpinionsList;