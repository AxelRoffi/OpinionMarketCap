import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Finding the working contract with opinions...");
    
    const contracts = [
        "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e", // Original proxy
        "0x6B45d9917F400c0a2d2f928AC15F6D960CAfD2b1", // New non-proxy
        "0x74D301e0623608C9CE44390C1654D5340c8eCa1C", // From check-current-state script
    ];
    
    for (const address of contracts) {
        try {
            console.log(`\n🧪 Testing ${address}:`);
            
            // Try SimpleOpinionMarket first
            try {
                const contract = await ethers.getContractAt("SimpleOpinionMarket", address);
                const nextId = await contract.nextOpinionId();
                console.log(`  SimpleOpinionMarket - NextOpinionId: ${nextId}`);
                
                if (Number(nextId) > 1) {
                    const op1 = await contract.opinions(1);
                    console.log(`  ✅ Opinion 1: "${op1.question}" -> "${op1.currentAnswer}"`);
                    
                    if (Number(nextId) > 2) {
                        const op2 = await contract.opinions(2);
                        console.log(`  ✅ Opinion 2: "${op2.question}" -> "${op2.currentAnswer}"`);
                    }
                    
                    if (Number(nextId) > 3) {
                        const op3 = await contract.opinions(3);
                        console.log(`  ✅ Opinion 3: "${op3.question}" -> "${op3.currentAnswer}"`);
                    }
                    
                    console.log(`  🎯 THIS CONTRACT HAS ${Number(nextId) - 1} OPINIONS!`);
                }
            } catch (e: any) {
                console.log(`  ❌ SimpleOpinionMarket failed: ${e.message.substring(0, 50)}...`);
            }
            
            // Try FixedOpinionMarket
            try {
                const contract = await ethers.getContractAt("FixedOpinionMarket", address);
                const nextId = await contract.nextOpinionId();
                console.log(`  FixedOpinionMarket - NextOpinionId: ${nextId}`);
                
                if (Number(nextId) > 1) {
                    const op1 = await contract.getOpinion(1);
                    console.log(`  ✅ Opinion 1: "${op1.question}" -> "${op1.currentAnswer}"`);
                    console.log(`  🎯 THIS FIXED CONTRACT HAS ${Number(nextId) - 1} OPINIONS!`);
                }
            } catch (e: any) {
                console.log(`  ❌ FixedOpinionMarket failed: ${e.message.substring(0, 50)}...`);
            }
            
        } catch (error: any) {
            console.log(`  ❌ Contract ${address} not accessible: ${error.message.substring(0, 50)}...`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Search failed:", error);
        process.exit(1);
    });