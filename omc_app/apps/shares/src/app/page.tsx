'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Flame,
  Sparkles,
  Plus,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateQuestionModal } from '@/components/questions';
import { useQuestions } from '@/hooks';
import { formatUSDC, shortenAddress } from '@/lib/utils';

type SortOption = 'id' | 'price' | 'volume' | 'change' | 'answers';
type TabOption = 'all' | 'hot' | 'new';

// Skeleton component for loading state
function QuestionCardSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border border-border/30">
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-16 ml-auto" />
        <Skeleton className="h-7 w-16" />
      </div>
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const { questions, totalQuestions, isLoading, refetch } = useQuestions({ limit: 500 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate market stats
  const marketStats = useMemo(() => {
    const totalVolume = questions.reduce((sum, q) => sum + q.totalVolume, 0n);
    const totalAnswers = questions.reduce((sum, q) => sum + q.answerCount, 0n);
    return {
      totalVolume,
      totalQuestions: questions.length,
      totalAnswers: Number(totalAnswers),
    };
  }, [questions]);

  // Filter and sort questions
  const { paginatedQuestions, totalPages, totalFiltered } = useMemo(() => {
    // Filter
    let filtered = questions.filter((q) => {
      const searchWords = searchQuery.toLowerCase().split(' ').filter(w => w);
      const questionText = (q.text + ' ' + q.description).toLowerCase();
      const matchesSearch = searchWords.every(word => questionText.includes(word));

      let matchesTab = true;
      if (activeTab === 'hot') {
        matchesTab = Number(q.totalVolume) > 5_000_000; // > $5 volume
      } else if (activeTab === 'new') {
        // Newest 10 questions
        matchesTab = true;
      }

      return matchesSearch && matchesTab;
    });

    // Sort
    if (activeTab === 'new') {
      filtered.sort((a, b) => Number(b.id - a.id));
    } else {
      filtered.sort((a, b) => {
        let aValue: number, bValue: number;
        switch (sortBy) {
          case 'price':
            aValue = Number(a.leadingMarketCap || 0n);
            bValue = Number(b.leadingMarketCap || 0n);
            break;
          case 'volume':
            aValue = Number(a.totalVolume);
            bValue = Number(b.totalVolume);
            break;
          case 'answers':
            aValue = Number(a.answerCount);
            bValue = Number(b.answerCount);
            break;
          case 'change':
            aValue = Number(a.totalVolume);
            bValue = Number(b.totalVolume);
            break;
          case 'id':
          default:
            aValue = Number(a.id);
            bValue = Number(b.id);
        }
        return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }

    // Paginate
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuestions = filtered.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedQuestions, totalPages, totalFiltered };
  }, [questions, searchQuery, activeTab, sortBy, sortDirection, currentPage]);

  const handleSort = (column: SortOption) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const formatLargeUSDC = (amount: bigint) => {
    const usdc = Number(amount) / 1_000_000;
    if (usdc >= 1_000_000) return `$${(usdc / 1_000_000).toFixed(1)}M`;
    if (usdc >= 1_000) return `$${(usdc / 1_000).toFixed(1)}K`;
    return `$${usdc.toFixed(0)}`;
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-3">
      {/* Row 1: Search + Create */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold h-8 px-3 text-xs rounded-lg flex-shrink-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Create
        </Button>
      </div>

      {/* Row 2: Tabs */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            activeTab === 'all'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          All Questions
        </button>
        <button
          onClick={() => setActiveTab('hot')}
          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            activeTab === 'hot'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Flame className="w-3 h-3 inline mr-0.5" />
          Hot
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            activeTab === 'new'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Sparkles className="w-3 h-3 inline mr-0.5" />
          New
        </button>
      </div>

      {/* Row 3: Sort + Stats */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] text-muted-foreground flex-shrink-0">Sort:</span>
          {[
            { key: 'id' as const, label: 'ID' },
            { key: 'price' as const, label: 'Price' },
            { key: 'volume' as const, label: 'Vol' },
            { key: 'answers' as const, label: 'Answers' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                sortBy === opt.key
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
              {sortBy === opt.key && (
                sortDirection === 'desc' ? <ChevronDown className="w-2.5 h-2.5 inline ml-0.5" /> : <ChevronUp className="w-2.5 h-2.5 inline ml-0.5" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-shrink-0">
          <span><span className="text-foreground font-medium">{formatLargeUSDC(marketStats.totalVolume)}</span> Vol</span>
          <span><span className="text-foreground font-medium">{marketStats.totalAnswers}</span> Answers</span>
          <span><span className="text-foreground font-medium">{totalFiltered}</span> Questions</span>
        </div>
      </div>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <QuestionCardSkeleton key={i} />
          ))}
        </div>
      ) : paginatedQuestions.length === 0 ? (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-medium">No questions yet</h3>
          <p className="mb-4 text-muted-foreground">
            Be the first to create a question and start trading opinions.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Question
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {paginatedQuestions.map((question, index) => {
            const volumeUSDC = Number(question.totalVolume) / 1_000_000;
            const isHot = volumeUSDC > 5;

            return (
              <motion.div
                key={question.id.toString()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border border-border/30 hover:border-emerald-500/30 hover:bg-muted/20 transition-all duration-150 cursor-pointer group"
                onClick={() => router.push(`/questions/${question.id}`)}
              >
                {/* Row 1: Rank + Question */}
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono text-[10px] mt-0.5 flex-shrink-0">#{question.id.toString()}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-medium text-sm leading-snug line-clamp-2">
                      {question.text}
                    </h3>
                  </div>
                </div>

                {/* Row 2: Badges */}
                <div className="flex items-center gap-1 flex-wrap">
                  {isHot && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0 rounded text-[9px] font-medium leading-tight">
                      Trending
                    </Badge>
                  )}
                  <Badge className="bg-emerald-600 text-white px-1.5 py-0 rounded text-[9px] font-medium leading-tight">
                    {Number(question.answerCount)} answers
                  </Badge>
                </div>

                {/* Row 3: Leading Answer + Price + Trade */}
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-semibold text-sm leading-tight truncate min-w-0 flex-1">
                    {Number(question.answerCount) > 0 ? `${Number(question.answerCount)} answers` : 'No answers yet'}
                  </span>
                  <div className="text-right flex-shrink-0">
                    <div className="text-foreground font-bold text-sm">
                      {formatUSDC(question.leadingMarketCap || 0n)}
                    </div>
                    <div className="text-emerald-400 text-[10px] font-semibold">
                      {formatUSDC(question.totalVolume)} vol
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs px-3 py-1 h-7 rounded-lg hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-200 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/questions/${question.id}`);
                    }}
                  >
                    <Zap className="w-3 h-3 mr-0.5" />
                    Trade
                  </Button>
                </div>

                {/* Row 4: Metadata */}
                <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
                  <span>by {shortenAddress(question.creator)}</span>
                  <span className="ml-auto">Vol {formatUSDC(question.totalVolume)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="border border-border/50 rounded-xl overflow-hidden mt-4"
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="bg-muted border-border text-foreground hover:bg-accent"
                >
                  First
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-muted border-border text-foreground hover:bg-accent"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const showPages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                    let endPage = Math.min(totalPages, startPage + showPages - 1);

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
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                            : "bg-muted border-border text-foreground hover:bg-accent"
                          }
                        >
                          {i}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-muted border-border text-foreground hover:bg-accent"
                >
                  Next
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="bg-muted border-border text-foreground hover:bg-accent"
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Question Modal */}
      <CreateQuestionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          refetch();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
