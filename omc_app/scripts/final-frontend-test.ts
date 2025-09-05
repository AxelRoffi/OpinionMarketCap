import { ethers } from "hardhat";

async function main() {
    console.log("🎯 FINAL FRONTEND TEST");
    
    const CONTRACT_ADDRESS = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    console.log("Testing contract:", CONTRACT_ADDRESS);
    
    // Test with exact frontend ABI
    const FRONTEND_ABI = [
        {
            "inputs": [],
            "name": "nextOpinionId",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "name": "opinions",
            "outputs": [
                {"internalType": "address", "name": "creator", "type": "address"},
                {"internalType": "address", "name": "currentOwner", "type": "address"},
                {"internalType": "string", "name": "question", "type": "string"},
                {"internalType": "string", "name": "currentAnswer", "type": "string"},
                {"internalType": "string", "name": "description", "type": "string"},
                {"internalType": "uint96", "name": "lastPrice", "type": "uint96"},
                {"internalType": "uint96", "name": "nextPrice", "type": "uint96"},
                {"internalType": "bool", "name": "isActive", "type": "bool"},
                {"internalType": "uint96", "name": "salePrice", "type": "uint96"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FRONTEND_ABI, ethers.provider);
    
    // Test nextOpinionId
    const nextId = await contract.nextOpinionId();
    console.log("✅ nextOpinionId:", nextId.toString());
    console.log("✅ Total opinions frontend will see:", Number(nextId) - 1);
    
    // Test each opinion call exactly like frontend
    for (let i = 1; i <= 5; i++) {
        try {
            const opinion = await contract.opinions(BigInt(i));
            console.log(`\n✅ Opinion ${i}:`);
            console.log("  Question:", opinion.question);
            console.log("  Answer:", opinion.currentAnswer);
            console.log("  Active:", opinion.isActive);
            console.log("  Creator:", opinion.creator);
            console.log("  Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
            
            // Check if this would pass frontend filter
            const wouldDisplay = opinion.isActive && opinion.question && opinion.question.trim() !== "";
            console.log("  Frontend will display:", wouldDisplay ? "✅ YES" : "❌ NO");
            
        } catch (e: any) {
            console.log(`❌ Opinion ${i} failed:`, e.message);
        }
    }
    
    console.log("\n🎯 EXPECTED FRONTEND RESULT:");
    console.log("- Contract Address: 0x74D301e0623608C9CE44390C1654D5340c8eCa1C");
    console.log("- Total Opinions: 5");
    console.log("- All opinions should display");
    console.log("- Each has real data with questions and answers");
    
    console.log("\n🔗 Quick Links:");
    console.log("- BaseScan: https://sepolia.basescan.org/address/0x74D301e0623608C9CE44390C1654D5340c8eCa1C");
    console.log("- Frontend should now show 5 opinions");
}

main().catch(console.error);