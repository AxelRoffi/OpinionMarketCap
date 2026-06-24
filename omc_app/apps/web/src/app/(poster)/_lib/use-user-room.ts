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
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
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

  const room = useMemo<RoomData | null>(() => {
    if (!resolvedAddress) return null;
    if (takesLoading) return null;

    // Holdings = takes where current king is this address.
    const holding: DisplayTake[] = takes.filter((t) =>
      eqAddr(t.ownerAddress, resolvedAddress),
    );

    // Earning = takes where the original creator is this address AND somebody
    // else holds the floor right now (you can't earn royalties from yourself).
    // The displayed "royalty" is an instantaneous 3% of nextPrice — lifetime
    // royalties paid out require event-log enumeration. The *claimable*
    // total surfaces separately via getAccumulatedFees() at the top of the page.
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
      }));

    const bag = holding.reduce((a, t) => a + t.price, 0);
    const royalties = feesRaw ? Number(feesRaw) / 1_000_000 : 0;
    const delta7d = holding.length
      ? holding.reduce((a, t) => a + t.delta, 0) / holding.length
      : 0;

    return {
      handle: handle === 'me' ? 'you' : (resolvedAddress as string),
      avatar: '★',
      bag,
      delta7d,
      royalties,
      streak: 0,
      memberSince: '—',
      publicBag: true,
      holding,
      earning,
    };
  }, [resolvedAddress, takes, takesLoading, feesRaw, handle]);

  return {
    room,
    isLoading: takesLoading || feesLoading,
    resolvedAddress,
    isHandleOnly,
  };
}
