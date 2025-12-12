# Manual Contract Verification Guide

## 🎯 Contract to Verify: OpinionCore

**Address**: `0xC47bFEc4D53C51bF590beCEA7dC935116E210E97`
**Network**: Base Mainnet
**BaseScan URL**: https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code

## 📋 Verification Settings

### Compiler Settings
- **Compiler Type**: Solidity (Single file)
- **Compiler Version**: v0.8.20+commit.a1b79de6
- **Open Source License Type**: MIT

### Optimization Settings
- **Optimization**: Yes
- **Runs**: 1
- **Via IR**: true (if available)

## 📄 Source Code

You need to submit the **flattened contract source code**. The file is already created:
`flattened-opinioncore.sol`

### Steps:
1. Go to BaseScan verification page
2. Select "Solidity (Single file)"
3. Choose compiler version 0.8.20
4. Enable optimization with 1 runs
5. Copy the entire content of `flattened-opinioncore.sol`
6. Paste it in the source code field

## 🔗 Library Addresses

**IMPORTANT**: You'll need to provide these library addresses:

```
PriceCalculator: 0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7
```

### How to add libraries:
1. In the verification form, look for "Library Addresses" section
2. Add:
   - Library Name: `PriceCalculator`
   - Library Address: `0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7`

## 🚨 If Flattened File is Missing

If the flattened file doesn't exist, create it:

```bash
npx hardhat flatten contracts/core/OpinionCoreNoMod.sol > flattened-opinioncore.sol
```

## 🔧 Alternative: Verify via Hardhat

If manual verification fails, try:

```bash
npx hardhat verify --network base-mainnet 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 --libraries libraries.js
```

Where `libraries.js` contains:
```javascript
module.exports = {
  PriceCalculator: "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7"
};
```

## ✅ Verification Success

Once verified, you'll see:
- ✅ Green checkmark on BaseScan
- Readable contract code
- Function interactions available
- Users can verify contract legitimacy

## 📞 If You Need Help

The verification process can be tricky with libraries. If you get stuck:
1. Try the flattened source approach first
2. Make sure library addresses are correct
3. Double-check compiler settings match exactly
4. Contact BaseScan support if needed

**Your contract is working regardless of verification status. Verification is just for transparency and user confidence.**