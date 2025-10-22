// Centralized formatting utilities for consistent display across the app

export function formatUSDC(wei: bigint | number): string {
  const usdc = Number(wei) / 1_000_000;
  return `$${usdc.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatQuestion(question: string): string {
  const cleanQuestion = question.trim();
  // Always ensure questions end with "?" for consistency
  if (!cleanQuestion.endsWith('?')) {
    return `${cleanQuestion}?`;
  }
  return cleanQuestion;
}