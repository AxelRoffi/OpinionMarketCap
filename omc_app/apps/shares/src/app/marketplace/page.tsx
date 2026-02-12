'use client';

import { useState, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useChainId } from 'wagmi';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  DollarSign,
  TrendingUp,
  Hash,
  Tag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { ANSWER_SHARES_CORE_ABI, getContracts, Question } from '@/lib/contracts';
import { BuyQuestionModal } from '@/components/marketplace/BuyQuestionModal';
import { formatUSDC, shortenAddress } from '@/lib/utils';

interface MarketplaceQuestion {
  id: bigint;
  text: string;
  category: string;
  creator: `0x${string}`;
  owner: `0x${string}`;
  salePrice: bigint;
  totalVolume: bigint;
  answerCount: bigint;
}

type SortField = 'salePrice' | 'totalVolume' | 'answerCount';
type SortDirection = 'asc' | 'desc';

export default function MarketplacePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('salePrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedQuestion, setSelectedQuestion] = useState<MarketplaceQuestion | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Fetch next question ID to know how many to fetch
  const { data: nextQuestionId } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'nextQuestionId',
  });

  // For now, fetch first 50 questions (in production, use pagination)
  const maxQuestions = nextQuestionId ? Math.min(Number(nextQuestionId) - 1, 50) : 0;

  // Fetch all questions
  const questionQueries = useMemo(() => {
    const queries = [];
    for (let i = 1; i <= maxQuestions; i++) {
      queries.push(i);
    }
    return queries;
  }, [maxQuestions]);

  // Individual question fetches (simplified - in production use multicall)
  const { data: questionsData, isLoading, refetch } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'getQuestion',
    args: [1n],
    query: {
      enabled: maxQuestions > 0,
    },
  });

  // For demo, create mock data based on actual contract state
  const marketplaceQuestions = useMemo(() => {
    if (!nextQuestionId || Number(nextQuestionId) <= 1) return [];

    // In production, this would come from actual contract reads
    // For now, show empty state until questions exist
    return [] as MarketplaceQuestion[];
  }, [nextQuestionId]);

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = marketplaceQuestions.filter((question) => {
      // Only show questions that are for sale
      if (question.salePrice === 0n) return false;

      // Search filter
      const matchesSearch =
        question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        case 'salePrice':
          aValue = Number(a.salePrice);
          bValue = Number(b.salePrice);
          break;
        case 'totalVolume':
          aValue = Number(a.totalVolume);
          bValue = Number(b.totalVolume);
          break;
        case 'answerCount':
          aValue = Number(a.answerCount);
          bValue = Number(b.answerCount);
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [marketplaceQuestions, searchQuery, priceRange, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-emerald-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-emerald-500" />
    );
  };

  const handleBuyQuestion = (question: MarketplaceQuestion) => {
    setSelectedQuestion(question);
    setShowBuyModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-muted" />
            <Skeleton className="h-4 w-96 bg-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Question Marketplace</h1>
            <p className="text-muted-foreground mt-2">
              Buy and sell question ownership. Owners earn creator fees from all trading activity.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Listed Questions</p>
                    <p className="text-xl font-bold text-foreground">
                      {filteredAndSortedQuestions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Price</p>
                    <p className="text-xl font-bold text-foreground">
                      {filteredAndSortedQuestions.length > 0
                        ? formatUSDC(
                            BigInt(
                              Math.floor(
                                filteredAndSortedQuestions.reduce(
                                  (sum, q) => sum + Number(q.salePrice),
                                  0
                                ) / filteredAndSortedQuestions.length
                              )
                            )
                          )
                        : '$0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatUSDC(
                        BigInt(
                          filteredAndSortedQuestions.reduce(
                            (sum, q) => sum + Number(q.totalVolume),
                            0
                          )
                        )
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="text-xl font-bold text-foreground">10%</p>
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
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by question text or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground pl-10"
                    />
                  </div>
                </div>

                {/* Price Range Filters */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Min $"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground w-24"
                  />
                  <Input
                    placeholder="Max $"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground w-24"
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
          <Card className="bg-card/50 border-border">
            <CardContent className="p-0">
              {filteredAndSortedQuestions.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Listed</h3>
                  <p className="text-muted-foreground">
                    {marketplaceQuestions.length === 0
                      ? 'No questions have been listed for sale yet. Question owners can list their questions from the question detail page.'
                      : 'No questions match your search criteria.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 text-muted-foreground font-medium">Question</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Owner</th>
                        <th
                          className="text-left p-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('totalVolume')}
                        >
                          <div className="flex items-center gap-2">
                            Volume
                            {getSortIcon('totalVolume')}
                          </div>
                        </th>
                        <th
                          className="text-left p-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('answerCount')}
                        >
                          <div className="flex items-center gap-2">
                            Answers
                            {getSortIcon('answerCount')}
                          </div>
                        </th>
                        <th
                          className="text-left p-4 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('salePrice')}
                        >
                          <div className="flex items-center gap-2">
                            Buy Price
                            {getSortIcon('salePrice')}
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAndSortedQuestions.map((question, index) => (
                        <motion.tr
                          key={question.id.toString()}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-border/40 hover:bg-muted/20 transition-colors"
                        >
                          {/* Question Info */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  #{question.id.toString()}
                                </Badge>
                                <Badge className="text-xs bg-muted text-muted-foreground">
                                  {question.category}
                                </Badge>
                              </div>
                              <p className="text-foreground font-medium">
                                {question.text.length > 60
                                  ? `${question.text.substring(0, 60)}...`
                                  : question.text}
                              </p>
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="p-4">
                            <span className="text-muted-foreground font-mono text-sm">
                              {shortenAddress(question.owner)}
                            </span>
                          </td>

                          {/* Volume */}
                          <td className="p-4">
                            <span className="text-foreground">{formatUSDC(question.totalVolume)}</span>
                          </td>

                          {/* Answers */}
                          <td className="p-4">
                            <span className="text-foreground">{question.answerCount.toString()}</span>
                          </td>

                          {/* Buy Action */}
                          <td className="p-4">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                              onClick={() => handleBuyQuestion(question)}
                              disabled={address?.toLowerCase() === question.owner.toLowerCase()}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {formatUSDC(question.salePrice)}
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
          questionId={selectedQuestion.id}
          questionText={selectedQuestion.text}
          salePrice={selectedQuestion.salePrice}
          seller={selectedQuestion.owner}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedQuestion(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
