/**
 * Advanced Security Scanner for OpinionMarketCap Smart Contracts
 * 
 * Integrates with multiple security analysis tools and provides
 * comprehensive vulnerability detection specifically for prediction markets.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');

const execAsync = promisify(exec);

class SecurityScanner {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.contractsPath = path.join(rootPath, 'contracts/core');
  }

  async scanAll() {
    console.log(chalk.blue('🔒 Starting comprehensive security scan...'));
    
    const results = {
      timestamp: new Date().toISOString(),
      contracts: [],
      overallRisk: 'unknown',
      criticalIssues: [],
      recommendations: []
    };

    // Get all Solidity files
    const contractFiles = await this.getContractFiles();
    
    for (const file of contractFiles) {
      console.log(chalk.yellow(`Scanning ${file}...`));
      const contractResult = await this.scanContract(file);
      results.contracts.push(contractResult);
    }

    // Analyze results
    results.overallRisk = this.calculateOverallRisk(results.contracts);
    results.criticalIssues = this.extractCriticalIssues(results.contracts);
    results.recommendations = this.generateRecommendations(results.contracts);

    return results;
  }

  async scanContract(contractFile) {
    const contractPath = path.join(this.contractsPath, contractFile);
    const content = await fs.readFile(contractPath, 'utf8');
    
    const result = {
      file: contractFile,
      path: contractPath,
      issues: [],
      riskLevel: 'low',
      patterns: [],
      functions: []
    };

    // Run multiple security checks
    await Promise.all([
      this.checkCentralizationRisks(content, result),
      this.checkPriceManipulation(content, result),
      this.checkUpgradePatterns(content, result),
      this.checkTreasuryControls(content, result),
      this.checkFinancialValidation(content, result),
      this.checkReentrancyProtection(content, result),
      this.checkAccessControls(content, result)
    ]);

    result.riskLevel = this.calculateContractRisk(result.issues);
    return result;
  }

  async checkCentralizationRisks(content, result) {
    const centralizedPatterns = [
      {
        pattern: /onlyRole\(ADMIN_ROLE\).*(?!multisig|governance)/gi,
        severity: 'critical',
        type: 'centralization',
        description: 'Single admin role without multisig protection'
      },
      {
        pattern: /function.*onlyRole\(ADMIN_ROLE\).*pause/gi,
        severity: 'high',
        type: 'centralization',
        description: 'Single admin can pause entire system'
      },
      {
        pattern: /_grantRole\(ADMIN_ROLE/gi,
        severity: 'high', 
        type: 'centralization',
        description: 'Admin role can grant itself to other addresses'
      }
    ];

    for (const { pattern, severity, type, description } of centralizedPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        result.issues.push({
          severity,
          type,
          description,
          occurrences: matches.length,
          impact: 'Single point of failure - admin can control entire system',
          recommendation: 'Implement multisig controls and governance delays'
        });
      }
    }
  }

  async checkPriceManipulation(content, result) {
    const pricePatterns = [
      {
        pattern: /block\.prevrandao.*price/gi,
        severity: 'critical',
        type: 'price-manipulation',
        description: 'Price calculation uses predictable randomness'
      },
      {
        pattern: /calculateNextPrice.*(?!slippage|max)/gi,
        severity: 'high',
        type: 'price-manipulation', 
        description: 'Price calculation without slippage protection'
      },
      {
        pattern: /msg\.sender.*price.*competition/gi,
        severity: 'medium',
        type: 'price-manipulation',
        description: 'Competition tracking vulnerable to Sybil attacks'
      }
    ];

    for (const { pattern, severity, type, description } of pricePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        result.issues.push({
          severity,
          type, 
          description,
          occurrences: matches.length,
          impact: 'Attackers can manipulate prices and extract value',
          recommendation: 'Add slippage protection and commit-reveal schemes'
        });
      }
    }
  }

  async checkUpgradePatterns(content, result) {
    if (content.includes('UUPSUpgradeable')) {
      const upgradeIssues = [];
      
      if (!content.includes('UPGRADE_DELAY') && !content.includes('governance')) {
        upgradeIssues.push({
          severity: 'critical',
          type: 'unsafe-upgrade',
          description: 'UUPS upgrade without timelock or governance',
          impact: 'Admin can immediately upgrade to malicious implementation',
          recommendation: 'Add upgrade delays and community governance'
        });
      }

      if (!content.includes('_authorizeUpgrade') || !content.includes('multisig')) {
        upgradeIssues.push({
          severity: 'high',
          type: 'unsafe-upgrade',
          description: 'Upgrade authorization not properly protected',
          impact: 'Unauthorized upgrades possible',
          recommendation: 'Require multisig approval for upgrades'
        });
      }

      result.issues.push(...upgradeIssues);
    }
  }

  async checkTreasuryControls(content, result) {
    if (content.includes('treasury')) {
      const treasuryIssues = [];

      if (!content.includes('multisig') && content.includes('treasury')) {
        treasuryIssues.push({
          severity: 'critical',
          type: 'treasury-security',
          description: 'Treasury controlled by single address',
          impact: 'Single admin can drain all platform funds',
          recommendation: 'Implement multisig treasury with spending limits'
        });
      }

      if (content.includes('safeTransferFrom.*treasury') && !content.includes('validation')) {
        treasuryIssues.push({
          severity: 'high',
          type: 'treasury-security',
          description: 'Treasury transfers without proper validation',
          impact: 'Funds can be transferred without proper checks',
          recommendation: 'Add transfer validation and approval mechanisms'
        });
      }

      result.issues.push(...treasuryIssues);
    }
  }

  async checkFinancialValidation(content, result) {
    const financialPatterns = [
      {
        pattern: /calculateFeeDistribution.*(?!validate|check)/gi,
        severity: 'high',
        type: 'financial-validation',
        description: 'Fee calculations without validation'
      },
      {
        pattern: /ownerAmount.*creatorFee.*platformFee.*(?!total|sum)/gi,
        severity: 'medium',
        type: 'financial-validation',
        description: 'Fee distribution without total validation'
      }
    ];

    for (const { pattern, severity, type, description } of financialPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        result.issues.push({
          severity,
          type,
          description,
          occurrences: matches.length,
          impact: 'Fee calculations could have rounding errors or overflows',
          recommendation: 'Add comprehensive fee validation and overflow checks'
        });
      }
    }
  }

  async checkReentrancyProtection(content, result) {
    if (content.includes('external') || content.includes('public')) {
      const hasReentrancyGuard = content.includes('nonReentrant') || 
                                content.includes('ReentrancyGuard');
      
      if (!hasReentrancyGuard && content.includes('safeTransfer')) {
        result.issues.push({
          severity: 'medium',
          type: 'reentrancy',
          description: 'External calls without reentrancy protection',
          impact: 'Potential reentrancy attacks during token transfers',
          recommendation: 'Add nonReentrant modifier to sensitive functions'
        });
      }
    }
  }

  async checkAccessControls(content, result) {
    // Check for proper access control patterns
    const functions = content.match(/function\s+\w+[^}]+}/g) || [];
    
    for (const func of functions) {
      if (func.includes('external') || func.includes('public')) {
        const hasAccessControl = func.includes('onlyRole') || 
                                func.includes('onlyOwner') ||
                                func.includes('modifier');
        
        if (!hasAccessControl && (func.includes('set') || func.includes('update'))) {
          result.issues.push({
            severity: 'medium',
            type: 'access-control',
            description: 'Public setter function without access control',
            impact: 'Anyone can modify critical parameters',
            recommendation: 'Add proper access control modifiers'
          });
        }
      }
    }
  }

  calculateContractRisk(issues) {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (issues.length > 5) return 'medium';
    return 'low';
  }

  calculateOverallRisk(contracts) {
    const criticalContracts = contracts.filter(c => c.riskLevel === 'critical').length;
    if (criticalContracts > 0) return 'critical';
    
    const highRiskContracts = contracts.filter(c => c.riskLevel === 'high').length;
    if (highRiskContracts > 1) return 'high';
    
    return 'medium';
  }

  extractCriticalIssues(contracts) {
    const critical = [];
    contracts.forEach(contract => {
      const criticalIssues = contract.issues.filter(i => i.severity === 'critical');
      critical.push(...criticalIssues.map(issue => ({
        contract: contract.file,
        ...issue
      })));
    });
    return critical;
  }

  generateRecommendations(contracts) {
    const recommendations = new Set();
    
    contracts.forEach(contract => {
      contract.issues.forEach(issue => {
        if (issue.recommendation) {
          recommendations.add(issue.recommendation);
        }
      });
    });

    // Add specific recommendations for OpinionMarketCap
    recommendations.add('Implement multisig treasury with 3/5 threshold');
    recommendations.add('Add slippage protection to all trading functions');
    recommendations.add('Implement upgrade governance with 7-day delays');
    recommendations.add('Add comprehensive fee validation');
    recommendations.add('Conduct professional security audit before mainnet');
    
    return Array.from(recommendations);
  }

  async getContractFiles() {
    const files = await fs.readdir(this.contractsPath);
    return files.filter(file => file.endsWith('.sol') && !file.includes('interface'));
  }
}

module.exports = SecurityScanner;

// CLI usage
if (require.main === module) {
  const scanner = new SecurityScanner('../../');
  scanner.scanAll().then(results => {
    console.log('\n' + chalk.green('🔒 Security Scan Complete!'));
    console.log(chalk.red(`Overall Risk: ${results.overallRisk.toUpperCase()}`));
    console.log(chalk.yellow(`Critical Issues: ${results.criticalIssues.length}`));
    console.log('\nRecommendations:');
    results.recommendations.forEach(rec => {
      console.log(chalk.blue(`• ${rec}`));
    });
  }).catch(error => {
    console.error(chalk.red('Security scan failed:'), error);
  });
}