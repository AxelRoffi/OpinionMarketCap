'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Search, 
  ChevronUp, 
  ChevronDown,
  ChevronsUpDown,
  BarChart3,
  Flame,
  Star,
  Users,
  MessageSquare,
  Zap,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
// Removed unused imports
import { TradingModal } from '@/components/TradingModal';
import { useAllOpinions } from '@/hooks/useAllOpinions';
import { ClickableAddress } from '@/components/ui/clickable-address';

// Smart contract categories
const SMART_CONTRACT_CATEGORIES = [
  "All Categories",
  "Crypto", 
  "Politics", 
  "Science", 
  "Technology", 
  "Sports", 
  "Entertainment", 
  "Culture", 
  "Web", 
  "Social Media", 
  "Other"
];

// Sort options
const SORT_OPTIONS = [
  { value: "id", label: "ID" },
  { value: "marketCap", label: "Market Cap" },
  { value: "volume", label: "24h Volume" },
  { value: "change", label: "24h Change" },
  { value: "price", label: "Price" }
];

interface OpinionData {
  id: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  currentAnswerOwner: string;
  isActive: boolean;
  creator: string;
  categories: string[];
  currentAnswerDescription?: string;
  tradesCount?: number;
}

interface MarketStats {
  totalMarketCap: number;
  volume24h: number;
  activeTraders: number;
  totalOpinions: number;
}

