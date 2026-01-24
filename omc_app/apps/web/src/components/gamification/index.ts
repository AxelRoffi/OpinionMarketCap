// Gamification System - Badge & Achievement exports

// Badge definitions and types
export * from './badges/badgeDefinitions';
export * from './badges/badgeLogic';
export { getBadgeIcon, BADGE_ICONS } from './badges/badgeIcons';

// Hooks
export { useBadges, useBadgesByCategory } from './useBadges';

// Components
export {
  BadgeCard,
  BadgeGrid,
  CategoryTabs,
  LevelDisplay,
  BadgeDisplay,
  BadgeShowcase,
} from './BadgeDisplay';

export { BadgeModal, AchievementUnlockedModal } from './BadgeModal';

export {
  BadgeNotification,
  BadgeNotificationContainer,
  BadgeProgressToast,
} from './BadgeNotification';
