import { 
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

// Helper function to calculate percentage change from historical data
function calculateMetricChange(history: Array<{timestamp: number, price: number, volume: number}>, currentValue: number, metricType: 'volume' | 'trades'): { change: string; changeType: 'positive' | 'negative' | 'neutral' } {
  if (history.length < 2) {
    return { change: 'New', changeType: 'neutral' };
  }

  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const recentHistory = history.filter(h => h.timestamp >= oneDayAgo);
  
  if (recentHistory.length === 0) {
    return { change: 'No recent data', changeType: 'neutral' };
  }

  const oldestRecent = recentHistory[0];
  let previousValue: number;
  
  if (metricType === 'volume') {
    previousValue = oldestRecent.volume;
  } else {
    // For trades, we count entries before vs after
    const oldEntries = history.filter(h => h.timestamp < oneDayAgo).length;
    previousValue = oldEntries;
  }

  if (previousValue === 0) {
    return { change: 'New', changeType: 'positive' };
  }

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  const changeType = percentageChange > 0 ? 'positive' : percentageChange < 0 ? 'negative' : 'neutral';
  const changeStr = percentageChange > 0 ? `+${percentageChange.toFixed(1)}%` : `${percentageChange.toFixed(1)}%`;
  
  return { change: changeStr, changeType };
}

export function OpinionStatsComponent({ stats, currentPrice, totalVolume, loading }: OpinionStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
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

  // Calculate real changes from historical data
  const volumeChange = calculateMetricChange(stats.volumeHistory, totalVolume, 'volume');
  const tradesChange = calculateMetricChange(stats.volumeHistory, stats.totalTrades, 'trades');
  
  const statCards = [
    {
      title: 'Total Volume',
      value: `$${totalVolume.toLocaleString()}`,
      icon: DollarSign,
      change: volumeChange.change,
      changeType: volumeChange.changeType,
      description: 'Total trading volume'
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: ArrowUpDown,
      change: tradesChange.change,
      changeType: tradesChange.changeType,
      description: 'Answer changes'
    },
    {
      title: 'Price Range',
      value: `$${stats.priceRange.min.toFixed(2)} - $${stats.priceRange.max.toFixed(2)}`,
      icon: BarChart3,
      change: stats.priceRange.min > 0 ? `${((stats.priceRange.max - stats.priceRange.min) / stats.priceRange.min * 100).toFixed(1)}% range` : 'New',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      description: 'Min - Max price'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

  // Calculate time span of trading activity
  const timeSpan = stats.volumeHistory.length > 0 
    ? Math.max(1, (Date.now() - Math.min(...stats.volumeHistory.map(h => h.timestamp))) / (1000 * 60 * 60 * 24))
    : 1;

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Market Price</span>
            <span className="text-white font-medium">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Historical Price</span>
            <span className="text-white font-medium">${avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price Volatility</span>
            <span className="text-white font-medium">{volatility.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Trading Volume</span>
            <span className="text-white font-medium">${totalVolume.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Answer Changes</span>
            <span className="text-white font-medium">{stats.totalTrades}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Unique Participants</span>
            <span className="text-white font-medium">{stats.uniqueHolders}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Trading Activity Period</span>
            <span className="text-white font-medium">
              {timeSpan.toFixed(0)} day{timeSpan !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price Range</span>
            <span className="text-white font-medium">
              ${stats.priceRange.min.toFixed(2)} - ${stats.priceRange.max.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}