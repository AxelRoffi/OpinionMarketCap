# 🔍 BaseScan Contract Verification Guide

## Overview

This guide provides step-by-step instructions for verifying OpinionMarketCap contracts on BaseScan (Base Mainnet block explorer).

## Prerequisites

✅ **Contract deployed on Base Mainnet**  
✅ **BaseScan API key configured**  
✅ **Access to deployment data and constructor parameters**  
✅ **Hardhat environment set up**  

## Automatic Verification

### Method 1: Using Hardhat Script

```bash
# Run the automated verification script
npx hardhat run scripts/verify-mainnet-contracts.ts --network base

# Verify specific contract manually
npx hardhat verify --network base CONTRACT_ADDRESS "constructor" "arguments"
```

### Method 2: Individual Contract Verification

#### FeeManager Contract
```bash
npx hardhat verify --network base FEE_MANAGER_ADDRESS 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

#### PoolManager Contract
```bash
npx hardhat verify --network base POOL_MANAGER_ADDRESS 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

#### OpinionCore Proxy
```bash
# Note: UUPS proxies require special handling
npx hardhat verify --network base OPINION_CORE_ADDRESS USDC_ADDRESS FEE_MANAGER_ADDRESS POOL_MANAGER_ADDRESS TREASURY_ADDRESS
```

## Manual Verification (BaseScan UI)

If automatic verification fails, use the BaseScan web interface:

### Step 1: Navigate to Contract
1. Go to [BaseScan.org](https://basescan.org)
2. Enter your contract address in the search bar
3. Click on the contract address

### Step 2: Access Verification Page
1. Click the **"Contract"** tab
2. Click **"Verify and Publish"** button
3. If it's a proxy, select **"Verify Proxy Contract"** instead

### Step 3: Fill Verification Form

#### For Regular Contracts (FeeManager, PoolManager):

**Contract Address:** `Your deployed contract address`  
**Compiler Type:** `Solidity (Single file)` or `Solidity (Standard-Json-Input)`  
**Compiler Version:** `v0.8.20+commit.a1b79de6`  
**Open Source License Type:** `MIT`  

#### Optimization Settings:
- **Optimization:** `Yes`
- **Runs:** `1`
- **Via IR:** `Yes`

#### Constructor Arguments:
For **FeeManager** and **PoolManager**:
```
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

For **OpinionCore**:
```
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
[FEE_MANAGER_ADDRESS]
[POOL_MANAGER_ADDRESS]  
[TREASURY_ADDRESS]
```

### Step 4: Upload Source Code

#### Method A: Standard JSON Input (Recommended)
1. Select **"Solidity (Standard-Json-Input)"**
2. Upload the `contracts/` folder or use Hardhat's compilation artifacts
3. The JSON input includes all imports and settings automatically

#### Method B: Single File Upload
1. Flatten the contract using: `npx hardhat flatten contracts/core/OpinionCore.sol`
2. Copy the flattened code
3. Paste into the source code field
4. Remove duplicate SPDX license identifiers and pragma statements

### Step 5: Submit and Verify
1. Complete the CAPTCHA
2. Click **"Verify and Publish"**
3. Wait for verification (usually 1-2 minutes)

## UUPS Proxy Verification

OpinionCore uses UUPS (Universal Upgradeable Proxy Standard). This requires special handling:

### Automatic Proxy Detection
1. Go to your OpinionCore address on BaseScan
2. BaseScan may automatically detect it's a proxy
3. If detected, click **"Verify Proxy Contract"**
4. The implementation should be auto-detected

### Manual Proxy Verification
If auto-detection fails:

1. **Get Implementation Address:**
   ```bash
   # Using cast (Foundry) or web3
   cast storage PROXY_ADDRESS 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc --rpc-url https://mainnet.base.org
   ```

2. **Verify Implementation First:**
   - Go to the implementation address
   - Verify it as a regular contract
   - Use constructor args: `[USDC, FeeManager, PoolManager, Treasury]`

3. **Link Proxy to Implementation:**
   - Go back to proxy address
   - Click "More Options" → "Is this a proxy?"
   - Enter implementation address

## Troubleshooting

### Common Issues

#### ❌ "Constructor Arguments Error"
- **Cause:** Incorrect constructor parameters
- **Solution:** Double-check parameter types and values
- **ABI Encode:** Use online ABI encoder if needed

#### ❌ "Compilation Error"
- **Cause:** Missing imports or wrong compiler version
- **Solution:** Use exact compiler version (0.8.20) and via-IR option

#### ❌ "Already Verified"
- **Status:** Contract is already verified
- **Action:** No further action needed

#### ❌ "API Rate Limit"
- **Cause:** Too many requests to BaseScan API
- **Solution:** Wait a few minutes and retry

#### ❌ "Proxy Verification Failed"
- **Cause:** Implementation not verified first
- **Solution:** Verify implementation contract, then proxy

### Getting Help

1. **Check BaseScan Status:** [status.basescan.org](https://status.basescan.org)
2. **BaseScan Support:** support@basescan.org
3. **Hardhat Docs:** [hardhat.org/plugins/nomiclabs-hardhat-etherscan](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan)

## Verification Checklist

After successful verification, confirm:

- [ ] ✅ **Source Code Visible:** Contract source code is displayed
- [ ] ✅ **Constructor Args Decoded:** Parameters are properly decoded
- [ ] ✅ **Read Functions:** All view functions are accessible
- [ ] ✅ **Write Functions:** State-changing functions are available (for verified accounts)
- [ ] ✅ **Events Decoded:** Contract events show human-readable data
- [ ] ✅ **Proxy Link:** For OpinionCore, proxy correctly links to implementation

## Post-Verification Steps

1. **Test Contract Interaction:** Try calling read functions on BaseScan
2. **Update Frontend:** Ensure frontend can interact with verified contracts
3. **Documentation:** Update deployment documentation with verification status
4. **Monitoring:** Set up alerts for contract interactions
5. **Security:** Consider additional security audits for verified contracts

## Contract Addresses Template

```bash
# Base Mainnet Contract Addresses
OPINION_CORE_PROXY=0x...
OPINION_CORE_IMPLEMENTATION=0x...
FEE_MANAGER=0x...
POOL_MANAGER=0x...
PRICE_CALCULATOR_LIB=0x...
USDC_TOKEN=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
TREASURY=0x...

# BaseScan URLs
echo "OpinionCore: https://basescan.org/address/$OPINION_CORE_PROXY"
echo "FeeManager: https://basescan.org/address/$FEE_MANAGER"
echo "PoolManager: https://basescan.org/address/$POOL_MANAGER"
```

## Security Notes

🔐 **Never share private keys during verification**  
🔐 **Only verify on official BaseScan (basescan.org)**  
🔐 **Double-check contract addresses before verification**  
🔐 **Verify source code matches your local contracts**  

---

*This guide covers BaseScan verification for OpinionMarketCap v1.0 on Base Mainnet*