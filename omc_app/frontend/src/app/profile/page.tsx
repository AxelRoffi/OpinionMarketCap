/**
 * PROFILE PAGE - ACCURATE CALCULATIONS DOCUMENTATION
 * 
 * This profile page displays ACCURATE financial metrics calculated from real blockchain data.
 * Every number is transparently calculated and documented below:
 * 
 * 📊 PRIMARY METRICS:
 * 
 * 1. PORTFOLIO VALUE = Sum of nextPrice for opinions where user owns current answer
 *    - Only positions where user is currentAnswerOwner
 *    - Real market value of user's positions
 * 
 * 2. TOTAL INVESTED = Sum of lastPrice for owned positions
 *    - What user actually paid for current positions
 *    - Cost basis for P&L calculation
 * 
 * 3. TOTAL P&L = Portfolio Value - Total Invested
 *    - Unrealized gains/losses on current positions
 *    - Does NOT double-count sold positions
 * 
 * 4. P&L PERCENTAGE = (Total P&L / Total Invested) * 100
 *    - Return on investment percentage
 *    - Based on actual cost basis
 * 
 * 5. USER TVL = Portfolio Value
 *    - Total Value Locked in user's positions
 *    - Value at risk in current positions
 * 
 * 6. MARKET SHARE = (User TVL / Platform TVL) * 100
 *    - User's share of total platform TVL
 *    - Platform TVL = sum of all opinion nextPrices
 * 
 * 7. WIN RATE = (Profitable Positions / Total Positions) * 100
 *    - Positions with positive P&L / Total positions owned
 *    - Based on current unrealized P&L
 * 
 * 8. ACCUMULATED FEES = Real claimable USDC from FeeManager contract
 *    - Direct blockchain call: FeeManager.getAccumulatedFees(user)
 *    - Actual USDC available to claim
 * 
 * 🔍 SECONDARY METRICS:
 * 
 * - Positions Owned = Count where user is currentAnswerOwner
 * - Questions Created = Count where user is original creator  
 * - Questions Owned = Count where user is current questionOwner
 * - Platform Rank = Estimated based on portfolio performance
 * - Creator Earnings = Real accumulated fees from FeeManager contract
 * 
 * ⚠️ NO DOUBLE COUNTING:
 * - Each position counted only once (by currentAnswerOwner)
 * - P&L calculated only for actual investments
 * - TVL represents real locked value
 * - All percentages based on accurate denominators
 */

'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Settings, 
  Wallet, 
  BarChart3,
  Award, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Loader2,
  ExternalLink,
  User,
  Plus,
  LogOut,
  CheckCircle,
  XCircle,
  Target,
  Clock,
  RefreshCw,
  Tag,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile, useClaimFees, formatUSDC, formatPercentage, formatAddress, formatTimeAgo, CONTRACTS } from './hooks/use-user-profile';
import { PortfolioPerformanceChart } from './components/portfolio-performance-chart';
import { EnhancedPortfolioChart } from './components/enhanced-portfolio-chart';
import { EnhancedPortfolioPerformanceChart } from './components/enhanced-portfolio-performance-chart';
import { AdvancedPositionManagement } from './components/advanced-position-management';
import { ComprehensiveFeeManagement } from './components/comprehensive-fee-management';
import { DetailedTradingHistory } from './components/detailed-trading-history';
import { useENSProfile } from '@/hooks/useENSProfile';
import { ENSName, ENSAvatar } from '@/components/ENSComponents';
import { useUserPools, useWithdrawFromExpiredPool } from './hooks/use-withdraw-pool';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ListForSaleModal from '@/components/modals/ListForSaleModal';
import CancelListingModal from '@/components/modals/CancelListingModal';

