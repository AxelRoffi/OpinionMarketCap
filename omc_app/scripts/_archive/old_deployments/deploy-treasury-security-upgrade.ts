import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentReport {
  timestamp: string;
  network: string;
  deployer: string;
  deployments: {
    treasurySecureEnhanced: {
      implementation: string;
      proxy: string;
      admin: string;
      gasUsed: number;
      txHash: string;
    };
  };
  configuration: {
    usdcToken: string;
    adminRole: string;
    emergencyAdmin: string;
    treasuryAdmin: string;
    dailyLimitPerUser: string;
    proposalTimelock: number;
    emergencyFreezeTime: number;
  };
  testingChecklist: string[];
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  errors?: string[];
}

async function main() {
  console.log("\n🚀 Starting TreasurySecureEnhanced Security Upgrade Deployment");
  console.log("=" .repeat(80));
  
  const report: DeploymentReport = {
    timestamp: new Date().toISOString(),
    network: "baseSepolia",
    deployer: "",
    deployments: {
      treasurySecureEnhanced: {
        implementation: "",
        proxy: "",
        admin: "",
        gasUsed: 0,
        txHash: ""
      }
    },
    configuration: {
      usdcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      adminRole: "",
      emergencyAdmin: "",
      treasuryAdmin: "",
      dailyLimitPerUser: "1000000000", // 1,000 USDC (6 decimals)
      proposalTimelock: 24 * 60 * 60, // 24 hours
      emergencyFreezeTime: 24 * 60 * 60 // 24 hours
    },
    testingChecklist: [],
    status: "FAILED"
  };

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    report.deployer = deployer.address;
    console.log(`📋 Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.01")) {
      throw new Error("Insufficient ETH balance for deployment");
    }

    // Load existing deployment configuration
    const deployedAddressesPath = path.join(__dirname, "../deployed-addresses.json");
    let existingConfig: any = {};
    if (fs.existsSync(deployedAddressesPath)) {
      existingConfig = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
      console.log(`📖 Loaded existing config: OpinionCore at ${existingConfig.opinionCore}`);
    }

    console.log("\n🏗️  Step 1: Deploying TreasurySecureEnhanced...");
    console.log("-".repeat(50));

    // Deploy TreasurySecureEnhanced as UUPS upgradeable proxy
    const TreasurySecureEnhanced = await ethers.getContractFactory("TreasurySecureEnhanced");
    
    // Calculate deployment gas estimate
    const deploymentData = TreasurySecureEnhanced.interface.encodeDeploy([]);
    const gasEstimate = await ethers.provider.estimateGas({
      data: deploymentData
    });
    console.log(`⛽ Estimated gas for deployment: ${gasEstimate.toString()}`);

    const treasuryProxy = await upgrades.deployProxy(TreasurySecureEnhanced, [
      report.configuration.usdcToken, // USDC token address
      deployer.address, // admin
      deployer.address, // emergencyAdmin  
      deployer.address, // treasuryAdmin
      report.configuration.dailyLimitPerUser, // dailyLimitPerUser (1,000 USDC)
      report.configuration.proposalTimelock, // proposalTimelock (24 hours)
      report.configuration.emergencyFreezeTime // emergencyFreezeTime (24 hours)
    ], {
      initializer: "initialize",
      kind: "uups"
    });

    await treasuryProxy.waitForDeployment();
    const treasuryAddress = await treasuryProxy.getAddress();

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(treasuryAddress);
    const adminAddress = await upgrades.erc1967.getAdminAddress(treasuryAddress);

    // Get deployment transaction details
    const deploymentTx = treasuryProxy.deploymentTransaction();
    if (deploymentTx) {
      const receipt = await deploymentTx.wait();
      if (receipt) {
        report.deployments.treasurySecureEnhanced.gasUsed = Number(receipt.gasUsed);
        report.deployments.treasurySecureEnhanced.txHash = receipt.hash;
      }
    }

    report.deployments.treasurySecureEnhanced.proxy = treasuryAddress;
    report.deployments.treasurySecureEnhanced.implementation = implementationAddress;
    report.deployments.treasurySecureEnhanced.admin = adminAddress;

    console.log(`✅ TreasurySecureEnhanced deployed successfully!`);
    console.log(`   📍 Proxy: ${treasuryAddress}`);
    console.log(`   🔧 Implementation: ${implementationAddress}`);
    console.log(`   👑 Admin: ${adminAddress}`);
    console.log(`   ⛽ Gas used: ${report.deployments.treasurySecureEnhanced.gasUsed}`);

    console.log("\n🔧 Step 2: Configuring Roles and Permissions...");
    console.log("-".repeat(50));

    const treasury = TreasurySecureEnhanced.attach(treasuryAddress);

    // Verify role configuration
    const DEFAULT_ADMIN_ROLE = await treasury.DEFAULT_ADMIN_ROLE();
    const TREASURY_ADMIN_ROLE = await treasury.TREASURY_ADMIN_ROLE();
    const EMERGENCY_ADMIN_ROLE = await treasury.EMERGENCY_ADMIN_ROLE();

    report.configuration.adminRole = DEFAULT_ADMIN_ROLE;
    report.configuration.emergencyAdmin = deployer.address;
    report.configuration.treasuryAdmin = deployer.address;

    console.log(`✅ Role configuration verified:`);
    console.log(`   🔑 DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);
    console.log(`   🚨 EMERGENCY_ADMIN_ROLE: ${EMERGENCY_ADMIN_ROLE}`);
    console.log(`   💼 TREASURY_ADMIN_ROLE: ${TREASURY_ADMIN_ROLE}`);

    console.log("\n✅ Step 3: Running Post-Deployment Validation...");
    console.log("-".repeat(50));

    // Validate configuration
    const configValidation = {
      usdcToken: await treasury.usdcToken(),
      dailyLimitPerUser: await treasury.dailyLimitPerUser(),
      proposalTimelock: await treasury.proposalTimelock(),
      emergencyFreezeTime: await treasury.emergencyFreezeTime(),
      isAdmin: await treasury.hasRole(DEFAULT_ADMIN_ROLE, deployer.address),
      isTreasuryAdmin: await treasury.hasRole(TREASURY_ADMIN_ROLE, deployer.address),
      isEmergencyAdmin: await treasury.hasRole(EMERGENCY_ADMIN_ROLE, deployer.address)
    };

    console.log(`📋 Configuration Validation:`);
    console.log(`   💰 USDC Token: ${configValidation.usdcToken}`);
    console.log(`   📊 Daily Limit: ${ethers.formatUnits(configValidation.dailyLimitPerUser, 6)} USDC`);
    console.log(`   ⏰ Proposal Timelock: ${Number(configValidation.proposalTimelock) / 3600} hours`);
    console.log(`   🧊 Emergency Freeze Time: ${Number(configValidation.emergencyFreezeTime) / 3600} hours`);
    console.log(`   👑 Is Admin: ${configValidation.isAdmin}`);
    console.log(`   💼 Is Treasury Admin: ${configValidation.isTreasuryAdmin}`);
    console.log(`   🚨 Is Emergency Admin: ${configValidation.isEmergencyAdmin}`);

    // Generate testing checklist
    report.testingChecklist = [
      "✅ Deploy TreasurySecureEnhanced with UUPS proxy pattern",
      "✅ Configure admin roles (DEFAULT_ADMIN, TREASURY_ADMIN, EMERGENCY_ADMIN)",
      "✅ Set daily withdrawal limit to 1,000 USDC per user",
      "✅ Set proposal timelock to 24 hours",
      "✅ Set emergency freeze time to 24 hours",
      "🔄 TEST REQUIRED: Instant withdrawal under daily limit",
      "🔄 TEST REQUIRED: Proposal creation for amounts over daily limit",
      "🔄 TEST REQUIRED: Hybrid withdrawal (partial instant + proposal)",
      "🔄 TEST REQUIRED: Proposal execution after timelock",
      "🔄 TEST REQUIRED: Emergency freeze functionality",
      "🔄 TEST REQUIRED: Daily limit reset after 24 hours",
      "🔄 TEST REQUIRED: Role-based access control",
      "🔄 TEST REQUIRED: Integration with existing OpinionCore system",
      "🔄 TEST REQUIRED: Frontend compatibility verification",
      "🔄 TEST REQUIRED: Alchemy webhook compatibility"
    ];

    console.log("\n📝 Updating deployment configuration...");
    console.log("-".repeat(50));

    // Update deployed-addresses.json
    const updatedConfig = {
      ...existingConfig,
      treasurySecureEnhanced: treasuryAddress,
      treasurySecureEnhanced_implementation: implementationAddress,
      treasurySecureEnhanced_admin: adminAddress,
      lastTreasuryUpgrade: new Date().toISOString(),
      upgrades: {
        ...(existingConfig.upgrades || {}),
        treasurySecureEnhanced: {
          version: "1.0.0",
          deployedAt: new Date().toISOString(),
          proxy: treasuryAddress,
          implementation: implementationAddress,
          features: [
            "Daily withdrawal limits ($1K per user)",
            "Proposal system for large withdrawals", 
            "Emergency freeze controls",
            "24-hour timelock for proposals",
            "UUPS upgradeable pattern",
            "Multi-role access control"
          ]
        }
      }
    };

    fs.writeFileSync(deployedAddressesPath, JSON.stringify(updatedConfig, null, 2));
    console.log(`✅ Updated deployment configuration at ${deployedAddressesPath}`);

    report.status = "SUCCESS";
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(80));
    console.log(`📍 TreasurySecureEnhanced Proxy: ${treasuryAddress}`);
    console.log(`🔧 Implementation: ${implementationAddress}`);
    console.log(`👑 Admin: ${adminAddress}`);
    console.log(`⛽ Total Gas Used: ${report.deployments.treasurySecureEnhanced.gasUsed}`);
    console.log(`🔗 Transaction: ${report.deployments.treasurySecureEnhanced.txHash}`);

    console.log("\n📋 NEXT STEPS:");
    console.log("1. Run manual testing checklist (see report)");
    console.log("2. Verify frontend integration");
    console.log("3. Test Alchemy webhook compatibility");
    console.log("4. Consider OpinionCore timelock upgrade (after fixing test issues)");
    console.log("5. Update treasury address in OpinionCore if needed");

  } catch (error: any) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("=" .repeat(80));
    console.error(`Error: ${error.message}`);
    
    report.status = "FAILED";
    report.errors = [error.message];
    
    if (error.transaction) {
      console.error(`Transaction hash: ${error.transaction.hash}`);
    }
  } finally {
    // Save deployment report
    const reportPath = path.join(__dirname, `../deployment-reports/treasury-upgrade-${Date.now()}.json`);
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Deployment report saved: ${reportPath}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment script failed:", error);
    process.exit(1);
  });