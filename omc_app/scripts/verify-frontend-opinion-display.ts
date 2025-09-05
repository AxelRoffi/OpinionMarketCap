import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying frontend opinion display...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  
  // Opinion Core ABI matching frontend
  const opinionCoreAbi = [
    "function nextOpinionId() view returns (uint256)",
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))"
  ];
  
  try {
    const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
    
    console.log("📋 Frontend Simulation:");
    
    // Step 1: Get nextOpinionId (like frontend does)
    const nextOpinionId = await opinionCore.nextOpinionId();
    console.log("Next Opinion ID:", nextOpinionId.toString());
    console.log("Total opinions:", (Number(nextOpinionId) - 1));
    
    // Step 2: Check condition for opinion3 fetching
    const shouldFetchOpinion3 = Number(nextOpinionId) >= 4;
    console.log("Should fetch opinion 3:", shouldFetchOpinion3);
    
    if (shouldFetchOpinion3) {
      console.log("✅ Frontend WILL fetch opinion #3");
      
      // Step 3: Fetch opinion 3 (like frontend does)
      try {
        const opinion3 = await opinionCore.getOpinionDetails(3);
        console.log("\n📋 Opinion #3 Frontend Data:");
        console.log("- Question:", opinion3.question);
        console.log("- Current Answer:", opinion3.currentAnswer);
        console.log("- Creator:", opinion3.creator);
        console.log("- Is Active:", opinion3.isActive);
        console.log("- Categories:", opinion3.categories);
        console.log("- Next Price:", ethers.formatUnits(opinion3.nextPrice, 6), "USDC");
        console.log("- Last Price:", ethers.formatUnits(opinion3.lastPrice, 6), "USDC");
        console.log("- Total Volume:", ethers.formatUnits(opinion3.totalVolume, 6), "USDC");
        
        if (opinion3.isActive) {
          console.log("✅ Opinion #3 will appear in the main table");
        } else {
          console.log("❌ Opinion #3 will NOT appear (inactive)");
        }
        
      } catch (error: any) {
        console.log("❌ Frontend will fail to fetch opinion #3:", error.message);
      }
    } else {
      console.log("❌ Frontend will NOT fetch opinion #3 (condition not met)");
    }
    
    // Step 4: Verify all opinions that should appear
    console.log("\n📋 All Opinions Frontend Should Display:");
    
    for (let i = 1; i < Number(nextOpinionId); i++) {
      try {
        const opinion = await opinionCore.getOpinionDetails(i);
        if (opinion.isActive) {
          console.log(`✅ Opinion #${i}: "${opinion.question}" - ${opinion.currentAnswer}`);
        } else {
          console.log(`⚠️ Opinion #${i}: "${opinion.question}" - INACTIVE`);
        }
      } catch (error) {
        console.log(`❌ Opinion #${i}: Error fetching`);
      }
    }
    
    console.log("\n🎯 Frontend URL: http://localhost:3001");
    console.log("Check the main table to see if all opinions appear!");
    
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});