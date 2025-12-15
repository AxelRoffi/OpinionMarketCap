import { ethers } from "hardhat";

async function main() {
    console.log("🎯 FINAL TEST - SimpleOpinionMarket");
    
    const CONTRACT_ADDRESS = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    console.log("Contract:", CONTRACT_ADDRESS);
    
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    
    // Test nextOpinionId
    const nextId = await contract.nextOpinionId();
    console.log("✅ nextOpinionId:", nextId.toString());
    console.log("✅ Total Opinions:", Number(nextId) - 1);
    
    // Test all 5 opinions
    for (let i = 1; i <= 5; i++) {
        try {
            const opinion = await contract.opinions(i);
            console.log(`\n✅ Opinion ${i}:`);
            console.log("  Question:", opinion.question);
            console.log("  Answer:", opinion.currentAnswer);
            console.log("  Active:", opinion.isActive);
            console.log("  Last Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
            console.log("  Next Price:", ethers.formatUnits(opinion.nextPrice, 6), "USDC");
        } catch (e: any) {
            console.log(`❌ Opinion ${i} failed:`, e.message);
        }
    }
}

main().catch(console.error);