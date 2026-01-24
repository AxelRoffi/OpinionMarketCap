'use client';

import React from 'react';

// Badge icon components - minimalist SVG icons
interface IconProps {
  className?: string;
  size?: number;
}

const defaultProps = { className: '', size: 24 };

export const SparklesIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
    <path d="M5.5 14L6.05 16.95L9 17.5L6.05 18.05L5.5 21L4.95 18.05L2 17.5L4.95 16.95L5.5 14Z" opacity="0.7" />
    <path d="M18.5 11L18.87 12.63L20.5 13L18.87 13.37L18.5 15L18.13 13.37L16.5 13L18.13 12.63L18.5 11Z" opacity="0.7" />
  </svg>
);

export const ChartIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 4 4 5-5" />
  </svg>
);

export const DollarIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    <text x="12" y="15" textAnchor="middle" fontSize="10" fill="currentColor">$</text>
  </svg>
);

export const StackIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" opacity="0.7" />
    <path d="M2 12l10 5 10-5" opacity="0.85" />
  </svg>
);

export const WhaleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4C7 4 3 8 3 12c0 2.5 1.5 4.5 3 6l1-2c2 1 4 1 6 0l1 2c1.5-1.5 3-3.5 3-6 0-4-4-8-9-8zm-3 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    <path d="M20 8c0-1.1-.9-2-2-2h-1c0-1.1-.9-2-2-2v2c-1.1 0-2 .9-2 2h4c1.1 0 2 .9 2 2" opacity="0.5" />
  </svg>
);

export const DiamondIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 9l10 13 10-13-10-7z" />
    <path d="M12 2l-4 7h8l-4-7z" opacity="0.7" />
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a5 5 0 0 0 5-5V4H7v5a5 5 0 0 0 5 5z" />
    <path d="M7 4H4v3a3 3 0 0 0 3 3" opacity="0.7" />
    <path d="M17 4h3v3a3 3 0 0 1-3 3" opacity="0.7" />
    <path d="M9 18h6v2H9z" />
    <path d="M11 14h2v4h-2z" />
    <path d="M7 20h10v2H7z" />
  </svg>
);

export const PenIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
    <path d="M20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

export const DocumentsIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" opacity="0.7" />
    <path d="M20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z" />
  </svg>
);

export const FireIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.53 2.04-6.57 5-8.03v2.38c-1.83 1.32-3 3.48-3 5.65 0 3.87 3.13 7 7 7s7-3.13 7-7c0-2.17-1.17-4.33-3-5.65V6.97c2.96 1.46 5 4.5 5 8.03 0 4.97-4.03 9-9 9z" />
    <path d="M12 2c-2.67 4.67-4 7.67-4 9 0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.33-1.33-4.33-4-9z" />
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 6l-4 4-4-3 2 11h12l2-11-4 3-4-4z" />
    <path d="M4 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" opacity="0.7" />
    <path d="M20 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" opacity="0.7" />
    <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" opacity="0.7" />
    <path d="M6 20h12v2H6z" />
  </svg>
);

export const CoinsIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="9" cy="9" rx="7" ry="4" />
    <path d="M2 9v4c0 2.21 3.13 4 7 4s7-1.79 7-4V9" opacity="0.7" />
    <ellipse cx="15" cy="15" rx="7" ry="4" opacity="0.85" />
    <path d="M8 15v4c0 2.21 3.13 4 7 4s7-1.79 7-4v-4" opacity="0.6" />
  </svg>
);

export const GemIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
    <path d="M3 9h18" opacity="0.7" />
    <path d="M12 21L6 9l6-6 6 6-6 12z" opacity="0.85" />
  </svg>
);

export const TrendingIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3z" />
    <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" />
    <path d="M8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    <path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" opacity="0.7" />
  </svg>
);

export const HandshakeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.5 11L9 13.5l1.5 1.5 2.5-2.5L11.5 11z" />
    <path d="M2 9l6-6 4 4-6 6-4-4z" opacity="0.7" />
    <path d="M22 9l-6-6-4 4 6 6 4-4z" opacity="0.7" />
    <path d="M10 19l-2-2-1 1-3-3 1-1 5 5z" />
    <path d="M14 19l2-2 1 1 3-3-1-1-5 5z" />
  </svg>
);

export const BankIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v2h20V7L12 2z" />
    <path d="M4 10v8h3v-8H4z" opacity="0.7" />
    <path d="M9 10v8h3v-8H9z" opacity="0.85" />
    <path d="M15 10v8h3v-8h-3z" opacity="0.7" />
    <path d="M2 20h20v2H2z" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
    <circle cx="12" cy="12" r="3.5" fill="white" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const MedalIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="15" r="7" />
    <path d="M8 2l2 5h-4l2-5z" opacity="0.7" />
    <path d="M16 2l-2 5h4l-2-5z" opacity="0.7" />
    <text x="12" y="18" textAnchor="middle" fontSize="6" fill="white">3</text>
  </svg>
);

export const PodiumIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 16h6v6H2z" />
    <path d="M9 12h6v10H9z" opacity="0.85" />
    <path d="M16 18h6v4h-6z" opacity="0.7" />
    <text x="5" y="20" textAnchor="middle" fontSize="4" fill="white">2</text>
    <text x="12" y="16" textAnchor="middle" fontSize="4" fill="white">1</text>
    <text x="19" y="21" textAnchor="middle" fontSize="4" fill="white">3</text>
  </svg>
);

export const TrophyGoldIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a5 5 0 0 0 5-5V4H7v5a5 5 0 0 0 5 5z" fill="#FFD700" />
    <path d="M7 4H4v3a3 3 0 0 0 3 3" fill="#FFC107" />
    <path d="M17 4h3v3a3 3 0 0 1-3 3" fill="#FFC107" />
    <path d="M9 18h6v2H9z" fill="#FFD700" />
    <path d="M11 14h2v4h-2z" fill="#FFD700" />
    <path d="M7 20h10v2H7z" fill="#FFC107" />
    <text x="12" y="11" textAnchor="middle" fontSize="5" fill="#B8860B">1</text>
  </svg>
);

export const CrownGoldIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="#FFD700">
    <path d="M12 6l-4 4-4-3 2 11h12l2-11-4 3-4-4z" />
    <circle cx="4" cy="5" r="2" fill="#FFC107" />
    <circle cx="20" cy="5" r="2" fill="#FFC107" />
    <circle cx="12" cy="2" r="2" fill="#FFC107" />
    <path d="M6 20h12v2H6z" fill="#B8860B" />
  </svg>
);

export const RocketIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-2 4-4 8-4 12h8c0-4-2-8-4-12z" />
    <path d="M8 14c-2 0-4 1-4 3l4 1v-4z" opacity="0.7" />
    <path d="M16 14c2 0 4 1 4 3l-4 1v-4z" opacity="0.7" />
    <path d="M10 18h4l-2 4-2-4z" />
    <circle cx="12" cy="10" r="2" fill="white" opacity="0.5" />
  </svg>
);

// Icon mapping for easy lookup
export const BADGE_ICONS: Record<string, React.FC<IconProps>> = {
  sparkles: SparklesIcon,
  chart: ChartIcon,
  dollar: DollarIcon,
  stack: StackIcon,
  whale: WhaleIcon,
  diamond: DiamondIcon,
  trophy: TrophyIcon,
  pen: PenIcon,
  documents: DocumentsIcon,
  fire: FireIcon,
  crown: CrownIcon,
  coins: CoinsIcon,
  gem: GemIcon,
  trending: TrendingIcon,
  users: UsersIcon,
  handshake: HandshakeIcon,
  bank: BankIcon,
  share: ShareIcon,
  star: StarIcon,
  eye: EyeIcon,
  medal: MedalIcon,
  podium: PodiumIcon,
  trophy_gold: TrophyGoldIcon,
  crown_gold: CrownGoldIcon,
  rocket: RocketIcon,
};

// Get icon component by name
export function getBadgeIcon(iconName: string): React.FC<IconProps> {
  return BADGE_ICONS[iconName] || SparklesIcon;
}
