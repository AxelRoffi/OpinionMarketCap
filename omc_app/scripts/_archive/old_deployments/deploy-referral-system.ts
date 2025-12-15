import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying OpinionMarketCap Referral System...");
  
  // Get deployment addresses
  const deployedAddressesPath = path.join(__dirname, '..', 'deployed-addresses.json');
  let deployedAddresses: any = {};
  
  if (fs.existsSync(deployedAddressesPath)) {
    deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
  }

  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // ═══════════════════════════════════════════════════════════════
  // 1. Deploy ReferralManager
  // ═══════════════════════════════════════════════════════════════

  console.log("\n📄 Deploying ReferralManager...");
  
  const ReferralManager = await ethers.getContractFactory("ReferralManager");
  const referralManager = await upgrades.deployProxy(
    ReferralManager,
    [deployer.address], // admin
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  
  await referralManager.waitForDeployment();
  const referralManagerAddress = await referralManager.getAddress();
  
  console.log("✅ ReferralManager deployed to:", referralManagerAddress);

  // ═══════════════════════════════════════════════════════════════
  // 2. Deploy OpinionCoreWithReferrals (if needed)
  // ═══════════════════════════════════════════════════════════════

  console.log("\n📄 Deploying OpinionCoreWithReferrals...");
  
  const OpinionCoreWithReferrals = await ethers.getContractFactory("OpinionCoreWithReferrals");
  const opinionCoreWithReferrals = await upgrades.deployProxy(
    OpinionCoreWithReferrals,
    [
      deployedAddresses.usdcAddress || "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
      deployedAddresses.feeManagerAddress || "0xc8f879d86266C334eb9699963ca0703aa1189d8F", // FeeManager
      deployedAddresses.poolManagerAddress || "0x3B4584e690109484059D95d7904dD9fEbA246612", // PoolManager
      deployedAddresses.treasuryAddress || deployer.address // Treasury
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  
  await opinionCoreWithReferrals.waitForDeployment();
  const opinionCoreWithReferralsAddress = await opinionCoreWithReferrals.getAddress();
  
  console.log("✅ OpinionCoreWithReferrals deployed to:", opinionCoreWithReferralsAddress);

  // ═══════════════════════════════════════════════════════════════
  // 3. Configure Referral System
  // ═══════════════════════════════════════════════════════════════

  console.log("\n⚙️  Configuring referral system...");

  // Grant OPINION_CONTRACT_ROLE to OpinionCoreWithReferrals
  console.log("📝 Granting OPINION_CONTRACT_ROLE...");
  const grantRoleTx = await referralManager.grantOpinionContractRole(opinionCoreWithReferralsAddress);
  await grantRoleTx.wait();
  console.log("✅ Role granted successfully");

  // Set ReferralManager in OpinionCoreWithReferrals
  console.log("📝 Setting ReferralManager address...");
  const setReferralManagerTx = await opinionCoreWithReferrals.setReferralManager(referralManagerAddress);
  await setReferralManagerTx.wait();
  console.log("✅ ReferralManager address set successfully");

  // Enable public creation
  console.log("📝 Enabling public creation...");
  const togglePublicCreationTx = await opinionCoreWithReferrals.togglePublicCreation();
  await togglePublicCreationTx.wait();
  console.log("✅ Public creation enabled");

  // ═══════════════════════════════════════════════════════════════
  // 4. Save Deployment Addresses
  // ═══════════════════════════════════════════════════════════════

  const newAddresses = {
    ...deployedAddresses,
    referralManager: referralManagerAddress,
    opinionCoreWithReferrals: opinionCoreWithReferralsAddress,
    lastReferralDeployment: new Date().toISOString()
  };

  fs.writeFileSync(deployedAddressesPath, JSON.stringify(newAddresses, null, 2));
  console.log("📄 Deployment addresses saved to:", deployedAddressesPath);

  // ═══════════════════════════════════════════════════════════════
  // 5. Verification Instructions
  // ═══════════════════════════════════════════════════════════════

  console.log("\n🎯 Deployment Summary:");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`📋 Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`🔗 ReferralManager: ${referralManagerAddress}`);
  console.log(`🔗 OpinionCoreWithReferrals: ${opinionCoreWithReferralsAddress}`);
  console.log("═══════════════════════════════════════════════════════════════");

  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on Basescan:");
  console.log(`   npx hardhat verify --network baseSepolia ${referralManagerAddress}`);
  console.log(`   npx hardhat verify --network baseSepolia ${opinionCoreWithReferralsAddress}`);
  console.log("\n2. Update frontend contracts.ts with new addresses");
  console.log("3. Update OpinionMarket contract to use OpinionCoreWithReferrals");
  console.log("4. Test referral system functionality");

  console.log("\n🎉 Referral System Deployment Complete!");
  
  // ═══════════════════════════════════════════════════════════════
  // 6. Test Deployment
  // ═══════════════════════════════════════════════════════════════

  console.log("\n🧪 Testing deployment...");
  
  try {
    // Test referral code generation
    console.log("📝 Testing referral code generation...");
    const generateCodeTx = await referralManager.generateReferralCode(deployer.address);
    await generateCodeTx.wait();
    
    // Check referral stats
    const stats = await referralManager.getReferralStats(deployer.address);
    console.log(`✅ Generated referral code: ${stats[3].toString()}`);
    
    // Test free mints check
    const freeMints = await referralManager.getAvailableFreeMints(deployer.address);
    console.log(`✅ Available free mints: ${freeMints.toString()}`);
    
    console.log("✅ All tests passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });