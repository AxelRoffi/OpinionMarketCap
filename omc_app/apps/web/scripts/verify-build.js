#!/usr/bin/env node

/**
 * Build Verification Script
 * Ensures consistent and safe deployments by verifying critical dependencies and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting build verification...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function success(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg) {
  console.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function warning(msg) {
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
}

// Verification checks
const checks = [];

// Check 1: Verify package.json has required locked dependencies
function verifyLockedDependencies() {
  info('Checking locked dependencies...');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const criticalDeps = [
    { name: 'react', expected: '19.0.0' },
    { name: 'react-dom', expected: '19.0.0' },
    { name: 'wagmi', expected: '2.15.6' },
    { name: '@rainbow-me/rainbowkit', expected: '2.2.8' },
    { name: 'viem', expected: '2.31.3' },
    { name: 'next', expected: '15.5.9' }
  ];
  
  let hasErrors = false;
  
  criticalDeps.forEach(({ name, expected }) => {
    const actual = packageJson.dependencies[name];
    if (actual === expected) {
      success(`${name}: ${actual}`);
    } else {
      error(`${name}: Expected ${expected}, got ${actual}`);
      hasErrors = true;
    }
  });
  
  return !hasErrors;
}

// Check 2: Verify overrides are present
function verifyOverrides() {
  info('Checking npm overrides...');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredOverrides = [
    'react',
    'react-dom', 
    'valtio',
    '@reown/appkit',
    'use-sync-external-store',
    '@metamask/sdk',
    'debug'
  ];
  
  let hasErrors = false;
  
  if (!packageJson.overrides) {
    error('No overrides section found in package.json');
    return false;
  }
  
  requiredOverrides.forEach(dep => {
    if (packageJson.overrides[dep]) {
      success(`Override present: ${dep} → ${packageJson.overrides[dep]}`);
    } else {
      error(`Missing override: ${dep}`);
      hasErrors = true;
    }
  });
  
  return !hasErrors;
}

// Check 3: Verify Node.js and npm versions
function verifyEngines() {
  info('Checking Node.js and npm versions...');
  
  const nodeVersion = process.version;
  const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
  
  const nodeMin = '18.17.0';
  const npmMin = '9.0.0';
  
  success(`Node.js: ${nodeVersion}`);
  success(`npm: ${npmVersion}`);
  
  // Simple version check (for production, use semver package)
  const nodeOk = nodeVersion.slice(1).split('.')[0] >= 18;
  const npmOk = npmVersion.split('.')[0] >= 9;
  
  if (!nodeOk) {
    error(`Node.js version too old. Need >= ${nodeMin}`);
    return false;
  }
  
  if (!npmOk) {
    error(`npm version too old. Need >= ${npmMin}`);
    return false;
  }
  
  return true;
}

// Check 4: Verify environment configuration
function verifyEnvironment() {
  info('Checking environment configuration...');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    warning('.env.local not found - this is OK for production builds');
    return true;
  }
  
  success('.env.local found');
  return true;
}

// Check 5: Verify critical files exist
function verifyCriticalFiles() {
  info('Checking critical files...');
  
  const criticalFiles = [
    'src/app/layout.tsx',
    'src/app/page.tsx', 
    'src/app/profile/page.tsx',
    'src/lib/wagmi.ts',
    'tsconfig.json'
  ];
  
  let hasErrors = false;
  
  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      success(`File exists: ${file}`);
    } else {
      error(`Missing critical file: ${file}`);
      hasErrors = true;
    }
  });
  
  return !hasErrors;
}

// Run all checks
async function runVerification() {
  console.log(`${colors.bold}🚀 OpinionMarketCap Build Verification${colors.reset}\n`);
  
  const results = [
    verifyLockedDependencies(),
    verifyOverrides(), 
    verifyEngines(),
    verifyEnvironment(),
    verifyCriticalFiles()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n${colors.bold}📊 Verification Results:${colors.reset}`);
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log(`\n${colors.green}${colors.bold}✅ All checks passed! Build can proceed safely.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ ${total - passed} checks failed! Build aborted for safety.${colors.reset}\n`);
    console.log(`${colors.yellow}Fix the issues above and try again.${colors.reset}\n`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  runVerification().catch(err => {
    console.error(`\n${colors.red}${colors.bold}💥 Verification script error:${colors.reset}`, err);
    process.exit(1);
  });
}

module.exports = { runVerification };