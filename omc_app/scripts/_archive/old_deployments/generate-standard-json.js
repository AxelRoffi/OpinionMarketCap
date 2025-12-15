#!/usr/bin/env node

/**
 * Generate Standard JSON Input for BaseScan Verification
 * This script extracts the exact compilation input from Hardhat's build artifacts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateStandardJson() {
    console.log('🔧 Generating Standard JSON Input for BaseScan Verification');
    console.log('='.repeat(60));

    // Step 1: Ensure contract is compiled
    console.log('\n📦 Step 1: Compiling contract...');
    try {
        execSync('npx hardhat compile --force', { stdio: 'inherit' });
        console.log('✅ Compilation successful');
    } catch (error) {
        console.error('❌ Compilation failed');
        process.exit(1);
    }

    // Step 2: Find the most recent build info file
    console.log('\n📂 Step 2: Finding build artifacts...');
    const buildInfoDir = path.join(__dirname, '..', 'artifacts', 'build-info');

    if (!fs.existsSync(buildInfoDir)) {
        console.error('❌ Build info directory not found. Run: npx hardhat compile');
        process.exit(1);
    }

    const buildInfoFiles = fs.readdirSync(buildInfoDir)
        .filter(f => f.endsWith('.json'))
        .map(f => ({
            name: f,
            path: path.join(buildInfoDir, f),
            mtime: fs.statSync(path.join(buildInfoDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    if (buildInfoFiles.length === 0) {
        console.error('❌ No build info files found');
        process.exit(1);
    }

    const latestBuildInfo = buildInfoFiles[0];
    console.log(`✅ Found build info: ${latestBuildInfo.name}`);

    // Step 3: Extract standard JSON input
    console.log('\n📝 Step 3: Extracting standard JSON input...');
    const buildInfo = JSON.parse(fs.readFileSync(latestBuildInfo.path, 'utf8'));
    const standardInput = buildInfo.input;

    // Step 4: Add library addresses
    console.log('\n🔗 Step 4: Adding library addresses...');
    if (!standardInput.settings.libraries) {
        standardInput.settings.libraries = {};
    }

    // Add PriceCalculator library
    const priceCalculatorPath = 'contracts/core/libraries/PriceCalculator.sol';
    if (!standardInput.settings.libraries[priceCalculatorPath]) {
        standardInput.settings.libraries[priceCalculatorPath] = {};
    }
    standardInput.settings.libraries[priceCalculatorPath]['PriceCalculator'] =
        '0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7';

    console.log('✅ Added PriceCalculator library address');

    // Step 5: Verify settings
    console.log('\n🔍 Step 5: Verifying compiler settings...');
    console.log(`   Solidity Version: ${standardInput.language}`);
    console.log(`   Optimizer Enabled: ${standardInput.settings.optimizer.enabled}`);
    console.log(`   Optimizer Runs: ${standardInput.settings.optimizer.runs}`);
    console.log(`   Via IR: ${standardInput.settings.viaIR}`);
    console.log(`   Metadata Bytecode Hash: ${standardInput.settings.metadata?.bytecodeHash || 'default'}`);

    if (!standardInput.settings.viaIR) {
        console.warn('⚠️  WARNING: viaIR is not enabled in the build!');
        console.warn('   This may cause "Stack too deep" errors during verification.');
    }

    // Step 6: Save to file
    console.log('\n💾 Step 6: Saving standard JSON input...');
    const outputPath = path.join(__dirname, '..', 'standard-input.json');
    fs.writeFileSync(outputPath, JSON.stringify(standardInput, null, 2));
    console.log(`✅ Saved to: ${outputPath}`);

    // Step 7: Create verification guide
    console.log('\n📋 Step 7: Creating verification guide...');
    const guide = `
# BaseScan Standard JSON Input Verification Guide

## Contract Details
- **Address**: 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97
- **Network**: Base Mainnet
- **Contract Name**: OpinionCoreNoMod

## Verification Steps

1. **Go to BaseScan**
   - URL: https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code
   - Click "Verify and Publish"

2. **Select Compiler Type**
   - Choose: "Solidity (Standard-Json-Input)"

3. **Fill in Details**
   - Compiler Version: v0.8.20+commit.a1b79de6
   - License Type: MIT

4. **Upload Standard JSON**
   - Copy the contents of: standard-input.json
   - Paste into the "Standard Input JSON" field

5. **Constructor Arguments**
   - Leave EMPTY (this is an upgradeable contract with no constructor args)

6. **Submit**
   - Click "Verify and Publish"
   - Wait for verification to complete

## Compiler Settings (Verified)
- Optimizer: Enabled
- Optimizer Runs: ${standardInput.settings.optimizer.runs}
- Via IR: ${standardInput.settings.viaIR ? 'YES ✅' : 'NO ❌'}
- Metadata Bytecode Hash: ${standardInput.settings.metadata?.bytecodeHash || 'default'}

## Library Addresses
- PriceCalculator: 0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7

## Troubleshooting

If verification fails:
1. Check that you selected "Standard-Json-Input" (not "Single file")
2. Verify the compiler version matches exactly
3. Ensure the JSON is valid (use a JSON validator)
4. Check that library addresses are correct
5. Make sure constructor arguments are empty

## Alternative: Hardhat CLI

\`\`\`bash
npx hardhat verify --network base-mainnet \\
  0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 \\
  --libraries libraries.js
\`\`\`
`;

    const guidePath = path.join(__dirname, '..', 'standard-json-verification-guide.md');
    fs.writeFileSync(guidePath, guide);
    console.log(`✅ Created guide: ${guidePath}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS - Standard JSON Input Generated');
    console.log('='.repeat(60));
    console.log('\n📁 Files created:');
    console.log(`   1. ${outputPath}`);
    console.log(`   2. ${guidePath}`);
    console.log('\n🎯 Next steps:');
    console.log('   1. Open BaseScan verification page');
    console.log('   2. Select "Solidity (Standard-Json-Input)"');
    console.log('   3. Upload the standard-input.json file');
    console.log('   4. Follow the guide for complete instructions');
    console.log('');
}

if (require.main === module) {
    generateStandardJson().catch(console.error);
}

module.exports = { generateStandardJson };
