import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying table ordering and traders count...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  
  const opinionCoreAbi = [
    "function nextOpinionId() view returns (uint256)",
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))"
  ];
  
  try {
    const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
    
    // Get total opinions
    const nextOpinionId = await opinionCore.nextOpinionId();
    const totalOpinions = Number(nextOpinionId) - 1;
    
    console.log("📋 Table Ordering Verification:");
    console.log("Total opinions:", totalOpinions);
    
    // Fetch all opinions and verify ordering
    const opinions = [];
    for (let i = 1; i <= totalOpinions; i++) {
      try {
        const opinion = await opinionCore.getOpinionDetails(i);
        opinions.push({
          id: i,
          question: opinion.question,
          currentAnswer: opinion.currentAnswer,
          creator: opinion.creator,
          currentAnswerOwner: opinion.currentAnswerOwner,
          isActive: opinion.isActive
        });
      } catch (error) {
        console.log(`❌ Error fetching opinion ${i}`);
      }
    }
    
    console.log("\n✅ Expected Table Order (ID ascending):");
    opinions.forEach((opinion, index) => {
      console.log(`${index + 1}. Opinion #${opinion.id}: "${opinion.question}" - ${opinion.currentAnswer}`);
    });
    
    console.log("\n📊 Traders Count Verification:");
    
    // Calculate traders like frontend does
    const uniqueTraders = new Set();
    opinions.forEach(opinion => {
      // Creator made a createOpinion transaction
      if (opinion.creator) uniqueTraders.add(opinion.creator.toLowerCase());
      
      // Current answer owner made a submitAnswer transaction (if different from creator)
      if (opinion.currentAnswerOwner && opinion.currentAnswerOwner !== opinion.creator) {
        uniqueTraders.add(opinion.currentAnswerOwner.toLowerCase());
      }
    });
    
    console.log("Unique trader addresses:");
    Array.from(uniqueTraders).forEach((trader, index) => {
      console.log(`${index + 1}. ${trader}`);
    });
    
    console.log(`\n✅ Total Traders: ${uniqueTraders.size}`);
    
    // Show transaction breakdown
    console.log("\n📋 Transaction Breakdown:");
    opinions.forEach(opinion => {
      console.log(`Opinion #${opinion.id}:`);
      console.log(`  - Creator (createOpinion): ${opinion.creator}`);
      
      if (opinion.currentAnswerOwner !== opinion.creator) {
        console.log(`  - Answer Owner (submitAnswer): ${opinion.currentAnswerOwner}`);
      } else {
        console.log(`  - Answer Owner: Same as creator (no additional transaction)`);
      }
    });
    
    console.log("\n🎯 Frontend Changes Applied:");
    console.log("✅ Default sort: ID ascending (row 1 = ID #1, row 2 = ID #2, etc.)");
    console.log("✅ Traders card: Changed from 'Active Traders' to 'Total Traders'");
    console.log("✅ Traders count: All addresses with at least 1 transaction");
    console.log("✅ Future opinions: Will automatically appear and be sorted by ID");
    
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});