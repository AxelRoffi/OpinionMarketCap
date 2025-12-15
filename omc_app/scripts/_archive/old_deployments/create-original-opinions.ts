import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Creating Original 2 Opinions in New Contract...");
    
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Creating opinions with account:", deployer.address);

    // Get contract instances
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    
    // Original opinions to recreate (adjusted to meet 2 USDC minimum)
    const opinions = [
        {
            question: "Goat of Soccer ?",
            answer: "Zidane",
            initialPrice: ethers.parseUnits("2", 6) // 2 USDC (minimum)
        },
        {
            question: "Most beautiful city ?",
            answer: "Paris", 
            initialPrice: ethers.parseUnits("2", 6) // 2 USDC (minimum)
        }
    ];
    
    console.log("📋 Opinions to Create:");
    opinions.forEach((opinion, index) => {
        console.log(`${index + 1}. ${opinion.question}`);
        console.log(`   Answer: ${opinion.answer}`);
        console.log(`   Price: ${ethers.formatUnits(opinion.initialPrice, 6)} USDC`);
    });
    
    // Check USDC balance and setup
    const balance = await usdc.balanceOf(deployer.address);
    const totalRequired = opinions.reduce((sum, op) => sum + op.initialPrice, BigInt(0));
    
    console.log(`\n💳 USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
    console.log(`💰 Total Required: ${ethers.formatUnits(totalRequired, 6)} USDC`);
    
    if (balance < totalRequired) {
        console.log("❌ Insufficient USDC balance!");
        return;
    }
    
    // Check and approve USDC
    const currentAllowance = await usdc.allowance(deployer.address, CONTRACT_ADDRESS);
    console.log(`🔒 Current Allowance: ${ethers.formatUnits(currentAllowance, 6)} USDC`);
    
    if (currentAllowance < totalRequired) {
        console.log("🔒 Approving USDC...");
        const approveTx = await usdc.approve(CONTRACT_ADDRESS, totalRequired);
        await approveTx.wait();
        console.log("✅ USDC approved");
    }
    
    // Get starting opinion ID
    const startingId = await contract.nextOpinionId();
    console.log(`\n🆔 Starting Opinion ID: ${startingId}`);
    
    // Create each opinion
    const createdOpinions = [];
    
    for (let i = 0; i < opinions.length; i++) {
        const opinion = opinions[i];
        console.log(`\n🚀 Creating Opinion ${i + 1}: "${opinion.question}"`);
        
        try {
            const createTx = await contract.createOpinion(
                opinion.question,
                opinion.answer,
                opinion.initialPrice
            );
            
            console.log(`📄 Transaction hash: ${createTx.hash}`);
            console.log("⏳ Waiting for confirmation...");
            
            const receipt = await createTx.wait();
            const currentOpinionId = Number(startingId) + i;
            
            console.log(`✅ Opinion ${i + 1} created successfully!`);
            console.log(`🆔 Opinion ID: ${currentOpinionId}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed}`);
            
            createdOpinions.push({
                id: currentOpinionId,
                question: opinion.question,
                answer: opinion.answer,
                price: ethers.formatUnits(opinion.initialPrice, 6) + " USDC"
            });
            
        } catch (error: any) {
            console.error(`❌ Failed to create opinion ${i + 1}:`, error.message);
            break;
        }
    }
    
    // Verify created opinions
    if (createdOpinions.length > 0) {
        console.log("\n🔍 Verifying created opinions...");
        
        for (const created of createdOpinions) {
            try {
                const opinionData = await contract.opinions(created.id);
                
                console.log(`\n📋 Opinion ID ${created.id} Details:`);
                console.log(`Question: ${opinionData.question}`);
                console.log(`Current Answer: ${opinionData.currentAnswer}`);
                console.log(`Price: ${ethers.formatUnits(opinionData.lastPrice, 6)} USDC`);
                console.log(`Creator: ${opinionData.creator}`);
                console.log(`Current Owner: ${opinionData.currentOwner}`);
                console.log(`Active: ${opinionData.isActive}`);
                
            } catch (error) {
                console.error(`❌ Failed to verify opinion ${created.id}:`, error);
            }
        }
    }
    
    console.log(`\n🎉 Successfully created ${createdOpinions.length} out of ${opinions.length} opinions!`);
    
    // Update contract addresses file
    const newAddresses = {
        contract: CONTRACT_ADDRESS,
        usdcToken: USDC_ADDRESS,
        treasury: "0xFb7eF00D5C2a87d282F273632e834f9105795067",
        deployer: deployer.address,
        createdOpinions: createdOpinions
    };
    
    console.log("\n📋 Final Summary:");
    console.log(JSON.stringify(newAddresses, null, 2));
    
    const fs = require('fs');
    fs.writeFileSync('./final-deployment.json', JSON.stringify(newAddresses, null, 2));
    console.log("📄 Final deployment info saved to final-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });