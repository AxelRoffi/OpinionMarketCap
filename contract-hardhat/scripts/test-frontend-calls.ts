import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing Exact Frontend Calls...");
    
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    
    // Test using the exact ABI from frontend
    const FRONTEND_ABI = [
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
        }
    ];
    
    const provider = ethers.provider;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FRONTEND_ABI, provider);
    
    console.log("Testing with frontend ABI and provider setup...");
    
    // Test 1: nextOpinionId (like frontend does)
    console.log("\n🧪 Test 1: nextOpinionId() call");
    try {
        const nextOpinionId = await contract.nextOpinionId();
        console.log("✅ nextOpinionId:", nextOpinionId.toString());
        
        const totalOpinions = Number(nextOpinionId) - 1;
        console.log("✅ totalOpinions:", totalOpinions);
        
        if (totalOpinions === 0) {
            console.log("❌ This explains why frontend shows 0 opinions!");
            return;
        }
    } catch (error: any) {
        console.log("❌ nextOpinionId failed:", error.message);
        return;
    }
    
    // Test 2: opinions() calls (like frontend does)
    console.log("\n🧪 Test 2: opinions() calls");
    
    for (let i = 1; i <= 3; i++) {
        try {
            console.log(`\n--- Testing opinions(${i}) with frontend ABI ---`);
            const opinionData = await contract.opinions(i);
            
            console.log("Raw response:", opinionData);
            
            // Test frontend data structure creation
            const frontendOpinion = {
                id: i,
                question: opinionData.question,
                currentAnswer: opinionData.currentAnswer,
                nextPrice: opinionData.nextPrice,
                lastPrice: opinionData.lastPrice,
                totalVolume: BigInt(0),
                currentAnswerOwner: opinionData.currentOwner,
                isActive: opinionData.isActive,
                creator: opinionData.creator,
                categories: [],
            };
            
            console.log("✅ Frontend data structure created:");
            console.log("  id:", frontendOpinion.id);
            console.log("  question:", frontendOpinion.question);
            console.log("  currentAnswer:", frontendOpinion.currentAnswer);
            console.log("  isActive:", frontendOpinion.isActive);
            
            // Check if it would pass frontend filter
            if (frontendOpinion.isActive && frontendOpinion.question) {
                console.log("✅ Would be displayed in frontend");
            } else {
                console.log("❌ Would be filtered out by frontend");
            }
            
        } catch (error: any) {
            console.log(`❌ opinions(${i}) failed:`, error.message);
        }
    }
    
    // Test 3: Direct RPC call (what wagmi does under the hood)
    console.log("\n🧪 Test 3: Direct RPC Simulation");
    
    try {
        // Simulate what wagmi useReadContract does
        const nextOpinionIdCall = {
            to: CONTRACT_ADDRESS,
            data: "0x75b238fc" // nextOpinionId() function selector
        };
        
        const result = await provider.call(nextOpinionIdCall);
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], result);
        console.log("✅ Direct RPC nextOpinionId:", decoded[0].toString());
        
    } catch (error: any) {
        console.log("❌ Direct RPC call failed:", error.message);
    }
    
    // Test 4: Check if there's a network issue
    console.log("\n🧪 Test 4: Network Connectivity");
    
    try {
        const latestBlock = await provider.getBlockNumber();
        console.log("✅ Latest block:", latestBlock);
        
        const contractCode = await provider.getCode(CONTRACT_ADDRESS);
        if (contractCode === "0x") {
            console.log("❌ Contract has no code at this address!");
        } else {
            console.log("✅ Contract code exists");
        }
        
    } catch (error: any) {
        console.log("❌ Network connectivity issue:", error.message);
    }
    
    console.log("\n🎯 FRONTEND DEBUG RECOMMENDATIONS:");
    console.log("1. Check browser console for errors");
    console.log("2. Verify wallet is connected to Base Sepolia");
    console.log("3. Check if RainbowKit is properly configured");
    console.log("4. Try refreshing the page");
    console.log("5. Check if useReadContract is properly enabled");
    console.log("6. Verify the contract address is correct in frontend");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });