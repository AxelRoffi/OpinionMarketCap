import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🚀 Starting Direct TreasurySecureEnhanced Deployment (Without Proxy)");
  console.log("=" .repeat(80));
  
  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.005")) {
      throw new Error("Insufficient ETH balance for deployment");
    }

    // Check network
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 84532n) {
      throw new Error("Not on Base Sepolia network");
    }

    console.log("\n🏗️  Deploying TreasurySecureEnhanced...");
    console.log("-".repeat(50));

    // Deploy TreasurySecureEnhanced directly (no proxy initially for testing)
    const TreasurySecureEnhanced = await ethers.getContractFactory("TreasurySecureEnhanced");
    
    const treasury = await TreasurySecureEnhanced.deploy();
    await treasury.waitForDeployment();
    
    const treasuryAddress = await treasury.getAddress();
    console.log(`✅ TreasurySecureEnhanced deployed at: ${treasuryAddress}`);

    // Initialize the contract (only takes 3 parameters)
    const initTx = await treasury.initialize(
      "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC token
      deployer.address, // treasuryAdmin
      deployer.address  // emergencyAdmin
    );
    
    await initTx.wait();
    console.log(`✅ Treasury initialized successfully`);

    // Verify configuration (using constants from contract)
    const config = {
      usdcToken: await treasury.usdcToken(),
      instantWithdrawalLimit: await treasury.INSTANT_WITHDRAWAL_LIMIT(),
      withdrawalTimelock: await treasury.WITHDRAWAL_TIMELOCK(),
      freezeDuration: await treasury.FREEZE_DURATION(),
      alertThreshold: await treasury.ALERT_THRESHOLD()
    };

    console.log("\n📋 Configuration Validation:");
    console.log(`   💰 USDC Token: ${config.usdcToken}`);
    console.log(`   📊 Instant Withdrawal Limit: ${ethers.formatUnits(config.instantWithdrawalLimit, 6)} USDC`);
    console.log(`   ⏰ Withdrawal Timelock: ${Number(config.withdrawalTimelock) / 3600} hours`);
    console.log(`   🧊 Freeze Duration: ${Number(config.freezeDuration) / 3600} hours`);
    console.log(`   🚨 Alert Threshold: ${ethers.formatUnits(config.alertThreshold, 6)} USDC`);

    // Save deployment info
    const deploymentInfo = {
      treasurySecureEnhanced: treasuryAddress,
      deployedAt: new Date().toISOString(),
      network: "baseSepolia",
      deployer: deployer.address,
      isProxy: false,
      initialization: {
        usdcToken: config.usdcToken,
        instantWithdrawalLimit: config.instantWithdrawalLimit.toString(),
        withdrawalTimelock: config.withdrawalTimelock.toString(),
        freezeDuration: config.freezeDuration.toString(),
        alertThreshold: config.alertThreshold.toString()
      }
    };

    const deployedAddressesPath = path.join(__dirname, "../deployed-addresses.json");
    let existingConfig: any = {};
    if (fs.existsSync(deployedAddressesPath)) {
      existingConfig = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
    }

    const updatedConfig = {
      ...existingConfig,
      treasurySecureEnhanced: treasuryAddress,
      lastTreasuryUpgrade: new Date().toISOString()
    };

    fs.writeFileSync(deployedAddressesPath, JSON.stringify(updatedConfig, null, 2));

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(80));
    console.log(`📍 TreasurySecureEnhanced: ${treasuryAddress}`);
    console.log(`🔗 View on BaseScan: https://sepolia.basescan.org/address/${treasuryAddress}`);
    
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Verify contract on BaseScan");
    console.log("2. Test basic functionality (deposit/withdraw/proposals)");
    console.log("3. Update OpinionCore to use new treasury if needed");
    console.log("4. Test integration with existing system");

  } catch (error: any) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("=" .repeat(80));
    console.error(`Error: ${error.message}`);
    
    if (error.transaction) {
      console.error(`Transaction hash: ${error.transaction.hash}`);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment script failed:", error);
    process.exit(1);
  });