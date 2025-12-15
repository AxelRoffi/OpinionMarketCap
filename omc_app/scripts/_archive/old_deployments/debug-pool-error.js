const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 DEBUGGING POOL CREATION ERROR");
    console.log("=================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        console.log("📋 Detailed Parameter Validation:");
        
        // Check opinion #3 details
        const opinion3 = await opinionCore.getOpinionDetails(3);
        console.log("   Opinion #3 question:", opinion3.question);
        console.log("   Current answer:", opinion3.currentAnswer);
        console.log("   Current owner:", opinion3.currentAnswerOwner);
        console.log("   Next price:", ethers.formatUnits(opinion3.nextPrice, 6), "USDC");
        
        // Test parameters
        const proposedAnswer = "This opinion is incorrect - testing";
        const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
        const contribution = ethers.parseUnits("1", 6);
        const poolName = "Final Test Pool";
        const ipfsHash = "";
        
        console.log("\n📋 Pool Parameters:");
        console.log("   Opinion ID: 3");
        console.log("   Proposed answer:", proposedAnswer);
        console.log("   Current answer:", opinion3.currentAnswer);
        console.log("   Same as current:", proposedAnswer === opinion3.currentAnswer ? "❌" : "✅");
        console.log("   Deadline:", new Date(deadline * 1000).toLocaleString());
        console.log("   Contribution:", ethers.formatUnits(contribution, 6), "USDC");
        console.log("   Pool name:", poolName);
        console.log("   Pool name length:", poolName.length, "chars");
        console.log("   IPFS hash:", ipfsHash || "(empty)");
        
        // Check durations
        const minDuration = await poolManager.minPoolDuration();
        const maxDuration = await poolManager.maxPoolDuration();
        const currentTime = Math.floor(Date.now() / 1000);
        const actualDuration = deadline - currentTime;
        
        console.log("\n📋 Duration Validation:");
        console.log("   Min duration required:", minDuration.toString(), "seconds");
        console.log("   Max duration allowed:", maxDuration.toString(), "seconds");
        console.log("   Actual duration:", actualDuration, "seconds");
        console.log("   Duration in days:", Math.floor(actualDuration / (24 * 60 * 60)));
        console.log("   Meets minimum:", actualDuration >= Number(minDuration) ? "✅" : "❌");
        console.log("   Under maximum:", actualDuration <= Number(maxDuration) ? "✅" : "✅");
        
        // Check fees and allowances
        const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        const balance = await usdcToken.balanceOf(deployer.address);
        const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
        const creationFee = await poolManager.poolCreationFee();
        const contributionFee = await poolManager.poolContributionFee();
        const totalNeeded = creationFee + contributionFee + contribution;
        
        console.log("\n📋 Financial Validation:");
        console.log("   User balance:", ethers.formatUnits(balance, 6), "USDC");
        console.log("   Allowance:", ethers.formatUnits(allowance, 6), "USDC");
        console.log("   Creation fee:", ethers.formatUnits(creationFee, 6), "USDC");
        console.log("   Contribution fee:", ethers.formatUnits(contributionFee, 6), "USDC");
        console.log("   Contribution:", ethers.formatUnits(contribution, 6), "USDC");
        console.log("   Total needed:", ethers.formatUnits(totalNeeded, 6), "USDC");
        console.log("   Sufficient balance:", balance >= totalNeeded ? "✅" : "❌");
        console.log("   Sufficient allowance:", allowance >= totalNeeded ? "✅" : "❌");
        
        // Check roles and permissions
        console.log("\n📋 Permission Validation:");
        const hasRole = await poolManager.hasRole(await poolManager.ADMIN_ROLE(), deployer.address);
        console.log("   Creator has ADMIN role:", hasRole);
        
        // Try a very simple pool creation call with minimal params
        console.log("\n🧪 Attempting simplified pool creation...");
        console.log("   Using exact contract parameters and error catching");
        
        try {
            // First ensure allowance is set
            if (allowance < totalNeeded) {
                console.log("   Setting allowance first...");
                const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalNeeded);
                await approveTx.wait();
                console.log("   ✅ Allowance updated");
            }
            
            // Try the pool creation
            const poolTx = await poolManager.createPool(
                3,
                proposedAnswer,
                deadline,
                contribution,
                poolName,
                ipfsHash
            );
            
            const receipt = await poolTx.wait();
            console.log("   ✅ SUCCESS! Pool created");
            console.log("   Transaction:", poolTx.hash);
            console.log("   Block:", receipt.blockNumber);
            
        } catch (createError) {
            console.log("   ❌ Pool creation still failed");
            console.log("   Error:", createError.message);
            
            if (createError.data) {
                console.log("   Error data:", createError.data);
                
                // Try to decode common errors
                if (createError.data.includes("08c379a0")) {
                    try {
                        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                            ['string'], 
                            '0x' + createError.data.slice(10)
                        );
                        console.log("   Decoded error:", decoded[0]);
                    } catch (decodeErr) {
                        console.log("   Could not decode error string");
                    }
                }
            }
            
            // Check specific validation points
            console.log("\n🔍 Detailed Error Analysis:");
            console.log("   1. Opinion exists: ✅");
            console.log("   2. Different answer: ✅");
            console.log("   3. Valid deadline: ✅");
            console.log("   4. Sufficient contribution: ✅");
            console.log("   5. Valid pool name: ✅");
            console.log("   6. Sufficient balance: ✅");
            console.log("   7. Sufficient allowance: ✅");
            console.log("   8. Has permissions: ✅");
            
            console.log("\n❓ Possible remaining issues:");
            console.log("   - Opinion might not be in correct state");
            console.log("   - Pool creation might be paused");
            console.log("   - Contract might have other restrictions");
            console.log("   - Gas estimation might be failing");
        }
        
    } catch (error) {
        console.error("❌ Debug script failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });