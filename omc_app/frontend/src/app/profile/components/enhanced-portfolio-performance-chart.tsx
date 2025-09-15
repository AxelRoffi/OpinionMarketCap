'use client';

import { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UserOpinion, formatUSDC, formatPercentage } from '../hooks/use-user-profile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

interface EnhancedPortfolioPerformanceChartProps {
  opinions: UserOpinion[];
  loading: boolean;
}

type TimeFrame = '7d' | '30d' | '90d' | 'all';
type ChartType = 'portfolio' | 'pnl' | 'allocation' | 'performance';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function EnhancedPortfolioPerformanceChart({ opinions, loading }: EnhancedPortfolioPerformanceChartProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('30d');
  const [chartType, setChartType] = useState<ChartType>('portfolio');

  // Enhanced data processing with multiple timeframes
  const chartData = useMemo(() => {
    if (!opinions.length) return { timeline: [], categoryData: [], performanceData: [] };

    // Filter by timeframe
    const now = Date.now();
    const timeFrameMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const cutoffTime = now - timeFrameMs[selectedTimeFrame];
    const filteredOpinions = opinions.filter(op => op.timestamp >= cutoffTime);

    // Sort opinions by timestamp
    const sortedOpinions = [...filteredOpinions].sort((a, b) => a.timestamp - b.timestamp);
    
    let cumulativeValue = 0;
    let cumulativePnL = 0;
    let cumulativeInvested = 0;
    
    // Timeline data for portfolio/P&L charts
    const timeline = sortedOpinions.map((opinion, index) => {
      cumulativeValue += opinion.currentValue;
      cumulativePnL += opinion.pnl;
      cumulativeInvested += opinion.purchasePrice || opinion.currentValue;
      
      return {
        date: new Date(opinion.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: opinion.timestamp,
        portfolioValue: cumulativeValue,
        pnl: cumulativePnL,
        invested: cumulativeInvested,
        returns: cumulativeInvested > 0 ? (cumulativePnL / cumulativeInvested) * 100 : 0,
        opinion: opinion.question.substring(0, 50) + (opinion.question.length > 50 ? '...' : ''),
        opinionCount: index + 1,
      };
    });

    // Category allocation data
    const categoryMap = new Map<string, { value: number, pnl: number, count: number }>();
    filteredOpinions.forEach(opinion => {
      const category = opinion.categories[0] || 'Other';
      const existing = categoryMap.get(category) || { value: 0, pnl: 0, count: 0 };
      categoryMap.set(category, {
        value: existing.value + opinion.currentValue,
        pnl: existing.pnl + opinion.pnl,
        count: existing.count + 1
      });
    });

    const categoryData = Array.from(categoryMap.entries()).map(([name, data], index) => ({
      name,
      value: data.value,
      pnl: data.pnl,
      count: data.count,
      percentage: cumulativeValue > 0 ? (data.value / cumulativeValue) * 100 : 0,
      color: COLORS[index % COLORS.length]
    }));

    // Performance data (wins vs losses)
    const winners = filteredOpinions.filter(op => op.pnl > 0);
    const losers = filteredOpinions.filter(op => op.pnl < 0);
    const breakeven = filteredOpinions.filter(op => op.pnl === 0);

    const performanceData = [
      {
        name: 'Winners',
        count: winners.length,
        value: winners.reduce((sum, op) => sum + op.pnl, 0),
        percentage: filteredOpinions.length > 0 ? (winners.length / filteredOpinions.length) * 100 : 0,
        color: '#10b981'
      },
      {
        name: 'Losers',
        count: losers.length,
        value: Math.abs(losers.reduce((sum, op) => sum + op.pnl, 0)),
        percentage: filteredOpinions.length > 0 ? (losers.length / filteredOpinions.length) * 100 : 0,
        color: '#ef4444'
      },
      {
        name: 'Breakeven',
        count: breakeven.length,
        value: 0,
        percentage: filteredOpinions.length > 0 ? (breakeven.length / filteredOpinions.length) * 100 : 0,
        color: '#6b7280'
      }
    ];

    return { timeline, categoryData, performanceData };
  }, [opinions, selectedTimeFrame]);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Enhanced Portfolio Analytics</h2>
          </div>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-full h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {chartType === 'portfolio' && (
            <>
              <p className="text-emerald-400 text-sm">
                Portfolio Value: {formatUSDC(data.portfolioValue)}
              </p>
              <p className="text-blue-400 text-sm">
                Total Invested: {formatUSDC(data.invested)}
              </p>
              <p className={`text-sm ${data.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                P&L: {formatUSDC(data.pnl)}
              </p>
              <p className="text-gray-400 text-sm">
                Returns: {formatPercentage(data.returns)}
              </p>
            </>
          )}
          {chartType === 'pnl' && (
            <>
              <p className={`text-sm ${data.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                P&L: {formatUSDC(data.pnl)}
              </p>
              <p className="text-gray-400 text-sm">
                Returns: {formatPercentage(data.returns)}
              </p>
            </>
          )}
          <p className="text-gray-400 text-xs mt-2">
            Positions: {data.opinionCount}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'portfolio':
        return (
          <AreaChart data={chartData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={1}
            />
          </AreaChart>
        );

      case 'pnl':
        return (
          <LineChart data={chartData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="returns"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'allocation':
        return (
          <div className="flex items-center justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={chartData.categoryData}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [formatUSDC(value), 'Value']} />
            </PieChart>
          </div>
        );

      case 'performance':
        return (
          <BarChart data={chartData.performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip formatter={(value: any) => [value, 'Count']} />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        {/* Header with controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-xl font-bold text-white">Enhanced Portfolio Analytics</h2>
          
          {/* Time Frame Selector */}
          <div className="flex items-center space-x-2">
            {(['7d', '30d', '90d', 'all'] as TimeFrame[]).map((timeFrame) => (
              <Button
                key={timeFrame}
                variant={selectedTimeFrame === timeFrame ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeFrame(timeFrame)}
                className={`${selectedTimeFrame === timeFrame 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-transparent border-gray-600 hover:bg-gray-700'
                }`}
              >
                {timeFrame === 'all' ? 'All Time' : timeFrame.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart Type Tabs */}
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)} className="w-full">
          <TabsList className="glass-card grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="pnl" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Returns</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4" />
              <span>Allocation</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
          </TabsList>

          {/* Chart Content */}
          <div className="h-80">
            {(() => {
              const chart = chartData.timeline.length > 0 ? renderChart() : null;
              return chart ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chart}
                </ResponsiveContainer>
              ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No data for this time period</p>
                  <p className="text-gray-500 text-sm">
                    Try selecting a different time frame or start trading!
                  </p>
                </div>
              </div>
              );
            })()}
          </div>
        </Tabs>

        {/* Quick Stats Below Chart */}
        {chartData.timeline.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700/40">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {chartData.timeline[chartData.timeline.length - 1]?.portfolioValue 
                  ? formatUSDC(chartData.timeline[chartData.timeline.length - 1].portfolioValue)
                  : '$0.00'
                }
              </div>
              <div className="text-sm text-gray-400">Portfolio Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                chartData.timeline[chartData.timeline.length - 1]?.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {chartData.timeline[chartData.timeline.length - 1]?.pnl 
                  ? formatUSDC(chartData.timeline[chartData.timeline.length - 1].pnl)
                  : '$0.00'
                }
              </div>
              <div className="text-sm text-gray-400">Total P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {chartData.performanceData[0]?.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {chartData.timeline.length}
              </div>
              <div className="text-sm text-gray-400">Total Positions</div>
            </div>
          </div>
        )}

        {/* Category Breakdown - Only show for allocation chart */}
        {chartType === 'allocation' && chartData.categoryData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700/40">
            <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="text-white font-medium">{category.name}</div>
                      <div className="text-gray-400 text-sm">{category.count} positions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatUSDC(category.value)}</div>
                    <div className="text-gray-400 text-sm">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}