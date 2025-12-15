import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Analyzing pricing logic for Opinion #3...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  
  const opinionCoreAbi = [
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))"
  ];
  
  try {
    const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
    
    console.log("📋 Opinion #3 Pricing Analysis:");
    
    const opinion3 = await opinionCore.getOpinionDetails(3);
    
    console.log("- Question:", opinion3.question);
    console.log("- Current Answer:", opinion3.currentAnswer);
    console.log("- Creator:", opinion3.creator);
    console.log("- Current Answer Owner:", opinion3.currentAnswerOwner);
    
    const lastPrice = Number(opinion3.lastPrice) / 1_000_000;
    const nextPrice = Number(opinion3.nextPrice) / 1_000_000;
    const totalVolume = Number(opinion3.totalVolume) / 1_000_000;
    
    console.log("\n💰 Price Details:");
    console.log("- Last Price:", lastPrice, "USDC");
    console.log("- Next Price:", nextPrice, "USDC");
    console.log("- Total Volume:", totalVolume, "USDC");
    
    console.log("\n🔍 Price Logic Analysis:");
    
    if (opinion3.creator === opinion3.currentAnswerOwner) {
      console.log("❓ Creator is still the answer owner - no trades yet");
      console.log("📋 Expected behavior:");
      console.log("  - Last Price should equal initial price");
      console.log("  - Next Price should be computed from initial price");
      console.log("  - Total Volume should equal initial price (creation volume)");
      
      if (lastPrice === nextPrice) {
        console.log("❌ ISSUE: Last Price = Next Price = " + lastPrice + " USDC");
        console.log("    This suggests no price computation happened");
      } else {
        console.log("✅ Price computation applied:");
        console.log("  - Initial/Last Price:", lastPrice, "USDC");
        console.log("  - Computed Next Price:", nextPrice, "USDC");
        console.log("  - Price increase:", ((nextPrice - lastPrice) / lastPrice * 100).toFixed(2) + "%");
      }
    } else {
      console.log("✅ Someone else owns the answer - trade occurred");
      console.log("📋 Trade analysis:");
      console.log("  - Original creator:", opinion3.creator);
      console.log("  - Current owner:", opinion3.currentAnswerOwner);
      console.log("  - Price paid by current owner:", lastPrice, "USDC");
      console.log("  - Next price for future buyers:", nextPrice, "USDC");
    }
    
    console.log("\n🎯 Root Cause Analysis:");
    console.log("Current situation:");
    console.log("- Last Price (what was paid):", lastPrice, "USDC");
    console.log("- Next Price (for next buyer):", nextPrice, "USDC");
    console.log("- Creator = Answer Owner:", opinion3.creator === opinion3.currentAnswerOwner);
    
    if (opinion3.creator === opinion3.currentAnswerOwner && lastPrice !== 5) {
      console.log("\n❌ POTENTIAL ISSUE:");
      console.log("If creator is still owner but last price ≠ initial price (5 USDC),");
      console.log("this means the price algorithm is being applied at creation time");
      console.log("instead of only after the first sale.");
    }
    
    console.log("\n📋 Expected Behavior:");
    console.log("1. Opinion created with initial price = 5 USDC");
    console.log("2. BEFORE first sale: table shows 5 USDC");
    console.log("3. AFTER first sale: price algorithm applies");
    console.log("4. Future sales: algorithm continues to apply");
    
    console.log("\n🔧 Check Required:");
    console.log("Look at contract's createOpinion function to see if it:");
    console.log("- Sets nextPrice = initialPrice (correct)");
    console.log("- Or applies price algorithm immediately (incorrect)");
    
  } catch (error: any) {
    console.error("❌ Analysis failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});