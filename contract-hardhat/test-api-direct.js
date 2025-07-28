const { createPublicClient, http, getContract } = require('viem');
const { baseSepolia } = require('viem/chains');

// PoolManager contract configuration
const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612';

// PoolManager ABI
const POOL_MANAGER_ABI = [
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'pools',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'opinionId', type: 'uint256' },
          { name: 'proposedAnswer', type: 'string' },
          { name: 'totalAmount', type: 'uint96' },
          { name: 'deadline', type: 'uint32' },
          { name: 'creator', type: 'address' },
          { name: 'status', type: 'uint8' },
          { name: 'name', type: 'string' },
          { name: 'ipfsHash', type: 'string' }
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'getPoolContributors',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
];

async function testAPI() {
    console.log('🔍 Testing API logic directly...');
    
    try {
        // Create public client for reading blockchain data
        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http()
        });
        
        console.log('✅ Created public client');
        
        // Create contract instance
        const poolManager = getContract({
            address: POOL_MANAGER_ADDRESS,
            abi: POOL_MANAGER_ABI,
            client: publicClient,
        });
        
        console.log('✅ Created contract instance');
        
        // Test pool count first
        const poolCount = await poolManager.read.poolCount();
        console.log('✅ Pool count:', poolCount.toString());
        
        // Test individual pool
        const poolId = 0;
        console.log(`🔍 Fetching pool ${poolId}...`);
        
        const poolData = await poolManager.read.pools([BigInt(poolId)]);
        console.log('✅ Pool data:', poolData);
        
        const contributors = await poolManager.read.getPoolContributors([BigInt(poolId)]);
        console.log('✅ Contributors:', contributors);
        
        // Transform data
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
        
        console.log('✅ API would return:', JSON.stringify({ success: true, pool: transformedPool }, null, 2));
        
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

testAPI();