const { ethers, upgrades } = require("hardhat");
const { DEPLOYMENT_CONFIG, validateConfig } = require("./mainnet-deploy-config");

async function main() {
  console.log("🚀 Starting OpinionMarketCap Deployment (Size-Aware)");
  console.log("=".repeat(50));

  // Validate configuration
  console.log("⚙️  Validating configuration...");
  validateConfig();
  console.log("✅ Configuration validated");

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const config = DEPLOYMENT_CONFIG;
  
  console.log("\n📋 Deployment Configuration:");
  console.log(`   Treasury: ${config.roles.treasury}`);
  console.log(`   Admin: ${config.roles.admin}`);

  // Try to get contract factory first to check compilation
  console.log("\n🔍 Checking contract compilation...");
  try {
    const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore");
    console.log("✅ OpinionCore contract factory loaded");
    
    // Check if contract is too large
    console.log("⚠️  NOTE: OpinionCore is 26.33 KB (over 24KB limit)");
    console.log("   Attempting proxy deployment anyway...");
    
    // Try FeeManager first (smaller contract)
    console.log("\n🏦 Step 1: Deploying FeeManager...");
    const FeeManagerFactory = await ethers.getContractFactory("FeeManager");
    console.log("   FeeManager factory loaded, attempting deployment...");
    
    const feeManager = await upgrades.deployProxy(
      FeeManagerFactory,
      [
        config.externalContracts.usdcToken,
        config.roles.treasury
      ],
      { initializer: 'initialize' }
    );
    
    console.log("   Waiting for FeeManager deployment...");
    await feeManager.deployed();
    console.log(`✅ FeeManager deployed: ${feeManager.address}`);
    
  } catch (error) {
    console.error("❌ Contract deployment failed:", error.message);
    if (error.message.includes("contract code size")) {
      console.error("🚨 This is a contract size limit error");
      console.error("   Solution: Use Diamond proxy pattern or reduce contract size");
    }
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🎉 Deployment test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });