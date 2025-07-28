import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612';
const POOL_MANAGER_ABI = [
  "function poolCount() view returns (uint256)",
  "function pools(uint256) view returns (uint256, uint256, string, uint96, uint32, address, uint8, string, string)",
  "function getPoolContributors(uint256) view returns (address[])"
];
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');

export async function POST(request: NextRequest) {
  try {
    const { poolId } = await request.json();

    // Validate poolId
    if (poolId === undefined || poolId === null || typeof poolId !== 'number' || poolId < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid poolId provided' },
        { status: 400 }
      );
    }

    // Create contract - using exact same code as working test
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, provider);
    
    // Get pool data - using exact same calls as working test  
    const poolData = await poolManager.pools(poolId);
    const contributors = await poolManager.getPoolContributors(poolId);

    // Transform data - matching the working test format
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
      },
      currentPrice: poolData[3].toString(),
      remainingAmount: "0",
      contributorCount: contributors.length,
    };

    return NextResponse.json({
      success: true,
      pool: transformedPool
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pool data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, provider);
    const poolCount = await poolManager.poolCount();

    const pools = [];
    for (let i = 0; i < poolCount; i++) {
      const poolData = await poolManager.pools(i);
      const contributors = await poolManager.getPoolContributors(i);
      
      pools.push({
        info: {
          id: poolData[0].toString(),
          opinionId: poolData[1].toString(),
          creator: poolData[5],
          proposedAnswer: poolData[2],
          totalAmount: poolData[3].toString(),
          deadline: Number(poolData[4]),
          status: Number(poolData[6]),
          name: poolData[7] || `Pool #${i}`,
        },
        currentPrice: poolData[3].toString(),
        remainingAmount: "0",
        contributorCount: contributors.length,
      });
    }

    return NextResponse.json({
      success: true,
      pools,
      count: Number(poolCount)
    });

  } catch (error: any) {
    console.error('GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pools' },
      { status: 500 }
    );
  }
}