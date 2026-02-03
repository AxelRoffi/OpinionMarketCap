'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  Filter,
  Search,
  ExternalLink,
  BarChart3,
  Target,
  Clock,
  Award,
  Activity,
  ArrowUpDown,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserOpinion, Transaction, formatUSDC, formatPercentage, formatTimeAgo } from '../hooks/use-user-profile';

interface DetailedTradingHistoryProps {
  opinions: UserOpinion[];
  transactions: Transaction[];
  loading: boolean;
}

type TransactionType = 'all' | 'BUY' | 'SELL' | 'CREATE';
type SortField = 'timestamp' | 'amount' | 'price' | 'pnl';
type TimeFilter = '7d' | '30d' | '90d' | 'all';

interface EnhancedTransaction extends Transaction {
  pnl?: number;
  pnlPercentage?: number;
  category?: string;
  outcome?: 'profit' | 'loss' | 'breakeven';
  holdingDays?: number;
}

interface TradingMetrics {
  totalTransactions: number;
  totalVolume: number;
  totalPnL: number;
  winRate: number;
  avgTradingDays: number;
  bestTrade: number;
  worstTrade: number;
  monthlyVolume: { [key: string]: number };
  categoryBreakdown: { [key: string]: { count: number; volume: number; pnl: number } };
  timeAnalysis: {
    mostActiveHour: number;
    mostActiveDay: string;
    avgTransactionsPerWeek: number;
  };
}

