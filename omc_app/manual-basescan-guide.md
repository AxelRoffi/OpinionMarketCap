# Manual BaseScan Verification Guide (When UI Doesn't Show viaIR)

Since you successfully verified on Sourcify, here are alternative approaches for BaseScan:

## Option 1: API Verification (Recommended)

Run the provided script:
```bash
npm install axios
node basescan-api-verification.js
```

This bypasses the UI and includes viaIR in the API request.

## Option 2: Use Standard JSON Input

1. Go to: https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code
2. Click "Verify and Publish"
3. Choose **"Solidity (Standard Json Input)"** instead of "Solidity (Single file)"
4. Upload the `standard-input.json` file created by the script
5. This format includes viaIR settings in the JSON

## Option 3: Contact BaseScan Support

Since your contract IS verified on Sourcify:
- Proof: https://repo.sourcify.dev/8453/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97

You can:
1. Contact BaseScan support
2. Provide the Sourcify verification link
3. Request they import the verification or enable viaIR option in their UI

## Option 4: Try Different Compiler Versions

Sometimes BaseScan has issues with specific compiler versions. Try:
- v0.8.19+commit.7dd6d404
- v0.8.21+commit.d9974bed

## Option 5: Use Hardhat Verify with Force Flag

```bash
npx hardhat verify --network base-mainnet 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 --libraries libraries.js --force
```

## Why This Is Happening

BaseScan's web interface may not show the "Via IR" option for all compiler versions or contract types. The API supports it but the UI might not. Your contract REQUIRES viaIR due to stack depth issues, which is why normal verification fails.

## Verification Parameters

For any method you use:
- **Contract**: OpinionCoreSimplified
- **Compiler**: v0.8.20+commit.a1b79de6
- **Optimization**: Yes, 1 run
- **Via IR**: YES (critical)
- **Library**: PriceCalculator at 0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7
- **Constructor Args**: None (upgradeable contract)

## Success Indicators

✅ Sourcify: Already verified
❌ BaseScan: Pending (UI limitation)

The contract IS legitimate and verified - BaseScan just needs the viaIR flag.