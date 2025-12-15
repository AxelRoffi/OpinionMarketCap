import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying OpinionMarketCap Referral System (Simple)...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy simple ReferralManager (non-upgradeable for testing)
  console.log("\n📄 Deploying ReferralManager...");
  
  const ReferralManager = await ethers.getContractFactory("ReferralManager");
  const referralManager = await ReferralManager.deploy();
  await referralManager.waitForDeployment();
  
  const referralManagerAddress = await referralManager.getAddress();
  console.log("✅ ReferralManager deployed to:", referralManagerAddress);
  
  // Initialize it
  console.log("📝 Initializing ReferralManager...");
  const initTx = await referralManager.initialize(deployer.address);
  await initTx.wait();
  console.log("✅ ReferralManager initialized");

  // Test referral code generation
  console.log("\n🧪 Testing referral functionality...");
  const generateCodeTx = await referralManager.generateReferralCode(deployer.address);
  await generateCodeTx.wait();
  
  const stats = await referralManager.getReferralStats(deployer.address);
  console.log(`✅ Generated referral code: ${stats[3].toString()}`);

  // Save addresses
  const deployedAddressesPath = path.join(__dirname, '..', 'deployed-addresses.json');
  let deployedAddresses: any = {};
  
  if (fs.existsSync(deployedAddressesPath)) {
    deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
  }

  deployedAddresses.referralManager = referralManagerAddress;
  deployedAddresses.lastReferralDeployment = new Date().toISOString();

  fs.writeFileSync(deployedAddressesPath, JSON.stringify(deployedAddresses, null, 2));
  
  console.log("\n🎯 Deployment Summary:");
  console.log("═══════════════════════════════════════");
  console.log(`🔗 ReferralManager: ${referralManagerAddress}`);
  console.log("═══════════════════════════════════════");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend contracts.ts with new address");
  console.log("2. Connect frontend referral components");
  console.log("3. Test full referral flow");
  
  console.log("\n🎉 Referral System Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });