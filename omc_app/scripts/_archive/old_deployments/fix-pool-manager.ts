import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const opinionCoreAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const feeManagerAddress = '0x384af1318feF882B2a068A2656870436D3fb41FB';
  
  console.log('Fixing PoolManager configuration...');
  
  // Temporarily set PoolManager to FeeManager address
  // This will make submitAnswer work since FeeManager has the required functions
  const opinionCoreAbi = [
    "function setPoolManager(address _poolManager) external",
    "function poolManager() view returns (address)"
  ];
  const opinionCore = new ethers.Contract(opinionCoreAddress, opinionCoreAbi, deployer);
  
  console.log('Setting PoolManager to FeeManager address...');
  const setPoolManagerTx = await opinionCore.setPoolManager(feeManagerAddress);
  await setPoolManagerTx.wait();
  console.log('✅ PoolManager set to FeeManager');
  
  // Verify
  const currentPoolManager = await opinionCore.poolManager();
  console.log('Current poolManager:', currentPoolManager);
  console.log('FeeManager address:', feeManagerAddress);
  
  if (currentPoolManager === feeManagerAddress) {
    console.log('✅ Configuration fixed!');
    console.log('Now submitAnswer should work - both managers point to working FeeManager');
  }
}

main().catch(console.error);