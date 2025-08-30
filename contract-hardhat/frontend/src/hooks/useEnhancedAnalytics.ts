'use client';

import { useMemo } from 'react';

interface Opinion {
  id: number;
  categories: string[];
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  totalVolume: number;
  lastPrice: number;
  nextPrice: number;
  creator: string;
  currentAnswerOwner: string;
  isCreator: boolean;
  isOwner: boolean;
  createdAt?: number;
}

interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'CREATE';
  price: number;
  timestamp: number;
  opinionId: number;
}

interface PortfolioAnalytics {
  // Time-based performance
  performance: {
    daily: { date: string; value: number; pnl: number }[];
    weekly: { date: string; value: number; pnl: number }[];
    monthly: { date: string; value: number; pnl: number }[];
    timeRanges: {
      '7d': { value: number; pnl: number; pnlPercentage: number };
      '30d': { value: number; pnl: number; pnlPercentage: number };
      '90d': { value: number; pnl: number; pnlPercentage: number };
      '1y': { value: number; pnl: number; pnlPercentage: number };
      'all': { value: number; pnl: number; pnlPercentage: number };
    };
  };

  // Category analysis
  categoryAnalysis: {
    allocation: { category: string; value: number; percentage: number; count: number }[];
    performance: { category: string; totalPnL: number; avgPnL: number; winRate: number }[];
    topCategory: string;
    diversification: number; // 0-100 score
  };

  // Risk metrics
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    portfolioConcentration: number;
    riskScore: number; // 0-100
  };

  // Trading patterns
  tradingPatterns: {
    avgHoldTime: number;
    tradingFrequency: number;
    winRate: number;
    avgWinAmount: number;
    avgLossAmount: number;
    profitFactor: number;
  };

  // Comparison metrics
  comparison: {
    vsPlatformAverage: {
      performance: number; // percentage better/worse
      winRate: number;
      avgReturn: number;
    };
    rank: {
      overall: number;
      byCategory: { [category: string]: number };
    };
  };
}

/**
 * Enhanced analytics hook that processes user data for comprehensive insights
 */
export function useEnhancedAnalytics(
  opinions: Opinion[],
  transactions: Transaction[],
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all' = 'all'
): PortfolioAnalytics {
  
  return useMemo(() => {
    // Calculate time-based performance
    const performance = calculatePerformanceMetrics(opinions, transactions, timeRange);
    
    // Analyze category allocation and performance
    const categoryAnalysis = analyzeCategoryDistribution(opinions);
    
    // Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(opinions, transactions);
    
    // Analyze trading patterns
    const tradingPatterns = analyzeTradingPatterns(transactions, opinions);
    
    // Generate comparison metrics (mock data for now - would come from platform stats)
    const comparison = generateComparisonMetrics(opinions, transactions);

    return {
      performance,
      categoryAnalysis,
      riskMetrics,
      tradingPatterns,
      comparison,
    };
  }, [opinions, transactions, timeRange]);
}

/**
 * Calculate performance metrics across different time periods
 */
function calculatePerformanceMetrics(
  opinions: Opinion[],
  transactions: Transaction[],
  timeRange: string
) {
  const now = Date.now();
  const timeRanges = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
    'all': Infinity,
  };

  // Generate daily performance data
  const daily = generatePerformanceTimeSeries(opinions, transactions, 'daily');
  const weekly = generatePerformanceTimeSeries(opinions, transactions, 'weekly');
  const monthly = generatePerformanceTimeSeries(opinions, transactions, 'monthly');

  // Calculate performance for each time range
  const timeRangeMetrics = Object.entries(timeRanges).reduce((acc, [range, duration]) => {
    const cutoff = duration === Infinity ? 0 : now - duration;
    const relevantTransactions = transactions.filter(t => t.timestamp * 1000 >= cutoff);
    const totalValue = opinions.reduce((sum, op) => sum + op.currentValue, 0);
    const totalPnL = opinions.reduce((sum, op) => sum + op.pnl, 0);
    const totalInvestment = totalValue - totalPnL;
    const pnlPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

    acc[range as keyof typeof timeRanges] = {
      value: totalValue,
      pnl: totalPnL,
      pnlPercentage,
    };
    return acc;
  }, {} as any);

  return {
    daily,
    weekly,
    monthly,
    timeRanges: timeRangeMetrics,
  };
}

/**
 * Generate time series data for charts
 */
function generatePerformanceTimeSeries(
  opinions: Opinion[],
  transactions: Transaction[],
  period: 'daily' | 'weekly' | 'monthly'
) {
  const now = new Date();
  const periods = period === 'daily' ? 30 : period === 'weekly' ? 12 : 12;
  const increment = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;

  return Array.from({ length: periods }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (periods - 1 - i) * increment);
    
    // Mock calculation - in reality would calculate portfolio value at that date
    const value = opinions.reduce((sum, op) => sum + op.currentValue, 0);
    const pnl = opinions.reduce((sum, op) => sum + op.pnl, 0);

    return {
      date: date.toISOString().split('T')[0],
      value: value * (0.8 + Math.random() * 0.4), // Add some variance
      pnl: pnl * (0.8 + Math.random() * 0.4),
    };
  });
}

/**
 * Analyze category distribution and performance
 */
function analyzeCategoryDistribution(opinions: Opinion[]) {
  const categoryMap = new Map<string, { value: number; count: number; pnl: number; wins: number; total: number }>();

  // Aggregate data by category
  opinions.forEach(opinion => {
    const category = opinion.categories[0] || 'Other';
    const existing = categoryMap.get(category) || { value: 0, count: 0, pnl: 0, wins: 0, total: 0 };
    
    categoryMap.set(category, {
      value: existing.value + opinion.currentValue,
      count: existing.count + 1,
      pnl: existing.pnl + opinion.pnl,
      wins: existing.wins + (opinion.pnl > 0 ? 1 : 0),
      total: existing.total + 1,
    });
  });

  const totalValue = opinions.reduce((sum, op) => sum + op.currentValue, 0);
  
  // Convert to arrays for easier consumption
  const allocation = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    count: data.count,
  })).sort((a, b) => b.value - a.value);

  const performance = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    totalPnL: data.pnl,
    avgPnL: data.count > 0 ? data.pnl / data.count : 0,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
  })).sort((a, b) => b.totalPnL - a.totalPnL);

  const topCategory = allocation[0]?.category || 'None';
  
  // Calculate diversification score (lower concentration = higher diversification)
  const concentrationSquares = allocation.reduce((sum, item) => sum + Math.pow(item.percentage / 100, 2), 0);
  const diversification = Math.max(0, (1 - concentrationSquares) * 100);

  return {
    allocation,
    performance,
    topCategory,
    diversification,
  };
}

/**
 * Calculate risk metrics
 */
function calculateRiskMetrics(opinions: Opinion[], transactions: Transaction[]) {
  const returns = opinions.map(op => op.pnlPercentage / 100);
  const totalValue = opinions.reduce((sum, op) => sum + op.currentValue, 0);
  
  // Volatility (standard deviation of returns)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * 100;

  // Sharpe ratio (assuming 0% risk-free rate)
  const sharpeRatio = volatility > 0 ? (avgReturn * 100) / volatility : 0;

  // Max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  returns.forEach(returnVal => {
    peak = Math.max(peak, returnVal);
    const drawdown = peak - returnVal;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  // Portfolio concentration (HHI of position sizes)
  const positionSizes = opinions.map(op => op.currentValue / totalValue);
  const portfolioConcentration = positionSizes.reduce((sum, size) => sum + Math.pow(size, 2), 0) * 100;

  // Overall risk score (0-100, higher = riskier)
  const riskScore = Math.min(100, 
    (volatility * 0.4) + 
    (portfolioConcentration * 0.3) + 
    (maxDrawdown * 100 * 0.3)
  );

  return {
    volatility,
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100,
    portfolioConcentration,
    riskScore,
  };
}

/**
 * Analyze trading patterns
 */
function analyzeTradingPatterns(transactions: Transaction[], opinions: Opinion[]) {
  const trades = transactions.filter(t => t.type === 'BUY' || t.type === 'SELL');
  
  // Mock calculations - would need more detailed transaction data
  const avgHoldTime = 15; // days
  const tradingFrequency = trades.length / Math.max(1, (Date.now() / 1000 - Math.min(...trades.map(t => t.timestamp))) / (30 * 24 * 3600)); // trades per month
  
  const wins = opinions.filter(op => op.pnl > 0);
  const losses = opinions.filter(op => op.pnl < 0);
  
  const winRate = opinions.length > 0 ? (wins.length / opinions.length) * 100 : 0;
  const avgWinAmount = wins.length > 0 ? wins.reduce((sum, op) => sum + op.pnl, 0) / wins.length : 0;
  const avgLossAmount = losses.length > 0 ? Math.abs(losses.reduce((sum, op) => sum + op.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLossAmount > 0 ? avgWinAmount / avgLossAmount : 0;

  return {
    avgHoldTime,
    tradingFrequency,
    winRate,
    avgWinAmount,
    avgLossAmount,
    profitFactor,
  };
}

/**
 * Generate comparison metrics (would come from backend in production)
 */
function generateComparisonMetrics(opinions: Opinion[], transactions: Transaction[]) {
  // Mock platform averages - would come from actual platform data
  const platformAverage = {
    winRate: 55,
    avgReturn: 12,
    totalReturn: 15,
  };

  const userWinRate = opinions.length > 0 ? (opinions.filter(op => op.pnl > 0).length / opinions.length) * 100 : 0;
  const userAvgReturn = opinions.length > 0 ? opinions.reduce((sum, op) => sum + op.pnlPercentage, 0) / opinions.length : 0;
  const totalValue = opinions.reduce((sum, op) => sum + op.currentValue, 0);
  const totalPnL = opinions.reduce((sum, op) => sum + op.pnl, 0);
  const totalInvestment = totalValue - totalPnL;
  const userTotalReturn = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  return {
    vsPlatformAverage: {
      performance: userTotalReturn - platformAverage.totalReturn,
      winRate: userWinRate - platformAverage.winRate,
      avgReturn: userAvgReturn - platformAverage.avgReturn,
    },
    rank: {
      overall: Math.floor(Math.random() * 1000) + 1, // Mock rank
      byCategory: {
        'Crypto': Math.floor(Math.random() * 500) + 1,
        'Technology': Math.floor(Math.random() * 300) + 1,
        'Politics': Math.floor(Math.random() * 200) + 1,
      },
    },
  };
}