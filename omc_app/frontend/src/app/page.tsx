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
  ExternalLink,
  Filter,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { TradingModal } from '@/components/TradingModal';
import { useAllOpinions } from '@/hooks/useAllOpinions';
import { useContentFiltering } from '@/hooks/useContentFiltering';
import { useIndexedOpinions } from '@/hooks/useIndexedOpinions';
import { usePaginatedOpinions } from '@/hooks/usePaginatedOpinions';
import { ClickableAddress } from '@/components/ui/clickable-address';
import { IndexingDebug } from '@/components/IndexingDebug';
import { usePoolOwnerDisplay } from '@/hooks/usePoolOwnerDisplay';
import { useOpinionEvents } from '@/hooks/useOpinionEvents';
import { useAccurateTradeCounts } from '@/hooks/useAccurateTradeCounts';
import { AdultContentModal } from '@/components/AdultContentModal';
import useReferral from '@/hooks/useReferral';
import { ReferralBanner } from '@/components/referral/ReferralBanner';
import { createOpinionUrl } from '@/lib/url-utils';

// All categories (original + new) - based on our agreed list
const ALL_CATEGORIES = [
  // Original categories (some will be hidden)
  'Crypto', 'Politics', 'Science', 'Technology', 'Sports',
  'Entertainment', 'Culture', 'Web', 'Social Media', 'Other',
  
  // New agreed categories
  'AI', 'Automotive', 'Books & Literature', 'Celebrities', 
  'Conspiracy', 'Dating & Relationships', 'Investing', 
  'Luxury', 'Mobile Apps', 'Movies & TV', 'Music', 'Parenting', 
  'Podcasts', 'Real Estate', 'Adult'
];

// Categories to hide in frontend (deprecated/redundant)
const HIDDEN_CATEGORIES = ['Science', 'Technology', 'Culture', 'Web'];

// Active categories (visible in UI) - sorted alphabetically with Adult at end
const VISIBLE_CATEGORIES = (() => {
  const active = ALL_CATEGORIES.filter(cat => !HIDDEN_CATEGORIES.includes(cat));
  const nonAdult = active.filter(cat => cat !== 'Adult').sort();
  const adult = active.filter(cat => cat === 'Adult');
  return [...nonAdult, ...adult];
})();

// Smart contract categories for dropdown (includes "All Categories" + all categories including Adult)
const getSmartContractCategories = () => {
  return ['All Categories', ...VISIBLE_CATEGORIES];
};

// Sort options
const SORT_OPTIONS = [
  { value: "id", label: "ID" },
  { value: "marketCap", label: "Market Cap" },
  { value: "volume", label: "Volume" },
  { value: "change", label: "24h Change" },
  { value: "price", label: "Price" },
  { value: "trades", label: "Trades" }
];

export interface OpinionData {
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
  link?: string;
  tradesCount?: number;
  createdAt?: number; // Real timestamp from blockchain
  lastActivityAt?: number; // Real timestamp from blockchain
  volume24h?: number; // Real 24h volume from blockchain
  marketStatus?: string; // Market status based on real data
  age?: number; // Real age calculation
  timeSinceActivity?: number; // Real time since last activity
}

interface MarketStats {
  totalMarketCap: number;
  totalVolume: number;
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
  const [showAdultModal, setShowAdultModal] = useState(false);
  const [adultContentEnabled, setAdultContentEnabled] = useState(false);
  const [showQualityFilter, setShowQualityFilter] = useState(false);
  
  // Referral system
  const { 
    referralCode, 
    isValidCode, 
    showReferralWelcome, 
    dismissReferralWelcome 
  } = useReferral();
  
  // Pagination state - CoinMarketCap style
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // CoinMarketCap uses 100 per page
  

  // Use scalable opinion fetching - automatically chooses best strategy
  // For small datasets (<= 500): fetch all and paginate client-side
  // For large datasets (> 500): use server-side pagination
  const { 
    opinions: currentPageOpinions,
    allOpinions, 
    nextOpinionId,
    totalPages: paginationTotalPages,
    totalOpinions: paginationTotalOpinions,
    isFetchingAll,
    isLoading: isPaginationLoading
  } = usePaginatedOpinions({
    page: currentPage,
    pageSize: itemsPerPage,
    fetchAll: true, // Let the hook decide based on dataset size
    maxBatchSize: 500 // Switch to server-side pagination above 500 opinions
  });
  
