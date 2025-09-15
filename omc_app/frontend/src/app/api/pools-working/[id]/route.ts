import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract configuration
const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612';
const RPC_URL = 'https://sepolia.base.org';

const POOL_MANAGER_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'pools',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { internalType: 'string', name: 'proposedAnswer', type: 'string' },
      { internalType: 'uint96', name: 'totalAmount', type: 'uint96' },
      { internalType: 'uint32', name: 'deadline', type: 'uint32' },
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'ipfsHash', type: 'string' },
      { internalType: 'uint96', name: 'targetPrice', type: 'uint96' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'getPoolContributors',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'poolCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const poolId = parseInt(params.id);
    
    if (isNaN(poolId) || poolId < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid pool ID' },
        { status: 400 }
      );
    }

    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, provider);

    // Check if pool exists
    const poolCount = await poolManager.poolCount();
    if (poolId >= Number(poolCount)) {
      return NextResponse.json(
        { success: false, error: 'Pool not found' },
        { status: 404 }
      );
    }

    // Get pool data and contributors in parallel
    const [poolData, contributors] = await Promise.all([
      poolManager.pools(poolId),
      poolManager.getPoolContributors(poolId)
    ]);

    // Calculate remaining amount
    const totalAmount = BigInt(poolData[3]); // totalAmount
    const targetPrice = BigInt(poolData[9]); // targetPrice
    const remainingAmount = targetPrice > totalAmount ? targetPrice - totalAmount : 0n;

    // Transform the data to match expected format
    const transformedPool = {
      info: {
        id: poolData[0].toString(),
        opinionId: poolData[1].toString(),
        creator: poolData[5],
        proposedAnswer: poolData[2],
        totalAmount: poolData[3].toString(),
        deadline: Number(poolData[4]),
        status: Number(poolData[6]),
        name: poolData[7] || `Pool #${poolId}`,
        ipfsHash: poolData[8] || '',
        targetPrice: poolData[9].toString()
      },
      currentPrice: poolData[9].toString(), // Use targetPrice as currentPrice
      remainingAmount: remainingAmount.toString(),
      contributorCount: contributors.length,
      createdAt: Date.now() - (poolId * 24 * 60 * 60 * 1000) // Mock creation time
    };

    return NextResponse.json({
      success: true,
      pool: transformedPool
    });

  } catch (error: any) {
    console.error('API error for pool:', params.id, error);
    
    // Return specific error messages for better UX
    if (error.message?.includes('network')) {
      return NextResponse.json(
        { success: false, error: 'Network connection error' },
        { status: 503 }
      );
    }
    
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { success: false, error: 'Request timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch pool data' },
      { status: 500 }
    );
  }
}