'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Type for watchlist item
export interface WatchlistItem {
  opinionId: number;
  question: string;
  currentPrice: bigint;
  addedAt: number;
}

// Custom hook for managing watchlist functionality
export function useWatchlist() {
  const { address } = useAccount();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate unique key for each user's watchlist
  const getWatchlistKey = () => {
    return address ? `watchlist_${address.toLowerCase()}` : 'watchlist_anonymous';
  };

  // Load watchlist from localStorage on mount and address change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = getWatchlistKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert bigint strings back to bigint
          const converted = parsed.map((item: any) => ({
            ...item,
            currentPrice: BigInt(item.currentPrice)
          }));
          setWatchlist(converted);
        } catch (error) {
          console.error('Error parsing watchlist:', error);
          setWatchlist([]);
        }
      }
      setIsLoading(false);
    }
  }, [address]);

  // Save watchlist to localStorage
  const saveWatchlist = (newWatchlist: WatchlistItem[]) => {
    if (typeof window !== 'undefined') {
      const key = getWatchlistKey();
      // Convert bigint to string for storage
      const serializable = newWatchlist.map(item => ({
        ...item,
        currentPrice: item.currentPrice.toString()
      }));
      localStorage.setItem(key, JSON.stringify(serializable));
      setWatchlist(newWatchlist);
    }
  };

  // Check if opinion is in watchlist
  const isWatched = (opinionId: number): boolean => {
    return watchlist.some(item => item.opinionId === opinionId);
  };

  // Add opinion to watchlist
  const addToWatchlist = (opinion: { 
    id: number; 
    question: string; 
    nextPrice: bigint; 
  }) => {
    if (isWatched(opinion.id)) return false;

    const newItem: WatchlistItem = {
      opinionId: opinion.id,
      question: opinion.question,
      currentPrice: opinion.nextPrice,
      addedAt: Date.now()
    };

    const newWatchlist = [...watchlist, newItem];
    saveWatchlist(newWatchlist);
    return true;
  };

  // Remove opinion from watchlist
  const removeFromWatchlist = (opinionId: number) => {
    const newWatchlist = watchlist.filter(item => item.opinionId !== opinionId);
    saveWatchlist(newWatchlist);
    return true;
  };

  // Toggle watchlist status
  const toggleWatchlist = (opinion: { 
    id: number; 
    question: string; 
    nextPrice: bigint; 
  }) => {
    if (isWatched(opinion.id)) {
      removeFromWatchlist(opinion.id);
      return false; // Not watched anymore
    } else {
      addToWatchlist(opinion);
      return true; // Now watched
    }
  };

  // Get watchlist count
  const getWatchlistCount = (): number => {
    return watchlist.length;
  };

  // Clear entire watchlist
  const clearWatchlist = () => {
    saveWatchlist([]);
  };

  return {
    watchlist,
    isLoading,
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    getWatchlistCount,
    clearWatchlist
  };
}

// Share functionality hook - with toast notifications
export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareOpinion = async (
    opinion: {
      id: number;
      question: string;
      currentAnswer: string;
      nextPrice: bigint;
    },
    onSuccess?: (message: string) => void,
    onError?: (message: string) => void
  ) => {
    setIsSharing(true);
    
    const url = `${window.location.origin}/opinions/${opinion.id}`;
    const title = `Check out this opinion: ${opinion.question}`;
    const text = `Current Answer: "${opinion.currentAnswer}" | Price: $${(Number(opinion.nextPrice) / 1_000_000).toFixed(2)} USDC`;

    try {
      // Try native sharing first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url
        });
        onSuccess?.('Opinion shared successfully!');
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(url);
        onSuccess?.('Opinion URL copied to clipboard!');
      }
    } catch (error) {
      // If native sharing fails or is canceled, try clipboard
      try {
        await navigator.clipboard.writeText(url);
        onSuccess?.('Opinion URL copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to share:', error, clipboardError);
        onError?.('Unable to share. Please copy the URL manually.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareOpinion,
    isSharing
  };
}