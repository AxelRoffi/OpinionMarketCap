#!/bin/bash

echo "🔧 Attempting Forge verification (alternative to Hardhat)"
echo "=================================================="

CONTRACT_ADDRESS="0xC47bFEc4D53C51bF590beCEA7dC935116E210E97"
CONSTRUCTOR_ARGS=""  # Empty for upgradeable contracts
CHAIN_ID="8453"  # Base mainnet
COMPILER_VERSION="0.8.20"
CONTRACT_NAME="OpinionCoreSimplified"
CONTRACT_PATH="contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified"

# Method 1: Using cast (Foundry)
echo -e "\n📤 Method 1: Using cast verify-contract..."
cast verify-contract \
    ${CONTRACT_ADDRESS} \
    ${CONTRACT_PATH} \
    --chain-id ${CHAIN_ID} \
    --num-of-optimizations 1 \
    --compiler-version ${COMPILER_VERSION} \
    --via-ir \
    --libraries PriceCalculator:0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7 \
    --etherscan-api-key ${BASESCAN_API_KEY} \
    --watch

# Method 2: Direct API call with curl
echo -e "\n📤 Method 2: Direct API verification..."
curl -X POST https://api.basescan.org/api \
    -d "apikey=${BASESCAN_API_KEY}" \
    -d "module=contract" \
    -d "action=verifysourcecode" \
    -d "contractaddress=${CONTRACT_ADDRESS}" \
    -d "sourceCode=$(cat flattened-opinioncore-viair.sol | jq -Rs .)" \
    -d "contractname=${CONTRACT_NAME}" \
    -d "compilerversion=v${COMPILER_VERSION}+commit.a1b79de6" \
    -d "optimizationUsed=1" \
    -d "runs=1" \
    -d "viaIR=1" \
    -d "libraryname1=PriceCalculator" \
    -d "libraryaddress1=0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7"

echo -e "\n✅ Verification requests submitted!"
echo "Check status at: https://basescan.org/address/${CONTRACT_ADDRESS}#code"