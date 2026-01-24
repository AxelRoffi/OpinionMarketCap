'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useAllOpinions } from '@/hooks/useAllOpinions';
import { useEnhancedLeaderboardData } from '@/hooks/useLeaderboardData';
import { useWatchlist } from '@/hooks/useWatchlist';
import {
  BadgeDefinition,
  BADGES,
  getTotalXP,
  getLevelFromXP,
  BadgeCategory,
} from './badges/badgeDefinitions';
import {
  UserStats,
  getEarnedBadges,
  getAllBadgesWithProgress,
  getNextAchievableBadges,
  getDefaultUserStats,
  BadgeProgress,
} from './badges/badgeLogic';

// Storage key for badge-related data
const BADGE_STORAGE_PREFIX = 'omc_badges_';
const SHARES_STORAGE_PREFIX = 'omc_shares_';

interface StoredBadgeData {
  earnedBadgeIds: string[];
  lastSeenBadgeIds: string[];
  firstSeenTimestamp: number;
  sharesCount: number;
}

interface UseBadgesReturn {
  // Badge state
  earnedBadges: BadgeDefinition[];
  allBadgesWithProgress: BadgeProgress[];
  nextAchievableBadges: BadgeProgress[];
  newlyEarnedBadges: BadgeDefinition[];

  // User stats
  userStats: UserStats;
  totalXP: number;
  level: { level: number; title: string; xpForNext: number; progress: number };

  // Actions
  clearNewBadges: () => void;
  incrementShareCount: () => void;

  // Computed
  earnedCount: number;
  totalCount: number;
  isLoading: boolean;
}

export function useBadges(): UseBadgesReturn {
  const { address } = useAccount();
  const { opinions, isLoading: isLoadingOpinions } = useAllOpinions();
  const { users: leaderboardUsers, isLoading: isLoadingLeaderboard } = useEnhancedLeaderboardData();
  const { getWatchlistCount } = useWatchlist();

  const [storedData, setStoredData] = useState<StoredBadgeData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate storage key for current user
  const getStorageKey = useCallback(() => {
    return address
      ? `${BADGE_STORAGE_PREFIX}${address.toLowerCase()}`
      : `${BADGE_STORAGE_PREFIX}anonymous`;
  }, [address]);

  // Load stored badge data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = getStorageKey();
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStoredData(parsed);
      } catch (error) {
        console.error('Error parsing stored badge data:', error);
        setStoredData(null);
      }
    } else {
      // Initialize new user data
      setStoredData({
        earnedBadgeIds: [],
        lastSeenBadgeIds: [],
        firstSeenTimestamp: Date.now(),
        sharesCount: 0,
      });
    }
    setIsInitialized(true);
  }, [address, getStorageKey]);

  // Save badge data to localStorage
  const saveStoredData = useCallback((data: StoredBadgeData) => {
    if (typeof window === 'undefined') return;
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
    setStoredData(data);
  }, [getStorageKey]);

  // Calculate user stats from blockchain data
  const userStats = useMemo((): UserStats => {
    if (!address || !isInitialized) return getDefaultUserStats();

    const userAddress = address.toLowerCase();
    const defaultStats = getDefaultUserStats();

    // Override with stored first seen timestamp
    if (storedData?.firstSeenTimestamp) {
      defaultStats.firstSeenTimestamp = storedData.firstSeenTimestamp;
    }

    // Calculate stats from opinions
    let tradesCount = 0;
    let totalVolume = 0;
    let opinionsCreated = 0;
    let creatorFeesEarned = 0;
    let highestSingleOpinionVolume = 0;

    opinions?.forEach((opinion) => {
      const creator = opinion.creator?.toLowerCase();
      const owner = opinion.currentAnswerOwner?.toLowerCase();
      const volume = opinion.totalVolume ? Number(opinion.totalVolume) / 1e6 : 0;

      // Count if user is creator
      if (creator === userAddress) {
        opinionsCreated++;
        // Creator fees: 3% of volume
        creatorFeesEarned += volume * 0.03;
        highestSingleOpinionVolume = Math.max(highestSingleOpinionVolume, volume);
      }

      // Count trades (if user is current owner or was creator)
      if (owner === userAddress || creator === userAddress) {
        tradesCount++;
        totalVolume += volume;
      }
    });

    // Get leaderboard rank
    let leaderboardRank: number | null = null;
    let bestCategoryRank: number | null = null;

    const currentUser = leaderboardUsers?.find(
      (u) => u.address.toLowerCase() === userAddress
    );

    if (currentUser) {
      leaderboardRank = currentUser.rank;
      // For now, use the same rank for category (could be enhanced later)
      bestCategoryRank = currentUser.rank;
    }

    // Get watchlist count
    const watchlistCount = getWatchlistCount();

    // Get shares count from stored data
    const sharesCount = storedData?.sharesCount || 0;

    return {
      ...defaultStats,
      tradesCount,
      totalVolume,
      totalProfit: creatorFeesEarned, // Simplified - could be enhanced
      opinionsCreated,
      creatorFeesEarned,
      highestSingleOpinionVolume,
      leaderboardRank,
      bestCategoryRank,
      watchlistCount,
      sharesCount,
    };
  }, [address, opinions, leaderboardUsers, storedData, isInitialized, getWatchlistCount]);

  // Calculate earned badges
  const earnedBadges = useMemo(() => {
    return getEarnedBadges(userStats);
  }, [userStats]);

  // Calculate all badges with progress
  const allBadgesWithProgress = useMemo(() => {
    return getAllBadgesWithProgress(userStats);
  }, [userStats]);

  // Calculate next achievable badges
  const nextAchievableBadges = useMemo(() => {
    return getNextAchievableBadges(userStats, 3);
  }, [userStats]);

  // Detect newly earned badges (not in lastSeen)
  const newlyEarnedBadges = useMemo(() => {
    if (!storedData) return [];

    const currentEarnedIds = earnedBadges.map((b) => b.id);
    const lastSeenIds = new Set(storedData.lastSeenBadgeIds);

    return earnedBadges.filter((badge) => !lastSeenIds.has(badge.id));
  }, [earnedBadges, storedData]);

  // Update stored earned badges when they change
  useEffect(() => {
    if (!storedData || !isInitialized) return;

    const currentEarnedIds = earnedBadges.map((b) => b.id);
    const storedEarnedIds = new Set(storedData.earnedBadgeIds);

    // Check if there are new badges
    const hasNewBadges = currentEarnedIds.some((id) => !storedEarnedIds.has(id));

    if (hasNewBadges) {
      saveStoredData({
        ...storedData,
        earnedBadgeIds: currentEarnedIds,
      });
    }
  }, [earnedBadges, storedData, isInitialized, saveStoredData]);

  // Clear newly earned badges (mark as seen)
  const clearNewBadges = useCallback(() => {
    if (!storedData) return;

    const currentEarnedIds = earnedBadges.map((b) => b.id);
    saveStoredData({
      ...storedData,
      lastSeenBadgeIds: currentEarnedIds,
    });
  }, [earnedBadges, storedData, saveStoredData]);

  // Increment share count (called when user shares an opinion)
  const incrementShareCount = useCallback(() => {
    if (!storedData) return;

    saveStoredData({
      ...storedData,
      sharesCount: (storedData.sharesCount || 0) + 1,
    });
  }, [storedData, saveStoredData]);

  // Calculate XP and level
  const totalXP = useMemo(() => {
    return getTotalXP(earnedBadges.map((b) => b.id));
  }, [earnedBadges]);

  const level = useMemo(() => {
    return getLevelFromXP(totalXP);
  }, [totalXP]);

  return {
    earnedBadges,
    allBadgesWithProgress,
    nextAchievableBadges,
    newlyEarnedBadges,
    userStats,
    totalXP,
    level,
    clearNewBadges,
    incrementShareCount,
    earnedCount: earnedBadges.length,
    totalCount: BADGES.length,
    isLoading: isLoadingOpinions || isLoadingLeaderboard || !isInitialized,
  };
}

// Helper hook to get badges by category
export function useBadgesByCategory(category?: BadgeCategory): BadgeProgress[] {
  const { allBadgesWithProgress } = useBadges();

  return useMemo(() => {
    if (!category) return allBadgesWithProgress;
    return allBadgesWithProgress.filter((bp) => bp.badge.category === category);
  }, [allBadgesWithProgress, category]);
}
