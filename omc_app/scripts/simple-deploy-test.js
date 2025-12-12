// Simple deployment test - bypass hardhat complexity
console.log("🧪 Simple Deployment Test Starting...");

async function simpleTest() {
  try {
    console.log("1. Loading hardhat...");
    const hre = require("hardhat");
    const { ethers } = hre;
    
    console.log("2. Getting network info...");
    const network = await ethers.provider.getNetwork();
    console.log("   Network:", network.name, "ChainId:", network.chainId);
    
    console.log("3. Getting signer...");
    const [signer] = await ethers.getSigners();
    console.log("   Signer:", signer.address);
    
    console.log("4. Checking balance...");
    const balance = await ethers.provider.getBalance(signer.address);
    console.log("   Balance:", ethers.formatEther(balance), "ETH");
    
    console.log("✅ All basic checks passed!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

simpleTest();