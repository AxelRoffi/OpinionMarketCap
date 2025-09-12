import { useState, useEffect } from 'react';
import { CONTRACTS } from '@/lib/contracts';

interface PoolInfo {
  id: number;
  name: string;
  status: number; // 0=active, 1=executed, 2=expired
  opinionId: number;
  proposedAnswer: string;
}

interface PoolOwnerDisplay {
  isPoolOwned: boolean;
  displayName: string;
  poolName?: string;
}

const POOL_MANAGER_ADDRESS = CONTRACTS.POOL_MANAGER.toLowerCase();

// Cache for pool data to avoid repeated API calls
let poolDataCache: PoolInfo[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Hook to get proper display name for answer owners
 * - Returns pool name if answer is owned by an executed pool
 * - Returns truncated address if owned by individual user
 */
export function usePoolOwnerDisplay() {
  const [poolData, setPoolData] = useState<PoolInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pool data for owner resolution
  useEffect(() => {
    const fetchPoolData = async () => {
      // Use cache if available and fresh
      if (poolDataCache && Date.now() - cacheTime < CACHE_DURATION) {
        setPoolData(poolDataCache);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/pools-working');
        if (!response.ok) throw new Error('Failed to fetch pools');
        
        const data = await response.json();
        const pools = data.pools || [];
        
        interface ApiPool {
          info?: {
            id: string;
            name: string;
            status: string;
            opinionId: string;
            proposedAnswer: string;
          };
          id?: string;
          name?: string;
          status?: string;
          opinionId?: string;
          proposedAnswer?: string;
        }

        const poolInfos: PoolInfo[] = pools.map((pool: ApiPool) => ({
          id: parseInt(pool.info?.id || pool.id),
          name: pool.info?.name || pool.name,
          status: parseInt(pool.info?.status || pool.status),
          opinionId: parseInt(pool.info?.opinionId || pool.opinionId),
          proposedAnswer: pool.info?.proposedAnswer || pool.proposedAnswer
        }));
        
        // Debug logging
        console.log('🔍 Pool data loaded for owner display:', {
          totalPools: poolInfos.length,
          executedPools: poolInfos.filter(p => p.status === 1),
          poolsForOpinion3: poolInfos.filter(p => p.opinionId === 3)
        });
        
        // Update cache
        poolDataCache = poolInfos;
        cacheTime = Date.now();
        setPoolData(poolInfos);
      } catch (error) {
        console.error('Error fetching pool data for owner display:', error);
        setPoolData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolData();
  }, []);

  /**
   * Get display information for an answer owner
   */
  const getOwnerDisplay = (
    currentAnswerOwner: string, 
    opinionId: number, 
    currentAnswer: string
  ): PoolOwnerDisplay => {
    // Default display for individual users
    const defaultDisplay: PoolOwnerDisplay = {
      isPoolOwned: false,
      displayName: `${currentAnswerOwner.slice(0, 6)}...${currentAnswerOwner.slice(-4)}`
    };

    // Check if owner is the PoolManager contract
    if (currentAnswerOwner.toLowerCase() !== POOL_MANAGER_ADDRESS) {
      return defaultDisplay;
    }

    console.log(`🔍 Pool-owned answer detected for opinion ${opinionId}:`, {
      currentAnswer,
      poolDataLength: poolData.length,
      poolsForThisOpinion: poolData.filter(p => p.opinionId === opinionId),
      executedPools: poolData.filter(p => p.status === 1)
    });

    // Find executed pool that owns this answer
    const owningPool = poolData.find(pool => 
      pool.opinionId === opinionId && 
      pool.status === 1 && // 1 = executed
      pool.proposedAnswer.trim().toLowerCase() === currentAnswer.trim().toLowerCase()
    );

    if (owningPool) {
      return {
        isPoolOwned: true,
        displayName: owningPool.name,
        poolName: owningPool.name
      };
    }

    // Enhanced fallback: Try to find ANY pool for this opinion that's executed
    // Even if answer text doesn't match exactly (due to potential formatting differences)
    const fallbackPool = poolData.find(pool => 
      pool.opinionId === opinionId && 
      pool.status === 1 // 1 = executed
    );

    if (fallbackPool) {
      console.log(`🔍 Using fallback pool for opinion ${opinionId}:`, {
        poolName: fallbackPool.name,
        poolAnswer: fallbackPool.proposedAnswer,
        currentAnswer: currentAnswer,
        answersMatch: fallbackPool.proposedAnswer.trim().toLowerCase() === currentAnswer.trim().toLowerCase()
      });
      
      return {
        isPoolOwned: true,
        displayName: fallbackPool.name,
        poolName: fallbackPool.name
      };
    }

    // Last resort: If we know it's pool-owned but can't find the pool name,
    // show "Pool Answer" instead of "Pool Manager" to avoid confusion
    console.warn(`⚠️ No pool found for opinion ${opinionId} with answer "${currentAnswer}". Showing generic pool display.`);
    return {
      isPoolOwned: true, // Set to true so it shows emerald color
      displayName: 'Pool Answer' // Generic but clear indication it's pool-owned
    };
  };

  return {
    getOwnerDisplay,
    isLoading,
    poolData
  };
}

/**
 * Utility function to truncate Ethereum addresses
 */
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}