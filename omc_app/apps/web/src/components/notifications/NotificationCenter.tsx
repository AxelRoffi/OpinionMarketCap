'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import {
  Bell,
  Settings,
  Check,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from './useNotifications';
import { NotificationItem } from './NotificationItem';

export function NotificationCenter() {
  const {
    notifications,
    preferences,
    unreadCount,
    hasUnread,
    isConnected,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    updatePreferences,
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected) {
    return null;
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5 text-slate-400" />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {showSettings ? (
              <NotificationSettings
                key="settings"
                preferences={preferences}
                onUpdatePreferences={updatePreferences}
                onBack={() => setShowSettings(false)}
              />
            ) : (
              <motion.div
                key="notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <div className="flex items-center gap-1">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={markAllAsRead}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Mark all as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={clearAll}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Clear all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">No notifications yet</p>
                      <p className="text-slate-500 text-xs mt-1">
                        We'll notify you about trades, pools, and more
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={markAsRead}
                          onDismiss={dismiss}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Settings Panel
interface NotificationSettingsPrefs {
  trade: boolean;
  pool: boolean;
  leaderboard: boolean;
  priceAlerts: boolean;
  system: boolean;
}

interface NotificationSettingsProps {
  preferences: NotificationSettingsPrefs;
  onUpdatePreferences: (prefs: Partial<NotificationSettingsPrefs>) => void;
  onBack: () => void;
}

function NotificationSettings({
  preferences,
  onUpdatePreferences,
  onBack,
}: NotificationSettingsProps) {
  const settings = [
    {
      id: 'trade',
      label: 'Trade Alerts',
      description: 'When your opinions are traded',
    },
    {
      id: 'pool',
      label: 'Pool Updates',
      description: 'Pool milestones and execution',
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      description: 'Rank changes and achievements',
    },
    {
      id: 'priceAlerts',
      label: 'Price Alerts',
      description: 'Custom price notifications',
    },
    {
      id: 'system',
      label: 'System',
      description: 'Important platform updates',
    },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-white">Notification Settings</h3>
      </div>

      {/* Settings List */}
      <div className="p-4 space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">{setting.label}</Label>
              <p className="text-slate-500 text-xs">{setting.description}</p>
            </div>
            <Switch
              checked={preferences[setting.id]}
              onCheckedChange={(checked) =>
                onUpdatePreferences({ [setting.id]: checked })
              }
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
