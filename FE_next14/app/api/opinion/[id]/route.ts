import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

// Define the chain and contracts directly in the API route
const BASE_SEPOLIA = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
} as const;

const CONTRACTS = {
  OPINION_CORE: '0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc' as `0x${string}`,
} as const;

const OPINION_CORE_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionDetails',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'address', name: 'questionOwner', type: 'address' },
          { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
          { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
          { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'string', name: 'question', type: 'string' },
          { internalType: 'string', name: 'currentAnswer', type: 'string' },
          { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
          { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
          { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
          { internalType: 'string', name: 'ipfsHash', type: 'string' },
          { internalType: 'string', name: 'link', type: 'string' },
          { internalType: 'string[]', name: 'categories', type: 'string[]' },
        ],
        internalType: 'struct OpinionStructs.Opinion',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getNextPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const publicClient = createPublicClient({
  chain: BASE_SEPOLIA,
  transport: http('https://sepolia.base.org'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opinionId = parseInt(params.id);
    
    if (isNaN(opinionId) || opinionId < 1) {
      return NextResponse.json(
        { error: 'Invalid opinion ID' },
        { status: 400 }
      );
    }

    // Read opinion details from contract
    const opinionData = await publicClient.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'getOpinionDetails',
      args: [BigInt(opinionId)],
    });

    // Read next price
    const nextPrice = await publicClient.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'getNextPrice',
      args: [BigInt(opinionId)],
    });

    // Format the response
    const opinion = {
      id: opinionId,
      creator: opinionData.creator,
      questionOwner: opinionData.questionOwner,
      lastPrice: opinionData.lastPrice,
      nextPrice: nextPrice,
      salePrice: opinionData.salePrice,
      isActive: opinionData.isActive,
      question: opinionData.question,
      currentAnswer: opinionData.currentAnswer,
      currentAnswerDescription: opinionData.currentAnswerDescription,
      currentAnswerOwner: opinionData.currentAnswerOwner,
      totalVolume: opinionData.totalVolume,
      ipfsHash: opinionData.ipfsHash,
      link: opinionData.link,
      categories: opinionData.categories,
    };

    return NextResponse.json(opinion);
  } catch (error) {
    console.error('Error fetching opinion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opinion' },
      { status: 500 }
    );
  }
}