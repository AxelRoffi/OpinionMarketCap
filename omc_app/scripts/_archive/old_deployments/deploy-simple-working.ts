import { ethers, upgrades } from "hardhat";

async function main() {
    console.log("🚀 Deploying Working SimpleOpinionMarket...");
    
    // Configuration
    const REAL_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy SimpleOpinionMarket (no external dependencies)
    console.log("🏗️ Deploying SimpleOpinionMarket...");
    const SimpleOpinionMarket = await ethers.getContractFactory("SimpleOpinionMarket");

    const simpleOpinionMarket = await upgrades.deployProxy(SimpleOpinionMarket, [
        REAL_USDC_ADDRESS,  // USDC token
        TREASURY_ADDRESS    // Treasury
    ], {
        initializer: "initialize",
        kind: "uups"
    });

    await simpleOpinionMarket.waitForDeployment();
    const contractAddress = await simpleOpinionMarket.getAddress();
    
    console.log("✅ SimpleOpinionMarket deployed to:", contractAddress);
    console.log("💰 Using REAL USDC address:", REAL_USDC_ADDRESS);
    console.log("🏦 Using Treasury address:", TREASURY_ADDRESS);
    
    // Verify configuration
    const usdcTokenAddress = await simpleOpinionMarket.usdcToken();
    const treasuryAddress = await simpleOpinionMarket.treasury();
    const nextOpinionId = await simpleOpinionMarket.nextOpinionId();
    
    console.log("\n🔍 Verification:");
    console.log("✅ USDC token set to:", usdcTokenAddress);
    console.log("✅ Treasury set to:", treasuryAddress);
    console.log("✅ Next opinion ID:", nextOpinionId.toString());
    
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

    // Test basic functionality
    console.log("\n🧪 Testing Basic Functions:");
    
    try {
        const hasAdminRole = await simpleOpinionMarket.hasRole(
            await simpleOpinionMarket.DEFAULT_ADMIN_ROLE(), 
            deployer.address
        );
        console.log("✅ Admin role granted:", hasAdminRole);
    } catch (e) {
        console.log("⚠️ Could not check admin role");
    }

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        usdcToken: REAL_USDC_ADDRESS,
        treasury: TREASURY_ADDRESS,
        deployer: deployer.address,
        network: "baseSepolia",
        deployedAt: new Date().toISOString()
    };

    console.log("\n📋 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('./simple-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to simple-deployment.json");

    console.log("\n🎯 Next Steps:");
    console.log("1. Update frontend to use new contract address:", contractAddress);
    console.log("2. Test opinion creation and answer submission");
    console.log("3. This contract has no external dependencies - should work!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });