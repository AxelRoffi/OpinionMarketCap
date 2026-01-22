'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { LeaderboardTable } from './components/LeaderboardTable';
import { LeaderboardStats } from './components/LeaderboardStats';
import { LeaderboardFilters, RankingType, TimePeriod } from './components/LeaderboardFilters';
import { UserRankBadge } from './components/UserRankBadge';
import { LeaderboardFilters as FilterType } from '@/hooks/useLeaderboardData';

export default function LeaderboardPage() {
  const { address } = useAccount();

  // Filter state
  const [category, setCategory] = useState<string>('all');
  const [rankingType, setRankingType] = useState<RankingType>('earnings');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  // Build filters object for the hook
  const filters: FilterType = {
    category: category,
    rankingType: rankingType,
  };

  return (
    <>
      {/* Header - matching opinions page style */}
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Leaderboard
              </h1>
              <p className="mt-2 text-gray-400">
                Top performers on OpinionMarketCap - Track the most successful traders and creators
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-sm text-gray-400">
                Rankings updated in real-time
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <LeaderboardFilters
        category={category}
        rankingType={rankingType}
        timePeriod={timePeriod}
        onCategoryChange={setCategory}
        onRankingTypeChange={setRankingType}
        onTimePeriodChange={setTimePeriod}
      />

      {/* Stats Cards */}
      <LeaderboardStats filters={filters} />

      {/* Main Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LeaderboardTable filters={filters} />
      </div>

      {/* User Rank Badge if connected */}
      {address && <UserRankBadge userAddress={address} />}
    </>
  );
}