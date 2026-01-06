/**
 * Pool-related TypeScript interfaces for OpinionMarketCap
 * Following existing patterns from opinion-types.ts
 */

import React from 'react';

export interface Pool {
  id: number;
  opinionId: number;
  proposedAnswer: string;
  name: string;
  creator: string;
  totalAmount: bigint;           // Total USDC contributed in wei
  targetPrice: bigint;           // Price needed to execute answer change
  deadline: number;              // Unix timestamp
  status: 'active' | 'executed' | 'expired';
  contributorCount: number;      // Number of unique contributors
  createdAt: number;            // Unix timestamp
  question?: string;            // Opinion question from smart contract
  category?: string;            // Opinion category from smart contract
  
  // Phase 2 ready properties (optional for now)
  contributions?: PoolContribution[];
  canJoin?: boolean;
  userContribution?: bigint;
  remainingAmount?: bigint;      // targetPrice - totalAmount
  progressPercentage?: number;   // (totalAmount / targetPrice) * 100
}

export interface PoolContribution {
  contributor: string;           // Ethereum address
  amount: bigint;               // USDC amount in wei
  timestamp: number;            // Unix timestamp when contributed
  transactionHash: string;      // Transaction hash for contribution
}

export interface CreatePoolForm {
  proposedAnswer: string;        // Max 40 characters
  poolName: string;             // Max 30 characters
  initialContribution: number;   // Minimum 1 USDC (in regular USDC units)
  deadline: Date;               // 1-60 days from now
  description?: string;         // Optional, max 300 characters
  externalLink?: string;        // Optional, must be valid URL
}

export interface PoolDetails extends Pool {
  currentOpinionAnswer: string;  // Current answer on the opinion
  currentOpinionPrice: bigint;   // Current price to change answer
  contributions: PoolContribution[];
  timeRemaining: number;         // Seconds until deadline
  executionReady: boolean;       // totalAmount >= targetPrice
}

export interface PlatformStats {
  totalActivePools: number;
  totalPooledAmount: string;     // Formatted USDC amount (e.g., "$1,234.56")
  avgSuccessRate: number;        // Percentage (0-100)
  poolsExecutedToday: number;
  avgTimeToExecution: number;    // Average hours
  topPoolByValue: Pool | null;
}

// Smart contract function interfaces
export interface PoolManagerContract {
  createPool: (
    opinionId: bigint,
    proposedAnswer: string,
    deadline: bigint,
    initialContribution: bigint,
    name: string
  ) => Promise<{
    transactionHash: string;
    poolId: bigint;
  }>;
  
  getPoolDetails: (poolId: bigint) => Promise<{
    poolInfo: Pool;
    currentPrice: bigint;
    remainingAmount: bigint;
    timeRemaining: bigint;
  }>;
  
  getOpinionPools: (opinionId: bigint) => Promise<bigint[]>;
}

// Hook return types following existing patterns
export interface UsePoolsReturn {
  pools: Pool[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCreatePoolReturn {
  createPool: (formData: CreatePoolForm, opinionId: number) => Promise<boolean>;
  isCreating: boolean;
  error: string | null;
  txHash: string | null;
}

export interface UsePoolDetailsReturn {
  pool: PoolDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Form validation interfaces
export interface CreatePoolValidation {
  proposedAnswer: {
    isValid: boolean;
    error?: string;
  };
  poolName: {
    isValid: boolean;
    error?: string;
  };
  initialContribution: {
    isValid: boolean;
    error?: string;
  };
  deadline: {
    isValid: boolean;
    error?: string;
  };
  description?: {
    isValid: boolean;
    error?: string;
  };
  externalLink?: {
    isValid: boolean;
    error?: string;
  };
}

// Filter and sort interfaces for pools page
export interface PoolFilters {
  status: 'all' | 'active' | 'executed' | 'expired';
  category: string | 'all';
  sortBy: 'deadline' | 'totalAmount' | 'contributorCount' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  search: string;
}

// Bootstrap and empty state interfaces
export interface EmptyPoolStateProps {
  onCreateFirst: () => void;
  className?: string;
}

// Pool card display interfaces
export interface PoolCardProps {
  pool: Pool;
  showJoinButton?: boolean;  // Phase 2 ready
  onJoinClick?: (poolId: number) => void;  // Phase 2 ready
  className?: string;
}

export interface PoolStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string; }>;  // Lucide icon component
  trend?: {
    value: number;
    isPositive: boolean;
  };
}