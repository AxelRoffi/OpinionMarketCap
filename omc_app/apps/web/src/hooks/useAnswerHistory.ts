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

interface UseAnswerHistoryResult {
  history: AnswerHistoryEntry[]
  uniqueAnswers: AnswerHistoryEntry[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch answer history for an opinion
 * Returns both full history and unique answers (deduplicated by answer text)
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

  // Get unique answers (most recent submission of each unique answer text)
  // This is useful for showing revival options without duplicates
  const uniqueAnswers = getUniqueAnswers(history)

  return {
    history,
    uniqueAnswers,
    isLoading,
    error: error as Error | null,
  }
}

/**
 * Get unique answers, keeping the most recent submission of each
 * Also sorts by most recently submitted first
 */
function getUniqueAnswers(history: AnswerHistoryEntry[]): AnswerHistoryEntry[] {
  const answerMap = new Map<string, AnswerHistoryEntry>()

  // Process in order - later entries overwrite earlier ones (keeps most recent)
  for (const entry of history) {
    const key = entry.answer.toLowerCase().trim()
    // Always update to keep the most recent version with latest price/description
    answerMap.set(key, entry)
  }

  // Convert to array and sort by timestamp (most recent first)
  return Array.from(answerMap.values())
    .sort((a, b) => b.timestamp - a.timestamp)
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
