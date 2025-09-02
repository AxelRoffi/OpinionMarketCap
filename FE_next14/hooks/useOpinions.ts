'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';
import { Opinion, AnswerHistory } from '@/lib/types';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import { calculatePriceChange } from '@/lib/utils';

export const useOpinions = () => {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current block number for real-time updates
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Read total number of opinions
  const { data: nextOpinionId, refetch: refetchCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  const totalOpinions = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  const fetchOpinions = async () => {
    if (!nextOpinionId || totalOpinions === 0) {
      setOpinions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all opinions from API
      const response = await fetch('/api/opinions');
      if (!response.ok) {
        throw new Error('Failed to fetch opinions');
      }

      const opinionsData = await response.json();
      
      // Fetch price change data for each opinion
      const opinionsWithChange = await Promise.all(
        opinionsData.map(async (opinion: Opinion) => {
          try {
            const historyResponse = await fetch(`/api/opinion/${opinion.id}/history`);
            if (historyResponse.ok) {
              const history: AnswerHistory[] = await historyResponse.json();
              
              let priceChange = 0;
              let priceChangeDirection: 'up' | 'down' | 'neutral' = 'neutral';
              
              if (history && history.length >= 2) {
                const currentPrice = history[history.length - 1].price;
                const previousPrice = history[history.length - 2].price;
                priceChange = calculatePriceChange(currentPrice, previousPrice);
                priceChangeDirection = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral';
              }
              
              return {
                ...opinion,
                priceChange,
                priceChangeDirection,
              };
            }
            return opinion;
          } catch (err) {
            console.error(`Error fetching history for opinion ${opinion.id}:`, err);
            return opinion;
          }
        })
      );
      
      setOpinions(opinionsWithChange);
    } catch (err) {
      console.error('Error fetching opinions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opinions');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    refetchCount();
    fetchOpinions();
  };

  // Initial load and refresh when block changes
  useEffect(() => {
    fetchOpinions();
  }, [nextOpinionId, blockNumber]);

  return {
    opinions,
    loading,
    error,
    totalOpinions,
    refresh,
  };
};