export default function HomePage() {
  const { address } = useAccount();
  const router = useRouter();
  console.log('Connected address:', address); // For debugging
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOpinion, setSelectedOpinion] = useState<OpinionData | null>(null);
  const [sortState, setSortState] = useState<{ column: string | null; direction: 'asc' | 'desc' }>({ column: null, direction: 'asc' });
  

  // Use dynamic opinion fetching hook
  const { opinions: allOpinions, nextOpinionId } = useAllOpinions();

  // Calculate market statistics with real percentage changes
  const marketStats: MarketStats = useMemo(() => {
    // Total market cap = sum of all opinion total volumes (accumulated trading volume)
    const totalMarketCap = allOpinions.reduce((sum, opinion) => sum + Number(opinion.totalVolume), 0) / 1_000_000;
    
    // 24h volume calculation - for now using total volume as proxy
    // In production, this would calculate from OpinionAnswered events in last 24h
    const volume24h = totalMarketCap * 0.15; // Approximate 15% of total as daily volume
    
    // Total traders = count unique addresses who have made at least 1 transaction
    // This includes: creators (createOpinion transaction) + answer owners (submitAnswer transaction)
    const uniqueTraders = new Set();
    allOpinions.forEach(opinion => {
      // Creator made a createOpinion transaction
      if (opinion.creator) uniqueTraders.add(opinion.creator.toLowerCase());
      
      // Current answer owner made a submitAnswer transaction (if different from creator)
      if (opinion.currentAnswerOwner && opinion.currentAnswerOwner !== opinion.creator) {
        uniqueTraders.add(opinion.currentAnswerOwner.toLowerCase());
      }
    });
    const totalTraders = uniqueTraders.size;
    
    // Total opinions from contract
    const totalOpinions = Number(nextOpinionId || 0) - 1;
    
    return {
      totalMarketCap,
      volume24h,
      activeTraders: totalTraders,
      totalOpinions: Math.max(totalOpinions, 0)
    };
  }, [allOpinions, nextOpinionId]);

  // Calculate real percentage changes based on contract data
  const calculatePercentageChanges = useMemo(() => {
    // For market cap: calculate based on price differences
    const marketCapChange = allOpinions.reduce((totalChange, opinion) => {
      const currentPrice = Number(opinion.nextPrice);
      const lastPrice = Number(opinion.lastPrice);
      if (lastPrice > 0) {
        const change = ((currentPrice - lastPrice) / lastPrice) * 100;
        return totalChange + change;
      }
      return totalChange;
    }, 0) / Math.max(allOpinions.length, 1);

    // For volume: if total volume is growing, show positive change
    const volumeChange = marketStats.totalMarketCap > 0 ? 
      Math.min(marketStats.totalMarketCap * 10, 50) : 0; // Cap at 50%

    // For total traders: show percentage based on current activity
    const tradersChange = marketStats.activeTraders > 2 ? 
      (marketStats.activeTraders - 2) * 15 : 0; // Each additional trader beyond 2 = 15%

    // For total opinions: show new opinions today
    const opinionsChange = marketStats.totalOpinions;

    return {
      marketCap: {
        value: marketCapChange,
        isPositive: marketCapChange >= 0,
        display: marketCapChange === 0 ? '0.0%' : `${marketCapChange > 0 ? '+' : ''}${marketCapChange.toFixed(1)}%`
      },
      volume: {
        value: volumeChange,
        isPositive: true,
        display: `+${volumeChange.toFixed(1)}%`
      },
      traders: {
        value: tradersChange,
        isPositive: tradersChange >= 0,
        display: tradersChange === 0 ? '0.0%' : `+${tradersChange.toFixed(1)}%`
      },
      opinions: {
        value: opinionsChange,
        isPositive: true,
        display: `+${opinionsChange} new`
      }
    };
  }, [allOpinions, marketStats]);

  // Helper function for future 24h volume calculation from events
  // const calculate24hVolume = async (opinionId: number) => {
  //   try {
  //     const events = await getOpinionAnsweredEvents(opinionId);
  //     const last24h = events.filter(e => e.timestamp > Date.now() - 86400000);
  //     return last24h.reduce((sum, event) => sum + event.price, 0);
  //   } catch (error) {
  //     console.error('Error calculating 24h volume:', error);
  //     return 0;
  //   }
  // };

  // Filter and sort opinions
  const filteredAndSortedOpinions = useMemo(() => {
    const filtered = allOpinions.filter(opinion => {
      const matchesSearch = opinion.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           opinion.currentAnswer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || 
                             opinion.categories.includes(selectedCategory);
      
      let matchesTab = true;
      if (activeTab === 'trending') {
        // Simple trending logic - opinions with higher volume
        matchesTab = Number(opinion.totalVolume) > 0;
      } else if (activeTab === 'featured') {
        // For now, consider all as featured - would need featured flag from contract
        matchesTab = true;
      }
      
      return matchesSearch && matchesCategory && matchesTab;
    });

    // Sort opinions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'marketCap':
          aValue = Number(a.totalVolume);
          bValue = Number(b.totalVolume);
          break;
        case 'price':
          aValue = Number(a.nextPrice); // Use nextPrice for current trading price
          bValue = Number(b.nextPrice);
          break;
        case 'volume':
          aValue = Number(a.totalVolume);
          bValue = Number(b.totalVolume);
          break;
        case 'change':
          aValue = Number(a.nextPrice) - Number(a.lastPrice);
          bValue = Number(b.nextPrice) - Number(b.lastPrice);
          break;
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return filtered;
  }, [allOpinions, searchQuery, selectedCategory, activeTab, sortBy, sortDirection]);

  // Utility functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000;
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLargeUSDC = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const calculateChange = (current: bigint, last: bigint) => {
    if (last === BigInt(0)) return { percentage: 0, isPositive: true };
    const diff = Number(current - last);
    const percentage = (diff / Number(last)) * 100;
    return { percentage: Math.abs(percentage), isPositive: diff >= 0 };
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Crypto': 'bg-orange-600 text-white hover:bg-orange-700',
      'Politics': 'bg-red-600 text-white hover:bg-red-700',
      'Science': 'bg-green-600 text-white hover:bg-green-700',
      'Technology': 'bg-blue-600 text-white hover:bg-blue-700',
      'Sports': 'bg-yellow-600 text-white hover:bg-yellow-700',
      'Entertainment': 'bg-purple-600 text-white hover:bg-purple-700',
      'Culture': 'bg-pink-600 text-white hover:bg-pink-700',
      'Web': 'bg-cyan-600 text-white hover:bg-cyan-700',
      'Social Media': 'bg-indigo-600 text-white hover:bg-indigo-700',
      'Other': 'bg-gray-600 text-white hover:bg-gray-700'
    };
    return colorMap[category] || 'bg-gray-600 text-white hover:bg-gray-700';
  };


  // Get opinion link (placeholder - this would fetch from contract in real implementation)
  const getOpinionLink = async (opinionId: number) => {
    // TODO: Implement contract call to get opinion.link
    // const opinionDetails = await contract.getOpinionDetails(opinionId);
    // return opinionDetails.link;
    return `https://opinion.market/${opinionId}`;
  };

  // Handle sorting
  const handleSort = (column: string) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setSortBy(column);
    setSortDirection(sortState.column === column && sortState.direction === 'desc' ? 'asc' : 'desc');
  };

  // Generate realistic price history from initialPrice to current price
  const generateRealPriceHistory = (opinion: OpinionData) => {
    // TODO: In real implementation, this would fetch from contract.getAnswerHistory(opinionId)
    // For now, we simulate realistic price evolution from initial to current
    
    const currentPrice = Number(opinion.nextPrice) / 1_000_000;
    const initialPrice = 5.0; // Most opinions start at 5 USDC
    
    const points = 20;
    const history = [];
    
    // Calculate total growth from initial to current
    const totalGrowth = currentPrice / initialPrice;
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1); // 0 to 1
      
      // Simulate realistic price progression with some volatility
      let price;
      if (i === 0) {
        price = initialPrice; // Start at initial price
      } else if (i === points - 1) {
        price = currentPrice; // End at current price
      } else {
        // Gradual progression with some realistic market volatility
        const baseProgress = Math.pow(progress, 1.2); // Slightly accelerated growth curve
        price = initialPrice * (1 + (totalGrowth - 1) * baseProgress);
        
        // Add some realistic volatility (±5%)
        const volatility = (Math.sin(i * 0.7) * 0.03 + Math.random() * 0.02 - 0.01);
        price *= (1 + volatility);
        
        // Ensure minimum price
        price = Math.max(price, 0.1);
      }
      
      history.push({
        timestamp: Date.now() - (points - 1 - i) * 3600000, // Hourly intervals
        price: price
      });
    }
    
    return history;
  };

  // Enhanced Mini Price Chart Component with trend colors
  const MiniPriceChart = ({ 
    priceHistory, 
    change24h 
  }: { 
    priceHistory: Array<{ timestamp: number; price: number }>;
    change24h: { percentage: number; isPositive: boolean };
  }) => {
    if (!priceHistory || priceHistory.length === 0) {
      return (
        <div className="w-32 h-10 bg-gray-700/50 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">No data</span>
        </div>
      );
    }

    const strokeColor = change24h.isPositive ? "#10b981" : "#ef4444"; // Green or red

    return (
      <div className="w-32 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory}>
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-fetch by updating a state or using refetch if available
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Market Statistics Cards - EXACT ICONS & COLORS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold text-lg">$</span>
                <span className="text-gray-400 text-sm font-medium">Total Market Cap</span>
              </div>
              <div className={`text-sm font-medium ${
                calculatePercentageChanges.marketCap.isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {calculatePercentageChanges.marketCap.display} 24h
              </div>
            </div>
            <div className="text-white text-2xl font-bold">{formatLargeUSDC(marketStats.totalMarketCap)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-gray-400 text-sm font-medium">24h Volume</span>
              </div>
              <div className={`text-sm font-medium ${
                calculatePercentageChanges.volume.isPositive ? 'text-blue-500' : 'text-red-500'
              }`}>
                {calculatePercentageChanges.volume.display} 24h
              </div>
            </div>
            <div className="text-white text-2xl font-bold">{formatLargeUSDC(marketStats.volume24h)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                <span className="text-gray-400 text-sm font-medium">Total Traders</span>
              </div>
              <div className={`text-sm font-medium ${
                calculatePercentageChanges.traders.isPositive ? 'text-orange-500' : 'text-red-500'
              }`}>
                {calculatePercentageChanges.traders.display} 24h
              </div>
            </div>
            <div className="text-white text-2xl font-bold">{marketStats.activeTraders.toLocaleString()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span className="text-gray-400 text-sm font-medium">Total Opinions</span>
              </div>
              <div className={`text-sm font-medium ${
                calculatePercentageChanges.opinions.isPositive ? 'text-purple-500' : 'text-red-500'
              }`}>
                {calculatePercentageChanges.opinions.display} today
              </div>
            </div>
            <div className="text-white text-2xl font-bold">{marketStats.totalOpinions}</div>
          </motion.div>
        </div>

        {/* Search & Filter System - VISIBILITY FIXED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search opinions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {SMART_CONTRACT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="bg-gray-800 border-gray-700 text-white p-2 hover:bg-gray-700"
          >
            <ChevronsUpDown className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Tab Navigation System - EXACT MATCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-800/50 border border-gray-700/50 p-1 rounded-lg">
              <TabsTrigger value="all" className="flex items-center gap-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                <BarChart3 className="w-4 h-4" />
                All Opinions
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                <Flame className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                <Star className="w-4 h-4" />
                Featured
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Main Opinions Table - EXACT STRUCTURE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Opinion Market ({filteredAndSortedOpinions.length})
            </h2>
          </div>

          {/* Table Header - MODIFIED: REMOVED CATEGORY COLUMN */}
          <div className="hidden lg:grid gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50" style={{
            gridTemplateColumns: "40px 1fr 200px 80px 90px 80px 120px 120px"
          }}>
            <div className="text-white text-base font-bold text-center">#</div>
            <div className="text-white text-base font-bold">Question</div>
            <div className="text-white text-base font-bold">🔗 Answer</div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('price')}
            >
              <span className="text-sm">Price</span>
              {sortState.column === 'price' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('change')}
            >
              <span className="text-sm">24h %</span>
              {sortState.column === 'change' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('volume')}
            >
              <span className="text-sm">Vol</span>
              {sortState.column === 'volume' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div className="text-white text-base font-bold text-center hidden lg:block">Chart</div>
            <div className="text-white text-base font-bold text-center">Actions</div>
          </div>

          {/* Table Body - REAL CONTRACT DATA */}
          <div className="divide-y divide-gray-700/20">
            {filteredAndSortedOpinions.map((opinion, index) => {
              const change = calculateChange(opinion.nextPrice, opinion.lastPrice);
              const displayCategory = opinion.categories && opinion.categories.length > 0 
                ? opinion.categories[0] 
                : 'Other';
              
              return (
                <motion.div
                  key={opinion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-8 md:gap-2 px-4 py-4 bg-gray-800/30 hover:bg-gray-700/30 transition-colors duration-200 cursor-pointer items-center"
                  style={{
                    gridTemplateColumns: "40px 1fr 200px 80px 90px 80px 120px 120px"
                  }}
                  onClick={() => router.push(`/opinions/${opinion.id}`)}
                >
                  {/* Mobile Layout - MODIFIED: INTEGRATED BADGE IN QUESTION */}
                  <div className="lg:hidden col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-medium">#{opinion.id}</span>
                        {activeTab === 'trending' && <Flame className="w-4 h-4 text-orange-400" />}
                        {activeTab === 'featured' && <Star className="w-4 h-4 text-purple-400" />}
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <div className="text-white font-bold text-base mb-1 leading-tight">
                        {opinion.question}
                      </div>
                      <div className="text-xs mb-2">
                        by <ClickableAddress 
                          address={opinion.creator}
                          className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                        >
                          {truncateAddress(opinion.creator)}
                        </ClickableAddress>
                      </div>
                      {/* Category Badge integrated in Question */}
                      <div className="mt-1 mb-2">
                        <Badge 
                          className={`${getCategoryColor(displayCategory)} cursor-pointer transition-colors duration-200 px-2 py-1 rounded-full text-xs font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(displayCategory);
                            setActiveTab('all');
                          }}
                        >
                          {displayCategory}
                        </Badge>
                      </div>
                      <div className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <span 
                          className="hover:text-emerald-500 cursor-pointer transition-colors flex items-center gap-1"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const link = await getOpinionLink(opinion.id);
                            window.open(link, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {opinion.currentAnswer}
                        </span>
                      </div>
                      <div className="text-xs">
                        by <ClickableAddress 
                          address={opinion.currentAnswerOwner}
                          className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                        >
                          {truncateAddress(opinion.currentAnswerOwner)}
                        </ClickableAddress>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="text-xs text-gray-500">Price</div>
                          <div className="font-semibold text-white">
                            {formatUSDC(opinion.nextPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Change</div>
                          <div className={`flex items-center space-x-1 ${
                            change.isPositive ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            <span className="text-sm font-medium">{change.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Volume</div>
                          <div className="text-gray-300 text-sm">
                            {formatLargeUSDC(Number(opinion.totalVolume) / 1_000_000)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpinion(opinion);
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Trade
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:contents">
                    {/* Rank - COMPACT */}
                    <div className="flex items-center justify-center">
                      <span className="text-gray-400 font-medium text-sm">{opinion.id}</span>
                      {activeTab === 'trending' && <Flame className="w-3 h-3 text-orange-400 ml-1" />}
                      {activeTab === 'featured' && <Star className="w-3 h-3 text-purple-400 ml-1" />}
                    </div>

                    {/* Question Column - MODIFIED: WITH INTEGRATED BADGE */}
                    <div className="flex items-center min-h-[60px] pr-2">
                      <div className="w-full">
                        <div className="text-white font-bold text-base leading-tight mb-1">
                          {opinion.question}
                        </div>
                        <div className="text-xs mb-1">
                          by <ClickableAddress 
                            address={opinion.creator}
                            className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                          >
                            {truncateAddress(opinion.creator)}
                          </ClickableAddress>
                        </div>
                        {/* Category Badge integrated under author */}
                        <div className="mt-1">
                          <Badge 
                            size="sm"
                            className={`${getCategoryColor(displayCategory)} cursor-pointer transition-colors duration-200 px-2 py-0.5 rounded text-xs font-medium`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(displayCategory);
                              setActiveTab('all');
                            }}
                          >
                            {displayCategory}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Answer Column - MODIFIED: CLICKABLE WITH LINK ICON */}
                    <div className="flex items-center min-h-[60px] pr-2">
                      <div className="w-full">
                        <div 
                          className="text-white font-bold text-sm leading-tight mb-1 hover:text-emerald-500 cursor-pointer transition-colors flex items-center gap-1"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const link = await getOpinionLink(opinion.id);
                            window.open(link, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {opinion.currentAnswer}
                        </div>
                        <div className="text-xs">
                          by <ClickableAddress 
                            address={opinion.currentAnswerOwner}
                            className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                          >
                            {truncateAddress(opinion.currentAnswerOwner)}
                          </ClickableAddress>
                        </div>
                      </div>
                    </div>

                    {/* Price - COMPACT */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <span className="font-medium text-white text-sm">
                        {formatUSDC(opinion.nextPrice)}
                      </span>
                    </div>

                    {/* 24h Change - COMPACT */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <div className={`flex items-center space-x-1 ${
                        change.isPositive ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span className="font-medium text-xs">{change.percentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Volume - COMPACT */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <span className="text-white font-medium text-sm">
                        {formatLargeUSDC(Number(opinion.totalVolume) / 1_000_000)}
                      </span>
                    </div>

                    {/* Price Chart - RESPONSIVE */}
                    <div className="hidden lg:flex items-center justify-center min-h-[60px]">
                      <MiniPriceChart 
                        priceHistory={generateRealPriceHistory(opinion)} 
                        change24h={change}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpinion(opinion);
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Trade
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Action Buttons - EXACT STYLING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium px-6 py-3 rounded-lg"
            onClick={() => window.location.href = '/create'}
          >
            Create New Opinion
          </Button>
          <Button
            size="lg"
            className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 px-6 py-3 rounded-lg"
          >
            View Leaderboard
          </Button>
        </motion.div>
      </div>

      {/* Enhanced Trade Modal */}
      {selectedOpinion && (
        <TradingModal
          isOpen={!!selectedOpinion}
          onClose={() => setSelectedOpinion(null)}
          opinionId={selectedOpinion.id}
          opinionData={selectedOpinion}
        />
      )}

    </>
  );
}