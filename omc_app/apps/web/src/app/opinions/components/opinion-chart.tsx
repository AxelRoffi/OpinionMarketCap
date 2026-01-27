import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { PricePoint } from '../types/opinion-types';

interface OpinionChartProps {
  data: PricePoint[];
  currentPrice: number;
}

export function OpinionChart({ data, currentPrice }: OpinionChartProps) {
  const [chartType, setChartType] = useState<'price' | 'volume'>('price');
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('7d');

  // Filter data based on time range
  const filteredData = data.filter(point => {
    const now = Date.now();
    switch (timeRange) {
      case '1d':
        return now - point.timestamp <= 24 * 60 * 60 * 1000;
      case '7d':
        return now - point.timestamp <= 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return now - point.timestamp <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  // Transform real data for charting
  const chartData = filteredData.length > 0 ? filteredData.map(point => ({
    timestamp: point.timestamp,
    time: new Date(point.timestamp).toLocaleDateString(),
    price: point.price,
    volume: point.volume,
  })) : [];
  
  const hasRealData = chartData.length > 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-foreground font-semibold">
            {chartType === 'price' ? `$${payload[0].value.toFixed(2)}` : `${payload[0].value} vol`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4 sm:mb-0">
          {chartType === 'price' ? 'Price History' : 'Volume History'}
        </h2>

        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('price')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'price'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Price</span>
            </button>
            <button
              onClick={() => setChartType('volume')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'volume'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Volume</span>
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            {(['1d', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {hasRealData ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'price' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-muted-foreground mb-2">No Historical Data Available</h4>
              <p className="text-muted-foreground/70 text-sm">
                {chartType === 'price' ? 'Price history' : 'Volume history'} will appear here once trading begins.
              </p>
              <p className="text-muted-foreground/50 text-xs mt-2">
                Current price: ${currentPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Statistics */}
      {hasRealData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Current</div>
            <div className="text-foreground font-semibold">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Period High</div>
            <div className="text-foreground font-semibold">
              ${Math.max(...chartData.map(d => d.price)).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Period Low</div>
            <div className="text-foreground font-semibold">
              ${Math.min(...chartData.map(d => d.price)).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Data Points</div>
            <div className="text-foreground font-semibold">
              {chartData.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}