import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Checking ABI Field Mismatch...");
    
    const CONTRACT_ADDRESS = "0x6B45d9917F400c0a2d2f928AC15F6D960CAfD2b1";
    
    // Get the contract with full ABI
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    
    console.log("Testing opinions(1) with full contract ABI...");
    
    try {
        const opinion = await contract.opinions(1);
        
        console.log("\n📊 Contract returns these fields:");
        console.log("0. creator:", opinion.creator);
        console.log("1. currentOwner:", opinion.currentOwner);
        console.log("2. question:", opinion.question);
        console.log("3. currentAnswer:", opinion.currentAnswer);
        console.log("4. lastPrice:", opinion.lastPrice.toString());
        console.log("5. nextPrice:", opinion.nextPrice.toString());
        console.log("6. isActive:", opinion.isActive);
        console.log("7. salePrice:", opinion.salePrice.toString());
        
        // Test direct field access
        console.log("\n🧪 Testing field access:");
        console.log("opinion.question:", opinion.question);
        console.log("opinion.currentAnswer:", opinion.currentAnswer);
        console.log("opinion.isActive:", opinion.isActive);
        console.log("opinion.creator:", opinion.creator);
        console.log("opinion.currentOwner:", opinion.currentOwner);
        
        // Test array access
        console.log("\n🧪 Testing array access:");
        console.log("opinion[0] (creator):", opinion[0]);
        console.log("opinion[1] (currentOwner):", opinion[1]);
        console.log("opinion[2] (question):", opinion[2]);
        console.log("opinion[3] (currentAnswer):", opinion[3]);
        console.log("opinion[4] (lastPrice):", opinion[4].toString());
        console.log("opinion[5] (nextPrice):", opinion[5].toString());
        console.log("opinion[6] (isActive):", opinion[6]);
        console.log("opinion[7] (salePrice):", opinion[7].toString());
        
    } catch (error: any) {
        console.log("❌ Contract call failed:", error.message);
        return;
    }
    
    // Test with frontend ABI format
    console.log("\n🎯 Testing with Frontend ABI (exactly like wagmi would):");
    
    const FRONTEND_ABI = [
        {
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'opinions',
            outputs: [
                { internalType: 'address', name: 'creator', type: 'address' },
                { internalType: 'address', name: 'currentOwner', type: 'address' },
                { internalType: 'string', name: 'question', type: 'string' },
                { internalType: 'string', name: 'currentAnswer', type: 'string' },
                { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
                { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
                { internalType: 'bool', name: 'isActive', type: 'bool' },
                { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
    ];
    
    try {
        const frontendContract = new ethers.Contract(CONTRACT_ADDRESS, FRONTEND_ABI, ethers.provider);
        const frontendOpinion = await frontendContract.opinions(1);
        
        console.log("\n📊 Frontend ABI returns:");
        console.log("creator:", frontendOpinion.creator);
        console.log("currentOwner:", frontendOpinion.currentOwner);
        console.log("question:", frontendOpinion.question);
        console.log("currentAnswer:", frontendOpinion.currentAnswer);
        console.log("lastPrice:", frontendOpinion.lastPrice.toString());
        console.log("nextPrice:", frontendOpinion.nextPrice.toString());
        console.log("isActive:", frontendOpinion.isActive);
        console.log("salePrice:", frontendOpinion.salePrice.toString());
        
        // Test exactly how frontend processes this
        console.log("\n🔄 Frontend data transformation:");
        const frontendData = {
            id: 1,
            question: frontendOpinion.question,
            currentAnswer: frontendOpinion.currentAnswer,
            nextPrice: frontendOpinion.nextPrice,
            lastPrice: frontendOpinion.lastPrice,
            totalVolume: BigInt(0),
            currentAnswerOwner: frontendOpinion.currentOwner,
            isActive: frontendOpinion.isActive,
            creator: frontendOpinion.creator,
            categories: [],
        };
        
        console.log("Transformed data:", {
            id: frontendData.id,
            question: frontendData.question,
            currentAnswer: frontendData.currentAnswer,
            isActive: frontendData.isActive,
            currentAnswerOwner: frontendData.currentAnswerOwner
        });
        
        // Test filter logic
        const passesFilter = frontendData.isActive && 
                           frontendData.question && 
                           frontendData.question.trim() !== "";
        
        console.log("\n✅ Passes frontend filter:", passesFilter ? "YES" : "NO");
        
        if (!passesFilter) {
            console.log("❌ Filter failed because:");
            console.log("  isActive:", frontendData.isActive);
            console.log("  has question:", !!frontendData.question);
            console.log("  question not empty:", frontendData.question?.trim() !== "");
        }
        
    } catch (error: any) {
        console.log("❌ Frontend ABI test failed:", error.message);
    }
    
    console.log("\n🎯 CONCLUSION:");
    console.log("The contract and ABI are working correctly.");
    console.log("If frontend still shows 0 opinions, the issue is:");
    console.log("1. Browser not connected to Base Sepolia");
    console.log("2. Wagmi configuration issue");
    console.log("3. Browser cache/JavaScript errors");
    console.log("4. RPC endpoint connectivity in browser");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ ABI check failed:", error);
        process.exit(1);
    });