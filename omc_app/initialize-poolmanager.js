#!/usr/bin/env node

/**
 * Initialize the deployed PoolManager
 * Address: 0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc
 */

const { ethers } = require("hardhat");
const { DEPLOYMENT_CONFIG } = require("./scripts/mainnet-deploy-config");

async function initializePoolManager() {
  console.log("🔧 INITIALIZING DEPLOYED POOLMANAGER");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 From: ${deployer.address}`);
  
  const config = DEPLOYMENT_CONFIG;
  const existingFeeManager = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  const deployedPoolManager = "0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc";

  console.log(`\n📋 CONFIGURATION:`);
  console.log(`   FeeManager: ${existingFeeManager}`);
  console.log(`   PoolManager: ${deployedPoolManager}`);
  console.log(`   USDC: ${config.externalContracts.usdcToken}`);
  console.log(`   Treasury: ${config.roles.treasury}`);
  console.log(`   Admin: ${config.roles.admin}`);

  try {
    // Connect to deployed PoolManager
    const poolManager = await ethers.getContractAt("PoolManager", deployedPoolManager);
    
    // Check if already initialized
    console.log(`\n🔍 Checking initialization status...`);
    try {
      const currentFeeManager = await poolManager.feeManager();
      console.log(`   Current FeeManager: ${currentFeeManager}`);
      
      if (currentFeeManager !== "0x0000000000000000000000000000000000000000") {
        console.log(`   ✅ PoolManager already initialized!`);
        
        // Verify configuration
        const currentUSDC = await poolManager.usdcToken();
        const currentTreasury = await poolManager.treasury();
        
        console.log(`\n✅ CURRENT CONFIGURATION:`);
        console.log(`   FeeManager: ${currentFeeManager}`);
        console.log(`   USDC: ${currentUSDC}`);
        console.log(`   Treasury: ${currentTreasury}`);
        
        const results = {
          success: true,
          already_initialized: true,
          poolManager: deployedPoolManager,
          feeManager: currentFeeManager,
          usdc: currentUSDC,
          treasury: currentTreasury
        };
        
        const fs = require('fs');
        fs.writeFileSync('poolmanager-status.json', JSON.stringify(results, null, 2));
        
        return results;
      }
    } catch (e) {
      console.log(`   ⚠️  Unable to check status, proceeding with initialization...`);
    }

    // Initialize PoolManager
    console.log(`\n🚀 Initializing PoolManager...`);
    
    const tx = await poolManager.initialize(
      "0x0000000000000000000000000000000000000000", // OpinionCore (will update later)
      existingFeeManager,                             // Existing FeeManager
      config.externalContracts.usdcToken,            // Real USDC
      config.roles.treasury,                          // Treasury Safe
      config.roles.admin                              // Admin Safe
    );
    
    console.log(`   Transaction sent: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`   ✅ Transaction confirmed!`);

    // Verify initialization
    console.log(`\n✅ VERIFICATION:`);
    const feeManager = await poolManager.feeManager();
    const usdcToken = await poolManager.usdcToken();
    const treasury = await poolManager.treasury();
    
    console.log(`   FeeManager: ${feeManager}`);
    console.log(`   USDC: ${usdcToken}`);
    console.log(`   Treasury: ${treasury}`);
    
    const feeManagerMatch = feeManager.toLowerCase() === existingFeeManager.toLowerCase();
    const usdcMatch = usdcToken.toLowerCase() === config.externalContracts.usdcToken.toLowerCase();
    const treasuryMatch = treasury.toLowerCase() === config.roles.treasury.toLowerCase();
    
    console.log(`   FeeManager Match: ${feeManagerMatch ? '✅' : '❌'}`);
    console.log(`   USDC Match: ${usdcMatch ? '✅' : '❌'}`);
    console.log(`   Treasury Match: ${treasuryMatch ? '✅' : '❌'}`);

    const results = {
      success: true,
      initialized: true,
      poolManager: deployedPoolManager,
      feeManager: feeManager,
      usdc: usdcToken,
      treasury: treasury,
      verification: {
        feeManagerMatch,
        usdcMatch,
        treasuryMatch
      }
    };

    console.log(`\n🎉 POOLMANAGER SUCCESSFULLY INITIALIZED!`);
    console.log(`\n📊 WORKING SYSTEM STATUS:`);
    console.log(`   ✅ FeeManager: ${existingFeeManager} (REUSED)`);
    console.log(`   ✅ PoolManager: ${deployedPoolManager} (NEW & INITIALIZED)`);
    console.log(`   ❌ OpinionCore: Missing (size limit issue)`);
    
    console.log(`\n🎯 WHAT WORKS NOW:`);
    console.log(`   ✅ Fee collection and management`);
    console.log(`   ✅ Pool creation and management`);
    console.log(`   ❌ Opinion creation (needs OpinionCore)`);

    // Save results
    const fs = require('fs');
    fs.writeFileSync('poolmanager-initialized.json', JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: poolmanager-initialized.json`);

    return results;

  } catch (error) {
    console.error(`\n❌ INITIALIZATION FAILED: ${error.message}`);
    
    const results = {
      success: false,
      error: error.message,
      poolManager: deployedPoolManager
    };
    
    const fs = require('fs');
    fs.writeFileSync('poolmanager-failed.json', JSON.stringify(results, null, 2));
    
    throw error;
  }
}

if (require.main === module) {
  initializePoolManager()
    .then(() => {
      console.log(`\n✅ PoolManager initialization completed!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Initialization failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { initializePoolManager };