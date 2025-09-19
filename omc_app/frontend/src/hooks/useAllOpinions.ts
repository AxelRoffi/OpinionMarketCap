import { useReadContract, useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

interface OpinionData {
  id: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  currentAnswerOwner: string;
  questionOwner: string;
  salePrice: bigint;
  isActive: boolean;
  creator: string;
  categories: string[];
  currentAnswerDescription?: string;
  link?: string;
  tradesCount?: number;
}

// Custom hook to fetch ALL opinions dynamically - TRULY SCALABLE
export function useAllOpinions() {
  // Get total opinion count first
  const { data: nextOpinionId, isLoading: isLoadingCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  // Calculate total opinions that exist
  const totalOpinionsCount = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  // Create batch contract calls for ALL opinions
  const opinionContracts = useMemo(() => {
    if (!nextOpinionId || totalOpinionsCount === 0) return [];
    
    const contracts = [];
    for (let i = 1; i <= totalOpinionsCount; i++) {
      contracts.push({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'getOpinionDetails',
        args: [BigInt(i)],
      } as const);
    }
    
    console.log(`🔄 Creating ${contracts.length} contract calls for opinions 1-${totalOpinionsCount}`);
    return contracts;
  }, [nextOpinionId, totalOpinionsCount]);

  // Fetch ALL opinions in parallel using useReadContracts
  const { 
    data: opinionsRawData, 
    isLoading: isLoadingOpinions,
    error: opinionsError 
  } = useReadContracts({
    contracts: opinionContracts,
    query: {
      enabled: opinionContracts.length > 0,
      staleTime: 30000, // Cache for 30 seconds
      gcTime: 60000, // Keep in cache for 1 minute (renamed from cacheTime)
    }
  });

  // Process all opinion data
  const allOpinions: OpinionData[] = useMemo(() => {
    if (!opinionsRawData || isLoadingOpinions || !nextOpinionId) {
      return [];
    }

    console.log('=== TRULY DYNAMIC OPINION FETCHING ===');
    console.log('Next Opinion ID:', nextOpinionId?.toString());
    console.log('Total Opinions to fetch:', totalOpinionsCount);
    console.log('Raw data received:', opinionsRawData.length);

    const opinions: OpinionData[] = [];
    
    opinionsRawData.forEach((result, index) => {
      const opinionId = index + 1;
      
      if (result.status === 'success' && result.result) {
        const data = result.result as Record<string, unknown>;
        
        console.log(`✅ Processing Opinion ${opinionId}:`, {
          question: data?.question,
          answer: data?.currentAnswer,
          categories: data?.categories,
          isActive: data?.isActive,
          link: data?.link
        });
        
        opinions.push({
          id: opinionId,
          question: String(data?.question || ''),
          currentAnswer: String(data?.currentAnswer || ''),
          nextPrice: (data?.nextPrice as bigint) || BigInt(0),
          lastPrice: (data?.lastPrice as bigint) || BigInt(0),
          totalVolume: (data?.totalVolume as bigint) || BigInt(0),
          currentAnswerOwner: String(data?.currentAnswerOwner || ''),
          questionOwner: String(data?.questionOwner || ''),
          salePrice: (data?.salePrice as bigint) || BigInt(0),
          isActive: Boolean(data?.isActive),
          creator: String(data?.creator || ''),
          categories: (data?.categories as string[]) || [],
          currentAnswerDescription: String(data?.currentAnswerDescription || ''),
          link: String(data?.link || ''),
          tradesCount: Math.ceil(Number(data?.totalVolume || BigInt(0)) / Number(data?.lastPrice || BigInt(1_000_000))),
        });
      } else {
        console.log(`❌ Opinion ${opinionId} failed:`, result.status, result.error?.message);
      }
    });
    
    console.log('Final opinions processed:', opinions.length);
    console.log('Expected vs Actual:', totalOpinionsCount, 'vs', opinions.length);
    
    // Sort by ID to ensure proper ordering
    return opinions.sort((a, b) => a.id - b.id);
  }, [opinionsRawData, isLoadingOpinions, nextOpinionId, totalOpinionsCount]);

  // Overall loading state
  const isLoading = isLoadingCount || isLoadingOpinions;

  console.log(`🎯 FINAL HOOK RESULT: ${allOpinions.length} opinions loaded, loading: ${isLoading}`);

  return {
    opinions: allOpinions,
    isLoading,
    error: opinionsError,
    nextOpinionId,
    totalOpinions: totalOpinionsCount
  };
}