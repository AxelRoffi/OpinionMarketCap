'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeDefinition,
  RARITY_COLORS,
  CATEGORY_COLORS,
  BadgeCategory,
} from './badges/badgeDefinitions';
import { getBadgeIcon } from './badges/badgeIcons';
import { BadgeProgress } from './badges/badgeLogic';
import { useBadges } from './useBadges';

interface BadgeCardProps {
  badgeProgress: BadgeProgress;
  onClick?: (badge: BadgeDefinition) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Individual badge card component
export function BadgeCard({ badgeProgress, onClick, size = 'md' }: BadgeCardProps) {
  const { badge, earned, progress } = badgeProgress;
  const rarity = RARITY_COLORS[badge.rarity];
  const Icon = getBadgeIcon(badge.icon);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <motion.button
      onClick={() => onClick?.(badge)}
      className={`
        relative ${sizeClasses[size]} rounded-xl border-2
        ${earned ? rarity.bg : 'bg-zinc-800/50'}
        ${earned ? rarity.border : 'border-zinc-700'}
        transition-all duration-300 hover:scale-105
        ${earned ? `shadow-lg ${rarity.glow}` : 'opacity-50'}
        flex flex-col items-center justify-center gap-1
        cursor-pointer group
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon */}
      <div className={earned ? rarity.text : 'text-zinc-500'}>
        <Icon size={iconSizes[size]} />
      </div>

      {/* Progress ring for unearned badges */}
      {!earned && progress > 0 && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-zinc-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${progress * 2.83} 283`}
            className="text-blue-500"
          />
        </svg>
      )}

      {/* Lock icon for unearned */}
      {!earned && (
        <div className="absolute -bottom-1 -right-1 bg-zinc-700 rounded-full p-1">
          <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Shine effect for earned */}
      {earned && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  );
}

// Badge grid display component
interface BadgeGridProps {
  badges: BadgeProgress[];
  onBadgeClick?: (badge: BadgeDefinition) => void;
  size?: 'sm' | 'md' | 'lg';
  showUnearned?: boolean;
  maxDisplay?: number;
}

export function BadgeGrid({
  badges,
  onBadgeClick,
  size = 'md',
  showUnearned = true,
  maxDisplay,
}: BadgeGridProps) {
  const displayBadges = showUnearned
    ? badges
    : badges.filter((bp) => bp.earned);

  const finalBadges = maxDisplay
    ? displayBadges.slice(0, maxDisplay)
    : displayBadges;

  const remainingCount = maxDisplay ? displayBadges.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-3">
      {finalBadges.map((bp) => (
        <BadgeCard
          key={bp.badge.id}
          badgeProgress={bp}
          onClick={onBadgeClick}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            flex items-center justify-center
            ${size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-20 h-20' : 'w-24 h-24'}
            rounded-xl border-2 border-zinc-700 bg-zinc-800/50
            text-zinc-400 text-sm font-medium
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Category filter tabs
interface CategoryTabsProps {
  selectedCategory: BadgeCategory | 'all';
  onCategoryChange: (category: BadgeCategory | 'all') => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const categories: (BadgeCategory | 'all')[] = ['all', 'trading', 'creation', 'community', 'leaderboard'];

  const categoryLabels: Record<BadgeCategory | 'all', string> = {
    all: 'All',
    trading: 'Trading',
    creation: 'Creation',
    community: 'Community',
    leaderboard: 'Leaderboard',
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${selectedCategory === cat
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }
          `}
        >
          {categoryLabels[cat]}
          {cat !== 'all' && (
            <span className={`ml-1 ${CATEGORY_COLORS[cat]}`}>
              {/* Could add category icon here */}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// XP and Level display
interface LevelDisplayProps {
  level: { level: number; title: string; xpForNext: number; progress: number };
  totalXP: number;
  compact?: boolean;
}

export function LevelDisplay({ level, totalXP, compact = false }: LevelDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-3 py-1">
          <span className="text-white font-bold text-sm">Lv.{level.level}</span>
        </div>
        <span className="text-zinc-400 text-sm">{level.title}</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-4 py-2">
            <span className="text-white font-bold text-xl">Lv.{level.level}</span>
          </div>
          <div>
            <div className="text-white font-semibold">{level.title}</div>
            <div className="text-zinc-400 text-sm">{totalXP.toLocaleString()} XP</div>
          </div>
        </div>
        {level.xpForNext > 0 && (
          <div className="text-right">
            <div className="text-zinc-400 text-sm">Next level</div>
            <div className="text-blue-400 font-medium">{level.xpForNext.toLocaleString()} XP</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {level.xpForNext > 0 && (
        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${level.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}

// Main Badge Display component with full UI
interface BadgeDisplayProps {
  onBadgeClick?: (badge: BadgeDefinition) => void;
}

export function BadgeDisplay({ onBadgeClick }: BadgeDisplayProps) {
  const {
    allBadgesWithProgress,
    earnedCount,
    totalCount,
    totalXP,
    level,
    isLoading,
  } = useBadges();

  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');

  const filteredBadges = selectedCategory === 'all'
    ? allBadgesWithProgress
    : allBadgesWithProgress.filter((bp) => bp.badge.category === selectedCategory);

  // Sort: earned first, then by progress
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return b.progress - a.progress;
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-zinc-800 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-20 bg-zinc-800 rounded-lg" />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-20 h-20 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Display */}
      <LevelDisplay level={level} totalXP={totalXP} />

      {/* Badge count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Badges Earned
        </h3>
        <span className="text-zinc-400">
          {earnedCount} / {totalCount}
        </span>
      </div>

      {/* Category filter */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Badge grid */}
      <BadgeGrid
        badges={sortedBadges}
        onBadgeClick={onBadgeClick}
        showUnearned={true}
      />
    </div>
  );
}

// Compact badge showcase for profile cards
interface BadgeShowcaseProps {
  maxBadges?: number;
  onViewAll?: () => void;
}

export function BadgeShowcase({ maxBadges = 5, onViewAll }: BadgeShowcaseProps) {
  const { allBadgesWithProgress, earnedCount, totalCount, level, isLoading } = useBadges();

  const earnedBadges = allBadgesWithProgress
    .filter((bp) => bp.earned)
    .slice(0, maxBadges);

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-12 h-12 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <LevelDisplay level={level} totalXP={0} compact />
        <span className="text-zinc-400 text-sm">
          {earnedCount}/{totalCount} badges
        </span>
      </div>

      <div className="flex items-center gap-2">
        <BadgeGrid badges={earnedBadges} size="sm" showUnearned={false} />
        {onViewAll && earnedCount > maxBadges && (
          <button
            onClick={onViewAll}
            className="text-blue-400 text-sm hover:underline"
          >
            View all
          </button>
        )}
      </div>
    </div>
  );
}
