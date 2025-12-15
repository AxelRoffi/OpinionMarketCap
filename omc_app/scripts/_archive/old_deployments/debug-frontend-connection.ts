import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Debugging Frontend Connection Issue...");
    
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    const [deployer] = await ethers.getSigners();
    
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Network:", await ethers.provider.getNetwork());

    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    
    // Test 1: Basic contract connectivity
    console.log("\n🧪 Test 1: Basic Contract Connectivity");
    try {
        const nextOpinionId = await contract.nextOpinionId();
        console.log("✅ nextOpinionId():", nextOpinionId.toString());
        
        const totalOpinions = Number(nextOpinionId) - 1;
        console.log("✅ Total opinions should be:", totalOpinions);
        
        if (totalOpinions === 0) {
            console.log("❌ No opinions found! This explains why frontend shows 0.");
            return;
        }
    } catch (error: any) {
        console.log("❌ Failed to call nextOpinionId():", error.message);
        return;
    }
    
    // Test 2: Try different ways to read opinions
    console.log("\n🧪 Test 2: Different Opinion Reading Methods");
    
    // Method 1: Direct opinions() mapping
    for (let i = 1; i <= 3; i++) {
        try {
            console.log(`\n--- Testing opinions(${i}) ---`);
            const opinion = await contract.opinions(i);
            console.log("✅ Raw data structure:");
            console.log("  creator:", opinion.creator);
            console.log("  currentOwner:", opinion.currentOwner);
            console.log("  question:", opinion.question);
            console.log("  currentAnswer:", opinion.currentAnswer);
            console.log("  lastPrice:", opinion.lastPrice.toString());
            console.log("  nextPrice:", opinion.nextPrice.toString());
            console.log("  isActive:", opinion.isActive);
            console.log("  salePrice:", opinion.salePrice.toString());
            
            // Check if this looks like empty data
            if (opinion.creator === "0x0000000000000000000000000000000000000000") {
                console.log("❌ This opinion appears to be empty (zero address creator)");
            } else {
                console.log("✅ This opinion has valid data");
            }
            
        } catch (error: any) {
            console.log(`❌ Failed to read opinions(${i}):`, error.message);
        }
    }
    
    // Method 2: Try getOpinion() if available
    console.log("\n🧪 Test 3: Alternative getOpinion() Method");
    try {
        const opinion1 = await contract.getOpinion(1);
        console.log("✅ getOpinion(1) works:", opinion1.question);
    } catch (error: any) {
        console.log("❌ getOpinion() method failed:", error.message);
    }
    
    // Test 3: Check contract state directly
    console.log("\n🧪 Test 4: Contract State Analysis");
    
    try {
        // Check if contract is initialized
        const treasury = await contract.treasury();
        const usdcToken = await contract.usdcToken();
        console.log("✅ Treasury:", treasury);
        console.log("✅ USDC Token:", usdcToken);
        
        // Check if contract is paused
        try {
            const isPaused = await contract.paused();
            console.log("✅ Contract Paused:", isPaused);
        } catch (e) {
            console.log("ℹ️ Paused status not available");
        }
        
    } catch (error: any) {
        console.log("❌ Contract state check failed:", error.message);
    }
    
    // Test 4: Frontend simulation
    console.log("\n🧪 Test 5: Frontend Call Simulation");
    
    // Simulate exactly what frontend does
    try {
        console.log("Simulating frontend nextOpinionId call...");
        const nextId = await contract.nextOpinionId();
        console.log("Frontend would get nextOpinionId:", nextId.toString());
        
        const totalOpinions = Number(nextId) - 1;
        console.log("Frontend would calculate totalOpinions:", totalOpinions);
        
        if (totalOpinions >= 1) {
            console.log("Frontend would try to read opinion 1...");
            const opinion1Data = await contract.opinions(1);
            console.log("Opinion 1 question:", opinion1Data.question);
            
            // Check if the data would pass frontend filters
            if (opinion1Data.isActive && opinion1Data.question !== "") {
                console.log("✅ Opinion 1 would be displayed in frontend");
            } else {
                console.log("❌ Opinion 1 would be filtered out by frontend");
                console.log("  isActive:", opinion1Data.isActive);
                console.log("  question empty:", opinion1Data.question === "");
            }
        }
        
    } catch (error: any) {
        console.log("❌ Frontend simulation failed:", error.message);
    }
    
    // Test 5: Network and RPC issues
    console.log("\n🧪 Test 6: Network Configuration Check");
    
    const network = await ethers.provider.getNetwork();
    console.log("Network details:");
    console.log("  Name:", network.name);
    console.log("  Chain ID:", network.chainId);
    console.log("  Expected Chain ID: 84532 (Base Sepolia)");
    
    if (Number(network.chainId) !== 84532) {
        console.log("❌ Wrong network! Frontend might be connecting to different network.");
    } else {
        console.log("✅ Correct network");
    }
    
    // Final diagnosis
    console.log("\n🎯 DIAGNOSIS:");
    console.log("If opinions exist in contract but frontend shows 0:");
    console.log("1. Check frontend is connected to Base Sepolia (Chain ID 84532)");
    console.log("2. Check if wallet is connected in frontend");
    console.log("3. Check browser console for errors");
    console.log("4. Check if RPC endpoint is working");
    console.log("5. Clear browser cache and reload");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug script failed:", error);
        process.exit(1);
    });