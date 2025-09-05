import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Checking Rate Limiting Issues...");
    
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const [deployer] = await ethers.getSigners();
    
    console.log("Checking for account:", deployer.address);

    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    
    try {
        // Check max trades per block setting
        const maxTradesPerBlock = await opinionCore.maxTradesPerBlock();
        console.log("📊 Max trades per block:", maxTradesPerBlock.toString());
        
        // Get current block number
        const currentBlock = await ethers.provider.getBlockNumber();
        console.log("🧱 Current block:", currentBlock);
        
        // Check if user has specific rate limiting view functions
        console.log("\n🔍 Checking Rate Limiting Status:");
        
        // Try to call the rate limiting check functions directly if they exist
        try {
            // These are internal mappings, so we can't read them directly
            // But we can simulate the submitAnswer call to see the exact error
            
            console.log("🎯 Simulating submitAnswer to get exact error...");
            
            // Test with the simplest possible parameters
            const testOpinionId = 1;
            const testAnswer = "TestAnswer";
            const testDescription = "Test";
            
            try {
                await opinionCore.submitAnswer.staticCall(testOpinionId, testAnswer, testDescription);
                console.log("✅ Simulation passed - no rate limiting issues");
            } catch (error: any) {
                console.log("❌ Simulation failed with error:");
                console.log("Raw error:", error.message);
                
                // Parse the error to get the actual revert reason
                if (error.data) {
                    try {
                        // Try to decode custom errors
                        const errorData = error.data;
                        console.log("Error data:", errorData);
                        
                        // Common custom error signatures
                        const errorSignatures = {
                            "0x8baa579f": "SameOwner()",
                            "0x7c946ed7": "OpinionNotFound()",
                            "0xfc8a6b84": "OpinionNotActive()",
                            "0x2c5211c6": "EmptyString()",
                            "0x69f41f21": "InvalidAnswerLength()",
                            "0x13be252b": "InsufficientAllowance()",
                            "0x573b48e1": "MaxTradesPerBlockExceeded()",
                            "0x9e87fac8": "OneTradePerBlock()"
                        };
                        
                        const errorSig = errorData.slice(0, 10);
                        if (errorSignatures[errorSig as keyof typeof errorSignatures]) {
                            console.log("🎯 Decoded error:", errorSignatures[errorSig as keyof typeof errorSignatures]);
                            
                            switch (errorSig) {
                                case "0x8baa579f":
                                    console.log("💡 You are already the owner of this opinion's current answer");
                                    break;
                                case "0x573b48e1":
                                    console.log("💡 You have exceeded max trades per block (limit: " + maxTradesPerBlock + ")");
                                    break;
                                case "0x9e87fac8":
                                    console.log("💡 You have already traded this opinion in the current block");
                                    break;
                                case "0x13be252b":
                                    console.log("💡 Insufficient USDC allowance");
                                    break;
                                default:
                                    console.log("💡 See error name above for details");
                            }
                        } else {
                            console.log("🤔 Unknown error signature:", errorSig);
                        }
                    } catch (decodeError) {
                        console.log("Could not decode error data");
                    }
                } else {
                    console.log("No error data available");
                }
            }
            
        } catch (checkError) {
            console.log("❌ Error checking rate limiting:", checkError);
        }
        
        // Check who owns the current answers
        console.log("\n👑 Current Answer Owners:");
        for (let i = 1; i <= 2; i++) {
            try {
                const opinion = await opinionCore.getOpinionDetails(i);
                console.log(`Opinion ${i} (${opinion.question}):`);
                console.log(`  Current Owner: ${opinion.currentAnswerOwner}`);
                console.log(`  Your Address:  ${deployer.address}`);
                console.log(`  Are you owner? ${opinion.currentAnswerOwner.toLowerCase() === deployer.address.toLowerCase()}`);
            } catch (error) {
                console.log(`Opinion ${i}: Error reading details`);
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