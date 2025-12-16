'use client';

import { Users, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';

interface LeaderboardStats {
  totalUsers: number;
  totalVolume: number; // USDC
  totalQuestions: number;
  totalTrades: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

const formatUSDC = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function LeaderboardStats() {
  const { stats, isLoading } = useLeaderboardData();

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-700 animate-pulse">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-gray-700 w-12 h-12"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsConfig = [
    {
      title: 'Total Active Users',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      description: 'Unique traders',
    },
    {
      title: 'Total Volume Traded',
      value: formatUSDC(stats.totalVolume),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      description: 'USDC volume',
    },
    {
      title: 'Total Questions Created',
      value: formatNumber(stats.totalQuestions),
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      description: 'Active opinions',
    },
    {
      title: 'Total Successful Trades',
      value: formatNumber(stats.totalTrades),
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      description: 'Completed transactions',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium text-gray-400 truncate">
                      {stat.title}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}