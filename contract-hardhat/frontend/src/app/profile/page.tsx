'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile, useClaimFees, formatUSDC, formatPercentage, formatAddress, formatTimeAgo, CONTRACTS } from './hooks/use-user-profile';
import { PortfolioPerformanceChart } from './components/portfolio-performance-chart';
import { useUserPools, useWithdrawFromExpiredPool } from './hooks/use-withdraw-pool';
import { ErrorBoundary } from './components/error-boundary';

export default function ProfilePage() {
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
  
  const { stats, opinions, transactions, loading, error } = useUserProfile(targetAddress);
  const { claimFees, isClaimingFees, claimSuccess, claimError, transactionHash } = useClaimFees();
  const { userPools, loading: poolsLoading, error: poolsError, refetch: refetchPools, updatePoolAfterWithdrawal } = useUserPools(targetAddress);
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
        {/* Page Header */}
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              
              {/* Address Display */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isOwnProfile ? 'Your Profile' : 'User Profile'}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{formatAddress(targetAddress)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="p-1 h-6 w-6"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Settings and Disconnect Buttons - Only show for own profile */}
            <div className="flex items-center space-x-3">
              {isOwnProfile ? (
                <>
                  <ConnectButton />
                  <Button 
                    variant="outline" 
                    className="glass-input bg-transparent"
                    onClick={() => disconnect()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
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
                  Viewing {formatAddress(targetAddress)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Value */}
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
              <div className="text-sm text-gray-400">Total Value</div>
            </CardContent>
          </Card>

          {/* Card 2: Opinions Owned */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="text-xl font-bold text-white">{stats.opinionsOwned}</div>
              <div className="text-sm text-gray-400">Opinions Owned</div>
              <div className="text-xs text-gray-500">Active positions</div>
            </CardContent>
          </Card>

          {/* Card 3: Win Rate */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
              <div className="text-xs text-gray-500">{stats.totalTrades} trades</div>
            </CardContent>
          </Card>

          {/* Card 4: Rank */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-white">#{stats.rank}</div>
              <div className="text-sm text-gray-400">Rank</div>
              <div className="text-xs text-gray-500">of {stats.totalUsers} users</div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Information - Now Working */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-400 space-y-2">
            <div>Accumulated Fees: {stats.accumulatedFees} USDC</div>
            <div>FeeManager Contract: {CONTRACTS.FEE_MANAGER}</div>
            <div>Connected Address: {targetAddress}</div>
          </div>
          
          {stats.accumulatedFees > 0 ? (
            <div className="space-y-3">
              <div className="text-emerald-400">
                💰 You have {formatUSDC(stats.accumulatedFees)} in accumulated fees
              </div>
              
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium px-6 py-2"
                onClick={handleClaimFees}
                disabled={isClaimingFees}
              >
                {isClaimingFees ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : claimSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Claimed!
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Claim Fees
                  </>
                )}
              </Button>
              
              {claimError && (
                <div className="text-red-400 text-sm">
                  Error: {claimError.message}
                </div>
              )}
              
              {claimSuccess && transactionHash && (
                <div className="text-emerald-400 text-sm">
                  <a 
                    href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-emerald-300"
                  >
                    View transaction ↗
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">
              <p>No accumulated fees yet.</p>
            </div>
          )}
        </div>

        {/* Portfolio Performance Chart */}
        <PortfolioPerformanceChart opinions={opinions} loading={loading} />

        {/* Detailed Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opinions">My Opinions</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
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
                            {transaction.opinionTitle.substring(0, 40)}...
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
                      .slice(0, 3)
                      .map((opinion) => (
                        <div key={opinion.id} className="p-3 rounded-lg bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-medium">
                              {opinion.question.substring(0, 40)}...
                            </div>
                            <Badge className="bg-blue-600 text-white">
                              {opinion.categories[0]}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                              Current: {opinion.currentAnswer}
                            </div>
                            <div className="text-emerald-500 font-medium">
                              {formatPercentage(opinion.pnlPercentage)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Opinions Tab */}
          <TabsContent value="opinions" className="space-y-4">
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
                      <Badge className="bg-blue-600 text-white">
                        {opinion.categories[0]}
                      </Badge>
                      {opinion.isOwner && (
                        <Badge className="bg-emerald-500/20 text-emerald-500">
                          Owned
                        </Badge>
                      )}
                      {opinion.isCreator && (
                        <Badge className="bg-orange-500/20 text-orange-500">
                          Created
                        </Badge>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm mb-2">
                      Current Answer: {opinion.currentAnswer}
                    </div>
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
            <ErrorBoundary>
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
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}