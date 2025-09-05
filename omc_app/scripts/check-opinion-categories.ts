import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Checking Opinion Categories...");
    
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    
    // Check available categories first
    console.log("\n📋 Available Categories in Contract:");
    const availableCategories = await opinionCore.getAvailableCategories();
    availableCategories.forEach((category, index) => {
        console.log(`${index}: ${category}`);
    });
    
    // Check both opinions
    for (let opinionId = 1; opinionId <= 2; opinionId++) {
        try {
            console.log(`\n🔍 Opinion ${opinionId} Details:`);
            const opinion = await opinionCore.getOpinionDetails(opinionId);
            
            console.log(`Question: ${opinion.question}`);
            console.log(`Answer: ${opinion.currentAnswer}`);
            console.log(`Categories: [${opinion.categories.join(", ")}]`);
            console.log(`Categories Count: ${opinion.categories.length}`);
            
            // Check each category individually
            opinion.categories.forEach((category, index) => {
                console.log(`  Category ${index}: "${category}"`);
            });
            
        } catch (error) {
            console.error(`❌ Failed to get opinion ${opinionId}:`, error);
        }
    }
    
    // Also check using the specific function for opinion categories
    console.log("\n🔍 Using getOpinionCategories function:");
    try {
        const opinion1Categories = await opinionCore.getOpinionCategories(1);
        const opinion2Categories = await opinionCore.getOpinionCategories(2);
        
        console.log(`Opinion 1 categories: [${opinion1Categories.join(", ")}]`);
        console.log(`Opinion 2 categories: [${opinion2Categories.join(", ")}]`);
    } catch (error) {
        console.error("❌ Failed to get categories:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });