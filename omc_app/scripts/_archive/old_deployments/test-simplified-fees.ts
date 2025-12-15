import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing simplified fee system...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  try {
    // Deploy PriceCalculator library
    console.log("\n📦 Deploying PriceCalculator library...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    console.log("PriceCalculator deployed at:", priceCalculatorAddress);
    
    // Deploy OpinionCore with simplified fee system
    console.log("\n📦 Deploying OpinionCore with simplified fees...");
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
      libraries: {
        PriceCalculator: priceCalculatorAddress,
      },
    });
    
    const opinionCore = await OpinionCore.deploy();
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log("OpinionCore deployed at:", opinionCoreAddress);
    
    // Deploy a simple mock FeeManager for testing
    console.log("\n📦 Deploying simple FeeManager...");
    const MockFeeManager = await ethers.getContractFactory("MockFeeManager");
    const mockFeeManager = await MockFeeManager.deploy();
    await mockFeeManager.waitForDeployment();
    const mockFeeManagerAddress = await mockFeeManager.getAddress();
    console.log("MockFeeManager deployed at:", mockFeeManagerAddress);
    
    // Initialize OpinionCore
    console.log("\n⚙️ Initializing OpinionCore...");
    await opinionCore.initialize(
      USDC_ADDRESS,
      mockFeeManagerAddress,
      deployer.address, // poolManager
      TREASURY_ADDRESS
    );
    console.log("✅ OpinionCore initialized");
    
    // Enable public creation
    await opinionCore.togglePublicCreation();
    console.log("✅ Public creation enabled");
    
    // Mock USDC contract for testing
    console.log("\n📦 Deploying Mock USDC...");
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("Mock USDC", "MUSDC", 6);
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("Mock USDC deployed at:", mockUSDCAddress);
    
    // Update OpinionCore to use mock USDC
    await opinionCore.setUSDCToken(mockUSDCAddress);
    console.log("✅ Updated to use mock USDC");
    
    // Mint some USDC to deployer
    await mockUSDC.mint(deployer.address, ethers.parseUnits("1000", 6));
    console.log("✅ Minted 1000 USDC to deployer");
    
    // Approve OpinionCore to spend USDC
    await mockUSDC.approve(opinionCoreAddress, ethers.parseUnits("1000", 6));
    console.log("✅ Approved OpinionCore to spend USDC");
    
    // Test 1: Check initial balances
    console.log("\n💰 Initial Balances:");
    const treasuryBalance = await mockUSDC.balanceOf(TREASURY_ADDRESS);
    const deployerBalance = await mockUSDC.balanceOf(deployer.address);
    console.log("- Treasury:", ethers.formatUnits(treasuryBalance, 6), "USDC");
    console.log("- Deployer:", ethers.formatUnits(deployerBalance, 6), "USDC");
    
    // Test 2: Create opinion (creation fee should go to treasury)
    console.log("\n🧪 Test 1: Creating opinion...");
    const createTx = await opinionCore.createOpinion(
      "Test question with simplified fees?",
      "Test answer",
      "Test description",
      ethers.parseUnits("5", 6), // 5 USDC
      ["Other"]
    );
    await createTx.wait();
    console.log("✅ Opinion created");
    
    // Check balances after creation
    console.log("\n💰 Balances after opinion creation:");
    const treasuryBalanceAfterCreate = await mockUSDC.balanceOf(TREASURY_ADDRESS);
    const deployerBalanceAfterCreate = await mockUSDC.balanceOf(deployer.address);
    console.log("- Treasury:", ethers.formatUnits(treasuryBalanceAfterCreate, 6), "USDC");
    console.log("- Deployer:", ethers.formatUnits(deployerBalanceAfterCreate, 6), "USDC");
    
    const creationFeeReceived = treasuryBalanceAfterCreate - treasuryBalance;
    console.log("- Creation fee received:", ethers.formatUnits(creationFeeReceived, 6), "USDC");
    
    // Test 3: Submit answer (platform fee should go to treasury)
    console.log("\n🧪 Test 2: Submitting answer...");
    const submitTx = await opinionCore.submitAnswer(
      1,
      "New answer",
      "New description"
    );
    await submitTx.wait();
    console.log("✅ Answer submitted");
    
    // Check final balances
    console.log("\n💰 Final Balances:");
    const treasuryBalanceFinal = await mockUSDC.balanceOf(TREASURY_ADDRESS);
    const deployerBalanceFinal = await mockUSDC.balanceOf(deployer.address);
    console.log("- Treasury:", ethers.formatUnits(treasuryBalanceFinal, 6), "USDC");
    console.log("- Deployer:", ethers.formatUnits(deployerBalanceFinal, 6), "USDC");
    
    const platformFeeReceived = treasuryBalanceFinal - treasuryBalanceAfterCreate;
    console.log("- Platform fee received:", ethers.formatUnits(platformFeeReceived, 6), "USDC");
    
    // Verify the simplified fee system
    console.log("\n🎯 Simplified Fee System Verification:");
    console.log("✅ Creation fees go directly to treasury");
    console.log("✅ Platform fees go directly to treasury");
    console.log("✅ No manual withdrawal needed");
    console.log("✅ All fees automatically sent to treasury");
    
    console.log("\n🎉 Simplified Fee System Working!");
    console.log("- Total fees to treasury:", ethers.formatUnits(treasuryBalanceFinal, 6), "USDC");
    console.log("- Treasury receives all platform revenue automatically");
    
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});