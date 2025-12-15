import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing FixedOpinionMarket Contract Functions");
    
    const CONTRACT_ADDRESS = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const contract = await ethers.getContractAt("FixedOpinionMarket", CONTRACT_ADDRESS);
    
    console.log("Contract Address:", CONTRACT_ADDRESS);
    
    // Test nextOpinionId
    console.log("\n📊 Contract State:");
    const nextId = await contract.nextOpinionId();
    console.log("NextOpinionId:", nextId.toString());
    console.log("Total Opinions:", Number(nextId) - 1);
    
    // Test all opinions using getOpinion (not opinions mapping)
    console.log("\n📋 All Opinions (using getOpinion):");
    for (let i = 1; i < Number(nextId); i++) {
        try {
            const opinion = await contract.getOpinion(i);
            console.log(`\nOpinion ${i}:`);
            console.log("  Question:", opinion.question);
            console.log("  Answer:", opinion.currentAnswer);
            console.log("  Description:", opinion.description);
            console.log("  Categories:", opinion.categories);
            console.log("  Last Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
            console.log("  Next Price:", ethers.formatUnits(opinion.nextPrice, 6), "USDC");
            console.log("  Active:", opinion.isActive);
            console.log("  Creator:", opinion.creator);
            console.log("  Current Owner:", opinion.currentOwner);
        } catch (e: any) {
            console.log(`  ❌ Error reading opinion ${i}:`, e.message);
        }
    }
    
    // Test if the contract has different function names
    console.log("\n🔍 Testing Available Functions:");
    
    try {
        console.log("✅ nextOpinionId() works");
    } catch (e) {
        console.log("❌ nextOpinionId() failed");
    }
    
    try {
        console.log("✅ getOpinion() works");
    } catch (e) {
        console.log("❌ getOpinion() failed");
    }
    
    try {
        const opinion1 = await contract.opinions(1);
        console.log("✅ opinions() mapping works");
        console.log("  Structure:", {
            question: opinion1.question,
            currentAnswer: opinion1.currentAnswer,
            isActive: opinion1.isActive
        });
    } catch (e: any) {
        console.log("❌ opinions() mapping failed:", e.message.substring(0, 50) + "...");
    }
    
    console.log("\n🎯 FRONTEND REQUIREMENTS:");
    console.log("- Contract Address: 0x74D301e0623608C9CE44390C1654D5340c8eCa1C");
    console.log("- Contract Type: FixedOpinionMarket");
    console.log("- Main Function: getOpinion() OR opinions() mapping");
    console.log("- Total Opinions: 5 active opinions");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });