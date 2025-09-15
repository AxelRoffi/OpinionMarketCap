'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Timer,
  RefreshCw,
  Users,
  Eye,
  Plus,
  Activity,
  History,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { usePools } from './hooks/usePools';
import { useRouter } from 'next/navigation';
import JoinPoolModal from './components/JoinPoolModal';
import { TreasuryBalanceChecker } from '@/components/TreasuryBalanceChecker';
import { useCompletePool } from './hooks/useCompletePool';

// Helper functions with exact specifications
const formatNumber = (amount: number) => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toString();
};

const formatTimeLeft = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = timestamp - now;
  
  if (timeLeft <= 0) return 'Expired';
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  return `${hours}h ${minutes}m left`;
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return "bg-emerald-500"; // Green for close to target
  if (progress >= 70) return "bg-orange-500";  // Orange for in progress
  return "bg-blue-500"; // Blue for beginning
};

const getPoolStatus = (status: string | number, progress: number, deadline: number) => {
  // Handle both string and number status
  const numericStatus = typeof status === 'string' ? 
    (status === 'executed' ? 1 : status === 'expired' ? 2 : 0) : status;
  
  // Check contract status first
  if (numericStatus === 1 || status === 'executed') return 'executed';
  if (numericStatus === 2 || status === 'expired') return 'expired';
  
  // Check if deadline has passed (this is the key fix!)
  const now = Math.floor(Date.now() / 1000);
  if (deadline <= now) return 'expired';
  
  // Otherwise check progress
  return progress >= 95 ? 'about-to-execute' : 'active';
};

