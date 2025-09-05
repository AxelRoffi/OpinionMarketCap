'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useOpinionDetail } from '../hooks/use-opinion-detail';
import { OpinionHeader } from '../components/opinion-header';
import { OpinionChart } from '../components/opinion-chart';
import { OpinionActivity } from '../components/opinion-activity';
import { OpinionStatsComponent, DetailedStats } from '../components/opinion-stats';
import { OpinionDetailSkeleton } from '../components/opinion-detail-skeleton';
import { TradingModal } from '@/components/TradingModal';
import { CreatePoolModal } from '@/app/pools/components/CreatePoolModal';
import ListForSaleModal from '@/components/modals/ListForSaleModal';
import CancelListingModal from '@/components/modals/CancelListingModal';

export default function OpinionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [showPoolCreationModal, setShowPoolCreationModal] = useState(false);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [showCancelListingModal, setShowCancelListingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');

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

  // Handle list for sale action
  const handleListForSale = () => {
    if (!address) {
      // Show connect wallet prompt
      return;
    }
    setShowListForSaleModal(true);
  };

  // Handle cancel listing action
  const handleCancelListing = () => {
    if (!address) {
      // Show connect wallet prompt
      return;
    }
    setShowCancelListingModal(true);
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
      <div className="max-w-6xl mx-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* Hero Section */}
        <OpinionHeader
          opinion={opinion}
          onBack={handleBack}
          onTrade={handleTrade}
          onCreatePool={handleCreatePool}
          onListForSale={handleListForSale}
          onCancelListing={handleCancelListing}
        />

        {/* Key Stats Row */}
        {stats && (
          <OpinionStatsComponent
            stats={stats}
            currentPrice={Number(opinion.nextPrice) / 1_000_000}
            totalVolume={Number(opinion.totalVolume) / 1_000_000}
            loading={loading}
          />
        )}

        {/* Main Content Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50 rounded-t-lg">
              <TabsTrigger value="chart" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Chart
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Activity
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="p-6 m-0">
              <OpinionChart
                data={stats?.volumeHistory || []}
                currentPrice={Number(opinion.nextPrice) / 1_000_000}
              />
            </TabsContent>
            
            <TabsContent value="activity" className="p-6 m-0">
              <OpinionActivity
                activity={activity}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="details" className="p-6 m-0">
              {stats && (
                <DetailedStats
                  stats={stats}
                  currentPrice={Number(opinion.nextPrice) / 1_000_000}
                  totalVolume={Number(opinion.totalVolume) / 1_000_000}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

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

      {/* Sticky Action Panel (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 md:hidden z-10">
        <div className="flex gap-3">
          <Button
            onClick={handleTrade}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
          >
            Trade
          </Button>
          <Button
            onClick={handleCreatePool}
            variant="outline"
            className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            Pool
          </Button>
        </div>
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

      {/* List For Sale Modal */}
      {showListForSaleModal && opinion && (
        <ListForSaleModal
          isOpen={showListForSaleModal}
          opinionData={{
            id: opinion.id,
            question: opinion.question,
            currentAnswer: opinion.currentAnswer,
            nextPrice: opinion.nextPrice,
            lastPrice: opinion.lastPrice,
            totalVolume: opinion.totalVolume,
            questionOwner: opinion.questionOwner,
            salePrice: opinion.salePrice,
            isActive: opinion.isActive,
            creator: opinion.creator,
          }}
          onClose={() => setShowListForSaleModal(false)}
          onSuccess={() => {
            // Refresh the page to show updated sale status
            window.location.reload();
          }}
        />
      )}

      {/* Cancel Listing Modal */}
      {showCancelListingModal && opinion && (
        <CancelListingModal
          isOpen={showCancelListingModal}
          opinionData={{
            id: opinion.id,
            question: opinion.question,
            salePrice: opinion.salePrice,
            questionOwner: opinion.questionOwner,
          }}
          onClose={() => setShowCancelListingModal(false)}
          onSuccess={() => {
            // Refresh the page to show updated sale status
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}