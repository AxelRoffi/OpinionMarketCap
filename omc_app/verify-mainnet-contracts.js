#!/usr/bin/env node

/**
 * Verify Mainnet Contracts Script
 * Attempts to verify the deployed contracts on BaseScan
 */

const { spawn } = require('child_process');
const fs = require('fs');

async function verifyContracts() {
  console.log("🔍 Verifying Mainnet Contracts on BaseScan");
  console.log("=".repeat(50));

  // Load analysis results
  let analysis;
  try {
    analysis = JSON.parse(fs.readFileSync('mainnet-contract-analysis.json', 'utf8'));
  } catch (e) {
    console.log("❌ Run check-mainnet-contracts.js first");
    process.exit(1);
  }

  const contracts = [
    {
      address: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
      name: "FeeManager", 
      type: "proxy"
    },
    {
      address: "0x0dc574553fb88a204c014b2a9b3c1d5bfae165da",
      name: "Unknown",
      type: "direct"
    },
    {
      address: "0xc4f73fe61b811ecc6af2a94e0123506622bb8d43", 
      name: "Unknown",
      type: "direct"
    },
    {
      address: "0xa4b604da9b202a315cfc63f43b5700e847cf847b",
      name: "Unknown", 
      type: "direct"
    },
    {
      address: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259",
      name: "Unknown",
      type: "direct"
    }
  ];

  for (const contract of contracts) {
    console.log(`\n📋 Verifying ${contract.name}: ${contract.address}`);
    
    try {
      // For proxy contracts, we need to verify both proxy and implementation
      if (contract.type === "proxy") {
        console.log("   Attempting proxy verification...");
        
        // First verify the implementation
        const implementationAddress = analysis.results[contract.address]?.implementationAddress;
        if (implementationAddress) {
          console.log(`   Implementation: ${implementationAddress}`);
          await runVerification(implementationAddress, contract.name);
        }
        
        // Then verify the proxy itself
        await runVerification(contract.address, contract.name + "Proxy");
        
      } else {
        // Direct contract verification
        await runVerification(contract.address, contract.name);
      }
      
    } catch (error) {
      console.log(`   ❌ Verification failed: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 VERIFICATION COMPLETE");
  console.log("=".repeat(50));
  
  console.log("\n🎯 MANUAL VERIFICATION STEPS:");
  console.log("If automated verification fails, manually verify on BaseScan:");
  console.log("1. Go to https://basescan.org/address/{CONTRACT_ADDRESS}#code");
  console.log("2. Click 'Verify and Publish'");
  console.log("3. Select 'Via flattened source code'");
  console.log("4. Upload the flattened source file");
  console.log("5. Set compiler version to 0.8.20");
  console.log("6. Set optimization to 'Yes' with 1 runs");

  console.log("\n🛠️  FLATTEN CONTRACTS:");
  console.log("npx hardhat flatten contracts/core/FeeManager.sol > FeeManager-flattened.sol");
  console.log("npx hardhat flatten contracts/core/PoolManager.sol > PoolManager-flattened.sol");
  console.log("npx hardhat flatten contracts/core/OpinionCore.sol > OpinionCore-flattened.sol");
}

async function runVerification(address, contractName) {
  return new Promise((resolve, reject) => {
    const args = [
      'verify:verify',
      '--network', 'base-mainnet',
      address
    ];
    
    console.log(`   Running: npx hardhat ${args.join(' ')}`);
    
    const child = spawn('npx', ['hardhat', ...args], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`   ✅ Verification successful`);
        if (stdout.includes('Already verified')) {
          console.log(`   ℹ️  Contract already verified`);
        }
        resolve(stdout);
      } else {
        console.log(`   ❌ Verification failed (code: ${code})`);
        if (stderr) console.log(`   Error: ${stderr.trim()}`);
        resolve(); // Don't reject, continue with other contracts
      }
    });

    child.on('error', (error) => {
      console.log(`   ❌ Verification error: ${error.message}`);
      resolve(); // Don't reject, continue with other contracts
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      child.kill();
      console.log(`   ⏱️  Verification timeout`);
      resolve();
    }, 120000);
  });
}

if (require.main === module) {
  verifyContracts().catch(console.error);
}

module.exports = { verifyContracts };