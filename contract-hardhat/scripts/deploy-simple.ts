import { ethers, upgrades } from "hardhat";

async function main() {
    const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy simple contract
    const SimpleOpinionMarket = await ethers.getContractFactory("SimpleOpinionMarket");
    const contract = await upgrades.deployProxy(SimpleOpinionMarket, [
        USDC_BASE_SEPOLIA,
        deployer.address  // treasury
    ], {
        initializer: 'initialize',
        kind: 'uups'
    });

    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log("✅ SimpleOpinionMarket deployed to:", address);
    
    // Check contract size
    const code = await ethers.provider.getCode(address);
    const sizeKB = ((code.length - 2) / 2 / 1024).toFixed(2);
    console.log("📏 Contract size:", sizeKB, "KB");
    
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Final balance:", ethers.formatEther(finalBalance), "ETH");
    
    console.log("\n🎉 Simple deployment complete!");
    console.log("📝 Contract does: opinions, answers, pools, fees");
    console.log("🚫 No analytics, monitoring, or complex features");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });