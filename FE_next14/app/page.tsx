'use client';

import { useReadContract } from 'wagmi';
import { TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import { formatUSDC, truncateAddress } from '@/lib/utils';
import Header from '@/components/Header';

export default function HomePage() {
  // Get total opinions
  const { data: nextOpinionId } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  const totalOpinions = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={() => window.location.reload()} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Opinions</p>
                <p className="text-2xl font-bold text-gray-900">{totalOpinions}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Network</p>
                <p className="text-2xl font-bold text-gray-900">Base Sepolia</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-900">Live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Opinion Markets</h2>
              <p className="text-gray-600 mt-1">Trade opinion ownership and earn from being right</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Opinions */}
          {totalOpinions === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opinions Yet</h3>
              <p className="text-gray-600">Be the first to create an opinion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {totalOpinions} Opinion{totalOpinions !== 1 ? 's' : ''} Available
              </h3>
              
              <div className="grid gap-4">
                {Array.from({ length: totalOpinions }, (_, i) => (
                  <OpinionCard key={i + 1} opinionId={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const OpinionCard = ({ opinionId }: { opinionId: number }) => {
  const { data: opinion, isLoading, error } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(opinionId)],
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
        <p className="text-red-600 text-sm">Failed to load opinion #{opinionId}</p>
      </div>
    );
  }

  if (!opinion.isActive) {
    return null;
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">{opinion.question}</h4>
            <span className="text-xs text-gray-500 ml-2">#{opinionId}</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Current Answer: </span>
              <span className="text-sm text-gray-900">{opinion.currentAnswer}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Owner: {truncateAddress(opinion.currentAnswerOwner)}</span>
              <span>Volume: {formatUSDC(Number(opinion.totalVolume))}</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">Next Price</div>
            <div className="text-xl font-bold text-gray-900">
              {formatUSDC(Number(opinion.nextPrice))}
            </div>
          </div>
          
          <button className="btn-primary text-sm px-4 py-2">
            Buy Answer
          </button>
        </div>
      </div>
    </div>
  );
};