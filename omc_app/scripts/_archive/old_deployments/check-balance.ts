import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Account:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Balance (wei):", balance.toString());
    
    // Estimate minimum needed for deployment (from error)
    const needed = ethers.parseEther("0.02"); // Conservative estimate
    console.log("Estimated needed:", ethers.formatEther(needed), "ETH");
    
    if (balance < needed) {
        console.log("❌ Insufficient balance!");
        console.log("Need to add:", ethers.formatEther(needed - balance), "ETH");
        console.log("💡 Get ETH from Base Sepolia faucet:");
        console.log("   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
        console.log("   https://faucet.quicknode.com/base/sepolia");
    } else {
        console.log("✅ Sufficient balance for deployment");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });