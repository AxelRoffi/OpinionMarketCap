// Badge Logic - Functions to check if a user has earned a badge
import { BadgeDefinition, BADGES } from './badgeDefinitions';

// User stats interface - data needed to check badge eligibility
export interface UserStats {
  // Trading stats
  tradesCount: number;
  totalVolume: number; // in USDC
  totalProfit: number; // in USDC
  longestHoldDays: number;

  // Creation stats
  opinionsCreated: number;
  creatorFeesEarned: number; // in USDC
  highestSingleOpinionVolume: number; // in USDC

  // Community stats
  poolsCreated: number;
  poolsContributed: number;
  poolContributionTotal: number; // in USDC
  sharesCount: number;
  watchlistCount: number;

  // Leaderboard stats
  leaderboardRank: number | null; // null if not ranked
  bestCategoryRank: number | null;
  rankImprovementWeek: number; // positive = improved

  // Account stats
  firstSeenTimestamp: number; // Unix timestamp
}

// Check if a single badge is earned
export function checkBadgeEarned(badge: BadgeDefinition, stats: UserStats): boolean {
  const { type, value, unit } = badge.requirement;

  switch (type) {
    // Trading badges
    case 'trades_count':
      return stats.tradesCount >= value;
    case 'total_volume':
      return stats.totalVolume >= value;
    case 'total_profit':
      return stats.totalProfit >= value;
    case 'hold_days':
      return stats.longestHoldDays >= value;

    // Creation badges
    case 'opinions_created':
      return stats.opinionsCreated >= value;
    case 'creator_fees':
      return stats.creatorFeesEarned >= value;
    case 'single_opinion_volume':
      return stats.highestSingleOpinionVolume >= value;

    // Community badges
    case 'pools_created':
      return stats.poolsCreated >= value;
    case 'pools_contributed':
      return stats.poolsContributed >= value;
    case 'pool_contribution_total':
      return stats.poolContributionTotal >= value;
    case 'shares_count':
      return stats.sharesCount >= value;
    case 'watchlist_count':
      return stats.watchlistCount >= value;
    case 'join_date':
      // value is in YYYYMMDD format (e.g., 20250401 = April 1, 2025)
      const joinDate = new Date(stats.firstSeenTimestamp);
      const cutoffYear = Math.floor(value / 10000);
      const cutoffMonth = Math.floor((value % 10000) / 100) - 1; // JS months are 0-indexed
      const cutoffDay = value % 100;
      const cutoffDate = new Date(cutoffYear, cutoffMonth, cutoffDay);
      return joinDate < cutoffDate;

    // Leaderboard badges
    case 'leaderboard_rank':
      if (stats.leaderboardRank === null) return false;
      return stats.leaderboardRank <= value;
    case 'category_rank':
      if (stats.bestCategoryRank === null) return false;
      return stats.bestCategoryRank <= value;
    case 'rank_improvement':
      return stats.rankImprovementWeek >= value;

    default:
      return false;
  }
}

// Get all earned badges for a user
export function getEarnedBadges(stats: UserStats): BadgeDefinition[] {
  return BADGES.filter(badge => checkBadgeEarned(badge, stats));
}

// Get all unearned badges with progress
export interface BadgeProgress {
  badge: BadgeDefinition;
  earned: boolean;
  progress: number; // 0-100 percentage
  currentValue: number;
  targetValue: number;
}

export function getBadgeProgress(badge: BadgeDefinition, stats: UserStats): BadgeProgress {
  const { type, value } = badge.requirement;
  let currentValue = 0;

  switch (type) {
    case 'trades_count':
      currentValue = stats.tradesCount;
      break;
    case 'total_volume':
      currentValue = stats.totalVolume;
      break;
    case 'total_profit':
      currentValue = stats.totalProfit;
      break;
    case 'hold_days':
      currentValue = stats.longestHoldDays;
      break;
    case 'opinions_created':
      currentValue = stats.opinionsCreated;
      break;
    case 'creator_fees':
      currentValue = stats.creatorFeesEarned;
      break;
    case 'single_opinion_volume':
      currentValue = stats.highestSingleOpinionVolume;
      break;
    case 'pools_created':
      currentValue = stats.poolsCreated;
      break;
    case 'pools_contributed':
      currentValue = stats.poolsContributed;
      break;
    case 'pool_contribution_total':
      currentValue = stats.poolContributionTotal;
      break;
    case 'shares_count':
      currentValue = stats.sharesCount;
      break;
    case 'watchlist_count':
      currentValue = stats.watchlistCount;
      break;
    case 'join_date':
      // For date-based badges, it's either earned or not (no progress)
      currentValue = checkBadgeEarned(badge, stats) ? 1 : 0;
      return {
        badge,
        earned: currentValue === 1,
        progress: currentValue === 1 ? 100 : 0,
        currentValue: currentValue,
        targetValue: 1,
      };
    case 'leaderboard_rank':
      // For rank badges, lower is better
      if (stats.leaderboardRank === null) {
        currentValue = 999;
      } else {
        currentValue = stats.leaderboardRank;
      }
      const rankProgress = stats.leaderboardRank !== null
        ? Math.max(0, (1 - (stats.leaderboardRank - value) / 100) * 100)
        : 0;
      return {
        badge,
        earned: checkBadgeEarned(badge, stats),
        progress: Math.min(100, rankProgress),
        currentValue: stats.leaderboardRank ?? 0,
        targetValue: value,
      };
    case 'category_rank':
      if (stats.bestCategoryRank === null) {
        currentValue = 999;
      } else {
        currentValue = stats.bestCategoryRank;
      }
      const catRankProgress = stats.bestCategoryRank !== null
        ? Math.max(0, (1 - (stats.bestCategoryRank - value) / 10) * 100)
        : 0;
      return {
        badge,
        earned: checkBadgeEarned(badge, stats),
        progress: Math.min(100, catRankProgress),
        currentValue: stats.bestCategoryRank ?? 0,
        targetValue: value,
      };
    case 'rank_improvement':
      currentValue = stats.rankImprovementWeek;
      break;
    default:
      currentValue = 0;
  }

  const earned = checkBadgeEarned(badge, stats);
  const progress = Math.min(100, (currentValue / value) * 100);

  return {
    badge,
    earned,
    progress,
    currentValue,
    targetValue: value,
  };
}

// Get all badges with their progress
export function getAllBadgesWithProgress(stats: UserStats): BadgeProgress[] {
  return BADGES.map(badge => getBadgeProgress(badge, stats));
}

// Get next achievable badges (close to earning)
export function getNextAchievableBadges(stats: UserStats, limit: number = 3): BadgeProgress[] {
  const allProgress = getAllBadgesWithProgress(stats);

  return allProgress
    .filter(bp => !bp.earned && bp.progress > 0 && bp.progress < 100)
    .sort((a, b) => b.progress - a.progress) // Sort by highest progress first
    .slice(0, limit);
}

// Calculate default user stats (for new users)
export function getDefaultUserStats(): UserStats {
  return {
    tradesCount: 0,
    totalVolume: 0,
    totalProfit: 0,
    longestHoldDays: 0,
    opinionsCreated: 0,
    creatorFeesEarned: 0,
    highestSingleOpinionVolume: 0,
    poolsCreated: 0,
    poolsContributed: 0,
    poolContributionTotal: 0,
    sharesCount: 0,
    watchlistCount: 0,
    leaderboardRank: null,
    bestCategoryRank: null,
    rankImprovementWeek: 0,
    firstSeenTimestamp: Date.now(),
  };
}
