// app/lib/helpers.ts
import { OpinionWithMetadata } from '@/types';
import { formatUnits, parseUnits } from 'viem';

// Format USDC amount from wei to human-readable format (6 decimals for USDC)
export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

// Parse USDC amount from human-readable format to wei
export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, 6);
}

// Calculate and format price change percentage
export function calculatePriceChange(nextPrice: bigint, currentPrice: bigint): {
  formatted: string;
  value: number;
} {
  if (currentPrice === BigInt(0)) return { formatted: '+0%', value: 0 };
  
  const change = (Number(nextPrice) - Number(currentPrice)) / Number(currentPrice) * 100;
  return {
    formatted: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
    value: change
  };
}

// Shorten address for display
export function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Format timestamp to relative time
export function formatTimeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Enhance opinion with display metadata
export function enhanceOpinionWithMetadata(opinion: Opinion): OpinionWithMetadata {
  const priceChange = calculatePriceChange(opinion.nextPrice, opinion.currentPrice);
  
  return {
    ...opinion,
    formattedPrice: formatUSDC(opinion.currentPrice),
    formattedNextPrice: formatUSDC(opinion.nextPrice),
    formattedVolume: formatUSDC(opinion.totalVolume),
    priceChange: priceChange.formatted,
    priceChangeValue: priceChange.value
  };
}