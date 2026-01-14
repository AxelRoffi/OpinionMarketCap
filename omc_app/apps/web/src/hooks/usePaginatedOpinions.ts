import { useReadContract, useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import { CONTRACTS, OPINION_CORE_ABI, OPINION_EXTENSIONS_ABI } from '@/lib/contracts';

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

interface UsePaginatedOpinionsOptions {
  page?: number;
  pageSize?: number;
  fetchAll?: boolean; // For smaller datasets, fetch all at once
  maxBatchSize?: number; // Maximum opinions to fetch per batch
}

// Hook for truly scalable opinion fetching with optional server-side pagination
export function usePaginatedOpinions(options: UsePaginatedOpinionsOptions = {}) {
  const { 
    page = 1, 
    pageSize = 100, 
    fetchAll = true, // Default: fetch all for current datasets
    maxBatchSize = 500 // Don't fetch more than 500 at once
  } = options;

  // Get total opinion count first
  const { data: nextOpinionId, isLoading: isLoadingCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  // Calculate total opinions that exist
  const totalOpinionsCount = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  // Determine fetching strategy based on dataset size and options
  const shouldFetchAll = fetchAll && totalOpinionsCount <= maxBatchSize;

  // Calculate which opinions to fetch
  const { startId, endId, totalPages } = useMemo(() => {
    if (shouldFetchAll || totalOpinionsCount === 0) {
      return {
        startId: 1,
        endId: totalOpinionsCount,
        totalPages: Math.ceil(totalOpinionsCount / pageSize)
      };
    }

    // Server-side pagination: fetch only the requested page
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalOpinionsCount);
    
    return {
      startId: start,
      endId: end,
      totalPages: Math.ceil(totalOpinionsCount / pageSize)
    };
  }, [totalOpinionsCount, page, pageSize, shouldFetchAll, maxBatchSize]);

  // Create contract calls for the determined range
  const opinionContracts = useMemo(() => {
    if (!nextOpinionId || totalOpinionsCount === 0) return [];

    const contracts = [];
    for (let i = startId; i <= endId; i++) {
      contracts.push({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'getOpinionDetails',
        args: [BigInt(i)],
      } as const);
    }

    console.log(`🔄 ${shouldFetchAll ? 'FETCHING ALL' : 'PAGINATED FETCH'}: Creating ${contracts.length} contract calls for opinions ${startId}-${endId} (total: ${totalOpinionsCount})`);
    return contracts;
  }, [nextOpinionId, totalOpinionsCount, startId, endId, shouldFetchAll]);

  // Create contract calls to fetch categories from OpinionExtensions
  const categoryContracts = useMemo(() => {
    if (!nextOpinionId || totalOpinionsCount === 0) return [];

    const contracts = [];
    for (let i = startId; i <= endId; i++) {
      contracts.push({
        address: CONTRACTS.OPINION_EXTENSIONS,
        abi: OPINION_EXTENSIONS_ABI,
        functionName: 'getOpinionCategories',
        args: [BigInt(i)],
      } as const);
    }

    return contracts;
  }, [nextOpinionId, totalOpinionsCount, startId, endId]);

  // Fetch opinions in parallel
  const {
    data: opinionsRawData,
    isLoading: isLoadingOpinions,
    error: opinionsError
  } = useReadContracts({
    contracts: opinionContracts,
    query: {
      enabled: opinionContracts.length > 0,
      staleTime: 30000,
      gcTime: 60000, // Renamed from cacheTime in newer React Query versions
    }
  });

  // Fetch categories from OpinionExtensions
  const {
    data: categoriesRawData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useReadContracts({
    contracts: categoryContracts,
    query: {
      enabled: categoryContracts.length > 0,
      staleTime: 30000,
      gcTime: 60000,
    }
  });

  // Process opinion data
  const { processedOpinions, allOpinions, currentPageOpinions } = useMemo(() => {
    if (!opinionsRawData || isLoadingOpinions || !nextOpinionId) {
      return {
        processedOpinions: [],
        allOpinions: [],
        currentPageOpinions: []
      };
    }

    console.log('=== SCALABLE PAGINATED FETCHING ===');
    console.log('Strategy:', shouldFetchAll ? 'FETCH_ALL' : 'SERVER_SIDE_PAGINATION');
    console.log('Total Opinions:', totalOpinionsCount);
    console.log('Fetching Range:', startId, '-', endId);
    console.log('Raw Data Length:', opinionsRawData.length);
    console.log('Categories Data Length:', categoriesRawData?.length || 0);

    const opinions: OpinionData[] = [];

    opinionsRawData.forEach((result, index) => {
      const opinionId = startId + index;

      if (result.status === 'success' && result.result) {
        const data = result.result as Record<string, unknown>;

        // Get categories from the separate OpinionExtensions call
        let categories: string[] = [];
        if (categoriesRawData && categoriesRawData[index]) {
          const catResult = categoriesRawData[index];
          if (catResult.status === 'success' && catResult.result) {
            categories = catResult.result as string[];
          }
        }

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
          categories: categories, // Use categories from OpinionExtensions
          currentAnswerDescription: String(data?.currentAnswerDescription || ''),
          link: String(data?.link || ''),
          tradesCount: Math.ceil(Number(data?.totalVolume || BigInt(0)) / Number(data?.lastPrice || BigInt(1_000_000))),
        });
      } else {
        console.log(`❌ Opinion ${opinionId} failed:`, result.status);
      }
    });

    // Sort by ID to ensure proper ordering
    const sortedOpinions = opinions.sort((a, b) => a.id - b.id);

    if (shouldFetchAll) {
      // When fetching all: return all opinions + client-side paginated current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPage = sortedOpinions.slice(startIndex, endIndex);

      console.log(`📄 CLIENT-SIDE PAGINATION: Showing page ${page} (${startIndex}-${endIndex}) of ${sortedOpinions.length} total`);

      return {
        processedOpinions: sortedOpinions,
        allOpinions: sortedOpinions,
        currentPageOpinions: paginatedPage
      };
    } else {
      // When using server-side pagination: return only current page data
      console.log(`🔄 SERVER-SIDE PAGINATION: Fetched page ${page} with ${sortedOpinions.length} opinions`);

      return {
        processedOpinions: sortedOpinions,
        allOpinions: [], // Don't maintain full list in memory
        currentPageOpinions: sortedOpinions
      };
    }
  }, [opinionsRawData, isLoadingOpinions, nextOpinionId, totalOpinionsCount, startId, endId, shouldFetchAll, page, pageSize, categoriesRawData]);

  // Overall loading state
  const isLoading = isLoadingCount || isLoadingOpinions || isLoadingCategories;

  console.log(`🎯 PAGINATED RESULT: ${currentPageOpinions.length} opinions on page ${page}, total: ${totalOpinionsCount}, loading: ${isLoading}`);

  return {
    // Current page data (what the UI should display)
    opinions: currentPageOpinions,

    // All opinions (only populated when fetchAll=true and dataset is small)
    allOpinions: allOpinions,

    // Pagination metadata
    currentPage: page,
    pageSize,
    totalPages,
    totalOpinions: totalOpinionsCount,

    // State flags
    isLoading,
    error: opinionsError || categoriesError,
    isFetchingAll: shouldFetchAll,

    // Raw data for advanced use cases
    nextOpinionId,
  };
}