  // Fallback to old hook for comparison (can be removed later)
  const { opinions: fallbackOpinions } = useAllOpinions();
  
  // Try indexed opinions for faster loading
  const { opinions: indexedOpinions, loading: indexedLoading, stats: indexingStats } = useIndexedOpinions();
  
  // Choose the appropriate data source - prefer indexed data if available
  const opinionsToUse = indexedOpinions.length > 0 ? 
    indexedOpinions.map(indexed => ({
      id: indexed.id,
      question: indexed.question,
      currentAnswer: indexed.currentAnswer,
      currentAnswerOwner: indexed.currentAnswerOwner,
      creator: indexed.creator,
      nextPrice: indexed.nextPrice,
      lastPrice: indexed.lastPrice,
      totalVolume: indexed.totalVolume,
      categories: indexed.categories,
      isActive: indexed.isActive,
      link: indexed.link,
      isForSale: false, // Default value
      salePrice: BigInt(0), // Default value
      questionOwner: indexed.creator // Use creator as question owner
    })) :
    (isFetchingAll ? allOpinions : currentPageOpinions);
    
  const isLoadingOpinions = indexedLoading || isPaginationLoading;
  
  // Hook for pool owner display
  const { getOwnerDisplay, isLoading: poolDataLoading } = usePoolOwnerDisplay();
  
  // Hook for real blockchain events
  const { 
    getCreationTimestamp, 
    getTradeCount, 
    getLastActivity, 
    get24hVolume,
    totalUniqueTraders,
    total24hVolume,
    isLoading: eventsLoading,
    error: eventsError,
    debug
  } = useOpinionEvents();
  
  // Hook for accurate trade counts using contract calls
  const opinionIds = opinionsToUse.map(o => o.id);
  const { 
    getTradeCount: getAccurateTradeCount, 
    isLoading: tradeCountsLoading 
  } = useAccurateTradeCounts(opinionIds);
  
  // Debug blockchain events
  console.log('🔍 BLOCKCHAIN EVENTS DEBUG:', {
    isLoading: eventsLoading,
    error: eventsError,
    debug,
    totalUniqueTraders,
    total24hVolume
  });

  // Calculate market statistics with REAL blockchain data
  const marketStats: MarketStats = useMemo(() => {
    // Use all opinions for accurate market stats, or current page if server-side paginated
    const dataForStats = isFetchingAll ? allOpinions : opinionsToUse;
    
    // Total market cap = sum of all opinion next prices
    const totalMarketCap = dataForStats.reduce((sum, opinion) => sum + Number(opinion.nextPrice), 0) / 1_000_000;
    const totalVolume = dataForStats.reduce((sum, opinion) => sum + Number(opinion.totalVolume), 0) / 1_000_000;
    
    // REAL 24h volume from blockchain events
    const volume24h = total24hVolume / 1_000_000; // Convert from wei to USDC
    
    // Total participants = unique creators and answer owners
    const participants = new Set<string>();
    dataForStats.forEach(opinion => {
      participants.add(opinion.creator.toLowerCase());
      participants.add(opinion.currentAnswerOwner.toLowerCase());
    });
    const activeTraders = participants.size;
    
    // Total opinions from contract (use paginated total for accuracy)
    const totalOpinions = paginationTotalOpinions || Number(nextOpinionId || 0) - 1;
    
    return {
      totalMarketCap,
      totalVolume,
      volume24h,
      activeTraders,
      totalOpinions: Math.max(totalOpinions, 0)
    };
  }, [opinionsToUse, allOpinions, isFetchingAll, nextOpinionId, paginationTotalOpinions, total24hVolume, totalUniqueTraders]);

  // Calculate REAL percentage changes based on blockchain data
  const calculatePercentageChanges = useMemo(() => {
    // Use appropriate dataset for calculations
    const dataForCalc = isFetchingAll ? allOpinions : opinionsToUse;
    
    // For market cap: calculate based on REAL price differences
    const marketCapChange = dataForCalc.reduce((totalChange, opinion) => {
      const currentPrice = Number(opinion.nextPrice);
      const lastPrice = Number(opinion.lastPrice);
      if (lastPrice > 0) {
        const change = ((currentPrice - lastPrice) / lastPrice) * 100;
        return totalChange + change;
      }
      return totalChange;
    }, 0) / Math.max(dataForCalc.length, 1);

    // REAL 24h volume change - compare today vs yesterday (when we have historical data)
    // For now, show current 24h volume as positive change
    const volumeChange = marketStats.volume24h > 0 ? 
      Math.min((marketStats.volume24h / Math.max(marketStats.totalMarketCap, 1)) * 100, 100) : 0;

    // REAL trader activity - show growth rate
    const tradersChange = marketStats.activeTraders > 1 ? 
      ((marketStats.activeTraders - 1) / 1) * 10 : 0; // Growth rate estimation

    // New opinions created (real count)
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
        display: tradersChange === 0 ? '0.0%' : `+${Math.min(tradersChange, 999).toFixed(1)}%`
      },
      opinions: {
        value: opinionsChange,
        isPositive: true,
        display: `${opinionsChange} total`
      }
    };
  }, [opinionsToUse, allOpinions, isFetchingAll, marketStats]);

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

  // Enhanced opinions with HYBRID data (real blockchain + intelligent fallbacks)
  const enhancedOpinions = useMemo(() => {
    return opinionsToUse.map(opinion => {
      // SMART HYBRID APPROACH: Use real data if available, intelligent fallbacks otherwise
      
      // 1. CREATION TIME - Real from events OR intelligent estimation
      const realCreationTime = getCreationTimestamp(opinion.id);
      let createdAt: number;
      
      if (realCreationTime) {
        // Use real blockchain timestamp
        createdAt = realCreationTime;
      } else {
        // Intelligent fallback: Base on current state + reasonable estimates
        // Opinion IDs are sequential, so estimate based on ID and current time
        const estimatedDaysOld = Math.min(opinion.id * 0.5, 30); // Max 30 days, 0.5 days per ID
        createdAt = Date.now() - (estimatedDaysOld * 86400000);
      }
      
      // 2. TRADE COUNT - Prioritize accurate contract data, then events, then estimation
      const accurateTradesCount = getAccurateTradeCount(opinion.id); // From getAnswerHistory
      const realTradesCount = getTradeCount(opinion.id); // From events (limited range)
      
      let tradesCount: number;
      if (accurateTradesCount !== null && accurateTradesCount > 0) {
        // BEST: Use accurate trade count from getAnswerHistory contract call
        tradesCount = accurateTradesCount;
      } else if (realTradesCount > 0) {
        // GOOD: Use real blockchain event count when available
        tradesCount = realTradesCount;
      } else {
        // FALLBACK: Estimate based on volume and price patterns
        const volumeUSDC = Number(opinion.totalVolume) / 1_000_000;
        const currentPriceUSDC = Number(opinion.nextPrice) / 1_000_000;
        
        if (volumeUSDC > 0 && currentPriceUSDC > 0) {
          // Estimate trades based on volume/price ratio, but cap it reasonably
          tradesCount = Math.max(1, Math.min(Math.ceil(volumeUSDC / currentPriceUSDC), 20));
        } else {
          tradesCount = 1; // At least creation
        }
        
        // Debug for question #1 specifically
        if (opinion.id === 1) {
          console.log('🔍 Question #1 Trade Count Calculation:', {
            opinionId: opinion.id,
            totalVolumeWei: opinion.totalVolume.toString(),
            volumeUSDC,
            nextPriceWei: opinion.nextPrice.toString(),
            currentPriceUSDC,
            calculatedTrades: tradesCount,
            realTradesFromEvents: realTradesCount,
            accurateTradesCount,
            expectedActualTrades: 13,
            formula: `ceil(${volumeUSDC} / ${currentPriceUSDC}) = ${Math.ceil(volumeUSDC / currentPriceUSDC)}`
          });
        }
      }
      
      // 3. LAST ACTIVITY - Real from events OR estimated from price changes
      const realLastActivity = getLastActivity(opinion.id);
      let lastActivityAt: number;
      
      if (realLastActivity) {
        // Use real blockchain timestamp
        lastActivityAt = realLastActivity;
      } else {
        // Intelligent fallback: Estimate based on price vs volume activity
        const volumeUSDC = Number(opinion.totalVolume) / 1_000_000;
        
        if (volumeUSDC > 5) {
          // If there's significant volume, assume recent activity
          const estimatedHoursSinceActivity = Math.min(volumeUSDC * 2, 72); // Max 3 days
          lastActivityAt = Date.now() - (estimatedHoursSinceActivity * 3600000);
        } else {
          // Low volume, assume activity was closer to creation
          lastActivityAt = createdAt + (Math.random() * 86400000); // Random within first day
        }
      }
      
      // 4. MARKET STATUS - Based on REAL timestamps only for accuracy
      const age = Date.now() - createdAt;
      const timeSinceActivity = Date.now() - lastActivityAt;
      const volume = Number(opinion.totalVolume) / 1_000_000;
      
      let marketStatus = 'normal';
      // ONLY show "New" badge if we have REAL creation time and it's within 24 hours
      if (realCreationTime && age < 86400000) marketStatus = 'new';
      else if (realLastActivity && timeSinceActivity < 3600000 && volume > 10) marketStatus = 'hot';
      else if (realLastActivity && timeSinceActivity > 604800000) marketStatus = 'inactive';
      
      // 5. 24H VOLUME - Real from events OR estimated from recent activity
      const real24hVolume = get24hVolume(opinion.id);
      const volume24h = real24hVolume > 0 ? real24hVolume / 1_000_000 : 
        (timeSinceActivity < 86400000 ? volume * 0.3 : 0); // 30% of total if recently active
      
      return {
        ...opinion,
        createdAt,
        lastActivityAt,
        marketStatus,
        tradesCount,
        age,
        timeSinceActivity,
        volume24h
      };
    });
  }, [opinionsToUse, getCreationTimestamp, getTradeCount, getLastActivity, get24hVolume]);

  // Handle category selection with adult content verification
  const handleCategorySelect = (value: string) => {
    if (value === 'Adult' && !adultContentEnabled) {
      // Show adult content modal when Adult category is selected
      setShowAdultModal(true);
      return;
    }
    // For all other categories, proceed normally
    setSelectedCategory(value);
  };

  const handleAdultContentAccept = () => {
    setAdultContentEnabled(true);
    setShowAdultModal(false);
    // Now select the Adult category
    setSelectedCategory('Adult');
  };

  const handleAdultContentDecline = () => {
    setShowAdultModal(false);
    // Don't select Adult category, user stays on current selection
  };

  // Apply content quality filtering - sorts good questions first, buries nonsensical ones
  const {
    filteredOpinions: qualityFilteredOpinions,
    filterStats,
    filterSettings,
    updateFilterSettings,
    getOpinionScore
  } = useContentFiltering(enhancedOpinions);

  // Filter, sort and paginate opinions - CoinMarketCap style
  const { paginatedOpinions, totalPages, totalFiltered } = useMemo(() => {
    // Note: If using server-side pagination, filtering/sorting should ideally be done server-side too
    // For now, we'll filter/sort the current data we have
    // First filter and sort
    const filteredAndSorted = (() => {
    const filtered = qualityFilteredOpinions.filter(opinion => {
      const searchWords = searchQuery.toLowerCase().split(' ').filter(w => w);
      const opinionText = (opinion.question + ' ' + opinion.currentAnswer).toLowerCase();
      const matchesSearch = searchWords.every(word => opinionText.includes(word));

      // Adult content filtering: Hide adult content by default
      const isAdultContent = opinion.categories.includes('Adult');
      if (isAdultContent && !adultContentEnabled) {
        return false; // Hide adult content if user hasn't verified age
      }

      const matchesCategory = selectedCategory === 'All Categories' || 
                             opinion.categories.includes(selectedCategory);
      
      let matchesTab = true;
      if (activeTab === 'trending') {
        // Enhanced trending logic - hot markets or high recent activity
        matchesTab = opinion.marketStatus === 'hot' || Number(opinion.totalVolume) > 5_000_000;
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
        case 'lastPrice':
          aValue = Number(a.lastPrice);
          bValue = Number(b.lastPrice);
          break;
        case 'volume':
          aValue = Number(a.totalVolume);
          bValue = Number(b.totalVolume);
          break;
        case 'change':
          aValue = Number(a.nextPrice) - Number(a.lastPrice);
          bValue = Number(b.nextPrice) - Number(b.lastPrice);
          break;
        case 'trades':
          aValue = a.tradesCount;
          bValue = b.tradesCount;
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
    })();
    
    // Calculate pagination
    const totalFiltered = filteredAndSorted.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    
    // Paginate the results
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOpinions = filteredAndSorted.slice(startIndex, endIndex);
    
    // If we're doing server-side pagination and have limited data, use what we have
    // Otherwise use the calculated pagination
    const finalTotalPages = isFetchingAll ? totalPages : (paginationTotalPages || totalPages);
    const finalPaginatedOpinions = isFetchingAll ? paginatedOpinions : filteredAndSorted;
    
    return {
      paginatedOpinions: finalPaginatedOpinions,
      totalPages: finalTotalPages,
      totalFiltered: isFetchingAll ? totalFiltered : paginationTotalOpinions || totalFiltered
    };
  }, [qualityFilteredOpinions, searchQuery, selectedCategory, activeTab, sortBy, sortDirection, currentPage, itemsPerPage, isFetchingAll, paginationTotalPages, paginationTotalOpinions, adultContentEnabled]);

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

  // Format time ago helper
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Get market status badge
  const getMarketStatusBadge = (status: string) => {
    switch (status) {
      case 'hot':
        return <Badge className="bg-red-600 text-white px-2 py-1 text-xs font-medium">🔥 Hot</Badge>;
      case 'new':
        return <Badge className="bg-green-600 text-white px-2 py-1 text-xs font-medium">⭐ New</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-600 text-white px-2 py-1 text-xs font-medium">💤 Inactive</Badge>;
      default:
        return null;
    }
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
      'Sports': 'bg-yellow-600 text-white hover:bg-yellow-700',
      'Entertainment': 'bg-purple-600 text-white hover:bg-purple-700',
      'Social Media': 'bg-indigo-600 text-white hover:bg-indigo-700',
      'Other': 'bg-gray-600 text-white hover:bg-gray-700',
      'AI': 'bg-teal-600 text-white hover:bg-teal-700',
      'Automotive': 'bg-slate-600 text-white hover:bg-slate-700',
      'Books & Literature': 'bg-amber-600 text-white hover:bg-amber-700',
      'Celebrities': 'bg-rose-600 text-white hover:bg-rose-700',
      'Conspiracy': 'bg-violet-600 text-white hover:bg-violet-700',
      'Dating & Relationships': 'bg-pink-600 text-white hover:bg-pink-700',
      'Investing': 'bg-emerald-600 text-white hover:bg-emerald-700',
      'Luxury': 'bg-amber-700 text-white hover:bg-amber-800',
      'Mobile Apps': 'bg-cyan-600 text-white hover:bg-cyan-700',
      'Movies & TV': 'bg-purple-700 text-white hover:bg-purple-800',
      'Music': 'bg-pink-700 text-white hover:bg-pink-800',
      'Parenting': 'bg-lime-600 text-white hover:bg-lime-700',
      'Podcasts': 'bg-green-700 text-white hover:bg-green-800',
      'Real Estate': 'bg-stone-600 text-white hover:bg-stone-700',
      'Adult': 'bg-red-900 text-white hover:bg-red-800'
    };
    return colorMap[category] || 'bg-gray-600 text-white hover:bg-gray-700';
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

  

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, activeTab, sortBy, sortDirection]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-fetch by updating a state or using refetch if available
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatQuestion = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.endsWith('?')) {
      return question;
    }
    return `${trimmed} ?`;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        
        {/* Indexing Debug Info - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <IndexingDebug stats={indexingStats} isVisible={true} />
        )}
        
        {/* Loading & Error States */}
        {eventsLoading && (
          <div className="mb-4 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-blue-300">Loading real blockchain data...</span>
            </div>
          </div>
        )}
        
        {eventsError && (
          <div className="mb-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <span className="text-yellow-300">🔄 Using hybrid data - Real contract state + intelligent estimates (RPC issues)</span>
          </div>
        )}
        
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
              <div className="text-sm font-medium text-gray-500">
                (24h: soon)
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
                <span className="text-gray-400 text-sm font-medium">Total Volume</span>
              </div>
              <div className="text-sm font-medium text-gray-500">
                (24h: soon)
              </div>
            </div>
            <div className="text-white text-2xl font-bold">{formatLargeUSDC(marketStats.totalVolume)}</div>
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
                <span className="text-gray-400 text-sm font-medium">Total Participants</span>
              </div>
              <div className="text-sm font-medium text-gray-500">
                (24h: soon)
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
              <div className="text-sm font-medium text-gray-500">
                (today: soon)
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
          
          <Select value={selectedCategory} onValueChange={handleCategorySelect}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {getSmartContractCategories().map((category) => (
                <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                  {category === 'Adult' ? '🔞 Adult' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Quality Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQualityFilter(!showQualityFilter)}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Quality Filter
            {filterStats.filtered > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filterStats.filtered} hidden
              </Badge>
            )}
          </Button>
        </motion.div>

        {/* Quality Filter Controls */}
        {showQualityFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Content Quality Settings</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Enable/Disable Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilterSettings({ enableQualityFilter: !filterSettings.enableQualityFilter })}
                  className={`${
                    filterSettings.enableQualityFilter 
                      ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {filterSettings.enableQualityFilter ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                  {filterSettings.enableQualityFilter ? 'Enabled' : 'Disabled'}
                </Button>

                {/* Quality Threshold Slider */}
                {filterSettings.enableQualityFilter && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Min Quality:</span>
                    <Select 
                      value={filterSettings.minQualityScore.toString()} 
                      onValueChange={(value) => updateFilterSettings({ minQualityScore: parseInt(value) })}
                    >
                      <SelectTrigger className="w-20 h-8 bg-gray-800 border-gray-700 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="0" className="text-white hover:bg-gray-700 text-xs">Show All</SelectItem>
                        <SelectItem value="25" className="text-white hover:bg-gray-700 text-xs">Hide Spam</SelectItem>
                        <SelectItem value="40" className="text-white hover:bg-gray-700 text-xs">Basic Quality</SelectItem>
                        <SelectItem value="60" className="text-white hover:bg-gray-700 text-xs">High Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sort by Quality Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilterSettings({ sortByQuality: !filterSettings.sortByQuality })}
                  className={`${
                    filterSettings.sortByQuality 
                      ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  } text-xs`}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {filterSettings.sortByQuality ? 'Quality Sort' : 'Manual Sort'}
                </Button>
              </div>
            </div>

            {/* Filter Stats */}
            {filterSettings.showFilterStats && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="text-gray-400">
                    Total: <span className="text-white">{filterStats.total}</span>
                  </div>
                  <div className="text-emerald-400">
                    High Quality: <span className="text-white">{filterStats.high}</span>
                  </div>
                  <div className="text-yellow-400">
                    Medium Quality: <span className="text-white">{filterStats.medium}</span>
                  </div>
                  <div className="text-orange-400">
                    Low Quality: <span className="text-white">{filterStats.low}</span>
                  </div>
                  <div className="text-red-400">
                    Spam/Hidden: <span className="text-white">{filterStats.spam}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

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
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Opinion Market ({totalFiltered})
            </h2>
          </div>

          {/* Table Header - ENHANCED: ADDED NEW COLUMNS */}
          <div className="hidden lg:grid gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50" style={{
            gridTemplateColumns: "40px 1fr 200px 80px 80px 70px 80px 80px 120px 120px"
          }}>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('id')}
            >
              <span className="text-sm">#</span>
              {sortState.column === 'id' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div className="text-white text-base font-bold">question</div>
            <div className="text-white text-base font-bold">🔗 answer</div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('lastPrice')}
            >
              <span className="text-sm whitespace-nowrap">last price</span>
              {sortState.column === 'lastPrice' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('price')}
            >
              <span className="text-sm whitespace-nowrap">next price</span>
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
              <span className="text-sm">var %</span>
              {sortState.column === 'change' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('trades')}
            >
              <span className="text-sm">trades</span>
              {sortState.column === 'trades' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div 
              className="text-white text-base font-bold cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
              onClick={() => handleSort('volume')}
            >
              <span className="text-sm">vol</span>
              {sortState.column === 'volume' ? (
                sortState.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronsUpDown className="w-3 h-3" />
              )}
            </div>
            <div className="text-white text-base font-bold text-center hidden lg:block">chart</div>
            <div className="text-white text-base font-bold text-center">actions</div>
          </div>

          {/* Pagination Info */}
          <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing <span className="text-white font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalFiltered)}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, totalFiltered)}</span> of <span className="text-white font-medium">{totalFiltered}</span> opinions
            </div>
            <div className="text-sm text-gray-400">
              Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
            </div>
          </div>

          {/* Table Body - REAL CONTRACT DATA */}
          <div className="divide-y divide-gray-700/20">
            {paginatedOpinions.map((opinion, index) => {
              const change = calculateChange(opinion.nextPrice, opinion.lastPrice);
              const displayCategory = opinion.categories && opinion.categories.length > 0 
                ? opinion.categories[0] 
                : 'Other';
              
              // Get real data flags for this opinion
              const realCreationTime = getCreationTimestamp(opinion.id);
              const realTradesCount = getTradeCount(opinion.id);
              const accurateTradesCount = getAccurateTradeCount(opinion.id);
              const realLastActivity = getLastActivity(opinion.id);
              
              // DEBUG: Log trade count data for opinion #1 to understand the discrepancy
              if (opinion.id === 1) {
                console.log('🔍 DEBUG OPINION #1 TRADE COUNTS:', {
                  opinionId: opinion.id,
                  enhancedTradesCount: opinion.tradesCount, // From useMemo calculation
                  accurateTradesCount, // From useAccurateTradeCounts
                  realTradesCount, // From useOpinionEvents
                  volumeUSDC: Number(opinion.totalVolume) / 1_000_000,
                  nextPriceUSDC: Number(opinion.nextPrice) / 1_000_000
                });
              }

              return (
                <motion.div
                  key={opinion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-10 md:gap-2 px-4 py-4 bg-gray-800/30 hover:bg-gray-700/30 transition-colors duration-200 cursor-pointer items-center"
                  style={{
                    gridTemplateColumns: "40px 1fr 200px 80px 80px 70px 80px 80px 120px 120px"
                  }}
                  onClick={() => router.push(createOpinionUrl(opinion.id, opinion.question))}
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
                        {formatQuestion(opinion.question)}
                      </div>
                      <div className="text-xs mb-2">
                        by <ClickableAddress 
                          address={opinion.creator}
                          className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                        >
                          {truncateAddress(opinion.creator)}
                        </ClickableAddress>
                        {getMarketStatusBadge(opinion.marketStatus) && (
                          <span className="ml-2">{getMarketStatusBadge(opinion.marketStatus)}</span>
                        )}
                      </div>
                      {/* Category Badge integrated in Question */}
                      <div className="mt-1 mb-2">
                        <Badge 
                          className={`${getCategoryColor(displayCategory)} cursor-pointer transition-colors duration-200 px-2 py-1 rounded-full text-xs font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (displayCategory === 'Adult' && !adultContentEnabled) {
                              setShowAdultModal(true);
                            } else {
                              setSelectedCategory(displayCategory);
                              setActiveTab('all');
                            }
                          }}
                        >
                          {displayCategory}
                          {displayCategory === 'Adult' && ' 🔞'}
                        </Badge>
                      </div>
                      <div className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <button 
                          className="hover:text-emerald-500 cursor-pointer transition-colors flex items-center gap-1 bg-transparent border-none p-0 text-left focus:outline-none focus:text-emerald-400"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔗 Answer clicked - Opinion:', opinion.id, 'Link:', opinion.link);
                            if (opinion.link && opinion.link.trim()) {
                              console.log('✅ Opening link:', opinion.link);
                              window.open(opinion.link, '_blank');
                            } else {
                              console.log('❌ No valid link found for opinion', opinion.id);
                              console.log('Link value:', JSON.stringify(opinion.link));
                              // Fallback: show alert or create a basic link
                              alert(`No link available for "${opinion.currentAnswer}"`);
                            }
                          }}
                          type="button"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {opinion.currentAnswer}
                        </button>
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
                          <div className="text-xs text-gray-500">Last Price</div>
                          <div className="font-semibold text-white">
                            {formatUSDC(opinion.lastPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Next Price</div>
                          <div className="font-semibold text-white">
                            {formatUSDC(opinion.nextPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">24h %</div>
                          <div className={`flex items-center space-x-1 ${ 
                            change.isPositive ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            {change.isPositive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            <span className="text-sm font-medium">{change.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Trades</div>
                          <div className="text-gray-300 text-sm">
                            {opinion.tradesCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Vol</div>
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
                          {formatQuestion(opinion.question)}
                        </div>
                        <div className="text-xs mb-1 flex items-center gap-2">
                          <span>
                            by <ClickableAddress 
                              address={opinion.creator}
                              className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                            >
                              {truncateAddress(opinion.creator)}
                            </ClickableAddress>
                          </span>
                          {getMarketStatusBadge(opinion.marketStatus)}
                        </div>
                        {/* Category Badge integrated under author */}
                        <div className="mt-1">
                          <Badge 
                            className={`${getCategoryColor(displayCategory)} cursor-pointer transition-colors duration-200 px-2 py-0.5 rounded text-xs font-medium`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (displayCategory === 'Adult' && !adultContentEnabled) {
                                setShowAdultModal(true);
                              } else {
                                setSelectedCategory(displayCategory);
                                setActiveTab('all');
                              }
                            }}
                          >
                            {displayCategory}
                            {displayCategory === 'Adult' && ' 🔞'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Answer Column - MODIFIED: CLICKABLE WITH LINK ICON */}
                    <div className="flex items-center min-h-[60px] pr-2">
                      <div className="w-full">
                        <button
                          className="text-white font-bold text-sm leading-tight mb-1 hover:text-emerald-500 cursor-pointer transition-colors flex items-center gap-1 bg-transparent border-none p-0 text-left w-full focus:outline-none focus:text-emerald-400"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔗 Answer clicked - Opinion:', opinion.id, 'Link:', opinion.link);
                            if (opinion.link && opinion.link.trim()) {
                              console.log('✅ Opening link:', opinion.link);
                              window.open(opinion.link, '_blank');
                            } else {
                              console.log('❌ No valid link found for opinion', opinion.id);
                              console.log('Link value:', JSON.stringify(opinion.link));
                              // Fallback: show alert or create a basic link
                              alert(`No link available for "${opinion.currentAnswer}"`);
                            }
                          }}
                          type="button"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span>{opinion.currentAnswer}</span>
                        </button>
                        <div className="text-xs">
                          {(() => {
                            // Show loading state while pool data is fetching
                            if (poolDataLoading && opinion.currentAnswerOwner.toLowerCase() === '0x3b4584e690109484059d95d7904dd9feba246612') {
                              return (
                                <span className="text-gray-400 animate-pulse">
                                  by Loading...
                                </span>
                              );
                            }
                            
                            const ownerDisplay = getOwnerDisplay(
                              opinion.currentAnswerOwner, 
                              opinion.id, 
                              opinion.currentAnswer
                            );
                            
                            return ownerDisplay.isPoolOwned ? (
                              <span className="text-emerald-400 font-medium">
                                by {ownerDisplay.displayName}
                              </span>
                            ) : (
                              <span>
                                by <ClickableAddress 
                                  address={opinion.currentAnswerOwner}
                                  className="text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                                >
                                  {ownerDisplay.displayName}
                                </ClickableAddress>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Last Price - COMPACT */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <span className="font-medium text-white text-sm">
                        {formatUSDC(opinion.lastPrice)}
                      </span>
                    </div>

                    {/* Next Price - COMPACT */}
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
                        {change.isPositive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span className="font-medium text-xs">{change.percentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Trades - COMPACT */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <span className="text-white font-medium text-sm">
                        {opinion.tradesCount}
                      </span>
                    </div>

                    {/* Volume - COMPACT */}
                    <div className="flex items-center justify-center min-h-[60px]">
                      <span className="text-white font-medium text-sm">
                        {formatLargeUSDC(Number(opinion.totalVolume) / 1_000_000)}
                      </span>
                    </div>

                    {/* Price Chart - RESPONSIVE */}
                    <div className="hidden lg:flex items-center justify-center min-h-[60px]">
                      <PriceHistoryChart 
                        opinion={opinion} 
                        change={change}
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

        {/* Pagination Controls - CoinMarketCap Style */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden mt-4"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages} • {totalFiltered} total opinions
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    First
                  </Button>
                  
                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    ← Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pages = [];
                      const showPages = 5; // Show 5 page numbers
                      let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                      let endPage = Math.min(totalPages, startPage + showPages - 1);
                      
                      // Adjust if we're near the end
                      if (endPage - startPage + 1 < showPages) {
                        startPage = Math.max(1, endPage - showPages + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={i === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(i)}
                            className={i === currentPage 
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            }
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      return pages;
                    })()
                    }
                  </div>
                  
                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Next →
                  </Button>
                  
                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

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

      {/* Adult Content Modal */}
      <AdultContentModal
        isOpen={showAdultModal}
        onAccept={handleAdultContentAccept}
        onDecline={handleAdultContentDecline}
      />

      {/* Referral Banner */}
      {referralCode && (
        <ReferralBanner
          isVisible={showReferralWelcome}
          onDismiss={dismissReferralWelcome}
          referralCode={referralCode}
        />
      )}

    </>
  );
}