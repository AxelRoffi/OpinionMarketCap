/**
 * V4 ABI extensions for OpinionCore + PoolManager.
 *
 * Kept separate from the legacy contracts.ts so the V4 self-exit feature
 * can be wired in without churning the larger ABI file. Hooks that only
 * need V4 functions import OPINION_CORE_V4_ABI directly; hooks that need
 * both V3 and V4 surface concat the two arrays.
 *
 * Addresses don't change: V4 + V2 are upgrades to existing proxies, so
 * the proxy addresses in CONTRACTS (contracts.ts) still apply.
 */

/**
 * V4 additions to OpinionCore — reads, writes, and feature flags introduced
 * by the self-exit feature. Existing V3 functions (createOpinion,
 * submitAnswer, getOpinionDetails, etc.) live in OPINION_CORE_ABI.
 */
export const OPINION_CORE_V4_ABI = [
  // ─── V4 reads ────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'lockedStake',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'lastTradeTimestamp',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'soloCooldown',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolCooldown',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolExtendedCooldown',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exitPenaltyBps',
    outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reclaimDiscountBps',
    outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'largeHolderThresholdBps',
    outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minReclaimPrice',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'spamFee',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'selfExitEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reclaimVacantSlotEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ─── V4 writes ───────────────────────────────────────────────────────
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'selfExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { internalType: 'string', name: 'answer', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'link', type: 'string' },
    ],
    name: 'reclaimVacantSlot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ─── V4 events ───────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'king', type: 'address' },
      { indexed: false, internalType: 'uint96', name: 'stake', type: 'uint96' },
      { indexed: false, internalType: 'uint96', name: 'refund', type: 'uint96' },
      { indexed: false, internalType: 'uint96', name: 'penalty', type: 'uint96' },
      { indexed: false, internalType: 'uint32', name: 'timestamp', type: 'uint32' },
    ],
    name: 'SelfExitTriggered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'claimer', type: 'address' },
      { indexed: false, internalType: 'uint96', name: 'reclaimPrice', type: 'uint96' },
      { indexed: false, internalType: 'uint96', name: 'newLockedStake', type: 'uint96' },
      { indexed: false, internalType: 'uint32', name: 'timestamp', type: 'uint32' },
    ],
    name: 'VacantSlotReclaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { indexed: false, internalType: 'uint96', name: 'reclaimPrice', type: 'uint96' },
    ],
    name: 'SlotVacated',
    type: 'event',
  },
] as const;

/**
 * V2 additions to PoolManager — pool stale-exit dissolution + claim flow.
 */
export const POOL_MANAGER_V2_ABI = [
  // ─── reads ───────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'staleExits',
    outputs: [
      { internalType: 'bool', name: 'dissolved', type: 'bool' },
      { internalType: 'uint96', name: 'totalRefund', type: 'uint96' },
      { internalType: 'uint96', name: 'totalEligibleContribution', type: 'uint96' },
      { internalType: 'uint32', name: 'dissolvedAt', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'hasClaimedStaleRefund',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'address', name: 'contributor', type: 'address' },
    ],
    name: 'pendingStaleRefund',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stalePoolExitEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'poolContributionAmounts',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ─── writes ──────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'triggerLargePoolExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'triggerPoolStaleExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'claimStaleRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ─── events ──────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'triggeredBy', type: 'address' },
      { indexed: false, internalType: 'uint96', name: 'totalRefund', type: 'uint96' },
      { indexed: false, internalType: 'uint96', name: 'totalEligibleContribution', type: 'uint96' },
      { indexed: false, internalType: 'bool', name: 'wasLargeHolder', type: 'bool' },
      { indexed: false, internalType: 'uint32', name: 'timestamp', type: 'uint32' },
    ],
    name: 'PoolStaleExitTriggered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'contributor', type: 'address' },
      { indexed: false, internalType: 'uint96', name: 'contribution', type: 'uint96' },
      { indexed: false, internalType: 'uint96', name: 'refund', type: 'uint96' },
    ],
    name: 'StaleRefundClaimed',
    type: 'event',
  },
] as const;
