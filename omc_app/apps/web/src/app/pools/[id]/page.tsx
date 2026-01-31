'use client';

import React, { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ArrowLeft, Users, Clock, Target, TrendingUp, ExternalLink, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePoolDetails, formatTimeRemaining, getStatusColor, getStatusText } from '@/hooks/usePoolDetails';
import { PoolHeader } from './components/PoolHeader';
import { PoolProgressBar } from './components/PoolProgressBar';
import { JoinPoolModal } from './components/JoinPoolModal';
import { PoolShareModal } from './components/PoolShareModal';
import { FinancialDashboard } from './components/FinancialDashboard';
import { CountdownTimer } from './components/CountdownTimer';

interface PoolPageProps {
  // Will be populated by usePoolDetails hook later
}

function PoolPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-6 w-32 bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="h-8 w-64 bg-slate-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="h-64 bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PoolPageContent() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const poolId = parseInt(params.id as string);
  
  // Modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [joinModalInitialAmount, setJoinModalInitialAmount] = useState<string | undefined>(undefined);

  // Handler for "Fill Remaining" button
  const handleFillRemaining = () => {
    setJoinModalInitialAmount(poolDetails?.remainingAmount);
    setIsJoinModalOpen(true);
  };

  // Handler for regular "Join Pool" button
  const handleJoinPool = () => {
    setJoinModalInitialAmount(undefined);
    setIsJoinModalOpen(true);
  };

  // Use the pool details hook
  const { poolDetails, isLoading, error, refresh } = usePoolDetails(poolId, address);

  const handleBackClick = () => {
    router.push('/pools');
  };

  // Handle loading state
  if (isLoading) {
    return <PoolPageSkeleton />;
  }

  // Handle error state
  if (error || !poolDetails) {
    throw new Error(error || 'Pool not found');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pools
        </Button>

        {/* Enhanced Pool Header */}
        <div className="mb-8">
          <PoolHeader poolDetails={poolDetails} />
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Progress Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Pool Progress</h2>
              
              {/* Enhanced Progress Bar */}
              <PoolProgressBar
                currentAmount={poolDetails.currentAmount}
                targetAmount={poolDetails.targetAmount}
                progressPercentage={poolDetails.progressPercentage}
                status={poolDetails.status}
                timeRemaining={poolDetails.timeRemaining}
                className="mb-6"
              />

              {/* Financial Breakdown */}
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Current</div>
                  <div className="text-white font-bold text-lg">${parseFloat(poolDetails.currentAmount).toFixed(2)}</div>
                  <div className="text-emerald-400 text-xs">Raised</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Target</div>
                  <div className="text-white font-bold text-lg">${parseFloat(poolDetails.targetAmount).toFixed(2)}</div>
                  <div className="text-blue-400 text-xs">Goal</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Remaining</div>
                  <div className="text-white font-bold text-lg">${parseFloat(poolDetails.remainingAmount).toFixed(2)}</div>
                  <div className="text-orange-400 text-xs">Needed</div>
                </div>
              </div>

              {/* Proposed Answer */}
              <div className="bg-slate-700/20 rounded-lg p-4 border-l-4 border-emerald-400">
                <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Proposed Answer:
                </div>
                <div className="text-white font-medium text-lg italic">"{poolDetails.proposedAnswer}"</div>
              </div>
            </div>

            {/* Financial Dashboard */}
            <FinancialDashboard poolDetails={poolDetails} />

            {/* Contributors Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-emerald-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Contributors</h2>
                <Badge variant="secondary" className="ml-2">
                  {poolDetails.contributorCount}
                </Badge>
              </div>
              
              {poolDetails.contributorCount > 0 ? (
                <div className="space-y-3">
                  {poolDetails.contributors.length > 0 ? (
                    poolDetails.contributors.map((contributor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {contributor.address.slice(2, 4).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-white font-mono text-sm">
                              {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-medium">
                          ${parseFloat(contributor.amount).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Contributor details will load shortly</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No contributors yet</p>
                  <p className="text-sm mt-1">Be the first to join this pool!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Pool Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Join This Pool</h3>
                <p className="text-gray-400 text-sm">
                  Contribute to this prediction pool
                </p>
              </div>

              {poolDetails.canJoin ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleJoinPool}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium mb-3 transform hover:scale-105 transition-all duration-200"
                  >
                    Join Pool
                  </Button>

                  {/* Fill Remaining Button */}
                  <Button
                    size="lg"
                    onClick={handleFillRemaining}
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white font-medium mb-3 transform hover:scale-105 transition-all duration-200"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Fill Remaining (${parseFloat(poolDetails.remainingAmount).toFixed(2)})
                  </Button>

                  <div className="text-center text-xs text-gray-400">
                    Only ${parseFloat(poolDetails.remainingAmount).toFixed(2)} USDC left to reach target!
                  </div>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
                    disabled
                  >
                    {poolDetails.status === 'executed' ? 'Pool Executed' :
                     poolDetails.status === 'expired' ? 'Pool Expired' : 'Pool Full'}
                  </Button>

                  {poolDetails.canWithdraw && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3 border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      Withdraw Contribution
                    </Button>
                  )}
                </>
              )}

              {/* Share Pool Button */}
              <Button
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
                variant="outline"
                className="w-full mt-4 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors duration-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Pool
              </Button>
            </div>

            {/* Countdown Timer */}
            <CountdownTimer
              deadline={poolDetails.deadline}
              status={poolDetails.status}
              size="medium"
            />

            {/* Quick Stats Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-gray-400">Time Left</span>
                  </div>
                  <span className="text-white font-medium">
                    {formatTimeRemaining(poolDetails.timeRemaining)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
                    <span className="text-gray-400">Progress</span>
                  </div>
                  <span className="text-white font-medium">
                    {poolDetails.progressPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-gray-400">Contributors</span>
                  </div>
                  <span className="text-white font-medium">{poolDetails.contributorCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-orange-400 mr-2" />
                    <span className="text-gray-400">Category</span>
                  </div>
                  <span className="text-white font-medium">{poolDetails.opinionCategory}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Pool Modal */}
        <JoinPoolModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          poolDetails={poolDetails}
          onSuccess={refresh}
          initialAmount={joinModalInitialAmount}
        />

        {/* Pool Share Modal */}
        <PoolShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          poolDetails={poolDetails}
        />
      </div>
    </div>
  );
}

export default function PoolPage() {
  return (
    <Suspense fallback={<PoolPageSkeleton />}>
      <PoolPageContent />
    </Suspense>
  );
}