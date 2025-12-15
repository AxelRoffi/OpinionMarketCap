import { ethers } from "hardhat";

async function main() {
    console.log("🏗️ Creating Test Opinion for Answer Submission...");
    
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Creating opinion with account:", deployer.address);

    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    
    // Test opinion that someone else can answer
    const testOpinion = {
        question: "Best crypto in 2025?",
        initialPrice: ethers.parseUnits("2", 6), // 2 USDC
        answer: "Bitcoin",
        description: "The king of crypto",
        categories: ["Crypto"],
        link: "https://bitcoin.org",
        ipfsHash: ""
    };
    
    console.log("📋 Creating Test Opinion:");
    console.log(`Question: ${testOpinion.question}`);
    console.log(`Answer: ${testOpinion.answer}`);
    console.log(`Price: ${ethers.formatUnits(testOpinion.initialPrice, 6)} USDC`);
    
    // Calculate fee
    const minimumFee = ethers.parseUnits("5", 6); // 5 USDC minimum
    const calculatedFee = (Number(testOpinion.initialPrice) * 20) / 100;
    const actualFee = calculatedFee < Number(minimumFee) ? minimumFee : BigInt(calculatedFee);
    
    console.log(`Creation Fee: ${ethers.formatUnits(actualFee, 6)} USDC`);
    
    // Check balance and allowance
    const balance = await usdc.balanceOf(deployer.address);
    const allowance = await usdc.allowance(deployer.address, OPINION_CORE_ADDRESS);
    
    console.log(`Your USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
    console.log(`Current Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    
    if (balance < actualFee) {
        console.log("❌ Insufficient USDC balance!");
        return;
    }
    
    if (allowance < actualFee) {
        console.log("🔒 Approving USDC...");
        const approveTx = await usdc.approve(OPINION_CORE_ADDRESS, actualFee);
        await approveTx.wait();
        console.log("✅ USDC approved");
    }
    
    // Get next opinion ID
    const nextOpinionId = await opinionCore.nextOpinionId();
    console.log(`\n🆔 Next Opinion ID: ${nextOpinionId}`);
    
    // Create the opinion
    try {
        console.log("🚀 Creating opinion...");
        const createTx = await opinionCore.createOpinionWithExtras(
            testOpinion.question,
            testOpinion.answer,
            testOpinion.description,
            testOpinion.initialPrice,
            testOpinion.categories,
            testOpinion.ipfsHash,
            testOpinion.link
        );
        
        console.log("📄 Transaction hash:", createTx.hash);
        const receipt = await createTx.wait();
        console.log("✅ Opinion created successfully!");
        console.log(`🆔 Opinion ID: ${nextOpinionId}`);
        
        // Verify creation
        const newOpinion = await opinionCore.getOpinionDetails(nextOpinionId);
        console.log("\n📋 Created Opinion Details:");
        console.log(`Question: ${newOpinion.question}`);
        console.log(`Current Answer: ${newOpinion.currentAnswer}`);
        console.log(`Current Price: ${ethers.formatUnits(newOpinion.lastPrice, 6)} USDC`);
        console.log(`Current Owner: ${newOpinion.currentAnswerOwner}`);
        console.log(`Creator: ${newOpinion.creator}`);
        
        console.log("\n💡 Instructions for Testing:");
        console.log("1. Use a DIFFERENT wallet address to submit answers");
        console.log("2. That wallet needs:");
        console.log(`   - At least ${ethers.formatUnits(newOpinion.lastPrice, 6)} USDC`);
        console.log("   - ETH for gas fees");
        console.log("   - Approval for USDC spending");
        console.log(`3. Call submitAnswer(${nextOpinionId}, "Your Answer", "Description")`);
        
    } catch (error: any) {
        console.error("❌ Failed to create opinion:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });