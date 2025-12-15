import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const opinionCoreAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  console.log('Deploying MinimalPoolManager...');
  
  // Deploy minimal pool manager
  const MinimalPoolManager = await ethers.getContractFactory('MinimalPoolManager');
  const minimalPoolManager = await MinimalPoolManager.deploy(opinionCoreAddress);
  await minimalPoolManager.waitForDeployment();
  const minimalPoolManagerAddress = await minimalPoolManager.getAddress();
  
  console.log('✅ MinimalPoolManager deployed to:', minimalPoolManagerAddress);
  
  // Update OpinionCore to use this minimal pool manager
  const opinionCoreAbi = [
    "function setPoolManager(address _poolManager) external",
    "function poolManager() view returns (address)"
  ];
  const opinionCore = new ethers.Contract(opinionCoreAddress, opinionCoreAbi, deployer);
  
  console.log('Setting OpinionCore to use MinimalPoolManager...');
  const setPoolManagerTx = await opinionCore.setPoolManager(minimalPoolManagerAddress);
  await setPoolManagerTx.wait();
  console.log('✅ OpinionCore updated');
  
  // Verify
  const currentPoolManager = await opinionCore.poolManager();
  console.log('Current poolManager:', currentPoolManager);
  
  if (currentPoolManager === minimalPoolManagerAddress) {
    console.log('🎉 SUCCESS! MinimalPoolManager configured!');
    console.log('Now submitAnswer should work 100%');
    
    console.log('\n=== FINAL CONFIGURATION ===');
    console.log('OpinionCore:', opinionCoreAddress);
    console.log('FeeManager:', '0x384af1318feF882B2a068A2656870436D3fb41FB');
    console.log('PoolManager:', minimalPoolManagerAddress);
  }
}

main().catch(console.error);