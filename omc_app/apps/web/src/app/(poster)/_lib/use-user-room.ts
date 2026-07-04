'use client';

/**
 * useUserRoom — chain-backed equivalent of /v2/_data/room.ts.
 *
 * Aggregates every opinion the given user is involved in (held or created)
 * plus their claimable royalties balance into the same RoomData shape mock
 * pages consume.
 *
 * Address can be:
 *   "me"  → resolves to the connected wallet (or null if disconnected)
 *   "0x…" → explicit address (used by /profile/[address])
 *   ENS-like handle → not resolved; falls back to mock room
 */

import { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import type { DisplayTake } from '../_data/mock-takes';
import type { EarningRecord, RoomData } from '../_data/room';
import { useTakes } from './chain-adapters';

const FEE_MANAGER_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getAccumulatedFees',
    outputs: [{ name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

function eqAddr(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

function looksLikeAddress(handle: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(handle);
}

export type UserRoomQuery = {
  /** Resolved RoomData when address valid + chain returns data; null otherwise. */
  room: RoomData | null;
  /** True while chain reads are in flight. */
  isLoading: boolean;
  /** Address resolved from the handle (null if "me" + disconnected, or invalid). */
  resolvedAddress: `0x${string}` | null;
  /** True if the handle is just an ENS-style nickname (no chain match possible). */
  isHandleOnly: boolean;
};

/**
 * @param handle  "me" sentinel, a 0x-address, or a free-text handle.
 *                Mock helpers handle the handle case; this hook returns
 *                isHandleOnly=true so the caller can fall back to mock data.
 */
export function useUserRoom(handle: string): UserRoomQuery {
  const { address: connectedAddress } = useAccount();

  const resolvedAddress: `0x${string}` | null =
    handle === 'me'
      ? (connectedAddress ?? null)
      : looksLikeAddress(handle)
        ? (handle as `0x${string}`)
        : null;

  const isHandleOnly = handle !== 'me' && !looksLikeAddress(handle);

  const { takes, isLoading: takesLoading } = useTakes();

  const { data: feesRaw, isLoading: feesLoading } = useReadContract({
    address: CONTRACTS.FEE_MANAGER,
    abi: FEE_MANAGER_ABI,
    functionName: 'getAccumulatedFees',
    args: resolvedAddress ? [resolvedAddress] : undefined,
    query: { enabled: !!resolvedAddress, refetchInterval: 30_000 },
  });

  // Lifetime royalties = 3% of every flip on every question this user created.
  // Creations pay no creator fee (initial price is locked stake), so entry 0
  // of each answer history is excluded. One multicall over the created ids.
  const createdIds = useMemo(
    () =>
      resolvedAddress
        ? takes.filter((t) => eqAddr(t.creatorAddress, resolvedAddress)).map((t) => t.id)
        : [],
    [takes, resolvedAddress],
  );

  const { data: histData } = useReadContracts({
    contracts: createdIds.map(
      (id) =>
        ({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'getAnswerHistory',
          args: [BigInt(id)],
        }) as const,
    ),
    query: { enabled: createdIds.length > 0, staleTime: 30_000, gcTime: 60_000 },
  });

  const lifetimeById = useMemo(() => {
    const m = new Map<number, number>();
    if (!histData) return m;
    histData.forEach((res, i) => {
      if (res.status !== 'success' || !res.result) return;
      const hist = res.result as readonly { price: bigint }[];
      let flipVol = 0n;
      hist.forEach((h, j) => {
        if (j > 0) flipVol += BigInt(h.price);
      });
      m.set(createdIds[i], Number((flipVol * 3n) / 100n) / 1_000_000);
    });
    return m;
  }, [histData, createdIds]);

  const room = useMemo<RoomData | null>(() => {
    if (!resolvedAddress) return null;
    if (takesLoading) return null;

    // Holdings = takes where current king is this address.
    const holding: DisplayTake[] = takes.filter((t) =>
      eqAddr(t.ownerAddress, resolvedAddress),
    );

    // Earning = takes where the original creator is this address AND somebody
    // else holds the floor right now (you can't earn royalties from yourself).
    // `royalty` = what the NEXT flip pays (3% of floor); `lifetimeRoyalty` =
    // 3% of every flip so far, from the question's answer history.
    const earning: EarningRecord[] = takes
      .filter(
        (t) =>
          eqAddr(t.creatorAddress, resolvedAddress) &&
          !eqAddr(t.ownerAddress, resolvedAddress) &&
          t.ownerAddress !== ZERO_ADDR,
      )
      .map((t) => ({
        takeId: t.id,
        question: t.question,
        answer: t.answer,
        category: t.category,
        takenBy: t.heldBy,
        takenByAddress: t.ownerAddress,
        royalty: Math.round(t.price * 0.03 * 100) / 100,
        lifetimeRoyalty: lifetimeById.get(t.id),
      }));

    const bag = holding.reduce((a, t) => a + t.price, 0);
    const royalties = feesRaw ? Number(feesRaw) / 1_000_000 : 0;
    // Total over ALL created questions (incl. self-held or vacant ones).
    const lifetimeRoyalties = [...lifetimeById.values()].reduce((a, v) => a + v, 0);
    const delta7d = holding.length
      ? holding.reduce((a, t) => a + t.delta, 0) / holding.length
      : 0;

    return {
      handle: handle === 'me' ? 'you' : (resolvedAddress as string),
      avatar: '★',
      bag,
      delta7d,
      royalties,
      lifetimeRoyalties,
      streak: 0,
      memberSince: '—',
      publicBag: true,
      holding,
      earning,
    };
  }, [resolvedAddress, takes, takesLoading, feesRaw, handle, lifetimeById]);

  return {
    room,
    isLoading: takesLoading || feesLoading,
    resolvedAddress,
    isHandleOnly,
  };
}
