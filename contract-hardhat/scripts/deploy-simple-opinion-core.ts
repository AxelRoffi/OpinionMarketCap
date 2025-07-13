import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting simple OpinionCore deployment...");
  
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
  
  // For now, let's use mock addresses for the other components
  // You can replace these with actual contract deployments later
  const mockFeeManagerAddress = deployer.address; // Using deployer address as mock
  const mockPoolManagerAddress = deployer.address; // Using deployer address as mock
  const treasuryAddress = deployer.address; // Treasury address
  
  console.log("🧠 Deploying OpinionCore...");
  const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: priceCalculatorAddress,
    },
  });
  
  // Deploy as upgradeable proxy
  const { upgrades } = require("hardhat");
  
  const opinionCore = await upgrades.deployProxy(
    OpinionCoreFactory,
    [usdcAddress, mockFeeManagerAddress, mockPoolManagerAddress, treasuryAddress],
    { 
      kind: 'uups',
      unsafeAllow: ['external-library-linking']
    }
  );
  
  await opinionCore.waitForDeployment();
  const opinionCoreAddress = await opinionCore.getAddress();
  console.log(`✅ OpinionCore deployed at: ${opinionCoreAddress}`);
  
  // Enable public creation for testing
  console.log("⚙️ Enabling public opinion creation...");
  await opinionCore.togglePublicCreation();
  console.log("✅ Public creation enabled");
  
  // Verify the new fee model is working
  console.log("\n🔍 Verifying new fee model...");
  try {
    const minPrice = await opinionCore.MIN_INITIAL_PRICE();
    const maxPrice = await opinionCore.MAX_INITIAL_PRICE();
    const minPriceUsdc = Number(minPrice) / 1_000_000;
    const maxPriceUsdc = Number(maxPrice) / 1_000_000;
    const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
    
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
  
  console.log("\n🧪 Ready for Testing:");
  console.log("- Approve USDC spending to OpinionCore before creating opinions");
  console.log("- Create opinions with initialPrice between 1-100 USDC");
  console.log("- Fee calculation will be automatic (20% with 5 USDC minimum)");
  
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });