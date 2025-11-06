import { ethers } from "hardhat";
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as dotenv from "dotenv";
import { MAINNET } from "../config/mainnet-constants";

// Load mainnet environment
dotenv.config({ path: '.env.mainnet' });

/**
 * 🔔 DEPLOYMENT MONITORING & ALERTING SYSTEM
 * 
 * Monitors mainnet deployment health and sends alerts
 * Tracks contract state, balances, and key metrics
 */

interface ContractHealth {
  address: string;
  name: string;
  isActive: boolean;
  balance?: string;
  lastChecked: string;
  errors: string[];
  warnings: string[];
}

interface MonitoringReport {
  timestamp: string;
  environment: string;
  overallHealth: 'healthy' | 'warning' | 'critical';
  contracts: ContractHealth[];
  metrics: {
    totalOpinions: number;
    totalVolume: string;
    treasuryBalance: string;
    lastActivity: string;
  };
  alerts: {
    critical: string[];
    warnings: string[];
    info: string[];
  };
}

class DeploymentMonitor {
  private provider: ethers.JsonRpcProvider;
  private contracts: any = {};
  private report: MonitoringReport;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    this.report = {
      timestamp: new Date().toISOString(),
      environment: 'mainnet',
      overallHealth: 'healthy',
      contracts: [],
      metrics: {
        totalOpinions: 0,
        totalVolume: '0',
        treasuryBalance: '0',
        lastActivity: '',
      },
      alerts: {
        critical: [],
        warnings: [],
        info: [],
      },
    };
  }

  async loadDeployedContracts(): Promise<boolean> {
    console.log("📋 LOADING DEPLOYED CONTRACTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const possibleFiles = [
      'deployed-addresses-mainnet.json',
      'deployed-addresses.json'
    ];
    
    for (const filename of possibleFiles) {
      if (existsSync(filename)) {
        try {
          const data = JSON.parse(readFileSync(filename, 'utf8'));
          
          if (data.network === 'base-mainnet' || data.network === 'mainnet') {
            this.contracts = data;
            console.log(`✅ Loaded contracts from: ${filename}`);
            return true;
          }
          
        } catch (error) {
          console.error(`❌ Failed to parse ${filename}:`, error);
        }
      }
    }
    
    console.error("❌ No mainnet deployment data found");
    return false;
  }

  async checkContractHealth(address: string, name: string, abi: any[]): Promise<ContractHealth> {
    const health: ContractHealth = {
      address,
      name,
      isActive: false,
      lastChecked: new Date().toISOString(),
      errors: [],
      warnings: [],
    };
    
    try {
      // Check if contract exists
      const code = await this.provider.getCode(address);
      if (code === "0x") {
        health.errors.push("Contract code not found");
        return health;
      }
      
      // Get contract balance
      const balance = await this.provider.getBalance(address);
      health.balance = ethers.formatEther(balance);
      
      // Create contract instance
      const contract = new ethers.Contract(address, abi, this.provider);
      
      // Contract-specific health checks
      if (name === 'OpinionCore') {
        try {
          const nextOpinionId = await contract.nextOpinionId();
          const isPublicCreationEnabled = await contract.isPublicCreationEnabled();
          
          this.report.metrics.totalOpinions = Number(nextOpinionId) - 1;
          
          if (!isPublicCreationEnabled) {
            health.warnings.push("Public opinion creation is disabled");
          }
          
          health.isActive = true;
          
        } catch (error) {
          health.errors.push(`Failed to read OpinionCore state: ${error}`);
        }
      }
      
      if (name === 'FeeManager') {
        try {
          // Check if FeeManager can read USDC
          const usdcAddress = await contract.usdcToken();
          if (usdcAddress.toLowerCase() !== MAINNET.TOKENS.USDC.ADDRESS.toLowerCase()) {
            health.errors.push(`Incorrect USDC address: ${usdcAddress}`);
          } else {
            health.isActive = true;
          }
          
        } catch (error) {
          health.errors.push(`Failed to read FeeManager state: ${error}`);
        }
      }
      
      if (name === 'PoolManager') {
        try {
          const usdcAddress = await contract.usdcToken();
          if (usdcAddress.toLowerCase() !== MAINNET.TOKENS.USDC.ADDRESS.toLowerCase()) {
            health.errors.push(`Incorrect USDC address: ${usdcAddress}`);
          } else {
            health.isActive = true;
          }
          
        } catch (error) {
          health.errors.push(`Failed to read PoolManager state: ${error}`);
        }
      }
      
    } catch (error) {
      health.errors.push(`Contract check failed: ${error}`);
    }
    
    return health;
  }

  async checkTreasuryHealth(): Promise<void> {
    console.log("💰 Checking treasury health...");
    
    try {
      const treasuryAddress = this.contracts.treasury;
      const balance = await this.provider.getBalance(treasuryAddress);
      const ethBalance = ethers.formatEther(balance);
      
      // Check USDC balance
      const usdcAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      const usdcContract = new ethers.Contract(MAINNET.TOKENS.USDC.ADDRESS, usdcAbi, this.provider);
      const usdcBalance = await usdcContract.balanceOf(treasuryAddress);
      const usdcDecimals = await usdcContract.decimals();
      const formattedUsdcBalance = ethers.formatUnits(usdcBalance, usdcDecimals);
      
      this.report.metrics.treasuryBalance = `${ethBalance} ETH, ${formattedUsdcBalance} USDC`;
      
      // Alert thresholds
      if (parseFloat(ethBalance) < 0.01) {
        this.report.alerts.warnings.push(`Low treasury ETH balance: ${ethBalance} ETH`);
      }
      
      if (parseFloat(formattedUsdcBalance) < 100) {
        this.report.alerts.warnings.push(`Low treasury USDC balance: ${formattedUsdcBalance} USDC`);
      }
      
      console.log(`✅ Treasury: ${ethBalance} ETH, ${formattedUsdcBalance} USDC`);
      
    } catch (error) {
      this.report.alerts.critical.push(`Treasury check failed: ${error}`);
      console.error(`❌ Treasury check failed:`, error);
    }
  }

  async checkNetworkHealth(): Promise<void> {
    console.log("🌐 Checking network health...");
    
    try {
      const latestBlock = await this.provider.getBlock("latest");
      if (!latestBlock) {
        this.report.alerts.critical.push("Cannot fetch latest block");
        return;
      }
      
      const blockAge = Date.now() / 1000 - latestBlock.timestamp;
      
      if (blockAge > 300) { // 5 minutes
        this.report.alerts.warnings.push(`Latest block is ${Math.round(blockAge / 60)} minutes old`);
      }
      
      // Check gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0';
      
      if (parseFloat(gasPrice) > 10) {
        this.report.alerts.warnings.push(`High gas price: ${gasPrice} gwei`);
      }
      
      console.log(`✅ Network: Block ${latestBlock.number}, Gas ${gasPrice} gwei`);
      
    } catch (error) {
      this.report.alerts.critical.push(`Network check failed: ${error}`);
      console.error(`❌ Network check failed:`, error);
    }
  }

  async performHealthCheck(): Promise<MonitoringReport> {
    console.log("\n🔍 PERFORMING HEALTH CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // Check network health
      await this.checkNetworkHealth();
      
      // Check treasury health
      await this.checkTreasuryHealth();
      
      // Check contract health
      const opinionCoreAbi = [
        "function nextOpinionId() view returns (uint256)",
        "function isPublicCreationEnabled() view returns (bool)"
      ];
      
      const feeManagerAbi = [
        "function usdcToken() view returns (address)"
      ];
      
      const poolManagerAbi = [
        "function usdcToken() view returns (address)"
      ];
      
      const contractChecks = [
        { address: this.contracts.opinionCore, name: 'OpinionCore', abi: opinionCoreAbi },
        { address: this.contracts.feeManager, name: 'FeeManager', abi: feeManagerAbi },
        { address: this.contracts.poolManager, name: 'PoolManager', abi: poolManagerAbi },
      ];
      
      for (const contract of contractChecks) {
        console.log(`Checking ${contract.name}...`);
        const health = await this.checkContractHealth(contract.address, contract.name, contract.abi);
        this.report.contracts.push(health);
        
        if (health.errors.length > 0) {
          this.report.alerts.critical.push(`${contract.name}: ${health.errors.join(', ')}`);
        }
        
        if (health.warnings.length > 0) {
          this.report.alerts.warnings.push(`${contract.name}: ${health.warnings.join(', ')}`);
        }
        
        console.log(`${health.isActive ? '✅' : '❌'} ${contract.name}: ${health.isActive ? 'Active' : 'Issues detected'}`);
      }
      
      // Determine overall health
      const criticalIssues = this.report.alerts.critical.length;
      const warnings = this.report.alerts.warnings.length;
      
      if (criticalIssues > 0) {
        this.report.overallHealth = 'critical';
      } else if (warnings > 0) {
        this.report.overallHealth = 'warning';
      } else {
        this.report.overallHealth = 'healthy';
      }
      
      console.log(`\n📊 Overall Health: ${this.report.overallHealth.toUpperCase()}`);
      console.log(`   Critical Issues: ${criticalIssues}`);
      console.log(`   Warnings: ${warnings}`);
      
    } catch (error) {
      this.report.alerts.critical.push(`Health check failed: ${error}`);
      this.report.overallHealth = 'critical';
      console.error(`❌ Health check failed:`, error);
    }
    
    return this.report;
  }

  async sendAlerts(report: MonitoringReport): Promise<void> {
    console.log("\n🔔 SENDING ALERTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (report.overallHealth === 'healthy' && report.alerts.critical.length === 0 && report.alerts.warnings.length === 0) {
      console.log("✅ All systems healthy - no alerts needed");
      return;
    }
    
    // Prepare alert message
    const alertMessage = this.formatAlertMessage(report);
    
    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await this.sendSlackAlert(alertMessage, report.overallHealth);
        console.log("📤 Slack alert sent");
      } catch (error) {
        console.error("❌ Failed to send Slack alert:", error);
      }
    }
    
    // Send to Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await this.sendDiscordAlert(alertMessage, report.overallHealth);
        console.log("📤 Discord alert sent");
      } catch (error) {
        console.error("❌ Failed to send Discord alert:", error);
      }
    }
    
    // Email notification (if configured)
    if (process.env.NOTIFICATION_EMAIL) {
      console.log(`📧 Email notification would be sent to: ${process.env.NOTIFICATION_EMAIL}`);
    }
    
    console.log("🔔 Alert notifications completed");
  }

  private formatAlertMessage(report: MonitoringReport): string {
    const emoji = report.overallHealth === 'critical' ? '🚨' : 
                  report.overallHealth === 'warning' ? '⚠️' : '✅';
    
    let message = `${emoji} OpinionMarketCap Mainnet Status: ${report.overallHealth.toUpperCase()}\n`;
    message += `Time: ${report.timestamp}\n`;
    message += `Network: Base Mainnet\n\n`;
    
    if (report.alerts.critical.length > 0) {
      message += `🚨 Critical Issues (${report.alerts.critical.length}):\n`;
      report.alerts.critical.forEach(alert => message += `• ${alert}\n`);
      message += '\n';
    }
    
    if (report.alerts.warnings.length > 0) {
      message += `⚠️ Warnings (${report.alerts.warnings.length}):\n`;
      report.alerts.warnings.forEach(alert => message += `• ${alert}\n`);
      message += '\n';
    }
    
    message += `📊 Metrics:\n`;
    message += `• Total Opinions: ${report.metrics.totalOpinions}\n`;
    message += `• Treasury: ${report.metrics.treasuryBalance}\n`;
    
    message += `\n🔗 Links:\n`;
    message += `• OpinionCore: https://basescan.org/address/${report.contracts.find(c => c.name === 'OpinionCore')?.address}\n`;
    message += `• Platform: https://opinionmarketcap.xyz\n`;
    
    return message;
  }

  private async sendSlackAlert(message: string, severity: string): Promise<void> {
    const color = severity === 'critical' ? 'danger' : 
                  severity === 'warning' ? 'warning' : 'good';
    
    const payload = {
      text: "OpinionMarketCap Monitoring Alert",
      attachments: [{
        color: color,
        title: `Mainnet Status: ${severity.toUpperCase()}`,
        text: message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };
    
    const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }
  }

  private async sendDiscordAlert(message: string, severity: string): Promise<void> {
    const color = severity === 'critical' ? 15158332 : // Red
                  severity === 'warning' ? 15105570 :  // Orange
                  3066993; // Green
    
    const payload = {
      embeds: [{
        title: "🔔 OpinionMarketCap Monitoring Alert",
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
          text: "OpinionMarketCap Monitoring System"
        }
      }]
    };
    
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }
  }

  async saveReport(report: MonitoringReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `monitoring-report-${timestamp}.json`;
    
    writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved: ${filename}`);
    
    // Also save as latest
    writeFileSync('monitoring-report-latest.json', JSON.stringify(report, null, 2));
    console.log("📊 Latest report updated");
  }

  async run(): Promise<void> {
    try {
      console.log("🔔 OPINIONMARKETCAP DEPLOYMENT MONITORING");
      console.log("════════════════════════════════════════════════════════");
      console.log(`Started at: ${new Date().toISOString()}`);
      console.log("");
      
      // Load contracts
      if (!(await this.loadDeployedContracts())) {
        throw new Error("Failed to load deployment data");
      }
      
      // Perform health check
      const report = await this.performHealthCheck();
      
      // Send alerts if needed
      await this.sendAlerts(report);
      
      // Save report
      await this.saveReport(report);
      
      console.log("\n🎉 MONITORING CYCLE COMPLETE");
      console.log(`Status: ${report.overallHealth.toUpperCase()}`);
      console.log(`Critical: ${report.alerts.critical.length}, Warnings: ${report.alerts.warnings.length}`);
      
    } catch (error) {
      console.error("\n❌ MONITORING FAILED");
      console.error("Error:", error);
      
      // Try to send critical alert
      if (process.env.SLACK_WEBHOOK_URL) {
        try {
          await this.sendSlackAlert(`🚨 MONITORING SYSTEM FAILURE: ${error}`, 'critical');
        } catch (alertError) {
          console.error("Failed to send failure alert:", alertError);
        }
      }
      
      process.exit(1);
    }
  }
}

// Run monitoring
async function main() {
  const monitor = new DeploymentMonitor();
  await monitor.run();
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Monitoring script failed:", error);
      process.exit(1);
    });
}