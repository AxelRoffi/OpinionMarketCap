'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, Trophy, Medal, Award, Info } from 'lucide-react';
import { useEnsName } from 'wagmi';
import { useEnhancedLeaderboardData, LeaderboardUser, LeaderboardFilters, RankingType } from '@/hooks/useLeaderboardData';

// Type for sorting
type SortField = keyof LeaderboardUser;

interface LeaderboardTableProps {
  filters?: LeaderboardFilters;
}

export function LeaderboardTable({ filters }: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>('trueROI');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  const { users: leaderboardUsers, isLoading, allCategories } = useEnhancedLeaderboardData(filters);

  const sortedData = useMemo(() => {
    if (!leaderboardUsers || leaderboardUsers.length === 0) return [];
    
    // Filter by time period (for now, show all data - time filtering will be enhanced later)
    const filteredUsers = [...leaderboardUsers];
    
    // TODO: Implement actual time-based filtering when we have timestamp data
    // For MVP, we'll show all users but could filter by recent activity patterns
    
    const sorted = filteredUsers.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return 0;
    });

    // Update ranks based on current sort
    return sorted.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }, [leaderboardUsers, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatUSDC = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('$', '') + ' USDC';
  };

  const formatROI = (roi: number): string => {
    const formatted = roi.toFixed(1) + '%';
    return roi >= 0 ? `+${formatted}` : formatted;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Achievement badges based on user stats
  const getAchievementBadges = (user: LeaderboardUser) => {
    const badges = [];
    
    // Top performer badges
    if (user.rank <= 3) badges.push({ icon: '👑', label: 'Elite', color: 'text-yellow-400' });
    else if (user.rank <= 10) badges.push({ icon: '🏆', label: 'Top 10', color: 'text-orange-400' });
    else if (user.rank <= 25) badges.push({ icon: '🥈', label: 'Top 25', color: 'text-gray-400' });
    
    // Volume badges
    if (user.totalEarnings > 1000) badges.push({ icon: '🔥', label: 'High Earner', color: 'text-red-400' });
    else if (user.totalEarnings > 100) badges.push({ icon: '💰', label: 'Profitable', color: 'text-green-400' });
    
    // Activity badges
    if (user.questionsCreated >= 10) badges.push({ icon: '🎯', label: 'Creator', color: 'text-purple-400' });
    if (user.tradesCount >= 50) badges.push({ icon: '📈', label: 'Active Trader', color: 'text-blue-400' });
    
    // ROI badge
    if (user.trueROI > 10) badges.push({ icon: '💎', label: 'High ROI', color: 'text-cyan-400' });
    
    return badges.slice(0, 2); // Show max 2 badges to avoid clutter
  };

  // Component for ENS name resolution with badges
  const UserDisplayName = ({ address, user }: { address: string; user: LeaderboardUser }) => {
    const { data: ensName } = useEnsName({
      address: address as `0x${string}`,
      query: {
        staleTime: 300000, // Cache for 5 minutes
        enabled: Boolean(address) && address.startsWith('0x'),
      },
    });

    const badges = getAchievementBadges(user);

    return (
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/profile?address=${address}`)}
            className="text-sm font-medium text-white hover:text-blue-400 transition-colors cursor-pointer text-left"
          >
            {ensName || formatAddress(address)}
          </button>
          <div className="flex items-center space-x-1">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium ${badge.color} bg-gray-700 border border-gray-600`}
                title={badge.label}
              >
                <span>{badge.icon}</span>
              </div>
            ))}
          </div>
        </div>
        {ensName && (
          <button
            onClick={() => router.push(`/profile?address=${address}`)}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors cursor-pointer text-left"
          >
            {formatAddress(address)}
          </button>
        )}
      </div>
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankRowClass = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-yellow-900/20 border-l-4 border-yellow-400';
      case 2:
        return 'bg-gray-800/50 border-l-4 border-gray-400';
      case 3:
        return 'bg-orange-900/20 border-l-4 border-orange-400';
      default:
        return 'hover:bg-gray-700';
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-500' : 'text-gray-400'}`} 
          />
          <ChevronDown 
            className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-500' : 'text-gray-400'}`} 
          />
        </div>
      </div>
    </th>
  );

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Questions</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Opinions</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creator Fees</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trading Fees</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Earnings</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TVL</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creation Costs</th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>True ROI</span>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trades</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-4 bg-gray-600 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-4 bg-gray-600 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Show empty state if no users
  if (!leaderboardUsers || leaderboardUsers.length === 0) {
    return (
      <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No leaderboard data</h3>
          <p className="mt-1 text-sm text-gray-400">
            Start trading to see users appear on the leaderboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <SortableHeader field="rank">Rank</SortableHeader>
              <SortableHeader field="address">User</SortableHeader>
              <SortableHeader field="questionsCreated">Questions</SortableHeader>
              <SortableHeader field="opinionsOwned">Opinions</SortableHeader>
              <SortableHeader field="creatorFees">Creator Fees</SortableHeader>
              <SortableHeader field="tradingFees">Trading Fees</SortableHeader>
              <SortableHeader field="totalEarnings">Total Earnings</SortableHeader>
              <SortableHeader field="tvl">TVL</SortableHeader>
              <SortableHeader field="creationCosts">Creation Costs</SortableHeader>
              <SortableHeader field="trueROI">
                <div className="flex items-center space-x-1">
                  <span>True ROI</span>
                  <div className="group relative">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                      ROI = (Total Earnings ÷ Volume Generated) × 100%
                      <br />
                      Excludes TVL (unrealized) & creation costs
                    </div>
                  </div>
                </div>
              </SortableHeader>
              <SortableHeader field="tradesCount">Trades</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedData.map((user) => (
              <tr key={user.address} className={getRankRowClass(user.rank)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(user.rank)}
                    <span className="text-sm font-medium text-white">
                      #{user.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserDisplayName address={user.address} user={user} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.questionsCreated.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.opinionsOwned.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                  {formatUSDC(user.creatorFees)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                  {formatUSDC(user.tradingFees)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">
                  {formatUSDC(user.totalEarnings)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                  {formatUSDC(user.tvl)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-400">
                  -{formatUSDC(user.creationCosts)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={user.trueROI >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatROI(user.trueROI)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.tradesCount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}