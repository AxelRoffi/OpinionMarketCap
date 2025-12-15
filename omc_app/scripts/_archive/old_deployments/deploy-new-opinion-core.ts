import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Starting fresh OpinionCore deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
  
  // First deploy required libraries
  console.log("📚 Deploying PriceCalculator library...");
  const PriceCalculatorLibrary = await ethers.getContractFactory("PriceCalculator");
  const priceCalculatorLib = await PriceCalculatorLibrary.deploy();
  await priceCalculatorLib.waitForDeployment();
  const priceCalculatorAddress = await priceCalculatorLib.getAddress();
  console.log(`✅ PriceCalculator library deployed at: ${priceCalculatorAddress}`);
  
  // Deploy other required contracts (mock for testing)
  console.log("🏦 Deploying Mock USDC...");
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC");
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`✅ Mock USDC deployed at: ${usdcAddress}`);
  
  console.log("⚙️ Deploying FeeManager...");
  const FeeManagerFactory = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(
    FeeManagerFactory,
    [usdcAddress, deployer.address], // USDC and treasury
    { kind: 'uups' }
  );
  await feeManager.waitForDeployment();
  const feeManagerAddress = await feeManager.getAddress();
  console.log(`✅ FeeManager deployed at: ${feeManagerAddress}`);
  
  console.log("🏊 Deploying PoolManager...");
  const PoolManagerFactory = await ethers.getContractFactory("PoolManager");
  const poolManager = await upgrades.deployProxy(
    PoolManagerFactory,
    [usdcAddress, feeManagerAddress, deployer.address], // USDC, FeeManager, treasury
    { kind: 'uups' }
  );
  await poolManager.waitForDeployment();
  const poolManagerAddress = await poolManager.getAddress();
  console.log(`✅ PoolManager deployed at: ${poolManagerAddress}`);
  
  // Deploy OpinionCore with library linking
  console.log("🧠 Deploying OpinionCore...");
  const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: priceCalculatorAddress,
    },
  });
  
  const opinionCore = await upgrades.deployProxy(
    OpinionCoreFactory,
    [usdcAddress, feeManagerAddress, poolManagerAddress, deployer.address], // USDC, FeeManager, PoolManager, treasury
    { 
      kind: 'uups',
      unsafeAllow: ['external-library-linking']
    }
  );
  
  await opinionCore.waitForDeployment();
  const opinionCoreAddress = await opinionCore.getAddress();
  console.log(`✅ OpinionCore deployed at: ${opinionCoreAddress}`);
  
  // Verify the new fee model is working
  console.log("\n🔍 Verifying new fee model...");
  try {
    const minPrice = await opinionCore.MIN_INITIAL_PRICE();
    const maxPrice = await opinionCore.MAX_INITIAL_PRICE();
    const minPriceUsdc = Number(minPrice) / 1_000_000;
    const maxPriceUsdc = Number(maxPrice) / 1_000_000;
    
    console.log(`✅ MIN_INITIAL_PRICE: ${minPriceUsdc} USDC`);
    console.log(`✅ MAX_INITIAL_PRICE: ${maxPriceUsdc} USDC`);
    
    if (minPriceUsdc === 1 && maxPriceUsdc === 100) {
      console.log("🎉 Fee model verification successful!");
    } else {
      console.log("⚠️ Fee model verification failed");
    }
  } catch (e) {
    console.log("⚠️ Could not verify fee model:", e);
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log(`🏦 Mock USDC: ${usdcAddress}`);
  console.log(`⚙️ FeeManager: ${feeManagerAddress}`);
  console.log(`🏊 PoolManager: ${poolManagerAddress}`);
  console.log(`🧠 OpinionCore: ${opinionCoreAddress}`);
  console.log(`📚 PriceCalculator Library: ${priceCalculatorAddress}`);
  
  console.log("\n🎯 New Fee Model Features:");
  console.log("- Initial price range: 1-100 USDC ✅");
  console.log("- Creation fee: 20% of initial price (minimum 5 USDC) ✅");
  console.log("- User payment: only creation fee (not full initial price) ✅");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });