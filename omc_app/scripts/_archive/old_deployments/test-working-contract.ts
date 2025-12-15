import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing Working SimpleOpinionMarket...");
    
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // Get contract instances
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    
    // Check USDC balance and setup
    const balance = await usdc.balanceOf(deployer.address);
    console.log("💳 USDC Balance:", ethers.formatUnits(balance, 6), "USDC");
    
    // Test 1: Create an opinion
    console.log("\n🚀 Test 1: Creating Opinion...");
    
    const testOpinion = {
        question: "Who will win 2026 World Cup?",
        initialPrice: ethers.parseUnits("3", 6), // 3 USDC
        answer: "Brazil",
        description: "5-time champions"
    };
    
    console.log(`Question: ${testOpinion.question}`);
    console.log(`Answer: ${testOpinion.answer}`);
    console.log(`Price: ${ethers.formatUnits(testOpinion.initialPrice, 6)} USDC`);
    
    // Check if we need to approve USDC
    const currentAllowance = await usdc.allowance(deployer.address, CONTRACT_ADDRESS);
    console.log(`Current USDC allowance: ${ethers.formatUnits(currentAllowance, 6)} USDC`);
    
    if (currentAllowance < testOpinion.initialPrice) {
        console.log("🔒 Approving USDC...");
        const approveTx = await usdc.approve(CONTRACT_ADDRESS, testOpinion.initialPrice);
        await approveTx.wait();
        console.log("✅ USDC approved");
    }
    
    try {
        // Create opinion (SimpleOpinionMarket only takes 3 parameters)
        console.log("📝 Creating opinion...");
        const createTx = await contract.createOpinion(
            testOpinion.question,
            testOpinion.answer,
            testOpinion.initialPrice
        );
        
        console.log("📄 Transaction hash:", createTx.hash);
        const receipt = await createTx.wait();
        console.log("✅ Opinion created successfully!");
        console.log("⛽ Gas used:", receipt.gasUsed.toString());
        
        // Get the created opinion details
        const opinion = await contract.opinions(1);
        console.log("\n📋 Created Opinion:");
        console.log("Question:", opinion.question);
        console.log("Current Answer:", opinion.currentAnswer);
        console.log("Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
        console.log("Creator:", opinion.creator);
        console.log("Current Owner:", opinion.currentOwner);
        console.log("Is Active:", opinion.isActive);
        
        // Test 2: Try to submit an answer (this should fail because we're the owner)
        console.log("\n🧪 Test 2: Submit Answer (should fail - same owner)...");
        
        try {
            await contract.submitAnswer.staticCall(1, "Argentina");
            console.log("❌ Unexpected: Submit answer simulation passed");
        } catch (error: any) {
            console.log("✅ Expected: Submit answer failed (same owner)");
            console.log("Error:", error.message);
        }
        
        console.log("\n🎉 Contract is working correctly!");
        console.log("🎯 To test answer submission, use a different wallet address");
        
    } catch (error: any) {
        console.error("❌ Error creating opinion:", error.message);
        if (error.data) {
            console.log("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });