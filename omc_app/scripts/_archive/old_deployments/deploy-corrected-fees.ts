import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying FixedOpinionMarket with CORRECTED FEE STRUCTURE");
    console.log("✅ Platform Fee: 2% (was 5%)");
    console.log("✅ Creator Fee: 3% (was 5%)");
    console.log("✅ Owner Amount: 95% (was 90%)");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = deployer.address;
    
    // Deploy FixedOpinionMarket with corrected fees
    console.log("📦 Deploying FixedOpinionMarket with corrected fee structure...");
    const FixedOpinionMarketFactory = await ethers.getContractFactory("FixedOpinionMarket");
    const contract = await FixedOpinionMarketFactory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log("✅ Contract deployed to:", contractAddress);
    
    // Initialize the contract
    console.log("🔧 Initializing contract...");
    const initTx = await contract.initialize(USDC_ADDRESS, TREASURY_ADDRESS);
    await initTx.wait();
    console.log("✅ Contract initialized");
    
    // Get contract size
    const deployedCode = await ethers.provider.getCode(contractAddress);
    const sizeKB = (deployedCode.length / 2 / 1024).toFixed(2);
    console.log("📏 Contract size:", sizeKB, "KB");
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("📋 Contract Details:");
    console.log("   - Address:", contractAddress);
    console.log("   - Size:", sizeKB, "KB");
    console.log("   - USDC:", USDC_ADDRESS);
    console.log("   - Treasury:", TREASURY_ADDRESS);
    
    console.log("\n💰 CORRECTED Fee Structure:");
    console.log("   - Platform Fee: 2%");
    console.log("   - Creator Fee: 3%");
    console.log("   - Owner Amount: 95%");
    
    console.log("\n🔗 Verify on BaseScan:");
    console.log(`   https://sepolia.basescan.org/address/${contractAddress}`);
    
    console.log("\n⚠️  IMPORTANT:");
    console.log("   This contract has the CORRECT fee structure as specified!");
    console.log("   Previous contract (0x74D301e0623608C9CE44390C1654D5340c8eCa1C) had wrong fees.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });