// Gas Estimation Script for OpinionMarketCap Base Mainnet Deployment
// Run with: node scripts/estimate-gas-costs.js
// No hardhat dependency - pure calculation

async function estimateGasCosts() {
  console.log("⛽ OpinionMarketCap Base Mainnet Gas Estimation");
  console.log("=".repeat(50));

  // Base mainnet gas price (typically 0.1-1 gwei)
  const baseFeeGwei = 0.5; // 0.5 gwei
  const ethPrice = 3000; // $3000 per ETH (adjust as needed)

  console.log(`📊 Assumptions:`);
  console.log(`   Base Fee: ${baseFeeGwei} gwei`);
  console.log(`   ETH Price: $${ethPrice}`);
  console.log();

  // Gas estimates for each contract
  const gasEstimates = {
    // Core contracts
    opinionCoreSimplified: {
      deployment: 2_800_000,
      initialization: 300_000,
      description: "Main opinion management contract"
    },
    
    feeManager: {
      deployment: 800_000,
      initialization: 150_000, 
      description: "Fee calculation and distribution"
    },
    
    poolManager: {
      deployment: 1_200_000,
      initialization: 200_000,
      description: "Collective funding pools"
    },

    // Configuration transactions
    parameterSetup: {
      deployment: 0,
      initialization: 400_000, // Multiple setters
      description: "Initial parameter configuration"
    },

    roleSetup: {
      deployment: 0,
      initialization: 200_000, // Role grants
      description: "Admin and moderator role setup"
    },

    // Contract verification (off-chain cost)
    verification: {
      deployment: 0,
      initialization: 0,
      description: "BaseScan verification (API calls)",
      usdCost: 1 // Flat $1 estimate
    }
  };

  let totalGas = 0;
  let totalUsdCost = 0;

  console.log("📋 Detailed Gas Breakdown:");
  console.log("-".repeat(80));
  console.log("Contract/Action".padEnd(25) + "Gas Used".padEnd(12) + "ETH Cost".padEnd(12) + "USD Cost".padEnd(10) + "Description");
  console.log("-".repeat(80));

  Object.entries(gasEstimates).forEach(([name, estimate]) => {
    const totalGasForItem = estimate.deployment + estimate.initialization;
    const ethCost = (totalGasForItem * baseFeeGwei) / 1e9; // Convert gwei to ETH
    const usdCost = ethCost * ethPrice + (estimate.usdCost || 0);
    
    totalGas += totalGasForItem;
    totalUsdCost += usdCost;

    console.log(
      name.padEnd(25) + 
      totalGasForItem.toLocaleString().padEnd(12) +
      `${ethCost.toFixed(6)}`.padEnd(12) +
      `$${usdCost.toFixed(2)}`.padEnd(10) +
      estimate.description
    );
  });

  console.log("-".repeat(80));
  const totalEthFormatted = (totalGas * baseFeeGwei) / 1e9;
  
  console.log(
    "TOTAL".padEnd(25) +
    totalGas.toLocaleString().padEnd(12) +
    `${totalEthFormatted.toFixed(6)}`.padEnd(12) +
    `$${totalUsdCost.toFixed(2)}`.padEnd(10) +
    "Complete deployment"
  );

  console.log();
  console.log("💰 Cost Summary:");
  console.log(`   Total Gas: ${totalGas.toLocaleString()} units`);
  console.log(`   Total ETH: ${totalEthFormatted.toFixed(6)} ETH`);
  console.log(`   Total USD: $${totalUsdCost.toFixed(2)} (at $${ethPrice}/ETH)`);

  // Additional costs
  console.log();
  console.log("💡 Additional Considerations:");
  console.log(`   Gnosis Safe Creation: ~$3-5 USD`);
  console.log(`   Deployer Wallet Buffer: ~$50 USD recommended`);
  console.log(`   Post-deployment Testing: ~$5-10 USD`);
  console.log(`   Emergency Fund: ~$20-30 USD`);

  const recommendedBudget = totalUsdCost + 80; // Buffer for additional costs
  console.log(`   📊 Recommended Budget: $${recommendedBudget.toFixed(2)} USD`);

  // Gas optimization tips
  console.log();
  console.log("⚡ Gas Optimization Tips:");
  console.log("   1. Deploy during low Base network usage (typically UTC nights)");
  console.log("   2. Use batch transactions via Gnosis Safe when possible");
  console.log("   3. Consider deploying libraries separately if contract size issues");
  console.log("   4. Monitor Base gas tracker before deployment");

  // Current Base gas info
  console.log();
  console.log("📈 Base Network Info:");
  console.log("   Base is an L2 with very low gas costs compared to Ethereum mainnet");
  console.log("   Typical gas fees: 0.1-1 gwei (vs 20-100 gwei on mainnet)");
  console.log("   Block time: ~2 seconds");
  console.log("   Gas limit per block: 30M units");

  // Deployment timeline
  console.log();
  console.log("⏱️  Estimated Deployment Timeline:");
  console.log("   Contract Deployment: 5-10 minutes");
  console.log("   Parameter Configuration: 2-3 minutes");
  console.log("   Contract Verification: 1-2 minutes");
  console.log("   Total Time: ~10-15 minutes");

  return {
    totalGas,
    totalEthCost: totalEthFormatted,
    totalUsdCost,
    recommendedBudget
  };
}

// Price scenarios
async function priceScenarios() {
  console.log();
  console.log("💹 Price Scenarios:");
  console.log("-".repeat(40));
  
  const gasAmount = 5_700_000; // Approximate total gas
  const scenarios = [
    { ethPrice: 2000, gasPrice: "0.3" },
    { ethPrice: 3000, gasPrice: "0.5" },
    { ethPrice: 4000, gasPrice: "0.8" },
    { ethPrice: 5000, gasPrice: "1.0" }
  ];

  console.log("ETH Price".padEnd(12) + "Gas (gwei)".padEnd(12) + "Total USD");
  console.log("-".repeat(40));

  scenarios.forEach(scenario => {
    const ethCost = (gasAmount * parseFloat(scenario.gasPrice)) / 1e9;
    const usdCost = ethCost * scenario.ethPrice;
    
    console.log(
      `$${scenario.ethPrice}`.padEnd(12) +
      `${scenario.gasPrice}`.padEnd(12) +
      `$${usdCost.toFixed(2)}`
    );
  });
}

// Main execution
async function main() {
  try {
    const result = await estimateGasCosts();
    await priceScenarios();
    
    console.log();
    console.log("✅ Gas estimation complete!");
    console.log(`💰 Budget recommendation: $${result.recommendedBudget.toFixed(2)}`);
    
  } catch (error) {
    console.error("❌ Gas estimation failed:", error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { estimateGasCosts };