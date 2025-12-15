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
  
  console.log('=== DEBUGGING POOL STRUCTURE ===');
  
  try {
    const poolCount = await poolManager.poolCount();
    console.log('Pool count:', poolCount.toString());
    
    console.log('\n1. Testing direct pools() mapping call:');
    const directPoolData = await poolManager.pools(2);
    console.log('Direct pools(2) result:');
    console.log('Length:', directPoolData.length);
    directPoolData.forEach((item, idx) => {
      console.log(`[${idx}]:`, typeof item, item.toString ? item.toString() : item);
    });
    
    console.log('\n2. Testing getPoolDetails() structured call:');
    const structuredResult = await poolManager.getPoolDetails(2);
    console.log('getPoolDetails(2) result:');
    console.log('Length:', structuredResult.length);
    structuredResult.forEach((item, idx) => {
      console.log(`[${idx}]:`, typeof item, item.toString ? item.toString() : item);
    });
    
    console.log('\n3. Analyzing getPoolDetails structure:');
    console.log('info (struct):', structuredResult[0]);
    console.log('currentPrice:', structuredResult[1]?.toString());
    console.log('remainingAmount:', structuredResult[2]?.toString()); 
    console.log('timeRemaining:', structuredResult[3]?.toString());
    
    console.log('\n4. Examining info struct fields:');
    const info = structuredResult[0];
    if (info && typeof info === 'object') {
      Object.keys(info).forEach((key, idx) => {
        console.log(`info.${key} [${idx}]:`, info[key]?.toString ? info[key].toString() : info[key]);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);