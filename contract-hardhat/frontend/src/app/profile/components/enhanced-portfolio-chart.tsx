'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Activity,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';

interface EnhancedPortfolioChartProps {
  opinions: any[];
  transactions: any[];
  loading: boolean;
}

const timeRangeOptions = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
] as const;

const chartColors = {
  primary: '#10b981', // emerald-500
  secondary: '#06b6d4', // cyan-500
  accent: '#8b5cf6', // violet-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
};

const categoryColors = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#84cc16'
];

export function EnhancedPortfolioChart({ opinions, transactions, loading }: EnhancedPortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('performance');
  
  const analytics = useEnhancedAnalytics(opinions, transactions, timeRange);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className={`text-sm ${
              analytics.performance.timeRanges[timeRange].pnlPercentage >= 0 
                ? 'text-emerald-400' 
                : 'text-red-400'
            }`}>
              {formatPercentage(analytics.performance.timeRanges[timeRange].pnlPercentage)}
            </span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(analytics.performance.timeRanges[timeRange].value)}
          </div>
          <div className="text-sm text-gray-400">Portfolio Value</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-400">
              {analytics.riskMetrics.volatility.toFixed(1)}%
            </span>
          </div>
          <div className="text-xl font-bold text-white">
            {analytics.tradingPatterns.winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Win Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <PieChartIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-400">
              {analytics.categoryAnalysis.diversification.toFixed(0)}
            </span>
          </div>
          <div className="text-xl font-bold text-white">
            {analytics.categoryAnalysis.topCategory}
          </div>
          <div className="text-sm text-gray-400">Top Category</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">
              {analytics.comparison.vsPlatformAverage.performance === 0 
                ? "—" 
                : formatPercentage(analytics.comparison.vsPlatformAverage.performance)}
            </span>
          </div>
          <div className="text-xl font-bold text-white">
            {analytics.comparison.rank.overall === 0 ? "—" : `#${analytics.comparison.rank.overall}`}
          </div>
          <div className="text-sm text-gray-400">
            {analytics.comparison.rank.overall === 0 ? "Coming Soon" : "Platform Rank"}
          </div>
        </motion.div>
      </div>

      {/* Main Chart Section */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Portfolio Analytics</h3>
            <div className="flex space-x-2">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(option.value)}
                  className={`${
                    timeRange === option.value
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabs for different chart views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass-card grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            {/* Performance Chart */}
            <TabsContent value="performance" className="mt-6">
              <div className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.performance.daily}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrency} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'value' ? formatCurrency(value) : formatCurrency(value),
                          name === 'value' ? 'Portfolio Value' : 'P&L'
                        ]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={chartColors.primary}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pnl" 
                        stroke={chartColors.secondary}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPnL)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Category Allocation */}
            <TabsContent value="allocation" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryAnalysis.allocation}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                      >
                        {analytics.categoryAnalysis.allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Performance Table */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">Category Performance</h4>
                  {analytics.categoryAnalysis.performance.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                        />
                        <span className="text-white font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${category.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(category.totalPnL)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {category.winRate.toFixed(1)}% win rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Risk Analysis */}
            <TabsContent value="risk" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Metrics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Risk Metrics</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Portfolio Volatility</span>
                      <span className="text-white font-bold">{analytics.riskMetrics.volatility.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Sharpe Ratio</span>
                      <span className="text-white font-bold">{analytics.riskMetrics.sharpeRatio.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Max Drawdown</span>
                      <span className="text-red-400 font-bold">{analytics.riskMetrics.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Risk Score</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${
                          analytics.riskMetrics.riskScore < 30 ? 'text-emerald-400' :
                          analytics.riskMetrics.riskScore < 70 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {analytics.riskMetrics.riskScore.toFixed(0)}/100
                        </span>
                        {analytics.riskMetrics.riskScore >= 70 && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trading Patterns */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Trading Patterns</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Avg Hold Time</span>
                      <span className="text-white font-bold">
                        {analytics.tradingPatterns.avgHoldTime === 15 ? "—" : `${analytics.tradingPatterns.avgHoldTime} days`}
                      </span>
                    </div>
                    {analytics.tradingPatterns.avgHoldTime === 15 && (
                      <div className="text-xs text-gray-500 px-3">
                        Coming soon - requires historical transaction analysis
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Trading Frequency</span>
                      <span className="text-white font-bold">{analytics.tradingPatterns.tradingFrequency.toFixed(1)}/month</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Profit Factor</span>
                      <span className="text-white font-bold">{analytics.tradingPatterns.profitFactor.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-gray-300">Avg Win/Loss</span>
                      <span className="text-white font-bold">
                        {formatCurrency(analytics.tradingPatterns.avgWinAmount)} / 
                        {formatCurrency(analytics.tradingPatterns.avgLossAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Comparison */}
            <TabsContent value="comparison" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">vs Platform Avg</span>
                      <Badge className="bg-gray-500">
                        {analytics.comparison.vsPlatformAverage.performance === 0 ? "—" : formatPercentage(analytics.comparison.vsPlatformAverage.performance)}
                      </Badge>
                    </div>
                    <div className="text-xl font-bold text-white">Performance</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {analytics.comparison.vsPlatformAverage.performance === 0 ? "Insufficient data" : ""}
                    </div>
                  </div>
                  
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">vs Platform Avg</span>
                      <Badge className="bg-gray-500">
                        {analytics.comparison.vsPlatformAverage.winRate === 0 ? "—" : formatPercentage(analytics.comparison.vsPlatformAverage.winRate)}
                      </Badge>
                    </div>
                    <div className="text-xl font-bold text-white">Win Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {analytics.comparison.vsPlatformAverage.winRate === 0 ? "Insufficient data" : ""}
                    </div>
                  </div>
                  
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Overall Rank</span>
                      <Badge className="bg-purple-500">
                        {analytics.comparison.rank.overall === 0 ? "—" : `#${analytics.comparison.rank.overall}`}
                      </Badge>
                    </div>
                    <div className="text-xl font-bold text-white">Platform</div>
                  </div>
                </div>

                {/* Category Rankings */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Category Rankings</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.comparison.rank.byCategory).map(([category, rank]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-gray-300">{category}</span>
                        <Badge className="bg-gray-500">
                          {rank === 0 ? "—" : `#${rank}`}
                        </Badge>
                      </div>
                    ))}
                    {Object.entries(analytics.comparison.rank.byCategory).every(([, rank]) => rank === 0) && (
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-500">
                          Category rankings coming soon
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Requires comprehensive platform data analysis
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}