'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import { getContracts } from '@/lib/contracts';

interface MarketCapPoint {
  timestamp: number;
  totalMarketCap: number; // in USD (not scaled)
  eventType: 'buy' | 'sell' | 'initial';
}

interface UseTotalMarketCapHistoryResult {
  history: MarketCapPoint[];
  isLoading: boolean;
  currentMarketCap: number;
  allTimeHigh: number;
  allTimeLow: number;
  changePercent: number;
  isPositive: boolean;
}

/**
 * Hook to fetch total market cap history for a question (sum of all answer pools)
 * @param answerIds - Array of answer IDs for this question
 * @param currentTotalMarketCap - Current total market cap from contract state (in 1e6 format)
 */
export function useTotalMarketCapHistory(
  answerIds: bigint[],
  currentTotalMarketCap: bigint
): UseTotalMarketCapHistoryResult {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const publicClient = usePublicClient();

  const [history, setHistory] = useState<MarketCapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!publicClient || answerIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);

      try {
        // Fetch all buy and sell events for all answers
        const buyPromises = answerIds.map((answerId) =>
          publicClient.getLogs({
            address: contracts.ANSWER_SHARES_CORE,
            event: parseAbiItem('event SharesBought(uint256 indexed answerId, address indexed buyer, uint256 shares, uint256 cost, uint256 newPrice)'),
            args: { answerId },
            fromBlock: 'earliest',
            toBlock: 'latest',
          })
        );

        const sellPromises = answerIds.map((answerId) =>
          publicClient.getLogs({
            address: contracts.ANSWER_SHARES_CORE,
            event: parseAbiItem('event SharesSold(uint256 indexed answerId, address indexed seller, uint256 shares, uint256 returnAmount, uint256 newPrice)'),
            args: { answerId },
            fromBlock: 'earliest',
            toBlock: 'latest',
          })
        );

        const [buyResults, sellResults] = await Promise.all([
          Promise.all(buyPromises),
          Promise.all(sellPromises),
        ]);

        // Combine all events with their cost/return amounts
        interface TradeEvent {
          blockNumber: bigint;
          answerId: bigint;
          amount: bigint; // cost for buy (adds to pool), returnAmount for sell (removes from pool)
          type: 'buy' | 'sell';
        }

        const allEvents: TradeEvent[] = [];

        buyResults.forEach((events) => {
          events.forEach((e) => {
            allEvents.push({
              blockNumber: e.blockNumber,
              answerId: e.args.answerId!,
              amount: e.args.cost!, // Amount added to pool
              type: 'buy',
            });
          });
        });

        sellResults.forEach((events) => {
          events.forEach((e) => {
            allEvents.push({
              blockNumber: e.blockNumber,
              answerId: e.args.answerId!,
              amount: e.args.returnAmount!, // Amount removed from pool
              type: 'sell',
            });
          });
        });

        // Sort by block number
        allEvents.sort((a, b) => Number(a.blockNumber - b.blockNumber));

        // Calculate cumulative market cap at each point
        // Start with initial stakes ($5 per answer = 5 USDC = 5e6)
        const INITIAL_STAKE_PER_ANSWER = 5e6; // 5 USDC in 1e6 format
        let runningTotal = answerIds.length * INITIAL_STAKE_PER_ANSWER;

        const historyPoints: MarketCapPoint[] = [];
        const now = Date.now();
        const timeSpacing = 3600000; // 1 hour apart for visualization

        // Add initial point (when question was created with initial stakes)
        historyPoints.push({
          timestamp: now - ((allEvents.length + 1) * timeSpacing),
          totalMarketCap: runningTotal / 1e6,
          eventType: 'initial',
        });

        // Process each event and calculate running total
        // Note: Buy events ADD to pool (cost goes in), Sell events REMOVE from pool (returnAmount goes out)
        // But we also need to account for fees... For simplicity, we'll approximate by using the event amounts
        allEvents.forEach((event, index) => {
          if (event.type === 'buy') {
            // When someone buys, their cost (minus fees) goes into the pool
            // Approximate: ~98% goes to pool after 2% fees
            runningTotal += Number(event.amount) * 0.98;
          } else {
            // When someone sells, returnAmount comes out of pool
            runningTotal -= Number(event.amount);
          }

          // Ensure we don't go negative
          runningTotal = Math.max(0, runningTotal);

          historyPoints.push({
            timestamp: now - ((allEvents.length - index) * timeSpacing),
            totalMarketCap: runningTotal / 1e6,
            eventType: event.type,
          });
        });

        // Add current state as final point
        const currentMarketCapNum = Number(currentTotalMarketCap) / 1e6;
        if (historyPoints.length > 0) {
          const lastPoint = historyPoints[historyPoints.length - 1];
          if (Math.abs(currentMarketCapNum - lastPoint.totalMarketCap) > 0.01) {
            historyPoints.push({
              timestamp: now,
              totalMarketCap: currentMarketCapNum,
              eventType: 'initial',
            });
          }
        }

        setHistory(historyPoints);
      } catch (error) {
        console.error('[useTotalMarketCapHistory] Failed to fetch events:', error);
        // Fallback: just show current value
        const currentMarketCapNum = Number(currentTotalMarketCap) / 1e6;
        setHistory([
          { timestamp: Date.now() - 86400000, totalMarketCap: currentMarketCapNum, eventType: 'initial' },
          { timestamp: Date.now(), totalMarketCap: currentMarketCapNum, eventType: 'initial' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [publicClient, answerIds, currentTotalMarketCap, contracts.ANSWER_SHARES_CORE]);

  // Calculate statistics
  const stats = useMemo(() => {
    const currentMarketCap = Number(currentTotalMarketCap) / 1e6;

    if (history.length === 0) {
      return {
        currentMarketCap,
        allTimeHigh: currentMarketCap,
        allTimeLow: currentMarketCap,
        changePercent: 0,
        isPositive: true,
      };
    }

    const values = history.map((p) => p.totalMarketCap);
    const firstValue = values[0] || currentMarketCap;
    const allTimeHigh = Math.max(...values, currentMarketCap);
    const allTimeLow = Math.min(...values, currentMarketCap);
    const changePercent = firstValue > 0 ? ((currentMarketCap - firstValue) / firstValue) * 100 : 0;

    return {
      currentMarketCap,
      allTimeHigh,
      allTimeLow,
      changePercent,
      isPositive: changePercent >= 0,
    };
  }, [history, currentTotalMarketCap]);

  return {
    history,
    isLoading,
    ...stats,
  };
}
