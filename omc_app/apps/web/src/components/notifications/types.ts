export type NotificationType =
  | 'trade'           // Your opinion was traded
  | 'answer_bought'   // Someone bought your answer
  | 'answer_sold'     // You sold your answer
  | 'fee_earned'      // You earned creator fees
  | 'pool_milestone'  // Pool hit milestone (50%, 75%, 100%)
  | 'pool_executed'   // Pool executed
  | 'rank_change'     // Leaderboard rank changed
  | 'new_answer'      // New answer on your question
  | 'price_alert'     // Price alert triggered
  | 'system';         // System notification

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    opinionId?: number;
    poolId?: number;
    amount?: number;
    price?: number;
    rank?: number;
    previousRank?: number;
    txHash?: string;
  };
  link?: string;
}

export interface NotificationPreferences {
  trade: boolean;
  pool: boolean;
  leaderboard: boolean;
  priceAlerts: boolean;
  system: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  trade: true,
  pool: true,
  leaderboard: true,
  priceAlerts: true,
  system: true,
};