export function DetailedTradingHistory({ opinions, transactions, loading }: DetailedTradingHistoryProps) {
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Enhanced transactions with P&L data
  const enhancedTransactions = useMemo((): EnhancedTransaction[] => {
    return transactions.map(tx => {
      const relatedOpinion = opinions.find(op => op.id === tx.opinionId);
      
      let pnl = 0;
      let pnlPercentage = 0;
      let outcome: 'profit' | 'loss' | 'breakeven' = 'breakeven';
      let holdingDays = 0;

      if (relatedOpinion && tx.type === 'BUY') {
        pnl = relatedOpinion.currentValue - tx.price;
        pnlPercentage = tx.price > 0 ? (pnl / tx.price) * 100 : 0;
        outcome = pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'breakeven';
        holdingDays = Math.floor((Date.now() - tx.timestamp) / (24 * 60 * 60 * 1000));
      }

      return {
        ...tx,
        pnl,
        pnlPercentage,
        outcome,
        holdingDays,
        category: relatedOpinion?.categories[0] || 'Unknown'
      };
    });
  }, [transactions, opinions]);

  // Apply filters and sorting
  const filteredTransactions = useMemo(() => {
    let filtered = [...enhancedTransactions];

    // Time filter
    const now = Date.now();
    const timeFrameMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    
    if (timeFilter !== 'all') {
      const cutoffTime = now - timeFrameMs[timeFilter];
      filtered = filtered.filter(tx => tx.timestamp >= cutoffTime);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.opinionTitle.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        (tx.category && tx.category.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'pnl' && (aVal === undefined || bVal === undefined)) {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [enhancedTransactions, typeFilter, timeFilter, searchQuery, sortField, sortDirection]);

  // Calculate trading metrics
  const tradingMetrics = useMemo((): TradingMetrics => {
    const filtered = filteredTransactions;
    
    const totalVolume = filtered.reduce((sum, tx) => sum + (tx.price * tx.amount), 0);
    const totalPnL = filtered.reduce((sum, tx) => sum + (tx.pnl || 0), 0);
    const profitableTrades = filtered.filter(tx => (tx.pnl || 0) > 0);
    const winRate = filtered.length > 0 ? (profitableTrades.length / filtered.length) * 100 : 0;
    
    const trades = filtered.filter(tx => tx.type === 'BUY');
    const avgTradingDays = trades.length > 0 
      ? trades.reduce((sum, tx) => sum + (tx.holdingDays || 0), 0) / trades.length 
      : 0;

    const pnls = filtered.map(tx => tx.pnl || 0).filter(pnl => pnl !== 0);
    const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
    const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

    // Monthly volume analysis
    const monthlyVolume: { [key: string]: number } = {};
    filtered.forEach(tx => {
      const monthKey = new Date(tx.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyVolume[monthKey] = (monthlyVolume[monthKey] || 0) + (tx.price * tx.amount);
    });

    // Category breakdown
    const categoryBreakdown: { [key: string]: { count: number; volume: number; pnl: number } } = {};
    filtered.forEach(tx => {
      const category = tx.category || 'Unknown';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, volume: 0, pnl: 0 };
      }
      categoryBreakdown[category].count += 1;
      categoryBreakdown[category].volume += tx.price * tx.amount;
      categoryBreakdown[category].pnl += tx.pnl || 0;
    });

    // Time analysis
    const hours = filtered.map(tx => new Date(tx.timestamp).getHours());
    const days = filtered.map(tx => new Date(tx.timestamp).toLocaleDateString('en-US', { weekday: 'long' }));
    
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    
    const dayCounts = days.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
      (hourCounts[parseInt(a)] || 0) > (hourCounts[parseInt(b)] || 0) ? a : b, '0'
    );
    
    const mostActiveDay = Object.keys(dayCounts).reduce((a, b) => 
      (dayCounts[a] || 0) > (dayCounts[b] || 0) ? a : b, 'Monday'
    );

    const weeks = Math.max(1, Math.ceil((Date.now() - Math.min(...filtered.map(tx => tx.timestamp))) / (7 * 24 * 60 * 60 * 1000)));
    const avgTransactionsPerWeek = filtered.length / weeks;

    return {
      totalTransactions: filtered.length,
      totalVolume,
      totalPnL,
      winRate,
      avgTradingDays,
      bestTrade,
      worstTrade,
      monthlyVolume,
      categoryBreakdown,
      timeAnalysis: {
        mostActiveHour: parseInt(mostActiveHour),
        mostActiveDay,
        avgTransactionsPerWeek
      }
    };
  }, [filteredTransactions]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Opinion', 'Amount', 'Price', 'P&L', 'P&L%', 'Category', 'Holding Days', 'Tx Hash'],
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toISOString(),
        tx.type,
        tx.opinionTitle.replace(/,/g, ';'),
        tx.amount,
        tx.price.toFixed(6),
        (tx.pnl || 0).toFixed(6),
        (tx.pnlPercentage || 0).toFixed(2),
        tx.category || '',
        tx.holdingDays || 0,
        tx.txHash
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">Trading History & P&L Attribution</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {tradingMetrics.totalTransactions} Transactions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {/* Trading Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-400 font-medium">
                  {formatUSDC(tradingMetrics.totalVolume)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Total Volume</div>
            </CardContent>
          </Card>
          
          <Card className={`${tradingMetrics.totalPnL >= 0 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-red-500/10 border-red-500/20'
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className={`w-4 h-4 ${tradingMetrics.totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={`font-medium ${tradingMetrics.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatUSDC(tradingMetrics.totalPnL)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Total P&L</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-blue-400 font-medium">
                  {tradingMetrics.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-purple-400 font-medium">
                  {tradingMetrics.avgTradingDays.toFixed(1)}d
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Avg. Hold</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Time Filter */}
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {(['7d', '30d', '90d', 'all'] as TimeFilter[]).map((tf) => (
              <Button
                key={tf}
                variant={timeFilter === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(tf)}
                className={`text-xs ${timeFilter === tf 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-transparent border-border hover:bg-muted'
                }`}
              >
                {tf === 'all' ? 'All' : tf.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(['all', 'BUY', 'SELL', 'CREATE'] as TransactionType[]).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className={`text-xs ${typeFilter === type 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-transparent border-border hover:bg-muted'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No transactions found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Sort Header */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground border-b border-border pb-2">
                <button
                  onClick={() => toggleSort('timestamp')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Date</span>
                  {sortField === 'timestamp' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
                <span className="flex-1">Transaction</span>
                <button
                  onClick={() => toggleSort('price')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Price</span>
                  {sortField === 'price' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('pnl')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>P&L</span>
                  {sortField === 'pnl' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
                <span>Actions</span>
              </div>

              {/* Transaction List */}
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Transaction Type Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'BUY' ? 'bg-emerald-500/20' : 
                        transaction.type === 'SELL' ? 'bg-red-500/20' : 
                        'bg-blue-500/20'
                      }`}>
                        {transaction.type === 'BUY' ? (
                          <TrendingUp className={`w-5 h-5 text-emerald-500`} />
                        ) : transaction.type === 'SELL' ? (
                          <TrendingDown className={`w-5 h-5 text-red-500`} />
                        ) : (
                          <Plus className={`w-5 h-5 text-blue-500`} />
                        )}
                      </div>

                      {/* Transaction Details */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              transaction.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-500' :
                              transaction.type === 'SELL' ? 'bg-red-500/20 text-red-500' :
                              'bg-blue-500/20 text-blue-500'
                            }
                          >
                            {transaction.type}
                          </Badge>
                          {transaction.category && (
                            <Badge className="bg-gray-500/20 text-muted-foreground text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                          {transaction.holdingDays !== undefined && transaction.holdingDays > 0 && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              {transaction.holdingDays}d hold
                            </Badge>
                          )}
                        </div>
                        <div className="text-foreground font-medium">
                          {transaction.opinionTitle.substring(0, 60)}...
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {formatTimeAgo(transaction.timestamp)} • Amount: {transaction.amount}
                        </div>
                      </div>
                    </div>

                    {/* Price and P&L */}
                    <div className="text-right">
                      <div className="text-foreground font-medium">
                        {formatUSDC(transaction.price)}
                      </div>
                      {transaction.pnl !== undefined && transaction.pnl !== 0 && (
                        <>
                          <div className={`text-sm font-medium ${
                            transaction.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            {transaction.pnl >= 0 ? '+' : ''}{formatUSDC(transaction.pnl)}
                          </div>
                          <div className={`text-xs ${
                            transaction.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {formatPercentage(transaction.pnlPercentage || 0)}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://basescan.org/tx/${transaction.txHash}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Category Performance Summary */}
        {Object.keys(tradingMetrics.categoryBreakdown).length > 1 && (
          <Card className="mt-6 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Performance by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {Object.entries(tradingMetrics.categoryBreakdown)
                  .sort(([,a], [,b]) => b.pnl - a.pnl)
                  .map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="text-foreground font-medium">{category}</div>
                        <div className="text-muted-foreground text-sm">
                          {data.count} transactions • {formatUSDC(data.volume)} volume
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${data.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {data.pnl >= 0 ? '+' : ''}{formatUSDC(data.pnl)}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {data.count > 0 ? formatPercentage((data.pnl / data.volume) * 100) : '0%'} ROI
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}