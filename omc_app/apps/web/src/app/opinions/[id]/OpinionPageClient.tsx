'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createOpinionUrl } from '@/lib/url-utils';
import { useAccount } from 'wagmi';
import { AlertCircle, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useOpinionDetail } from '../hooks/use-opinion-detail';
import { QuestionHero } from '../components/question-hero';
import { PriceBar } from '../components/price-bar';
import { AnswerHistoryPanel } from '../components/answer-history';
import { OpinionChart } from '../components/opinion-chart';
import { OpinionActivity } from '../components/opinion-activity';
import { DetailedStats } from '../components/opinion-stats';
import { OpinionDetailSkeleton } from '../components/opinion-detail-skeleton';
import { InlineTradingPanel } from '../components/inline-trading-panel';
import { MobileTradingSheet } from '../components/mobile-trading-sheet';
import { AmbientBackground } from '../components/ambient-background';
import { CreatePoolModal } from '@/app/pools/components/CreatePoolModal';
import ListForSaleModal from '@/components/modals/ListForSaleModal';
import CancelListingModal from '@/components/modals/CancelListingModal';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

const slideInRight = (delay = 0) => ({
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

export default function OpinionPageClient() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [showMobileTrading, setShowMobileTrading] = useState(false);
  const [showPoolCreationModal, setShowPoolCreationModal] = useState(false);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [showCancelListingModal, setShowCancelListingModal] = useState(false);

  const opinionId = parseInt(params.id as string);
  const { opinion, stats, activity, loading, error } = useOpinionDetail(opinionId);

  // Redirect to descriptive URL
  useEffect(() => {
    if (opinion && !loading && opinion.question) {
      const newUrl = createOpinionUrl(opinionId, opinion.question);
      const currentPath = window.location.pathname;
      if (currentPath === `/opinions/${opinionId}` && currentPath !== newUrl) {
        router.replace(newUrl);
      }
    }
  }, [opinion, loading, opinionId, router]);

  // Validate opinion ID
  if (isNaN(opinionId) || opinionId <= 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid opinion ID. Please check the URL and try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Error Loading Opinion</h1>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <div className="flex space-x-4 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !opinion) {
    return <OpinionDetailSkeleton />;
  }

  // Derived state
  const canListForSale = address?.toLowerCase() === opinion.questionOwner?.toLowerCase() &&
    (opinion.salePrice === 0n || opinion.salePrice === undefined);
  const isForSale = opinion.salePrice > 0n;
  const canCancelListing = address?.toLowerCase() === opinion.questionOwner?.toLowerCase() && isForSale;

  return (
    <div className="min-h-screen bg-background relative">
      <AmbientBackground />

      <div className="max-w-7xl mx-auto p-4 pb-24 lg:pb-4 relative z-10">
        {/* Question Hero */}
        <motion.div {...fadeUp(0)}>
          <QuestionHero opinion={opinion} />
        </motion.div>

        {/* 2-Column Layout */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left Column: Content (60%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Price Bar */}
            <motion.div {...fadeUp(0.1)}>
              <PriceBar opinion={opinion} totalTrades={stats?.totalTrades ?? 0} />
            </motion.div>

            {/* Chart */}
            <motion.div {...fadeUp(0.15)}>
              <div className="bg-card rounded-lg border border-border p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300">
                <OpinionChart
                  data={stats?.volumeHistory || []}
                  currentPrice={Number(opinion.nextPrice) / 1_000_000}
                />
              </div>
            </motion.div>

            {/* Answer History */}
            <motion.div {...fadeUp(0.2)}>
              <AnswerHistoryPanel
                opinionId={opinion.id}
                currentAnswer={opinion.currentAnswer}
              />
            </motion.div>

            {/* Activity Feed */}
            <motion.div {...fadeUp(0.25)}>
              <div className="bg-card rounded-lg border border-border p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300">
                <OpinionActivity activity={activity} loading={loading} />
              </div>
            </motion.div>

            {/* Detailed Stats */}
            {stats && (
              <motion.div {...fadeUp(0.3)}>
                <div className="bg-card rounded-lg border border-border p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300">
                  <DetailedStats
                    stats={stats}
                    currentPrice={Number(opinion.nextPrice) / 1_000_000}
                    totalVolume={Number(opinion.totalVolume) / 1_000_000}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Trading Panel (40%) - Desktop only */}
          <div className="hidden lg:block lg:col-span-2">
            <motion.div {...slideInRight(0.2)} className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <InlineTradingPanel
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
                onCreatePool={() => setShowPoolCreationModal(true)}
                onListForSale={() => setShowListForSaleModal(true)}
                onCancelListing={() => setShowCancelListingModal(true)}
                canListForSale={canListForSale}
                canCancelListing={canCancelListing}
                isForSale={isForSale}
                salePrice={opinion.salePrice}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 lg:hidden z-10">
        <div className="flex gap-2.5">
          <Button
            onClick={() => setShowMobileTrading(true)}
            className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm cta-pulse"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            Trade
          </Button>
          {opinion.nextPrice >= 100_000_000n ? (
            <Button
              onClick={() => setShowPoolCreationModal(true)}
              variant="outline"
              className="flex-1 h-11 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold text-sm"
            >
              <Target className="w-4 h-4 mr-1.5" />
              Pool
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              className="flex-1 h-11 border-border text-muted-foreground cursor-not-allowed font-semibold text-sm"
            >
              <Target className="w-4 h-4 mr-1.5" />
              Pool
            </Button>
          )}
        </div>
        {opinion.nextPrice < 100_000_000n && (
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Pool requires price ≥ 100 USDC</p>
        )}
      </div>

      {/* Mobile Trading Sheet */}
      <MobileTradingSheet
        isOpen={showMobileTrading}
        onClose={() => setShowMobileTrading(false)}
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
      />

      {/* Pool Creation Modal */}
      {showPoolCreationModal && (
        <CreatePoolModal
          isOpen={showPoolCreationModal}
          opinionId={opinion.id}
          opinionData={{
            id: opinion.id,
            question: opinion.question,
            currentAnswer: opinion.currentAnswer,
            nextPrice: opinion.nextPrice,
            category: opinion.categories[0] || 'General',
          }}
          onClose={() => setShowPoolCreationModal(false)}
        />
      )}

      {/* List For Sale Modal */}
      {showListForSaleModal && (
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
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Cancel Listing Modal */}
      {showCancelListingModal && (
        <CancelListingModal
          isOpen={showCancelListingModal}
          opinionData={{
            id: opinion.id,
            question: opinion.question,
            salePrice: opinion.salePrice,
            questionOwner: opinion.questionOwner,
          }}
          onClose={() => setShowCancelListingModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
