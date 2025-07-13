import { ethers, upgrades } from "hardhat";

async function main() {
    console.log("🚀 Deploying OpinionCore with REAL Base Sepolia USDC...");
    
    // Real Base Sepolia USDC address
    const REAL_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    // Your specified treasury address
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy libraries first
    console.log("📚 Deploying libraries...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    console.log("PriceCalculator deployed to:", priceCalculatorAddress);

    // Deploy OpinionCore with real USDC
    console.log("🏗️ Deploying OpinionCore...");
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
        libraries: {
            PriceCalculator: priceCalculatorAddress,
        },
    });

    // For now, use deployer address as mock addresses for the managers
    const mockFeeManagerAddress = deployer.address;
    const mockPoolManagerAddress = deployer.address;

    const opinionCore = await upgrades.deployProxy(OpinionCore, [
        REAL_USDC_ADDRESS,      // Real USDC address
        mockFeeManagerAddress,  // Mock FeeManager address
        mockPoolManagerAddress, // Mock PoolManager address  
        TREASURY_ADDRESS        // Your treasury address
    ], {
        initializer: "initialize",
        unsafeAllow: ["external-library-linking"]
    });

    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    
    console.log("✅ OpinionCore deployed to:", opinionCoreAddress);
    console.log("💰 Using REAL USDC address:", REAL_USDC_ADDRESS);
    console.log("🏦 Using Treasury address:", TREASURY_ADDRESS);
    
    // Verify USDC token is set correctly
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

    // Enable public creation for testing
    console.log("⚙️ Enabling public opinion creation...");
    await opinionCore.togglePublicCreation();
    console.log("✅ Public creation enabled");

    // Check categories
    const availableCategories = await opinionCore.getAvailableCategories();
    console.log("📋 Available categories:", availableCategories);

    // Verify contract settings
    console.log("\n🔍 Verifying contract settings...");
    const minPrice = await opinionCore.MIN_INITIAL_PRICE();
    const maxPrice = await opinionCore.MAX_INITIAL_PRICE();
    const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
    console.log(`✅ MIN_INITIAL_PRICE: ${Number(minPrice) / 1_000_000} USDC`);
    console.log(`✅ MAX_INITIAL_PRICE: ${Number(maxPrice) / 1_000_000} USDC`);  
    console.log(`✅ Public creation enabled: ${isPublicEnabled}`);

    // Save addresses
    const addresses = {
        opinionCore: opinionCoreAddress,
        priceCalculatorLibrary: priceCalculatorAddress,
        usdcToken: REAL_USDC_ADDRESS,
        treasury: TREASURY_ADDRESS,
        deployer: deployer.address,
        mockFeeManager: mockFeeManagerAddress,
        mockPoolManager: mockPoolManagerAddress
    };

    console.log("\n📋 Deployment Summary:");
    console.log(JSON.stringify(addresses, null, 2));
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('./deployed-addresses-real-usdc.json', JSON.stringify(addresses, null, 2));
    console.log("📄 Contract addresses saved to deployed-addresses-real-usdc.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });