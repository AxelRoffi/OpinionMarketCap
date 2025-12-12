const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Base Mainnet Connection");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("✅ Balance:", ethers.formatEther(balance), "ETH");
    
    const network = await ethers.provider.getNetwork();
    console.log("✅ Network:", network.name, "Chain ID:", network.chainId);
    
    console.log("🎉 Connection successful!");
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

main().catch(console.error);