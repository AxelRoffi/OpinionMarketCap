import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing createOpinion transaction...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  const [signer] = await ethers.getSigners();
  console.log("Signer address:", signer.address);
  
  // Test data matching what frontend would send
  const testData = {
    question: "Will Bitcoin reach $100k by 2024?",
    answer: "Yes, Bitcoin will reach $100k",
    description: "Based on current market trends",
    initialPrice: ethers.parseUnits("10", 6), // 10 USDC
    categories: ["Crypto"]
  };
  
  // Opinion Core ABI for testing
  const opinionCoreAbi = [
    "function createOpinion(string,string,string,uint96,string[]) external",
    "function createOpinionWithExtras(string,string,string,uint96,string[],string,string) external"
  ];
  
  // USDC ABI for approval
  const usdcAbi = [
    "function approve(address,uint256) returns (bool)",
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
    console.log("Current Allowance:", ethers.formatUnits(allowance, 6), "USDC");
    
    // Calculate creation fee (20% with 5 USDC min)
    const initialPriceNumber = Number(ethers.formatUnits(testData.initialPrice, 6));
    const feeCalculated = initialPriceNumber * 0.2;
    const creationFee = feeCalculated < 5 ? 5 : feeCalculated;
    const creationFeeWei = ethers.parseUnits(creationFee.toString(), 6);
    
    console.log("Creation Fee:", creationFee, "USDC");
    console.log("Needs approval:", allowance < creationFeeWei);
    
    // Test approval if needed
    if (allowance < creationFeeWei) {
      console.log("\\n🔄 Approving USDC...");
      const approveTx = await usdc.approve(OPINION_CORE, ethers.parseUnits("1000000", 6)); // 1M USDC
      console.log("Approval tx:", approveTx.hash);
      await approveTx.wait();
      console.log("✅ Approval successful");
    }
    
    // Test createOpinion function
    console.log("\\n🎯 Testing createOpinion...");
    console.log("Parameters:");
    console.log("- question:", testData.question);
    console.log("- answer:", testData.answer);
    console.log("- description:", testData.description);
    console.log("- initialPrice:", ethers.formatUnits(testData.initialPrice, 6), "USDC");
    console.log("- categories:", testData.categories);
    
    try {
      const createTx = await opinionCore.createOpinion(
        testData.question,
        testData.answer,
        testData.description,
        testData.initialPrice,
        testData.categories
      );
      
      console.log("✅ Transaction sent! Hash:", createTx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await createTx.wait();
      console.log("🎉 Transaction confirmed!");
      console.log("- Block number:", receipt.blockNumber);
      console.log("- Gas used:", receipt.gasUsed.toString());
      
    } catch (error: any) {
      console.error("❌ Transaction failed:", error.message);
      console.log("\\n💡 Testing createOpinionWithExtras instead...");
      
      try {
        const createTx = await opinionCore.createOpinionWithExtras(
          testData.question,
          testData.answer,
          testData.description,
          testData.initialPrice,
          testData.categories,
          "", // ipfsHash
          "" // externalLink
        );
        
        console.log("✅ Transaction sent! Hash:", createTx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await createTx.wait();
        console.log("🎉 Transaction confirmed!");
        console.log("- Block number:", receipt.blockNumber);
        console.log("- Gas used:", receipt.gasUsed.toString());
        
      } catch (error2: any) {
        console.error("❌ Both functions failed:", error2.message);
      }
    }
    
  } catch (error: any) {
    console.error("❌ Script failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});