import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import * as dotenv from "dotenv";
import { validateUSDC } from "./validate-usdc";
import { MAINNET } from "../config/mainnet-constants";

// Load mainnet environment
dotenv.config({ path: '.env.mainnet' });

/**
 * 🔒 SAFE MAINNET DEPLOYMENT SCRIPT
 * 
 * This script creates deployment transactions for execution through a multisig
 * Instead of directly deploying, it generates transaction data for Safe wallet
 */

interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: number; // 0 for CALL, 1 for DELEGATECALL
  safeTxGas: string;
  baseGas: string;
  gasPrice: string;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
}

interface DeploymentPlan {
  transactions: SafeTransaction[];
  description: string;
  totalEstimatedGas: string;
  estimatedCostETH: string;
  contracts: {
    priceCalculator: string;
    feeManager: string;
    poolManager: string;
    opinionCore: string;
  };
}

class SafeMainnetDeployer {
  private signer: any;
  private safeAddress: string;
  private deploymentPlan: DeploymentPlan = {
    transactions: [],
    description: "",
    totalEstimatedGas: "0",
    estimatedCostETH: "0",
    contracts: {
      priceCalculator: "",
      feeManager: "",
      poolManager: "",
      opinionCore: "",
    },
  };

  constructor() {
    this.safeAddress = process.env.MAINNET_TREASURY_ADDRESS!;
  }

  async validateEnvironmentForSafe(): Promise<boolean> {
    console.log("🔍 VALIDATING SAFE DEPLOYMENT ENVIRONMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Validate Safe address
    if (!this.safeAddress) {
      console.error("❌ MAINNET_TREASURY_ADDRESS (Safe address) not provided");
      return false;
    }
    
    const safeCode = await ethers.provider.getCode(this.safeAddress);
    if (safeCode === "0x") {
      console.error("❌ Safe address is not a contract");
      return false;
    }
    
    console.log(`✅ Safe contract found at: ${this.safeAddress}`);
    
    // Validate network
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== BigInt(MAINNET.CONFIG.CHAIN_ID)) {
      console.error(`❌ Wrong network. Expected: ${MAINNET.CONFIG.CHAIN_ID}, Got: ${network.chainId}`);
      return false;
    }
    console.log(`✅ Connected to Base Mainnet (${network.chainId})`);
    
    // Validate USDC
    try {
      await validateUSDC();
      console.log("✅ USDC contract validated");
    } catch (error) {
      console.error("❌ USDC validation failed:", error);
      return false;
    }
    
    return true;
  }

