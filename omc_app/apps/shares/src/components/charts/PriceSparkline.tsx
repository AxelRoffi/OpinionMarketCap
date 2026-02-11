'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip, ReferenceLine } from 'recharts';
import type { PricePoint } from '@/hooks/usePriceHistory';

interface PriceSparklineProps {
  data: PricePoint[];
  isPositive?: boolean;
  height?: number;
  width?: number;
  showGradient?: boolean;
  showAxes?: boolean;
  compact?: boolean;
}

export function PriceSparkline({
  data,
  isPositive = true,
  height = 40,
  width = 100,
  showGradient = true,
  showAxes = false,
  compact = true,
}: PriceSparklineProps) {
  // Format data for recharts
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((point, index) => ({
      index,
      price: point.price,
      label: index === 0 ? 'Start' : index === data.length - 1 ? 'Now' : '',
    }));
  }, [data]);

  // Colors based on trend
  const lineColor = isPositive ? '#10b981' : '#ef4444'; // emerald-500 or red-500
  const gradientColor = isPositive ? '#10b981' : '#ef4444';
  const gridColor = 'rgba(255,255,255,0.1)';

  // Generate unique gradient ID to avoid conflicts
  const gradientId = useMemo(() => `sparklineGradient-${Math.random().toString(36).substr(2, 9)}`, []);

  if (chartData.length < 2) {
    // Not enough data - show placeholder
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-foreground"
        style={{ width, height }}
      >
        <div className="w-full h-[2px] bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  // Calculate Y-axis domain with padding
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 0.1;
  const yDomain = [Math.max(0, minPrice - padding), maxPrice + padding];

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={showAxes ? { top: 5, right: 5, bottom: 20, left: 35 } : { top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={gradientColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {showAxes && (
            <>
              <XAxis
                dataKey="index"
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                tickLine={{ stroke: gridColor }}
                axisLine={{ stroke: gridColor }}
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
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                tickLine={{ stroke: gridColor }}
                axisLine={{ stroke: gridColor }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={32}
              />
              <ReferenceLine y={1} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const price = payload[0].value as number;
                    return (
                      <div className="bg-background/95 border border-border rounded px-2 py-1 text-xs">
                        <span className="font-medium">${price.toFixed(4)}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </>
          )}

          {!showAxes && <YAxis domain={yDomain} hide />}

          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={compact ? 1.5 : 2}
            fill={showGradient ? `url(#${gradientId})` : 'transparent'}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Compact inline sparkline (for tables/lists)
export function PriceSparklineCompact({
  data,
  isPositive = true,
  width = 80,
  height = 24,
}: {
  data: PricePoint[];
  isPositive?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <PriceSparkline
      data={data}
      isPositive={isPositive}
      width={width}
      height={height}
      showGradient={false}
      showAxes={false}
      compact={true}
    />
  );
}

// Simple version for when we don't have real data
export function PriceSparklinePlaceholder({
  height = 40,
  width = 100,
  isPositive = true,
}: {
  height?: number;
  width?: number;
  isPositive?: boolean;
}) {
  // Generate fake sparkline data for visual appeal
  const fakeData = useMemo(() => {
    const points: PricePoint[] = [];
    let price = 1;
    for (let i = 0; i < 20; i++) {
      // Small random walk with slight upward/downward bias
      const change = (Math.random() - (isPositive ? 0.45 : 0.55)) * 0.1;
      price = Math.max(0.5, price + change);
      points.push({ timestamp: Date.now() - (20 - i) * 3600000, price, type: 'initial' });
    }
    return points;
  }, [isPositive]);

  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const gradientId = useMemo(() => `placeholderGradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div style={{ width, height }} className="opacity-50">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={fakeData.map((p, i) => ({ index: i, price: p.price }))} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
