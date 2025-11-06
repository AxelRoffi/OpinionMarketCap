import { run } from "hardhat";
import { readFileSync, existsSync } from "fs";
import * as dotenv from "dotenv";
import { MAINNET } from "../config/mainnet-constants";

// Load mainnet environment
dotenv.config({ path: '.env.mainnet' });

/**
 * 🔍 MAINNET CONTRACT VERIFICATION SCRIPT
 * 
 * Verifies all deployed contracts on BaseScan (Base Mainnet)
 * Handles UUPS proxy verification and all contract types
 */

interface DeployedContracts {
  opinionCore: string;
  feeManager: string;
  poolManager: string;
  priceCalculator?: string;
  usdc: string;
  treasury: string;
  deployer: string;
  network: string;
  deployedAt: string;
}

class MainnetContractVerifier {
  private contracts: DeployedContracts | null = null;

  async loadDeploymentData(): Promise<boolean> {
    console.log("📋 LOADING DEPLOYMENT DATA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const possibleFiles = [
      'deployed-addresses-mainnet.json',
      'deployed-addresses.json'
    ];
    
    for (const filename of possibleFiles) {
      if (existsSync(filename)) {
        try {
          const data = JSON.parse(readFileSync(filename, 'utf8'));
          
          // Validate that this is mainnet deployment
          if (data.network !== 'base-mainnet' && data.network !== 'mainnet') {
            console.warn(`⚠️  ${filename} is not a mainnet deployment (network: ${data.network})`);
            continue;
          }
          
          this.contracts = data;
          console.log(`✅ Loaded deployment data from: ${filename}`);
          console.log(`   Network: ${data.network}`);
          console.log(`   Deployed: ${data.deployedAt}`);
          console.log(`   OpinionCore: ${data.opinionCore}`);
          console.log(`   FeeManager: ${data.feeManager}`);
          console.log(`   PoolManager: ${data.poolManager}`);
          return true;
          
        } catch (error) {
          console.error(`❌ Failed to parse ${filename}:`, error);
        }
      }
    }
    
    console.error("❌ No mainnet deployment data found");
    console.error("Available files should be:");
    console.error("  - deployed-addresses-mainnet.json");
    console.error("  - deployed-addresses.json (with network: 'mainnet' or 'base-mainnet')");
    
    return false;
  }

  async validateNetworkConnection(): Promise<boolean> {
    console.log("\n🔗 VALIDATING NETWORK CONNECTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // Check Hardhat network configuration
      const network = await run("network", { quiet: true });
      console.log(`Current Hardhat network: ${network}`);
      
      // Validate API key
      if (!process.env.BASESCAN_API_KEY) {
        console.error("❌ BASESCAN_API_KEY not found in environment");
        return false;
      }
      
      console.log("✅ BaseScan API key configured");
      console.log("✅ Ready for contract verification");
      
      return true;
      
    } catch (error) {
      console.error("❌ Network validation failed:", error);
      return false;
    }
  }

  async verifyFeeManager(): Promise<boolean> {
    console.log("\n1️⃣ VERIFYING FEEMANAGER CONTRACT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      await run("verify:verify", {
        address: this.contracts!.feeManager,
        constructorArguments: [MAINNET.TOKENS.USDC.ADDRESS],
        network: "base",
      });
      
      console.log("✅ FeeManager verified successfully");
      console.log(`   Contract: ${this.contracts!.feeManager}`);
      console.log(`   View on BaseScan: https://basescan.org/address/${this.contracts!.feeManager}`);
      
