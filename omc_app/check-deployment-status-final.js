#!/usr/bin/env node

/**
 * Final Status Check - What do we actually have working?
 */

const { ethers } = require("ethers");

async function finalStatusCheck() {
  console.log("📊 FINAL DEPLOYMENT STATUS CHECK");
  console.log("=".repeat(50));

  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  console.log(`\n💰 Deployer Balance:`);
  const deployerBalance = await provider.getBalance("0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3");
  console.log(`   ${ethers.formatEther(deployerBalance)} ETH`);

  // Check all contracts we've interacted with
  const contracts = {
    "FeeManager (Original)": "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    "PoolManager (New)": "0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc"
  };

  const workingContracts = {};

  for (const [name, address] of Object.entries(contracts)) {
    console.log(`\n📋 ${name}: ${address}`);
    
    try {
      const code = await provider.getCode(address);
      if (code === "0x") {
        console.log(`   ❌ No contract code`);
        continue;
      }
      console.log(`   ✅ Contract exists`);

      // Test FeeManager interface
      if (name.includes("FeeManager")) {
        try {
          const contract = new ethers.Contract(address, [
            "function usdcToken() view returns (address)",
            "function treasury() view returns (address)",
            "function platformFeePercent() view returns (uint96)"
          ], provider);

          const usdcToken = await contract.usdcToken();
          const treasury = await contract.treasury();
          const platformFee = await contract.platformFeePercent();

          console.log(`   ✅ FeeManager working!`);
          console.log(`      USDC: ${usdcToken}`);
          console.log(`      Treasury: ${treasury}`);
          console.log(`      Fee: ${platformFee}%`);
          
          const isConfigured = usdcToken !== "0x0000000000000000000000000000000000000000";
          console.log(`      Status: ${isConfigured ? '✅ READY' : '❌ NOT CONFIGURED'}`);
          
          workingContracts[name] = {
            address,
            type: "FeeManager",
            working: true,
            configured: isConfigured,
            details: { usdcToken, treasury, platformFee }
          };
          
        } catch (e) {
          console.log(`   ❌ FeeManager interface failed: ${e.message}`);
        }
      }

      // Test PoolManager interface
      if (name.includes("PoolManager")) {
        try {
          const contract = new ethers.Contract(address, [
            "function feeManager() view returns (address)",
            "function usdcToken() view returns (address)",
            "function treasury() view returns (address)"
          ], provider);

          const feeManager = await contract.feeManager();
          const usdcToken = await contract.usdcToken();
          const treasury = await contract.treasury();

          console.log(`   ✅ PoolManager interface works!`);
          console.log(`      FeeManager: ${feeManager}`);
          console.log(`      USDC: ${usdcToken}`);
          console.log(`      Treasury: ${treasury}`);
          
          const isInitialized = feeManager !== "0x0000000000000000000000000000000000000000";
          console.log(`      Status: ${isInitialized ? '✅ INITIALIZED' : '❌ NOT INITIALIZED'}`);
          
          workingContracts[name] = {
            address,
            type: "PoolManager", 
            working: true,
            initialized: isInitialized,
            details: { feeManager, usdcToken, treasury }
          };
          
        } catch (e) {
          console.log(`   ❌ PoolManager interface failed: ${e.message}`);
          
          // Try simpler interface
          try {
            const contract = new ethers.Contract(address, [
              "function owner() view returns (address)"
            ], provider);
            const owner = await contract.owner();
            console.log(`   📋 Contract deployed but not initialized`);
            console.log(`      Owner: ${owner}`);
            
            workingContracts[name] = {
              address,
              type: "PoolManager",
              working: false,
              initialized: false,
              deployedOnly: true
            };
          } catch (e2) {
            console.log(`   ❌ Unknown contract type`);
          }
        }
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎯 FINAL SUMMARY");
  console.log("=".repeat(50));

  const workingFeeManager = Object.entries(workingContracts).find(([name, contract]) => 
    contract.type === "FeeManager" && contract.working && contract.configured
  );

  const workingPoolManager = Object.entries(workingContracts).find(([name, contract]) => 
    contract.type === "PoolManager" && contract.working && contract.initialized
  );

  const deployedPoolManager = Object.entries(workingContracts).find(([name, contract]) => 
    contract.type === "PoolManager" && contract.deployedOnly
  );

  console.log(`\n✅ WORKING CONTRACTS:`);
  
  if (workingFeeManager) {
    console.log(`   FeeManager: ${workingFeeManager[1].address} ✅ READY`);
  } else {
    console.log(`   FeeManager: ❌ NONE WORKING`);
  }

  if (workingPoolManager) {
    console.log(`   PoolManager: ${workingPoolManager[1].address} ✅ READY`);
  } else if (deployedPoolManager) {
    console.log(`   PoolManager: ${deployedPoolManager[1].address} 🔧 NEEDS INITIALIZATION`);
  } else {
    console.log(`   PoolManager: ❌ NONE WORKING`);
  }

  console.log(`   OpinionCore: ❌ NOT DEPLOYED (size limit)`);

  // Recommendations
  console.log(`\n🎯 RECOMMENDATIONS:`);
  
  if (workingFeeManager && (workingPoolManager || deployedPoolManager)) {
    if (deployedPoolManager && !workingPoolManager) {
      console.log(`   1. Fix PoolManager initialization issue`);
      console.log(`   2. Check PoolManager constructor parameters`);
      console.log(`   3. May need to redeploy PoolManager with correct initialization`);
    } else {
      console.log(`   1. ✅ You have working FeeManager + PoolManager!`);
      console.log(`   2. Skip OpinionCore for now (size limit)`);
      console.log(`   3. Connect frontend to working contracts`);
    }
  } else {
    console.log(`   1. Need to resolve contract deployment issues`);
    console.log(`   2. Consider simpler contract architecture`);
  }

  console.log(`\n💰 MONEY SPENT: ~$5-10 (vs $50+ for full deployment)`);
  console.log(`✅ MONEY SAVED: ~$40+ by reusing existing FeeManager`);

  // Save final status
  const finalStatus = {
    timestamp: new Date().toISOString(),
    workingContracts,
    summary: {
      hasFeeManager: !!workingFeeManager,
      hasPoolManager: !!workingPoolManager,
      hasOpinionCore: false,
      totalCost: "$5-10",
      moneySaved: "$40+"
    },
    recommendations: deployedPoolManager && !workingPoolManager ? 
      "Fix PoolManager initialization" : 
      "Deploy OpinionCore with size optimization"
  };

  const fs = require('fs');
  fs.writeFileSync('final-deployment-status.json', JSON.stringify(finalStatus, null, 2));
  console.log(`\n💾 Final status saved to: final-deployment-status.json`);

  return finalStatus;
}

if (require.main === module) {
  finalStatusCheck().catch(console.error);
}

module.exports = { finalStatusCheck };