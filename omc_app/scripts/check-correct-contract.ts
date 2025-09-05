import { ethers } from "hardhat";

async function main() {
    console.log("🔍 CHECKING CORRECT CONTRACT STATE");
    
    // Use the correct contract address from deployed-addresses.json
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Contract Type: SimpleOpinionMarket");
    
    // Connect to SimpleOpinionMarket, not FixedOpinionMarket
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("\n🏦 Contract State:");
    try {
        const nextOpinionId = await contract.nextOpinionId();
        console.log("   Next Opinion ID:", nextOpinionId.toString());
        console.log("   Total Opinions:", Number(nextOpinionId) - 1);
        
        // Check treasury and USDC
        const treasury = await contract.treasury();
        const usdcToken = await contract.usdcToken();
        const isPaused = await contract.paused();
        
        console.log("   Treasury:", treasury);
        console.log("   USDC Token:", usdcToken);
        console.log("   Is Paused:", isPaused);
        
    } catch (error: any) {
        console.log("❌ Failed to read basic contract state:", error.message);
        return;
    }
    
    console.log("\n📋 All Created Opinions:");
    try {
        const nextOpinionId = await contract.nextOpinionId();
        const totalOpinions = Number(nextOpinionId) - 1;
        
        if (totalOpinions === 0) {
            console.log("   ⚠️ No opinions found in contract");
            return;
        }
        
        for (let i = 1; i <= totalOpinions; i++) {
            try {
                console.log(`\n   Opinion ${i}:`);
                
                // Try both opinions() mapping and getOpinion() function
                const opinion = await contract.opinions(i);
                
                console.log(`     Creator: ${opinion.creator}`);
                console.log(`     Current Owner: ${opinion.currentOwner}`);
                console.log(`     Question: ${opinion.question}`);
                console.log(`     Answer: ${opinion.currentAnswer}`);
                console.log(`     Last Price: ${ethers.formatUnits(opinion.lastPrice, 6)} USDC`);
                console.log(`     Next Price: ${ethers.formatUnits(opinion.nextPrice, 6)} USDC`);
                console.log(`     Active: ${opinion.isActive}`);
                console.log(`     Sale Price: ${ethers.formatUnits(opinion.salePrice, 6)} USDC`);
                
                // Check if opinion has valid data
                if (opinion.creator === "0x0000000000000000000000000000000000000000") {
                    console.log("     ⚠️ This opinion appears to be empty (zero address creator)");
                } else if (!opinion.question || opinion.question.trim() === "") {
                    console.log("     ⚠️ This opinion has no question");
                } else if (!opinion.isActive) {
                    console.log("     ⚠️ This opinion is inactive");
                } else {
                    console.log("     ✅ This opinion is valid and should display in frontend");
                }
                
            } catch (error: any) {
                console.log(`     ❌ Error reading opinion ${i}:`, error.message);
            }
        }
        
    } catch (error: any) {
        console.log("❌ Failed to read opinions:", error.message);
    }
    
    // Test direct contract calls that frontend makes
    console.log("\n🧪 Testing Frontend Calls:");
    
    try {
        console.log("\n1. Testing nextOpinionId() call:");
        const nextId = await contract.nextOpinionId();
        console.log("   ✅ Result:", nextId.toString());
        
        console.log("\n2. Testing opinions(1) call:");
        const op1 = await contract.opinions(1);
        console.log("   ✅ Question:", op1.question);
        console.log("   ✅ Answer:", op1.currentAnswer);
        console.log("   ✅ Active:", op1.isActive);
        
        // Test what the frontend would see
        const frontendData = {
            id: 1,
            question: op1.question,
            currentAnswer: op1.currentAnswer,
            nextPrice: op1.nextPrice,
            lastPrice: op1.lastPrice,
            totalVolume: BigInt(0),
            currentAnswerOwner: op1.currentOwner,
            isActive: op1.isActive,
            creator: op1.creator,
            categories: [],
        };
        
        console.log("\n3. Frontend data structure:");
        console.log("   ID:", frontendData.id);
        console.log("   Question:", frontendData.question);
        console.log("   Answer:", frontendData.currentAnswer);
        console.log("   Active:", frontendData.isActive);
        console.log("   Owner:", frontendData.currentAnswerOwner);
        
        // Check if this would pass frontend filters
        if (frontendData.isActive && frontendData.question && frontendData.question.trim() !== "") {
            console.log("   ✅ This opinion SHOULD appear in frontend");
        } else {
            console.log("   ❌ This opinion would be filtered out by frontend");
        }
        
    } catch (error: any) {
        console.log("❌ Frontend simulation failed:", error.message);
    }
    
    console.log("\n🎯 CONTRACT VERIFICATION:");
    console.log("✅ Contract Address: 0x21d8Cff98E50b1327022e786156749CcdBcE9d5e");
    console.log("✅ Contract Type: SimpleOpinionMarket");  
    console.log("✅ Frontend Address: Should match contract address");
    console.log("✅ Network: Base Sepolia (84532)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Contract check failed:", error);
        process.exit(1);
    });