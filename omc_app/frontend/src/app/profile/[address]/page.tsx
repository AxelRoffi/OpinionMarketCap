'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';
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
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile, useClaimFees, formatUSDC, formatPercentage, formatAddress, formatTimeAgo } from '../hooks/use-user-profile';
import { PortfolioPerformanceChart } from '../components/portfolio-performance-chart';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ params }: any) {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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
      <div className="max-w-7xl mx-auto p-4">
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
    );
  }

  return (
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

      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            
            {/* Address Display */}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isOwnProfile ? 'Your Profile' : `${formatAddress(profileAddress)}'s Profile`}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 font-mono text-sm">{formatAddress(profileAddress)}</span>
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
            </div>
          </div>
          
          {/* Settings for own profile only */}
          {isOwnProfile && (
            <div className="flex items-center space-x-3">
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
      </div>

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
          </CardContent>
        </Card>
      </div>

      {/* Fee Claiming - Only for own profile */}
      {isOwnProfile && stats.accumulatedFees > 0 && (
        <Card className="glass-card border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-slate-800/50 to-cyan-500/5">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Fees Available to Claim</h2>
            <div className="text-3xl font-bold text-emerald-400 mb-6">
              {formatUSDC(stats.accumulatedFees)}
            </div>
            
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium px-8 py-3 text-lg"
              onClick={handleClaimFees}
              disabled={isClaimingFees}
            >
              {isClaimingFees ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : claimSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Claimed!
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Claim Fees
                </>
              )}
            </Button>
            
            {claimError && (
              <div className="text-red-400 text-sm mt-4">
                Error: {claimError.message}
              </div>
            )}
            
            {claimSuccess && transactionHash && (
              <div className="text-emerald-400 text-sm mt-4">
                <a 
                  href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-emerald-300 flex items-center justify-center space-x-2"
                >
                  <span>View Transaction</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Portfolio Chart */}
      <PortfolioPerformanceChart opinions={opinions} loading={loading} />

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opinions">Opinions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="p-3 rounded-lg bg-muted/20 flex items-center space-x-3">
                      <div className="text-white font-medium">{transaction.type}</div>
                      <div className="text-sm text-gray-400 flex-1">
                        {transaction.opinionTitle.substring(0, 30)}...
                      </div>
                      <div className="text-white font-medium">
                        {formatUSDC(transaction.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Opinions */}
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
                            {opinion.question.substring(0, 30)}...
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

        {/* Opinions Tab */}
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
                    {opinion.categories.map((category) => (
                      <Badge key={category} className="bg-blue-600 text-white">
                        {category}
                      </Badge>
                    ))}
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
                  <div className="text-gray-400 text-sm">
                    Answer: {opinion.currentAnswer}
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
                    <th className="text-right text-sm font-medium text-muted-foreground py-2">Price</th>
                    <th className="text-right text-sm font-medium text-muted-foreground py-2">Time</th>
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
                        {transaction.opinionTitle.substring(0, 40)}...
                      </td>
                      <td className="py-3 text-right text-white">
                        {formatUSDC(transaction.price)}
                      </td>
                      <td className="py-3 text-right text-gray-400">
                        {formatTimeAgo(transaction.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}