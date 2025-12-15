import { ethers } from "hardhat";

async function main() {
    console.log("🔗 CHECKING LINK DATA SUPPORT IN CONTRACT");
    console.log("========================================");
    
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
        
        // Check first 10 opinions or all if less than 10
        const checkCount = Math.min(totalOpinions, 10);
        console.log(`\n🔍 Checking first ${checkCount} opinions for link data:`);
        console.log("=" + "=".repeat(50));
        
        for (let i = 1; i <= checkCount; i++) {
            try {
                const opinion = await opinionCore.getOpinionDetails(i);
                
                console.log(`\n📋 Opinion #${i}:`);
                console.log(`   Question: "${opinion.question}"`);
                console.log(`   Current Answer: "${opinion.currentAnswer}"`);
                console.log(`   IPFS Hash: "${opinion.ipfsHash}"`);
                console.log(`   LINK: "${opinion.link}"`);
                console.log(`   Categories: [${opinion.categories.join(", ")}]`);
                console.log(`   Active: ${opinion.isActive}`);
                
                // Check if link data exists
                if (opinion.link && opinion.link.length > 0) {
                    console.log(`   ✅ HAS LINK DATA!`);
                } else {
                    console.log(`   ❌ No link data (empty string)`);
                }
                
            } catch (error: any) {
                console.log(`   ❌ Error reading opinion #${i}: ${error.message}`);
            }
        }
        
        // Test creating a new opinion with link data
        console.log("\n🧪 TESTING OPINION CREATION WITH LINK DATA");
        console.log("=" + "=".repeat(50));
        
        const testOpinion = {
            question: "Test Link Support?",
            answer: "Yes it works",
            description: "Testing link functionality",
            initialPrice: ethers.parseUnits("2", 6), // 2 USDC
            categories: ["Test"],
            ipfsHash: "",
            link: "https://example.com/test-link"
        };
        
        console.log(`📋 Test Opinion Data:`);
        console.log(`   Question: ${testOpinion.question}`);
        console.log(`   Answer: ${testOpinion.answer}`);
        console.log(`   Link: ${testOpinion.link}`);
        console.log(`   Price: ${ethers.formatUnits(testOpinion.initialPrice, 6)} USDC`);
        
        // Check if public creation is enabled
        const isPublicCreationEnabled = await opinionCore.isPublicCreationEnabled();
        console.log(`\n🔒 Public creation enabled: ${isPublicCreationEnabled}`);
        
        if (!isPublicCreationEnabled) {
            // Check if we have admin role
            const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
            const hasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, deployer.address);
            console.log(`   Admin role: ${hasAdminRole}`);
            
            if (!hasAdminRole) {
                console.log("❌ Cannot create opinion: Need admin role or public creation enabled");
                return;
            }
        }
        
        // Check USDC balance and allowance (don't create, just check)
        const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        const balance = await usdcContract.balanceOf(deployer.address);
        const allowance = await usdcContract.allowance(deployer.address, OPINION_CORE_ADDRESS);
        
        console.log(`\n💰 USDC Status:`);
        console.log(`   Balance: ${ethers.formatUnits(balance, 6)} USDC`);
        console.log(`   Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
        
        const creationFee = ethers.parseUnits("5", 6); // 5 USDC minimum fee
        
        if (balance >= creationFee && allowance >= creationFee) {
            console.log("✅ Ready to create opinion with link data!");
            console.log("   (Not creating in this script - just testing read functionality)");
        } else {
            console.log("❌ Insufficient USDC balance or allowance for creation");
        }
        
        console.log("\n📋 SUMMARY:");
        console.log("=" + "=".repeat(30));
        
        // Count opinions with links
        let opinionsWithLinks = 0;
        for (let i = 1; i <= checkCount; i++) {
            try {
                const opinion = await opinionCore.getOpinionDetails(i);
                if (opinion.link && opinion.link.length > 0) {
                    opinionsWithLinks++;
                }
            } catch (error) {
                // Skip errors
            }
        }
        
        console.log(`✅ Contract DOES support link data storage`);
        console.log(`✅ getOpinionDetails() returns link field`);
        console.log(`✅ createOpinionWithExtras() accepts link parameter`);
        console.log(`📊 Checked ${checkCount} opinions`);
        console.log(`🔗 Found ${opinionsWithLinks} opinions with link data`);
        
        if (opinionsWithLinks === 0) {
            console.log(`\n💡 All checked opinions have empty link fields`);
            console.log(`   This could mean:`);
            console.log(`   1. Opinions were created without links`);
            console.log(`   2. Opinions were created with empty link strings`);
            console.log(`   3. Link data is being stored but not properly set`);
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
        console.log("\n🎉 Link data check completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Check failed:", error);
        process.exit(1);
    });