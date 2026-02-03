'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  DollarSign,
  Loader2,
  ExternalLink,
  Plus,
  CheckCircle,
  XCircle,
  Target,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile, useClaimFees, formatUSDC } from './hooks/use-user-profile';
import { AdvancedPositionManagement } from './components/advanced-position-management';
import { DetailedTradingHistory } from './components/detailed-trading-history';
import { useENSProfile } from '@/hooks/useENSProfile';
import { useUserPools, useWithdrawFromExpiredPool } from './hooks/use-withdraw-pool';
import { useWatchlist } from '@/hooks/useWatchlist';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ListForSaleModal from '@/components/modals/ListForSaleModal';
import CancelListingModal from '@/components/modals/CancelListingModal';
import { BadgeShowcase, BadgeDisplay, BadgeModal, BadgeNotificationContainer, BadgeDefinition } from '@/components/gamification';
import { AmbientBackground } from '@/components/ambient-background';
import { ProfileHero } from './components/profile-hero';
import { ProfileStatCards } from './components/profile-stat-cards';
import { ProfileFeeBanner } from './components/profile-fee-banner';
import { ProfileOverviewTab } from './components/profile-overview-tab';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

function ProfilePageContent() {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();

  const targetAddress = searchParams.get('address') || connectedAddress;
  const isOwnProfile = targetAddress === connectedAddress;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [showCancelListingModal, setShowCancelListingModal] = useState(false);
  const [selectedOpinion, setSelectedOpinion] = useState<any>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const { stats, opinions, transactions, loading, error } = useUserProfile(targetAddress);
  const { claimFees, isClaimingFees, claimSuccess, claimError, transactionHash } = useClaimFees();
  const { ensName, isLoading: ensLoading } = useENSProfile(targetAddress);
  const { userPools, loading: poolsLoading, error: poolsError, refetch: refetchPools, updatePoolAfterWithdrawal } = useUserPools(targetAddress as `0x${string}`);
  const { withdrawFromPool, isWithdrawing, withdrawTxHash, isWithdrawSuccess, pendingWithdraw } = useWithdrawFromExpiredPool();
  const { getWatchlistCount } = useWatchlist();

  const watchlistCount = getWatchlistCount();

  const handleCopyAddress = async () => {
    if (targetAddress) {
      await navigator.clipboard.writeText(targetAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimFees = async () => {
    try {
      await claimFees();
    } catch (err) {
      console.error('Fee claiming failed:', err);
    }
  };

  const handleWithdrawFromPool = async (poolId: number, contributionAmount: string, isEarlyWithdrawal = false) => {
    try {
      await withdrawFromPool(poolId, contributionAmount, isEarlyWithdrawal);
    } catch (err) {
      console.error('Pool withdrawal failed:', err);
    }
  };

  const handleListForSale = (opinion: any) => {
    setSelectedOpinion(opinion);
    setShowListForSaleModal(true);
  };

  const handleCancelListing = (opinion: any) => {
    setSelectedOpinion(opinion);
    setShowCancelListingModal(true);
  };

  useEffect(() => {
    if (isWithdrawSuccess && pendingWithdraw) {
      updatePoolAfterWithdrawal(pendingWithdraw.poolId);
      const timeoutId = setTimeout(() => refetchPools(), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isWithdrawSuccess, pendingWithdraw, updatePoolAfterWithdrawal, refetchPools]);

  // Not connected
  if (!targetAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">Connect your wallet to view your profile</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Profile</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AmbientBackground />

      <div className="max-w-7xl mx-auto p-4 space-y-5 relative z-10">
        {/* Profile Hero */}
        <motion.div {...fadeUp(0)}>
          <ProfileHero
            stats={stats}
            targetAddress={targetAddress}
            isOwnProfile={isOwnProfile}
            ensName={ensName}
            ensLoading={ensLoading}
            copied={copied}
            onCopy={handleCopyAddress}
            watchlistCount={watchlistCount}
          />
        </motion.div>

        {/* Secondary Stat Cards */}
        <motion.div {...fadeUp(0.1)}>
          <ProfileStatCards stats={stats} />
        </motion.div>

        {/* Badges Preview */}
        <motion.div {...fadeUp(0.15)}>
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges & Achievements
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('badges')}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                View All
              </Button>
            </div>
            <BadgeShowcase maxBadges={6} onViewAll={() => setActiveTab('badges')} />
          </div>
        </motion.div>

        {/* Fee Banner */}
        <motion.div {...fadeUp(0.2)}>
          <ProfileFeeBanner
            accumulatedFees={stats.accumulatedFees}
            onClaimFees={handleClaimFees}
            isClaimingFees={isClaimingFees}
            claimSuccess={claimSuccess}
            claimError={claimError}
            transactionHash={transactionHash}
            isOwnProfile={isOwnProfile}
            targetAddress={targetAddress}
          />
        </motion.div>

        {/* Tabs - 5 tabs */}
        <motion.div {...fadeUp(0.25)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-card border border-border rounded-lg grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="pools">Pools</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            {/* Overview Tab (merged with Analytics) */}
            <TabsContent value="overview" className="space-y-6">
              <ProfileOverviewTab
                stats={stats}
                opinions={opinions}
                transactions={transactions}
                loading={loading}
              />
            </TabsContent>

            {/* Positions Tab */}
            <TabsContent value="positions" className="space-y-6">
              <AdvancedPositionManagement
                opinions={opinions}
                loading={loading}
                onListForSale={handleListForSale}
                onCancelListing={handleCancelListing}
                onTrade={() => {}}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>

            {/* Trading History Tab */}
            <TabsContent value="trading" className="space-y-6">
              <DetailedTradingHistory
                opinions={opinions}
                transactions={transactions}
                loading={loading}
              />
            </TabsContent>

            {/* Pools Tab */}
            <TabsContent value="pools" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">My Pool Contributions</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetchPools}
                  disabled={poolsLoading}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${poolsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {poolsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="ml-2 text-muted-foreground">Loading your pools...</span>
                </div>
              ) : poolsError ? (
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Pools</h3>
                  <p className="text-muted-foreground mb-4">{poolsError}</p>
                  <Button onClick={refetchPools} className="bg-emerald-600 hover:bg-emerald-700">
                    Try Again
                  </Button>
                </div>
              ) : userPools.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Pool Contributions</h3>
                  <p className="text-muted-foreground mb-4">You haven&apos;t contributed to any pools yet.</p>
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Join a Pool
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPools.map((pool) => (
                    <motion.div
                      key={pool.id}
                      whileHover={{ scale: 1.005 }}
                      className="bg-card rounded-lg border border-border p-5 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-foreground font-semibold">{pool.name}</h3>
                            <Badge
                              className={`${
                                pool.status === 'Expired'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : pool.status === 'Executed'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {pool.status}
                            </Badge>
                            {pool.canWithdraw && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                Refund Available
                              </Badge>
                            )}
                            {pool.canWithdrawEarly && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                Early Withdrawal
                              </Badge>
                            )}
                          </div>

                          <div className="text-muted-foreground text-sm mb-2">
                            Opinion #{pool.opinionId} &bull; Proposed: &quot;{pool.proposedAnswer}&quot;
                          </div>

                          {pool.question && (
                            <div className="text-foreground/80 text-sm mb-2">
                              {pool.question.length > 80 ? `${pool.question.substring(0, 80)}...` : pool.question}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              Pool Total: {pool.totalAmount} USDC
                            </div>
                            {pool.deadline > 0 && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {pool.isExpired ? 'Expired' : 'Active'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-foreground font-bold text-lg mb-1">
                            {pool.contribution} USDC
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">Your Contribution</div>

                          {pool.canWithdraw && parseFloat(pool.contribution) > 0 ? (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              onClick={() => handleWithdrawFromPool(pool.id, pool.contribution)}
                              disabled={isWithdrawing}
                            >
                              {isWithdrawing && pendingWithdraw?.poolId === pool.id ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Withdrawing...</>
                              ) : (
                                <><DollarSign className="w-4 h-4 mr-2" />Withdraw</>
                              )}
                            </Button>
                          ) : pool.canWithdrawEarly && parseFloat(pool.contribution) > 0 ? (
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 w-full"
                                onClick={() => handleWithdrawFromPool(pool.id, pool.contribution, true)}
                                disabled={isWithdrawing}
                              >
                                {isWithdrawing && pendingWithdraw?.poolId === pool.id ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Withdrawing...</>
                                ) : (
                                  <><DollarSign className="w-4 h-4 mr-2" />Early Withdraw</>
                                )}
                              </Button>
                              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                                20% penalty: You&apos;ll receive {pool.earlyWithdrawalReceive} USDC (penalty: {pool.earlyWithdrawalPenalty} USDC)
                              </div>
                            </div>
                          ) : parseFloat(pool.contribution) === 0 ? (
                            <Button size="sm" disabled className="bg-emerald-500/20 text-emerald-500 cursor-not-allowed">
                              <CheckCircle className="w-4 h-4 mr-2" />Withdrawn
                            </Button>
                          ) : pool.status === 'Executed' ? (
                            <Button size="sm" disabled className="bg-green-500/20 text-green-500 cursor-not-allowed">
                              <CheckCircle className="w-4 h-4 mr-2" />Executed
                            </Button>
                          ) : (
                            <Button size="sm" disabled className="bg-blue-500/20 text-blue-500 cursor-not-allowed">
                              <Clock className="w-4 h-4 mr-2" />Active
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Withdrawal success */}
                      {withdrawTxHash && isWithdrawSuccess && pendingWithdraw?.poolId === pool.id && (
                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                              <div>
                                <div className="text-emerald-400 font-medium">Withdrawal Successful!</div>
                                <div className="text-emerald-300 text-sm mt-1">
                                  {pendingWithdraw.amount} USDC has been returned to your wallet
                                </div>
                              </div>
                            </div>
                            <a
                              href={`https://basescan.org/tx/${withdrawTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center bg-emerald-500/20 px-3 py-1 rounded-lg transition-colors"
                            >
                              View Transaction
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Already withdrawn */}
                      {parseFloat(pool.contribution) === 0 && pool.status === 'Expired' && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-sm">Already withdrawn from this pool</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Pool Summary Stats */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{userPools.length}</div>
                        <div className="text-sm text-muted-foreground">Total Pools</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-500">
                          {userPools.filter(p => p.status === 'Active').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">
                          {userPools.filter(p => p.status === 'Expired').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Expired</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-500">
                          {formatUSDC(userPools.filter(p => p.canWithdraw).reduce((sum, p) => sum + parseFloat(p.contribution), 0))}
                        </div>
                        <div className="text-sm text-muted-foreground">Refundable</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <BadgeDisplay
                  onBadgeClick={(badge) => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Modals */}
      {showListForSaleModal && selectedOpinion && (
        <ListForSaleModal
          isOpen={showListForSaleModal}
          opinionData={{
            id: selectedOpinion.id,
            question: selectedOpinion.question,
            currentAnswer: selectedOpinion.currentAnswer,
            nextPrice: selectedOpinion.nextPrice || BigInt(0),
            lastPrice: selectedOpinion.lastPrice || BigInt(0),
            totalVolume: selectedOpinion.totalVolume || BigInt(0),
            questionOwner: selectedOpinion.questionOwner || connectedAddress || '',
            salePrice: selectedOpinion.salePrice || BigInt(0),
            isActive: selectedOpinion.isActive !== false,
            creator: selectedOpinion.creator || connectedAddress || '',
          }}
          onClose={() => { setShowListForSaleModal(false); setSelectedOpinion(null); }}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showCancelListingModal && selectedOpinion && (
        <CancelListingModal
          isOpen={showCancelListingModal}
          opinionData={{
            id: selectedOpinion.id,
            question: selectedOpinion.question,
            salePrice: selectedOpinion.salePrice || BigInt(0),
            questionOwner: selectedOpinion.questionOwner || connectedAddress || '',
          }}
          onClose={() => { setShowCancelListingModal(false); setSelectedOpinion(null); }}
          onSuccess={() => window.location.reload()}
        />
      )}

      <BadgeModal
        badge={selectedBadge}
        isOpen={showBadgeModal}
        onClose={() => { setShowBadgeModal(false); setSelectedBadge(null); }}
      />

      <BadgeNotificationContainer
        onBadgeClick={(badge) => { setSelectedBadge(badge); setShowBadgeModal(true); }}
      />
    </div>
  );
}

function ProfilePageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ProfilePageLoading />}>
        <ProfilePageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
