'use client';

import { Filter, Trophy, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Categories matching the main app (visible categories only)
const ALL_CATEGORIES = [
  'Crypto', 'Politics', 'Sports', 'Entertainment', 'Social Media', 'Other',
  'AI', 'Automotive', 'Books & Literature', 'Celebrities',
  'Conspiracy', 'Dating & Relationships', 'Investing',
  'Luxury', 'Mobile Apps', 'Movies & TV', 'Music', 'Parenting',
  'Podcasts', 'Real Estate', 'Adult'
];

// Sort alphabetically with Adult at end
const VISIBLE_CATEGORIES = (() => {
  const nonAdult = ALL_CATEGORIES.filter(cat => cat !== 'Adult').sort();
  const adult = ALL_CATEGORIES.filter(cat => cat === 'Adult');
  return [...nonAdult, ...adult];
})();

export type RankingType = 'earnings' | 'roi' | 'volume' | 'questions';
export type TimePeriod = '24h' | '7d' | '30d' | 'all';

interface LeaderboardFiltersProps {
  category: string;
  rankingType: RankingType;
  timePeriod: TimePeriod;
  onCategoryChange: (category: string) => void;
  onRankingTypeChange: (type: RankingType) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const rankingOptions: { value: RankingType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'earnings',
    label: 'Total Earnings',
    icon: <Trophy className="w-4 h-4" />,
    description: 'Creator + trading fees earned'
  },
  {
    value: 'roi',
    label: 'ROI %',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Return on investment percentage'
  },
  {
    value: 'volume',
    label: 'Volume Generated',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Total trading volume from questions'
  },
  {
    value: 'questions',
    label: 'Questions Created',
    icon: <Lightbulb className="w-4 h-4" />,
    description: 'Number of opinions created'
  },
];

const timePeriodOptions: { value: TimePeriod; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '30d', label: '30 Days' },
  { value: '7d', label: '7 Days' },
  { value: '24h', label: '24 Hours' },
];

export function LeaderboardFilters({
  category,
  rankingType,
  timePeriod,
  onCategoryChange,
  onRankingTypeChange,
  onTimePeriodChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Left side - Category and Ranking filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">
                    All Categories
                  </SelectItem>
                  {VISIBLE_CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-white hover:bg-gray-700"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ranking Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Rank by:</span>
              <Select value={rankingType} onValueChange={(v) => onRankingTypeChange(v as RankingType)}>
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {rankingOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right side - Time Period */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Period:</span>
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              {timePeriodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onTimePeriodChange(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    timePeriod === option.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(category !== 'all' || rankingType !== 'earnings') && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-400">Active filters:</span>
            {category !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full text-xs">
                {category}
              </span>
            )}
            {rankingType !== 'earnings' && (
              <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full text-xs">
                {rankingOptions.find(o => o.value === rankingType)?.label}
              </span>
            )}
            <button
              onClick={() => {
                onCategoryChange('all');
                onRankingTypeChange('earnings');
              }}
              className="text-gray-400 hover:text-white text-xs underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
