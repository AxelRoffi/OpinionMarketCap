const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Pool Fee Treasury Model");
    console.log("==================================");
    
    // Contract addresses (local deployment will be different)
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612"; // Will update for local
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    // Get signers
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    console.log("👤 User1:", user1.address);
    console.log("👤 Treasury:", TREASURY_ADDRESS);
    
    // Contract ABIs (minimal for testing)
    const POOL_MANAGER_ABI = [
        "function contributeToPool(uint256 poolId, uint256 amount) external",
        "function createPool(uint256 opinionId, string calldata proposedAnswer, uint256 deadline, uint256 initialContribution, string calldata name, string calldata ipfsHash) external",
        "function getPoolDetails(uint256 poolId) external view returns (tuple(uint256 id, uint256 opinionId, string proposedAnswer, uint96 totalAmount, uint32 deadline, address creator, uint8 status, string name, string ipfsHash), uint256 currentPrice, uint256 remainingAmount, uint256 timeRemaining)",
        "function poolCount() external view returns (uint256)"
    ];
    
    const USDC_ABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function decimals() external view returns (uint8)"
    ];
    
    try {
        // Connect to contracts
        const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, POOL_MANAGER_ABI, user1);
        const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, user1);
        
        console.log("\n📊 Initial Balances:");
        const initialTreasuryBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        const initialUserBalance = await usdc.balanceOf(user1.address);
        console.log(`💰 Treasury USDC: ${ethers.formatUnits(initialTreasuryBalance, 6)} USDC`);
        console.log(`💰 User1 USDC: ${ethers.formatUnits(initialUserBalance, 6)} USDC`);
        
        // Check if user has enough USDC
        const requiredAmount = ethers.parseUnits("10", 6); // 10 USDC for testing
        if (initialUserBalance < requiredAmount) {
            console.log("❌ User doesn't have enough USDC for testing");
            console.log("   Need to fund user1 with USDC first");
            return;
        }
        
        // Test 1: Pool Creation Fee (5 USDC should go to treasury)
        console.log("\n🧪 Test 1: Pool Creation Fee");
        console.log("-----------------------------");
        
        const createAmount = ethers.parseUnits("2", 6); // 2 USDC initial contribution  
        const totalCreateRequired = ethers.parseUnits("7", 6); // 2 USDC + 5 USDC fee
        
        // Approve USDC for pool creation
        console.log("✅ Approving USDC for pool creation...");
        const createApproveTx = await usdc.approve(POOL_MANAGER_ADDRESS, totalCreateRequired);
        await createApproveTx.wait();
        
        const beforeCreateBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        
        // Create pool
        console.log("✅ Creating pool...");
        const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
        const createTx = await poolManager.createPool(
            1, // opinionId
            "Yes, this will happen", // proposedAnswer
            deadline,
            createAmount,
            "Test Pool", // name
            "QmTest123" // ipfsHash
        );
        await createTx.wait();
        
        const afterCreateBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        const createFeeReceived = afterCreateBalance - beforeCreateBalance;
        
        console.log(`💰 Treasury balance before: ${ethers.formatUnits(beforeCreateBalance, 6)} USDC`);
        console.log(`💰 Treasury balance after: ${ethers.formatUnits(afterCreateBalance, 6)} USDC`);
        console.log(`📈 Creation fee received: ${ethers.formatUnits(createFeeReceived, 6)} USDC`);
        
        if (createFeeReceived === ethers.parseUnits("5", 6)) {
            console.log("✅ SUCCESS: Creation fee (5 USDC) went to treasury!");
        } else {
            console.log("❌ FAIL: Creation fee amount incorrect");
        }
        
        // Test 2: Contribution Fee (1 USDC should go to treasury)
        console.log("\n🧪 Test 2: Pool Contribution Fee");
        console.log("-----------------------------------");
        
        const contributeAmount = ethers.parseUnits("3", 6); // 3 USDC contribution
        const totalContributeRequired = ethers.parseUnits("4", 6); // 3 USDC + 1 USDC fee
        
        // Approve USDC for contribution
        console.log("✅ Approving USDC for contribution...");
        const contribApproveTx = await usdc.approve(POOL_MANAGER_ADDRESS, totalContributeRequired);
        await contribApproveTx.wait();
        
        const beforeContribBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        
        // Get pool count to find the pool we just created
        const poolCount = await poolManager.poolCount();
        const poolId = poolCount - 1n; // Latest pool
        
        // Contribute to pool
        console.log(`✅ Contributing to pool #${poolId}...`);
        const contribTx = await poolManager.contributeToPool(poolId, contributeAmount);
        await contribTx.wait();
        
        const afterContribBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        const contribFeeReceived = afterContribBalance - beforeContribBalance;
        
        console.log(`💰 Treasury balance before: ${ethers.formatUnits(beforeContribBalance, 6)} USDC`);
        console.log(`💰 Treasury balance after: ${ethers.formatUnits(afterContribBalance, 6)} USDC`);
        console.log(`📈 Contribution fee received: ${ethers.formatUnits(contribFeeReceived, 6)} USDC`);
        
        if (contribFeeReceived === ethers.parseUnits("1", 6)) {
            console.log("✅ SUCCESS: Contribution fee (1 USDC) went to treasury!");
        } else {
            console.log("❌ FAIL: Contribution fee amount incorrect");
        }
        
        // Final Summary
        console.log("\n📊 Final Summary:");
        console.log("==================");
        const finalTreasuryBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        const totalFeesReceived = finalTreasuryBalance - initialTreasuryBalance;
        console.log(`💰 Total fees received by treasury: ${ethers.formatUnits(totalFeesReceived, 6)} USDC`);
        console.log(`🎯 Expected total fees: 6 USDC (5 creation + 1 contribution)`);
        
        if (totalFeesReceived === ethers.parseUnits("6", 6)) {
            console.log("🎉 FULL SUCCESS: Treasury model working perfectly!");
        } else {
            console.log("⚠️  Issues detected with treasury fee flow");
        }
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        if (error.reason) {
            console.error("   Reason:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });