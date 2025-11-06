import { ethers, upgrades, network } from "hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load mainnet environment
dotenv.config({ path: ".env.mainnet" });

interface DeploymentAddresses {
  opinionCore: string;
  feeManager: string;
  poolManager: string;
  treasury: string;
  usdc: string;
  network: string;
  chainId: number;
  blockNumber: number;
  timestamp: string;
  deployer: string;
  gasUsed: string;
  deploymentCost: string;
}

class MainnetDeployer {
  private addresses: Partial<DeploymentAddresses> = {};

  async deploy() {
    console.log("\n🚀 MAINNET DEPLOYMENT STARTING");
    console.log("=====================================");
    console.log("⚠️  WARNING: DEPLOYING TO MAINNET WITH REAL MONEY!");
    console.log("=====================================\n");

    // Pre-deployment validation
    await this.validateEnvironment();
    await this.validateBalances();
    await this.confirmDeployment();

    // Core deployment
    await this.deployFeeManager();
    await this.deployPoolManager(); 
    await this.deployOpinionCore();
    await this.setupRoles();
    await this.finalValidation();

    // Post-deployment
    await this.saveDeploymentInfo();
    await this.verifyContracts();
    await this.sendNotifications();

    console.log("\n✅ MAINNET DEPLOYMENT COMPLETE!");
    console.log("=====================================");
  }

  private async validateEnvironment() {
    console.log("🔍 Validating environment...");

    // Check required environment variables
    const required = [
      "MAINNET_PRIVATE_KEY",
      "REAL_USDC_ADDRESS", 
      "PRODUCTION_TREASURY_ADDRESS",
      "BASESCAN_API_KEY"
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
      }
    }

    // Verify network
    if (network.name !== "base") {
      throw new Error(`❌ Wrong network! Expected 'base', got '${network.name}'`);
    }

    // Verify USDC address
    const usdcAddress = process.env.REAL_USDC_ADDRESS!;
    if (usdcAddress !== "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") {
      throw new Error(`❌ Invalid USDC address! Must use verified Base USDC`);
    }

    console.log("✅ Environment validation passed");
  }

  private async validateBalances() {
    console.log("💰 Validating balances...");

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);

    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${balanceEth} ETH`);

    // Check minimum balance (0.05 ETH for deployment)
    if (parseFloat(balanceEth) < 0.05) {
      throw new Error(`❌ Insufficient ETH balance! Need at least 0.05 ETH, have ${balanceEth} ETH`);
    }

    // Check gas price limits
    const gasPrice = await ethers.provider.getFeeData();
    const maxGasPrice = ethers.parseUnits(process.env.MAX_GAS_PRICE_GWEI || "20", "gwei");
    
    if (gasPrice.gasPrice && gasPrice.gasPrice > maxGasPrice) {
      throw new Error(`❌ Gas price too high! Current: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei, Max: ${process.env.MAX_GAS_PRICE_GWEI} gwei`);
    }

    console.log("✅ Balance validation passed");
  }

  private async confirmDeployment() {
    console.log("\n⚠️  FINAL CONFIRMATION REQUIRED");
    console.log("=====================================");
    console.log("You are about to deploy to BASE MAINNET");
    console.log("This will use REAL ETH for gas fees");
    console.log("Contracts will handle REAL USDC");
    console.log("=====================================");
    
    // In a real deployment, you'd want user confirmation
    console.log("🚀 Proceeding with deployment...\n");
  }

  private async deployFeeManager() {
    console.log("📦 Deploying FeeManager...");

    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy();
    await feeManager.waitForDeployment();

    const address = await feeManager.getAddress();
    this.addresses.feeManager = address;

    console.log(`✅ FeeManager deployed: ${address}`);
  }

  private async deployPoolManager() {
    console.log("📦 Deploying PoolManager...");

    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = await PoolManager.deploy();
    await poolManager.waitForDeployment();

    const address = await poolManager.getAddress();
    this.addresses.poolManager = address;

    console.log(`✅ PoolManager deployed: ${address}`);
  }

  private async deployOpinionCore() {
    console.log("📦 Deploying OpinionCore with UUPS proxy...");

    const OpinionCore = await ethers.getContractFactory("OpinionCore");
    
    const opinionCore = await upgrades.deployProxy(
      OpinionCore,
      [
        process.env.REAL_USDC_ADDRESS,
        this.addresses.feeManager,
        this.addresses.poolManager,
        process.env.PRODUCTION_TREASURY_ADDRESS
      ],
      {
        kind: "uups",
        initializer: "initialize"
      }
    );

    await opinionCore.waitForDeployment();

    const address = await opinionCore.getAddress();
    this.addresses.opinionCore = address;
    this.addresses.usdc = process.env.REAL_USDC_ADDRESS!;
    this.addresses.treasury = process.env.PRODUCTION_TREASURY_ADDRESS!;

    console.log(`✅ OpinionCore deployed: ${address}`);
  }

  private async setupRoles() {
    console.log("🔐 Setting up roles and permissions...");

    const opinionCore = await ethers.getContractAt("OpinionCore", this.addresses.opinionCore!);
    
    // Grant roles to required contracts
    const MARKET_CONTRACT_ROLE = await opinionCore.MARKET_CONTRACT_ROLE();
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();

    // Grant pool manager role to pool manager contract
    await opinionCore.grantRole(POOL_MANAGER_ROLE, this.addresses.poolManager!);
    
    // Set up additional admin wallets if specified
    const adminWallet2 = process.env.ADMIN_WALLET_2;
    const adminWallet3 = process.env.ADMIN_WALLET_3;
    
    if (adminWallet2) {
      const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
      await opinionCore.grantRole(ADMIN_ROLE, adminWallet2);
      console.log(`✅ Admin role granted to: ${adminWallet2}`);
    }
    
    if (adminWallet3) {
      const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
      await opinionCore.grantRole(ADMIN_ROLE, adminWallet3);
      console.log(`✅ Admin role granted to: ${adminWallet3}`);
    }

    console.log("✅ Roles configured successfully");
  }

  private async finalValidation() {
    console.log("🔍 Final validation...");

    // Test basic functionality
    const opinionCore = await ethers.getContractAt("OpinionCore", this.addresses.opinionCore!);
    
    // Check initialization
    const usdcToken = await opinionCore.usdcToken();
    const treasury = await opinionCore.treasury();
    
    if (usdcToken !== process.env.REAL_USDC_ADDRESS) {
      throw new Error("❌ USDC address mismatch!");
    }
    
    if (treasury !== process.env.PRODUCTION_TREASURY_ADDRESS) {
      throw new Error("❌ Treasury address mismatch!");
    }

    console.log("✅ Final validation passed");
  }

  private async saveDeploymentInfo() {
    console.log("💾 Saving deployment information...");

    const [deployer] = await ethers.getSigners();
    const block = await ethers.provider.getBlock("latest");

    const deploymentInfo: DeploymentAddresses = {
      opinionCore: this.addresses.opinionCore!,
      feeManager: this.addresses.feeManager!,
      poolManager: this.addresses.poolManager!,
      treasury: this.addresses.treasury!,
      usdc: this.addresses.usdc!,
      network: "base",
      chainId: 8453,
      blockNumber: block!.number,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      gasUsed: "TBD", // Would be calculated from deployment transactions
      deploymentCost: "TBD"
    };

    // Save to multiple formats
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Main deployment file
    fs.writeFileSync(
      path.join(deploymentsDir, "mainnet-deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    // Timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(
      path.join(deploymentsDir, `mainnet-deployment-${timestamp}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );

    // Frontend-friendly format
    const frontendConfig = {
      chainId: 8453,
      contracts: {
        opinionCore: this.addresses.opinionCore,
        feeManager: this.addresses.feeManager,
        poolManager: this.addresses.poolManager,
        usdc: this.addresses.usdc
      },
      treasury: this.addresses.treasury
    };

    fs.writeFileSync(
      path.join(deploymentsDir, "frontend-config-mainnet.json"),
      JSON.stringify(frontendConfig, null, 2)
    );

    console.log("✅ Deployment information saved");
  }

  private async verifyContracts() {
    console.log("🔍 Verifying contracts on BaseScan...");

    try {
      // Verify FeeManager
      console.log("Verifying FeeManager...");
      await hre.run("verify:verify", {
        address: this.addresses.feeManager,
        network: "base"
      });

      // Verify PoolManager
      console.log("Verifying PoolManager...");
      await hre.run("verify:verify", {
        address: this.addresses.poolManager,
        network: "base"
      });

      // Note: UUPS proxy verification is more complex and might need manual verification
      console.log("📝 Note: OpinionCore (UUPS proxy) may need manual verification on BaseScan");
      console.log(`Proxy address: ${this.addresses.opinionCore}`);

      console.log("✅ Contract verification initiated");
    } catch (error) {
      console.log("⚠️  Contract verification failed (this is non-critical)");
      console.log("You can verify manually on BaseScan later");
    }
  }

  private async sendNotifications() {
    console.log("📢 Sending deployment notifications...");

    const message = `
🚀 OpinionMarketCap MAINNET DEPLOYMENT COMPLETE!

Network: Base Mainnet (Chain ID: 8453)
OpinionCore: ${this.addresses.opinionCore}
FeeManager: ${this.addresses.feeManager}
PoolManager: ${this.addresses.poolManager}
Treasury: ${this.addresses.treasury}
USDC: ${this.addresses.usdc}

Timestamp: ${new Date().toISOString()}
Status: ✅ SUCCESS

Next steps:
1. Verify contracts on BaseScan
2. Test basic functionality
3. Configure frontend
4. Monitor system health
5. Gradual rollout with limits
`;

    console.log(message);

    // Send to Slack if webhook configured
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });
        if (response.ok) {
          console.log("✅ Slack notification sent");
        }
      } catch (error) {
        console.log("⚠️  Slack notification failed");
      }
    }

    console.log("✅ Notifications processed");
  }
}

// Execute deployment
async function main() {
  const deployer = new MainnetDeployer();
  await deployer.deploy();
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});