const getPoolStatusDisplay = (status: string) => {
  switch (status) {
    case 'executed': return { label: 'Executed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 'expired': return { label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    case 'about-to-execute': return { label: 'About to Execute', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    default: return { label: 'Active', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
};


// Stats Card Component - EXACT Layout
const StatsCard = ({ 
  icon: Icon, 
  iconColor, 
  title, 
  value, 
  subtitle 
}: {
  icon: any;
  iconColor: string;
  title: string;
  value: string;
  subtitle: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/40 rounded-lg p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className={`w-8 h-8 ${iconColor}`} />
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
    <h3 className="font-medium text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400">{subtitle}</p>
  </motion.div>
);

// Status Badge Component - Enhanced Colors
const StatusBadge = ({ status }: { status: string }) => {
  const statusDisplay = getPoolStatusDisplay(status);
  return (
    <Badge className={statusDisplay.color}>
      {statusDisplay.label}
    </Badge>
  );
};


export default function PoolsPage() {
  const router = useRouter();
  const { pools, platformStats, loading, error: poolsError, refetch } = usePools();
  const { completePool, isCompleting } = useCompletePool();
  
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [poolTypeFilter, setPoolTypeFilter] = useState('all-pools');
  const [sortFilter, setSortFilter] = useState('closest');
  
  // Join Pool Modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);

  const handleJoinPool = (pool: any) => {
    setSelectedPool(pool);
    setIsJoinModalOpen(true);
  };

  const handleCompletePool = async (pool: any) => {
    const remainingAmount = pool.targetPrice - pool.currentAmount;
    console.log('🔧 Completing pool:', { poolId: pool.id, remainingAmount });
    
    try {
      await completePool(pool.id, remainingAmount);
      // Refresh pools data after completion
      setTimeout(() => refetch(), 3000);
    } catch (error) {
      console.error('Failed to complete pool:', error);
    }
  };

  // Process pools data for display
  const processedPools = pools.map(pool => {
    const currentAmount = Number(pool.totalAmount) / 1_000_000;
    const targetPrice = Number(pool.targetPrice) / 1_000_000;
    
    // WORKAROUND: If targetPrice is 0 (old pools), use the targetPrice as fallback
    let actualTargetPrice = targetPrice;
    if (targetPrice === 0) {
      // Use the stored targetPrice from the pool data
      actualTargetPrice = Number(pool.targetPrice) / 1_000_000;
    }
    
    console.log(`Pool ${pool.id}: targetPrice=${targetPrice}, storedTargetPrice=${Number(pool.targetPrice)}, actualTargetPrice=${actualTargetPrice}`);
    
    // Real progress calculation
    const progress = actualTargetPrice > 0 ? Math.min((currentAmount / actualTargetPrice) * 100, 100) : 0;
    
    return {
      ...pool,
      currentAmount,
      targetPrice: actualTargetPrice,
      originalTargetPrice: targetPrice, // Keep track of original
      progress,
      poolStatus: getPoolStatus(pool.status, progress, pool.deadline),
      timeLeft: formatTimeLeft(pool.deadline),
      canUseCompletePool: targetPrice > 0 // Only pools with valid stored targetPrice can use completePool
    };
  });

  // Separate active and historical pools
  const activePools = processedPools.filter(pool => 
    pool.poolStatus === 'active' || pool.poolStatus === 'about-to-execute'
  );
  
  const historicalPools = processedPools.filter(pool => 
    pool.poolStatus === 'executed' || pool.poolStatus === 'expired'
  );

  // Filter pools based on current tab
  const currentPools = activeTab === 'active' ? activePools : historicalPools;
  
  // Filter and sort pools
  const filteredPools = currentPools.filter(pool => {
    const matchesSearch = searchQuery === '' || 
      pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.proposedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      (pool.category && pool.category.toLowerCase() === categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  // Sort pools
  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortFilter) {
      case 'closest':
        return b.progress - a.progress;
      case 'newest':
        return b.id - a.id;
      case 'largest':
        return b.currentAmount - a.currentAmount;
      case 'deadline':
        return a.deadline - b.deadline;
      default:
        return b.progress - a.progress;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-8 max-w-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-500" />
            Collective Pools
          </h1>
          <p className="text-gray-400 text-lg">
            Fund opinion changes together and share the rewards
          </p>
        </motion.div>

        {/* How it works alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900/50 border border-blue-700 rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">How Pools Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Create or Join a Pool</h4>
              <p>
                Users can create a new pool for an opinion with a proposed answer, a deadline, and an initial contribution.
                Others can then join the pool by contributing USDC. A 5usdc fee is charged for creating and a 1 usdc fee for contributing to a pool. This prevents gaming, pump and dump or spamming.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Fund the Pool</h4>
              <p>
                The goal is to collectively reach the opinion's <code className="bg-gray-700 p-1 rounded">nextPrice</code> before the deadline.
                If the target is met, the pool is executed, and the opinion's answer is updated. If you withdraw your contribution before deadline, you get a 20% penalty. This prevents gaming, spamming and bad behaviors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Share the Rewards</h4>
              <p>
                When the pool-owned answer is purchased by another user, the rewards are distributed proportionally to all pool contributors.
                If the pool expires, contributors can withdraw their funds.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 1. Platform Stats Cards - EXACT Layout (4 cards horizontal) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            icon={Target} 
            iconColor="text-blue-400"
            title="Total Active Pools" 
            value={platformStats.totalActivePools.toString()} 
            subtitle="Currently running"
          />
          <StatsCard 
            icon={DollarSign} 
            iconColor="text-emerald-400"
            title="Total Pooled Amount" 
            value={platformStats.totalPooledAmount} 
            subtitle="Collective funding"
          />
          <StatsCard 
            icon={TrendingUp} 
            iconColor="text-purple-400"
            title="Avg. Success Rate" 
            value={`${platformStats.avgSuccessRate}%`} 
            subtitle="Pools executed"
          />
          <StatsCard 
            icon={Activity} 
            iconColor="text-orange-400"
            title="Pools Executed Today" 
            value={platformStats.poolsExecutedToday.toString()} 
            subtitle="Successful pools"
          />
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800 border-gray-700">
              <TabsTrigger 
                value="active" 
                className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <Target className="h-4 w-4" />
                Active Pools
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {activePools.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
              >
                <History className="h-4 w-4" />
                Pool History
                <Badge className="ml-2 bg-gray-500/20 text-gray-400 border-gray-500/30">
                  {historicalPools.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* 2. Filters Row - EXACT Components (Search + 3 Dropdowns + Refresh) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 mb-6"
            >
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search pools, questions, or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>
          
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="social-media">Social Media</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Pool Type Filter */}
          <Select value={poolTypeFilter} onValueChange={setPoolTypeFilter}>
            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All Pools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-pools">All Pools</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="about-to-execute">About to Execute</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort Filter */}
          <Select value={sortFilter} onValueChange={setSortFilter}>
            <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Closest to Target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closest">Closest to Target</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="largest">Largest Amount</SelectItem>
              <SelectItem value="deadline">Ending Soon</SelectItem>
            </SelectContent>
          </Select>
          
              {/* Refresh Button */}
              <Button variant="outline" size="icon" className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Active Pools Tab */}
            <TabsContent value="active" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gray-800/50 border-gray-700/40 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Pool</TableHead>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Progress</TableHead>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Amount</TableHead>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Contributors</TableHead>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Time Left</TableHead>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Status</TableHead>
                  <TableHead className="text-left py-4 px-6 text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                      No pools found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedPools.map((pool, index) => (
                    <TableRow key={pool.id} className="border-b border-gray-700/40 hover:bg-gray-700/20">
                      {/* PREMIÈRE COLONNE SEULEMENT - Pool Info */}
                      <TableCell className="py-4 px-6">
                        <div>
                          {/* 1. Question en premier */}
                          <h3 className="font-semibold text-white text-base leading-tight">
                            {pool.question}
                          </h3>
                          
                          {/* 2. Opinion ID - petit et gris */}
                          <p className="text-xs text-gray-400 mt-1">
                            Opinion #{pool.opinionId}
                          </p>
                          
                          {/* 3. Pool Name - prominent and clickable */}
                          <h4 className="font-medium text-lg mt-2">
                            <button
                              onClick={() => router.push(`/pools/${pool.id}`)}
                              className="text-white hover:text-emerald-400 transition-colors cursor-pointer text-left"
                            >
                              {pool.name}
                            </button>
                          </h4>
                          
                          {/* 4. Answer avec quotes */}
                          <p className="text-sm text-white italic mt-1">
                            "{pool.proposedAnswer}"
                          </p>
                          
                          {/* 5. Category Badge */}
                          {pool.category && (
                            <Badge variant="secondary" className="mt-2 bg-blue-600/20 text-blue-400 border-blue-600/30">
                              {pool.category}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Column 2: Progress Bar */}
                      <TableCell className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-white mb-2">
                            {pool.progress.toFixed(1)}% complete
                          </p>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(pool.progress)}`}
                              style={{ width: `${Math.min(pool.progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Column 3: Amount */}
                      <TableCell className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-white">
                            ${formatNumber(pool.currentAmount)}
                          </p>
                          <p className="text-sm text-gray-400">
                            of ${formatNumber(pool.targetPrice)}
                          </p>
                        </div>
                      </TableCell>
                      
                      {/* Column 4: Contributors */}
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{pool.contributorCount}</span>
                        </div>
                      </TableCell>
                      
                      {/* Column 5: Time Left */}
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-orange-400" />
                          <span className="text-white">{pool.timeLeft}</span>
                        </div>
                      </TableCell>
                      
                      {/* Column 6: Status Badge */}
                      <TableCell className="py-4 px-6">
                        <StatusBadge status={pool.poolStatus} />
                      </TableCell>
                      
                      {/* Column 7: Actions */}
                      <TableCell className="py-4 px-6">
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => router.push(`/pools/${pool.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          {pool.progress >= 99 && pool.canUseCompletePool && pool.originalTargetPrice > 0 ? (
                            // Show Complete Pool button ONLY for NEW pools with valid stored targetPrice
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                              onClick={() => handleCompletePool(pool)}
                              disabled={isCompleting}
                            >
                              <Target className="h-4 w-4 mr-2" />
                              {isCompleting ? 'Completing...' : 'Complete Pool'}
                            </Button>
                          ) : (
                            // Show regular Join Pool button for ALL other cases (including old pools at 99%+)
                            <Button 
                              size="sm" 
                              className={`bg-gradient-to-r ${
                                pool.progress >= 99 
                                  ? 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' 
                                  : 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                              }`}
                              onClick={() => handleJoinPool(pool)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {pool.progress >= 99 ? 'Finish Pool (0.00825 USDC)' : 'Join Pool'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Pool History Tab */}
          <TabsContent value="history" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700/40 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Pool</TableHead>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Final Progress</TableHead>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Final Amount</TableHead>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Contributors</TableHead>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Completion Date</TableHead>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Result</TableHead>
                      <TableHead className="text-left py-4 px-6 text-white font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                          {activeTab === 'history' ? 'No completed or expired pools found' : 'No pools found matching your filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedPools.map((pool, index) => (
                        <TableRow key={pool.id} className="border-b border-gray-700/40 hover:bg-gray-700/20">
                          {/* Pool Info */}
                          <TableCell className="py-4 px-6">
                            <div>
                              <h3 className="font-semibold text-white text-base leading-tight">
                                {pool.question}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                Opinion #{pool.opinionId}
                              </p>
                              <h4 className="font-medium text-lg mt-2">
                                <button
                                  onClick={() => router.push(`/pools/${pool.id}`)}
                                  className="text-white hover:text-emerald-400 transition-colors cursor-pointer text-left"
                                >
                                  {pool.name}
                                </button>
                              </h4>
                              <p className="text-sm text-white italic mt-1">
                                "{pool.proposedAnswer}"
                              </p>
                              {pool.category && (
                                <Badge variant="secondary" className="mt-2 bg-blue-600/20 text-blue-400 border-blue-600/30">
                                  {pool.category}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          {/* Final Progress */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {pool.poolStatus === 'executed' ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400" />
                              )}
                              <span className={`font-medium ${
                                pool.poolStatus === 'executed' ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {pool.progress.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          
                          {/* Final Amount */}
                          <TableCell className="py-4 px-6">
                            <div>
                              <p className="font-semibold text-white">
                                ${formatNumber(pool.currentAmount)}
                              </p>
                              <p className="text-sm text-gray-400">
                                of ${formatNumber(pool.targetPrice)}
                              </p>
                            </div>
                          </TableCell>
                          
                          {/* Contributors */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-white">{pool.contributorCount}</span>
                            </div>
                          </TableCell>
                          
                          {/* Completion Date */}
                          <TableCell className="py-4 px-6">
                            <span className="text-white">
                              {new Date(pool.deadline * 1000).toLocaleDateString()}
                            </span>
                          </TableCell>
                          
                          {/* Result Badge */}
                          <TableCell className="py-4 px-6">
                            <Badge className={getPoolStatusDisplay(pool.poolStatus).color}>
                              {getPoolStatusDisplay(pool.poolStatus).label}
                            </Badge>
                          </TableCell>
                          
                          {/* Actions */}
                          <TableCell className="py-4 px-6">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={() => router.push(`/pools/${pool.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

        {/* Error State */}
        {poolsError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
              <p className="text-gray-400 mb-4">{poolsError}</p>
              <Button
                onClick={refetch}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                Retry Connection
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Join Pool Modal */}
        <JoinPoolModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          pool={selectedPool}
        />
        
        {/* Treasury Balance Checker - Shows despite explorer errors */}
        <TreasuryBalanceChecker />
      </div>
    </>
  );
}