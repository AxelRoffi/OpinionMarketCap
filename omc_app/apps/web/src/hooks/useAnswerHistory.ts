'use client'

import { useReadContract } from 'wagmi'
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts'

export interface AnswerHistoryEntry {
  answer: string
  description: string
  owner: string
  price: bigint
  timestamp: number
}

export interface RankedAnswer {
  answer: string
  description: string
  lastOwner: string
  lastPrice: bigint
  peakPrice: bigint
  lastTimestamp: number
  submissionCount: number
}

interface UseAnswerHistoryResult {
  history: AnswerHistoryEntry[]
  rankedAnswers: RankedAnswer[]
  totalUniqueAnswers: number
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch answer history for an opinion
 * Returns full history and ranked unique answers (by frequency and price)
 */
export function useAnswerHistory(opinionId: number): UseAnswerHistoryResult {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(opinionId)],
    query: {
      enabled: opinionId > 0,
      staleTime: 30_000, // Cache for 30 seconds
    }
  })

  // Transform the raw data into typed entries
  const history: AnswerHistoryEntry[] = data
    ? (data as readonly { answer: string; description: string; owner: `0x${string}`; price: bigint; timestamp: number }[]).map((entry) => ({
        answer: entry.answer,
        description: entry.description,
        owner: entry.owner,
        price: entry.price,
        timestamp: entry.timestamp,
      }))
    : []

  // Get ranked answers with frequency and peak price tracking
  const rankedAnswers = getRankedAnswers(history)

  return {
    history,
    rankedAnswers,
    totalUniqueAnswers: rankedAnswers.length,
    isLoading,
    error: error as Error | null,
  }
}

/**
 * Get unique answers ranked by popularity (submission count) and peak price
 * Tracks: submission count, peak price, most recent description/owner
 */
function getRankedAnswers(history: AnswerHistoryEntry[]): RankedAnswer[] {
  const answerMap = new Map<string, RankedAnswer>()

  // Process all entries to build frequency and peak price data
  for (const entry of history) {
    const key = entry.answer.toLowerCase().trim()
    const existing = answerMap.get(key)

    if (existing) {
      // Update existing entry
      existing.submissionCount += 1
      if (entry.price > existing.peakPrice) {
        existing.peakPrice = entry.price
      }
      // Keep most recent data
      if (entry.timestamp > existing.lastTimestamp) {
        existing.lastTimestamp = entry.timestamp
        existing.lastOwner = entry.owner
        existing.lastPrice = entry.price
        existing.description = entry.description || existing.description
      }
    } else {
      // Create new entry
      answerMap.set(key, {
        answer: entry.answer,
        description: entry.description,
        lastOwner: entry.owner,
        lastPrice: entry.price,
        peakPrice: entry.price,
        lastTimestamp: entry.timestamp,
        submissionCount: 1,
      })
    }
  }

  // Sort by: 1) submission count (desc), 2) peak price (desc), 3) recency (desc)
  return Array.from(answerMap.values()).sort((a, b) => {
    // Primary: submission count
    if (b.submissionCount !== a.submissionCount) {
      return b.submissionCount - a.submissionCount
    }
    // Secondary: peak price
    if (b.peakPrice !== a.peakPrice) {
      return Number(b.peakPrice - a.peakPrice)
    }
    // Tertiary: recency
    return b.lastTimestamp - a.lastTimestamp
  })
}

/**
 * Get price tier for color coding (1-5 scale)
 * Based on price relative to common thresholds
 */
export function getPriceTier(price: bigint): number {
  const usdc = Number(price) / 1_000_000
  if (usdc >= 50) return 5  // Hot (highest)
  if (usdc >= 25) return 4  // Warm
  if (usdc >= 10) return 3  // Medium
  if (usdc >= 5) return 2   // Cool
  return 1                   // Cold (lowest)
}

/**
 * Get color classes based on price tier
 */
export function getPriceTierColors(tier: number): {
  bg: string
  border: string
  text: string
  badge: string
} {
  switch (tier) {
    case 5: // Hot - Orange/Red
      return {
        bg: 'bg-gradient-to-r from-orange-500/20 to-red-500/20',
        border: 'border-orange-500/60',
        text: 'text-orange-300',
        badge: 'bg-orange-500/30 text-orange-200',
      }
    case 4: // Warm - Yellow/Orange
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500/60',
        text: 'text-yellow-300',
        badge: 'bg-yellow-500/30 text-yellow-200',
      }
    case 3: // Medium - Green/Yellow
      return {
        bg: 'bg-gradient-to-r from-emerald-500/20 to-yellow-500/20',
        border: 'border-emerald-500/60',
        text: 'text-emerald-300',
        badge: 'bg-emerald-500/30 text-emerald-200',
      }
    case 2: // Cool - Blue/Green
      return {
        bg: 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20',
        border: 'border-blue-500/60',
        text: 'text-blue-300',
        badge: 'bg-blue-500/30 text-blue-200',
      }
    default: // Cold - Purple/Blue
      return {
        bg: 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
        border: 'border-purple-500/60',
        text: 'text-purple-300',
        badge: 'bg-purple-500/30 text-purple-200',
      }
  }
}

/**
 * Format price from wei to USDC string
 */
export function formatHistoryPrice(price: bigint): string {
  const usdc = Number(price) / 1_000_000
  return `$${usdc.toFixed(2)}`
}

/**
 * Format timestamp to relative time
 */
export function formatHistoryTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