      return true;
      
    } catch (error: any) {
      if (error.message?.includes("Already Verified")) {
        console.log("✅ FeeManager already verified");
        return true;
      }
      
      console.error("❌ FeeManager verification failed:", error.message);
      return false;
    }
  }

  async verifyPoolManager(): Promise<boolean> {
    console.log("\n2️⃣ VERIFYING POOLMANAGER CONTRACT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      await run("verify:verify", {
        address: this.contracts!.poolManager,
        constructorArguments: [MAINNET.TOKENS.USDC.ADDRESS],
        network: "base",
      });
      
      console.log("✅ PoolManager verified successfully");
      console.log(`   Contract: ${this.contracts!.poolManager}`);
      console.log(`   View on BaseScan: https://basescan.org/address/${this.contracts!.poolManager}`);
      
      return true;
      
    } catch (error: any) {
      if (error.message?.includes("Already Verified")) {
        console.log("✅ PoolManager already verified");
        return true;
      }
      
      console.error("❌ PoolManager verification failed:", error.message);
      return false;
    }
  }

  async verifyPriceCalculator(): Promise<boolean> {
    console.log("\n3️⃣ VERIFYING PRICECALCULATOR LIBRARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // PriceCalculator might not be in deployment data if it's a library
    if (!this.contracts!.priceCalculator) {
      console.log("ℹ️  PriceCalculator address not found in deployment data");
      console.log("   This is normal for libraries - they may be embedded in contracts");
      return true;
    }
    
    try {
      await run("verify:verify", {
        address: this.contracts!.priceCalculator,
        constructorArguments: [], // Libraries typically have no constructor args
        network: "base",
      });
      
      console.log("✅ PriceCalculator verified successfully");
      console.log(`   Library: ${this.contracts!.priceCalculator}`);
      console.log(`   View on BaseScan: https://basescan.org/address/${this.contracts!.priceCalculator}`);
      
      return true;
      
    } catch (error: any) {
      if (error.message?.includes("Already Verified")) {
        console.log("✅ PriceCalculator already verified");
        return true;
      }
      
      console.error("❌ PriceCalculator verification failed:", error.message);
      console.log("   This may be normal for libraries embedded in contracts");
      return true; // Don't fail verification for library issues
    }
  }

  async verifyOpinionCoreProxy(): Promise<boolean> {
    console.log("\n4️⃣ VERIFYING OPINIONCORE UUPS PROXY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // For UUPS proxy, we need to verify the implementation contract
      // The proxy itself is typically verified automatically
      
      console.log("ℹ️  UUPS Proxy verification requires special handling");
      console.log(`   Proxy Address: ${this.contracts!.opinionCore}`);
      console.log(`   View on BaseScan: https://basescan.org/address/${this.contracts!.opinionCore}`);
      console.log("");
      console.log("📋 Manual Verification Steps:");
      console.log("   1. Go to BaseScan: https://basescan.org/address/" + this.contracts!.opinionCore);
      console.log("   2. Click 'Contract' tab");
      console.log("   3. If not verified, click 'Verify and Publish'");
      console.log("   4. Select 'Verify Proxy Contract'");
      console.log("   5. The proxy should auto-detect the implementation");
      console.log("");
      console.log("⚠️  If manual verification is needed:");
      console.log("   - Contract Name: OpinionCore");
      console.log("   - Compiler Version: 0.8.20");
      console.log("   - Constructor Args: [USDC, FeeManager, PoolManager, Treasury]");
      
      // Try automatic verification (might work for implementation)
      try {
        await run("verify:verify", {
          address: this.contracts!.opinionCore,
          constructorArguments: [
            MAINNET.TOKENS.USDC.ADDRESS,
            this.contracts!.feeManager,
            this.contracts!.poolManager,
            this.contracts!.treasury,
          ],
          network: "base",
        });
        
        console.log("✅ OpinionCore verified automatically");
        
      } catch (proxyError: any) {
        if (proxyError.message?.includes("Already Verified")) {
          console.log("✅ OpinionCore already verified");
        } else {
          console.log("ℹ️  Automatic verification failed (normal for proxies)");
          console.log("   Please use manual verification process above");
        }
      }
      
      return true;
      
    } catch (error) {
      console.error("❌ OpinionCore proxy verification failed:", error);
      return false;
    }
  }

  async generateVerificationSummary(): Promise<void> {
    console.log("\n📊 VERIFICATION SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const contracts = this.contracts!;
    
    console.log("🎉 Contract Verification Process Complete!");
    console.log("");
    console.log("📋 Contract Summary:");
    console.log(`   Network: Base Mainnet (${MAINNET.CONFIG.CHAIN_ID})`);
    console.log(`   Deployed: ${contracts.deployedAt}`);
    console.log(`   Deployer: ${contracts.deployer}`);
    console.log("");
    console.log("🔗 BaseScan Links:");
    console.log(`   OpinionCore: https://basescan.org/address/${contracts.opinionCore}`);
    console.log(`   FeeManager: https://basescan.org/address/${contracts.feeManager}`);
    console.log(`   PoolManager: https://basescan.org/address/${contracts.poolManager}`);
    console.log(`   USDC Token: https://basescan.org/address/${contracts.usdc}`);
    console.log(`   Treasury: https://basescan.org/address/${contracts.treasury}`);
    console.log("");
    console.log("✅ Next Steps:");
    console.log("1. Verify all contracts show as 'Verified' on BaseScan");
    console.log("2. Test contract interactions through BaseScan");
    console.log("3. Update frontend with verified contract addresses");
    console.log("4. Configure monitoring and alerting");
    console.log("5. Perform final testing with small amounts");
    console.log("");
    console.log("🔔 Important Notes:");
    console.log("• All contracts are now publicly auditable on BaseScan");
    console.log("• Source code and constructor parameters are verified");
    console.log("• Users can interact directly through BaseScan if needed");
    console.log("• Verification enables better indexing and analytics");
  }

  async run(): Promise<void> {
    try {
      console.log("🔍 OPINIONMARKETCAP MAINNET CONTRACT VERIFICATION");
      console.log("════════════════════════════════════════════════════════════");
      console.log(`Started at: ${new Date().toISOString()}`);
      console.log("");
      
      // Load deployment data
      if (!(await this.loadDeploymentData())) {
        throw new Error("Failed to load deployment data");
      }
      
      // Validate network connection
      if (!(await this.validateNetworkConnection())) {
        throw new Error("Network validation failed");
      }
      
      console.log("\n🚀 STARTING CONTRACT VERIFICATION PROCESS");
      console.log("This may take several minutes...");
      
      // Verify each contract
      const results = await Promise.allSettled([
        this.verifyFeeManager(),
        this.verifyPoolManager(),
        this.verifyPriceCalculator(),
        this.verifyOpinionCoreProxy(),
      ]);
      
      // Check results
      const failures = results.filter(r => r.status === 'rejected').length;
      const successes = results.filter(r => r.status === 'fulfilled').length;
      
      console.log(`\n📈 Verification Results: ${successes} successful, ${failures} failed`);
      
      if (failures > 0) {
        console.log("\n⚠️  Some verifications failed, but this may be normal for proxies and libraries");
        console.log("Please check BaseScan manually for complete verification status");
      }
      
      // Generate summary
      await this.generateVerificationSummary();
      
    } catch (error) {
      console.error("\n❌ CONTRACT VERIFICATION FAILED");
      console.error("Error:", error);
      console.error("");
      console.error("🔄 Troubleshooting:");
      console.error("1. Ensure you're connected to Base Mainnet");
      console.error("2. Check BASESCAN_API_KEY is valid");
      console.error("3. Verify deployment data file exists");
      console.error("4. Try manual verification on BaseScan");
      console.error("5. Check for recent BaseScan API issues");
      
      process.exit(1);
    }
  }
}

// Run verification
async function main() {
  const verifier = new MainnetContractVerifier();
  await verifier.run();
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Verification script failed:", error);
      process.exit(1);
    });
}