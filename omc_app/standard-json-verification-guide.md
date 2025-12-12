
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
- Optimizer Runs: 1
- Via IR: YES ✅
- Metadata Bytecode Hash: none

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

```bash
npx hardhat verify --network base-mainnet \
  0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 \
  --libraries libraries.js
```
