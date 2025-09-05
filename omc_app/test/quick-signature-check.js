const { ethers } = require("hardhat");

async function quickSignatureCheck() {
  console.log("🔍 QUICK SIGNATURE CHECK - TARGETING CRITICAL FUNCTIONS");
  
  // Get factory interfaces without deployment
  const opinionCoreFactory = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      ValidationLibrary: ethers.ZeroAddress,
      FeeCalculator: ethers.ZeroAddress,
      PriceCalculator: ethers.ZeroAddress
    }
  });
  
  const feeManagerFactory = await ethers.getContractFactory("FeeManager");
  const poolManagerFactory = await ethers.getContractFactory("PoolManager", {
    libraries: {
      PoolLibrary: ethers.ZeroAddress,
      ValidationLibrary: ethers.ZeroAddress
    }
  });
  const opinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
  
  console.log("\n📋 CRITICAL FUNCTION SIGNATURES:");
  console.log("=" * 60);
  
  // TARGET FUNCTIONS FOR REMAINING FAILURES
  const targetFunctions = [
    "submitAnswer",
    "deactivateOpinion", 
    "claimAccumulatedFees",
    "contributeToPool",
    "setCreatorFeePercent",
    "emergencyWithdraw",
    "platformFeesAccumulated",
    "getAccumulatedFees",
    "withdrawAccumulatedFees",
    "listQuestionForSale",
    "purchaseQuestion",
    "cancelQuestionListing",
    "pause",
    "unpause",
    "setTreasury",
    "getTreasuryAddress"
  ];
  
  const contracts = {
    OpinionCore: opinionCoreFactory,
    FeeManager: feeManagerFactory,
    PoolManager: poolManagerFactory,
    OpinionMarket: opinionMarketFactory
  };
  
  console.log("\n🎯 FUNCTION LOCATION AND SIGNATURE DISCOVERY:");
  console.log("-" * 60);
  
  for (const funcName of targetFunctions) {
    console.log(`\n🔍 SEARCHING FOR: ${funcName}`);
    let found = false;
    
    for (const [contractName, factory] of Object.entries(contracts)) {
      try {
        const fragment = factory.interface.getFunction(funcName);
        console.log(`  ✅ FOUND in ${contractName}: ${fragment.format("full")}`);
        found = true;
      } catch (e) {
        // Function not found in this contract
      }
    }
    
    if (!found) {
      console.log(`  ❌ NOT FOUND in any contract`);
    }
  }
  
  // Check specific function signatures we need
  console.log("\n🔧 CRITICAL SIGNATURE VERIFICATION:");
  console.log("-" * 60);
  
  // submitAnswer signature
  try {
    const submitFragment = opinionCoreFactory.interface.getFunction("submitAnswer");
    console.log(`✅ submitAnswer: ${submitFragment.format("full")}`);
  } catch (e) {
    console.log("❌ submitAnswer: NOT FOUND");
  }
  
  // Fee functions
  try {
    const claimFragment = feeManagerFactory.interface.getFunction("claimAccumulatedFees");
    console.log(`✅ claimAccumulatedFees: ${claimFragment.format("full")}`);
  } catch (e) {
    console.log("❌ claimAccumulatedFees: NOT FOUND");
  }
  
  try {
    const getFeesFragment = feeManagerFactory.interface.getFunction("getAccumulatedFees");
    console.log(`✅ getAccumulatedFees: ${getFeesFragment.format("full")}`);
  } catch (e) {
    console.log("❌ getAccumulatedFees: NOT FOUND");
  }
  
  // Pool functions
  try {
    const contributeFragment = poolManagerFactory.interface.getFunction("contributeToPool");
    console.log(`✅ contributeToPool: ${contributeFragment.format("full")}`);
  } catch (e) {
    console.log("❌ contributeToPool: NOT FOUND");
  }
  
  console.log("\n📊 ALL AVAILABLE FUNCTIONS BY CONTRACT:");
  console.log("-" * 60);
  
  for (const [contractName, factory] of Object.entries(contracts)) {
    console.log(`\n${contractName} FUNCTIONS:`);
    const functions = Object.keys(factory.interface.functions);
    functions.forEach(func => {
      try {
        const fragment = factory.interface.getFunction(func);
        console.log(`  ${fragment.name}: ${fragment.format("full")}`);
      } catch (e) {
        console.log(`  ${func}: Error getting fragment`);
      }
    });
  }
  
  console.log("\n🎉 QUICK SIGNATURE CHECK COMPLETE!");
}

// Execute
quickSignatureCheck()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });