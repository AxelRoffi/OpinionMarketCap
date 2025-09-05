const { ethers } = require("hardhat");

async function inspectRealContracts() {
  console.log("🔍 REAL CONTRACT SIGNATURE DISCOVERY");
  console.log("=====================================");
  
  try {
    // Deploy the real contract system to get actual addresses
    const { deployRealOpinionMarketSystem } = require("./fixtures/deployments");
    const { contracts } = await deployRealOpinionMarketSystem();
    
    console.log("\n📋 CONTRACT ADDRESSES:");
    console.log(`OpinionCore: ${await contracts.opinionCore.getAddress()}`);
    console.log(`FeeManager: ${await contracts.feeManager.getAddress()}`);
    console.log(`PoolManager: ${await contracts.poolManager.getAddress()}`);
    
    console.log("\n🔍 INSPECTING OpinionCore FUNCTIONS:");
    console.log("====================================");
    
    // Get all function signatures from OpinionCore
    const opinionCoreFunctions = contracts.opinionCore.interface.fragments
      .filter(f => f.type === 'function')
      .map(f => ({
        name: f.name,
        signature: f.format("full"),
        inputs: f.inputs.map(i => `${i.type} ${i.name}`).join(', '),
        outputs: f.outputs ? f.outputs.map(o => o.type).join(', ') : 'void'
      }));
    
    console.log("\n📝 ALL OpinionCore FUNCTIONS:");
    opinionCoreFunctions.forEach(func => {
      console.log(`✅ ${func.name}(${func.inputs}) → ${func.outputs}`);
    });
    
    console.log("\n🎯 CRITICAL FUNCTION ANALYSIS:");
    console.log("===============================");
    
    // Inspect specific critical functions
    const criticalFunctions = [
      "createOpinion",
      "submitAnswer", 
      "getOpinionDetails",
      "getNextPrice",
      "setMaxPriceChange",
      "setPlatformFeePercent",
      "withdrawPlatformFees"
    ];
    
    for (const funcName of criticalFunctions) {
      try {
        if (contracts.opinionCore.interface.hasFunction(funcName)) {
          const fragment = contracts.opinionCore.interface.getFunction(funcName);
          console.log(`\n🔥 ${funcName}:`);
          console.log(`   Full signature: ${fragment.format("full")}`);
          console.log(`   Input types: ${fragment.inputs.map(i => i.type).join(', ')}`);
          console.log(`   Input names: ${fragment.inputs.map(i => i.name).join(', ')}`);
          
          // Test parameter combinations for createOpinion
          if (funcName === "createOpinion") {
            console.log("\n🧪 TESTING createOpinion PARAMETER COMBINATIONS:");
            
            const testCombinations = [
              { params: 2, desc: "2 params (question, answer)" },
              { params: 3, desc: "3 params (question, answer, description)" },
              { params: 4, desc: "4 params (question, answer, description, price)" },
              { params: 5, desc: "5 params (question, answer, description, price, categories)" },
              { params: 6, desc: "6 params (question, answer, description, price, categories, ipfs)" }
            ];
            
            for (const combo of testCombinations) {
              try {
                let testParams = [];
                if (combo.params >= 2) testParams.push("Test Question", "Test Answer");
                if (combo.params >= 3) testParams.push("Test Description");
                if (combo.params >= 4) testParams.push(ethers.parseUnits("2", 6));
                if (combo.params >= 5) testParams.push(["Technology"]);
                if (combo.params >= 6) testParams.push("ipfsHash");
                
                await contracts.opinionCore.createOpinion.staticCall(...testParams);
                console.log(`   ✅ ${combo.desc} - WORKS`);
                break; // Found working combination
              } catch (e) {
                console.log(`   ❌ ${combo.desc} - FAILS: ${e.message.split('(')[0]}`);
              }
            }
          }
        } else if (contracts.feeManager.interface.hasFunction(funcName)) {
          const fragment = contracts.feeManager.interface.getFunction(funcName);
          console.log(`\n🔥 ${funcName} (FeeManager):`);
          console.log(`   Full signature: ${fragment.format("full")}`);
          console.log(`   Input types: ${fragment.inputs.map(i => i.type).join(', ')}`);
        } else {
          console.log(`\n❌ ${funcName}: NOT FOUND in any contract`);
        }
      } catch (e) {
        console.log(`\n❌ ${funcName}: ERROR - ${e.message}`);
      }
    }
    
    console.log("\n🔍 INSPECTING FeeManager FUNCTIONS:");
    console.log("===================================");
    
    const feeManagerFunctions = contracts.feeManager.interface.fragments
      .filter(f => f.type === 'function')
      .map(f => ({
        name: f.name,
        inputs: f.inputs.map(i => `${i.type} ${i.name}`).join(', ')
      }));
    
    feeManagerFunctions.forEach(func => {
      console.log(`✅ ${func.name}(${func.inputs})`);
    });
    
    console.log("\n🔍 INSPECTING EVENTS:");
    console.log("=====================");
    
    const events = contracts.opinionCore.interface.fragments
      .filter(f => f.type === 'event')
      .map(f => f.name);
    
    console.log("OpinionCore Events:", events.join(', '));
    
    console.log("\n🎯 FINAL RECOMMENDATIONS:");
    console.log("==========================");
    console.log("Use the EXACT signatures discovered above in your tests!");
    console.log("Replace ALL guessed function calls with the confirmed working signatures.");
    
  } catch (error) {
    console.error("❌ Contract inspection failed:", error.message);
  }
}

// Export for use in tests
module.exports = { inspectRealContracts };

// Run directly if called
if (require.main === module) {
  inspectRealContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}