import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Diagnosing Contract Issues...");
    
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const [deployer] = await ethers.getSigners();
    
    console.log("Testing with account:", deployer.address);

    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    
    try {
        console.log("🧪 Testing Basic Contract Functions:");
        
        // 1. Check if contract is paused
        try {
            const isPaused = await opinionCore.paused();
            console.log("⏸️ Contract Paused:", isPaused);
        } catch (e) {
            console.log("⚠️ Could not check paused status");
        }
        
        // 2. Check public creation status
        const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
        console.log("🌍 Public Creation Enabled:", isPublicEnabled);
        
        // 3. Check next opinion ID
        const nextOpinionId = await opinionCore.nextOpinionId();
        console.log("🆔 Next Opinion ID:", nextOpinionId.toString());
        
        // 4. Check fee manager address
        try {
            const feeManager = await opinionCore.feeManager();
            console.log("💰 Fee Manager:", feeManager);
            
            // Check if fee manager has code
            const feeManagerCode = await ethers.provider.getCode(feeManager);
            if (feeManagerCode === "0x") {
                console.log("❌ Fee Manager has no code!");
            } else {
                console.log("✅ Fee Manager has code");
            }
        } catch (e) {
            console.log("❌ Could not get fee manager address");
        }
        
        // 5. Check pool manager address
        try {
            const poolManager = await opinionCore.poolManager();
            console.log("🏊 Pool Manager:", poolManager);
            
            // Check if pool manager has code
            const poolManagerCode = await ethers.provider.getCode(poolManager);
            if (poolManagerCode === "0x") {
                console.log("❌ Pool Manager has no code!");
            } else {
                console.log("✅ Pool Manager has code");
            }
        } catch (e) {
            console.log("❌ Could not get pool manager address");
        }
        
        // 6. Check USDC token address
        try {
            const usdcToken = await opinionCore.usdcToken();
            console.log("💵 USDC Token:", usdcToken);
            
            // Check if USDC has code
            const usdcCode = await ethers.provider.getCode(usdcToken);
            if (usdcCode === "0x") {
                console.log("❌ USDC Token has no code!");
            } else {
                console.log("✅ USDC Token has code");
            }
        } catch (e) {
            console.log("❌ Could not get USDC token address");
        }
        
        // 7. Check treasury address
        try {
            const treasury = await opinionCore.treasury();
            console.log("🏦 Treasury:", treasury);
        } catch (e) {
            console.log("❌ Could not get treasury address");
        }
        
        // 8. Test simple view functions
        console.log("\n🔍 Testing View Functions:");
        
        try {
            const categories = await opinionCore.getAvailableCategories();
            console.log("✅ Categories:", categories.slice(0, 3).join(", ") + "...");
        } catch (e) {
            console.log("❌ Could not get categories");
        }
        
        try {
            const minPrice = await opinionCore.MIN_INITIAL_PRICE();
            const maxPrice = await opinionCore.MAX_INITIAL_PRICE();
            console.log(`✅ Price Range: ${ethers.formatUnits(minPrice, 6)} - ${ethers.formatUnits(maxPrice, 6)} USDC`);
        } catch (e) {
            console.log("❌ Could not get price constants");
        }
        
        // 9. Test if we have the required roles
        console.log("\n🔐 Checking Access Control:");
        
        try {
            const DEFAULT_ADMIN_ROLE = await opinionCore.DEFAULT_ADMIN_ROLE();
            const hasAdminRole = await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
            console.log("👑 Has Admin Role:", hasAdminRole);
            
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const hasCustomAdminRole = await opinionCore.hasRole(ADMIN_ROLE, deployer.address);
            console.log("🔑 Has Custom Admin Role:", hasCustomAdminRole);
        } catch (e) {
            console.log("❌ Could not check roles");
        }
        
        // 10. Test simple opinion creation with minimal parameters
        console.log("\n🧪 Testing Simple Opinion Creation:");
        
        try {
            // Use createOpinion instead of createOpinionWithExtras
            await opinionCore.createOpinion.staticCall(
                "Test question?",
                ethers.parseUnits("1", 6),
                "Test answer",
                ["Crypto"]
            );
            console.log("✅ Simple opinion creation simulation passed");
        } catch (error: any) {
            console.log("❌ Simple opinion creation failed:");
            console.log("Error:", error.message);
            
            if (error.data) {
                console.log("Error data:", error.data);
            }
        }
        
    } catch (error: any) {
        console.error("❌ Major Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });