const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const poolManagerAddr = '0x3B4584e690109484059D95d7904dD9fEbA246612';
  const abi = [
    'function getPoolDetails(uint256) view returns (tuple(uint256,uint256,string,uint96,uint32,address,uint8,string,string,uint96) info, uint256 currentPrice, uint256 remainingAmount, uint256 timeRemaining)',
    'function pools(uint256) view returns (uint256, uint256, string, uint96, uint32, address, uint8, string, string, uint96)',
    'function poolCount() view returns (uint256)'
  ];
  
  const provider = ethers.provider;
  const poolManager = new ethers.Contract(poolManagerAddr, abi, provider);
  
  console.log('=== FINDING ACTIVE POOL WITH REMAINING AMOUNT ===');
  
  try {
    const poolCount = await poolManager.poolCount();
    console.log('Pool count:', poolCount.toString());
    
    // Check all pools to find the one with 5.288250 USDC remaining
    for (let poolId = 0; poolId < Number(poolCount); poolId++) {
      try {
        const result = await poolManager.getPoolDetails(poolId);
        const info = result[0];
        const remainingAmount = result[2]; // This should be the calculated remaining
        
        console.log(`\n=== POOL ${poolId} ===`);
        console.log('Status:', Number(info[6])); // 0=Active, 1=Executed, 2=Expired
        console.log('Total Amount:', ethers.formatUnits(info[3], 6), 'USDC');
        console.log('Target Price:', ethers.formatUnits(info[9], 6), 'USDC');
        console.log('Remaining Amount:', ethers.formatUnits(remainingAmount, 6), 'USDC');
        
        // Look for the pool with ~5.288 remaining
        const remainingUSDC = Number(ethers.formatUnits(remainingAmount, 6));
        if (remainingUSDC > 5.0 && remainingUSDC < 6.0) {
          console.log('*** FOUND TARGET POOL ***');
          console.log('This matches the 5.288250 USDC from logs!');
          
          // Check why getPoolDetails returns 4 values instead of structured data
          console.log('Raw getPoolDetails result for this pool:');
          console.log('Length:', result.length);
          console.log('[0] info struct:', result[0]);
          console.log('[1] currentPrice:', result[1]?.toString());
          console.log('[2] remainingAmount:', result[2]?.toString());
          console.log('[3] timeRemaining:', result[3]?.toString());
        }
        
        // Check for micro amounts
        if (remainingAmount > 0n && remainingAmount < 10000n) {
          console.log('*** MICRO-COMPLETION CANDIDATE (< 0.01 USDC) ***');
        }
        
      } catch (error) {
        console.log(`Pool ${poolId} error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);