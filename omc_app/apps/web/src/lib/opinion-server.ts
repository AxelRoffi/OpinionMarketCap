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

// V4 `getOpinionDetails(uint256)` — opinion data. The ABI defines a
// `categories` field in the returned tuple, but in practice V4 returns
// it empty (categories are stored on OpinionExtensionsV2, not core).
// So we call getOpinionCategories separately and merge.
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

// OpinionExtensionsV2 `getOpinionCategories(uint256)` — the actual home of
// per-opinion category strings. Called in parallel with getOpinionDetails.
const GET_OPINION_CATEGORIES_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionCategories',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
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
    // Fetch opinion data + categories in parallel. Categories live on
    // OpinionExtensionsV2 — V4's getOpinionDetails struct exposes a
    // categories field for ABI compatibility but always returns it empty.
    const [opinionResult, categoriesResult] = await Promise.all([
      client.readContract({
        address: CONTRACTS.OPINION_CORE,
        abi: GET_OPINION_DETAILS_ABI,
        functionName: 'getOpinionDetails',
        args: [BigInt(opinionId)],
      }),
      client
        .readContract({
          address: CONTRACTS.OPINION_EXTENSIONS,
          abi: GET_OPINION_CATEGORIES_ABI,
          functionName: 'getOpinionCategories',
          args: [BigInt(opinionId)],
        })
        // If the extension contract reverts (e.g. opinion id past the end),
        // we still want the opinion data — empty categories is acceptable.
        .catch(() => [] as readonly string[]),
    ]);

    // Empty question means the opinion id is past the end of the array
    // (V4 returns a zeroed struct rather than reverting in that case).
    if (!opinionResult.question) return null;

    return {
      id: opinionId,
      question: opinionResult.question,
      currentAnswer: opinionResult.currentAnswer,
      creator: opinionResult.creator,
      questionOwner: opinionResult.questionOwner,
      currentAnswerOwner: opinionResult.currentAnswerOwner,
      nextPrice: opinionResult.nextPrice,
      lastPrice: opinionResult.lastPrice,
      totalVolume: opinionResult.totalVolume,
      isActive: opinionResult.isActive,
      salePrice: opinionResult.salePrice,
      categories: [...categoriesResult],
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
