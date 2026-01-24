'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeDefinition, RARITY_COLORS } from './badges/badgeDefinitions';
import { getBadgeIcon } from './badges/badgeIcons';
import { useBadges } from './useBadges';

interface BadgeNotificationProps {
  badge: BadgeDefinition;
  onDismiss: () => void;
  onClick?: () => void;
}

// Individual badge notification toast
export function BadgeNotification({ badge, onDismiss, onClick }: BadgeNotificationProps) {
  const rarity = RARITY_COLORS[badge.rarity];
  const Icon = getBadgeIcon(badge.icon);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={onClick}
      className={`
        flex items-center gap-3 p-4 rounded-xl
        bg-zinc-900 border-2 ${rarity.border}
        shadow-lg ${rarity.glow}
        cursor-pointer hover:scale-[1.02] transition-transform
        max-w-sm
      `}
    >
      {/* Badge icon */}
      <div className={`${rarity.bg} rounded-lg p-2`}>
        <Icon size={32} className={rarity.text} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-amber-400 text-xs font-medium uppercase tracking-wider">
          Badge Unlocked!
        </div>
        <div className="text-white font-semibold truncate">{badge.name}</div>
        <div className="text-zinc-400 text-sm">+{badge.xpReward} XP</div>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

interface BadgeNotificationContainerProps {
  onBadgeClick?: (badge: BadgeDefinition) => void;
}

// Container that manages showing new badge notifications
export function BadgeNotificationContainer({ onBadgeClick }: BadgeNotificationContainerProps) {
  const { newlyEarnedBadges, clearNewBadges } = useBadges();
  const [visibleBadges, setVisibleBadges] = useState<BadgeDefinition[]>([]);
  const [showedBadges, setShowedBadges] = useState<Set<string>>(new Set());

  // Add new badges to visible queue
  useEffect(() => {
    const newBadges = newlyEarnedBadges.filter(
      (badge) => !showedBadges.has(badge.id)
    );

    if (newBadges.length > 0) {
      setVisibleBadges((prev) => [...prev, ...newBadges]);
      setShowedBadges((prev) => {
        const updated = new Set(prev);
        newBadges.forEach((badge) => updated.add(badge.id));
        return updated;
      });
    }
  }, [newlyEarnedBadges, showedBadges]);

  const handleDismiss = (badgeId: string) => {
    setVisibleBadges((prev) => prev.filter((b) => b.id !== badgeId));

    // Clear new badges flag when all notifications are dismissed
    if (visibleBadges.length <= 1) {
      clearNewBadges();
    }
  };

  const handleClick = (badge: BadgeDefinition) => {
    onBadgeClick?.(badge);
    handleDismiss(badge.id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence mode="popLayout">
        {visibleBadges.map((badge) => (
          <BadgeNotification
            key={badge.id}
            badge={badge}
            onDismiss={() => handleDismiss(badge.id)}
            onClick={() => handleClick(badge)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Simple badge progress toast (for showing progress updates)
interface BadgeProgressToastProps {
  badge: BadgeDefinition;
  progress: number;
  onDismiss: () => void;
}

export function BadgeProgressToast({ badge, progress, onDismiss }: BadgeProgressToastProps) {
  const rarity = RARITY_COLORS[badge.rarity];
  const Icon = getBadgeIcon(badge.icon);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 max-w-sm"
    >
      <div className={`${rarity.bg} rounded p-1.5`}>
        <Icon size={20} className={rarity.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">{badge.name}</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500"
            />
          </div>
          <span className="text-xs text-zinc-400">{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