function ProfilePageContent() {
  const { address: connectedAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const searchParams = useSearchParams();
  
  // Get target address from URL parameter or use connected address
  const targetAddress = searchParams.get('address') || connectedAddress;
  const isOwnProfile = targetAddress === connectedAddress;
  
  // Debug logging
  console.log('🔧 [PROFILE DEBUG] ProfilePage rendered with targetAddress:', targetAddress, 'isOwnProfile:', isOwnProfile);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [showCancelListingModal, setShowCancelListingModal] = useState(false);
  const [selectedOpinion, setSelectedOpinion] = useState<any>(null);
  
  const { stats, opinions, transactions, loading, error } = useUserProfile(targetAddress);
  const { claimFees, isClaimingFees, claimSuccess, claimError, transactionHash } = useClaimFees();
  const { ensName, ensAvatar, displayName, isLoading: ensLoading } = useENSProfile(targetAddress);
  const { userPools, loading: poolsLoading, error: poolsError, refetch: refetchPools, updatePoolAfterWithdrawal } = useUserPools(targetAddress as `0x${string}`);
  const { withdrawFromPool, isWithdrawing, withdrawTxHash, isWithdrawSuccess, pendingWithdraw } = useWithdrawFromExpiredPool();

  // Handle copy address
  const handleCopyAddress = async () => {
    if (targetAddress) {
      await navigator.clipboard.writeText(targetAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle claim fees
  const handleClaimFees = async () => {
    try {
      await claimFees();
    } catch (error) {
      console.error('Fee claiming failed:', error);
    }
  };

  // Handle pool withdrawal
  const handleWithdrawFromPool = async (poolId: number, contributionAmount: string, isEarlyWithdrawal = false) => {
    try {
      await withdrawFromPool(poolId, contributionAmount, isEarlyWithdrawal);
    } catch (error) {
      console.error('Pool withdrawal failed:', error);
    }
  };

  // Handle list for sale
  const handleListForSale = (opinion: any) => {
    setSelectedOpinion(opinion);
    setShowListForSaleModal(true);
  };

  // Handle cancel listing
  const handleCancelListing = (opinion: any) => {
    setSelectedOpinion(opinion);
    setShowCancelListingModal(true);
  };

  // Update UI when withdrawal succeeds
  useEffect(() => {
    if (isWithdrawSuccess && pendingWithdraw) {
      // Immediately update the UI to show withdrawal success
      updatePoolAfterWithdrawal(pendingWithdraw.poolId);
      
      // Also refresh the full data after a delay to ensure consistency
      const timeoutId = setTimeout(() => refetchPools(), 2000);
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [isWithdrawSuccess, pendingWithdraw, updatePoolAfterWithdrawal, refetchPools]);


  // Only require connection if trying to view own profile without address parameter
  if (!targetAddress) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">Connect your wallet to view your profile</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h1>
            <p className="text-gray-400 mb-4">{error}</p>
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
    <>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* ENS Avatar */}
              <ENSAvatar 
                address={targetAddress} 
                size={64} 
                className="shadow-lg border-2 border-emerald-400/20" 
              />
              
              {/* User Info with ENS */}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {ensName && (
                    <h1 className="text-3xl font-bold text-white">{ensName}</h1>
                  )}
                  {!ensName && (
                    <h1 className="text-3xl font-bold text-white">
                      {isOwnProfile ? 'Your Profile' : 'User Profile'}
                    </h1>
                  )}
                  {ensLoading && (
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-mono text-sm">
                    {formatAddress(targetAddress)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="p-1 h-6 w-6 hover:bg-emerald-400/20"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-emerald-400" />
                    )}
                  </Button>
                </div>
                {ensName && (
                  <div className="text-sm text-emerald-400 mt-1">
                    ✓ ENS Verified
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Actions */}
            <div className="flex items-center space-x-3">
              {isOwnProfile ? (
                <>
                  <Button 
                    variant="outline" 
                    className="glass-input bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </>
              ) : (
                <div className="text-sm text-gray-400">
                  Viewing <ENSName address={targetAddress} className="text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview Cards - ACCURATE CALCULATIONS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Card 1: Portfolio Value (Current Market Value) */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <div className={`flex items-center space-x-1 ${stats.totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stats.totalPnL >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {formatPercentage(stats.totalPnLPercentage)}
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold text-white">{formatUSDC(stats.totalValue)}</div>
              <div className="text-sm text-gray-400">Portfolio Value</div>
              <div className="text-xs text-gray-500">Current market value</div>
            </CardContent>
          </Card>

          {/* Card 2: TVL (Total Value Locked) */}
          <Card className="glass-card border border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <div className="text-sm text-blue-400 font-medium">
                  {stats.totalUsers}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{formatUSDC(stats.totalValue)}</div>
              <div className="text-sm text-gray-400">User TVL</div>
              <div className="text-xs text-gray-500">Your locked value</div>
            </CardContent>
          </Card>

          {/* Card 3: Positions Owned (Answer Ownership) */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                <div className="text-sm text-cyan-400">
                  {stats.opinionsCreated > 0 && `+${stats.opinionsCreated}Q`}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{stats.opinionsOwned}</div>
              <div className="text-sm text-gray-400">Positions Owned</div>
              <div className="text-xs text-gray-500">Answer ownership</div>
            </CardContent>
          </Card>

          {/* Card 4: Win Rate (Profitable Positions) */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-orange-500" />
                <div className="text-sm text-orange-400">
                  {Math.round((stats.winRate / 100) * stats.opinionsOwned)}/{stats.opinionsOwned}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
              <div className="text-xs text-gray-500">Profitable positions</div>
            </CardContent>
          </Card>

          {/* Card 5: Platform Rank */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div className="text-sm text-purple-400">
                  Top {((stats.rank / stats.totalUsers) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-xl font-bold text-white">#{stats.rank}</div>
              <div className="text-sm text-gray-400">Platform Rank</div>
              <div className="text-xs text-gray-500">of {stats.totalUsers} users</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Invested */}
          <Card className="glass-card bg-slate-800/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Cost Basis</span>
              </div>
              <div className="text-lg font-bold text-white">{formatUSDC(stats.totalInvested)}</div>
              <div className="text-xs text-gray-400">Total Invested</div>
            </CardContent>
          </Card>

          {/* Unrealized P&L */}
          <Card className="glass-card bg-slate-800/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                {stats.totalPnL >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-xs text-gray-400">Unrealized</span>
              </div>
              <div className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatUSDC(stats.totalPnL)}
              </div>
              <div className="text-xs text-gray-400">P&L</div>
            </CardContent>
          </Card>

          {/* Questions Created */}
          <Card className="glass-card bg-slate-800/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Plus className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Created</span>
              </div>
              <div className="text-lg font-bold text-white">{stats.questionsCreated}</div>
              <div className="text-xs text-gray-400">Questions</div>
            </CardContent>
          </Card>

          {/* Platform TVL Share */}
          <Card className="glass-card bg-slate-800/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Share</span>
              </div>
              <div className="text-lg font-bold text-white">{stats.marketShare.toFixed(3)}%</div>
              <div className="text-xs text-gray-400">of Platform TVL</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Fee Claiming Section */}
        {stats.accumulatedFees > 0 ? (
          <Card className="glass-card border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-slate-800/50 to-cyan-500/5 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* Header */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Fees Available to Claim</h2>
                <p className="text-gray-400">You've earned trading fees from your platform activity</p>
              </div>

              {/* Amount Display */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text mb-2">
                  ${stats.accumulatedFees.toFixed(6)}
                </div>
                <div className="text-lg text-emerald-400 font-medium">USDC Available</div>
              </div>

              {/* Claim Button */}
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-12 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  onClick={handleClaimFees}
                  disabled={isClaimingFees}
                >
                  {isClaimingFees ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : claimSuccess ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-3" />
                      Successfully Claimed!
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-6 h-6 mr-3" />
                      Claim {formatUSDC(stats.accumulatedFees)} Now
                    </>
                  )}
                </Button>

                {/* Transaction Status */}
                {claimError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Transaction Failed</span>
                    </div>
                    <p className="text-red-400 text-sm mt-2">{claimError.message}</p>
                  </div>
                )}

                {claimSuccess && transactionHash && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Transaction Successful!</span>
                    </div>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-sm underline transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on BaseScan</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Contract Info - Collapsible */}
              <details className="mt-6 text-left">
                <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 transition-colors">
                  View Contract Details
                </summary>
                <div className="mt-3 space-y-2 text-xs text-gray-500 bg-slate-900/50 rounded-lg p-4 font-mono">
                  <div><span className="text-gray-400">FeeManager:</span> {CONTRACTS.FEE_MANAGER}</div>
                  <div><span className="text-gray-400">Your Address:</span> {targetAddress}</div>
                  <div><span className="text-gray-400">Amount:</span> {stats.accumulatedFees.toFixed(6)} USDC</div>
                </div>
              </details>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-700/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Fees Available</h3>
              <p className="text-gray-400">Start trading and creating opinions to earn fees!</p>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Portfolio Performance Chart */}
        <EnhancedPortfolioPerformanceChart opinions={opinions} loading={loading} />

        {/* Detailed Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="fees">Fee Center</TabsTrigger>
            <TabsTrigger value="history">Trading</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
          </TabsList>


          {/* Overview Tab - RESTORED with all original detailed content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Detailed Metrics Cards Grid - RESTORED */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Best Trade Card */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div className="text-sm text-yellow-400">
                      Best
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">{formatUSDC(stats.bestTrade)}</div>
                  <div className="text-sm text-gray-400">Best Trade</div>
                  <div className="text-xs text-gray-500">Single position gain</div>
                </CardContent>
              </Card>

              {/* Average Hold Time */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div className="text-sm text-purple-400">
                      Avg
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {stats.avgHoldTime === -1 ? "—" : `${stats.avgHoldTime}d`}
                  </div>
                  <div className="text-sm text-gray-400">Hold Time</div>
                  <div className="text-xs text-gray-500">
                    {stats.avgHoldTime === -1 ? "Coming soon" : "Days per position"}
                  </div>
                </CardContent>
              </Card>

              {/* Creator Fees */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    <div className="text-sm text-blue-400">
                      3%
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">{formatUSDC(stats.creatorFees)}</div>
                  <div className="text-sm text-gray-400">Creator Fees</div>
                  <div className="text-xs text-gray-500">From owned questions</div>
                </CardContent>
              </Card>

              {/* Trading Profits */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <div className="text-sm text-emerald-400">
                      P&L
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">{formatUSDC(stats.tradingProfits)}</div>
                  <div className="text-sm text-gray-400">Trading Profits</div>
                  <div className="text-xs text-gray-500">Unrealized gains</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="p-3 rounded-lg bg-muted/20 flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'BUY' ? 'bg-emerald-500/20' : 
                          transaction.type === 'SELL' ? 'bg-red-500/20' : 'bg-blue-500/20'
                        }`}>
                          {transaction.type === 'BUY' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : transaction.type === 'SELL' ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <Plus className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{transaction.type}</div>
                          <div className="text-sm text-gray-400">
                            {transaction.opinionTitle.substring(0, 30)}...
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            {formatUSDC(transaction.price)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimeAgo(transaction.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Opinions */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Performing Opinions</h3>
                  <div className="space-y-3">
                    {opinions
                      .filter(opinion => opinion.pnl > 0)
                      .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
                      .slice(0, 5)
                      .map((opinion) => (
                        <div key={opinion.id} className="p-3 rounded-lg bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-medium">
                              {opinion.question.substring(0, 30)}...
                            </div>
                            <Badge className="bg-blue-600 text-white text-xs">
                              {opinion.categories[0]}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                              Answer: {opinion.currentAnswer.substring(0, 20)}...
                            </div>
                            <div className="text-emerald-500 font-medium">
                              {formatPercentage(opinion.pnlPercentage)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-500">
                              Value: {formatUSDC(opinion.currentValue)}
                            </div>
                            <div className="text-xs text-emerald-400">
                              +{formatUSDC(opinion.pnl)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Opinions Tab - All User Opinions with Enhanced Details */}
          <TabsContent value="myopinions" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">My Opinions Portfolio</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {opinions.filter(op => op.isOwner).length} Owned
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {opinions.filter(op => op.isCreator).length} Created
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {opinions.filter(op => op.isQuestionOwner).length} Q-Owned
                </Badge>
              </div>
            </div>
            
            {opinions.map((opinion) => (
              <motion.div
                key={opinion.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors glass-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{opinion.question}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      {opinion.categories.map((category, idx) => (
                        <Badge key={idx} className="bg-blue-600/20 text-blue-400 text-xs">
                          {category}
                        </Badge>
                      ))}
                      {opinion.isOwner && (
                        <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Owned
                        </Badge>
                      )}
                      {opinion.isCreator && (
                        <Badge className="bg-orange-500/20 text-orange-500 text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          Created
                        </Badge>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm mb-2">
                      Current Answer: {opinion.currentAnswer}
                    </div>
                    {/* Marketplace Status */}
                    {opinion.salePrice > 0 && (
                      <div className="mb-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          Listed for {formatUSDC(opinion.salePrice)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      {formatUSDC(opinion.currentValue)}
                    </div>
                    <div className={`text-sm ${opinion.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatPercentage(opinion.pnlPercentage)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Volume: {formatUSDC(opinion.totalVolume)}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-transparent"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500"
                    >
                      Trade
                    </Button>
                    {/* Marketplace Actions - Only for own profile and question owner */}
                    {isOwnProfile && opinion.isQuestionOwner && (
                      <>
                        {opinion.salePrice === 0 ? (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleListForSale(opinion)}
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                          >
                            <Tag className="w-4 h-4 mr-1" />
                            List for Sale
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelListing(opinion)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel Listing
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="glass-card">
              <CardContent className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Type</th>
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Opinion</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2">Amount</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2">Price</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2">Time</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border/20">
                        <td className="py-3">
                          <Badge 
                            className={
                              transaction.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-500' :
                              transaction.type === 'SELL' ? 'bg-red-500/20 text-red-500' :
                              'bg-blue-500/20 text-blue-500'
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="py-3 text-white">
                          {transaction.opinionTitle.substring(0, 30)}...
                        </td>
                        <td className="py-3 text-right text-white">
                          {transaction.amount}
                        </td>
                        <td className="py-3 text-right text-white">
                          {formatUSDC(transaction.price)}
                        </td>
                        <td className="py-3 text-right text-gray-400">
                          {formatTimeAgo(transaction.timestamp)}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://sepolia.basescan.org/tx/${transaction.txHash}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fee Earnings */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Fee Earnings</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <div className="text-emerald-500 font-medium">Creator Fees</div>
                      <div className="text-white text-xl font-bold">
                        {formatUSDC(stats.creatorFees)}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-500/10">
                      <div className="text-cyan-500 font-medium">Trading Profits</div>
                      <div className="text-white text-xl font-bold">
                        {formatUSDC(stats.tradingProfits)}
                      </div>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500"
                      onClick={handleClaimFees}
                      disabled={isClaimingFees || stats.accumulatedFees <= 0}
                    >
                      {isClaimingFees ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : claimSuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Successfully Claimed!
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Claim All Fees
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Transaction Status for Earnings Tab */}
                  {isOwnProfile && claimError && (
                    <div className="flex items-center justify-center space-x-2 text-red-400 mt-2">
                      <XCircle className="w-3 h-3" />
                      <span className="text-xs">{claimError?.message || 'Claim failed'}</span>
                    </div>
                  )}
                  
                  {isOwnProfile && claimSuccess && transactionHash && (
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Fees claimed!</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://sepolia.basescan.org/tx/${transactionHash}`, '_blank')}
                        className="text-emerald-400 hover:text-emerald-300 p-0 h-auto"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total ROI</span>
                      <span className="text-emerald-500 font-medium">
                        {formatPercentage(stats.totalROI)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-white font-medium">
                        {stats.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Avg. Hold Time</span>
                      <span className="text-white font-medium">
                        {stats.avgHoldTime} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Best Trade</span>
                      <span className="text-emerald-500 font-medium">
                        {formatUSDC(stats.bestTrade)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pools Tab */}
          <TabsContent value="pools" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">My Pool Contributions</h3>
              <Button
                variant="outline" 
                size="sm"
                onClick={refetchPools}
                disabled={poolsLoading}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${poolsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {poolsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <span className="ml-2 text-gray-400">Loading your pools...</span>
              </div>
            ) : poolsError ? (
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Error Loading Pools</h3>
                  <p className="text-gray-400 mb-4">{poolsError}</p>
                  <Button onClick={refetchPools} className="bg-emerald-600 hover:bg-emerald-700">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : userPools.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Pool Contributions</h3>
                  <p className="text-gray-400 mb-4">You haven't contributed to any pools yet.</p>
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Join a Pool
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPools.map((pool) => (
                  <motion.div
                    key={pool.id}
                    whileHover={{ scale: 1.01 }}
                    className="glass-card p-6 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-white font-semibold">
                            {pool.name}
                          </h3>
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
                              Early Withdrawal Available
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-gray-400 text-sm mb-2">
                          Opinion #{pool.opinionId} • Proposed: "{pool.proposedAnswer}"
                        </div>
                        
                        {pool.question && (
                          <div className="text-gray-300 text-sm mb-2">
                            {pool.question.length > 80 ? `${pool.question.substring(0, 80)}...` : pool.question}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
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
                        <div className="text-white font-bold text-lg mb-1">
                          {pool.contribution} USDC
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          Your Contribution
                        </div>
                        
                        {pool.canWithdraw && parseFloat(pool.contribution) > 0 ? (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            onClick={() => handleWithdrawFromPool(pool.id, pool.contribution)}
                            disabled={isWithdrawing}
                          >
                            {isWithdrawing && pendingWithdraw?.poolId === pool.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Withdrawing...
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Withdraw
                              </>
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
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Withdrawing...
                                </>
                              ) : (
                                <>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Early Withdraw
                                </>
                              )}
                            </Button>
                            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                              ⚠️ 20% penalty: You'll receive {pool.earlyWithdrawalReceive} USDC (penalty: {pool.earlyWithdrawalPenalty} USDC)
                            </div>
                          </div>
                        ) : parseFloat(pool.contribution) === 0 ? (
                          <Button
                            size="sm"
                            disabled
                            className="bg-emerald-500/20 text-emerald-500 cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Withdrawn
                          </Button>
                        ) : pool.status === 'Executed' ? (
                          <Button
                            size="sm"
                            disabled
                            className="bg-green-500/20 text-green-500 cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Executed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="bg-blue-500/20 text-blue-500 cursor-not-allowed"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Active
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Transaction Hash Display for Withdrawals */}
                    {withdrawTxHash && isWithdrawSuccess && pendingWithdraw?.poolId === pool.id && (
                      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                            <div>
                              <div className="text-emerald-400 font-medium">Withdrawal Successful!</div>
                              <div className="text-emerald-300 text-sm mt-1">
                                {pendingWithdraw.amount} USDC has been returned to your wallet
                              </div>
                            </div>
                          </div>
                          <a
                            href={`https://sepolia.basescan.org/tx/${withdrawTxHash}`}
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

                    {/* Show when pool contribution is zero (already withdrawn) */}
                    {parseFloat(pool.contribution) === 0 && pool.status === 'Expired' && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-sm">Already withdrawn from this pool</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Summary Stats */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {userPools.length}
                        </div>
                        <div className="text-sm text-gray-400">Total Pools</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-500">
                          {userPools.filter(p => p.status === 'Active').length}
                        </div>
                        <div className="text-sm text-gray-400">Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">
                          {userPools.filter(p => p.status === 'Expired').length}
                        </div>
                        <div className="text-sm text-gray-400">Expired</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-500">
                          {formatUSDC(userPools.filter(p => p.canWithdraw).reduce((sum, p) => sum + parseFloat(p.contribution), 0))}
                        </div>
                        <div className="text-sm text-gray-400">Refundable</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab - Enhanced Portfolio Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <EnhancedPortfolioChart opinions={opinions} transactions={transactions} loading={loading} />
          </TabsContent>

          {/* Positions Tab - Advanced Position Management */}
          <TabsContent value="positions" className="space-y-6">
            <AdvancedPositionManagement 
              opinions={opinions} 
              loading={loading}
              onListForSale={handleListForSale}
              onCancelListing={handleCancelListing}
              onTrade={() => {}} // You can add trading functionality here
              isOwnProfile={isOwnProfile}
            />
          </TabsContent>

          {/* Fee Center Tab - Comprehensive Fee Management */}
          <TabsContent value="fees" className="space-y-6">
            <ComprehensiveFeeManagement
              stats={{
                accumulatedFees: stats.accumulatedFees,
                creatorFees: stats.creatorFees,
                tradingProfits: stats.tradingProfits,
                totalTrades: stats.totalTrades
              }}
              opinions={opinions}
              onClaimFees={handleClaimFees}
              isClaimingFees={isClaimingFees}
              claimSuccess={claimSuccess}
              claimError={claimError}
              transactionHash={transactionHash}
              isOwnProfile={isOwnProfile}
            />
          </TabsContent>

          {/* Trading History Tab - Detailed Trading History */}
          <TabsContent value="history" className="space-y-6">
            <DetailedTradingHistory
              opinions={opinions}
              transactions={transactions}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* List For Sale Modal */}
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
          onClose={() => {
            setShowListForSaleModal(false);
            setSelectedOpinion(null);
          }}
          onSuccess={() => {
            // Refresh the page to show updated sale status
            window.location.reload();
          }}
        />
      )}

      {/* Cancel Listing Modal */}
      {showCancelListingModal && selectedOpinion && (
        <CancelListingModal
          isOpen={showCancelListingModal}
          opinionData={{
            id: selectedOpinion.id,
            question: selectedOpinion.question,
            salePrice: selectedOpinion.salePrice || BigInt(0),
            questionOwner: selectedOpinion.questionOwner || connectedAddress || '',
          }}
          onClose={() => {
            setShowCancelListingModal(false);
            setSelectedOpinion(null);
          }}
          onSuccess={() => {
            // Refresh the page to show updated sale status
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

// Loading component for Suspense
function ProfilePageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
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