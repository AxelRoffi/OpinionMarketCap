import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format USDC amounts (6 decimals)
export function formatUSDC(amount: bigint | string | number): string {
  const value = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  const usdcAmount = value / 1_000_000; // 6 decimals
  
  if (usdcAmount >= 1_000_000) {
    return `$${(usdcAmount / 1_000_000).toFixed(1)}M`;
  } else if (usdcAmount >= 1_000) {
    return `$${(usdcAmount / 1_000).toFixed(1)}K`;
  } else if (usdcAmount >= 1) {
    return `$${usdcAmount.toFixed(2)}`;
  } else {
    return `$${usdcAmount.toFixed(4)}`;
  }
}

// Format percentage with sign and color class
export function formatPercentage(percentage: number): {
  text: string;
  className: string;
} {
  const abs = Math.abs(percentage);
  const sign = percentage > 0 ? '+' : percentage < 0 ? '-' : '';
  const className = percentage > 0 ? 'price-up' : percentage < 0 ? 'price-down' : 'price-neutral';
  
  return {
    text: `${sign}${abs.toFixed(2)}%`,
    className,
  };
}

// Truncate Ethereum addresses
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

// Calculate price change between two values
export function calculatePriceChange(currentPrice: bigint, previousPrice: bigint): number {
  if (previousPrice === 0n) return 0;
  const current = Number(currentPrice);
  const previous = Number(previousPrice);
  return ((current - previous) / previous) * 100;
}

// Calculate creation fee (20% with 5 USDC minimum)
export function calculateCreationFee(initialPrice: bigint): bigint {
  const twentyPercent = (initialPrice * 20n) / 100n;
  const minimum = 5_000_000n; // 5 USDC
  return twentyPercent < minimum ? minimum : twentyPercent;
}

// Parse USDC input to wei (6 decimals)
export function parseUSDC(value: string): bigint {
  const num = parseFloat(value);
  if (isNaN(num)) return 0n;
  return BigInt(Math.floor(num * 1_000_000));
}

// Format time ago
export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Generate opinion link
export function getOpinionLink(opinionId: number): string {
  return `/opinion/${opinionId}`;
}

// Get category color
export function getCategoryColor(category: string): string {
  const colors = {
    'Crypto': 'bg-orange-100 text-orange-800',
    'Politics': 'bg-blue-100 text-blue-800',
    'Science': 'bg-green-100 text-green-800',
    'Technology': 'bg-purple-100 text-purple-800',
    'Sports': 'bg-red-100 text-red-800',
    'Entertainment': 'bg-pink-100 text-pink-800',
    'Culture': 'bg-indigo-100 text-indigo-800',
    'Web': 'bg-cyan-100 text-cyan-800',
    'Social Media': 'bg-violet-100 text-violet-800',
    'Other': 'bg-gray-100 text-gray-800',
  };
  
  return colors[category as keyof typeof colors] || colors['Other'];
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}