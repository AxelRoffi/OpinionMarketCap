#!/usr/bin/env node

/**
 * Check Mainnet Contract Status Script
 * Analyzes the 5 deployed contracts to determine functionality and ownership
 */

const { ethers } = require("ethers");

async function checkMainnetContracts() {
  console.log("🔍 Checking Mainnet Contract Status");
  console.log("=".repeat(50));

  const contracts = [
    "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    "0x0dc574553fb88a204c014b2a9b3c1d5bfae165da", 
    "0xc4f73fe61b811ecc6af2a94e0123506622bb8d43",
    "0xa4b604da9b202a315cfc63f43b5700e847cf847b",
    "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259"
  ];

  const results = {};
  
  // Connect to Base mainnet
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  for (let i = 0; i < contracts.length; i++) {
    const address = contracts[i];
    console.log(`\n📋 Contract ${i + 1}: ${address}`);
    
    try {
      // Basic contract info
      const code = await provider.getCode(address);
      const isContract = code !== "0x";
      
      console.log(`   Is Contract: ${isContract ? "✅" : "❌"}`);
      
      if (!isContract) {
        results[address] = { isContract: false, error: "No contract code" };
        continue;
      }

      // Try to detect contract type by calling standard functions
      const contractInfo = {
        isContract: true,
        address: address,
        type: "Unknown",
        isProxy: false,
        admin: null,
        verified: false
      };

      // Check if it's a proxy (EIP-1967 pattern)
      try {
        const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implementationData = await provider.getStorageAt(address, implementationSlot);
        
        if (implementationData !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          contractInfo.isProxy = true;
          contractInfo.implementationAddress = ethers.getAddress("0x" + implementationData.slice(-40));
          console.log(`   Proxy Type: ✅ UUPS Proxy`);
          console.log(`   Implementation: ${contractInfo.implementationAddress}`);
        }
      } catch (e) {
        // Not a proxy or different proxy type
      }

      // Try common contract interfaces
      try {
        // Check for OpinionCore interface
        const contract = new ethers.Contract(address, [
          "function nextOpinionId() view returns (uint256)",
          "function usdcToken() view returns (address)",
          "function treasury() view returns (address)",
          "function hasRole(bytes32, address) view returns (bool)",
          "function ADMIN_ROLE() view returns (bytes32)"
        ], provider);

        try {
          const nextOpinionId = await contract.nextOpinionId();
          const usdcToken = await contract.usdcToken();
          const treasury = await contract.treasury();
          
          contractInfo.type = "OpinionCore";
          contractInfo.nextOpinionId = nextOpinionId.toString();
          contractInfo.usdcToken = usdcToken;
          contractInfo.treasury = treasury;
          
          console.log(`   Type: ✅ OpinionCore`);
          console.log(`   Next Opinion ID: ${contractInfo.nextOpinionId}`);
          console.log(`   USDC Token: ${contractInfo.usdcToken}`);
          console.log(`   Treasury: ${contractInfo.treasury}`);

          // Check admin role
          try {
            const adminRole = await contract.ADMIN_ROLE();
            
            // Check if deployer has admin role (your EOA)
            const deployerEOA = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3"; // Your EOA from deployed-addresses-real-usdc.json
            const isDeployerAdmin = await contract.hasRole(adminRole, deployerEOA);
            
            // Check if Safe wallet has admin role
            const safeAdminAddress = "0xFb7eF00D5C2a87d282F273632e834f9105795067"; // Your Safe from deployed-addresses-real-usdc.json
            const isSafeAdmin = await contract.hasRole(adminRole, safeAdminAddress);
            
            console.log(`   EOA Admin (${deployerEOA}): ${isDeployerAdmin ? "✅" : "❌"}`);
            console.log(`   Safe Admin (${safeAdminAddress}): ${isSafeAdmin ? "✅" : "❌"}`);
            
            contractInfo.adminRoles = {
              deployerEOA: isDeployerAdmin,
              safeAdmin: isSafeAdmin,
              adminRoleHash: adminRole
            };
            
          } catch (e) {
            console.log(`   Admin Role Check: ❌ Failed`);
          }

        } catch (e) {
          // Not OpinionCore, try other interfaces
        }

      } catch (e) {
        console.log(`   Interface Check: ❌ Failed`);
      }

      // Try FeeManager interface
      if (contractInfo.type === "Unknown") {
        try {
          const contract = new ethers.Contract(address, [
            "function usdcToken() view returns (address)",
            "function treasury() view returns (address)",
            "function platformFeePercent() view returns (uint96)"
          ], provider);

          const usdcToken = await contract.usdcToken();
          const treasury = await contract.treasury();
          const platformFeePercent = await contract.platformFeePercent();
          
          contractInfo.type = "FeeManager";
          contractInfo.usdcToken = usdcToken;
          contractInfo.treasury = treasury;
          contractInfo.platformFeePercent = platformFeePercent.toString();
          
          console.log(`   Type: ✅ FeeManager`);
          console.log(`   USDC Token: ${contractInfo.usdcToken}`);
          console.log(`   Treasury: ${contractInfo.treasury}`);
          console.log(`   Platform Fee: ${contractInfo.platformFeePercent}%`);

        } catch (e) {
          // Not FeeManager
        }
      }

      // Try PoolManager interface
      if (contractInfo.type === "Unknown") {
        try {
          const contract = new ethers.Contract(address, [
            "function opinionCore() view returns (address)",
            "function feeManager() view returns (address)",
            "function usdcToken() view returns (address)"
          ], provider);

          const opinionCore = await contract.opinionCore();
          const feeManager = await contract.feeManager();
          const usdcToken = await contract.usdcToken();
          
          contractInfo.type = "PoolManager";
          contractInfo.opinionCore = opinionCore;
          contractInfo.feeManager = feeManager;
          contractInfo.usdcToken = usdcToken;
          
          console.log(`   Type: ✅ PoolManager`);
          console.log(`   OpinionCore: ${contractInfo.opinionCore}`);
          console.log(`   FeeManager: ${contractInfo.feeManager}`);
          console.log(`   USDC Token: ${contractInfo.usdcToken}`);

        } catch (e) {
          // Not PoolManager
        }
      }

      results[address] = contractInfo;

    } catch (error) {
      console.log(`   Error: ❌ ${error.message}`);
      results[address] = { 
        isContract: false, 
        error: error.message 
      };
    }
  }

  // Summary Report
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY REPORT");
  console.log("=".repeat(50));

  const opinionCores = Object.entries(results).filter(([addr, info]) => info.type === "OpinionCore");
  const feeManagers = Object.entries(results).filter(([addr, info]) => info.type === "FeeManager");
  const poolManagers = Object.entries(results).filter(([addr, info]) => info.type === "PoolManager");
  const unknown = Object.entries(results).filter(([addr, info]) => info.type === "Unknown" && info.isContract);

  console.log(`\n✅ OpinionCore contracts: ${opinionCores.length}`);
  opinionCores.forEach(([addr, info]) => {
    console.log(`   ${addr} - ID: ${info.nextOpinionId} - Treasury: ${info.treasury}`);
    if (info.adminRoles) {
      console.log(`     EOA Admin: ${info.adminRoles.deployerEOA}, Safe Admin: ${info.adminRoles.safeAdmin}`);
    }
  });

  console.log(`\n💰 FeeManager contracts: ${feeManagers.length}`);
  feeManagers.forEach(([addr, info]) => {
    console.log(`   ${addr} - Fee: ${info.platformFeePercent}% - Treasury: ${info.treasury}`);
  });

  console.log(`\n🏊 PoolManager contracts: ${poolManagers.length}`);
  poolManagers.forEach(([addr, info]) => {
    console.log(`   ${addr} - OpinionCore: ${info.opinionCore}`);
  });

  console.log(`\n❓ Unknown contracts: ${unknown.length}`);
  unknown.forEach(([addr, info]) => {
    console.log(`   ${addr} - ${info.isProxy ? "Proxy" : "Direct"} contract`);
  });

  // Recommendations
  console.log("\n🎯 RECOMMENDATIONS:");
  
  if (opinionCores.length > 0) {
    const bestCore = opinionCores[0][1];
    console.log(`✅ Use OpinionCore: ${opinionCores[0][0]}`);
    
    if (bestCore.adminRoles) {
      if (!bestCore.adminRoles.safeAdmin) {
        console.log(`⚠️  Grant admin role to Safe wallet`);
      }
      if (bestCore.adminRoles.deployerEOA) {
        console.log(`⚠️  Consider revoking EOA admin role for security`);
      }
    }
  }

  if (feeManagers.length > 0) {
    console.log(`✅ Use FeeManager: ${feeManagers[0][0]}`);
  }

  if (poolManagers.length > 0) {
    console.log(`✅ Use PoolManager: ${poolManagers[0][0]}`);
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync('mainnet-contract-analysis.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    recommendations: {
      opinionCore: opinionCores[0]?.[0],
      feeManager: feeManagers[0]?.[0], 
      poolManager: poolManagers[0]?.[0]
    }
  }, null, 2));

  console.log(`\n💾 Analysis saved to: mainnet-contract-analysis.json`);
}

if (require.main === module) {
  checkMainnetContracts().catch(console.error);
}

module.exports = { checkMainnetContracts };