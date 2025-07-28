'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile, useClaimFees, formatUSDC, formatPercentage, formatAddress, formatTimeAgo, CONTRACTS } from '../hooks/use-user-profile';
import { PortfolioPerformanceChart } from '../components/portfolio-performance-chart';
import { useRouter } from 'next/navigation';

interface ProfilePageProps {
  params: {
    address: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Navigation states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileAddress = params.address;
  const isOwnProfile = connectedAddress && connectedAddress.toLowerCase() === profileAddress.toLowerCase();
  
  const { stats, opinions, transactions, loading, error } = useUserProfile(profileAddress);
  const { claimFees, isClaimingFees, claimSuccess, claimError, transactionHash } = useClaimFees();

  // Handle copy address
  const handleCopyAddress = async () => {
    if (profileAddress) {
      await navigator.clipboard.writeText(profileAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle claim fees (only for own profile)
  const handleClaimFees = async () => {
    if (!isOwnProfile) return;
    try {
      await claimFees();
    } catch (error) {
      console.error('Fee claiming failed:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Navigation - EXACT MATCH */}
      <header className="sticky top-0 z-50 border-b border-gray-700/40 backdrop-blur-sm bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-emerald-500" />
              <h1 className="text-xl font-bold text-white">
                OpinionMarketCap
              </h1>
            </div>

            {/* Desktop Navigation - Right aligned with green hover + bold */}
            <nav className="hidden md:flex items-center space-x-8 ml-auto">
              <a href="/" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Opinions</a>
              <a href="/pools" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Pools</a>
              <a href="/profile" className="text-emerald-500 font-bold">Profile</a>
              <a href="/create" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Create</a>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hidden md:flex bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white mx-4"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {/* Wallet Connection */}
              <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
                <ConnectButton />
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-gray-700/40"
              >
                <div className="flex flex-col space-y-4">
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">Opinions</a>
                  <a href="/pools" className="text-gray-300 hover:text-white transition-colors">Pools</a>
                  <a href="/profile" className="text-emerald-500 font-bold">Profile</a>
                  <a href="/create" className="text-gray-300 hover:text-white transition-colors">Create</a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

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
                  {isOwnProfile ? 'Your Profile' : `${formatAddress(profileAddress)}'s Profile`}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{formatAddress(profileAddress)}</span>
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
            
            {/* Settings for own profile only */}
            {isOwnProfile && (
              <div className="flex items-center space-x-3">
                <ConnectButton />
                <Button 
                  variant="outline" 
                  className="glass-input bg-transparent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            )}
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

        {/* Fee Information - Only for own profile */}
        {isOwnProfile && (
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-400 space-y-2">
              <div>Accumulated Fees: {stats.accumulatedFees} USDC</div>
              <div>FeeManager Contract: {CONTRACTS.FEE_MANAGER}</div>
              <div>Connected Address: {profileAddress}</div>
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
        )}

        {/* Portfolio Performance Chart */}
        <PortfolioPerformanceChart opinions={opinions} loading={loading} />

        {/* Detailed Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opinions">Opinions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="earnings">Earnings</TabsTrigger>}
            {!isOwnProfile && <TabsTrigger value="activity">Activity</TabsTrigger>}
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

          {/* Other tabs content remains the same as original profile page */}
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
                    {isOwnProfile && (
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500"
                      >
                        Trade
                      </Button>
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

          {/* Earnings Tab - Only for own profile */}
          {isOwnProfile && (
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
                    
                    {/* Transaction Status for Earnings Tab */}
                    {claimError && (
                      <div className="flex items-center justify-center space-x-2 text-red-400 mt-2">
                        <XCircle className="w-3 h-3" />
                        <span className="text-xs">{claimError?.message || 'Claim failed'}</span>
                      </div>
                    )}
                    
                    {claimSuccess && transactionHash && (
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
          )}

          {/* Activity Tab - For other users */}
          {!isOwnProfile && (
            <TabsContent value="activity">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Public Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((transaction) => (
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
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}