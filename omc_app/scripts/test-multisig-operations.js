const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * Tests multisig admin operations to ensure security upgrade worked
 * Verifies that admin functions can only be executed through multisig
 */
async function testMultisigOperations() {
    console.log("🧪 Testing Multisig Admin Operations...");
    
    // ===== LOAD CONFIGURATION =====
    let multisigAddress, opinionCoreAddress;
    
    try {
        const deploymentData = JSON.parse(fs.readFileSync('multisig-deployment.json', 'utf8'));
        multisigAddress = deploymentData.safeAddress;
        
        const addressData = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));
        opinionCoreAddress = addressData.OpinionCore;
        
        console.log(`📍 Multisig: ${multisigAddress}`);
        console.log(`📍 OpinionCore: ${opinionCoreAddress}`);
    } catch (error) {
        console.error("❌ ERROR: Could not load deployment files");
        console.error("   Ensure multisig is deployed and admin transfer is complete");
        process.exit(1);
    }
    
    const opinionCore = await ethers.getContractAt("OpinionCore", opinionCoreAddress);
    const [testWallet] = await ethers.getSigners();
    
    // ===== TEST 1: VERIFY SINGLE WALLET CANNOT EXECUTE ADMIN FUNCTIONS =====
    console.log("\n🔍 Test 1: Verifying single wallet admin access is revoked...");
    
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const hasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, testWallet.address);
    
    console.log(`Test wallet has ADMIN_ROLE: ${hasAdminRole}`);
    
    if (hasAdminRole) {
        console.error("❌ CRITICAL ERROR: Test wallet still has admin role!");
        console.error("   Admin transfer may have failed");
        return { success: false, error: "Admin transfer incomplete" };
    }
    
    // Try to execute an admin function (should fail)
    try {
        console.log("🚫 Attempting admin operation with single wallet (should fail)...");
        await opinionCore.setMinimumPrice(ethers.utils.parseUnits("2", 6));
        console.error("❌ CRITICAL ERROR: Single wallet can still execute admin functions!");
        return { success: false, error: "Single wallet admin access not properly revoked" };
    } catch (error) {
        if (error.message.includes("AccessControlUnauthorizedAccount")) {
            console.log("✅ Single wallet admin access properly revoked");
        } else {
            console.error("❌ Unexpected error:", error.message);
            return { success: false, error: error.message };
        }
    }
    
    // ===== TEST 2: VERIFY MULTISIG HAS ADMIN ROLES =====
    console.log("\n🔍 Test 2: Verifying multisig has admin roles...");
    
    const multisigHasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, multisigAddress);
    const multisigHasDefaultAdminRole = await opinionCore.hasRole(
        await opinionCore.DEFAULT_ADMIN_ROLE(), 
        multisigAddress
    );
    
    console.log(`Multisig has ADMIN_ROLE: ${multisigHasAdminRole}`);
    console.log(`Multisig has DEFAULT_ADMIN_ROLE: ${multisigHasDefaultAdminRole}`);
    
    if (!multisigHasAdminRole || !multisigHasDefaultAdminRole) {
        console.error("❌ CRITICAL ERROR: Multisig does not have required admin roles!");
        return { success: false, error: "Multisig admin roles not properly granted" };
    }
    
    console.log("✅ Multisig admin roles verified");
    
    // ===== TEST 3: GENERATE TRANSACTION DATA FOR MULTISIG TESTING =====
    console.log("\n📝 Test 3: Generating transaction data for multisig operations...");
    
    const testOperations = [
        {
            name: "Set Minimum Price",
            description: "Change minimum opinion price to 1.5 USDC",
            functionName: "setMinimumPrice",
            params: [ethers.utils.parseUnits("1.5", 6)],
            estimatedGas: "50000"
        },
        {
            name: "Set Question Creation Fee", 
            description: "Change question creation fee to 1.2 USDC",
            functionName: "setQuestionCreationFee",
            params: [ethers.utils.parseUnits("1.2", 6)],
            estimatedGas: "50000"
        },
        {
            name: "Toggle Public Creation",
            description: "Enable/disable public opinion creation",
            functionName: "togglePublicCreation",
            params: [],
            estimatedGas: "30000"
        },
        {
            name: "Emergency Pause",
            description: "Pause the protocol for emergency",
            functionName: "pause",
            params: [],
            estimatedGas: "30000"
        }
    ];
    
    const transactionData = [];
    
    for (const operation of testOperations) {
        try {
            const txData = opinionCore.interface.encodeFunctionData(
                operation.functionName,
                operation.params
            );
            
            transactionData.push({
                name: operation.name,
                description: operation.description,
                to: opinionCoreAddress,
                data: txData,
                value: "0",
                estimatedGas: operation.estimatedGas
            });
            
            console.log(`✅ ${operation.name}: Transaction data generated`);
            
        } catch (error) {
            console.error(`❌ ${operation.name}: Failed to generate transaction data`);
            console.error(`   Error: ${error.message}`);
        }
    }
    
    // ===== TEST 4: VERIFY CONTRACT STATE =====
    console.log("\n🔍 Test 4: Checking current contract parameters...");
    
    try {
        const currentMinPrice = await opinionCore.minimumPrice();
        const currentCreationFee = await opinionCore.questionCreationFee();
        const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
        const isPaused = await opinionCore.paused();
        const treasury = await opinionCore.treasury();
        
        console.log(`Current minimum price: ${ethers.utils.formatUnits(currentMinPrice, 6)} USDC`);
        console.log(`Current creation fee: ${ethers.utils.formatUnits(currentCreationFee, 6)} USDC`);
        console.log(`Public creation enabled: ${isPublicEnabled}`);
        console.log(`Contract paused: ${isPaused}`);
        console.log(`Treasury address: ${treasury}`);
        
    } catch (error) {
        console.error("❌ Error reading contract state:", error.message);
    }
    
    // ===== GENERATE MULTISIG TESTING GUIDE =====
    console.log("\n📋 Generating multisig testing guide...");
    
    const testingGuide = {
        multisigAddress: multisigAddress,
        opinionCoreAddress: opinionCoreAddress,
        safeUIUrl: `https://app.safe.global/sep:${multisigAddress}/home`,
        basescanUrl: `https://sepolia.basescan.org/address/${multisigAddress}`,
        transactionData: transactionData,
        testingSteps: [
            {
                step: 1,
                title: "Connect to Safe UI",
                instruction: `Visit ${`https://app.safe.global/sep:${multisigAddress}/home`}`,
                details: "Connect all 3 wallets to the Safe interface"
            },
            {
                step: 2,
                title: "Test Simple Transaction",
                instruction: "Send a small amount of ETH (0.001) to test multisig functionality",
                details: "This verifies basic multisig operation before testing admin functions"
            },
            {
                step: 3,
                title: "Test Admin Parameter Change",
                instruction: "Execute 'Set Minimum Price' transaction",
                details: "Use transaction data provided in the output file"
            },
            {
                step: 4,
                title: "Verify Changes",
                instruction: "Check that parameter changes took effect",
                details: "Confirm new minimum price is applied"
            },
            {
                step: 5,
                title: "Test Emergency Function",
                instruction: "Test emergency pause and unpause",
                details: "Verify emergency functions work through multisig"
            }
        ],
        walletRequirements: {
            threshold: "2 of 3 signatures required",
            signers: "Hot wallet + Hardware wallet (recommended)",
            alternative: "Hot wallet + Backup wallet (if hardware unavailable)"
        }
    };
    
    // Save testing guide to file
    fs.writeFileSync('multisig-testing-guide.json', JSON.stringify(testingGuide, null, 2));
    
    // ===== SUCCESS SUMMARY =====
    console.log("\n✅ MULTISIG TESTING SETUP COMPLETE!");
    console.log("═══════════════════════════════════════");
    console.log("🔐 Admin security verification: PASSED");
    console.log("📝 Transaction data generated: SUCCESS");
    console.log("📋 Testing guide created: SUCCESS");
    console.log("");
    console.log("🎯 MANUAL TESTING REQUIRED:");
    console.log(`1. 🌐 Visit Safe UI: ${testingGuide.safeUIUrl}`);
    console.log("2. 🔗 Connect your 3 wallets");
    console.log("3. 🧪 Execute test transactions (2-of-3 signatures)");
    console.log("4. ✅ Verify admin operations work only through multisig");
    console.log("");
    console.log("📁 Files created:");
    console.log("   • multisig-testing-guide.json (detailed testing instructions)");
    console.log("");
    console.log("⚠️  CRITICAL VERIFICATION:");
    console.log("   • Single wallet admin access: ✅ REVOKED");
    console.log("   • Multisig admin access: ✅ CONFIRMED");
    console.log("   • Protocol security: ✅ UPGRADED");
    
    return {
        success: true,
        multisigAddress,
        testingGuide,
        securityStatus: {
            singleWalletAdminRevoked: true,
            multisigAdminGranted: true,
            transactionDataGenerated: true
        }
    };
}

// Export for module usage
module.exports = testMultisigOperations;

// Run directly if called from command line
if (require.main === module) {
    testMultisigOperations()
        .then((result) => {
            if (result.success) {
                console.log("\n🎉 Multisig operations testing setup completed!");
                console.log("👉 Next: Manual testing required through Safe UI");
                process.exit(0);
            } else {
                console.log("\n💥 Testing setup failed!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("💥 Unexpected error:", error);
            process.exit(1);
        });
}