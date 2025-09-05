import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing createOpinion with simplified approach...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  const [signer] = await ethers.getSigners();
  console.log("User address:", signer.address);
  
  // Simple test with minimal initial price to reduce fee
  const testData = {
    question: "Simple test question?",
    answer: "Simple test answer",
    description: "Test description",
    initialPrice: ethers.parseUnits("1", 6), // 1 USDC minimum
    categories: ["Other"]
  };
  
  // Calculate fee (20% with 5 USDC minimum)
  const feeCalculated = 1 * 0.2; // 0.2 USDC
  const creationFee = feeCalculated < 5 ? 5 : feeCalculated; // Will be 5 USDC
  
  console.log("Initial Price:", 1, "USDC");
  console.log("Creation Fee:", creationFee, "USDC");
  
  // Opinion Core ABI - exact match to frontend
  const opinionCoreAbi = [
    {
      inputs: [
        { internalType: 'string', name: 'question', type: 'string' },
        { internalType: 'string', name: 'answer', type: 'string' },
        { internalType: 'string', name: 'description', type: 'string' },
        { internalType: 'uint96', name: 'initialPrice', type: 'uint96' },
        { internalType: 'string[]', name: 'opinionCategories', type: 'string[]' }
      ],
      name: 'createOpinion',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ];
  
  // USDC ABI
  const usdcAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)"
  ];
  
  try {
    const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
    const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
    
    // Check balance
    const balance = await usdc.balanceOf(signer.address);
    console.log("USDC Balance:", ethers.formatUnits(balance, 6), "USDC");
    
    // Check allowance
    const allowance = await usdc.allowance(signer.address, OPINION_CORE);
    console.log("USDC Allowance:", ethers.formatUnits(allowance, 6), "USDC");
    
    const creationFeeWei = ethers.parseUnits(creationFee.toString(), 6);
    const hasBalance = balance >= creationFeeWei;
    
    console.log("Has sufficient balance:", hasBalance);
    
    if (!hasBalance) {
      console.log("❌ Insufficient balance to test transaction");
      console.log("Need:", creationFee, "USDC");
      console.log("Have:", ethers.formatUnits(balance, 6), "USDC");
      return;
    }
    
    // Test transaction
    console.log("\n🎯 Testing createOpinion transaction...");
    console.log("Arguments:", [
      testData.question,
      testData.answer,
      testData.description,
      testData.initialPrice.toString(),
      testData.categories
    ]);
    
    // Estimate gas first
    const gasEstimate = await opinionCore.createOpinion.estimateGas(
      testData.question,
      testData.answer,
      testData.description,
      testData.initialPrice,
      testData.categories
    );
    
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Execute transaction
    const tx = await opinionCore.createOpinion(
      testData.question,
      testData.answer,
      testData.description,
      testData.initialPrice,
      testData.categories
    );
    
    console.log("✅ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("🎉 Transaction confirmed!");
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
  } catch (error: any) {
    console.error("❌ Transaction failed:", error.message);
    if (error.code) console.log("Error code:", error.code);
    if (error.data) console.log("Error data:", error.data);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});