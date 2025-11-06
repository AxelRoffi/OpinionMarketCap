#!/usr/bin/env node

/**
 * Direct test of mainnet deployment functionality
 * This simulates what the MCP server would do
 */

const { spawn } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

async function simulateMainnetDeployment(network = "baseSepolia", dryRun = true) {
  console.log(`🚀 ${dryRun ? "DRY RUN:" : ""} Simulating deployment to ${network}...`);
  
  const deployment = {
    timestamp: new Date().toISOString(),
    network,
    dryRun,
    phases: {}
  };

  try {
    // Phase 1: Pre-deployment Safety Checks
    console.log("🔒 Phase 1: Pre-deployment safety checks...");
    
    // Check if contracts are compiled
    const artifactsPath = join('artifacts', 'contracts');
    if (existsSync(artifactsPath)) {
      console.log("✅ Contracts compiled");
      deployment.phases.compilation = { success: true };
    } else {
      console.log("❌ Contracts not compiled - run: npx hardhat compile");
      deployment.phases.compilation = { success: false, error: "Not compiled" };
    }
    
    // Check if deployed addresses exist
    const deployedAddresses = join('deployed-addresses.json');
    if (existsSync(deployedAddresses)) {
      console.log("✅ Deployment addresses found");
      const addresses = JSON.parse(readFileSync(deployedAddresses, 'utf8'));
      console.log(`   OpinionCore: ${addresses.opinionCore || 'Not found'}`);
      deployment.phases.addresses = { success: true, addresses };
    } else {
      console.log("⚠️  No deployment addresses found");
      deployment.phases.addresses = { success: false };
    }
    
    // Phase 2: Network Connection Check
    console.log("🌐 Phase 2: Network connection check...");
    
    // Simulate network check
    const networks = {
      baseSepolia: { name: "Base Sepolia", rpc: "https://sepolia.base.org", chainId: 84532 },
      base: { name: "Base Mainnet", rpc: "https://mainnet.base.org", chainId: 8453 }
    };
    
    if (networks[network]) {
      console.log(`✅ Network configured: ${networks[network].name}`);
      deployment.phases.network = { success: true, config: networks[network] };
    } else {
      console.log(`❌ Unknown network: ${network}`);
      deployment.phases.network = { success: false };
    }
    
    // Phase 3: Security Pre-flight
    console.log("🛡️ Phase 3: Security pre-flight checks...");
    
    // Check if security audit files exist
    const securityReports = ['reports/security-audit.md', 'reports/security-analysis.md'];
    let securityChecks = 0;
    
    for (const report of securityReports) {
      if (existsSync(report)) {
        console.log(`✅ Security report found: ${report}`);
        securityChecks++;
      }
    }
    
    if (securityChecks > 0) {
      deployment.phases.security = { success: true, reports: securityChecks };
    } else {
      console.log("⚠️  No security reports found - run security audit first");
      deployment.phases.security = { success: false, recommendation: "Run security audit" };
    }
    
    // Phase 4: Environment Check
    console.log("⚙️ Phase 4: Environment variables check...");
    
    const requiredEnvVars = ['PRIVATE_KEY', 'ALCHEMY_API_KEY'];
    let envChecks = 0;
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} configured`);
        envChecks++;
      } else {
        console.log(`⚠️  ${envVar} not configured`);
      }
    }
    
    deployment.phases.environment = { 
      success: envChecks === requiredEnvVars.length,
      configured: envChecks,
      required: requiredEnvVars.length
    };
    
    // Phase 5: Deployment Simulation
    if (dryRun) {
      console.log("🧪 Phase 5: Deployment simulation (DRY RUN)...");
      console.log("✅ Simulation completed - no actual deployment");
      deployment.phases.deployment = { success: true, simulated: true };
    } else {
      console.log("🚀 Phase 5: Actual deployment...");
      console.log("❌ Actual deployment requires MCP server integration");
      deployment.phases.deployment = { success: false, reason: "Use MCP server for actual deployment" };
    }
    
    // Generate Report
    console.log("\n📊 Deployment Readiness Report:");
    console.log("=".repeat(50));
    
    let totalPhases = Object.keys(deployment.phases).length;
    let successfulPhases = Object.values(deployment.phases).filter(p => p.success).length;
    
    console.log(`**Timestamp:** ${deployment.timestamp}`);
    console.log(`**Network:** ${deployment.network}`);
    console.log(`**Type:** ${deployment.dryRun ? "DRY RUN" : "LIVE DEPLOYMENT"}`);
    console.log(`**Phases Passed:** ${successfulPhases}/${totalPhases}`);
    
    if (successfulPhases === totalPhases) {
      console.log(`**Status:** ✅ READY FOR DEPLOYMENT`);
    } else if (successfulPhases >= totalPhases * 0.7) {
      console.log(`**Status:** ⚠️ MOSTLY READY - Fix remaining issues`);
    } else {
      console.log(`**Status:** ❌ NOT READY - Major issues need fixing`);
    }
    
    // Recommendations
    console.log("\n🎯 Next Steps:");
    if (!deployment.phases.compilation.success) {
      console.log("1. Compile contracts: npx hardhat compile");
    }
    if (!deployment.phases.security.success) {
      console.log("2. Run security audit: Create security report");
    }
    if (!deployment.phases.environment.success) {
      console.log("3. Set environment variables in .env file");
    }
    if (successfulPhases === totalPhases && dryRun) {
      console.log("4. Ready for live deployment: Re-run with --live flag");
    }
    
    return deployment;
    
  } catch (error) {
    console.log(`❌ Deployment simulation failed: ${error.message}`);
    deployment.error = error.message;
    return deployment;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const network = args.find(arg => arg.startsWith('--network='))?.split('=')[1] || "baseSepolia";
  const dryRun = !args.includes('--live');
  
  console.log('🚀 OpinionMarketCap Mainnet Deployment Test\n');
  
  const result = await simulateMainnetDeployment(network, dryRun);
  
  console.log('\n✨ Test completed!');
  console.log('To run actual MCP deployment, use this through Claude Code interface.');
}

if (require.main === module) {
  main().catch(console.error);
}