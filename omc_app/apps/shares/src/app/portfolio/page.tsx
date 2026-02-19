'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, Loader2 } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { BuySharesModal, SellSharesModal, MobileTradingSheet } from '@/components/trading';
import {
  ProfileHero,
  ProfileStatCards,
  SecondaryStatCards,
  TraderSummary,
  CategoryBreakdown,
  FeeBanner,
  PositionsList,
  TopPositions,
} from '@/components/portfolio';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useClaimFees, useClaimKingFees, useIsMobile } from '@/hooks';
import type { Answer, UserPosition } from '@/lib/contracts';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const isMobile = useIsMobile();

  // User profile data
  const { stats, positions, loading, error, refetchFees } = useUserProfile(address);

  // Fee claiming
  const { claim, isPending: isClaimingFees, isSuccess: claimSuccess, error: claimError, txHash } = useClaimFees({
    onSuccess: () => {
      refetchFees();
    },
  });

  // King fee claiming
  const { claimKingFees, isPending: isClaimingKingFees } = useClaimKingFees();

  // Modal states
  const [buyingAnswer, setBuyingAnswer] = useState<Answer | null>(null);
  const [sellingAnswer, setSellingAnswer] = useState<Answer | null>(null);
  const [sellingPosition, setSellingPosition] = useState<UserPosition | undefined>(undefined);

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Connect your wallet to view your portfolio</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-red-500/30 p-8 text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Error Loading Portfolio</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Profile Hero */}
        <motion.div {...fadeUp(0)}>
          <ProfileHero
            stats={stats}
            targetAddress={address!}
            isOwnProfile={true}
          />
        </motion.div>

        {/* Primary Stat Cards */}
        <motion.div {...fadeUp(0.1)}>
          <ProfileStatCards stats={stats} />
        </motion.div>

        {/* Trader Summary */}
        <motion.div {...fadeUp(0.15)}>
          <TraderSummary stats={stats} />
        </motion.div>

        {/* Secondary Stats + Category Breakdown */}
        <motion.div {...fadeUp(0.2)}>
          <div className="grid md:grid-cols-2 gap-4">
            <SecondaryStatCards stats={stats} />
            <div className="md:col-span-1">
              <CategoryBreakdown topCategories={stats.topCategories} />
            </div>
          </div>
        </motion.div>

        {/* Fee Banner */}
        <motion.div {...fadeUp(0.25)}>
          <FeeBanner
            accumulatedFees={stats.accumulatedFees}
            totalKingFees={stats.totalKingFees}
            onClaimFees={claim}
            isClaimingFees={isClaimingFees}
            claimSuccess={claimSuccess}
            claimError={claimError}
            transactionHash={txHash}
            isOwnProfile={true}
          />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div {...fadeUp(0.3)}>
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Positions List - 2 columns */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-3">Your Positions</h2>
              <PositionsList
                positions={positions}
                isLoading={loading}
                onBuy={(answer) => setBuyingAnswer(answer)}
                onSell={(answer, position) => {
                  setSellingAnswer(answer);
                  setSellingPosition(position);
                }}
                onClaimKingFees={claimKingFees}
                isClaimingKingFees={isClaimingKingFees}
              />
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-4">
              <TopPositions positions={positions} limit={5} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Trading Sheet */}
      {isMobile && buyingAnswer && (
        <MobileTradingSheet
          open={!!buyingAnswer}
          onOpenChange={(open) => !open && setBuyingAnswer(null)}
          answer={buyingAnswer}
          mode="buy"
          onSuccess={() => {
            setBuyingAnswer(null);
          }}
        />
      )}

      {isMobile && sellingAnswer && sellingPosition && (
        <MobileTradingSheet
          open={!!sellingAnswer}
          onOpenChange={(open) => !open && setSellingAnswer(null)}
          answer={sellingAnswer}
          mode="sell"
          position={sellingPosition}
          onSuccess={() => {
            setSellingAnswer(null);
            setSellingPosition(undefined);
          }}
        />
      )}

      {/* Desktop Buy Modal */}
      {!isMobile && buyingAnswer && (
        <BuySharesModal
          open={!!buyingAnswer}
          onOpenChange={(open) => !open && setBuyingAnswer(null)}
          answer={buyingAnswer}
          onSuccess={() => {
            setBuyingAnswer(null);
          }}
        />
      )}

      {/* Desktop Sell Modal */}
      {!isMobile && sellingAnswer && sellingPosition && (
        <SellSharesModal
          open={!!sellingAnswer}
          onOpenChange={(open) => !open && setSellingAnswer(null)}
          answer={sellingAnswer}
          position={sellingPosition}
          onSuccess={() => {
            setSellingAnswer(null);
            setSellingPosition(undefined);
          }}
        />
      )}
    </div>
  );
}
