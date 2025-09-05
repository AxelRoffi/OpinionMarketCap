'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  Target,
  Tag,
  X,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserOpinion, formatUSDC, formatPercentage, formatTimeAgo } from '../hooks/use-user-profile';

interface AdvancedPositionManagementProps {
  opinions: UserOpinion[];
  loading: boolean;
  onListForSale?: (opinion: UserOpinion) => void;
  onCancelListing?: (opinion: UserOpinion) => void;
  onTrade?: (opinion: UserOpinion) => void;
  isOwnProfile?: boolean;
}

type SortField = 'question' | 'currentValue' | 'pnl' | 'pnlPercentage' | 'timestamp' | 'totalVolume';
type FilterStatus = 'all' | 'profitable' | 'losing' | 'breakeven';
type FilterType = 'all' | 'owned' | 'created';

interface FilterState {
  search: string;
  status: FilterStatus;
  type: FilterType;
  category: string;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
}

export function AdvancedPositionManagement({ 
  opinions, 
  loading, 
  onListForSale, 
  onCancelListing, 
  onTrade,
  isOwnProfile = false
}: AdvancedPositionManagementProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    type: 'all',
    category: 'all',
    sortField: 'timestamp',
    sortDirection: 'desc'
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    opinions.forEach(opinion => {
      opinion.categories.forEach(cat => cats.add(cat));
    });
    return Array.from(cats);
  }, [opinions]);

  // Apply filters and sorting
  const filteredAndSortedOpinions = useMemo(() => {
    let filtered = [...opinions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(opinion => 
        opinion.question.toLowerCase().includes(searchLower) ||
        opinion.currentAnswer.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'profitable':
          filtered = filtered.filter(op => op.pnl > 0);
          break;
        case 'losing':
          filtered = filtered.filter(op => op.pnl < 0);
          break;
        case 'breakeven':
          filtered = filtered.filter(op => op.pnl === 0);
          break;
      }
    }

    // Type filter
    if (filters.type !== 'all') {
      switch (filters.type) {
        case 'owned':
          filtered = filtered.filter(op => op.isOwner);
          break;
        case 'created':
          filtered = filtered.filter(op => op.isCreator);
          break;
      }
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(op => op.categories.includes(filters.category));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortField];
      let bVal: any = b[filters.sortField];

      // Handle string fields
      if (filters.sortField === 'question') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (filters.sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [opinions, filters]);

  // Performance statistics
  const stats = useMemo(() => {
    const profitable = filteredAndSortedOpinions.filter(op => op.pnl > 0);
    const losing = filteredAndSortedOpinions.filter(op => op.pnl < 0);
    const totalValue = filteredAndSortedOpinions.reduce((sum, op) => sum + op.currentValue, 0);
    const totalPnL = filteredAndSortedOpinions.reduce((sum, op) => sum + op.pnl, 0);

    return {
      total: filteredAndSortedOpinions.length,
      profitable: profitable.length,
      losing: losing.length,
      breakeven: filteredAndSortedOpinions.length - profitable.length - losing.length,
      winRate: filteredAndSortedOpinions.length > 0 ? (profitable.length / filteredAndSortedOpinions.length) * 100 : 0,
      totalValue,
      totalPnL,
      averagePnL: filteredAndSortedOpinions.length > 0 ? totalPnL / filteredAndSortedOpinions.length : 0
    };
  }, [filteredAndSortedOpinions]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSort = (field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'desc' ? 'asc' : 'desc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      category: 'all',
      sortField: 'timestamp',
      sortDirection: 'desc'
    });
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Position Management</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {stats.total} Positions
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {formatUSDC(stats.totalValue)} Value
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-400 font-medium">{stats.profitable}</span>
            </div>
            <div className="text-xs text-gray-400">Profitable</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-red-400 font-medium">{stats.losing}</span>
            </div>
            <div className="text-xs text-gray-400">Losing</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-blue-400 font-medium">{stats.winRate.toFixed(1)}%</span>
            </div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatUSDC(stats.totalPnL)}
              </span>
            </div>
            <div className="text-xs text-gray-400">Total P&L</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4 mb-6">
          {/* Search and Clear */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search positions..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {(filters.search || filters.status !== 'all' || filters.type !== 'all' || filters.category !== 'all') && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Status:</span>
              {(['all', 'profitable', 'losing', 'breakeven'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={filters.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('status', status)}
                  className={`text-xs ${filters.status === status 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-transparent border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-400">Type:</span>
              {(['all', 'owned', 'created'] as FilterType[]).map((type) => (
                <Button
                  key={type}
                  variant={filters.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('type', type)}
                  className={`text-xs ${filters.type === type 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-transparent border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Positions List */}
        <div className="space-y-4">
          {filteredAndSortedOpinions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No positions found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              {/* Sort Header */}
              <div className="flex items-center space-x-4 text-sm text-gray-400 border-b border-gray-700 pb-2">
                <button
                  onClick={() => toggleSort('question')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Question</span>
                  {filters.sortField === 'question' && (
                    filters.sortDirection === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('currentValue')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Value</span>
                  {filters.sortField === 'currentValue' && (
                    filters.sortDirection === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('pnlPercentage')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>P&L %</span>
                  {filters.sortField === 'pnlPercentage' && (
                    filters.sortDirection === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('timestamp')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Date</span>
                  {filters.sortField === 'timestamp' && (
                    filters.sortDirection === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Position Cards */}
              {filteredAndSortedOpinions.map((opinion, index) => (
                <motion.div
                  key={opinion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors bg-gray-800/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{opinion.question}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        {opinion.categories.map((category) => (
                          <Badge key={category} className="bg-blue-600/20 text-blue-400 text-xs">
                            {category}
                          </Badge>
                        ))}
                        {opinion.isOwner && (
                          <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        )}
                        {opinion.isCreator && (
                          <Badge className="bg-orange-500/20 text-orange-500 text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            Created
                          </Badge>
                        )}
                        {opinion.isQuestionOwner && (
                          <Badge className="bg-purple-500/20 text-purple-500 text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            Q-Owner
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        <strong>Answer:</strong> {opinion.currentAnswer}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatTimeAgo(opinion.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Volume: {formatUSDC(opinion.totalVolume)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-white font-bold text-lg">
                        {formatUSDC(opinion.currentValue)}
                      </div>
                      <div className={`text-sm font-medium ${opinion.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatPercentage(opinion.pnlPercentage)}
                      </div>
                      <div className={`text-xs ${opinion.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {opinion.pnl >= 0 ? '+' : ''}{formatUSDC(opinion.pnl)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {isOwnProfile && (
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700/40">
                      {onTrade && (
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                          onClick={() => onTrade(opinion)}
                        >
                          Trade
                        </Button>
                      )}
                      {/* Marketplace Actions - Only for question owners */}
                      {opinion.isQuestionOwner && onListForSale && (
                        <>
                          {opinion.salePrice === 0 ? (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => onListForSale(opinion)}
                              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                            >
                              <Tag className="w-4 h-4 mr-1" />
                              List for Sale
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => onCancelListing && onCancelListing(opinion)}
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel Listing ({formatUSDC(opinion.salePrice)})
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}