import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying CORRECTED FixedOpinionMarket to Base Sepolia...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = deployer.address; // Use deployer as treasury
    
    // Deploy FixedOpinionMarket
    console.log("📦 Deploying FixedOpinionMarket...");
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
    
    // Test the corrected function signature
    console.log("\n🧪 Testing createOpinion function signature...");
    
    // Check function exists with correct parameters
    try {
        const fragment = contract.interface.getFunction("createOpinion");
        console.log("✅ Function signature:", fragment.format());
        console.log("📝 Parameters:", fragment.inputs.map(i => `${i.name}: ${i.type}`).join(", "));
    } catch (error) {
        console.error("❌ Function signature test failed:", error);
    }
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("📋 Contract Details:");
    console.log("   - Address:", contractAddress);
    console.log("   - Size:", sizeKB, "KB");
    console.log("   - USDC:", USDC_ADDRESS);
    console.log("   - Treasury:", TREASURY_ADDRESS);
    
    console.log("\n📝 Function signature fix:");
    console.log("   OLD: createOpinion(question, answer, initialPrice)");
    console.log("   NEW: createOpinion(question, answer, description, initialPrice, categories)");
    
    console.log("\n🔗 Verify on BaseScan:");
    console.log(`   https://sepolia.basescan.org/address/${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });