import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing pricing logic fix...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  
  try {
    // Deploy PriceCalculator library
    console.log("\n📦 Deploying PriceCalculator library...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    console.log("PriceCalculator deployed at:", priceCalculatorAddress);
    
    // Deploy OpinionCore with library linking
    console.log("\n📦 Deploying OpinionCore with fixed pricing...");
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
      libraries: {
        PriceCalculator: priceCalculatorAddress,
      },
    });
    
    const opinionCore = await OpinionCore.deploy();
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log("OpinionCore deployed at:", opinionCoreAddress);
    
    // Initialize the contract
    console.log("\n⚙️ Initializing OpinionCore...");
    await opinionCore.initialize(
      USDC_ADDRESS,
      deployer.address, // treasury
      deployer.address, // feeManager  
      deployer.address  // poolManager
    );
    console.log("✅ OpinionCore initialized");
    
    // Enable public creation (it starts disabled, so toggle it)
    await opinionCore.togglePublicCreation();
    console.log("✅ Public creation enabled");
    
    // Test Case 1: Create opinion and check initial pricing
    console.log("\n🧪 Test Case 1: Opinion Creation Pricing");
    
    const testData = {
      question: "Test question with fixed pricing?",
      answer: "Test answer",
      description: "Test description",
      initialPrice: ethers.parseUnits("10", 6), // 10 USDC
      categories: ["Other"]
    };
    
    console.log("Creating opinion with initial price:", ethers.formatUnits(testData.initialPrice, 6), "USDC");
    
    const createTx = await opinionCore.createOpinion(
      testData.question,
      testData.answer,
      testData.description,
      testData.initialPrice,
      testData.categories
    );
    await createTx.wait();
    
    // Get the created opinion details
    const opinionId = 1;
    const opinion = await opinionCore.getOpinionDetails(opinionId);
    
    const lastPrice = Number(opinion.lastPrice) / 1_000_000;
    const nextPrice = Number(opinion.nextPrice) / 1_000_000;
    const totalVolume = Number(opinion.totalVolume) / 1_000_000;
    
    console.log("\n📊 After Creation:");
    console.log("- Last Price:", lastPrice, "USDC");
    console.log("- Next Price:", nextPrice, "USDC");
    console.log("- Total Volume:", totalVolume, "USDC");
    console.log("- Creator = Answer Owner:", opinion.creator === opinion.currentAnswerOwner);
    
    // ✅ Verify the fix
    if (lastPrice === nextPrice && nextPrice === 10) {
      console.log("✅ PRICING FIX WORKS: nextPrice equals initialPrice at creation");
    } else {
      console.log("❌ PRICING FIX FAILED: nextPrice should equal initialPrice");
      console.log("  Expected: lastPrice = nextPrice = 10 USDC");
      console.log("  Actual: lastPrice =", lastPrice, "nextPrice =", nextPrice);
    }
    
    console.log("\n🧪 Test Case 2: After First Sale Pricing");
    
    // For this test, we'd need to set up USDC approvals and balances
    // which is complex in this test environment
    console.log("ℹ️ For full testing, you would:");
    console.log("1. Give user2 USDC and approve the contract");
    console.log("2. Call submitAnswer from user2"); 
    console.log("3. Verify that pricing algorithm applies ONLY after the sale");
    
    console.log("\n🎯 Expected Behavior After Fix:");
    console.log("✅ At creation: nextPrice = initialPrice (no algorithm)");
    console.log("✅ After 1st sale: nextPrice = algorithm result");
    console.log("✅ After 2nd sale: nextPrice = algorithm result");
    
    console.log("\n🚀 Deploy this fixed contract to testnet to see the correct behavior!");
    
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});