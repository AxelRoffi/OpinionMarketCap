'use client';

/**
 * Chain reads for /pools and /pools/[id].
 *
 * V2 PoolManager exposes:
 *   poolCount()                   → uint256
 *   pools(uint256)                → PoolInfo struct (status, creator, deadline, …)
 *   getPoolDetails(uint256)       → tuple(info, currentPrice, remainingAmount, timeRemaining)
 *
 * `getPoolDetails` is the convenient bundle; we use it for both the list
 * (looped via useReadContracts) and the single-pool read. The opinion
 * referenced by each pool (question, category) is enriched from useTakes.
 */

import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import type { Pool, PoolContrib, PoolStatus } from '../_data/pools';
import { useTakes } from './chain-adapters';
import { CAT_MAP, type CatKey } from '../_data/mock-takes';
import { mapChainCategoryToCat, shortAddress } from './chain-adapters';

const POOL_MANAGER_ABI = [
  {
    inputs: [],
    name: 'poolCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'getPoolDetails',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'opinionId', type: 'uint256' },
          { name: 'proposedAnswer', type: 'string' },
          { name: 'totalAmount', type: 'uint96' },
          { name: 'deadline', type: 'uint32' },
          { name: 'creator', type: 'address' },
          { name: 'status', type: 'uint8' },
          { name: 'name', type: 'string' },
          { name: 'ipfsHash', type: 'string' },
          { name: 'targetPrice', type: 'uint96' },
        ],
        name: 'info',
        type: 'tuple',
      },
      { name: 'currentPrice', type: 'uint256' },
      { name: 'remainingAmount', type: 'uint256' },
      { name: 'timeRemaining', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const STATUS_MAP: Record<number, PoolStatus> = {
  0: 'active',
  1: 'filled',
  2: 'expired',
};

type ChainPoolInfo = {
  id: bigint;
  opinionId: bigint;
  proposedAnswer: string;
  totalAmount: bigint;
  deadline: number;
  creator: `0x${string}`;
  status: number;
  name: string;
  ipfsHash: string;
  targetPrice: bigint;
};

type ChainPoolBundle = {
  info: ChainPoolInfo;
  currentPrice: bigint;
  remainingAmount: bigint;
  timeRemaining: bigint;
};

const USDC = 1_000_000n;
const usdc = (v: bigint) => Number(v) / Number(USDC);

/**
 * Map one chain bundle + the linked opinion → DisplayPool. When the linked
 * opinion isn't in our useTakes set (still loading, or off-chain index), we
 * fall back to sensible defaults so the card still renders.
 */
function toDisplayPool(
  bundle: ChainPoolBundle,
  takesById: Map<number, { question: string; category: CatKey; categoryLabel?: string }>,
): Pool {
  const info = bundle.info;
  const opinionId = Number(info.opinionId);
  const linked = takesById.get(opinionId);
  const target = Number(bundle.currentPrice ?? info.targetPrice) / Number(USDC);
  const raised = usdc(info.totalAmount);

  return {
    id: Number(info.id),
    targetTakeId: opinionId,
    question: linked?.question ?? `Take #${opinionId}`,
    proposedAnswer: info.proposedAnswer || 'PENDING',
    category: linked?.category ?? 'life',
    categoryLabel: linked?.categoryLabel,
    target,
    raised,
    creator: shortAddress(info.creator),
    deadlineMs: Number(info.deadline) * 1000,
    contributors: [], // per-pool contributor list requires a separate read; deferred
    status: STATUS_MAP[info.status] ?? 'active',
  };
}

export type PoolsQuery = {
  pools: Pool[];
  isLoading: boolean;
  isEmpty: boolean;
  totalOnChain: number;
};

/** Live list of every pool on chain. */
export function useChainPools(): PoolsQuery {
  const { data: poolCountData, isLoading: countLoading } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_ABI,
    functionName: 'poolCount',
    query: { staleTime: 30_000 },
  });

  const totalOnChain = poolCountData ? Number(poolCountData) : 0;

  const detailContracts = useMemo(() => {
    if (totalOnChain === 0) return [];
    const out = [];
    for (let i = 0; i < totalOnChain; i++) {
      out.push({
        address: CONTRACTS.POOL_MANAGER,
        abi: POOL_MANAGER_ABI,
        functionName: 'getPoolDetails',
        args: [BigInt(i)],
      } as const);
    }
    return out;
  }, [totalOnChain]);

  const { data: detailResults, isLoading: detailsLoading } = useReadContracts({
    contracts: detailContracts,
    query: { enabled: detailContracts.length > 0, staleTime: 20_000 },
  });

  const { takes, isLoading: takesLoading } = useTakes();

  const pools = useMemo<Pool[]>(() => {
    if (!detailResults) return [];
    const takesById = new Map(
      takes.map((t) => [t.id, { question: t.question, category: t.category, categoryLabel: t.categoryLabel }]),
    );
    const out: Pool[] = [];
    for (const r of detailResults) {
      if (r.status !== 'success' || !r.result) continue;
      // wagmi returns the tuple as { info, currentPrice, remainingAmount, timeRemaining }
      const bundle = r.result as unknown as ChainPoolBundle;
      out.push(toDisplayPool(bundle, takesById));
    }
    // Newest first.
    return out.sort((a, b) => b.id - a.id);
  }, [detailResults, takes]);

  const isLoading = countLoading || detailsLoading || takesLoading;
  return {
    pools,
    isLoading,
    isEmpty: !isLoading && pools.length === 0,
    totalOnChain,
  };
}

export type PoolQuery = {
  pool: Pool | null;
  isLoading: boolean;
  notFound: boolean;
};

/** Single pool by id. */
export function useChainPool(id: number): PoolQuery {
  const { data: poolCountData } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_ABI,
    functionName: 'poolCount',
    query: { staleTime: 30_000 },
  });

  const inRange = poolCountData != null && id < Number(poolCountData);

  const { data, isLoading: detailLoading } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_ABI,
    functionName: 'getPoolDetails',
    args: [BigInt(id)],
    query: { enabled: inRange, staleTime: 20_000 },
  });

  const { takes, isLoading: takesLoading } = useTakes();

  const pool = useMemo<Pool | null>(() => {
    if (!data || !inRange) return null;
    const takesById = new Map(
      takes.map((t) => [t.id, { question: t.question, category: t.category, categoryLabel: t.categoryLabel }]),
    );
    return toDisplayPool(data as unknown as ChainPoolBundle, takesById);
  }, [data, inRange, takes]);

  return {
    pool,
    isLoading: detailLoading || takesLoading,
    notFound: poolCountData != null && id >= Number(poolCountData),
  };
}

// Re-export to keep call-sites tidy.
export { mapChainCategoryToCat, CAT_MAP };
