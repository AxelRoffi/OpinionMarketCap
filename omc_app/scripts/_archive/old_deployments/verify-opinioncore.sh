#!/bin/bash

echo "🔍 OpinionCore Verification Attempt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Contract Address: 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97"
echo "Network: Base Mainnet"
echo "Compiler: v0.8.20+commit.a1b79de6"
echo "Optimization: Enabled (runs: 1)"
echo "viaIR: true"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Attempt 1: Basic verification
echo "📌 Attempt 1: Basic Hardhat Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx hardhat verify --network base-mainnet \
  0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 \
  --show-stack-traces

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if libraries.js exists
if [ -f "libraries.js" ]; then
    echo "📌 Attempt 2: Verification with Libraries"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    npx hardhat verify --network base-mainnet \
      0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 \
      --libraries libraries.js \
      --show-stack-traces
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "⚠️  libraries.js not found, skipping library verification"
fi

echo ""
echo "📊 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If verification failed, the issue is likely:"
echo "1. viaIR compilation produces different bytecode"
echo "2. BaseScan cannot reproduce IR-compiled bytecode"
echo "3. Manual verification or redeployment may be needed"
echo ""
echo "Next steps:"
echo "1. Check BaseScan for verification status"
echo "2. Review implementation_plan.md for solutions"
echo "3. Consider redeploying without viaIR if verification is critical"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
