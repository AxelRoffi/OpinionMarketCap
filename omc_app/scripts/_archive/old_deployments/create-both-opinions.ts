import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Creating Two Opinions...");
    
    // Contract addresses
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Creating opinions with account:", deployer.address);

    // Get contract instances
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    
    // Opinion parameters
    const opinions = [
        {
            question: "Goat of Soccer ?",
            initialPrice: ethers.parseUnits("1", 6), // 1 USDC
            answer: "Zidane",
            description: "Panenka in 2006 WC Final",
            categories: ["Sports"],
            link: "https://www.youtube.com/watch?v=GkWNboVtzho",
            ipfsHash: ""
        },
        {
            question: "Most beautiful city ?",
            initialPrice: ethers.parseUnits("1", 6), // 1 USDC
            answer: "Paris",
            description: "if everybody says it is the most beautiful city in the wordk, then it must be...",
            categories: ["Culture"],
            link: "https://www.youtube.com/watch?v=Q0MhFNQnyjc",
            ipfsHash: ""
        }
    ];
    
    console.log("📋 Opinion Parameters:");
    opinions.forEach((opinion, index) => {
        console.log(`\n--- Opinion ${index + 1} ---`);
        console.log(`Question: ${opinion.question}`);
        console.log(`Answer: ${opinion.answer}`);
        console.log(`Description: ${opinion.description}`);
        console.log(`Categories: ${opinion.categories.join(", ")}`);
        console.log(`Link: ${opinion.link}`);
    });
    
    // Check contract status
    const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
    console.log(`\n🔍 Public creation enabled: ${isPublicEnabled}`);
    
    // Calculate total fees needed (5 USDC per opinion minimum)
    const minimumFee = ethers.parseUnits("5", 6); // 5 USDC minimum per opinion
    const totalFeesNeeded = minimumFee * BigInt(2); // 10 USDC total
    
    console.log(`\n💰 Fee Calculation:`);
    console.log(`Fee per opinion: 5 USDC (minimum)`);
    console.log(`Total fees needed: ${ethers.formatUnits(totalFeesNeeded, 6)} USDC`);
    
    // Check USDC balance
    const usdcBalance = await usdc.balanceOf(deployer.address);
    console.log(`\n💳 Your USDC balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
    
    if (usdcBalance < totalFeesNeeded) {
        console.log("❌ Insufficient USDC balance!");
        console.log(`You need at least ${ethers.formatUnits(totalFeesNeeded, 6)} USDC to create both opinions`);
        return;
    }
    
    // Check and set allowance
    const currentAllowance = await usdc.allowance(deployer.address, OPINION_CORE_ADDRESS);
    console.log(`Current allowance: ${ethers.formatUnits(currentAllowance, 6)} USDC`);
    
    if (currentAllowance < totalFeesNeeded) {
        console.log("🔒 Approving USDC spending...");
        const approveTx = await usdc.approve(OPINION_CORE_ADDRESS, totalFeesNeeded);
        await approveTx.wait();
        console.log("✅ USDC approved!");
    }
    
    // Get starting opinion ID
    let nextOpinionId = await opinionCore.nextOpinionId();
    console.log(`\n🆔 Starting Opinion ID: ${nextOpinionId}`);
    
    // Create both opinions
    const createdOpinions = [];
    
    for (let i = 0; i < opinions.length; i++) {
        const opinion = opinions[i];
        console.log(`\n🚀 Creating Opinion ${i + 1}: "${opinion.question}"`);
        
        try {
            const createTx = await opinionCore.createOpinionWithExtras(
                opinion.question,         // string question
                opinion.answer,          // string answer  
                opinion.description,     // string description
                opinion.initialPrice,    // uint96 initialPrice
                opinion.categories,      // string[] categories
                opinion.ipfsHash,        // string ipfsHash
                opinion.link             // string link
            );
            
            console.log(`📄 Transaction hash: ${createTx.hash}`);
            console.log("⏳ Waiting for confirmation...");
            
            const receipt = await createTx.wait();
            const currentOpinionId = nextOpinionId;
            
            console.log(`✅ Opinion ${i + 1} created successfully!`);
            console.log(`🆔 Opinion ID: ${currentOpinionId}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed}`);
            
            createdOpinions.push({
                id: currentOpinionId,
                question: opinion.question,
                answer: opinion.answer
            });
            
            // Update for next opinion
            nextOpinionId = BigInt(nextOpinionId) + BigInt(1);
            
        } catch (error: any) {
            console.error(`❌ Failed to create opinion ${i + 1}:`, error.message);
            
            // Common error analysis
            if (error.message.includes("InsufficientUSDCBalance")) {
                console.log("💡 You need more USDC in your wallet");
            } else if (error.message.includes("InsufficientAllowance")) {
                console.log("💡 Need to approve more USDC spending");
            } else if (error.message.includes("PublicCreationDisabled")) {
                console.log("💡 Public creation is disabled, need admin role");
            }
            break;
        }
    }
    
    // Verify created opinions
    if (createdOpinions.length > 0) {
        console.log("\n🔍 Verifying created opinions...");
        
        for (const created of createdOpinions) {
            try {
                const opinionDetails = await opinionCore.getOpinionDetails(created.id);
                
                console.log(`\n📋 Opinion ID ${created.id} Details:`);
                console.log(`Question: ${opinionDetails.question}`);
                console.log(`Current Answer: ${opinionDetails.currentAnswer}`);
                console.log(`Description: ${opinionDetails.currentAnswerDescription}`);
                console.log(`Price: ${ethers.formatUnits(opinionDetails.lastPrice, 6)} USDC`);
                console.log(`Creator: ${opinionDetails.creator}`);
                console.log(`Categories: ${opinionDetails.categories.join(", ")}`);
                console.log(`Link: ${opinionDetails.link}`);
                console.log(`Active: ${opinionDetails.isActive}`);
                
            } catch (error) {
                console.error(`❌ Failed to verify opinion ${created.id}:`, error);
            }
        }
    }
    
    console.log(`\n🎉 Successfully created ${createdOpinions.length} out of ${opinions.length} opinions!`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });