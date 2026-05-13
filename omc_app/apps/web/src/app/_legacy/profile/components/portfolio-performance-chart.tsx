'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserOpinion, formatUSDC } from '../hooks/use-user-profile';

interface PortfolioPerformanceChartProps {
  opinions: UserOpinion[];
  loading: boolean;
}

export function PortfolioPerformanceChart({ opinions, loading }: PortfolioPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!opinions.length) return [];

    // Sort opinions by timestamp
    const sortedOpinions = [...opinions].sort((a, b) => a.timestamp - b.timestamp);
    
    let cumulativeValue = 0;
    let cumulativePnL = 0;
    
    const data = sortedOpinions.map((opinion) => {
      cumulativeValue += opinion.currentValue;
      cumulativePnL += opinion.pnl;
      
      return {
        date: new Date(opinion.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: opinion.timestamp,
        portfolioValue: cumulativeValue,
        pnl: cumulativePnL,
        opinion: opinion.question.substring(0, 50) + (opinion.question.length > 50 ? '...' : ''),
      };
    });

    return data;
  }, [opinions]);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Portfolio Performance</h2>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-full h-40 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Portfolio Performance</h2>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">No performance data yet</p>
            <p className="text-gray-500 text-sm">
              Start trading opinions to see your portfolio performance!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { portfolioValue: number; pnl: number; opinion: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-emerald-400 text-sm">
            Portfolio Value: {formatUSDC(payload[0].payload.portfolioValue)}
          </p>
          <p className={`text-sm ${payload[0].payload.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            P&L: {formatUSDC(payload[0].payload.pnl)}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            {payload[0].payload.opinion}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Portfolio Performance</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">Portfolio Value</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}