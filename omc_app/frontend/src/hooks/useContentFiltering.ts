import { useState, useMemo } from 'react';
import { scoreOpinionContent, sortOpinionsByQuality, filterOpinionsByQuality, ContentScore } from '@/lib/contentFiltering';

export interface FilterSettings {
  enableQualityFilter: boolean;
  minQualityScore: number;
  showFilterStats: boolean;
  sortByQuality: boolean;
}

export interface ContentFilterResult<T> {
  filteredOpinions: T[];
  allOpinions: T[];
  filterStats: {
    total: number;
    filtered: number;
    high: number;
    medium: number;
    low: number;
    spam: number;
  };
  filterSettings: FilterSettings;
  updateFilterSettings: (settings: Partial<FilterSettings>) => void;
  getOpinionScore: (opinion: T) => ContentScore;
}

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  enableQualityFilter: true,
  minQualityScore: 25, // Filter out spam (< 25)
  showFilterStats: true,
  sortByQuality: true,
};

/**
 * Hook for content filtering and quality scoring of opinions
 */
export function useContentFiltering<T extends { 
  question: string; 
  currentAnswer: string; 
  totalVolume?: number | bigint; 
  [key: string]: any; // Allow additional properties like categories, marketStatus, etc.
}>(opinions: T[]): ContentFilterResult<T> {
  
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(() => {
    // Try to load settings from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('opinion-content-filter-settings');
      if (saved) {
        try {
          return { ...DEFAULT_FILTER_SETTINGS, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_FILTER_SETTINGS;
        }
      }
    }
    return DEFAULT_FILTER_SETTINGS;
  });

  // Save settings to localStorage when they change
  const updateFilterSettings = useMemo(() => (newSettings: Partial<FilterSettings>) => {
    const updated = { ...filterSettings, ...newSettings };
    setFilterSettings(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('opinion-content-filter-settings', JSON.stringify(updated));
    }
  }, [filterSettings]);

  // Calculate scores and stats for all opinions
  const opinionsWithScores = useMemo(() => {
    return opinions.map(opinion => ({
      opinion,
      score: scoreOpinionContent(opinion)
    }));
  }, [opinions]);

  // Generate filter statistics
  const filterStats = useMemo(() => {
    const stats = {
      total: opinions.length,
      filtered: 0,
      high: 0,
      medium: 0,
      low: 0,
      spam: 0,
    };

    opinionsWithScores.forEach(({ score }) => {
      stats[score.category]++;
      if (score.qualityScore < filterSettings.minQualityScore) {
        stats.filtered++;
      }
    });

    return stats;
  }, [opinionsWithScores, filterSettings.minQualityScore]);

  // Apply filtering and sorting
  const processedOpinions = useMemo(() => {
    let result = [...opinions];

    // Apply quality filter if enabled
    if (filterSettings.enableQualityFilter) {
      result = filterOpinionsByQuality(result, filterSettings.minQualityScore);
    }

    // Apply quality-based sorting if enabled
    if (filterSettings.sortByQuality) {
      result = sortOpinionsByQuality(result);
    }

    return result;
  }, [opinions, filterSettings]);

  // Helper function to get score for any opinion
  const getOpinionScore = useMemo(() => (opinion: T): ContentScore => {
    const found = opinionsWithScores.find(item => 
      item.opinion.question === opinion.question && 
      item.opinion.currentAnswer === opinion.currentAnswer
    );
    return found?.score || scoreOpinionContent(opinion);
  }, [opinionsWithScores]);

  return {
    filteredOpinions: processedOpinions,
    allOpinions: opinions,
    filterStats,
    filterSettings,
    updateFilterSettings,
    getOpinionScore,
  };
}

/**
 * Hook for simple quality-based sorting without filtering UI
 */
export function useQualitySorting<T extends { 
  question: string; 
  currentAnswer: string; 
  totalVolume?: number | bigint; 
}>(opinions: T[], enabled: boolean = true): T[] {
  
  return useMemo(() => {
    if (!enabled) return opinions;
    return sortOpinionsByQuality([...opinions]);
  }, [opinions, enabled]);
}