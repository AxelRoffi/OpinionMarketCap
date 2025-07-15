import { 
  Users, 
  BarChart3,
  DollarSign,
  ArrowUpDown
} from 'lucide-react';
import { OpinionStats } from '../types/opinion-types';

interface OpinionStatsProps {
  stats: OpinionStats;
  currentPrice: number;
  totalVolume: number;
  loading?: boolean;
}

export function OpinionStatsComponent({ stats, totalVolume, loading }: OpinionStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded"></div>
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-8 bg-gray-600 rounded"></div>
              <div className="w-16 h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Volume',
      value: `$${totalVolume.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive' as const,
      description: 'Total trading volume'
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: ArrowUpDown,
      change: '+3',
      changeType: 'positive' as const,
      description: 'Answer changes'
    },
    {
      title: 'Unique Holders',
      value: stats.uniqueHolders.toString(),
      icon: Users,
      change: '+1',
      changeType: 'positive' as const,
      description: 'Different participants'
    },
    {
      title: 'Price Range',
      value: `$${stats.priceRange.min.toFixed(2)} - $${stats.priceRange.max.toFixed(2)}`,
      icon: BarChart3,
      change: `${((stats.priceRange.max - stats.priceRange.min) / stats.priceRange.min * 100).toFixed(1)}%`,
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      description: 'Min - Max price'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stat.changeType === 'positive' 
                ? 'bg-emerald-600/20 text-emerald-400'
                : stat.changeType === 'negative'
                ? 'bg-red-600/20 text-red-400'
                : 'bg-blue-600/20 text-blue-400'
            }`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className={`text-sm font-medium ${
              stat.changeType === 'positive' 
                ? 'text-emerald-400'
                : stat.changeType === 'negative'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}>
              {stat.change}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">
              {stat.title}
            </div>
            <div className="text-gray-500 text-xs">
              {stat.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Additional detailed stats component
export function DetailedStats({ stats, currentPrice, totalVolume }: OpinionStatsProps) {
  const avgPrice = stats.volumeHistory.length > 0 
    ? stats.volumeHistory.reduce((sum, point) => sum + point.price, 0) / stats.volumeHistory.length
    : currentPrice;

  const volatility = stats.priceRange.max > 0 
    ? ((stats.priceRange.max - stats.priceRange.min) / stats.priceRange.max * 100)
    : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Price</span>
            <span className="text-white font-medium">${avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price Volatility</span>
            <span className="text-white font-medium">{volatility.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Market Cap</span>
            <span className="text-white font-medium">${(currentPrice * stats.totalTrades).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Trading Frequency</span>
            <span className="text-white font-medium">
              {stats.totalTrades > 0 ? (stats.totalTrades / 7).toFixed(1) : 0} trades/week
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Avg. Trade Size</span>
            <span className="text-white font-medium">
              ${stats.totalTrades > 0 ? (totalVolume / stats.totalTrades).toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Holder Distribution</span>
            <span className="text-white font-medium">
              {stats.uniqueHolders > 0 ? (100 / stats.uniqueHolders).toFixed(1) : 0}% avg. ownership
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}