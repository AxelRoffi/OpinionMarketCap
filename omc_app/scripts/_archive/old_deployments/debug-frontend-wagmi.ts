import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Debugging Frontend Wagmi Integration...");
    
    const CONTRACT_ADDRESS = "0x6B45d9917F400c0a2d2f928AC15F6D960CAfD2b1";
    
    // Test exact same calls that frontend makes
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Step 1: Test nextOpinionId (same as frontend)
    console.log("\n🧪 Step 1: Testing nextOpinionId()");
    try {
        const nextOpinionId = await contract.nextOpinionId();
        console.log("✅ nextOpinionId:", nextOpinionId.toString());
        
        const totalOpinions = Number(nextOpinionId) - 1;
        console.log("✅ totalOpinions calculated:", totalOpinions);
        
        if (totalOpinions === 0) {
            console.log("❌ Frontend would see 0 opinions and stop here!");
            return;
        }
        
    } catch (error: any) {
        console.log("❌ nextOpinionId failed:", error.message);
        return;
    }
    
    // Step 2: Test opinion queries (same args as frontend)
    console.log("\n🧪 Step 2: Testing opinion queries with exact frontend args");
    
    const opinionIds = [1n, 2n, 3n]; // BigInt args like frontend
    
    for (const id of opinionIds) {
        try {
            console.log(`\n--- Testing opinions(${id}) ---`);
            
            const opinion = await contract.opinions(id);
            
            console.log("Raw result:", {
                creator: opinion.creator,
                currentOwner: opinion.currentOwner,
                question: opinion.question,
                currentAnswer: opinion.currentAnswer,
                lastPrice: opinion.lastPrice.toString(),
                nextPrice: opinion.nextPrice.toString(),
                isActive: opinion.isActive,
                salePrice: opinion.salePrice.toString()
            });
            
            // Test the frontend data transformation
            const frontendData = {
                id: Number(id),
                question: opinion.question,
                currentAnswer: opinion.currentAnswer,
                nextPrice: opinion.nextPrice,
                lastPrice: opinion.lastPrice,
                totalVolume: BigInt(0),
                currentAnswerOwner: opinion.currentOwner,
                isActive: opinion.isActive,
                creator: opinion.creator,
                categories: [],
            };
            
            console.log("Frontend would create:", {
                id: frontendData.id,
                question: frontendData.question,
                currentAnswer: frontendData.currentAnswer,
                isActive: frontendData.isActive
            });
            
            // Test frontend filter logic
            const wouldPass = frontendData.isActive && 
                             frontendData.question && 
                             frontendData.question.trim() !== "";
            
            console.log("Passes frontend filter:", wouldPass ? "✅ YES" : "❌ NO");
            
            if (!wouldPass) {
                console.log("Filter failed because:");
                console.log("  - isActive:", frontendData.isActive);
                console.log("  - has question:", !!frontendData.question);
                console.log("  - question not empty:", frontendData.question?.trim() !== "");
            }
            
        } catch (error: any) {
            console.log(`❌ opinions(${id}) failed:`, error.message);
        }
    }
    
    // Step 3: Test with exact frontend ABI format
    console.log("\n🧪 Step 3: Testing with frontend ABI format");
    
    const EXACT_FRONTEND_ABI = [
        {
            inputs: [],
            name: 'nextOpinionId',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
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
        const frontendContract = new ethers.Contract(CONTRACT_ADDRESS, EXACT_FRONTEND_ABI, ethers.provider);
        
        const nextId = await frontendContract.nextOpinionId();
        console.log("✅ Frontend ABI nextOpinionId:", nextId.toString());
        
        const op1 = await frontendContract.opinions(1n);
        console.log("✅ Frontend ABI opinions(1):");
        console.log("   Question:", op1.question);
        console.log("   Answer:", op1.currentAnswer);
        console.log("   Active:", op1.isActive);
        
    } catch (error: any) {
        console.log("❌ Frontend ABI test failed:", error.message);
    }
    
    // Step 4: Check network and connection
    console.log("\n🧪 Step 4: Network Verification");
    
    const network = await ethers.provider.getNetwork();
    console.log("Current network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    console.log("Expected: Base Sepolia (84532)");
    
    if (Number(network.chainId) !== 84532) {
        console.log("❌ Wrong network! This could be the issue.");
    } else {
        console.log("✅ Correct network");
    }
    
    // Step 5: RPC endpoint test
    console.log("\n🧪 Step 5: RPC Endpoint Test");
    
    try {
        const latestBlock = await ethers.provider.getBlockNumber();
        console.log("✅ Latest block:", latestBlock);
        
        const contractCode = await ethers.provider.getCode(CONTRACT_ADDRESS);
        if (contractCode === "0x") {
            console.log("❌ No contract code at this address!");
        } else {
            console.log("✅ Contract code exists");
        }
        
    } catch (error: any) {
        console.log("❌ RPC test failed:", error.message);
    }
    
    console.log("\n🎯 DEBUGGING CONCLUSION:");
    console.log("If this script shows 3 working opinions but frontend shows 0:");
    console.log("1. Check browser is connected to Base Sepolia (84532)");
    console.log("2. Check browser console for JavaScript errors");
    console.log("3. Try disconnecting and reconnecting wallet");
    console.log("4. Clear browser cache and hard refresh");
    console.log("5. Check wagmi configuration in frontend");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug script failed:", error);
        process.exit(1);
    });