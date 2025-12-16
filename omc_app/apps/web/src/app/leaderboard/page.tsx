'use client';

import { useAccount } from 'wagmi';
import { LeaderboardTable } from './components/LeaderboardTable';
import { LeaderboardStats } from './components/LeaderboardStats';
import { UserRankBadge } from './components/UserRankBadge';

export default function LeaderboardPage() {
  const { address } = useAccount();

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

      {/* Stats Cards */}
      <LeaderboardStats />

      {/* Main Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LeaderboardTable />
      </div>

      {/* User Rank Badge if connected */}
      {address && <UserRankBadge userAddress={address} />}
    </>
  );
}