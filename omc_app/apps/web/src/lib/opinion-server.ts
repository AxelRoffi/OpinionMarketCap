/**
 * Server-side opinion data fetching for SEO metadata and dynamic OG image
 * generation. Runs on Vercel Functions only — no React hooks, no wagmi.
 *
 * Talks directly to OpinionCoreV4 via getOpinionDetails (single call, returns
 * the full tuple including categories — no second hop to OpinionExtensions
 * needed). Previous version called the V3 `getOpinion(uint256)` which
 * reverts on V4 — every share-unfurl returned the "Opinion not found"
 * fallback and the root OG/Twitter tags leaked through.
 */

import { createPublicClient, fallback, http } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS } from './contracts';

export interface OpinionData {
  id: number;
  question: string;
  currentAnswer: string;
  creator: string;
  questionOwner: string;
  currentAnswerOwner: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  isActive: boolean;
  salePrice: bigint;
  categories: string[];
}

// V4 `getOpinionDetails(uint256)` — single source of truth for opinion reads.
// Categories ship in the same tuple, so no second hop to OpinionExtensions.
const GET_OPINION_DETAILS_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionDetails',
    outputs: [
      {
        components: [
          { internalType: 'uint96', name: 'lastPrice',                type: 'uint96' },
          { internalType: 'uint96', name: 'nextPrice',                type: 'uint96' },
          { internalType: 'uint96', name: 'totalVolume',              type: 'uint96' },
          { internalType: 'uint96', name: 'salePrice',                type: 'uint96' },
          { internalType: 'address', name: 'creator',                 type: 'address' },
          { internalType: 'address', name: 'questionOwner',           type: 'address' },
          { internalType: 'address', name: 'currentAnswerOwner',      type: 'address' },
          { internalType: 'bool',    name: 'isActive',                type: 'bool' },
          { internalType: 'string',  name: 'question',                type: 'string' },
          { internalType: 'string',  name: 'currentAnswer',           type: 'string' },
          { internalType: 'string',  name: 'currentAnswerDescription',type: 'string' },
          { internalType: 'string',  name: 'ipfsHash',                type: 'string' },
          { internalType: 'string',  name: 'link',                    type: 'string' },
          { internalType: 'string[]',name: 'categories',              type: 'string[]' },
        ],
        internalType: 'struct OpinionStructs.Opinion',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const NEXT_OPINION_ID_ABI = [
  {
    inputs: [],
    name: 'nextOpinionId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Multiple public RPCs in a fallback chain — mainnet.base.org sometimes
// 403s non-browser callers, publicnode is the most permissive we've seen.
// Vercel server-side egress isn't browser-like, so the order matters.
function getClient() {
  return createPublicClient({
    chain: base,
    transport: fallback([
      http('https://base-rpc.publicnode.com'),
      http('https://base.llamarpc.com'),
      http('https://mainnet.base.org'),
    ]),
  });
}

/**
 * Fetch opinion data server-side for metadata + OG image generation.
 * Returns null when the opinion doesn't exist or the chain call fails.
 */
export async function getOpinionForMeta(opinionId: number): Promise<OpinionData | null> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: GET_OPINION_DETAILS_ABI,
      functionName: 'getOpinionDetails',
      args: [BigInt(opinionId)],
    });

    // Empty question means the opinion id is past the end of the array
    // (V4 returns a zeroed struct rather than reverting in that case).
    if (!result.question) return null;

    return {
      id: opinionId,
      question: result.question,
      currentAnswer: result.currentAnswer,
      creator: result.creator,
      questionOwner: result.questionOwner,
      currentAnswerOwner: result.currentAnswerOwner,
      nextPrice: result.nextPrice,
      lastPrice: result.lastPrice,
      totalVolume: result.totalVolume,
      isActive: result.isActive,
      salePrice: result.salePrice,
      categories: [...result.categories],
    };
  } catch (error) {
    console.error(`Error fetching opinion ${opinionId} for metadata:`, error);
    return null;
  }
}

/**
 * Total opinion count for sitemap generation.
 */
export async function getTotalOpinions(): Promise<number> {
  try {
    const client = getClient();
    const nextOpinionId = (await client.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: NEXT_OPINION_ID_ABI,
      functionName: 'nextOpinionId',
    })) as bigint;
    return Number(nextOpinionId) - 1;
  } catch (error) {
    console.error('Error fetching opinion count:', error);
    return 0;
  }
}
