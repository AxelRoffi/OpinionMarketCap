import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing Submit Answer Function...");
    
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // Get contract instances
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    
    // Check existing opinions
    console.log("\n📋 Current Opinions:");
    for (let i = 1; i <= 2; i++) {
        try {
            const opinion = await opinionCore.getOpinionDetails(i);
            console.log(`Opinion ${i}:`);
            console.log(`  Question: ${opinion.question}`);
            console.log(`  Current Answer: ${opinion.currentAnswer}`);
            console.log(`  Current Price: ${ethers.formatUnits(opinion.lastPrice, 6)} USDC`);
            console.log(`  Is Active: ${opinion.isActive}`);
            console.log(`  Creator: ${opinion.creator}`);
            console.log(`  Current Owner: ${opinion.currentAnswerOwner}`);
        } catch (error) {
            console.log(`Opinion ${i}: Not found`);
        }
    }
    
    // Check user's USDC situation
    console.log("\n💳 User Account Status:");
    const userBalance = await usdc.balanceOf(deployer.address);
    const allowance = await usdc.allowance(deployer.address, OPINION_CORE_ADDRESS);
    console.log(`USDC Balance: ${ethers.formatUnits(userBalance, 6)} USDC`);
    console.log(`USDC Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    
    // Test parameters for submitAnswer
    const testOpinionId = 1;
    const testAnswer = "Messi";
    const testDescription = "The GOAT of soccer with 8 Ballon d'Or";
    
    console.log("\n🧪 Testing Submit Answer Parameters:");
    console.log(`Opinion ID: ${testOpinionId}`);
    console.log(`New Answer: ${testAnswer}`);
    console.log(`Description: ${testDescription}`);
    
    try {
        // Get the opinion details first
        const opinion = await opinionCore.getOpinionDetails(testOpinionId);
        const requiredPayment = opinion.lastPrice;
        console.log(`Required Payment: ${ethers.formatUnits(requiredPayment, 6)} USDC`);
        
        // Check all prerequisites
        console.log("\n🔍 Checking Prerequisites:");
        
        // 1. Opinion exists and is active
        if (!opinion.isActive) {
            console.log("❌ Opinion is not active");
            return;
        } else {
            console.log("✅ Opinion is active");
        }
        
        // 2. Answer is different
        if (testAnswer === opinion.currentAnswer) {
            console.log("❌ Answer is the same as current answer");
            return;
        } else {
            console.log("✅ Answer is different from current");
        }
        
        // 3. User has enough USDC
        if (userBalance < requiredPayment) {
            console.log("❌ Insufficient USDC balance");
            console.log(`Need: ${ethers.formatUnits(requiredPayment, 6)} USDC`);
            console.log(`Have: ${ethers.formatUnits(userBalance, 6)} USDC`);
            return;
        } else {
            console.log("✅ Sufficient USDC balance");
        }
        
        // 4. User has approved enough USDC
        if (allowance < requiredPayment) {
            console.log("❌ Insufficient USDC allowance");
            console.log(`Need: ${ethers.formatUnits(requiredPayment, 6)} USDC`);
            console.log(`Approved: ${ethers.formatUnits(allowance, 6)} USDC`);
            
            // Try to approve more USDC
            console.log("🔒 Approving more USDC...");
            const approveTx = await usdc.approve(OPINION_CORE_ADDRESS, requiredPayment);
            await approveTx.wait();
            console.log("✅ USDC approved");
        } else {
            console.log("✅ Sufficient USDC allowance");
        }
        
        // 5. Check string lengths
        if (testAnswer.length > 52) {
            console.log("❌ Answer too long (max 52 chars)");
            return;
        } else {
            console.log("✅ Answer length OK");
        }
        
        if (testDescription.length > 120) {
            console.log("❌ Description too long (max 120 chars)");
            return;
        } else {
            console.log("✅ Description length OK");
        }
        
        // 6. Check if contract is paused
        try {
            const isPaused = await opinionCore.paused();
            if (isPaused) {
                console.log("❌ Contract is paused");
                return;
            } else {
                console.log("✅ Contract is not paused");
            }
        } catch (e) {
            console.log("ℹ️ Could not check paused status (may not be implemented)");
        }
        
        // 7. Simulate the transaction first
        console.log("\n🎯 Simulating submitAnswer transaction...");
        try {
            await opinionCore.submitAnswer.staticCall(testOpinionId, testAnswer, testDescription);
            console.log("✅ Simulation successful!");
            
            // Now try the actual transaction
            console.log("\n🚀 Executing submitAnswer transaction...");
            const submitTx = await opinionCore.submitAnswer(testOpinionId, testAnswer, testDescription);
            console.log("📄 Transaction hash:", submitTx.hash);
            
            const receipt = await submitTx.wait();
            console.log("✅ Transaction successful!");
            console.log("⛽ Gas used:", receipt.gasUsed.toString());
            
            // Verify the answer was updated
            const updatedOpinion = await opinionCore.getOpinionDetails(testOpinionId);
            console.log("\n📋 Updated Opinion:");
            console.log(`New Answer: ${updatedOpinion.currentAnswer}`);
            console.log(`New Price: ${ethers.formatUnits(updatedOpinion.lastPrice, 6)} USDC`);
            console.log(`New Owner: ${updatedOpinion.currentAnswerOwner}`);
            
        } catch (simulationError: any) {
            console.log("❌ Simulation failed:", simulationError.message);
            
            // Try to get more specific error information
            if (simulationError.message.includes("InsufficientUSDCBalance")) {
                console.log("💡 Issue: Not enough USDC balance");
            } else if (simulationError.message.includes("InsufficientAllowance")) {
                console.log("💡 Issue: Not enough USDC allowance");
            } else if (simulationError.message.includes("SameAnswer")) {
                console.log("💡 Issue: Answer is the same as current");
            } else if (simulationError.message.includes("OpinionNotActive")) {
                console.log("💡 Issue: Opinion is not active");
            } else if (simulationError.message.includes("Pausable: paused")) {
                console.log("💡 Issue: Contract is paused");
            } else {
                console.log("💡 Unknown error - check contract requirements");
            }
        }
        
    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });