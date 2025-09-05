import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  try {
    console.log('🔍 Testing blockchain connection...');
    
    // Create ethers provider
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    console.log('✅ Created provider');
    
    // Test basic connection
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Got block number:', blockNumber);
    
    // Test contract call - pool count and pool data
    const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612';
    const POOL_MANAGER_ABI = [
      "function poolCount() view returns (uint256)",
      "function pools(uint256) view returns (uint256, uint256, string, uint96, uint32, address, uint8, string, string)",
      "function getPoolContributors(uint256) view returns (address[])"
    ];
    
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, provider);
    console.log('✅ Created contract instance');
    
    const poolCount = await poolManager.poolCount();
    console.log('✅ Got pool count:', poolCount.toString());
    
    // Test reading pool 0
    const poolData = await poolManager.pools(0);
    console.log('✅ Got pool 0 data:', poolData);
    
    // Test contributors
    const contributors = await poolManager.getPoolContributors(0);
    console.log('✅ Got contributors:', contributors);
    
    return NextResponse.json({
      success: true,
      blockNumber,
      poolCount: poolCount.toString(),
      poolData: {
        id: poolData[0].toString(),
        opinionId: poolData[1].toString(),
        proposedAnswer: poolData[2],
        totalAmount: poolData[3].toString(),
        deadline: poolData[4].toString(),
        creator: poolData[5],
        status: poolData[6].toString(),
        name: poolData[7],
        ipfsHash: poolData[8]
      },
      contributors: contributors.map(addr => addr),
      contributorCount: contributors.length,
      message: 'Pool data fetched successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Blockchain test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Connection failed'
    }, { status: 500 });
  }
}