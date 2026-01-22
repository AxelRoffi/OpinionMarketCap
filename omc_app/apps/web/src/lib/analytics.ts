/**
 * Mixpanel Analytics Integration
 *
 * Tracks user behavior for KPI measurement:
 * - Onboarding completion rate (target: >80%)
 * - Time to first action (target: <1min)
 * - D1 retention (target: >40%)
 * - DAU increase (target: +30%)
 * - Search usage (target: >60% sessions)
 */

import mixpanel from 'mixpanel-browser';

// Mixpanel project token - set in environment
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEBUG_ANALYTICS = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === 'true';

let isInitialized = false;

/**
 * Initialize Mixpanel
 * Call this once at app startup
 */
export function initAnalytics(): void {
  if (isInitialized) return;

  if (!MIXPANEL_TOKEN) {
    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] No Mixpanel token - running in debug mode');
    }
    isInitialized = true;
    return;
  }

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: DEBUG_ANALYTICS,
      track_pageview: true,
      persistence: 'localStorage',
      ignore_dnt: false, // Respect Do Not Track
      batch_requests: true,
      batch_size: 10,
      batch_flush_interval_ms: 5000,
    });
    isInitialized = true;

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] Mixpanel initialized');
    }
  } catch (error) {
    console.error('[Analytics] Failed to initialize Mixpanel:', error);
  }
}

/**
 * Identify a user by wallet address
 */
export function identifyUser(
  address: string,
  properties?: {
    walletType?: string;
    chainId?: number;
    referralSource?: string;
  }
): void {
  if (!isInitialized) return;

  try {
    if (MIXPANEL_TOKEN) {
      mixpanel.identify(address.toLowerCase());

      if (properties) {
        mixpanel.people.set({
          $name: address.slice(0, 6) + '...' + address.slice(-4),
          wallet_type: properties.walletType,
          chain_id: properties.chainId,
          referral_source: properties.referralSource,
          first_seen: new Date().toISOString(),
        });
      }
    }

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] User identified:', address, properties);
    }
  } catch (error) {
    console.error('[Analytics] Failed to identify user:', error);
  }
}

/**
 * Reset user identity (on disconnect)
 */
export function resetUser(): void {
  if (!isInitialized) return;

  try {
    if (MIXPANEL_TOKEN) {
      mixpanel.reset();
    }

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] User reset');
    }
  } catch (error) {
    console.error('[Analytics] Failed to reset user:', error);
  }
}

/**
 * Track an event
 */
export function track(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialized) return;

  try {
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: IS_PRODUCTION ? 'production' : 'development',
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    if (MIXPANEL_TOKEN) {
      mixpanel.track(eventName, enrichedProperties);
    }

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] Track:', eventName, enrichedProperties);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Update user properties
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!isInitialized || !MIXPANEL_TOKEN) return;

  try {
    mixpanel.people.set(properties);

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] Set user properties:', properties);
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user properties:', error);
  }
}

/**
 * Increment a user property
 */
export function incrementUserProperty(property: string, value: number = 1): void {
  if (!isInitialized || !MIXPANEL_TOKEN) return;

  try {
    mixpanel.people.increment(property, value);

    if (DEBUG_ANALYTICS) {
      console.log('[Analytics] Increment:', property, value);
    }
  } catch (error) {
    console.error('[Analytics] Failed to increment property:', error);
  }
}

// ============================================================================
// ONBOARDING EVENTS
// KPIs: Completion rate >80%, Time to first action <1min, D1 retention >40%
// ============================================================================

export const OnboardingEvents = {
  started: () => track('onboarding_started'),

  stepCompleted: (step: number, stepName: string) =>
    track('onboarding_step_completed', { step, step_name: stepName }),

  completed: (totalTimeSeconds: number) => {
    track('onboarding_completed', { total_time_seconds: totalTimeSeconds });
    setUserProperties({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() });
  },

  skipped: (atStep: number) =>
    track('onboarding_skipped', { skipped_at_step: atStep }),

  simulationStarted: () => track('onboarding_simulation_started'),

  simulationCompleted: () => track('onboarding_simulation_completed'),
};

// ============================================================================
// TRADING EVENTS
// KPIs: Trades per user >2/month, Repeat trades >60%
// ============================================================================

export const TradingEvents = {
  initiated: (opinionId: number, amount: number, action: 'buy' | 'sell') =>
    track('trade_initiated', { opinion_id: opinionId, amount, action }),

  completed: (opinionId: number, amount: number, price: number, action: 'buy' | 'sell') => {
    track('trade_completed', { opinion_id: opinionId, amount, price, action });
    incrementUserProperty('total_trades');
    incrementUserProperty('total_volume', amount);
  },

  failed: (opinionId: number, reason: string) =>
    track('trade_failed', { opinion_id: opinionId, reason }),

  answerSubmitted: (opinionId: number, price: number) => {
    track('answer_submitted', { opinion_id: opinionId, price });
    incrementUserProperty('answers_submitted');
  },
};

// ============================================================================
// OPINION CREATION EVENTS
// ============================================================================

