# BaseScan Contract Verification Guide

## Quick Verification Steps

1. **Go to BaseScan verification page**:
   https://basescan.org/verifyContract

2. **Fill in details**:
   - **Contract Address**: `0x64997bd18520d93e7f0da87c69582d06b7f265d5`
   - **Compiler Type**: `Solidity (Single file)`
   - **Compiler Version**: `v0.8.20+commit.a1b79de6`
   - **Open Source License**: `MIT`

3. **Advanced Settings** (Click "Advanced Settings"):
   - ✅ **Optimization**: `Yes`
   - **Runs**: `1`
   - ✅ **Enable via-IR**: `Yes` (CRITICAL - fixes Stack too deep error)
   - **EVM Version**: `Default`
   - **Metadata Hash**: `None`
   - **Debug Revert Strings**: `Strip`

4. **Source Code**:
   - Use the flattened contract from: `flattened-opinioncore.sol`
   - Copy the entire content into the source code field

5. **Constructor Arguments**:
   - Leave empty (this appears to be a proxy or implementation contract)

6. **Submit for verification**

## After Verification

Once verified, you can:
- Go to the Contract tab on BaseScan
- Click "Write Contract" 
- Connect your admin wallet
- Execute admin functions directly through BaseScan

This bypasses any Safe UI issues!