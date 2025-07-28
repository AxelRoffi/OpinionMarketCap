'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { PoolFilters, Pool } from './types/pool-types';
import { usePools } from './hooks/usePools';
import { useRouter } from 'next/navigation';
import JoinPoolModal from './components/JoinPoolModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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

const getPoolStatus = (progress: number) => {
  return progress >= 95 ? 'about-to-execute' : 'active';
};

const getStatusConfig = (progress: number) => {
  if (progress >= 95) {
    return {
      text: 'About to Execute',
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
  }
  return {
    text: 'Active',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };
};

const getProgressText = (progress: number) => {
  if (progress >= 95) return 'Ready to execute';
  if (progress >= 70) return 'Almost there';
  return 'In progress';
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

// Status Badge Component - EXACT Colors
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'about-to-execute') {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        About to Execute
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
      Active
    </Badge>
  );
};


export default function PoolsPage() {
  const router = useRouter();
  const { pools, platformStats, loading, error: poolsError, refetch } = usePools();
  const { completePool, isCompleting } = useCompletePool();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [poolTypeFilter, setPoolTypeFilter] = useState('all-pools');
  const [sortFilter, setSortFilter] = useState('closest');
  
  // Join Pool Modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  
  // Navigation states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    
    // WORKAROUND: If targetPrice is 0 (old pools), calculate it dynamically
    let actualTargetPrice = targetPrice;
    if (targetPrice === 0 && pool.currentPrice) {
      actualTargetPrice = Number(pool.currentPrice) / 1_000_000;
    }
    
    console.log(`Pool ${pool.id}: targetPrice=${targetPrice}, currentPrice=${pool.currentPrice}, actualTargetPrice=${actualTargetPrice}`);
    
    // Real progress calculation
    const progress = actualTargetPrice > 0 ? (currentAmount / actualTargetPrice) * 100 : 0;
    
    return {
      ...pool,
      currentAmount,
      targetPrice: actualTargetPrice,
      originalTargetPrice: targetPrice, // Keep track of original
      progress,
      status: getPoolStatus(progress),
      timeLeft: formatTimeLeft(pool.deadline),
      canUseCompletePool: targetPrice > 0 // Only pools with valid stored targetPrice can use completePool
    };
  });

  // Filter and sort pools
  const filteredPools = processedPools.filter(pool => {
    const matchesSearch = searchQuery === '' || 
      pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.proposedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      pool.category.toLowerCase() === categoryFilter;
    
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
              <a href="/pools" className="text-emerald-500 font-bold">Pools</a>
              <a href="/profile" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Profile</a>
              <a href="/create" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Create</a>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle - ENABLED functionality with proper spacing */}
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
                  <a href="/pools" className="text-emerald-500 font-bold">Pools</a>
                  <a href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</a>
                  <a href="/create" className="text-gray-300 hover:text-white transition-colors">Create</a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

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

        {/* 3. Table Structure - OBLIGATOIRE Desktop Format (7 columns) */}
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
                          
                          {/* 3. Pool Name - prominent */}
                          <h4 className="font-medium text-white text-lg mt-2">
                            {pool.name}
                          </h4>
                          
                          {/* 4. Answer avec quotes */}
                          <p className="text-sm text-white italic mt-1">
                            "{pool.proposedAnswer}"
                          </p>
                          
                          {/* 5. Category Badge */}
                          <Badge variant="secondary" className="mt-2 bg-blue-600/20 text-blue-400 border-blue-600/30">
                            {pool.category}
                          </Badge>
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
                        <StatusBadge status={pool.status} />
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
    </div>
  );
}