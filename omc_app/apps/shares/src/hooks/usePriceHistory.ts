'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import { getContracts } from '@/lib/contracts';

export interface PricePoint {
  timestamp: number;
  price: number; // in USD (not scaled)
  type: 'buy' | 'sell' | 'initial';
}

interface UsePriceHistoryResult {
  priceHistory: PricePoint[];
  priceChange: number;
  isLoading: boolean;
  isPositive: boolean;
  firstPrice: number;
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  tradeCount: number;
}

// Price precision: contract uses 12 decimals (6 USDC + 6 precision)
// So $1.00 = 1e12 in contract format
const PRICE_DECIMALS = 1e12;

/**
 * Hook to fetch price history for an answer from blockchain events
 * @param answerId - The answer ID to fetch history for
 * @param currentPrice - The current price per share (from contract state, in 1e12 format)
 */
export function usePriceHistory(answerId: bigint, currentPrice?: bigint): UsePriceHistoryResult {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const publicClient = usePublicClient();

  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeCount, setTradeCount] = useState(0);

  useEffect(() => {
    if (!publicClient || !answerId) {
      setIsLoading(false);
      return;
    }

    const fetchPriceHistory = async () => {
      setIsLoading(true);

      try {
        // Fetch SharesBought events
        const buyEvents = await publicClient.getLogs({
          address: contracts.ANSWER_SHARES_CORE,
          event: parseAbiItem('event SharesBought(uint256 indexed answerId, address indexed buyer, uint256 shares, uint256 cost, uint256 newPrice)'),
          args: { answerId },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Fetch SharesSold events
        const sellEvents = await publicClient.getLogs({
          address: contracts.ANSWER_SHARES_CORE,
          event: parseAbiItem('event SharesSold(uint256 indexed answerId, address indexed seller, uint256 shares, uint256 returnAmount, uint256 newPrice)'),
          args: { answerId },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        setTradeCount(buyEvents.length + sellEvents.length);

        // Combine and sort by block number
        const allEvents = [
          ...buyEvents.map(e => ({
            blockNumber: e.blockNumber,
            price: Number(e.args.newPrice || 0n) / PRICE_DECIMALS,
            type: 'buy' as const,
          })),
          ...sellEvents.map(e => ({
            blockNumber: e.blockNumber,
            price: Number(e.args.newPrice || 0n) / PRICE_DECIMALS,
            type: 'sell' as const,
          })),
        ].sort((a, b) => Number(a.blockNumber - b.blockNumber));

        // Build price history with timestamps
        const history: PricePoint[] = [];
        const now = Date.now();
        const timeSpacing = 3600000; // 1 hour apart for visualization

        // Add initial price point ($1 starting price for all answers)
        const initialAnswerPrice = 1.0; // All answers start at $1
        history.push({
          timestamp: now - ((allEvents.length + 1) * timeSpacing),
          price: initialAnswerPrice,
          type: 'initial',
        });

        // Add events (use block number as proxy for time ordering)
        allEvents.forEach((event, index) => {
          history.push({
            timestamp: now - ((allEvents.length - index) * timeSpacing),
            price: event.price,
            type: event.type,
          });
        });

        // Always add current price as the final point (from contract state)
        if (currentPrice) {
          const currentPriceNum = Number(currentPrice) / PRICE_DECIMALS;
          // Only add if different from last event price to avoid duplicates
          const lastEventPrice = history[history.length - 1]?.price;
          if (Math.abs(currentPriceNum - (lastEventPrice || 0)) > 0.0001) {
            history.push({
              timestamp: now,
              price: currentPriceNum,
              type: 'initial', // Current state
            });
          }
        }

        setPriceHistory(history);
      } catch (error) {
        console.error('[usePriceHistory] Failed to fetch events:', error);
        // Fallback: show initial $1 to current price
        const initialPrice = 1.0;
        const currentPriceNum = currentPrice ? Number(currentPrice) / PRICE_DECIMALS : initialPrice;
        setPriceHistory([
          { timestamp: Date.now() - 86400000, price: initialPrice, type: 'initial' },
          { timestamp: Date.now(), price: currentPriceNum, type: 'initial' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceHistory();
  }, [publicClient, answerId, currentPrice, contracts.ANSWER_SHARES_CORE]);

  // Calculate statistics from price history
  const stats = useMemo(() => {
    if (priceHistory.length === 0) {
      const currentPriceNum = currentPrice ? Number(currentPrice) / PRICE_DECIMALS : 1.0;
      return {
        firstPrice: 1.0, // All answers start at $1
        lastPrice: currentPriceNum,
        highPrice: currentPriceNum,
        lowPrice: currentPriceNum,
        priceChange: ((currentPriceNum - 1.0) / 1.0) * 100,
      };
    }

    const prices = priceHistory.map(p => p.price);
    const firstPrice = prices[0] || 1.0;
    const lastPrice = prices[prices.length - 1] || firstPrice;
    const highPrice = Math.max(...prices);
    const lowPrice = Math.min(...prices);

    // Calculate % change from initial $1 to current price
    const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

    return { firstPrice, lastPrice, highPrice, lowPrice, priceChange };
  }, [priceHistory, currentPrice]);

  return {
    priceHistory,
    priceChange: stats.priceChange,
    isLoading,
    isPositive: stats.priceChange >= 0,
    firstPrice: stats.firstPrice,
    lastPrice: stats.lastPrice,
    highPrice: stats.highPrice,
    lowPrice: stats.lowPrice,
    tradeCount,
  };
}
