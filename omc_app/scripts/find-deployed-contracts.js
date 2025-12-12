const { ethers } = require("hardhat");

async function findDeployedContracts() {
  console.log("🔍 Finding Your Deployed Contracts on Base Mainnet");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();
  console.log("👤 Your deployer address:", deployer.address);
  
  const currentBalance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Current balance:", ethers.formatEther(currentBalance), "ETH");
  
  // Get recent transaction history
  console.log("\n📜 Checking recent transactions...");
  
  try {
    // Get the latest block number
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log("🏗️  Latest block:", latestBlock);
    
    // Check the last few blocks for contract deployments
    console.log("🔎 Looking for contract deployments...");
    
    // Try to find contract creation transactions
    for (let i = 0; i < 20; i++) {
      const block = await ethers.provider.getBlock(latestBlock - i);
      if (!block || !block.transactions) continue;
      
      for (const txHash of block.transactions) {
        const tx = await ethers.provider.getTransaction(txHash);
        if (tx && tx.from === deployer.address && !tx.to) {
          // This is a contract deployment from your address
          const receipt = await ethers.provider.getTransactionReceipt(txHash);
          if (receipt && receipt.contractAddress) {
            console.log(`📝 Contract deployed: ${receipt.contractAddress}`);
            console.log(`   Transaction: ${txHash}`);
            console.log(`   Block: ${receipt.blockNumber}`);
            console.log(`   Gas used: ${receipt.gasUsed}`);
            console.log("");
          }
        }
      }
    }
    
  } catch (error) {
    console.log("⚠️  Could not fetch transaction history:", error.message);
    console.log("💡 You can check your transactions manually at:");
    console.log(`   https://basescan.org/address/${deployer.address}`);
  }
  
  console.log("\n🌐 View all your transactions:");
  console.log(`https://basescan.org/address/${deployer.address}`);
  
  console.log("\n🎯 Ready for Testing!");
  console.log("Once you identify the contract addresses, update your frontend config.");
}

findDeployedContracts().catch(console.error);