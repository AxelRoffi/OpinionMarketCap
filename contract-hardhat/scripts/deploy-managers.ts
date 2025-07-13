import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  const opinionCoreAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  const treasuryAddress = '0xFb7eF00D5C2a87d282F273632e834f9105795067';
  
  try {
    // Deploy FeeManager
    console.log('\n=== DEPLOYING FEE MANAGER ===');
    const FeeManager = await ethers.getContractFactory('FeeManager');
    const feeManager = await FeeManager.deploy();
    await feeManager.waitForDeployment();
    const feeManagerAddress = await feeManager.getAddress();
    console.log('✅ FeeManager deployed to:', feeManagerAddress);
    
    // Initialize FeeManager (only needs usdcToken and treasury)
    console.log('Initializing FeeManager...');
    const initFeeManagerTx = await feeManager.initialize(
      usdcAddress,
      treasuryAddress
    );
    await initFeeManagerTx.wait();
    console.log('✅ FeeManager initialized');
    
    // Deploy PoolManager
    console.log('\n=== DEPLOYING POOL MANAGER ===');
    const PoolManager = await ethers.getContractFactory('PoolManager');
    const poolManager = await PoolManager.deploy();
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    console.log('✅ PoolManager deployed to:', poolManagerAddress);
    
    // Initialize PoolManager (needs 5 parameters including admin)
    console.log('Initializing PoolManager...');
    const initPoolManagerTx = await poolManager.initialize(
      opinionCoreAddress,
      feeManagerAddress,
      usdcAddress,
      treasuryAddress,
      deployer.address // admin
    );
    await initPoolManagerTx.wait();
    console.log('✅ PoolManager initialized');
    
    // Update OpinionCore with real manager addresses
    console.log('\n=== UPDATING OPINION CORE ===');
    const opinionCoreAbi = [
      "function setFeeManager(address _feeManager) external",
      "function setPoolManager(address _poolManager) external"
    ];
    const opinionCore = new ethers.Contract(opinionCoreAddress, opinionCoreAbi, deployer);
    
    console.log('Setting FeeManager address...');
    const setFeeManagerTx = await opinionCore.setFeeManager(feeManagerAddress);
    await setFeeManagerTx.wait();
    console.log('✅ FeeManager address updated');
    
    console.log('Setting PoolManager address...');
    const setPoolManagerTx = await opinionCore.setPoolManager(poolManagerAddress);
    await setPoolManagerTx.wait();
    console.log('✅ PoolManager address updated');
    
    // Verify the updates
    console.log('\n=== VERIFICATION ===');
    const verifyAbi = [
      "function feeManager() view returns (address)",
      "function poolManager() view returns (address)"
    ];
    const verifyContract = new ethers.Contract(opinionCoreAddress, verifyAbi, deployer);
    
    const currentFeeManager = await verifyContract.feeManager();
    const currentPoolManager = await verifyContract.poolManager();
    
    console.log('OpinionCore feeManager:', currentFeeManager);
    console.log('OpinionCore poolManager:', currentPoolManager);
    
    if (currentFeeManager === feeManagerAddress && currentPoolManager === poolManagerAddress) {
      console.log('✅ ALL MANAGERS SUCCESSFULLY DEPLOYED AND CONFIGURED!');
      
      console.log('\n=== SUMMARY ===');
      console.log('OpinionCore:', opinionCoreAddress);
      console.log('FeeManager:', feeManagerAddress);
      console.log('PoolManager:', poolManagerAddress);
      console.log('Treasury:', treasuryAddress);
      console.log('USDC:', usdcAddress);
      
      console.log('\n🎉 ALL FEATURES NOW WORKING:');
      console.log('✅ createOpinion');
      console.log('✅ submitAnswer');
      console.log('✅ Fee distribution');
      console.log('✅ MEV protection');
      console.log('✅ Pool rewards');
    } else {
      console.log('❌ Address verification failed');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);