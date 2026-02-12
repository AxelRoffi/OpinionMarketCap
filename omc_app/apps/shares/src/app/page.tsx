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
  TrendingUp,
  BarChart3,
  Users,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuestions } from '@/hooks';
import { formatUSDC, shortenAddress } from '@/lib/utils';
import { CATEGORIES } from '@/lib/contracts';

type SortOption = 'newest' | 'marketcap' | 'volume' | 'answers' | 'trending';
type TabOption = 'all' | 'hot' | 'new';

// Skeleton component for loading state
function QuestionCardSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border border-border/30 bg-card/50">
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

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  Crypto: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DeFi: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NFTs: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Gaming: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  AI: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Technology: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Politics: 'bg-red-500/20 text-red-400 border-red-500/30',
  Sports: 'bg-green-500/20 text-green-400 border-green-500/30',
  Entertainment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Business: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Science: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Culture: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  Memes: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { questions, totalQuestions, isLoading, refetch } = useQuestions({ limit: 500 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate market stats
  const marketStats = useMemo(() => {
    const totalVolume = questions.reduce((sum, q) => sum + BigInt(q.totalVolume || 0), 0n);
    const totalMarketCap = questions.reduce((sum, q) => sum + BigInt(q.leadingMarketCap || 0), 0n);
    const totalAnswers = questions.reduce((sum, q) => sum + BigInt(q.answerCount || 0), 0n);
    return {
      totalVolume,
      totalMarketCap,
      totalQuestions: questions.length,
      totalAnswers: Number(totalAnswers),
    };
  }, [questions]);

  // Get unique categories from questions
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    questions.forEach(q => {
      if (q.category) cats.add(q.category);
    });
    return Array.from(cats);
  }, [questions]);

  // Filter and sort questions
  const { paginatedQuestions, totalPages, totalFiltered } = useMemo(() => {
    // Filter
    let filtered = questions.filter((q) => {
      const searchWords = searchQuery.toLowerCase().split(' ').filter(w => w);
      const questionText = (q.text + ' ' + (q.category || '')).toLowerCase();
      const matchesSearch = searchWords.every(word => questionText.includes(word));

      let matchesTab = true;
      if (activeTab === 'hot') {
        matchesTab = Number(q.totalVolume) > 5_000_000; // > $5 volume
      } else if (activeTab === 'new') {
        matchesTab = true;
      }

      let matchesCategory = true;
      if (selectedCategory) {
        matchesCategory = q.category === selectedCategory;
      }

      return matchesSearch && matchesTab && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      switch (sortBy) {
        case 'marketcap':
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
        case 'trending':
          // Trending = volume * recency factor
          const now = Date.now() / 1000;
          const aAge = now - a.createdAt;
          const bAge = now - b.createdAt;
          aValue = Number(a.totalVolume) / Math.max(1, Math.sqrt(aAge / 3600));
          bValue = Number(b.totalVolume) / Math.max(1, Math.sqrt(bAge / 3600));
          break;
        case 'newest':
        default:
          aValue = Number(a.id);
          bValue = Number(b.id);
      }
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Paginate
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuestions = filtered.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedQuestions, totalPages, totalFiltered };
  }, [questions, searchQuery, activeTab, selectedCategory, sortBy, sortDirection, currentPage]);

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
    <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 pb-20 lg:pb-3">
      {/* Market Stats Bar - Mobile App Style */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-2 rounded-xl bg-card/50 border border-border/30">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Market Cap</div>
          <div className="text-sm font-bold text-emerald-400">{formatLargeUSDC(marketStats.totalMarketCap)}</div>
        </div>
        <div className="text-center border-x border-border/30">
          <div className="text-xs text-muted-foreground">24h Volume</div>
          <div className="text-sm font-bold text-foreground">{formatLargeUSDC(marketStats.totalVolume)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Questions</div>
          <div className="text-sm font-bold text-foreground">{totalFiltered}</div>
        </div>
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search opinions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 rounded-xl"
          />
        </div>
        <Button
          onClick={() => router.push('/create')}
          size="sm"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold h-10 px-4 text-sm rounded-xl flex-shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>

      {/* Tabs + Categories */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            activeTab === 'all'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('hot')}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
            activeTab === 'hot'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/50'
          }`}
        >
          <Flame className="w-3 h-3" />
          Hot
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
            activeTab === 'new'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/50'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          New
        </button>
        <div className="w-px h-4 bg-border/50 mx-1" />
        {CATEGORIES.slice(0, 6).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-all border ${
              selectedCategory === cat
                ? CATEGORY_COLORS[cat] || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-card/50 text-muted-foreground hover:text-foreground border-border/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-muted-foreground flex-shrink-0 mr-1">Sort:</span>
        {[
          { key: 'trending' as const, label: 'Trending', icon: TrendingUp },
          { key: 'marketcap' as const, label: 'MCap', icon: BarChart3 },
          { key: 'volume' as const, label: 'Volume', icon: Zap },
          { key: 'answers' as const, label: 'Answers', icon: Users },
          { key: 'newest' as const, label: 'Newest', icon: Sparkles },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleSort(opt.key)}
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
              sortBy === opt.key
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <opt.icon className="w-3 h-3" />
            {opt.label}
            {sortBy === opt.key && (
              sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
            )}
          </button>
        ))}
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
          <h3 className="mb-2 text-lg font-medium">No opinions found</h3>
          <p className="mb-4 text-muted-foreground">
            {selectedCategory ? `No opinions in ${selectedCategory} category.` : 'Be the first to create an opinion and start trading.'}
          </p>
          <Button onClick={() => router.push('/create')} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Create Opinion
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {paginatedQuestions.map((question, index) => {
            const volumeUSDC = Number(question.totalVolume) / 1_000_000;
            const marketCapUSDC = Number(question.leadingMarketCap || 0n) / 1_000_000;
            const isHot = volumeUSDC > 5;
            const hasLeadingAnswer = question.leadingAnswerText && question.leadingAnswerId && question.leadingAnswerId > 0n;

            return (
              <motion.div
                key={question.id.toString()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className="flex flex-col gap-2 p-3 rounded-xl border border-border/30 bg-card/50 hover:border-emerald-500/30 hover:bg-card/80 transition-all duration-200 cursor-pointer group active:scale-[0.98]"
                onClick={() => router.push(`/questions/${question.id}`)}
              >
                {/* Header: Category + Hot Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-mono text-xs">#{question.id.toString()}</span>
                    {question.category && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[question.category] || CATEGORY_COLORS.Other}`}>
                        {question.category}
                      </span>
                    )}
                  </div>
                  {isHot && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      Hot
                    </Badge>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="text-muted-foreground font-medium text-sm leading-snug">
                  {question.text}
                </h3>

                {/* Leading Answer - THE MAIN FOCUS */}
                {hasLeadingAnswer ? (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-foreground font-bold text-base truncate flex-1">
                      {question.leadingAnswerText}
                    </span>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-emerald-400 font-semibold text-xs">
                        {formatLargeUSDC(question.leadingMarketCap || 0n)} MCap
                      </span>
                      {question.leadingPricePerShare && (
                        <span className="text-muted-foreground text-[10px]">
                          ${(Number(question.leadingPricePerShare) / 1e12).toFixed(2)}/share
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-dashed border-border/50">
                    <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-sm italic">
                      Be first to answer!
                    </span>
                  </div>
                )}

                {/* Engaging CTA + Stats */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/20">
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Volume</div>
                      <div className="font-medium text-foreground">{formatLargeUSDC(question.totalVolume)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Answers</div>
                      <div className="font-medium text-foreground">{Number(question.answerCount)}</div>
                    </div>
                    {question.leadingTotalShares && question.leadingTotalShares > 0n && (
                      <div>
                        <div className="text-muted-foreground">Shares</div>
                        <div className="font-medium text-foreground">{(Number(question.leadingTotalShares) / 100).toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasLeadingAnswer && Number(question.answerCount) > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2.5 py-1 h-7 rounded-lg border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/questions/${question.id}`);
                        }}
                      >
                        Challenge
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs px-3 py-1 h-7 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/questions/${question.id}`);
                      }}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {hasLeadingAnswer ? 'Trade' : 'Answer'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-lg"
          >
            Next
          </Button>
        </div>
      )}

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border/50 px-4 py-2 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-0.5 text-emerald-400"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Market</span>
          </button>
          <button
            onClick={() => router.push('/create')}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
          >
            <div className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </button>
          <button
            onClick={() => router.push('/portfolio')}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