  async generateDeploymentTransactions(): Promise<DeploymentPlan> {
    console.log("\n🔧 GENERATING DEPLOYMENT TRANSACTIONS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const transactions: SafeTransaction[] = [];
    let totalGasEstimate = BigInt(0);
    const feeData = await ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(1000000000); // 1 gwei fallback
    
    try {
      // 1. Deploy PriceCalculator Library
      console.log("1️⃣ Preparing PriceCalculator deployment...");
      const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
      const priceCalculatorDeployData = PriceCalculator.bytecode;
      const priceCalculatorGas = BigInt(MAINNET.GAS.GAS_LIMITS.DEPLOY_LIBRARY);
      
      // Calculate CREATE2 address for deterministic deployment
      const priceCalculatorSalt = ethers.solidityPackedKeccak256(["string"], ["PriceCalculator_v1"]);
      const priceCalculatorAddress = ethers.getCreate2Address(
        this.safeAddress,
        priceCalculatorSalt,
        ethers.keccak256(priceCalculatorDeployData)
      );
      
      transactions.push({
        to: "0x0000000000000000000000000000000000000000", // Contract creation
        value: "0",
        data: priceCalculatorDeployData,
        operation: 0,
        safeTxGas: priceCalculatorGas.toString(),
        baseGas: "50000",
        gasPrice: gasPrice.toString(),
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: 0, // Will be set by Safe
      });
      
      totalGasEstimate += priceCalculatorGas;
      this.deploymentPlan.contracts.priceCalculator = priceCalculatorAddress;
      
      // 2. Deploy FeeManager
      console.log("2️⃣ Preparing FeeManager deployment...");
      const FeeManager = await ethers.getContractFactory("FeeManager");
      const feeManagerInterface = FeeManager.interface;
      const feeManagerConstructorData = feeManagerInterface.encodeDeploy([MAINNET.TOKENS.USDC.ADDRESS]);
      const feeManagerDeployData = FeeManager.bytecode + feeManagerConstructorData.slice(2);
      const feeManagerGas = BigInt(MAINNET.GAS.GAS_LIMITS.DEPLOY_CONTRACT);
      
      const feeManagerSalt = ethers.solidityPackedKeccak256(["string"], ["FeeManager_v1"]);
      const feeManagerAddress = ethers.getCreate2Address(
        this.safeAddress,
        feeManagerSalt,
        ethers.keccak256(feeManagerDeployData)
      );
      
      transactions.push({
        to: "0x0000000000000000000000000000000000000000",
        value: "0",
        data: feeManagerDeployData,
        operation: 0,
        safeTxGas: feeManagerGas.toString(),
        baseGas: "50000",
        gasPrice: gasPrice.toString(),
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: 0,
      });
      
      totalGasEstimate += feeManagerGas;
      this.deploymentPlan.contracts.feeManager = feeManagerAddress;
      
      // 3. Deploy PoolManager
      console.log("3️⃣ Preparing PoolManager deployment...");
      const PoolManager = await ethers.getContractFactory("PoolManager");
      const poolManagerInterface = PoolManager.interface;
      const poolManagerConstructorData = poolManagerInterface.encodeDeploy([MAINNET.TOKENS.USDC.ADDRESS]);
      const poolManagerDeployData = PoolManager.bytecode + poolManagerConstructorData.slice(2);
      const poolManagerGas = BigInt(MAINNET.GAS.GAS_LIMITS.DEPLOY_CONTRACT);
      
      const poolManagerSalt = ethers.solidityPackedKeccak256(["string"], ["PoolManager_v1"]);
      const poolManagerAddress = ethers.getCreate2Address(
        this.safeAddress,
        poolManagerSalt,
        ethers.keccak256(poolManagerDeployData)
      );
      
      transactions.push({
        to: "0x0000000000000000000000000000000000000000",
        value: "0",
        data: poolManagerDeployData,
        operation: 0,
        safeTxGas: poolManagerGas.toString(),
        baseGas: "50000",
        gasPrice: gasPrice.toString(),
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: 0,
      });
      
      totalGasEstimate += poolManagerGas;
      this.deploymentPlan.contracts.poolManager = poolManagerAddress;
      
      // 4. Deploy OpinionCore Proxy
      console.log("4️⃣ Preparing OpinionCore proxy deployment...");
      // Note: UUPS proxy deployment through Safe requires special handling
      // This would need to be done through the upgrades plugin or manual proxy deployment
      
      const opinionCoreGas = BigInt(MAINNET.GAS.GAS_LIMITS.DEPLOY_PROXY);
      totalGasEstimate += opinionCoreGas;
      
      // For now, we'll indicate this needs manual handling
      this.deploymentPlan.contracts.opinionCore = "TO_BE_DEPLOYED_MANUALLY";
      
      console.log("ℹ️  OpinionCore UUPS proxy requires manual deployment or specialized tooling");
      
      // Calculate total estimated cost
      const totalCostWei = totalGasEstimate * gasPrice;
      const totalCostETH = ethers.formatEther(totalCostWei);
      
      this.deploymentPlan = {
        transactions,
        description: `OpinionMarketCap mainnet deployment for Safe ${this.safeAddress}`,
        totalEstimatedGas: totalGasEstimate.toString(),
        estimatedCostETH: totalCostETH,
        contracts: this.deploymentPlan.contracts,
      };
      
      console.log(`✅ Generated ${transactions.length} transactions`);
      console.log(`✅ Total estimated gas: ${totalGasEstimate.toString()}`);
      console.log(`✅ Total estimated cost: ${totalCostETH} ETH`);
      
      return this.deploymentPlan;
      
    } catch (error) {
      console.error("❌ Failed to generate deployment transactions:", error);
      throw error;
    }
  }

  async saveSafeTransactionData(plan: DeploymentPlan): Promise<void> {
    console.log("\n💾 SAVING SAFE TRANSACTION DATA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `safe-deployment-${timestamp}.json`;
    
    const safeTransactionBatch = {
      version: "1.0",
      chainId: MAINNET.CONFIG.CHAIN_ID.toString(),
      createdAt: Date.now(),
      meta: {
        name: "OpinionMarketCap Mainnet Deployment",
        description: plan.description,
        txBuilderVersion: "1.16.5",
        createdFromSafeAddress: this.safeAddress,
        createdFromOwnerAddress: "", // Will be filled by Safe user
        checksum: "", // Will be calculated by Safe
      },
      transactions: plan.transactions.map((tx, index) => ({
        ...tx,
        contractMethod: {
          inputs: [],
          name: index === 0 ? "deploy PriceCalculator" : 
                index === 1 ? "deploy FeeManager" :
                index === 2 ? "deploy PoolManager" : "deploy OpinionCore",
          payable: false,
        },
        contractInputsValues: {},
      })),
    };
    
    // Save the Safe transaction batch
    writeFileSync(filename, JSON.stringify(safeTransactionBatch, null, 2));
    console.log(`✅ Safe transaction batch saved to: ${filename}`);
    
    // Save human-readable summary
    const summaryFilename = `deployment-summary-${timestamp}.md`;
    const summary = `# OpinionMarketCap Mainnet Deployment Summary

## Overview
- **Network**: Base Mainnet (Chain ID: ${MAINNET.CONFIG.CHAIN_ID})
- **Safe Address**: ${this.safeAddress}
- **Generated At**: ${new Date().toISOString()}
- **Total Transactions**: ${plan.transactions.length}
- **Estimated Gas**: ${plan.totalEstimatedGas}
- **Estimated Cost**: ${plan.estimatedCostETH} ETH

## Contract Addresses (Predicted)
- **PriceCalculator**: ${plan.contracts.priceCalculator}
- **FeeManager**: ${plan.contracts.feeManager}
- **PoolManager**: ${plan.contracts.poolManager}
- **OpinionCore**: ${plan.contracts.opinionCore}

## Deployment Steps

### 1. Import Transaction Batch
1. Open Safe Wallet app: https://app.safe.global/
2. Navigate to your Safe: ${this.safeAddress}
3. Go to "Apps" → "Transaction Builder"
4. Import the transaction batch from: \`${filename}\`

### 2. Review Transactions
- Verify all contract bytecode and parameters
- Check gas estimates and limits
- Confirm Safe has sufficient ETH balance

### 3. Execute Transactions
- Submit the batch for signatures
- Collect required signatures (minimum ${MAINNET.SECURITY.MULTISIG_THRESHOLD})
- Execute the transactions on Base Mainnet

### 4. Post-Deployment
- Verify contracts on BaseScan
- Update frontend configuration
- Configure monitoring and alerts
- Test with small amounts first

## Security Notes
⚠️ **CRITICAL**: Verify all transaction data before signing
⚠️ **VERIFY**: Contract addresses and parameters are correct
⚠️ **TEST**: Execute on testnet first if possible
⚠️ **BACKUP**: Keep copies of all deployment data

## Support
For technical support or questions, contact the development team.
`;
    
    writeFileSync(summaryFilename, summary);
    console.log(`✅ Human-readable summary saved to: ${summaryFilename}`);
    
    // Save environment variables for post-deployment
    const envContent = `# Predicted contract addresses for mainnet deployment
# Update these after successful deployment

NEXT_PUBLIC_OPINION_CORE_ADDRESS=${plan.contracts.opinionCore}
NEXT_PUBLIC_FEE_MANAGER_ADDRESS=${plan.contracts.feeManager}
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=${plan.contracts.poolManager}
NEXT_PUBLIC_USDC_ADDRESS=${MAINNET.TOKENS.USDC.ADDRESS}
NEXT_PUBLIC_TREASURY_ADDRESS=${this.safeAddress}
NEXT_PUBLIC_CHAIN_ID=${MAINNET.CONFIG.CHAIN_ID}
NEXT_PUBLIC_ENVIRONMENT=mainnet

# BaseScan URLs for verification
BASESCAN_PRICELIB_URL=https://basescan.org/address/${plan.contracts.priceCalculator}
BASESCAN_FEEMANAGER_URL=https://basescan.org/address/${plan.contracts.feeManager}
BASESCAN_POOLMANAGER_URL=https://basescan.org/address/${plan.contracts.poolManager}
BASESCAN_OPINIONCORE_URL=https://basescan.org/address/${plan.contracts.opinionCore}
`;
    
    writeFileSync('.env.mainnet.predicted', envContent);
    console.log('✅ Predicted addresses saved to: .env.mainnet.predicted');
  }

  async generateInstructions(): Promise<void> {
    console.log("\n📋 DEPLOYMENT INSTRUCTIONS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("🔒 SAFE MULTISIG DEPLOYMENT PROCESS");
    console.log("");
    console.log("1. **Import Transaction Batch**");
    console.log(`   → Open Safe app: https://app.safe.global/home?safe=base:${this.safeAddress}`);
    console.log("   → Go to Apps → Transaction Builder");
    console.log("   → Import the generated JSON file");
    console.log("");
    console.log("2. **Review & Sign**");
    console.log(`   → Verify ${this.deploymentPlan.transactions.length} transactions`);
    console.log(`   → Check estimated cost: ${this.deploymentPlan.estimatedCostETH} ETH`);
    console.log(`   → Collect ${MAINNET.SECURITY.MULTISIG_THRESHOLD}+ signatures`);
    console.log("");
    console.log("3. **Execute Deployment**");
    console.log("   → Execute the signed transaction batch");
    console.log("   → Monitor transactions on BaseScan");
    console.log("   → Wait for confirmations");
    console.log("");
    console.log("4. **Post-Deployment**");
    console.log("   → Update .env.mainnet with actual addresses");
    console.log("   → Verify contracts on BaseScan");
    console.log("   → Update frontend configuration");
    console.log("   → Configure monitoring");
    console.log("");
    console.log("⚠️  **SECURITY CHECKLIST**");
    console.log("   ✅ Verify all transaction data");
    console.log("   ✅ Check contract parameters");
    console.log("   ✅ Confirm Safe has sufficient ETH");
    console.log("   ✅ Test on testnet first (recommended)");
    console.log("   ✅ Have emergency procedures ready");
    console.log("");
  }

  async run(): Promise<void> {
    try {
      console.log("🔒 OPINIONMARKETCAP SAFE MAINNET DEPLOYMENT PREPARATION");
      console.log("════════════════════════════════════════════════════════════");
      console.log(`Started at: ${new Date().toISOString()}`);
      console.log("");
      
      // Validate environment
      if (!(await this.validateEnvironmentForSafe())) {
        throw new Error("Environment validation failed");
      }
      
      // Generate deployment transactions
      const plan = await this.generateDeploymentTransactions();
      
      // Save transaction data
      await this.saveSafeTransactionData(plan);
      
      // Generate instructions
      await this.generateInstructions();
      
      console.log("\n🎉 SAFE DEPLOYMENT PREPARATION COMPLETE!");
      console.log("Follow the instructions above to execute deployment through Safe.");
      
    } catch (error) {
      console.error("\n❌ SAFE DEPLOYMENT PREPARATION FAILED");
      console.error("Error:", error);
      process.exit(1);
    }
  }
}

// Run Safe deployment preparation
async function main() {
  const safeDeployer = new SafeMainnetDeployer();
  await safeDeployer.run();
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Safe deployment preparation failed:", error);
      process.exit(1);
    });
}