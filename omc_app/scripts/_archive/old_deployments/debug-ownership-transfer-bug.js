const hre = require("hardhat");

async function main() {
    console.log("\n🔍 DEBUGGING OWNERSHIP TRANSFER BUG");
    console.log("===================================");

    // Get the deployed contract addresses
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298529579A8bF7D2f";
    const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";

    // Get signers
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using deployer account:", deployer.address);

    // Get contract instances
    const OpinionCore = await hre.ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    const FeeManager = await hre.ethers.getContractAt("FeeManager", FEE_MANAGER_ADDRESS);

    // The addresses from the bug report
    const originalOwner = "0x644541778b26D101b6E6516B7796768631217b68";
    const newOwner = "0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87";

    console.log("\n🎯 Target Analysis:");
    console.log("Original Owner:", originalOwner);
    console.log("New Owner:", newOwner);

    // Find an opinion ID where ownership was transferred
    console.log("\n🔍 Searching for transferred opinion...");
    
    try {
        // Check opinions 1-10 to find one with questionOwner != creator
        for (let opinionId = 1; opinionId <= 10; opinionId++) {
            try {
                const opinion = await OpinionCore.getOpinionDetails(opinionId);
                
                if (opinion.creator.toLowerCase() === originalOwner.toLowerCase() && 
                    opinion.questionOwner.toLowerCase() === newOwner.toLowerCase()) {
                    
                    console.log(`\n✅ FOUND TRANSFERRED OPINION ${opinionId}:`);
                    console.log("  Creator (original):", opinion.creator);
                    console.log("  Question Owner (new):", opinion.questionOwner);
                    console.log("  Current Answer Owner:", opinion.currentAnswerOwner);
                    console.log("  Question:", opinion.question);
                    console.log("  Last Price:", hre.ethers.formatUnits(opinion.lastPrice, 6), "USDC");
                    
                    // Check accumulated fees for both addresses
                    const originalOwnerFees = await FeeManager.getAccumulatedFees(originalOwner);
                    const newOwnerFees = await FeeManager.getAccumulatedFees(newOwner);
                    
                    console.log("\n💰 ACCUMULATED FEES:");
                    console.log("  Original Owner Fees:", hre.ethers.formatUnits(originalOwnerFees, 6), "USDC");
                    console.log("  New Owner Fees:", hre.ethers.formatUnits(newOwnerFees, 6), "USDC");
                    
                    return;
                }
            } catch (error) {
                // Opinion doesn't exist, continue
                continue;
            }
        }
        
        console.log("❌ No transferred opinion found in range 1-10");
        
    } catch (error) {
        console.error("❌ Error searching for opinions:", error.message);
    }

    console.log("\n🔧 ANALYSIS OF BUG:");
    console.log("1. In submitAnswer() function:");
    console.log("   - Line 465: address creator = opinion.creator (NEVER UPDATED)");
    console.log("   - Line 484: feeManager.accumulateFee(creator, creatorFee)");
    console.log("   - This always uses the ORIGINAL creator, not questionOwner");
    console.log("");
    console.log("2. In buyQuestion() function:");
    console.log("   - Line 579: opinion.questionOwner = msg.sender (UPDATES OWNERSHIP)");
    console.log("   - But submitAnswer still uses opinion.creator for fee distribution");
    console.log("");
    console.log("💡 SOLUTION:");
    console.log("Change line 465 from:");
    console.log("  address creator = opinion.creator;");
    console.log("To:");
    console.log("  address creator = opinion.questionOwner;");
    console.log("");
    console.log("This ensures creator fees go to the current question owner,");
    console.log("not the original creator after ownership transfer.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });