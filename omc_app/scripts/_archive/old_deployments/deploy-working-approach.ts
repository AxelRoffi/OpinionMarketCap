import { ethers, upgrades } from "hardhat";
import { writeFileSync } from "fs";

/**
 * 🚀 WORKING DEPLOYMENT APPROACH - BASED ON SUCCESSFUL PREVIOUS DEPLOYMENT
 * 
 * This uses the same approach that successfully deployed OpinionCore before:
 * - Deploy PriceCalculator library
 * - Deploy OpinionCore with mock manager addresses
 * - Set up properly
 */

async function main() {
    console.log("🚀 Deploying OpinionCore System - PROVEN WORKING APPROACH");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Configuration (same as successful deployment)
    const REAL_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    console.log("🏦 USDC Contract:", REAL_USDC_ADDRESS);
    console.log("🏛️  Treasury Address:", TREASURY_ADDRESS);
    console.log("");

    // Step 1: Deploy PriceCalculator library (PROVEN WORKING)
    console.log("📚 Step 1: Deploying PriceCalculator library...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    console.log("✅ PriceCalculator deployed to:", priceCalculatorAddress);

    // Step 2: Deploy OpinionCore with mock managers (PROVEN WORKING)
    console.log("🏗️  Step 2: Deploying OpinionCore...");
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
        libraries: {
            PriceCalculator: priceCalculatorAddress,
        },
    });

    // Use deployer address as mock addresses for the managers (PROVEN WORKING APPROACH)
    const mockFeeManagerAddress = deployer.address;
    const mockPoolManagerAddress = deployer.address;

    const opinionCore = await upgrades.deployProxy(OpinionCore, [
        REAL_USDC_ADDRESS,      // Real USDC address
        mockFeeManagerAddress,  // Mock FeeManager address (deployer)
        mockPoolManagerAddress, // Mock PoolManager address (deployer)
        TREASURY_ADDRESS        // Treasury address
    ], {
        initializer: "initialize",
        unsafeAllow: ["external-library-linking"]
    });

    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    
    console.log("✅ OpinionCore deployed to:", opinionCoreAddress);
    console.log("");

    // Step 3: Verify deployment (PROVEN WORKING)
    console.log("🔍 Step 3: Verifying deployment...");
    
    const usdcTokenAddress = await opinionCore.usdcToken();
    const treasuryAddress = await opinionCore.treasury();
    console.log("✅ USDC token set to:", usdcTokenAddress);
    console.log("✅ Treasury set to:", treasuryAddress);
    
    if (usdcTokenAddress === REAL_USDC_ADDRESS) {
        console.log("🎉 SUCCESS: Real USDC address correctly set!");
    } else {
        console.log("❌ ERROR: USDC address mismatch!");
    }

    if (treasuryAddress === TREASURY_ADDRESS) {
        console.log("🎉 SUCCESS: Treasury address correctly set!");
    } else {
        console.log("❌ ERROR: Treasury address mismatch!");
    }

    // Step 4: Enable public creation (PROVEN WORKING)
    console.log("⚙️  Step 4: Enabling public opinion creation...");
    await opinionCore.togglePublicCreation();
    console.log("✅ Public creation enabled");

    // Step 5: Verify categories and settings (PROVEN WORKING)
    console.log("📋 Step 5: Checking categories and settings...");
    const availableCategories = await opinionCore.getAvailableCategories();
    console.log("✅ Available categories:", availableCategories);

    const minPrice = await opinionCore.MIN_INITIAL_PRICE();
    const maxPrice = await opinionCore.MAX_INITIAL_PRICE();
    const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
    console.log(`✅ MIN_INITIAL_PRICE: ${Number(minPrice) / 1_000_000} USDC`);
    console.log(`✅ MAX_INITIAL_PRICE: ${Number(maxPrice) / 1_000_000} USDC`);  
    console.log(`✅ Public creation enabled: ${isPublicEnabled}`);
    console.log("");

    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Step 6: Save deployment info
    const deploymentInfo = {
        network: "baseSepolia",
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            opinionCore: opinionCoreAddress,
            priceCalculatorLibrary: priceCalculatorAddress,
            usdcToken: REAL_USDC_ADDRESS,
            treasury: TREASURY_ADDRESS,
            mockFeeManager: mockFeeManagerAddress,
            mockPoolManager: mockPoolManagerAddress
        },
        features: {
            feeStructure: "20% with 5 USDC minimum",
            publicCreationEnabled: true,
            advancedPricing: true,
            categories: availableCategories,
        },
        usage: {
            frontendShouldUse: opinionCoreAddress,
            contractType: "OpinionCore with PriceCalculator",
        }
    };

    // Save to file
    writeFileSync(
        "./deployed-addresses-new-working.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📁 Deployment info saved to: deployed-addresses-new-working.json");
    console.log("");
    console.log("🎯 FRONTEND CONFIGURATION:");
    console.log("   Main Contract Address:", opinionCoreAddress);
    console.log("   USDC Address:", REAL_USDC_ADDRESS);
    console.log("   Treasury Address:", TREASURY_ADDRESS);
    console.log("");
    console.log("✅ Ready for frontend integration with advanced pricing!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });