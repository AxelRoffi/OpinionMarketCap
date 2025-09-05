import { useReadContract } from 'wagmi';
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
  tradesCount?: number;
}

// Custom hook to fetch all opinions (fixed version)
export function useAllOpinions() {
  // Get total opinion count
  const { data: nextOpinionId, isLoading: isLoadingCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  // Fetch known opinions dynamically based on nextOpinionId
  const opinion1 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(1)],
    query: { enabled: Boolean(nextOpinionId && Number(nextOpinionId) >= 2) }
  });

  const opinion2 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(2)],
    query: { enabled: Boolean(nextOpinionId && Number(nextOpinionId) >= 3) }
  });

  const opinion3 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(3)],
    query: { enabled: Boolean(nextOpinionId && Number(nextOpinionId) >= 4) }
  });

  // Add opinion 4 for future scalability
  const opinion4 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(4)],
    query: { enabled: Boolean(nextOpinionId && Number(nextOpinionId) >= 5) }
  });

  // Add opinion 5 for future scalability
  const opinion5 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(5)],
    query: { enabled: Boolean(nextOpinionId && Number(nextOpinionId) >= 6) }
  });

  // Process all opinion data
  const allOpinions: OpinionData[] = useMemo(() => {
    const opinions: OpinionData[] = [];
    
    console.log('=== DYNAMIC OPINION FETCHING ===');
    console.log('Next Opinion ID:', nextOpinionId?.toString());
    
    // Helper function to add opinion
    const addOpinion = (opinionQuery: { data: Record<string, unknown> | undefined; isLoading: boolean; error: unknown }, id: number) => {
      if (opinionQuery.data && !opinionQuery.isLoading && !opinionQuery.error) {
        console.log(`✅ Adding Opinion ${id} to array`);
        console.log(`Opinion ${id} data:`, {
          question: opinionQuery.data?.question,
          answer: opinionQuery.data?.currentAnswer,
          categories: opinionQuery.data?.categories,
          isActive: opinionQuery.data?.isActive
        });
        
        opinions.push({
          id,
          question: String(opinionQuery.data?.question) || '',
          currentAnswer: String(opinionQuery.data?.currentAnswer) || '',
          nextPrice: (opinionQuery.data?.nextPrice as bigint) || BigInt(0),
          lastPrice: (opinionQuery.data?.lastPrice as bigint) || BigInt(0),
          totalVolume: (opinionQuery.data?.totalVolume as bigint) || BigInt(0),
          currentAnswerOwner: String(opinionQuery.data?.currentAnswerOwner) || '',
          questionOwner: String(opinionQuery.data?.questionOwner) || '',
          salePrice: (opinionQuery.data?.salePrice as bigint) || BigInt(0),
          isActive: Boolean(opinionQuery.data?.isActive) || false,
          creator: String(opinionQuery.data?.creator) || '',
          categories: (opinionQuery.data?.categories as string[]) || [],
          currentAnswerDescription: String(opinionQuery.data?.currentAnswerDescription) || '',
          tradesCount: Math.ceil(Number(opinionQuery.data?.totalVolume || BigInt(0)) / Number(opinionQuery.data?.lastPrice || BigInt(1_000_000))),
        });
      } else {
        console.log(`❌ Opinion ${id} not added - Loading:`, opinionQuery.isLoading, 'Error:', (opinionQuery.error as Error)?.message, 'HasData:', !!opinionQuery.data);
      }
    };

    // Add all available opinions in order
    addOpinion(opinion1, 1);
    addOpinion(opinion2, 2);
    addOpinion(opinion3, 3);
    addOpinion(opinion4, 4);
    addOpinion(opinion5, 5);
    
    console.log('Final opinions array length:', opinions.length);
    console.log('Final opinions array:', opinions);
    return opinions;
  }, [opinion1.data, opinion1.isLoading, opinion1.error, opinion2.data, opinion2.isLoading, opinion2.error, opinion3.data, opinion3.isLoading, opinion3.error, opinion4.data, opinion4.isLoading, opinion4.error, opinion5.data, opinion5.isLoading, opinion5.error, nextOpinionId]);

  // Check if any opinion is still loading
  const isLoading = isLoadingCount || opinion1.isLoading || opinion2.isLoading || opinion3.isLoading || opinion4.isLoading || opinion5.isLoading;

  return {
    opinions: allOpinions,
    isLoading,
    nextOpinionId,
    totalOpinions: nextOpinionId ? Number(nextOpinionId) - 1 : 0
  };
}