#!/usr/bin/env node

/**
 * Thorough Analysis of Your 5 Existing Deployed Contracts
 * Let's see what we have and what's missing
 */

const { ethers } = require("ethers");

async function analyzeExistingContracts() {
  console.log("🔍 ANALYZING YOUR 5 EXISTING MAINNET CONTRACTS");
  console.log("=".repeat(60));

  const contracts = [
    "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    "0x0dc574553fb88a204c014b2a9b3c1d5bfae165da", 
    "0xc4f73fe61b811ecc6af2a94e0123506622bb8d43",
    "0xa4b604da9b202a315cfc63f43b5700e847cf847b",
    "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259"
  ];

  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const results = {};
  
  for (let i = 0; i < contracts.length; i++) {
    const address = contracts[i];
    console.log(`\n📋 CONTRACT ${i + 1}: ${address}`);
    
    try {
      const code = await provider.getCode(address);
      if (code === "0x") {
        console.log(`   ❌ No contract code`);
        results[address] = { isContract: false };
        continue;
      }
      
      const contractInfo = {
        isContract: true,
        address: address,
        type: "Unknown",
        isProxy: false,
        functions: []
      };

      // Check for proxy
      try {
        const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implementationData = await provider.getStorageAt(address, implementationSlot);
        if (implementationData !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          contractInfo.isProxy = true;
          contractInfo.implementationAddress = ethers.getAddress("0x" + implementationData.slice(-40));
          console.log(`   📦 PROXY CONTRACT - Implementation: ${contractInfo.implementationAddress}`);
        }
      } catch (e) {
        // Not a proxy
      }

      // Test multiple contract interfaces
      const interfaces = {
        // FeeManager interface
        FeeManager: [
          "function usdcToken() view returns (address)",
          "function treasury() view returns (address)",
          "function platformFeePercent() view returns (uint96)"
        ],
        
        // PoolManager interface
        PoolManager: [
          "function opinionCore() view returns (address)",
          "function feeManager() view returns (address)",
          "function usdcToken() view returns (address)",
          "function treasury() view returns (address)"
        ],
        
        // OpinionCore interface
        OpinionCore: [
          "function nextOpinionId() view returns (uint256)",
          "function usdcToken() view returns (address)",
          "function treasury() view returns (address)",
          "function feeManager() view returns (address)",
          "function poolManager() view returns (address)"
        ],
        
        // OpinionCoreSimplified interface
        OpinionCoreSimplified: [
          "function nextOpinionId() view returns (uint256)",
          "function usdcToken() view returns (address)",
          "function minimumPrice() view returns (uint96)",
          "function isPublicCreationEnabled() view returns (bool)"
        ]
      };

      // Test each interface
      for (const [contractType, abi] of Object.entries(interfaces)) {
        try {
          const contract = new ethers.Contract(address, abi, provider);
          let isMatch = true;
          let details = {};

          // Test each function
          for (const funcSig of abi) {
            try {
              const funcName = funcSig.split('(')[0].split(' ').pop();
              const result = await contract[funcName]();
              details[funcName] = result.toString();
              contractInfo.functions.push(funcName);
            } catch (e) {
              isMatch = false;
              break;
            }
          }

          if (isMatch) {
            contractInfo.type = contractType;
            contractInfo.details = details;
            console.log(`   ✅ IDENTIFIED: ${contractType}`);
            
            // Display key details
            Object.entries(details).forEach(([key, value]) => {
              if (key === 'nextOpinionId') {
                console.log(`      Next Opinion ID: ${value}`);
              } else if (key === 'usdcToken') {
                const isRealUSDC = value === "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
                console.log(`      USDC: ${value} ${isRealUSDC ? '✅ (Real Base USDC)' : '❌'}`);
              } else if (key === 'treasury') {
                const isYourSafe = value === "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d";
                console.log(`      Treasury: ${value} ${isYourSafe ? '✅ (Your Safe)' : '❌'}`);
              } else if (key === 'platformFeePercent') {
                console.log(`      Platform Fee: ${value}%`);
              } else if (key === 'minimumPrice') {
                console.log(`      Minimum Price: ${value} (${ethers.formatUnits(value, 6)} USDC)`);
              } else if (key === 'isPublicCreationEnabled') {
                console.log(`      Public Creation: ${value ? 'Enabled' : 'Disabled'}`);
              } else {
                console.log(`      ${key}: ${value}`);
              }
            });
            
            break;
          }
        } catch (e) {
          // Not this interface
        }
      }

      // Check for admin roles
      if (contractInfo.type !== "Unknown") {
        try {
          const contract = new ethers.Contract(address, [
            "function hasRole(bytes32, address) view returns (bool)",
            "function ADMIN_ROLE() view returns (bytes32)",
            "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
          ], provider);

          // Check admin roles
          const yourEOA = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3";
          const yourAdminSafe = "0xd903412900e87D71BF3A420cc57757E86326B1C8";
          
          try {
            const adminRole = await contract.ADMIN_ROLE();
            const eoaAdmin = await contract.hasRole(adminRole, yourEOA);
            const safeAdmin = await contract.hasRole(adminRole, yourAdminSafe);
            
            console.log(`      Admin Roles:`);
            console.log(`        EOA (${yourEOA}): ${eoaAdmin ? '✅' : '❌'}`);
            console.log(`        Safe (${yourAdminSafe}): ${safeAdmin ? '✅' : '❌'}`);
            
            contractInfo.adminRoles = { eoaAdmin, safeAdmin, adminRole };
          } catch (e) {
            console.log(`      Admin Roles: ❌ Unable to check`);
          }
        } catch (e) {
          // No role system
        }
      }

      results[address] = contractInfo;

    } catch (error) {
      console.log(`   ❌ Error analyzing: ${error.message}`);
      results[address] = { isContract: false, error: error.message };
    }
  }

  // Summary analysis
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY OF YOUR EXISTING CONTRACTS");
  console.log("=".repeat(60));

  const working = Object.entries(results).filter(([addr, info]) => info.type && info.type !== "Unknown");
  const missing = [];

  const hasOpinionCore = working.some(([addr, info]) => 
    info.type === "OpinionCore" || info.type === "OpinionCoreSimplified"
  );
  const hasFeeManager = working.some(([addr, info]) => info.type === "FeeManager");
  const hasPoolManager = working.some(([addr, info]) => info.type === "PoolManager");

  console.log(`\n✅ WORKING CONTRACTS FOUND: ${working.length}/3 needed`);
  working.forEach(([addr, info]) => {
    console.log(`   ${info.type}: ${addr}`);
  });

  if (!hasOpinionCore) missing.push("OpinionCore");
  if (!hasFeeManager) missing.push("FeeManager");
  if (!hasPoolManager) missing.push("PoolManager");

  if (missing.length > 0) {
    console.log(`\n❌ MISSING CONTRACTS: ${missing.join(", ")}`);
  }

  // Deployment plan
  console.log("\n🎯 DEPLOYMENT PLAN:");
  
  if (missing.length === 0) {
    console.log("   🎉 ALL CONTRACTS FOUND! Just need to connect them.");
    console.log("   1. Configure contract addresses in each contract");
    console.log("   2. Set up proper admin roles");
    console.log("   3. Initialize any uninitialized contracts");
  } else {
    console.log(`   📋 You need to deploy: ${missing.join(", ")}`);
    console.log("   💡 Use existing contracts and only deploy missing ones");
    console.log("   💰 This will save money vs deploying everything new");
  }

  // Save analysis
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      total_contracts: contracts.length,
      working_contracts: working.length,
      missing_contracts: missing,
      has_opinion_core: hasOpinionCore,
      has_fee_manager: hasFeeManager,
      has_pool_manager: hasPoolManager
    },
    contracts: results
  };

  const fs = require('fs');
  fs.writeFileSync('existing-contracts-analysis.json', JSON.stringify(analysis, null, 2));
  
  console.log(`\n💾 Analysis saved to: existing-contracts-analysis.json`);
  
  return analysis;
}

if (require.main === module) {
  analyzeExistingContracts().catch(console.error);
}

module.exports = { analyzeExistingContracts };