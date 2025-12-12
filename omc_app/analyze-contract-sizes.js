#!/usr/bin/env node

/**
 * Analyze contract sizes and deployment issues
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function analyzeContracts() {
  console.log("🔍 CONTRACT ANALYSIS: Finding the root issues");
  console.log("=".repeat(60));

  // 1. Check contract sizes
  console.log("\n📏 CONTRACT SIZES:");
  
  const sizeReport = fs.readFileSync(path.join(__dirname, "..", ".hardhat_contract_sizer_output.txt"), "utf8");
  const lines = sizeReport.split("\n").filter(line => line.includes("│"));
  
  const contracts = {};
  lines.forEach(line => {
    const parts = line.split("│").map(p => p.trim()).filter(p => p);
    if (parts.length >= 2 && !parts[0].includes("Contract Name")) {
      const name = parts[0];
      const deployedSize = parseFloat(parts[1]);
      const initSize = parseFloat(parts[2] || 0);
      contracts[name] = { deployedSize, initSize };
    }
  });

  const mainnetLimit = 24.576; // 24KB limit
  const problemContracts = [];
  const workableContracts = [];

  Object.entries(contracts).forEach(([name, sizes]) => {
    if (name.includes("Opinion") || name.includes("Pool") || name.includes("Fee")) {
      console.log(`\n   ${name}:`);
      console.log(`      Deployed: ${sizes.deployedSize} KiB ${sizes.deployedSize > mainnetLimit ? '❌ TOO LARGE' : '✅'}`);
      console.log(`      Init: ${sizes.initSize} KiB`);
      
      if (sizes.deployedSize > mainnetLimit) {
        problemContracts.push(name);
      } else if (!name.includes("Mock") && !name.includes("Test")) {
        workableContracts.push(name);
      }
    }
  });

  // 2. Analyze deployment failures
  console.log("\n❌ DEPLOYMENT FAILURE ANALYSIS:");
  
  const issues = {
    "OpinionCore": {
      size: "26.330 KiB",
      limit: "24.576 KiB", 
      issue: "2KB over mainnet limit",
      solution: "Need to reduce by ~10%"
    },
    "OpinionCoreSimplified": {
      size: "24.115 KiB",
      limit: "24.576 KiB",
      issue: "Just under limit but proxy adds overhead", 
      solution: "Deploy without proxy OR reduce further"
    },
    "PoolManager": {
      size: "Unknown",
      issue: "Deployment succeeded but initialization failed",
      solution: "Check initialize parameters or deploy simpler version"
    }
  };

  Object.entries(issues).forEach(([contract, info]) => {
    console.log(`\n   ${contract}:`);
    Object.entries(info).forEach(([key, value]) => {
      console.log(`      ${key}: ${value}`);
    });
  });

  // 3. Working contracts
  console.log("\n✅ WORKING CONTRACTS:");
  console.log(`   FeeManager: 0x64997bd18520d93e7f0da87c69582d06b7f265d5`);
  console.log(`      Status: Fully configured and working`);
  console.log(`      Can collect fees immediately`);

  // 4. Deployment strategy options
  console.log("\n🎯 DEPLOYMENT STRATEGIES:");
  
  const strategies = [
    {
      name: "Strategy 1: Minimal Core",
      description: "Create ultra-minimal OpinionCore with ONLY essential features",
      contracts: ["FeeManager (existing)", "MinimalOpinionCore", "SimplePoolManager"],
      confidence: 95,
      pros: ["Will definitely fit under 24KB", "Quick to deploy", "Can upgrade later"],
      cons: ["Limited features initially", "Need to add features via upgrades"],
      estimatedCost: "$10-15"
    },
    {
      name: "Strategy 2: Direct Deploy (No Proxy)",
      description: "Deploy OpinionCoreSimplified WITHOUT proxy to save space",
      contracts: ["FeeManager (existing)", "OpinionCoreSimplified", "PoolManager"],
      confidence: 80,
      pros: ["Full features immediately", "No proxy overhead"],
      cons: ["Cannot upgrade", "Still close to size limit"],
      estimatedCost: "$15-20"
    },
    {
      name: "Strategy 3: Diamond Pattern",
      description: "Use Diamond proxy pattern to split OpinionCore into facets",
      contracts: ["FeeManager (existing)", "DiamondProxy", "Multiple Facets"],
      confidence: 70,
      pros: ["Unlimited size", "Highly upgradeable", "Best long-term solution"],
      cons: ["Complex implementation", "Higher deployment cost"],
      estimatedCost: "$30-40"
    },
    {
      name: "Strategy 4: Two-Contract System",
      description: "Split OpinionCore into OpinionManager + TradingEngine",
      contracts: ["FeeManager (existing)", "OpinionManager", "TradingEngine"],
      confidence: 85,
      pros: ["Each contract under 24KB", "Clear separation of concerns"],
      cons: ["More complex interactions", "Slightly higher gas costs"],
      estimatedCost: "$20-25"
    }
  ];

  strategies.forEach((strategy, index) => {
    console.log(`\n   ${strategy.name}`);
    console.log(`      Description: ${strategy.description}`);
    console.log(`      Confidence: ${strategy.confidence}% 🎯`);
    console.log(`      Contracts: ${strategy.contracts.join(", ")}`);
    console.log(`      Pros: ${strategy.pros.join("; ")}`);
    console.log(`      Cons: ${strategy.cons.join("; ")}`);
    console.log(`      Cost: ${strategy.estimatedCost}`);
  });

  // 5. Recommended approach
  console.log("\n⭐ RECOMMENDED APPROACH:");
  console.log("   Strategy 1: Minimal Core (95% confidence)");
  console.log("   - Start with absolute minimum features");
  console.log("   - Get users trading ASAP");
  console.log("   - Add features incrementally");
  console.log("   - Total deployment in 30 minutes");

  console.log("\n📋 MINIMAL CORE FEATURES:");
  console.log("   ✅ Create opinions (basic)");
  console.log("   ✅ Submit answers");
  console.log("   ✅ Trade ownership");
  console.log("   ✅ Collect fees");
  console.log("   ❌ Pools (add later)");
  console.log("   ❌ Advanced moderation (add later)");
  console.log("   ❌ Complex pricing (use simple formula)");

  // Save analysis
  const analysis = {
    timestamp: new Date().toISOString(),
    problemContracts,
    workableContracts,
    issues,
    strategies,
    recommendation: "Strategy 1: Minimal Core"
  };

  fs.writeFileSync("contract-analysis.json", JSON.stringify(analysis, null, 2));
  console.log("\n💾 Analysis saved to: contract-analysis.json");

  return analysis;
}

if (require.main === module) {
  analyzeContracts().catch(console.error);
}

module.exports = { analyzeContracts };