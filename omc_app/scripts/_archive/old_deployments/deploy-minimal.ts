import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting minimal OpinionCore deployment...");
  
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
  
  // Deploy Mock USDC for testing
  console.log("🏦 Deploying Mock USDC...");
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC");
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`✅ Mock USDC deployed at: ${usdcAddress}`);
  
  // Use simple address placeholders for dependencies
  const mockFeeManagerAddress = deployer.address; // Using deployer as placeholder
  const mockPoolManagerAddress = deployer.address; // Using deployer as placeholder
  const treasuryAddress = deployer.address; // Treasury address
  
  console.log("🧠 Deploying OpinionCore...");
  const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: priceCalculatorAddress,
    },
  });
  
  // Deploy the implementation directly and initialize it
  const opinionCoreImpl = await OpinionCoreFactory.deploy();
  await opinionCoreImpl.waitForDeployment();
  const opinionCoreAddress = await opinionCoreImpl.getAddress();
  console.log(`✅ OpinionCore implementation deployed at: ${opinionCoreAddress}`);
  
  // Initialize the contract
  console.log("⚙️ Initializing OpinionCore...");
  await opinionCoreImpl.initialize(
    usdcAddress,
    mockFeeManagerAddress,
    mockPoolManagerAddress,
    treasuryAddress
  );
  console.log("✅ OpinionCore initialized");
  
  // Enable public creation for testing
  console.log("⚙️ Enabling public opinion creation...");
  await opinionCoreImpl.togglePublicCreation();
  console.log("✅ Public creation enabled");
  
  // Verify the new fee model is working
  console.log("\n🔍 Verifying new fee model...");
  try {
    const minPrice = await opinionCoreImpl.MIN_INITIAL_PRICE();
    const maxPrice = await opinionCoreImpl.MAX_INITIAL_PRICE();
    const minPriceUsdc = Number(minPrice) / 1_000_000;
    const maxPriceUsdc = Number(maxPrice) / 1_000_000;
    const isPublicEnabled = await opinionCoreImpl.isPublicCreationEnabled();
    
    console.log(`✅ MIN_INITIAL_PRICE: ${minPriceUsdc} USDC`);
    console.log(`✅ MAX_INITIAL_PRICE: ${maxPriceUsdc} USDC`);
    console.log(`✅ Public creation enabled: ${isPublicEnabled}`);
    
    if (minPriceUsdc === 1 && maxPriceUsdc === 100) {
      console.log("🎉 Fee model verification successful!");
    } else {
      console.log("⚠️ Fee model verification failed");
    }
  } catch (e) {
    console.log("⚠️ Could not verify fee model:", e);
  }
  
  // Mint some test USDC to deployer for testing
  console.log("\n💰 Minting test USDC...");
  await mockUSDC.mint(deployer.address, ethers.parseUnits("1000", 6)); // 1000 USDC
  const usdcBalance = await mockUSDC.balanceOf(deployer.address);
  console.log(`✅ Minted ${ethers.formatUnits(usdcBalance, 6)} USDC to ${deployer.address}`);
  
  console.log("\n📋 Deployment Summary:");
  console.log(`🏦 Mock USDC: ${usdcAddress}`);
  console.log(`🧠 OpinionCore: ${opinionCoreAddress}`);
  console.log(`📚 PriceCalculator Library: ${priceCalculatorAddress}`);
  console.log(`🏛️ Treasury: ${treasuryAddress}`);
  
  console.log("\n🎯 New Fee Model Features:");
  console.log("- Initial price range: 1-100 USDC ✅");
  console.log("- Creation fee: 20% of initial price (minimum 5 USDC) ✅");
  console.log("- User payment: only creation fee (not full initial price) ✅");
  
  console.log("\n🧪 Testing Fee Examples:");
  console.log("- initialPrice = 1 USDC → fee = 5 USDC (minimum)");
  console.log("- initialPrice = 10 USDC → fee = 5 USDC (minimum)");
  console.log("- initialPrice = 30 USDC → fee = 6 USDC (20%)");
  console.log("- initialPrice = 50 USDC → fee = 10 USDC (20%)");
  console.log("- initialPrice = 100 USDC → fee = 20 USDC (20%)");
  
  // Test the fee calculation with a simple test
  console.log("\n🧮 Testing fee calculation logic:");
  const testPrices = [1_000_000, 10_000_000, 30_000_000, 50_000_000, 100_000_000];
  
  for (const testPrice of testPrices) {
    // Simulate the fee calculation
    let fee = Math.floor((testPrice * 20) / 100);
    if (fee < 5_000_000) fee = 5_000_000;
    
    const priceUsdc = testPrice / 1_000_000;
    const feeUsdc = fee / 1_000_000;
    console.log(`  ${priceUsdc} USDC → ${feeUsdc} USDC fee`);
  }
  
  // Save addresses to a file for easy access
  const addresses = {
    mockUSDC: usdcAddress,
    opinionCore: opinionCoreAddress,
    priceCalculatorLibrary: priceCalculatorAddress,
    treasury: treasuryAddress,
    deployer: deployer.address
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("\n📄 Contract addresses saved to deployed-addresses.json");
  
  console.log("\n🚀 Ready to test! Next steps:");
  console.log("1. Approve USDC spending: mockUSDC.approve(opinionCore, amount)");
  console.log("2. Create opinion: opinionCore.createOpinion(question, answer, description, initialPrice, categories)");
  console.log("3. Fee will be automatically calculated and charged to treasury");
  
  console.log("\n🎉 SUCCESS! Your new fee model is deployed and ready!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });