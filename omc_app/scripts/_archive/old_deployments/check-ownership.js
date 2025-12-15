const { ethers } = require("hardhat");

async function checkOwnership() {
  console.log("🔍 Checking Contract Ownership on Base Mainnet");
  console.log("=" .repeat(50));
  
  const contractAddress = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  const [deployer] = await ethers.getSigners();
  
  console.log(`📋 Contract: ${contractAddress}`);
  console.log(`👤 Your EOA: ${deployer.address}`);
  
  // Connect to contract
  const contract = await ethers.getContractAt("OpinionCoreSimplified", contractAddress);
  
  try {
    // Role constants from the contract
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const MODERATOR_ROLE = await contract.MODERATOR_ROLE();
    
    console.log("\n🔑 Role Definitions:");
    console.log(`DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);
    console.log(`ADMIN_ROLE: ${ADMIN_ROLE}`);
    console.log(`MODERATOR_ROLE: ${MODERATOR_ROLE}`);
    
    // Known addresses to check
    const addressesToCheck = [
      { name: "Your EOA", address: deployer.address },
      { name: "Treasury Safe", address: "0xFb7eF00D5C2a87d282F273632e834f9105795067" },
      { name: "Enhanced Safe", address: "0xAe78a6c716DEA5C1580bca0B05C4A4ca6337C94a" },
    ];
    
    console.log("\n👥 Checking Role Assignments:");
    console.log("-".repeat(80));
    
    for (const addr of addressesToCheck) {
      console.log(`\n${addr.name}: ${addr.address}`);
      
      try {
        const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, addr.address);
        const hasAdmin = await contract.hasRole(ADMIN_ROLE, addr.address);
        const hasModerator = await contract.hasRole(MODERATOR_ROLE, addr.address);
        
        console.log(`  DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? '✅' : '❌'}`);
        console.log(`  ADMIN_ROLE: ${hasAdmin ? '✅' : '❌'}`);
        console.log(`  MODERATOR_ROLE: ${hasModerator ? '✅' : '❌'}`);
        
        if (hasDefaultAdmin || hasAdmin || hasModerator) {
          console.log(`  🎯 ${addr.name} HAS ADMIN ACCESS`);
        }
      } catch (error) {
        console.log(`  ❌ Error checking ${addr.name}: ${error.message}`);
      }
    }
    
    // Check treasury address
    console.log("\n💰 Treasury Configuration:");
    try {
      const treasury = await contract.treasury();
      console.log(`Treasury Address: ${treasury}`);
      
      const pendingTreasury = await contract.pendingTreasury();
      console.log(`Pending Treasury: ${pendingTreasury}`);
      
      if (pendingTreasury !== ethers.ZeroAddress) {
        const changeTimestamp = await contract.treasuryChangeTimestamp();
        const delay = await contract.TREASURY_CHANGE_DELAY();
        console.log(`Treasury Change Timestamp: ${new Date(Number(changeTimestamp) * 1000)}`);
        console.log(`Required Delay: ${Number(delay) / 3600} hours`);
      }
    } catch (error) {
      console.log(`❌ Error checking treasury: ${error.message}`);
    }
    
    // Check contract status
    console.log("\n📊 Contract Status:");
    try {
      const paused = await contract.paused();
      const publicCreationEnabled = await contract.isPublicCreationEnabled();
      const nextOpinionId = await contract.nextOpinionId();
      
      console.log(`Paused: ${paused ? '⏸️' : '▶️'}`);
      console.log(`Public Creation: ${publicCreationEnabled ? '✅' : '❌'}`);
      console.log(`Next Opinion ID: ${nextOpinionId}`);
    } catch (error) {
      console.log(`❌ Error checking status: ${error.message}`);
    }
    
  } catch (error) {
    console.log("❌ Error connecting to contract:", error.message);
  }
}

checkOwnership().catch(console.error);