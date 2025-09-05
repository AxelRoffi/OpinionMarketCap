import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format USDC amounts (from Wei with 6 decimals to display format)
export function formatUSDC(amount: bigint | number | string): string {
  if (typeof amount === 'bigint') {
    // Convert from Wei (6 decimals) to regular number
    const num = Number(amount) / 1e6;
    return num.toFixed(2);
  } else if (typeof amount === 'number') {
    return amount.toFixed(2);
  } else {
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }
}