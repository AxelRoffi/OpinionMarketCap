import { ethers } from "hardhat";

const OPINION_CORE_ADDRESS = "0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc";

async function testContractCalls() {
    console.log("Testing contract calls...");
    
    try {
        // Get the deployed contract
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        console.log("Contract connected:", OPINION_CORE_ADDRESS);
        
        // Test 1: Get next opinion ID
        console.log("\n1. Testing nextOpinionId()...");
        const nextOpinionId = await opinionCore.nextOpinionId();
        console.log("Next Opinion ID:", nextOpinionId.toString());
        
        // Test 2: Get opinion details for opinion 1 (if exists)
        if (nextOpinionId > 1) {
            console.log("\n2. Testing getOpinionDetails(1)...");
            try {
                const opinion1 = await opinionCore.getOpinionDetails(1);
                console.log("Opinion 1 details:");
                console.log("- Question:", opinion1.question);
                console.log("- Current Answer:", opinion1.currentAnswer);
                console.log("- Is Active:", opinion1.isActive);
                console.log("- Creator:", opinion1.creator);
                console.log("- Next Price:", ethers.formatUnits(opinion1.nextPrice, 6), "USDC");
            } catch (error) {
                console.error("Error getting opinion 1:", error);
            }
        }
        
        // Test 3: Get opinion details for opinion 2 (if exists)
        if (nextOpinionId > 2) {
            console.log("\n3. Testing getOpinionDetails(2)...");
            try {
                const opinion2 = await opinionCore.getOpinionDetails(2);
                console.log("Opinion 2 details:");
                console.log("- Question:", opinion2.question);
                console.log("- Current Answer:", opinion2.currentAnswer);
                console.log("- Is Active:", opinion2.isActive);
                console.log("- Creator:", opinion2.creator);
                console.log("- Next Price:", ethers.formatUnits(opinion2.nextPrice, 6), "USDC");
            } catch (error) {
                console.error("Error getting opinion 2:", error);
            }
        }
        
    } catch (error) {
        console.error("Contract connection error:", error);
    }
}

testContractCalls()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });