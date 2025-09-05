import { ethers } from "hardhat";

async function main() {
    console.log("🔍 What contract is actually at this address?");
    
    const ADDRESS = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    
    // Try different contract types
    const contractTypes = [
        "SimpleOpinionMarket",
        "FixedOpinionMarket", 
        "OpinionMarket",
        "OpinionMarketV2Mock",
        "OpinionMarketV3Mock"
    ];
    
    for (const contractType of contractTypes) {
        try {
            console.log(`\n🧪 Testing as ${contractType}:`);
            const contract = await ethers.getContractAt(contractType, ADDRESS);
            
            // Test nextOpinionId
            const nextId = await contract.nextOpinionId();
            console.log(`  nextOpinionId: ${nextId.toString()}`);
            
            // If nextOpinionId works and gives reasonable number, test first opinion
            if (Number(nextId) > 0 && Number(nextId) < 100) {
                console.log(`  ✅ This looks right! (${Number(nextId) - 1} opinions)`);
                
                // Test reading first opinion
                try {
                    const opinion1 = await contract.opinions(1);
                    console.log(`  Opinion 1 question: "${opinion1.question}"`);
                } catch (e: any) {
                    console.log(`  opinions(1) failed: ${e.message.substring(0, 50)}...`);
                }
                
                // Test getOpinion if available
                try {
                    const getOp1 = await contract.getOpinion(1);
                    console.log(`  getOpinion(1) question: "${getOp1.question}"`);
                } catch (e: any) {
                    console.log(`  getOpinion(1) failed: ${e.message.substring(0, 50)}...`);
                }
                
                console.log(`  🎯 USE THIS CONTRACT TYPE: ${contractType}`);
                break;
            } else {
                console.log(`  ❌ Wrong result: ${nextId.toString()}`);
            }
            
        } catch (error: any) {
            console.log(`  ❌ Failed as ${contractType}: ${error.message.substring(0, 50)}...`);
        }
    }
    
    // Also check the contract bytecode
    try {
        const code = await ethers.provider.getCode(ADDRESS);
        console.log(`\n📊 Contract bytecode length: ${code.length} characters`);
        if (code === "0x") {
            console.log("❌ No contract deployed at this address!");
        } else {
            console.log("✅ Contract exists");
        }
    } catch (e) {
        console.log("❌ Could not get contract code");
    }
}

main().catch(console.error);