export const CreationEvents = {
  started: () => track('opinion_create_started'),

  stepCompleted: (step: number, stepName: string) =>
    track('opinion_create_step', { step, step_name: stepName }),

  created: (opinionId: number, categories: string[], initialPrice: number) => {
    track('opinion_created', { opinion_id: opinionId, categories, initial_price: initialPrice });
    incrementUserProperty('opinions_created');
  },

  failed: (reason: string) =>
    track('opinion_create_failed', { reason }),
};

// ============================================================================
// ENGAGEMENT EVENTS
// KPIs: DAU +30%, Sessions/user >3/day, Search usage >60%
// ============================================================================

export const EngagementEvents = {
  pageViewed: (page: string) =>
    track('page_viewed', { page }),

  searchPerformed: (query: string, resultsCount: number) =>
    track('search_performed', { query_length: query.length, results_count: resultsCount }),

  filterApplied: (filterType: string, filterValue: string) =>
    track('filter_applied', { filter_type: filterType, filter_value: filterValue }),

  sortApplied: (sortBy: string, direction: 'asc' | 'desc') =>
    track('sort_applied', { sort_by: sortBy, direction }),

  watchlistAdded: (opinionId: number) => {
    track('watchlist_added', { opinion_id: opinionId });
    incrementUserProperty('watchlist_items');
  },

  watchlistRemoved: (opinionId: number) =>
    track('watchlist_removed', { opinion_id: opinionId }),

  leaderboardViewed: (category?: string) =>
    track('leaderboard_viewed', { category: category || 'global' }),

  profileViewed: (isOwnProfile: boolean) =>
    track('profile_viewed', { is_own_profile: isOwnProfile }),

  shareClicked: (platform: string, contentType: 'opinion' | 'achievement') =>
    track('share_clicked', { platform, content_type: contentType }),
};

// ============================================================================
// POOL EVENTS
// KPIs: Pools created >10/week, Avg contribution >200 USDC, Success rate >70%
// ============================================================================

export const PoolEvents = {
  viewed: (poolId: number) =>
    track('pool_viewed', { pool_id: poolId }),

  createStarted: () => track('pool_create_started'),

  created: (poolId: number, threshold: number, duration: number) => {
    track('pool_created', { pool_id: poolId, threshold, duration_days: duration });
    incrementUserProperty('pools_created');
  },

  contributed: (poolId: number, amount: number) => {
    track('pool_contributed', { pool_id: poolId, amount });
    incrementUserProperty('pool_contributions');
    incrementUserProperty('pool_contribution_total', amount);
  },

  withdrawn: (poolId: number, amount: number, isEarly: boolean) =>
    track('pool_withdrawn', { pool_id: poolId, amount, is_early: isEarly }),

  thresholdReached: (poolId: number) =>
    track('pool_threshold_reached', { pool_id: poolId }),
};

// ============================================================================
// GAMIFICATION EVENTS
// KPIs: Badge earners >50%, MAU +25%
// ============================================================================

export const GamificationEvents = {
  badgeEarned: (badgeId: string, badgeName: string) => {
    track('badge_earned', { badge_id: badgeId, badge_name: badgeName });
    incrementUserProperty('badges_earned');
  },

  badgeViewed: (badgeId: string) =>
    track('badge_viewed', { badge_id: badgeId }),

  achievementProgress: (achievementId: string, progress: number, total: number) =>
    track('achievement_progress', { achievement_id: achievementId, progress, total, percent: Math.round((progress / total) * 100) }),

  leaderboardRankChanged: (oldRank: number, newRank: number) =>
    track('leaderboard_rank_changed', { old_rank: oldRank, new_rank: newRank, improvement: oldRank - newRank }),
};

// ============================================================================
// NOTIFICATION EVENTS
// ============================================================================

export const NotificationEvents = {
  received: (type: string) =>
    track('notification_received', { type }),

  clicked: (type: string, notificationId: string) =>
    track('notification_clicked', { type, notification_id: notificationId }),

  dismissed: (type: string) =>
    track('notification_dismissed', { type }),

  settingsChanged: (setting: string, enabled: boolean) =>
    track('notification_settings_changed', { setting, enabled }),
};

// ============================================================================
// WALLET EVENTS
// KPIs: Wallet connects >95% success
// ============================================================================

export const WalletEvents = {
  connectStarted: (walletType: string) =>
    track('wallet_connect_started', { wallet_type: walletType }),

  connected: (walletType: string, chainId: number) => {
    track('wallet_connected', { wallet_type: walletType, chain_id: chainId });
    setUserProperties({ wallet_type: walletType, last_connected: new Date().toISOString() });
  },

  disconnected: () =>
    track('wallet_disconnected'),

  switchedChain: (fromChainId: number, toChainId: number) =>
    track('wallet_chain_switched', { from_chain_id: fromChainId, to_chain_id: toChainId }),

  error: (errorType: string, errorMessage: string) =>
    track('wallet_error', { error_type: errorType, error_message: errorMessage }),
};

// ============================================================================
// ERROR EVENTS
// KPIs: Error rate <1%
// ============================================================================

export const ErrorEvents = {
  transactionFailed: (txType: string, errorCode: string, errorMessage: string) =>
    track('transaction_failed', { tx_type: txType, error_code: errorCode, error_message: errorMessage }),

  uiError: (component: string, errorMessage: string) =>
    track('ui_error', { component, error_message: errorMessage }),

  apiError: (endpoint: string, statusCode: number) =>
    track('api_error', { endpoint, status_code: statusCode }),
};
