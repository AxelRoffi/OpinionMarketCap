import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking if opinion #3 exists...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  
  // Opinion Core ABI for checking opinions
  const opinionCoreAbi = [
    "function nextOpinionId() view returns (uint256)",
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))"
  ];
  
  try {
    const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
    
    // Check total number of opinions
    const nextOpinionId = await opinionCore.nextOpinionId();
    console.log("Total opinions created:", (Number(nextOpinionId) - 1));
    console.log("Next opinion ID:", nextOpinionId.toString());
    
    // Check if opinion #3 exists
    if (Number(nextOpinionId) > 3) {
      console.log("\n📋 Opinion #3 Details:");
      
      try {
        const opinion = await opinionCore.getOpinionDetails(3);
        
        console.log("- ID: 3");
        console.log("- Question:", opinion.question);
        console.log("- Current Answer:", opinion.currentAnswer);
        console.log("- Creator:", opinion.creator);
        console.log("- Current Answer Owner:", opinion.currentAnswerOwner);
        console.log("- Is Active:", opinion.isActive);
        console.log("- Last Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
        console.log("- Next Price:", ethers.formatUnits(opinion.nextPrice, 6), "USDC");
        console.log("- Total Volume:", ethers.formatUnits(opinion.totalVolume, 6), "USDC");
        console.log("- Categories:", opinion.categories);
        console.log("- Description:", opinion.currentAnswerDescription);
        console.log("- Link:", opinion.link);
        console.log("- IPFS Hash:", opinion.ipfsHash);
        
        if (opinion.isActive) {
          console.log("✅ Opinion #3 exists and is ACTIVE");
        } else {
          console.log("⚠️ Opinion #3 exists but is INACTIVE");
        }
        
      } catch (error: any) {
        console.error("❌ Error fetching opinion #3:", error.message);
      }
    } else {
      console.log("❌ Opinion #3 does not exist");
      console.log("Only", (Number(nextOpinionId) - 1), "opinions have been created");
    }
    
    // Check all existing opinions
    console.log("\n📋 All Existing Opinions:");
    for (let i = 1; i < Number(nextOpinionId); i++) {
      try {
        const opinion = await opinionCore.getOpinionDetails(i);
        console.log(`Opinion #${i}:`);
        console.log(`  - Question: "${opinion.question}"`);
        console.log(`  - Answer: "${opinion.currentAnswer}"`);
        console.log(`  - Creator: ${opinion.creator}`);
        console.log(`  - Active: ${opinion.isActive}`);
        console.log(`  - Price: ${ethers.formatUnits(opinion.nextPrice, 6)} USDC`);
        console.log("");
      } catch (error) {
        console.log(`Opinion #${i}: Error fetching details`);
      }
    }
    
  } catch (error: any) {
    console.error("❌ Contract interaction failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});