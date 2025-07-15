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

  // Generate sample data if no real data available
  const chartData = filteredData.length > 0 ? filteredData.map(point => ({
    timestamp: point.timestamp,
    time: new Date(point.timestamp).toLocaleDateString(),
    price: point.price,
    volume: point.volume,
  })) : [
    { timestamp: Date.now() - 86400000, time: '1d ago', price: currentPrice * 0.95, volume: 1000 },
    { timestamp: Date.now() - 43200000, time: '12h ago', price: currentPrice * 0.98, volume: 1500 },
    { timestamp: Date.now() - 21600000, time: '6h ago', price: currentPrice * 1.02, volume: 2000 },
    { timestamp: Date.now(), time: 'Now', price: currentPrice, volume: 1800 },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{label}</p>
          <p className="text-white font-semibold">
            {chartType === 'price' ? `$${payload[0].value.toFixed(2)}` : `${payload[0].value} vol`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white mb-4 sm:mb-0">
          {chartType === 'price' ? 'Price History' : 'Volume History'}
        </h2>
        
        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('price')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'price' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-300 hover:text-white'
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
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Volume</span>
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(['1d', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
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
      </div>

      {/* Chart Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-gray-400 text-sm">Current</div>
          <div className="text-white font-semibold">
            ${currentPrice.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">24h High</div>
          <div className="text-white font-semibold">
            ${Math.max(...chartData.map(d => d.price)).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">24h Low</div>
          <div className="text-white font-semibold">
            ${Math.min(...chartData.map(d => d.price)).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">Volume</div>
          <div className="text-white font-semibold">
            {chartData.reduce((acc, d) => acc + d.volume, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}