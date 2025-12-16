'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, X } from 'lucide-react';

interface UserRankBadgeProps {
  userAddress: string;
}

// Mock function to find user's rank - will be replaced with real data
const findUserRank = (address: string): { rank: number; totalEarnings: number; roi: number } | null => {
  // Mock data - in real implementation, this would query the actual leaderboard data
  const mockUserData = {
    '0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3': { rank: 12, totalEarnings: 1847.50, roi: 24.3 },
    // Add more mock addresses as needed
  };
  
  const normalizedAddress = address.toLowerCase();
  const found = Object.entries(mockUserData).find(([addr]) => 
    addr.toLowerCase() === normalizedAddress
  );
  
  if (found) {
    return found[1];
  }
  
  // Generate random rank for demo purposes
  return {
    rank: Math.floor(Math.random() * 100) + 1,
    totalEarnings: Math.random() * 2000,
    roi: (Math.random() - 0.3) * 100 // -30% to 70% range
  };
};

export function UserRankBadge({ userAddress }: UserRankBadgeProps) {
  const [userRank, setUserRank] = useState<{ rank: number; totalEarnings: number; roi: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (userAddress) {
      const rankData = findUserRank(userAddress);
      setUserRank(rankData);
    }
  }, [userAddress]);

  if (!userRank || !isVisible) {
    return null;
  }

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

  const getRankColor = (rank: number): string => {
    if (rank <= 10) return 'from-yellow-500 to-orange-500';
    if (rank <= 25) return 'from-gray-400 to-gray-600';
    if (rank <= 50) return 'from-orange-500 to-red-500';
    return 'from-blue-500 to-purple-500';
  };

  const getRankText = (rank: number): string => {
    if (rank <= 10) return 'Top 10!';
    if (rank <= 25) return 'Top 25';
    if (rank <= 50) return 'Top 50';
    return `Rank #${rank}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full bg-gradient-to-r ${getRankColor(userRank.rank)}`}>
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                Your Rank
              </div>
              <div className={`text-lg font-bold bg-gradient-to-r ${getRankColor(userRank.rank)} bg-clip-text text-transparent`}>
                {getRankText(userRank.rank)}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Earnings</div>
            <div className="font-medium text-white">
              {formatUSDC(userRank.totalEarnings)}
            </div>
          </div>
          <div>
            <div className="text-gray-400">ROI</div>
            <div className={`font-medium flex items-center space-x-1 ${
              userRank.roi >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className="w-3 h-3" />
              <span>{formatROI(userRank.roi)}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            Keep trading to climb the ranks! 🚀
          </div>
        </div>
      </div>
    </div>
  );
}