// Badge Definitions for OpinionMarketCap
// Each badge has metadata, unlock conditions, and rarity

export type BadgeCategory = 'trading' | 'creation' | 'community' | 'leaderboard';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string; // Icon key for rendering
  requirement: {
    type: string;
    value: number;
    unit?: string;
  };
  xpReward: number;
}

// Badge color schemes by rarity
export const RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-400',
    text: 'text-slate-300',
    glow: 'shadow-slate-500/30',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-400',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-400',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/30',
  },
};

// Category colors
export const CATEGORY_COLORS: Record<BadgeCategory, string> = {
  trading: 'text-green-400',
  creation: 'text-blue-400',
  community: 'text-pink-400',
  leaderboard: 'text-amber-400',
};

// All badge definitions
export const BADGES: BadgeDefinition[] = [
  // ========== TRADING BADGES ==========
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Complete your first trade on OpinionMarketCap',
    category: 'trading',
    rarity: 'common',
    icon: 'sparkles',
    requirement: { type: 'trades_count', value: 1, unit: 'trade' },
    xpReward: 50,
  },
  {
    id: 'active_trader',
    name: 'Active Trader',
    description: 'Complete 10 trades',
    category: 'trading',
    rarity: 'common',
    icon: 'chart',
    requirement: { type: 'trades_count', value: 10, unit: 'trades' },
    xpReward: 100,
  },
  {
    id: 'volume_starter',
    name: 'Volume Starter',
    description: 'Trade 100 USDC total volume',
    category: 'trading',
    rarity: 'common',
    icon: 'dollar',
    requirement: { type: 'total_volume', value: 100, unit: 'USDC' },
    xpReward: 100,
  },
  {
    id: 'volume_master',
    name: 'Volume Master',
    description: 'Trade 1,000 USDC total volume',
    category: 'trading',
    rarity: 'rare',
    icon: 'stack',
    requirement: { type: 'total_volume', value: 1000, unit: 'USDC' },
    xpReward: 250,
  },
  {
    id: 'whale_trader',
    name: 'Whale Trader',
    description: 'Trade 10,000 USDC total volume',
    category: 'trading',
    rarity: 'epic',
    icon: 'whale',
    requirement: { type: 'total_volume', value: 10000, unit: 'USDC' },
    xpReward: 500,
  },
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Hold a position for 30+ days',
    category: 'trading',
    rarity: 'rare',
    icon: 'diamond',
    requirement: { type: 'hold_days', value: 30, unit: 'days' },
    xpReward: 200,
  },
  {
    id: 'profit_maker',
    name: 'Profit Maker',
    description: 'Earn 50 USDC in total profits',
    category: 'trading',
    rarity: 'rare',
    icon: 'trophy',
    requirement: { type: 'total_profit', value: 50, unit: 'USDC' },
    xpReward: 300,
  },

  // ========== CREATION BADGES ==========
  {
    id: 'first_mint',
    name: 'First Mint',
    description: 'Create your first opinion',
    category: 'creation',
    rarity: 'common',
    icon: 'pen',
    requirement: { type: 'opinions_created', value: 1, unit: 'opinion' },
    xpReward: 50,
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Create 5 opinions',
    category: 'creation',
    rarity: 'common',
    icon: 'documents',
    requirement: { type: 'opinions_created', value: 5, unit: 'opinions' },
    xpReward: 100,
  },
  {
    id: 'prolific_creator',
    name: 'Prolific Creator',
    description: 'Create 10 opinions',
    category: 'creation',
    rarity: 'rare',
    icon: 'fire',
    requirement: { type: 'opinions_created', value: 10, unit: 'opinions' },
    xpReward: 250,
  },
  {
    id: 'opinion_mogul',
    name: 'Opinion Mogul',
    description: 'Create 25 opinions',
    category: 'creation',
    rarity: 'epic',
    icon: 'crown',
    requirement: { type: 'opinions_created', value: 25, unit: 'opinions' },
    xpReward: 500,
  },
  {
    id: 'fee_earner',
    name: 'Fee Earner',
    description: 'Earn 10 USDC in creator fees',
    category: 'creation',
    rarity: 'rare',
    icon: 'coins',
    requirement: { type: 'creator_fees', value: 10, unit: 'USDC' },
    xpReward: 200,
  },
  {
    id: 'royalty_king',
    name: 'Royalty King',
    description: 'Earn 100 USDC in creator fees',
    category: 'creation',
    rarity: 'epic',
    icon: 'gem',
    requirement: { type: 'creator_fees', value: 100, unit: 'USDC' },
    xpReward: 500,
  },
  {
    id: 'trending_topic',
    name: 'Trending Topic',
    description: 'Have an opinion with 500+ USDC volume',
    category: 'creation',
    rarity: 'rare',
    icon: 'trending',
    requirement: { type: 'single_opinion_volume', value: 500, unit: 'USDC' },
    xpReward: 300,
  },

  // ========== COMMUNITY BADGES ==========
  {
    id: 'pool_pioneer',
    name: 'Pool Pioneer',
    description: 'Create your first pool',
    category: 'community',
    rarity: 'common',
    icon: 'users',
    requirement: { type: 'pools_created', value: 1, unit: 'pool' },
    xpReward: 75,
  },
  {
    id: 'pool_contributor',
    name: 'Pool Contributor',
    description: 'Contribute to 3 different pools',
    category: 'community',
    rarity: 'common',
    icon: 'handshake',
    requirement: { type: 'pools_contributed', value: 3, unit: 'pools' },
    xpReward: 100,
  },
  {
    id: 'whale_contributor',
    name: 'Whale Contributor',
    description: 'Contribute 500 USDC to pools total',
    category: 'community',
    rarity: 'rare',
    icon: 'bank',
    requirement: { type: 'pool_contribution_total', value: 500, unit: 'USDC' },
    xpReward: 250,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share 5 opinions on social media',
    category: 'community',
    rarity: 'rare',
    icon: 'share',
    requirement: { type: 'shares_count', value: 5, unit: 'shares' },
    xpReward: 150,
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined OpinionMarketCap in Q1 2025',
    category: 'community',
    rarity: 'legendary',
    icon: 'star',
    requirement: { type: 'join_date', value: 20250401, unit: 'before' },
    xpReward: 500,
  },
  {
    id: 'watchlist_builder',
    name: 'Watchlist Builder',
    description: 'Add 10 opinions to your watchlist',
    category: 'community',
    rarity: 'common',
    icon: 'eye',
    requirement: { type: 'watchlist_count', value: 10, unit: 'opinions' },
    xpReward: 50,
  },

  // ========== LEADERBOARD BADGES ==========
  {
    id: 'ranked_player',
    name: 'Ranked Player',
    description: 'Appear on the leaderboard',
    category: 'leaderboard',
    rarity: 'common',
    icon: 'medal',
    requirement: { type: 'leaderboard_rank', value: 100, unit: 'top' },
    xpReward: 75,
  },
  {
    id: 'top_50',
    name: 'Top 50',
    description: 'Reach top 50 on the leaderboard',
    category: 'leaderboard',
    rarity: 'rare',
    icon: 'podium',
    requirement: { type: 'leaderboard_rank', value: 50, unit: 'top' },
    xpReward: 200,
  },
  {
    id: 'top_10',
    name: 'Top 10',
    description: 'Reach top 10 on the leaderboard',
    category: 'leaderboard',
    rarity: 'epic',
    icon: 'trophy_gold',
    requirement: { type: 'leaderboard_rank', value: 10, unit: 'top' },
    xpReward: 400,
  },
  {
    id: 'category_champion',
    name: 'Category Champion',
    description: 'Rank #1 in any category',
    category: 'leaderboard',
    rarity: 'legendary',
    icon: 'crown_gold',
    requirement: { type: 'category_rank', value: 1, unit: 'rank' },
    xpReward: 750,
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Improve your rank by 10+ positions in 7 days',
    category: 'leaderboard',
    rarity: 'rare',
    icon: 'rocket',
    requirement: { type: 'rank_improvement', value: 10, unit: 'positions' },
    xpReward: 200,
  },
];

