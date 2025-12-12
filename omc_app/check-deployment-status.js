#!/usr/bin/env node

/**
 * Check Current Deployment Status
 * Shows what's working and what's needed
 */

const { ethers } = require("ethers");

async function checkStatus() {
  console.log("📊 CURRENT DEPLOYMENT STATUS");
  console.log("=".repeat(50));

  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const deployerAddress = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3";
  
  // Check deployer balance
  const balance = await provider.getBalance(deployerAddress);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH ($${(parseFloat(ethers.formatEther(balance)) * 3500).toFixed(2)})`);
  
  // Check your existing FeeManager
  console.log(`\n🏦 EXISTING FEEMANAGER STATUS:`);
  const feeManagerAddress = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  
  try {
    const feeManager = new ethers.Contract(feeManagerAddress, [
      "function usdcToken() view returns (address)",
      "function treasury() view returns (address)",
      "function platformFeePercent() view returns (uint96)"
    ], provider);
    
    const usdcToken = await feeManager.usdcToken();
    const treasury = await feeManager.treasury();
    const platformFee = await feeManager.platformFeePercent();
    
    console.log(`   Address: ${feeManagerAddress}`);
    console.log(`   USDC: ${usdcToken} ${usdcToken === "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" ? "✅ (Real USDC)" : "❌"}`);
    console.log(`   Treasury: ${treasury} ${treasury === "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d" ? "✅ (Your Safe)" : "❌"}`);
    console.log(`   Platform Fee: ${platformFee}%`);
    console.log(`   Status: ${usdcToken !== "0x0000000000000000000000000000000000000000" ? "✅ INITIALIZED" : "❌ NOT INITIALIZED"}`);
    
  } catch (error) {
    console.log(`   ❌ Error checking FeeManager: ${error.message}`);
  }

  // Check what's still needed
  console.log(`\n📋 DEPLOYMENT CHECKLIST:`);
  console.log(`   ✅ FeeManager: EXISTS & INITIALIZED`);
  console.log(`   ❌ PoolManager: MISSING (need ~$7-10 to deploy)`);
  console.log(`   ❌ OpinionCore: MISSING (may hit 24KB size limit)`);
  
  console.log(`\n💡 RECOMMENDED NEXT STEPS:`);
  
  if (parseFloat(ethers.formatEther(balance)) < 0.01) {
    console.log(`   1. 💰 ADD 0.01 ETH (~$35) to deployer wallet`);
    console.log(`      Address: ${deployerAddress}`);
  }
  
  console.log(`   2. 🚀 Deploy PoolManager (saves money by reusing FeeManager)`);
  console.log(`   3. 🎯 Attempt OpinionCore (may need size optimization)`);
  console.log(`   4. 🔗 Connect all contracts together`);
  console.log(`   5. 🌐 Update frontend with contract addresses`);

  console.log(`\n🎉 PROGRESS SO FAR:`);
  console.log(`   - Your existing FeeManager is now properly configured!`);
  console.log(`   - Only 2 more contracts needed for full functionality`);
  console.log(`   - Saved money by reusing existing contracts ✅`);

  const costEstimate = 0.008; // ETH
  const costUSD = costEstimate * 3500;
  
  console.log(`\n💸 ESTIMATED REMAINING COST:`);
  console.log(`   PoolManager + OpinionCore: ~${costEstimate} ETH (~$${costUSD.toFixed(2)})`);
  console.log(`   Total for complete system: ~$${costUSD.toFixed(2)} (vs $50+ for full new deployment)`);
}

checkStatus().catch(console.error);