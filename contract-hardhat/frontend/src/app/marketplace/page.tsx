'use client';

import React, { useState, useMemo } from 'react';
import { useAccount, useContractReads, useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  DollarSign,
  TrendingUp,
  Users,
  Hash
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import BuyQuestionModal from '@/components/modals/BuyQuestionModal';

interface MarketplaceQuestion {
  id: number;
  question: string;
  questionOwner: string;
  salePrice: bigint;
  nextPrice: bigint;
  totalVolume: bigint;
  currentAnswer: string;
  categories: string[];
  isActive: boolean;
  // Calculated fields
  tradesCount: number;
  totalRoyalties: bigint;
}

type SortField = 'nextPrice' | 'tradesCount' | 'totalVolume' | 'totalRoyalties' | 'salePrice';
type SortDirection = 'asc' | 'desc';

export default function MarketplacePage() {
  const { address } = useAccount();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('salePrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedQuestion, setSelectedQuestion] = useState<MarketplaceQuestion | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Fetch all opinions to filter for those with salePrice > 0
  const { data: nextOpinionId } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  // Generate array of opinion IDs to fetch
  const opinionIds = useMemo(() => {
    if (!nextOpinionId) return [];
    const ids = [];
    const maxId = Number(nextOpinionId);
    for (let i = 1; i < maxId; i++) {
      ids.push(i);
    }
    return ids;
  }, [nextOpinionId]);

  // Batch fetch opinion details
  const { data: opinionsData, isLoading: isLoadingOpinions, refetch: refetchOpinions } = useContractReads({
    contracts: opinionIds.map((id) => ({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'getOpinionDetails',
      args: [BigInt(id)],
    })),
  });

  // Process and filter marketplace questions
  const marketplaceQuestions = useMemo(() => {
    if (!opinionsData) return [];
    
    const questions: MarketplaceQuestion[] = [];
    
    opinionsData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const opinion = result.result as {
          salePrice: bigint;
          question: string;
          questionOwner: string;
          nextPrice: bigint;
          totalVolume: bigint;
          currentAnswer: string;
          categories: string[];
          isActive: boolean;
        };
        
        // Only include questions that are for sale (salePrice > 0)
        if (opinion.salePrice > 0n) {
          // Calculate trades count (simplified - using volume/nextPrice as approximation)
          const tradesCount = opinion.totalVolume > 0n ? 
            Math.floor(Number(opinion.totalVolume) / Math.max(Number(opinion.nextPrice), 1)) : 0;
          
          // Calculate total royalties (3% of total volume)
          const totalRoyalties = BigInt(Math.floor(Number(opinion.totalVolume) * 0.03));

          questions.push({
            id: opinionIds[index],
            question: opinion.question,
            questionOwner: opinion.questionOwner,
            salePrice: opinion.salePrice,
            nextPrice: opinion.nextPrice,
            totalVolume: opinion.totalVolume,
            currentAnswer: opinion.currentAnswer,
            categories: opinion.categories || [],
            isActive: opinion.isActive,
            tradesCount,
            totalRoyalties,
          });
        }
      }
    });

    return questions;
  }, [opinionsData, opinionIds]);

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = marketplaceQuestions.filter((question) => {
      // Search filter
      const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           question.id.toString().includes(searchQuery);
      
      // Price range filter
      const priceInUSDC = Number(question.salePrice) / 1_000_000;
      const matchesMinPrice = !priceRange.min || priceInUSDC >= parseFloat(priceRange.min);
      const matchesMaxPrice = !priceRange.max || priceInUSDC <= parseFloat(priceRange.max);
      
      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortField) {
        case 'nextPrice':
          aValue = Number(a.nextPrice);
          bValue = Number(b.nextPrice);
          break;
        case 'salePrice':
          aValue = Number(a.salePrice);
          bValue = Number(b.salePrice);
          break;
        case 'tradesCount':
          aValue = a.tradesCount;
          bValue = b.tradesCount;
          break;
        case 'totalVolume':
          aValue = Number(a.totalVolume);
          bValue = Number(b.totalVolume);
          break;
        case 'totalRoyalties':
          aValue = Number(a.totalRoyalties);
          bValue = Number(b.totalRoyalties);
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [marketplaceQuestions, searchQuery, priceRange, sortField, sortDirection]);

  // Utility functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000;
    return `${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-emerald-400" /> : 
      <ArrowDown className="w-4 h-4 text-emerald-400" />;
  };

  const handleBuyQuestion = (question: MarketplaceQuestion) => {
    setSelectedQuestion(question);
    setShowBuyModal(true);
  };

  if (isLoadingOpinions) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-gray-800" />
            <Skeleton className="h-4 w-96 bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Questions for Sale</h1>
            <p className="text-gray-400 mt-2">Browse and purchase question ownership from other users</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Questions for Sale</p>
                    <p className="text-xl font-bold text-white">{marketplaceQuestions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Sale Price</p>
                    <p className="text-xl font-bold text-white">
                      {marketplaceQuestions.length > 0 
                        ? `$${(marketplaceQuestions.reduce((sum, q) => sum + Number(q.salePrice), 0) / marketplaceQuestions.length / 1_000_000).toFixed(2)}`
                        : '$0.00'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Volume</p>
                    <p className="text-xl font-bold text-white">
                      ${(marketplaceQuestions.reduce((sum, q) => sum + Number(q.totalVolume), 0) / 1_000_000).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Royalties</p>
                    <p className="text-xl font-bold text-white">
                      ${(marketplaceQuestions.reduce((sum, q) => sum + Number(q.totalRoyalties), 0) / 1_000_000).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by question text or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                    />
                  </div>
                </div>

                {/* Price Range Filters */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Min price"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 w-24"
                  />
                  <Input
                    placeholder="Max price"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-0">
              {filteredAndSortedQuestions.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Questions for Sale</h3>
                  <p className="text-gray-400">
                    {marketplaceQuestions.length === 0 
                      ? "There are currently no questions listed for sale."
                      : "No questions match your search criteria."
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-medium">Question Info</th>
                        
                        <th 
                          className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('nextPrice')}
                        >
                          <div className="flex items-center gap-2">
                            Next Price
                            {getSortIcon('nextPrice')}
                          </div>
                        </th>
                        
                        <th 
                          className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('tradesCount')}
                        >
                          <div className="flex items-center gap-2">
                            Trades
                            {getSortIcon('tradesCount')}
                          </div>
                        </th>
                        
                        <th 
                          className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('totalVolume')}
                        >
                          <div className="flex items-center gap-2">
                            Total Volume
                            {getSortIcon('totalVolume')}
                          </div>
                        </th>
                        
                        <th 
                          className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('totalRoyalties')}
                        >
                          <div className="flex items-center gap-2">
                            Total Royalties
                            {getSortIcon('totalRoyalties')}
                          </div>
                        </th>
                        
                        <th 
                          className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('salePrice')}
                        >
                          <div className="flex items-center gap-2">
                            Buy Action
                            {getSortIcon('salePrice')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {filteredAndSortedQuestions.map((question, index) => (
                        <motion.tr
                          key={question.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-gray-700/40 hover:bg-gray-700/20 transition-colors"
                        >
                          {/* Question Info */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">#{question.id}</Badge>
                                <span className="text-xs text-gray-400">{formatAddress(question.questionOwner)}</span>
                              </div>
                              <p className="text-white font-medium">{truncateText(question.question, 60)}</p>
                              <p className="text-sm text-gray-400">Current: {question.currentAnswer}</p>
                            </div>
                          </td>
                          
                          {/* Next Price */}
                          <td className="p-4">
                            <span className="text-emerald-400 font-medium">{formatUSDC(question.nextPrice)}</span>
                          </td>
                          
                          {/* Trades Count */}
                          <td className="p-4">
                            <span className="text-white">{question.tradesCount} trades</span>
                          </td>
                          
                          {/* Total Volume */}
                          <td className="p-4">
                            <span className="text-white">{formatUSDC(question.totalVolume)}</span>
                          </td>
                          
                          {/* Total Royalties */}
                          <td className="p-4">
                            <span className="text-yellow-400">{formatUSDC(question.totalRoyalties)}</span>
                          </td>
                          
                          {/* Buy Action */}
                          <td className="p-4">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                              onClick={() => handleBuyQuestion(question)}
                              disabled={address?.toLowerCase() === question.questionOwner.toLowerCase()}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Buy {formatUSDC(question.salePrice)}
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Buy Question Modal */}
      {showBuyModal && selectedQuestion && (
        <BuyQuestionModal
          isOpen={showBuyModal}
          opinionData={{
            id: selectedQuestion.id,
            question: selectedQuestion.question,
            salePrice: selectedQuestion.salePrice,
            questionOwner: selectedQuestion.questionOwner,
            currentAnswer: selectedQuestion.currentAnswer,
            totalVolume: selectedQuestion.totalVolume,
          }}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedQuestion(null);
          }}
          onSuccess={() => {
            // Refetch the opinions data to show updated marketplace
            refetchOpinions();
          }}
        />
      )}
    </div>
  );
}