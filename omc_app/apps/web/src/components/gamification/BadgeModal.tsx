'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeDefinition,
  RARITY_COLORS,
  CATEGORY_COLORS,
} from './badges/badgeDefinitions';
import { getBadgeIcon } from './badges/badgeIcons';
import { BadgeProgress } from './badges/badgeLogic';
import { useBadges } from './useBadges';

interface BadgeModalProps {
  badge: BadgeDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeModal({ badge, isOpen, onClose }: BadgeModalProps) {
  const { allBadgesWithProgress } = useBadges();

  if (!badge) return null;

  // Find progress for this badge
  const badgeProgress = allBadgesWithProgress.find((bp) => bp.badge.id === badge.id);
  const rarity = RARITY_COLORS[badge.rarity];
  const categoryColor = CATEGORY_COLORS[badge.category];
  const Icon = getBadgeIcon(badge.icon);

  const rarityLabels = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  };

  const categoryLabels = {
    trading: 'Trading',
    creation: 'Creation',
    community: 'Community',
    leaderboard: 'Leaderboard',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={`
                bg-zinc-900 rounded-2xl border-2 ${rarity.border}
                max-w-md w-full overflow-hidden
                shadow-2xl ${rarity.glow}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className={`${rarity.bg} p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Badge icon */}
                    <div
                      className={`
                        w-20 h-20 rounded-xl ${rarity.bg} border-2 ${rarity.border}
                        flex items-center justify-center
                        ${badgeProgress?.earned ? '' : 'opacity-50'}
                      `}
                    >
                      <Icon
                        size={48}
                        className={badgeProgress?.earned ? rarity.text : 'text-zinc-500'}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">{badge.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${categoryColor}`}>
                          {categoryLabels[badge.category]}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className={`text-sm ${rarity.text}`}>
                          {rarityLabels[badge.rarity]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <p className="text-zinc-300">{badge.description}</p>

                {/* Progress */}
                {badgeProgress && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Progress</span>
                      <span className={badgeProgress.earned ? 'text-green-400' : 'text-zinc-300'}>
                        {badgeProgress.earned
                          ? 'Completed!'
                          : `${badgeProgress.currentValue} / ${badgeProgress.targetValue} ${badge.requirement.unit || ''}`}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${badgeProgress.progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full ${badgeProgress.earned ? 'bg-green-500' : 'bg-blue-500'}`}
                      />
                    </div>

                    {/* Percentage */}
                    <div className="text-right text-sm text-zinc-500">
                      {Math.round(badgeProgress.progress)}%
                    </div>
                  </div>
                )}

                {/* Reward */}
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                  <span className="text-zinc-400">XP Reward</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-amber-400">+{badge.xpReward}</span>
                    <span className="text-zinc-500">XP</span>
                  </div>
                </div>

                {/* Status indicator */}
                {badgeProgress?.earned ? (
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-400 font-medium">Badge Earned!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                    <svg className="w-5 h-5 text-zinc-500" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-zinc-400">Keep going to unlock this badge!</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Achievement unlocked celebration modal
interface AchievementUnlockedModalProps {
  badges: BadgeDefinition[];
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementUnlockedModal({
  badges,
  isOpen,
  onClose,
}: AchievementUnlockedModalProps) {
  if (badges.length === 0) return null;

  // Show the first badge (or could cycle through them)
  const badge = badges[0];
  const rarity = RARITY_COLORS[badge.rarity];
  const Icon = getBadgeIcon(badge.icon);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="relative max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sparkle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos(i * 30 * Math.PI / 180) * 100,
                      y: Math.sin(i * 30 * Math.PI / 180) * 100,
                    }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 1 }}
                    className={`absolute top-1/2 left-1/2 w-2 h-2 ${rarity.bg} rounded-full`}
                  />
                ))}
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-amber-400 text-lg font-medium mb-4"
              >
                Achievement Unlocked!
              </motion.div>

              {/* Badge icon - large */}
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                className={`
                  mx-auto w-32 h-32 rounded-2xl ${rarity.bg} border-4 ${rarity.border}
                  flex items-center justify-center mb-4
                  shadow-2xl ${rarity.glow}
                `}
              >
                <Icon size={64} className={rarity.text} />
              </motion.div>

              {/* Badge name */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-white mb-2"
              >
                {badge.name}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-zinc-400 mb-4"
              >
                {badge.description}
              </motion.p>

              {/* XP reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6"
              >
                <span className="text-amber-400 font-bold">+{badge.xpReward} XP</span>
              </motion.div>

              {/* More badges indicator */}
              {badges.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-zinc-500 text-sm mb-4"
                >
                  +{badges.length - 1} more badge{badges.length > 2 ? 's' : ''} unlocked
                </motion.div>
              )}

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
