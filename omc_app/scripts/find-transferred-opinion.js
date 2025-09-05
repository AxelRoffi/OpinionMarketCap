const hre = require("hardhat");

async function main() {
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298529579A8bF7D2f";
    const OpinionCore = await hre.ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);

    const originalOwner = "0x644541778b26D101b6E6516B7796768631217b68";
    const newOwner = "0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87";

    // Get total opinion count
    const nextId = await OpinionCore.nextOpinionId();
    console.log("Total opinions created:", nextId.toString());

    // Search all opinions for the transferred one
    for (let opinionId = 1; opinionId < nextId; opinionId++) {
        try {
            const opinion = await OpinionCore.getOpinionDetails(opinionId);
            
            if (opinion.creator.toLowerCase() === originalOwner.toLowerCase() && 
                opinion.questionOwner.toLowerCase() === newOwner.toLowerCase()) {
                
                console.log(`\n✅ FOUND TRANSFERRED OPINION ${opinionId}:`);
                console.log("  Creator (original):", opinion.creator);
                console.log("  Question Owner (new):", opinion.questionOwner);
                console.log("  This confirms ownership was transferred!");
                return opinionId;
            }
        } catch (error) {
            continue;
        }
    }
    
    console.log("\n❌ No transferred opinion found");
    return null;
}

main().catch(console.error);