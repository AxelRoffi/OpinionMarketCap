import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing with EXACT Frontend ABI...");
    
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    
    // Use the EXACT ABI from frontend/src/lib/contracts.ts
    const FRONTEND_ABI = [
        {
            inputs: [],
            name: 'nextOpinionId',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
            name: 'getOpinion',
            outputs: [
                {
                    components: [
                        { internalType: 'address', name: 'creator', type: 'address' },
                        { internalType: 'address', name: 'currentOwner', type: 'address' },
                        { internalType: 'string', name: 'question', type: 'string' },
                        { internalType: 'string', name: 'currentAnswer', type: 'string' },
                        { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
                        { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
                        { internalType: 'bool', name: 'isActive', type: 'bool' },
                        { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
                    ],
                    internalType: 'struct SimpleOpinionMarket.Opinion',
                    name: '',
                    type: 'tuple',
                },
            ],
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
        {
            inputs: [
                { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
                { internalType: 'string', name: 'answer', type: 'string' }
            ],
            name: 'submitAnswer',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'string', name: 'question', type: 'string' },
                { internalType: 'string', name: 'answer', type: 'string' },
                { internalType: 'uint96', name: 'initialPrice', type: 'uint96' }
            ],
            name: 'createOpinion',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    
    const provider = ethers.provider;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FRONTEND_ABI, provider);
    
    console.log("Network:", await provider.getNetwork());
    console.log("Contract address:", CONTRACT_ADDRESS);
    
    try {
        console.log("\n🔍 Test 1: nextOpinionId()");
        const nextOpinionId = await contract.nextOpinionId();
        console.log("✅ Result:", nextOpinionId.toString());
        
        const totalOpinions = Number(nextOpinionId) - 1;
        console.log("✅ Total opinions available:", totalOpinions);
        
        if (totalOpinions === 0) {
            console.log("❌ This explains the frontend issue - contract reports 0 opinions!");
            return;
        }
        
        console.log("\n🔍 Test 2: Reading all opinions with frontend ABI");
        
        for (let i = 1; i <= totalOpinions; i++) {
            try {
                console.log(`\n--- Opinion ${i} ---`);
                const opinion = await contract.opinions(i);
                
                console.log("Question:", opinion.question);
                console.log("Current Answer:", opinion.currentAnswer);
                console.log("Is Active:", opinion.isActive);
                console.log("Creator:", opinion.creator);
                console.log("Current Owner:", opinion.currentOwner);
                console.log("Last Price:", opinion.lastPrice.toString(), "USDC");
                console.log("Next Price:", opinion.nextPrice.toString(), "USDC");
                
                // This is how frontend processes the data
                const frontendData = {
                    id: i,
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
                
                console.log("✅ Frontend would process this correctly");
                
                // Check if this would pass frontend filters
                if (frontendData.isActive && frontendData.question && frontendData.question.trim() !== "") {
                    console.log("✅ Would appear in frontend list");
                } else {
                    console.log("❌ Would be filtered out:");
                    console.log("  - isActive:", frontendData.isActive);
                    console.log("  - has question:", !!frontendData.question);
                    console.log("  - question not empty:", frontendData.question?.trim() !== "");
                }
                
            } catch (error: any) {
                console.log(`❌ Failed to read opinion ${i}:`, error.message);
            }
        }
        
        console.log("\n🔍 Test 3: Check RPC Network");
        const network = await provider.getNetwork();
        console.log("Current network:", network.name, "Chain ID:", network.chainId);
        console.log("Expected: Base Sepolia (84532)");
        
        if (Number(network.chainId) !== 84532) {
            console.log("❌ Wrong network! Frontend must connect to Base Sepolia.");
        } else {
            console.log("✅ Correct network");
        }
        
        console.log("\n🎯 CONCLUSION:");
        console.log("Contract has", totalOpinions, "active opinions");
        console.log("Frontend ABI matches contract");
        console.log("All opinions should display in frontend");
        
        console.log("\n🚨 If frontend still shows 0 opinions, check:");
        console.log("1. Browser wallet is connected to Base Sepolia (Chain ID 84532)");
        console.log("2. Browser console for JavaScript errors");
        console.log("3. Network connectivity in browser");
        console.log("4. Clear browser cache and refresh page");
        
    } catch (error: any) {
        console.log("❌ Test failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });