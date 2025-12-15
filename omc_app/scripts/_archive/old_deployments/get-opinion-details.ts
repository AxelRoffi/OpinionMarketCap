import { ethers } from "hardhat";

async function main() {
    console.log("🔍 GETTING OPINION DETAILS FROM BLOCKCHAIN");
    console.log("=========================================");
    
    // Current deployed contract address
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    const PRICE_CALCULATOR_ADDRESS = "0x045ba1478c5ECAbB9eef1a269852C27cE168b372";
    
    const [deployer] = await ethers.getSigners();
    console.log("🔐 Checking with address:", deployer.address);
    
    try {
        // Connect to the contract with libraries
        const OpinionCore = await ethers.getContractFactory("OpinionCore", {
            libraries: {
                PriceCalculator: PRICE_CALCULATOR_ADDRESS,
            },
        });
        const opinionCore = OpinionCore.attach(OPINION_CORE_ADDRESS);
        
        console.log("📍 Connected to OpinionCore at:", OPINION_CORE_ADDRESS);
        
        // Check how many opinions exist
        const nextOpinionId = await opinionCore.nextOpinionId();
        const totalOpinions = Number(nextOpinionId) - 1;
        console.log(`\n📊 Total opinions in contract: ${totalOpinions}`);
        
        if (totalOpinions === 0) {
            console.log("❌ No opinions found in contract!");
            return;
        }
        
        // Check all opinions
        console.log(`\n🔍 Fetching all ${totalOpinions} opinions:`);
        console.log("=" + "=".repeat(60));
        
        for (let i = 1; i <= totalOpinions; i++) {
            try {
                const opinion = await opinionCore.getOpinionDetails(i);
                
                console.log(`\n📋 Opinion #${i}:`);
                console.log(`   Question: "${opinion.question}"`);
                console.log(`   Current Answer: "${opinion.currentAnswer}"`);
                console.log(`   Current Answer Description: "${opinion.currentAnswerDescription}"`);
                console.log(`   Link: "${opinion.link}"`);
                console.log(`   IPFS Hash: "${opinion.ipfsHash}"`);
                console.log(`   Categories: [${opinion.categories.join(", ")}]`);
                console.log(`   Creator: ${opinion.creator}`);
                console.log(`   Question Owner: ${opinion.questionOwner}`);
                console.log(`   Current Answer Owner: ${opinion.currentAnswerOwner}`);
                console.log(`   Next Price: ${ethers.formatUnits(opinion.nextPrice, 6)} USDC`);
                console.log(`   Last Price: ${ethers.formatUnits(opinion.lastPrice, 6)} USDC`);
                console.log(`   Total Volume: ${ethers.formatUnits(opinion.totalVolume, 6)} USDC`);
                console.log(`   Sale Price: ${ethers.formatUnits(opinion.salePrice, 6)} USDC`);
                console.log(`   Active: ${opinion.isActive}`);
                
                // Focus on link field
                if (opinion.link && opinion.link.trim().length > 0) {
                    console.log(`   🔗 LINK STATUS: HAS LINK - "${opinion.link}"`);
                } else {
                    console.log(`   🔗 LINK STATUS: NO LINK (empty or whitespace)`);
                }
                
            } catch (error: any) {
                console.log(`   ❌ Error reading opinion #${i}: ${error.message}`);
            }
        }
        
        console.log("\n📋 LINK SUMMARY:");
        console.log("=" + "=".repeat(40));
        
        let opinionsWithLinks = 0;
        let linkExamples: string[] = [];
        
        for (let i = 1; i <= totalOpinions; i++) {
            try {
                const opinion = await opinionCore.getOpinionDetails(i);
                if (opinion.link && opinion.link.trim().length > 0) {
                    opinionsWithLinks++;
                    linkExamples.push(`Opinion #${i}: "${opinion.link}"`);
                }
            } catch (error) {
                // Skip errors
            }
        }
        
        console.log(`📊 Total opinions: ${totalOpinions}`);
        console.log(`🔗 Opinions with links: ${opinionsWithLinks}`);
        console.log(`📈 Percentage with links: ${((opinionsWithLinks/totalOpinions)*100).toFixed(1)}%`);
        
        if (linkExamples.length > 0) {
            console.log(`\n🔗 Link examples:`);
            linkExamples.forEach(example => console.log(`   ${example}`));
        } else {
            console.log(`\n❌ No opinions have link data`);
            console.log(`   This means all opinion.link fields are empty strings`);
        }
        
    } catch (error: any) {
        console.error("❌ Check failed:", error.message);
        if (error.message.includes("missing revert data")) {
            console.log("💡 This might be a library linking issue");
        }
    }
}

main()
    .then(() => {
        console.log("\n🎉 Opinion details check completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Check failed:", error);
        process.exit(1);
    });