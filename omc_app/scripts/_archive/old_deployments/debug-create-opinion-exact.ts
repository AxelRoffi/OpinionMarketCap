import { ethers } from "hardhat";

async function main() {
  console.log("🚨 DEBUGGING: Exact createOpinion failure scenario");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  const [signer] = await ethers.getSigners();
  console.log("User address:", signer.address);
  
  // Simulate exact frontend scenario
  console.log("\n📋 CURRENT STATE CHECK:");
  
  // USDC contract
  const usdcAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)"
  ];
  
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
  const balance = await usdc.balanceOf(signer.address);
  const allowance = await usdc.allowance(signer.address, OPINION_CORE);
  
  console.log("USDC Balance:", ethers.formatUnits(balance, 6), "USDC");
  console.log("USDC Allowance:", ethers.formatUnits(allowance, 6), "USDC");
  
  // Opinion Core contract
  const opinionCoreAbi = [
    "function isPublicCreationEnabled() view returns (bool)",
    "function nextOpinionId() view returns (uint256)",
    "function createOpinion(string,string,string,uint96,string[]) external"
  ];
  
  const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
  const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
  const nextId = await opinionCore.nextOpinionId();
  
  console.log("Public creation enabled:", isPublicEnabled);
  console.log("Next opinion ID:", nextId.toString());
  
  // Test scenario exactly like frontend
  const testData = {
    question: "Test question from frontend",
    answer: "Test answer from frontend", 
    description: "Test description",
    initialPrice: 3, // 3 USDC - this should trigger 5 USDC fee
    category: "Crypto"
  };
  
  const initialPriceWei = ethers.parseUnits(testData.initialPrice.toString(), 6);
  const feeCalculated = testData.initialPrice * 0.2;
  const creationFee = feeCalculated < 5 ? 5 : feeCalculated;
  const creationFeeWei = ethers.parseUnits(creationFee.toString(), 6);
  
  console.log("\n🎯 TEST SCENARIO:");
  console.log("Initial Price:", testData.initialPrice, "USDC");
  console.log("Creation Fee:", creationFee, "USDC");
  console.log("User Balance:", ethers.formatUnits(balance, 6), "USDC");
  console.log("Balance sufficient?", balance >= creationFeeWei);
  
  if (balance < creationFeeWei) {
    console.log("\n❌ INSUFFICIENT BALANCE - This is the issue!");
    console.log("Need:", creationFee, "USDC");
    console.log("Have:", ethers.formatUnits(balance, 6), "USDC");
    console.log("Missing:", (creationFee - Number(ethers.formatUnits(balance, 6))).toFixed(6), "USDC");
    
    console.log("\n💡 SOLUTIONS:");
    console.log("1. Add more USDC to your wallet");
    console.log("2. Use a lower initial price (but fee will still be 5 USDC minimum)");
    console.log("3. Get Base Sepolia testnet USDC from faucet");
  } else {
    console.log("\n✅ Balance sufficient - testing actual transaction...");
    
    try {
      // Estimate gas first
      const gasEstimate = await opinionCore.createOpinion.estimateGas(
        testData.question,
        testData.answer,
        testData.description,
        initialPriceWei,
        [testData.category]
      );
      
      console.log("Gas estimate:", gasEstimate.toString());
      
      // Try the actual transaction
      const tx = await opinionCore.createOpinion(
        testData.question,
        testData.answer,
        testData.description,
        initialPriceWei,
        [testData.category]
      );
      
      console.log("✅ Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
      
    } catch (error: any) {
      console.log("❌ Transaction failed:", error.message);
      console.log("Error code:", error.code);
      console.log("Error data:", error.data);
      
      // Check common error patterns
      if (error.message.includes("exceeds balance")) {
        console.log("💡 This is a balance issue - user needs more USDC");
      } else if (error.message.includes("execution reverted")) {
        console.log("💡 This is a contract revert - check contract requirements");
      } else if (error.message.includes("gas")) {
        console.log("💡 This is a gas issue - check gas estimation");
      }
    }
  }
}

main().catch((error) => {
  console.error("Debug script failed:", error);
  process.exitCode = 1;
});