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
    console.log('🔍 API: POST called');
    const { poolId } = await request.json();
    console.log('📝 API: poolId:', poolId);

    if (poolId === undefined || poolId === null || typeof poolId !== 'number' || poolId < 0) {
      console.log('❌ API: Invalid poolId');
      return NextResponse.json(
        { success: false, error: 'Invalid poolId provided' },
        { status: 400 }
      );
    }

    console.log('🏗️ API: Creating contract...');
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, provider);
    console.log('✅ API: Contract created');
    
    console.log('📊 API: Fetching pool data...');
    const poolData = await poolManager.pools(poolId);
    console.log('✅ API: Pool data:', poolData);
    
    console.log('👥 API: Fetching contributors...');
    const contributors = await poolManager.getPoolContributors(poolId);
    console.log('✅ API: Contributors:', contributors);

    const transformedPool = {
      info: {
        id: poolData[0],
        opinionId: poolData[1], 
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

    console.log('🔄 API: Transformed pool:', transformedPool);
    
    return NextResponse.json({
      success: true,
      pool: transformedPool
    });

  } catch (error: any) {
    console.error('❌ API: Error occurred:', error);
    console.error('❌ API: Error message:', error?.message);
    console.error('❌ API: Error stack:', error?.stack);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pool data from contract' },
      { status: 500 }
    );
  }
}

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