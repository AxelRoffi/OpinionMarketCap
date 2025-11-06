const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * Transfers admin control from single wallet to multisig
 * This is a CRITICAL operation that secures the protocol
 */
async function transferAdminToMultisig() {
    console.log("🔄 Transferring Admin Control to Multisig...");
    
    // ===== CONFIGURATION =====
    // Load multisig address from deployment file
    let multisigAddress;
    try {
        const deploymentData = JSON.parse(fs.readFileSync('multisig-deployment.json', 'utf8'));
        multisigAddress = deploymentData.safeAddress;
        console.log(`📍 Multisig address loaded: ${multisigAddress}`);
    } catch (error) {
        console.error("❌ ERROR: Could not load multisig deployment file");
        console.error("   Run deploy-multisig.js first to create the multisig");
        process.exit(1);
    }
    
    // Load deployed contract addresses
    let opinionCoreAddress;
    try {
        const addressData = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));
        opinionCoreAddress = addressData.OpinionCore;
        if (!opinionCoreAddress) {
            throw new Error("OpinionCore address not found");
        }
        console.log(`📍 OpinionCore address: ${opinionCoreAddress}`);
    } catch (error) {
        console.error("❌ ERROR: Could not load OpinionCore address");
        console.error("   Ensure deployed-addresses.json exists with OpinionCore address");
        process.exit(1);
    }
    
    // ===== VALIDATION =====
    console.log("\n📋 Validating setup...");
    
    // Validate addresses
    if (!ethers.utils.isAddress(multisigAddress)) {
        console.error(`❌ Invalid multisig address: ${multisigAddress}`);
        process.exit(1);
    }
    
    if (!ethers.utils.isAddress(opinionCoreAddress)) {
        console.error(`❌ Invalid OpinionCore address: ${opinionCoreAddress}`);
        process.exit(1);
    }
    
    // Get current signer (should be current admin)
    const [currentAdmin] = await ethers.getSigners();
    console.log(`🔑 Current admin: ${currentAdmin.address}`);
    
    // ===== CONTRACT SETUP =====
    const opinionCore = await ethers.getContractAt("OpinionCore", opinionCoreAddress);
    
    // Get role constants
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await opinionCore.DEFAULT_ADMIN_ROLE();
    
    console.log(`📋 ADMIN_ROLE: ${ADMIN_ROLE}`);
    console.log(`📋 DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);
    
    // ===== VERIFICATION =====
    console.log("\n🔍 Current admin status...");
    
    // Check current admin has required roles
    const hasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, currentAdmin.address);
    const hasDefaultAdminRole = await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, currentAdmin.address);
    
    console.log(`Current admin has ADMIN_ROLE: ${hasAdminRole}`);
    console.log(`Current admin has DEFAULT_ADMIN_ROLE: ${hasDefaultAdminRole}`);
    
    if (!hasAdminRole || !hasDefaultAdminRole) {
        console.error("❌ ERROR: Current signer does not have required admin roles");
        console.error("   Ensure you're using the wallet that deployed the contracts");
        process.exit(1);
    }
    
    // Check multisig doesn't already have roles
    const multisigHasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, multisigAddress);
    const multisigHasDefaultAdminRole = await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, multisigAddress);
    
    console.log(`Multisig has ADMIN_ROLE: ${multisigHasAdminRole}`);
    console.log(`Multisig has DEFAULT_ADMIN_ROLE: ${multisigHasDefaultAdminRole}`);
    
    // ===== CONFIRMATION =====
    console.log("\n⚠️  CRITICAL OPERATION WARNING ⚠️");
    console.log("This operation will transfer admin control from your wallet to the multisig.");
    console.log("After this operation, you will need 2-of-3 signatures for admin functions.");
    console.log("");
    console.log(`From: ${currentAdmin.address} (single wallet)`);
    console.log(`To:   ${multisigAddress} (2-of-3 multisig)`);
    console.log("");
    console.log("🚨 Make sure you have:");
    console.log("   ✅ Tested the multisig with a simple transaction");
    console.log("   ✅ Access to at least 2 of the 3 multisig wallets");
    console.log("   ✅ Verified the multisig address is correct");
    console.log("");
    
    // In production, you might want to add a manual confirmation step
    // For automation, we'll proceed with a delay to allow cancellation
    console.log("⏳ Proceeding in 10 seconds... (Ctrl+C to cancel)");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // ===== TRANSFER ADMIN ROLES =====
    try {
        console.log("\n🔄 Step 1: Granting admin roles to multisig...");
        
        // Grant ADMIN_ROLE to multisig
        if (!multisigHasAdminRole) {
            console.log("📝 Granting ADMIN_ROLE to multisig...");
            const tx1 = await opinionCore.grantRole(ADMIN_ROLE, multisigAddress);
            console.log(`⏳ Transaction hash: ${tx1.hash}`);
            await tx1.wait();
            console.log("✅ ADMIN_ROLE granted to multisig");
        } else {
            console.log("✅ Multisig already has ADMIN_ROLE");
        }
        
        // Grant DEFAULT_ADMIN_ROLE to multisig
        if (!multisigHasDefaultAdminRole) {
            console.log("📝 Granting DEFAULT_ADMIN_ROLE to multisig...");
            const tx2 = await opinionCore.grantRole(DEFAULT_ADMIN_ROLE, multisigAddress);
            console.log(`⏳ Transaction hash: ${tx2.hash}`);
            await tx2.wait();
            console.log("✅ DEFAULT_ADMIN_ROLE granted to multisig");
        } else {
            console.log("✅ Multisig already has DEFAULT_ADMIN_ROLE");
        }
        
        // ===== VERIFICATION STEP =====
        console.log("\n🔍 Verifying multisig has admin roles...");
        
        const finalMultisigAdminRole = await opinionCore.hasRole(ADMIN_ROLE, multisigAddress);
        const finalMultisigDefaultAdminRole = await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, multisigAddress);
        
        if (!finalMultisigAdminRole || !finalMultisigDefaultAdminRole) {
            throw new Error("Failed to grant roles to multisig");
        }
        
        console.log("✅ Multisig role verification successful");
        
        // ===== REMOVE SINGLE WALLET ADMIN =====
        console.log("\n🔄 Step 2: Removing admin roles from single wallet...");
        
        // CRITICAL: This removes your single-wallet admin access
        console.log("⚠️  Removing single wallet admin access...");
        console.log("   After this, only the multisig can perform admin operations!");
        
        // Remove ADMIN_ROLE from current admin
        const tx3 = await opinionCore.revokeRole(ADMIN_ROLE, currentAdmin.address);
        console.log(`⏳ Revoking ADMIN_ROLE: ${tx3.hash}`);
        await tx3.wait();
        console.log("✅ ADMIN_ROLE revoked from single wallet");
        
        // Remove DEFAULT_ADMIN_ROLE from current admin
        const tx4 = await opinionCore.revokeRole(DEFAULT_ADMIN_ROLE, currentAdmin.address);
        console.log(`⏳ Revoking DEFAULT_ADMIN_ROLE: ${tx4.hash}`);
        await tx4.wait();
        console.log("✅ DEFAULT_ADMIN_ROLE revoked from single wallet");
        
        // ===== FINAL VERIFICATION =====
        console.log("\n🔍 Final verification...");
        
        const finalCurrentAdminRole = await opinionCore.hasRole(ADMIN_ROLE, currentAdmin.address);
        const finalCurrentDefaultAdminRole = await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, currentAdmin.address);
        
        console.log(`Single wallet has ADMIN_ROLE: ${finalCurrentAdminRole}`);
        console.log(`Single wallet has DEFAULT_ADMIN_ROLE: ${finalCurrentDefaultAdminRole}`);
        console.log(`Multisig has ADMIN_ROLE: ${await opinionCore.hasRole(ADMIN_ROLE, multisigAddress)}`);
        console.log(`Multisig has DEFAULT_ADMIN_ROLE: ${await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, multisigAddress)}`);
        
        if (finalCurrentAdminRole || finalCurrentDefaultAdminRole) {
            console.warn("⚠️  WARNING: Single wallet still has admin roles");
        }
        
        // ===== SUCCESS SUMMARY =====
        console.log("\n🎉 ADMIN TRANSFER COMPLETED SUCCESSFULLY!");
        console.log("═══════════════════════════════════════");
        console.log(`✅ Admin control transferred to: ${multisigAddress}`);
        console.log(`✅ Single wallet admin removed: ${currentAdmin.address}`);
        console.log("✅ Protocol is now secured with 2-of-3 multisig");
        console.log("");
        console.log("🔒 SECURITY UPGRADE COMPLETE:");
        console.log("   • All admin functions now require 2-of-3 signatures");
        console.log("   • Treasury operations protected by multisig");
        console.log("   • Parameter changes require multisig approval");
        console.log("   • Emergency functions available through multisig");
        console.log("");
        console.log("🎯 NEXT STEPS:");
        console.log("1. 🌐 Visit Safe UI:", `https://app.safe.global/sep:${multisigAddress}/home`);
        console.log("2. 🧪 Test admin operation through multisig");
        console.log("3. 📋 Update documentation with new admin process");
        console.log("4. 🔔 Announce security upgrade to community");
        
        // ===== SAVE TRANSFER INFO =====
        const transferInfo = {
            timestamp: new Date().toISOString(),
            network: (await ethers.provider.getNetwork()).name,
            opinionCoreAddress: opinionCoreAddress,
            multisigAddress: multisigAddress,
            previousAdmin: currentAdmin.address,
            transferTxHashes: [tx1.hash, tx2.hash, tx3.hash, tx4.hash],
            safeUIUrl: `https://app.safe.global/sep:${multisigAddress}/home`,
            status: "completed"
        };
        
        fs.writeFileSync('admin-transfer.json', JSON.stringify(transferInfo, null, 2));
        console.log("📁 Transfer info saved to: admin-transfer.json");
        
        return {
            success: true,
            multisigAddress,
            transferInfo
        };
        
    } catch (error) {
        console.error("\n❌ ADMIN TRANSFER FAILED:", error.message);
        
        // Provide recovery instructions
        console.log("\n🔧 RECOVERY OPTIONS:");
        console.log("1. 🔄 Retry the transfer operation");
        console.log("2. 🧪 Test multisig functionality first");
        console.log("3. 🆘 If stuck, current wallet may still have some admin access");
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for module usage
module.exports = transferAdminToMultisig;

// Run directly if called from command line
if (require.main === module) {
    transferAdminToMultisig()
        .then((result) => {
            if (result.success) {
                console.log("\n🚀 Admin transfer completed! Protocol is now secured with multisig.");
                process.exit(0);
            } else {
                console.log("\n💥 Admin transfer failed!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("💥 Unexpected error:", error);
            process.exit(1);
        });
}