// Check who actually has admin rights
const { ethers } = require("hardhat");

async function checkAdminRights() {
    const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    
    // Different admin addresses found in configs
    const ADMIN_ADDRESSES = [
        "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1", // From final-deployment-summary
        "0xd903412900e87D71BF3A420cc57757E86326B1C8", // From other configs
    ];
    
    console.log("🔍 CHECKING ADMIN RIGHTS");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    console.log(`Current signer: ${signer.address}`);
    
    const coreABI = [
        "function hasRole(bytes32,address) view returns (bool)",
        "function ADMIN_ROLE() view returns (bytes32)",
        "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
        "function getRoleMemberCount(bytes32) view returns (uint256)",
        "function getRoleMember(bytes32,uint256) view returns (address)"
    ];
    
    try {
        const core = new ethers.Contract(OPINION_CORE, coreABI, signer);
        
        const ADMIN_ROLE = await core.ADMIN_ROLE();
        const DEFAULT_ADMIN_ROLE = await core.DEFAULT_ADMIN_ROLE();
        
        console.log(`\n🔷 Role Definitions:`);
        console.log(`   ADMIN_ROLE: ${ADMIN_ROLE}`);
        console.log(`   DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);
        
        // Check current signer
        console.log(`\n🔷 Current Signer Rights:`);
        const signerHasAdmin = await core.hasRole(ADMIN_ROLE, signer.address);
        const signerHasDefaultAdmin = await core.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        
        console.log(`   Has ADMIN_ROLE: ${signerHasAdmin ? '✅' : '❌'}`);
        console.log(`   Has DEFAULT_ADMIN_ROLE: ${signerHasDefaultAdmin ? '✅' : '❌'}`);
        
        if (signerHasAdmin || signerHasDefaultAdmin) {
            console.log(`\n🎉 GREAT NEWS: You have admin access!`);
            console.log(`   You can manage the contract with your current wallet.`);
        }
        
        // Check configured admin addresses
        console.log(`\n🔷 Configured Admin Addresses:`);
        for (const addr of ADMIN_ADDRESSES) {
            try {
                // Fix checksum
                const properAddr = ethers.getAddress(addr.toLowerCase());
                
                const hasAdmin = await core.hasRole(ADMIN_ROLE, properAddr);
                const hasDefaultAdmin = await core.hasRole(DEFAULT_ADMIN_ROLE, properAddr);
                
                console.log(`   ${properAddr}:`);
                console.log(`     ADMIN_ROLE: ${hasAdmin ? '✅' : '❌'}`);
                console.log(`     DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? '✅' : '❌'}`);
                
                if (hasAdmin || hasDefaultAdmin) {
                    // Check if it's a contract or EOA
                    const code = await ethers.provider.getCode(properAddr);
                    const isContract = code !== "0x";
                    console.log(`     Type: ${isContract ? 'Contract (Safe?)' : 'EOA'}`);
                    
                    if (!isContract) {
                        console.log(`     🚨 This is an EOA - you need its private key!`);
                    }
                }
                
            } catch (e) {
                console.log(`   ${addr}: ❌ Invalid address`);
            }
        }
        
        // List all admin role members
        console.log(`\n🔷 All ADMIN_ROLE Members:`);
        try {
            const adminCount = await core.getRoleMemberCount(ADMIN_ROLE);
            console.log(`   Total admins: ${adminCount}`);
            
            for (let i = 0; i < adminCount; i++) {
                const admin = await core.getRoleMember(ADMIN_ROLE, i);
                console.log(`     ${i + 1}. ${admin}`);
                
                if (admin.toLowerCase() === signer.address.toLowerCase()) {
                    console.log(`        ✅ This is you!`);
                }
            }
        } catch (e) {
            console.log(`   Could not enumerate admins: ${e.message}`);
        }
        
        console.log(`\n🔷 All DEFAULT_ADMIN_ROLE Members:`);
        try {
            const defaultAdminCount = await core.getRoleMemberCount(DEFAULT_ADMIN_ROLE);
            console.log(`   Total default admins: ${defaultAdminCount}`);
            
            for (let i = 0; i < defaultAdminCount; i++) {
                const admin = await core.getRoleMember(DEFAULT_ADMIN_ROLE, i);
                console.log(`     ${i + 1}. ${admin}`);
                
                if (admin.toLowerCase() === signer.address.toLowerCase()) {
                    console.log(`        ✅ This is you!`);
                }
            }
        } catch (e) {
            console.log(`   Could not enumerate default admins: ${e.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

checkAdminRights().catch(console.error);