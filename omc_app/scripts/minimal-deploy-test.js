const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Minimal Deployment Test");
  console.log("=".repeat(30));

  try {
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deployer:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    // Try to deploy just FeeManager first (smallest contract)
    console.log("\n🏦 Testing FeeManager deployment...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    console.log("✅ FeeManager factory loaded");
    
    console.log("⚡ Starting FeeManager proxy deployment...");
    const feeManager = await upgrades.deployProxy(
      FeeManager,
      [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
        "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"  // Your Treasury Safe
      ],
      { initializer: 'initialize' }
    );
    
    console.log("⏳ Waiting for deployment confirmation...");
    await feeManager.waitForDeployment();
    const address = await feeManager.getAddress();
    console.log(`✅ FeeManager deployed at: ${address}`);
    
    console.log("\n🎉 Minimal deployment test successful!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
  }
}

main().catch(console.error);