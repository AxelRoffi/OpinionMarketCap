import { ethers } from "hardhat";

async function main() {
    const CONTRACT_ADDRESS = "0xEf6dcf860F7de7F9d98Dae0CC1B19A2F1a1a6ffE";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("🔍 DIAGNOSTIC - OpinionMarket Contract");
    console.log("Address:", CONTRACT_ADDRESS);
    console.log("Deployer:", deployer.address);
    
    // Connect to deployed contract
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("\n=== BASIC CONTRACT STATE ===");
    
    try {
        const usdcToken = await contract.usdcToken();
        console.log("✅ USDC Token:", usdcToken);
    } catch (e) {
        console.log("❌ USDC Token failed:", e.message);
    }
    
    try {
        const treasury = await contract.treasury();
        console.log("✅ Treasury:", treasury);
    } catch (e) {
        console.log("❌ Treasury failed:", e.message);
    }
    
    try {
        const nextOpinionId = await contract.nextOpinionId();
        console.log("✅ Next Opinion ID:", nextOpinionId.toString());
    } catch (e) {
        console.log("❌ Next Opinion ID failed:", e.message);
    }
    
    try {
        const nextPoolId = await contract.nextPoolId();
        console.log("✅ Next Pool ID:", nextPoolId.toString());
    } catch (e) {
        console.log("❌ Next Pool ID failed:", e.message);
    }
    
    console.log("\n=== ACCESS CONTROL ===");
    
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Has ADMIN_ROLE:", hasAdminRole);
    
    console.log("\n=== USDC BALANCE & ALLOWANCE ===");
    
    const deployerBalance = await usdc.balanceOf(deployer.address);
    console.log("Deployer USDC Balance:", ethers.formatUnits(deployerBalance, 6), "USDC");
    
    const allowance = await usdc.allowance(deployer.address, CONTRACT_ADDRESS);
    console.log("Contract Allowance:", ethers.formatUnits(allowance, 6), "USDC");
    
    console.log("\n=== TESTING CORE FUNCTIONS ===");
    
    // Test 1: createOpinion
    console.log("\n🧪 Testing createOpinion...");
    try {
        // First approve USDC
        if (allowance < ethers.parseUnits("10", 6)) {
            console.log("📝 Approving USDC...");
            const approveTx = await usdc.approve(CONTRACT_ADDRESS, ethers.parseUnits("100", 6));
            await approveTx.wait();
            console.log("✅ USDC approved");
        }
        
        // Try to create opinion
        const tx = await contract.createOpinion.staticCall(
            "Will ETH reach $10k in 2024?",
            "Yes definitely", 
            ethers.parseUnits("2", 6) // 2 USDC
        );
        console.log("✅ createOpinion simulation SUCCESS");
        
        // Actually execute
        const realTx = await contract.createOpinion(
            "Will ETH reach $10k in 2024?",
            "Yes definitely", 
            ethers.parseUnits("2", 6)
        );
        const receipt = await realTx.wait();
        console.log("✅ createOpinion EXECUTED - Gas used:", receipt.gasUsed.toString());
        
    } catch (e) {
        console.log("❌ createOpinion FAILED:");
        console.log("   Error:", e.message);
        if (e.data) console.log("   Data:", e.data);
        if (e.reason) console.log("   Reason:", e.reason);
    }
    
    // Test 2: Get opinion data
    console.log("\n🧪 Testing getOpinion...");
    try {
        const opinion = await contract.getOpinion(1);
        console.log("✅ Opinion 1:", {
            creator: opinion.creator,
            currentOwner: opinion.currentOwner,
            question: opinion.question,
            currentAnswer: opinion.currentAnswer,
            lastPrice: ethers.formatUnits(opinion.lastPrice, 6),
            nextPrice: ethers.formatUnits(opinion.nextPrice, 6),
            isActive: opinion.isActive
        });
    } catch (e) {
        console.log("❌ getOpinion FAILED:", e.message);
    }
    
    // Test 3: submitAnswer
    console.log("\n🧪 Testing submitAnswer...");
    try {
        const opinion = await contract.getOpinion(1);
        if (opinion.creator !== ethers.ZeroAddress) {
            const nextPrice = opinion.nextPrice;
            console.log("Next price needed:", ethers.formatUnits(nextPrice, 6), "USDC");
            
            const tx = await contract.submitAnswer.staticCall(1, "No way, market will crash");
            console.log("✅ submitAnswer simulation SUCCESS");
        } else {
            console.log("⚠️  No opinion exists to test submitAnswer");
        }
    } catch (e) {
        console.log("❌ submitAnswer FAILED:");
        console.log("   Error:", e.message);
        if (e.data) console.log("   Data:", e.data);
    }
    
    // Test 4: createPool
    console.log("\n🧪 Testing createPool...");
    try {
        const opinion = await contract.getOpinion(1);
        if (opinion.creator !== ethers.ZeroAddress) {
            const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
            const contribution = ethers.parseUnits("1", 6); // 1 USDC
            
            const tx = await contract.createPool.staticCall(
                1,
                "Bearish prediction",
                deadline,
                contribution
            );
            console.log("✅ createPool simulation SUCCESS");
        } else {
            console.log("⚠️  No opinion exists to test createPool");
        }
    } catch (e) {
        console.log("❌ createPool FAILED:");
        console.log("   Error:", e.message);
        if (e.data) console.log("   Data:", e.data);
    }
    
    console.log("\n=== DIAGNOSTIC COMPLETE ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Diagnostic failed:", error);
        process.exit(1);
    });