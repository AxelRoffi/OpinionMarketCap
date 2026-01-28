/**
 * Server-side opinion data fetching for SEO metadata
 * This module runs only on the server and doesn't use React hooks
 */

import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS } from './contracts';

// Opinion type for server-side use
export interface OpinionData {
  id: number;
  question: string;
  currentAnswer: string;
  currentAnswerDescription: string;
  creator: string;
  questionOwner: string;
  currentAnswerOwner: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  createdAt: bigint;
  lastActivityAt: bigint;
  isActive: boolean;
  salePrice: bigint;
  categories: string[];
}

// ABI for getOpinion
const GET_OPINION_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinion',
    outputs: [
      {
        components: [
          { name: 'question', type: 'string' },
          { name: 'currentAnswer', type: 'string' },
          { name: 'currentAnswerDescription', type: 'string' },
          { name: 'creator', type: 'address' },
          { name: 'questionOwner', type: 'address' },
          { name: 'currentAnswerOwner', type: 'address' },
          { name: 'nextPrice', type: 'uint96' },
          { name: 'lastPrice', type: 'uint96' },
          { name: 'totalVolume', type: 'uint96' },
          { name: 'createdAt', type: 'uint64' },
          { name: 'lastActivityAt', type: 'uint64' },
          { name: 'isActive', type: 'bool' },
          { name: 'salePrice', type: 'uint96' },
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// ABI for getOpinionCategories from OpinionExtensions
const GET_CATEGORIES_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionCategories',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Create a singleton client for server-side use
const getClient = () => {
  return createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  });
};

/**
 * Fetch opinion data server-side for metadata generation
 * Uses caching with revalidation for performance
 */
export async function getOpinionForMeta(opinionId: number): Promise<OpinionData | null> {
  try {
    const client = getClient();

    // Fetch opinion data and categories in parallel
    const [opinionResult, categoriesResult] = await Promise.all([
      client.readContract({
        address: CONTRACTS.OPINION_CORE,
        abi: GET_OPINION_ABI,
        functionName: 'getOpinion',
        args: [BigInt(opinionId)],
      }),
      client.readContract({
        address: CONTRACTS.OPINION_EXTENSIONS,
        abi: GET_CATEGORIES_ABI,
        functionName: 'getOpinionCategories',
        args: [BigInt(opinionId)],
      }).catch(() => [] as string[]), // Fallback if categories fail
    ]);

    const opinion = opinionResult as {
      question: string;
      currentAnswer: string;
      currentAnswerDescription: string;
      creator: string;
      questionOwner: string;
      currentAnswerOwner: string;
      nextPrice: bigint;
      lastPrice: bigint;
      totalVolume: bigint;
      createdAt: bigint;
      lastActivityAt: bigint;
      isActive: boolean;
      salePrice: bigint;
    };

    // Check if opinion exists (question shouldn't be empty)
    if (!opinion.question) {
      return null;
    }

    return {
      id: opinionId,
      question: opinion.question,
      currentAnswer: opinion.currentAnswer,
      currentAnswerDescription: opinion.currentAnswerDescription,
      creator: opinion.creator,
      questionOwner: opinion.questionOwner,
      currentAnswerOwner: opinion.currentAnswerOwner,
      nextPrice: opinion.nextPrice,
      lastPrice: opinion.lastPrice,
      totalVolume: opinion.totalVolume,
      createdAt: opinion.createdAt,
      lastActivityAt: opinion.lastActivityAt,
      isActive: opinion.isActive,
      salePrice: opinion.salePrice,
      categories: categoriesResult as string[],
    };
  } catch (error) {
    console.error(`Error fetching opinion ${opinionId} for metadata:`, error);
    return null;
  }
}

/**
 * Get total number of opinions (for sitemap)
 */
export async function getTotalOpinions(): Promise<number> {
  try {
    const client = getClient();
    const nextOpinionId = await client.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: [
        {
          inputs: [],
          name: 'nextOpinionId',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'nextOpinionId',
    }) as bigint;

    return Number(nextOpinionId) - 1;
  } catch (error) {
    console.error('Error fetching opinion count:', error);
    return 0;
  }
}
