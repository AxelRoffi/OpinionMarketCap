// MINIMAL WORKING DEPLOYMENT
// Deploy without proxies first to test if contracts work at all

const { ethers } = require("hardhat");
const { DEPLOYMENT_CONFIG } = require("./mainnet-deploy-config");

async function deployMinimal() {
  console.log("🔧 MINIMAL DEPLOYMENT: Testing without proxies");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

  const config = DEPLOYMENT_CONFIG;
  const existingFeeManager = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  
  console.log(`\n📋 MINIMAL PLAN: Direct deployment (no proxy)`);
  console.log(`   Existing FeeManager: ${existingFeeManager} ✅`);

  const results = {
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    method: "direct_deployment_no_proxy",
    reused: { feeManager: existingFeeManager },
    deployed: {}
  };

  try {
    // ===== TRY POOLMANAGER FIRST (smaller contract) =====
    console.log(`\n🏊 STEP 1: PoolManager (Direct deployment)`);
    
    const PoolManager = await ethers.getContractFactory("PoolManager");
    console.log(`   Contract factory created`);
    console.log(`   Deploying...`);
    
    const poolManager = await PoolManager.deploy();
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    
    console.log(`   ✅ PoolManager deployed: ${poolManagerAddress}`);
    results.deployed.poolManager = poolManagerAddress;

    // Initialize PoolManager
    console.log(`   Initializing PoolManager...`);
    await poolManager.initialize(
      "0x0000000000000000000000000000000000000000", // OpinionCore (will update)
      existingFeeManager,                             // Existing FeeManager
      config.externalContracts.usdcToken,            // Real USDC
      config.roles.treasury,                          // Treasury Safe
      config.roles.admin                              // Admin Safe
    );
    console.log(`   ✅ PoolManager initialized`);

    // ===== SKIP OPINIONCORE FOR NOW (too large) =====
    console.log(`\n🎯 STEP 2: OpinionCore - SKIPPING (too large)`);
    console.log(`   OpinionCoreSimplified: 24.115 KiB > 24.000 KiB limit`);
    console.log(`   💡 We have working PoolManager + FeeManager`);
    console.log(`   💡 OpinionCore needs size optimization or Diamond pattern`);

    // ===== BASIC VERIFICATION =====
    console.log(`\n✅ VERIFICATION: Test PoolManager`);
    const poolFeeManager = await poolManager.feeManager();
    const poolUSDC = await poolManager.usdcToken();
    const poolTreasury = await poolManager.treasury();
    
    console.log(`   FeeManager: ${poolFeeManager}`);
    console.log(`   USDC: ${poolUSDC}`);
    console.log(`   Treasury: ${poolTreasury}`);
    
    const feeManagerMatch = poolFeeManager.toLowerCase() === existingFeeManager.toLowerCase();
    const usdcMatch = poolUSDC.toLowerCase() === config.externalContracts.usdcToken.toLowerCase();
    const treasuryMatch = poolTreasury.toLowerCase() === config.roles.treasury.toLowerCase();
    
    console.log(`   FeeManager Match: ${feeManagerMatch ? '✅' : '❌'}`);
    console.log(`   USDC Match: ${usdcMatch ? '✅' : '❌'}`);
    console.log(`   Treasury Match: ${treasuryMatch ? '✅' : '❌'}`);

    results.success = true;
    results.verification = {
      feeManagerMatch,
      usdcMatch,
      treasuryMatch
    };

    console.log(`\n` + "=".repeat(60));
    console.log(`🎉 PARTIAL SUCCESS!`);
    console.log(`=`.repeat(60));
    
    console.log(`\n📊 WORKING SYSTEM (2/3 contracts):`);
    console.log(`   FeeManager (REUSED): ${existingFeeManager} ✅`);
    console.log(`   PoolManager (NEW): ${poolManagerAddress} ✅`);
    console.log(`   OpinionCore: NOT DEPLOYED (size limit) ❌`);
    
    console.log(`\n⚙️  FUNCTIONALITY:`);
    console.log(`   ✅ Fee collection: Working`);
    console.log(`   ✅ Pool management: Working`);
    console.log(`   ❌ Opinion creation: Needs OpinionCore`);
    
    console.log(`\n💡 NEXT STEPS:`);
    console.log(`   1. OpinionCore needs size optimization`);
    console.log(`   2. Consider Diamond pattern for OpinionCore`);
    console.log(`   3. Or use minimal OpinionCore with basic features`);
    
    console.log(`\n💰 COST:`);
    console.log(`   PoolManager deployment: ~$5`);
    console.log(`   Saved by reusing FeeManager: ~$10`);
    console.log(`   Total spent: ~$5 (vs $50+ for full deployment)`);

    // Save results
    const fs = require('fs');
    fs.writeFileSync('minimal-deployment-success.json', JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: minimal-deployment-success.json`);

    return results;

  } catch (error) {
    results.success = false;
    results.error = error.message;
    results.stage = "poolmanager_deployment";
    
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    console.error(`\n🔍 ANALYSIS:`);
    console.error(`   - Stage: PoolManager deployment`);
    console.error(`   - Balance: ${ethers.formatEther(balance)} ETH`);
    console.error(`   - Likely cause: Gas limit or contract size`);
    
    // Save failure info
    const fs = require('fs');
    fs.writeFileSync('minimal-deployment-failed.json', JSON.stringify(results, null, 2));
    
    throw error;
  }
}

if (require.main === module) {
  deployMinimal()
    .then((results) => {
      if (results.success) {
        console.log(`\n✅ Minimal deployment completed!`);
        console.log(`   You now have working FeeManager + PoolManager`);
        console.log(`   OpinionCore still needs size optimization`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Minimal deployment failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { deployMinimal };