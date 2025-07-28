'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useOpinionDetail } from '../hooks/use-opinion-detail';
import { OpinionHeader } from '../components/opinion-header';
import { OpinionChart } from '../components/opinion-chart';
import { OpinionActivity } from '../components/opinion-activity';
import { OpinionStatsComponent, DetailedStats } from '../components/opinion-stats';
import { OpinionDetailSkeleton } from '../components/opinion-detail-skeleton';
import { TradingModal } from '@/components/TradingModal';
import { CreatePoolModal } from '@/app/pools/components/CreatePoolModal';

export default function OpinionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [showPoolCreationModal, setShowPoolCreationModal] = useState(false);

  const opinionId = parseInt(params.id as string);
  
  // Use original working hook
  const { opinion, stats, activity, loading, error } = useOpinionDetail(opinionId);

  // Validate opinion ID
  if (isNaN(opinionId) || opinionId <= 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid opinion ID. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle trade action
  const handleTrade = () => {
    if (!address) {
      // Show connect wallet prompt
      return;
    }
    setShowTradingModal(true);
  };

  // Handle pool creation action
  const handleCreatePool = () => {
    if (!address) {
      // Show connect wallet prompt
      return;
    }
    setShowPoolCreationModal(true);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Error Loading Opinion</h1>
          <p className="text-gray-400 max-w-md">{error}</p>
          <div className="flex space-x-4 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBack}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (loading || !opinion) {
    return <OpinionDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <OpinionHeader
          opinion={opinion}
          onBack={handleBack}
          onTrade={handleTrade}
          onCreatePool={handleCreatePool}
        />

        {/* Stats Cards */}
        {stats && (
          <OpinionStatsComponent
            stats={stats}
            currentPrice={Number(opinion.nextPrice) / 1_000_000}
            totalVolume={Number(opinion.totalVolume) / 1_000_000}
            loading={loading}
          />
        )}

        {/* Chart and Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Price Chart */}
          <div className="xl:col-span-1">
            <OpinionChart
              data={stats?.volumeHistory || []}
              currentPrice={Number(opinion.nextPrice) / 1_000_000}
            />
          </div>

          {/* Trading Activity */}
          <div className="xl:col-span-1">
            <OpinionActivity
              activity={activity}
              loading={loading}
            />
          </div>
        </div>

        {/* Detailed Statistics */}
        {stats && (
          <DetailedStats
            stats={stats}
            currentPrice={Number(opinion.nextPrice) / 1_000_000}
            totalVolume={Number(opinion.totalVolume) / 1_000_000}
          />
        )}

        {/* Connect Wallet Prompt */}
        {!address && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Connect Your Wallet to Trade
            </h3>
            <p className="text-gray-400 mb-4">
              Connect your wallet to start trading this opinion and submit new answers.
            </p>
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Trading Modal */}
      {showTradingModal && opinion && (
        <TradingModal
          isOpen={showTradingModal}
          opinionId={opinion.id}
          opinionData={{
            id: opinion.id,
            question: opinion.question,
            currentAnswer: opinion.currentAnswer,
            nextPrice: opinion.nextPrice,
            lastPrice: opinion.lastPrice,
            totalVolume: opinion.totalVolume,
            creator: opinion.creator,
            currentAnswerOwner: opinion.currentAnswerOwner,
            categories: opinion.categories,
            isActive: opinion.isActive,
          }}
          onClose={() => setShowTradingModal(false)}
        />
      )}

      {/* Pool Creation Modal */}
      {showPoolCreationModal && opinion && (
        <CreatePoolModal
          isOpen={showPoolCreationModal}
          opinionId={opinion.id}
          opinionData={{
            id: opinion.id,
            question: opinion.question,
            currentAnswer: opinion.currentAnswer,
            nextPrice: opinion.nextPrice,
            category: opinion.categories[0] || 'General'
          }}
          onClose={() => setShowPoolCreationModal(false)}
        />
      )}
    </div>
  );
}