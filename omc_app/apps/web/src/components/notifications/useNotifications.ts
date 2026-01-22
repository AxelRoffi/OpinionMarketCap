'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { NotificationEvents } from '@/lib/analytics';
import type { Notification, NotificationPreferences, NotificationType } from './types';
import { DEFAULT_PREFERENCES } from './types';

const STORAGE_KEY = 'omc.notifications';
const PREFS_KEY = 'omc.notification_prefs';
const MAX_NOTIFICATIONS = 50;

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useNotifications() {
  const { address, isConnected } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from localStorage
  useEffect(() => {
    if (!address) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const storageKey = `${STORAGE_KEY}.${address.toLowerCase()}`;
    const prefsKey = `${PREFS_KEY}.${address.toLowerCase()}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }

      const storedPrefs = localStorage.getItem(prefsKey);
      if (storedPrefs) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(storedPrefs) });
      }
    } catch {
      // Invalid data, ignore
    }

    setIsLoading(false);
  }, [address]);

  // Save notifications to localStorage
  const saveNotifications = useCallback((notifs: Notification[]) => {
    if (!address) return;
    const storageKey = `${STORAGE_KEY}.${address.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(notifs.slice(0, MAX_NOTIFICATIONS)));
  }, [address]);

  // Add a new notification
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    data?: Notification['data'],
    link?: string
  ) => {
    // Check preferences
    const shouldNotify = (() => {
      switch (type) {
        case 'trade':
        case 'answer_bought':
        case 'answer_sold':
        case 'fee_earned':
          return preferences.trade;
        case 'pool_milestone':
        case 'pool_executed':
          return preferences.pool;
        case 'rank_change':
          return preferences.leaderboard;
        case 'price_alert':
          return preferences.priceAlerts;
        case 'system':
          return preferences.system;
        default:
          return true;
      }
    })();

    if (!shouldNotify) return;

    const notification: Notification = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      data,
      link,
    };

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });

    NotificationEvents.received(type);

    return notification.id;
  }, [preferences, saveNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });

    const notification = notifications.find(n => n.id === id);
    if (notification) {
      NotificationEvents.clicked(notification.type, id);
    }
  }, [saveNotifications, notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Dismiss a notification
  const dismiss = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);

    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });

    if (notification) {
      NotificationEvents.dismissed(notification.type);
    }
  }, [saveNotifications, notifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    if (address) {
      const storageKey = `${STORAGE_KEY}.${address.toLowerCase()}`;
      localStorage.removeItem(storageKey);
    }
  }, [address]);

  // Update preferences
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      if (address) {
        const prefsKey = `${PREFS_KEY}.${address.toLowerCase()}`;
        localStorage.setItem(prefsKey, JSON.stringify(updated));
      }

      // Track analytics for each changed preference
      Object.entries(newPrefs).forEach(([key, value]) => {
        NotificationEvents.settingsChanged(key, value as boolean);
      });

      return updated;
    });
  }, [address]);

  // Computed values
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  const hasUnread = unreadCount > 0;

  // Helper to create common notifications
  const notifyTrade = useCallback((
    opinionId: number,
    amount: number,
    isBuy: boolean
  ) => {
    addNotification(
      isBuy ? 'answer_bought' : 'answer_sold',
      isBuy ? 'Answer Purchased!' : 'Answer Sold!',
      `${isBuy ? 'You bought' : 'You sold'} an answer for ${amount.toFixed(2)} USDC`,
      { opinionId, amount },
      `/opinions/${opinionId}`
    );
  }, [addNotification]);

  const notifyFeeEarned = useCallback((
    opinionId: number,
    amount: number
  ) => {
    addNotification(
      'fee_earned',
      'Fee Earned!',
      `You earned ${amount.toFixed(4)} USDC in creator fees`,
      { opinionId, amount },
      '/profile'
    );
  }, [addNotification]);

  const notifyPoolMilestone = useCallback((
    poolId: number,
    milestone: number
  ) => {
    addNotification(
      'pool_milestone',
      'Pool Milestone!',
      `A pool you contributed to reached ${milestone}% of its target`,
      { poolId },
      `/pools/${poolId}`
    );
  }, [addNotification]);

  const notifyRankChange = useCallback((
    newRank: number,
    previousRank: number
  ) => {
    const improved = newRank < previousRank;
    addNotification(
      'rank_change',
      improved ? 'Rank Improved!' : 'Rank Changed',
      improved
        ? `You moved up to #${newRank} on the leaderboard!`
        : `Your rank changed to #${newRank}`,
      { rank: newRank, previousRank },
      '/leaderboard'
    );
  }, [addNotification]);

  return {
    notifications,
    preferences,
    unreadCount,
    hasUnread,
    isLoading,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    updatePreferences,
    // Helper functions
    notifyTrade,
    notifyFeeEarned,
    notifyPoolMilestone,
    notifyRankChange,
  };
}
