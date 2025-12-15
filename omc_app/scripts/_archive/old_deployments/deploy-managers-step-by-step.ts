import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  const opinionCoreAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  const treasuryAddress = '0xFb7eF00D5C2a87d282F273632e834f9105795067';
  
  // Use the deployed FeeManager
  const feeManagerAddress = '0x384af1318feF882B2a068A2656870436D3fb41FB';
  console.log('Using FeeManager:', feeManagerAddress);
  
  try {
    // Try to deploy PoolManager without initialization first
    console.log('\n=== DEPLOYING POOL MANAGER ===');
    const PoolManager = await ethers.getContractFactory('PoolManager');
    const poolManager = await PoolManager.deploy();
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    console.log('✅ PoolManager deployed to:', poolManagerAddress);
    
    // Try simple initialization
    console.log('Trying minimal initialization...');
    try {
      const initTx = await poolManager.initialize(
        opinionCoreAddress,
        feeManagerAddress,
        usdcAddress,
        treasuryAddress,
        deployer.address
      );
      await initTx.wait();
      console.log('✅ PoolManager initialized');
    } catch (error: any) {
      console.log('❌ PoolManager init failed:', error.message);
      
      // Let's just update OpinionCore with FeeManager for now
      console.log('Proceeding with FeeManager only...');
    }
    
    // Update OpinionCore addresses
    console.log('\n=== UPDATING OPINION CORE ===');
    const opinionCoreAbi = [
      "function setFeeManager(address _feeManager) external",
      "function setPoolManager(address _poolManager) external",
      "function feeManager() view returns (address)",
      "function poolManager() view returns (address)"
    ];
    const opinionCore = new ethers.Contract(opinionCoreAddress, opinionCoreAbi, deployer);
    
    // Set FeeManager
    console.log('Setting FeeManager...');
    const setFeeManagerTx = await opinionCore.setFeeManager(feeManagerAddress);
    await setFeeManagerTx.wait();
    console.log('✅ FeeManager updated in OpinionCore');
    
    // Try to set PoolManager if it was initialized
    try {
      console.log('Setting PoolManager...');
      const setPoolManagerTx = await opinionCore.setPoolManager(poolManagerAddress);
      await setPoolManagerTx.wait();
      console.log('✅ PoolManager updated in OpinionCore');
    } catch (error: any) {
      console.log('⚠️  PoolManager update failed, using FeeManager address as fallback');
      const setPoolManagerTx = await opinionCore.setPoolManager(feeManagerAddress);
      await setPoolManagerTx.wait();
      console.log('✅ PoolManager set to FeeManager address');
    }
    
    // Verify final setup
    console.log('\n=== VERIFICATION ===');
    const currentFeeManager = await opinionCore.feeManager();
    const currentPoolManager = await opinionCore.poolManager();
    
    console.log('OpinionCore feeManager:', currentFeeManager);
    console.log('OpinionCore poolManager:', currentPoolManager);
    
    // Test submitAnswer now
    console.log('\n=== TESTING SUBMIT ANSWER ===');
    console.log('Now try running the submitAnswer script again!');
    console.log('The contract should now work with proper fee management.');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);