import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// PoolManager contract configuration
const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612';

// PoolManager ABI - simplified for ethers (working from test)
const POOL_MANAGER_ABI = [
  "function poolCount() view returns (uint256)",
  "function pools(uint256) view returns (uint256, uint256, string, uint96, uint32, address, uint8, string, string)",
  "function getPoolContributors(uint256) view returns (address[])"
];

// Create ethers provider
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API POST called');
    const { poolId } = await request.json();
    console.log('📝 Parsed poolId:', poolId);

    if (poolId === undefined || poolId === null || typeof poolId !== 'number' || poolId < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid poolId provided' },
        { status: 400 }
      );
    }

    // Create contract instance
    console.log('🏗️ Creating contract instance...');
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, provider);
    console.log('✅ Contract instance created');

    try {
      console.log('API: Getting pool data for poolId:', poolId);
      
      // Get pool basic info
      const poolData = await poolManager.pools(poolId);
      console.log('API: Got pool data:', poolData);
      
      // Get pool contributors
      const contributors = await poolManager.getPoolContributors(poolId);
      console.log('API: Got contributors:', contributors);

      // Transform the data to match frontend expectations
      // ethers returns arrays: [id, opinionId, proposedAnswer, totalAmount, deadline, creator, status, name, ipfsHash]
      const transformedPool = {
        info: {
          id: poolData[0],
          opinionId: poolData[1], 
          creator: poolData[5],           // [5] creator
          proposedAnswer: poolData[2],    // [2] proposedAnswer
          totalAmount: poolData[3].toString(), // [3] totalAmount
          deadline: Number(poolData[4]),  // [4] deadline
          status: Number(poolData[6]),    // [6] status
          name: poolData[7] || `Pool #${poolId}`, // [7] name
        },
        currentPrice: poolData[3].toString(), // totalAmount as currentPrice
        remainingAmount: "0", // We don't track contributions separately yet
        contributorCount: contributors.length,
      };

      return NextResponse.json({
        success: true,
        pool: transformedPool
      });

    } catch (contractError: any) {
      console.error('❌ Contract call failed:', contractError);
      console.error('❌ Error message:', contractError?.message);
      console.error('❌ Stack:', contractError?.stack);
      
      // Try to get more specific error info
      if (contractError?.error) {
        console.error('❌ Inner error:', contractError.error);
      }
      if (contractError?.reason) {
        console.error('❌ Reason:', contractError.reason);
      }
      
      // Handle specific contract errors
      if (contractError.message?.includes('execution reverted')) {
        return NextResponse.json(
          { success: false, error: 'Pool not found or invalid pool ID' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch pool data from contract' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ API TOP-LEVEL ERROR:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests with poolId as query parameter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get('poolId');

    if (poolId === null || poolId === undefined || isNaN(Number(poolId)) || Number(poolId) < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid poolId provided in query' },
        { status: 400 }
      );
    }

    // Reuse POST logic
    return POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: Number(poolId) })
    }));

  } catch (error: any) {
    console.error('GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}