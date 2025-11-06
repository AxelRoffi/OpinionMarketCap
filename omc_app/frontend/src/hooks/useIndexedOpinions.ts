// Enhanced hooks using indexed data for fast loading
import { useState, useEffect, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import { indexingService, IndexedOpinion } from '@/lib/indexing-service';

// Fast opinion fetching with cache
export function useIndexedOpinion(opinionId: number) {
  const [opinion, setOpinion] = useState<IndexedOpinion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback contract read for cache misses
  const { data: contractData, isLoading: contractLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(opinionId)],
    query: {
      enabled: opinionId > 0,
    },
  });

  const fetchOpinion = useCallback(async () => {
    try {
      const fallbackFetch = async (): Promise<IndexedOpinion> => {
        if (!contractData) throw new Error('No contract data');
        
        return {
          id: opinionId,
          question: contractData.question,
          currentAnswer: contractData.currentAnswer,
          currentAnswerOwner: contractData.currentAnswerOwner,
          creator: contractData.creator,
          nextPrice: contractData.nextPrice,
          lastPrice: contractData.lastPrice,
          totalVolume: contractData.totalVolume,
          categories: [...contractData.categories],
          isActive: contractData.isActive,
          link: contractData.link,
          lastUpdated: Date.now(),
        };
      };

      const result = await indexingService.getOpinion(opinionId, fallbackFetch);
      setOpinion(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opinion');
    } finally {
      setLoading(false);
    }
  }, [opinionId, contractData]);

  useEffect(() => {
    fetchOpinion();
  }, [fetchOpinion]);

  return {
    opinion,
    loading: loading || contractLoading,
    error,
    refetch: fetchOpinion
  };
}

// Fast loading for all opinions (homepage)
export function useIndexedOpinions() {
  const [opinions, setOpinions] = useState<IndexedOpinion[]>([]);
  const [loading, setLoading] = useState(true);

  // Get total opinion count for fallback
  const { data: nextOpinionId, isLoading: contractLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
    args: [],
  });

  useEffect(() => {
    // First check cache
    const cachedOpinions = indexingService.getAllOpinions();
    
    if (cachedOpinions.length > 0) {
      setOpinions(cachedOpinions);
      setLoading(false);
    } else if (nextOpinionId && !contractLoading) {
      // TODO: Implement proper contract-based opinion fetching using nextOpinionId
      // For now, rely on the indexing service to populate data
      console.log('Total opinions available:', Number(nextOpinionId) - 1);
      setLoading(false);
    }
  }, [nextOpinionId, contractLoading]);

  return {
    opinions,
    loading: loading || contractLoading,
    stats: indexingService.getStats()
  };
}

// Real-time events for an opinion
export function useOpinionEvents(opinionId: number) {
  const [events, setEvents] = useState(indexingService.getOpinionEvents(opinionId));

  useEffect(() => {
    // Refresh events every 5 seconds to catch new webhook data
    const interval = setInterval(() => {
      setEvents(indexingService.getOpinionEvents(opinionId));
    }, 5000);

    return () => clearInterval(interval);
  }, [opinionId]);

  return events;
}