// Helper functions
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find(badge => badge.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGES.filter(badge => badge.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return BADGES.filter(badge => badge.rarity === rarity);
}

export function getTotalXP(earnedBadgeIds: string[]): number {
  return earnedBadgeIds.reduce((total, id) => {
    const badge = getBadgeById(id);
    return total + (badge?.xpReward || 0);
  }, 0);
}

// XP levels
export const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Newcomer' },
  { level: 2, xpRequired: 100, title: 'Beginner' },
  { level: 3, xpRequired: 250, title: 'Apprentice' },
  { level: 4, xpRequired: 500, title: 'Trader' },
  { level: 5, xpRequired: 1000, title: 'Expert' },
  { level: 6, xpRequired: 2000, title: 'Master' },
  { level: 7, xpRequired: 3500, title: 'Grandmaster' },
  { level: 8, xpRequired: 5000, title: 'Legend' },
  { level: 9, xpRequired: 7500, title: 'Champion' },
  { level: 10, xpRequired: 10000, title: 'Ultimate' },
];

export function getLevelFromXP(xp: number): { level: number; title: string; xpForNext: number; progress: number } {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];

  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].xpRequired) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || XP_LEVELS[i];
      break;
    }
  }

  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpForNext: nextLevel.xpRequired - xp,
    progress: Math.min(progress, 100),
  };
}
