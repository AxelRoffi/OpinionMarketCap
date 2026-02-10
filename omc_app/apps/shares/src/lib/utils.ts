import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSDC(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) / 1e6 : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShares(shares: bigint | number): string {
  const value = typeof shares === "bigint" ? Number(shares) : shares;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function parseUSDCInput(input: string): bigint {
  try {
    const cleaned = input.replace(/[^0-9.]/g, '');
    if (!cleaned || cleaned === '.') return 0n;

    const parts = cleaned.split('.');
    const whole = parts[0] || '0';
    const decimal = (parts[1] || '').slice(0, 6).padEnd(6, '0');

    return BigInt(whole) * BigInt(1e6) + BigInt(decimal);
  } catch {
    return 0n;
  }
}

export function formatNumber(value: number | bigint): string {
  const num = typeof value === 'bigint' ? Number(value) : value;

  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;

  return num.toLocaleString();
}

// ============================================
// Duplicate Answer Detection Utilities
// ============================================

// Common suffixes/words to strip for normalization
const STRIP_WORDS = [
  'blockchain', 'chain', 'network', 'protocol', 'token', 'coin',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'layer', 'l1', 'l2', 'layer1', 'layer2', 'layer-1', 'layer-2',
];

/**
 * Normalizes answer text for comparison
 * - Lowercase
 * - Remove punctuation and extra spaces
 * - Remove common suffixes like "blockchain", "network", etc.
 */
export function normalizeAnswerText(text: string): string {
  let normalized = text
    .toLowerCase()
    .trim()
    // Remove punctuation
    .replace(/[^\w\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');

  // Remove common words
  const words = normalized.split(' ').filter(word =>
    !STRIP_WORDS.includes(word) && word.length > 0
  );

  return words.join(' ');
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score from 0 to 1, where 1 = identical
 */
export function getSimilarityScore(str1: string, str2: string): number {
  const s1 = normalizeAnswerText(str1);
  const s2 = normalizeAnswerText(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Levenshtein distance
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

export interface SimilarAnswer {
  text: string;
  score: number;
  normalizedNew: string;
  normalizedExisting: string;
}

/**
 * Find similar answers from existing list
 * Returns answers with similarity score >= threshold (default 0.7)
 */
export function findSimilarAnswers(
  newAnswer: string,
  existingAnswers: { text: string }[],
  threshold: number = 0.7
): SimilarAnswer[] {
  const normalizedNew = normalizeAnswerText(newAnswer);

  if (!normalizedNew) return [];

  const similar: SimilarAnswer[] = [];

  for (const existing of existingAnswers) {
    const score = getSimilarityScore(newAnswer, existing.text);
    if (score >= threshold) {
      similar.push({
        text: existing.text,
        score,
        normalizedNew,
        normalizedExisting: normalizeAnswerText(existing.text),
      });
    }
  }

  // Sort by similarity score descending
  return similar.sort((a, b) => b.score - a.score);
}
