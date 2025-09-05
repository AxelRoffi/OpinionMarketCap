import { ethers } from "hardhat";

async function main() {
  console.log("📋 Retrieving available categories from OpinionCore...");
  
  const OPINION_CORE_ADDRESS = "0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc";
  
  // Get the contract instance
  const OpinionCore = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: "0xc930A12280fa44a7f7Ed0faEcB1756fEa02Cf113",
    },
  });
  
  const opinionCore = OpinionCore.attach(OPINION_CORE_ADDRESS);
  
  try {
    // Get available categories
    console.log("🔍 Fetching categories...");
    const categories = await opinionCore.getAvailableCategories();
    
    console.log("\n📝 Available Categories:");
    console.log("======================");
    
    categories.forEach((category: string, index: number) => {
      console.log(`${index + 1}. "${category}"`);
    });
    
    console.log("\n💡 Usage Examples:");
    console.log("==================");
    console.log("For createOpinion function, use an array of 1-3 categories:");
    console.log("");
    console.log("Single category:");
    console.log(`["${categories[0]}"]`);
    console.log("");
    console.log("Multiple categories:");
    console.log(`["${categories[0]}", "${categories[1]}"]`);
    console.log("");
    console.log("Maximum (3 categories):");
    console.log(`["${categories[0]}", "${categories[1]}", "${categories[2]}"]`);
    
    console.log("\n🧪 Example createOpinion call:");
    console.log("==============================");
    console.log(`await opinionCore.createOpinion(`);
    console.log(`  "Will Bitcoin reach $100k by 2024?",`);
    console.log(`  "Yes, it will!",`);
    console.log(`  "Based on market trends",`);
    console.log(`  50_000_000, // 50 USDC initial price`);
    console.log(`  ["${categories[0]}"] // Categories array`);
    console.log(`);`);
    
    console.log("\n📊 Category Count:");
    console.log(`Total available categories: ${categories.length}`);
    
    // Save categories to a file for easy reference
    const fs = require('fs');
    const categoriesData = {
      categories: categories,
      count: categories.length,
      examples: {
        single: [categories[0]],
        multiple: [categories[0], categories[1]],
        maximum: [categories[0], categories[1], categories[2]]
      }
    };
    
    fs.writeFileSync('available-categories.json', JSON.stringify(categoriesData, null, 2));
    console.log("\n📄 Categories saved to available-categories.json");
    
  } catch (error) {
    console.error("❌ Error retrieving categories:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });