'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useTotalMarketCapHistory } from '@/hooks/useTotalMarketCapHistory';
import { formatUSDC } from '@/lib/utils';

interface TotalMarketCapChartProps {
  answerIds: bigint[];
  currentTotalMarketCap: bigint;
  height?: number;
}

export function TotalMarketCapChart({
  answerIds,
  currentTotalMarketCap,
  height = 200,
}: TotalMarketCapChartProps) {
  const {
    history,
    isLoading,
    currentMarketCap,
    allTimeHigh,
    allTimeLow,
    changePercent,
    isPositive,
  } = useTotalMarketCapHistory(answerIds, currentTotalMarketCap);

  // Format data for recharts
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    return history.map((point, index) => ({
      index,
      value: point.totalMarketCap,
      label: index === 0 ? 'Start' : index === history.length - 1 ? 'Now' : '',
    }));
  }, [history]);

  // Colors based on trend
  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const gradientId = useMemo(
    () => `totalMarketCapGradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // Calculate Y-axis domain with padding
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 10];
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Total Market Cap
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatUSDC(currentTotalMarketCap)}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
            isPositive
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {changePercent >= 0 ? '+' : ''}
          {changePercent.toFixed(1)}%
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="index"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(value) => {
                if (value === 0) return 'Start';
                if (value === chartData.length - 1) return 'Now';
                return '';
              }}
              interval={0}
              ticks={[0, chartData.length - 1]}
            />

            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              width={35}
            />

            <ReferenceLine
              y={allTimeHigh}
              stroke="rgba(16, 185, 129, 0.3)"
              strokeDasharray="3 3"
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  return (
                    <div className="bg-background/95 border border-border rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-xs text-muted-foreground mb-1">
                        Total Market Cap
                      </div>
                      <div className="text-sm font-bold text-emerald-400">
                        ${value.toFixed(2)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2">
        <div>
          <span className="text-muted-foreground/60">ATH:</span>{' '}
          <span className="text-foreground">${allTimeHigh.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-muted-foreground/60">ATL:</span>{' '}
          <span className="text-foreground">${allTimeLow.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-muted-foreground/60">Events:</span>{' '}
          <span className="text-foreground">{Math.max(0, history.length - 1)}</span>
        </div>
      </div>
    </div>
  );
}
