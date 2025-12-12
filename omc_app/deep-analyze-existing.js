#!/usr/bin/env node

/**
 * DEEP ANALYSIS: Can we reuse any of the 5 existing contracts?
 * Test ALL possible interfaces before concluding we need new deployments
 */

const { ethers } = require("ethers");

async function deepAnalyze() {
  console.log("🔍 DEEP ANALYSIS: Testing ALL Contract Interfaces");
  console.log("=".repeat(70));

  const contracts = [
    "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    "0x0dc574553fb88a204c014b2a9b3c1d5bfae165da", 
    "0xc4f73fe61b811ecc6af2a94e0123506622bb8d43",
    "0xa4b604da9b202a315cfc63f43b5700e847cf847b",
    "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259"
  ];

  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const results = {};
  
  // Test EVERY possible interface we might need
  const allInterfaces = {
    FeeManager: [
      "function usdcToken() view returns (address)",
      "function treasury() view returns (address)",
      "function platformFeePercent() view returns (uint96)",
      "function initialize(address,address) external"
    ],
    
    PoolManager: [
      "function opinionCore() view returns (address)",
      "function feeManager() view returns (address)", 
      "function usdcToken() view returns (address)",
      "function treasury() view returns (address)",
      "function initialize(address,address,address,address,address) external"
    ],
    
    OpinionCore: [
      "function nextOpinionId() view returns (uint256)",
      "function usdcToken() view returns (address)",
      "function treasury() view returns (address)",
      "function feeManager() view returns (address)",
      "function poolManager() view returns (address)",
      "function isPublicCreationEnabled() view returns (bool)"
    ],
    
    OpinionCoreSimplified: [
      "function nextOpinionId() view returns (uint256)",
      "function usdcToken() view returns (address)",
      "function minimumPrice() view returns (uint96)",
      "function isPublicCreationEnabled() view returns (bool)",
      "function setMinimumPrice(uint96) external",
      "function togglePublicCreation() external"
    ],

    // Test for proxy patterns
    Proxy: [
      "function implementation() view returns (address)",
      "function admin() view returns (address)"
    ],

    // Test basic functions that might exist
    Basic: [
      "function owner() view returns (address)",
      "function paused() view returns (bool)"
    ]
  };

  for (let i = 0; i < contracts.length; i++) {
    const address = contracts[i];
    console.log(`\n📋 CONTRACT ${i + 1}: ${address}`);
    console.log("─".repeat(50));
    
    try {
      const code = await provider.getCode(address);
      if (code === "0x") {
        console.log(`   ❌ No contract code found`);
        results[address] = { exists: false };
        continue;
      }

      const contractInfo = {
        exists: true,
        address: address,
        possibleTypes: [],
        workingFunctions: {},
        isProxy: false,
        canBeUsed: false
      };

      // Check for proxy first
      try {
        const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implementationData = await provider.getStorageAt(address, implementationSlot);
        if (implementationData !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          contractInfo.isProxy = true;
          contractInfo.implementationAddress = ethers.getAddress("0x" + implementationData.slice(-40));
          console.log(`   📦 PROXY CONTRACT detected!`);
          console.log(`       Implementation: ${contractInfo.implementationAddress}`);
        }
      } catch (e) {
        // Not a proxy
      }

      // Test each interface thoroughly
      for (const [interfaceName, functions] of Object.entries(allInterfaces)) {
        console.log(`\n   Testing ${interfaceName} interface...`);
        
        const contract = new ethers.Contract(address, functions, provider);
        let workingFunctions = [];
        let failedFunctions = [];

        // Test each function individually
        for (const functionSig of functions) {
          try {
            const functionName = functionSig.split('(')[0].split(' ').pop();
            
            if (functionName === 'initialize') {
              // Skip initialize for read-only test
              continue;
            }
            
            const result = await contract[functionName]();
            workingFunctions.push({
              name: functionName,
              result: result.toString(),
              signature: functionSig
            });
            console.log(`     ✅ ${functionName}(): ${result.toString()}`);
            
          } catch (error) {
            failedFunctions.push({
              name: functionName,
              error: error.message.substring(0, 100)
            });
            console.log(`     ❌ ${functionName}(): ${error.message.substring(0, 50)}...`);
          }
        }

        // Determine if this interface is viable
        if (workingFunctions.length >= functions.length * 0.7) { // 70% success rate
          contractInfo.possibleTypes.push({
            type: interfaceName,
            confidence: (workingFunctions.length / functions.length) * 100,
            workingFunctions: workingFunctions,
            failedFunctions: failedFunctions
          });
          
          console.log(`   ⭐ VIABLE ${interfaceName}: ${workingFunctions.length}/${functions.length} functions work`);
          
          // Check if it's properly configured
          if (interfaceName === 'FeeManager') {
            const usdcFunc = workingFunctions.find(f => f.name === 'usdcToken');
            const treasuryFunc = workingFunctions.find(f => f.name === 'treasury');
            
            if (usdcFunc && treasuryFunc) {
              const isConfigured = usdcFunc.result !== "0x0000000000000000000000000000000000000000" &&
                                  treasuryFunc.result !== "0x0000000000000000000000000000000000000000";
              
              console.log(`       Configuration: ${isConfigured ? '✅ READY TO USE' : '⚠️ Needs initialization'}`);
              if (isConfigured) {
                contractInfo.canBeUsed = true;
              }
            }
          }
          
          if (interfaceName === 'OpinionCoreSimplified' || interfaceName === 'OpinionCore') {
            const nextIdFunc = workingFunctions.find(f => f.name === 'nextOpinionId');
            if (nextIdFunc) {
              console.log(`       Next Opinion ID: ${nextIdFunc.result} (${nextIdFunc.result === '1' ? 'Fresh/Clean' : 'Has Data'})`);
              contractInfo.canBeUsed = true;
            }
          }
          
          if (interfaceName === 'PoolManager') {
            contractInfo.canBeUsed = true; // PoolManager can usually be reconfigured
          }
        }
      }

      results[address] = contractInfo;

    } catch (error) {
      console.log(`   ❌ Critical error: ${error.message}`);
      results[address] = { exists: false, error: error.message };
    }
  }

  // FINAL ANALYSIS
  console.log("\n" + "=".repeat(70));
  console.log("📊 REUSABILITY ANALYSIS");
  console.log("=".repeat(70));

  const usableFeeManagers = Object.entries(results).filter(([addr, info]) => 
    info.possibleTypes?.some(t => t.type === 'FeeManager') && info.canBeUsed
  );
  
  const usableOpinionCores = Object.entries(results).filter(([addr, info]) => 
    info.possibleTypes?.some(t => t.type === 'OpinionCoreSimplified' || t.type === 'OpinionCore') && info.canBeUsed
  );
  
  const usablePoolManagers = Object.entries(results).filter(([addr, info]) => 
    info.possibleTypes?.some(t => t.type === 'PoolManager') && info.canBeUsed
  );

  console.log(`\n✅ CONTRACTS WE CAN REUSE:`);
  console.log(`   FeeManager: ${usableFeeManagers.length} found`);
  usableFeeManagers.forEach(([addr, info]) => {
    console.log(`     ${addr} - ${info.possibleTypes.find(t => t.type === 'FeeManager').confidence.toFixed(0)}% match`);
  });
  
  console.log(`   OpinionCore: ${usableOpinionCores.length} found`);
  usableOpinionCores.forEach(([addr, info]) => {
    const coreType = info.possibleTypes.find(t => t.type === 'OpinionCoreSimplified' || t.type === 'OpinionCore');
    console.log(`     ${addr} - ${coreType.type} (${coreType.confidence.toFixed(0)}% match)`);
  });
  
  console.log(`   PoolManager: ${usablePoolManagers.length} found`);
  usablePoolManagers.forEach(([addr, info]) => {
    console.log(`     ${addr} - ${info.possibleTypes.find(t => t.type === 'PoolManager').confidence.toFixed(0)}% match`);
  });

  // DEPLOYMENT RECOMMENDATIONS
  console.log(`\n🎯 DEPLOYMENT RECOMMENDATIONS:`);
  
  const needToDeploy = [];
  if (usableFeeManagers.length === 0) needToDeploy.push('FeeManager');
  if (usableOpinionCores.length === 0) needToDeploy.push('OpinionCore');
  if (usablePoolManagers.length === 0) needToDeploy.push('PoolManager');

  if (needToDeploy.length === 0) {
    console.log(`   🎉 ALL CONTRACTS CAN BE REUSED! No new deployments needed!`);
    console.log(`   💰 COST: $0 (Just configuration/connection)`);
  } else {
    console.log(`   📋 Need to deploy: ${needToDeploy.join(', ')}`);
    console.log(`   ♻️  Can reuse: ${3 - needToDeploy.length}/3 contracts`);
    console.log(`   💰 Estimated cost: $${needToDeploy.length * 8}-${needToDeploy.length * 12}`);
  }

  // Save comprehensive analysis
  const analysis = {
    timestamp: new Date().toISOString(),
    reusable_contracts: {
      fee_managers: usableFeeManagers.map(([addr]) => addr),
      opinion_cores: usableOpinionCores.map(([addr]) => addr),
      pool_managers: usablePoolManagers.map(([addr]) => addr)
    },
    deployment_needed: needToDeploy,
    detailed_results: results
  };

  const fs = require('fs');
  fs.writeFileSync('reusability-analysis.json', JSON.stringify(analysis, null, 2));
  
  console.log(`\n💾 Full analysis saved to: reusability-analysis.json`);
  
  return analysis;
}

if (require.main === module) {
  deepAnalyze().catch(console.error);
}

module.exports = { deepAnalyze };