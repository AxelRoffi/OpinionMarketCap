# BaseScan Verification with viaIR (Stack Too Deep Fix)

## 🔧 Problem: Stack Too Deep Error
The flattened contract has a "Stack too deep" compilation error at line 5577. This requires the IR optimizer to be enabled.

## ✅ Solution: Manual Verification with viaIR

### Step 1: Go to BaseScan Verification
1. Visit: https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code
2. Click "Verify and Publish"

### Step 2: Verification Settings

**Contract Type:** Solidity (Single file)

**Compiler Settings:**
- **Compiler Version:** v0.8.20+commit.a1b79de6
- **Open Source License Type:** MIT

**Optimization Settings:**
- **Optimization:** Yes
- **Optimizer runs:** 1
- **Via IR:** Yes ✅ **CRITICAL - MUST BE ENABLED**

### Step 3: Source Code
Use the file: `flattened-opinioncore-viair.sol` (6270 lines)

### Step 4: Library Addresses
**CRITICAL:** Add these in the "Library Addresses" section:

```
Library Name: PriceCalculator
Library Address: 0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7
```

### Step 5: Constructor Arguments
Leave **EMPTY** (this is an upgradeable contract with no constructor args)

## 🚨 Key Points:
1. **Via IR MUST be enabled** - this is what fixes the "Stack too deep" error
2. The contract was compiled with `viaIR: true` in hardhat.config.ts
3. This is the EXACT compilation setting used for deployment
4. Library address is required for PriceCalculator

## 🔄 Alternative: Hardhat Verify
If manual verification still fails:

```bash
npx hardhat verify --network base-mainnet 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 --libraries libraries.js
```

The hardhat config already has `viaIR: true` so this should work.

## 📋 Verification Checklist:
- [ ] Contract address: 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97
- [ ] Compiler: v0.8.20
- [ ] Optimization: Yes, 1 run
- [ ] **Via IR: YES** ⭐
- [ ] Library: PriceCalculator at 0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7
- [ ] Source: flattened-opinioncore-viair.sol
- [ ] Constructor args: EMPTY

## 🎯 Expected Result:
✅ Contract verified successfully on BaseScan with green checkmark