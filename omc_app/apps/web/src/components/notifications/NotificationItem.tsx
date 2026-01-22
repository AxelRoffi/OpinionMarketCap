'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Users,
  Bell,
  AlertCircle,
  X,
  MessageSquare,
} from 'lucide-react';

import type { Notification, NotificationType } from './types';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const ICON_MAP: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  trade: TrendingUp,
  answer_bought: TrendingUp,
  answer_sold: TrendingDown,
  fee_earned: DollarSign,
  pool_milestone: Users,
  pool_executed: Users,
  rank_change: Trophy,
  new_answer: MessageSquare,
  price_alert: AlertCircle,
  system: Bell,
};

const COLOR_MAP: Record<NotificationType, string> = {
  trade: 'text-emerald-400 bg-emerald-400/10',
  answer_bought: 'text-emerald-400 bg-emerald-400/10',
  answer_sold: 'text-amber-400 bg-amber-400/10',
  fee_earned: 'text-green-400 bg-green-400/10',
  pool_milestone: 'text-blue-400 bg-blue-400/10',
  pool_executed: 'text-purple-400 bg-purple-400/10',
  rank_change: 'text-yellow-400 bg-yellow-400/10',
  new_answer: 'text-cyan-400 bg-cyan-400/10',
  price_alert: 'text-orange-400 bg-orange-400/10',
  system: 'text-slate-400 bg-slate-400/10',
};

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: NotificationItemProps) {
  const Icon = ICON_MAP[notification.type];
  const colorClass = COLOR_MAP[notification.type];
  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true });

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDismiss(notification.id);
  };

  const content = (
    <div
      className={`group relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        notification.read
          ? 'bg-transparent hover:bg-slate-800/50'
          : 'bg-slate-800/50 hover:bg-slate-800'
      }`}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 left-0 w-1 h-8 bg-blue-500 rounded-r" />
      )}

      {/* Icon */}
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}>
            {notification.title}
          </p>
          <button
            onClick={handleDismiss}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-opacity"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {timeAgo}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
