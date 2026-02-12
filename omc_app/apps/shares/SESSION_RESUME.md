# Session Resume Prompt - Answer Shares App

## Project Location
```
/Users/axelroffi/Desktop/OpinionMarketCap/OpinionMarkeCap-ALL/OpinionMarketCap_V1/opinionmarketcap_app/omc_app/apps/shares
```

## What Was Completed (Feb 12, 2025)

### Contract v2.1.0 Features
1. **2 decimal places for shares** (Polymarket-style)
   - `SHARES_DECIMALS = 100` (1 share = 100 internal units)
   - $5 USDC at $1/share = 4.90 shares (after 2% fee)

2. **Question Marketplace** (NEW)
   - `listQuestionForSale(questionId, price)` - List a question for sale
   - `cancelQuestionSale(questionId)` - Cancel listing
   - `buyQuestion(questionId)` - Buy a listed question (10% platform fee)
   - `transferQuestionOwnership(questionId, newOwner)` - Free transfer

### Contract Changes
- Added `owner` field to Question struct (separate from `creator`)
- Added `salePrice` field to Question struct
- Creator fees now go to `owner` instead of `creator`
- Events: `QuestionListedForSale`, `QuestionSaleCancelled`, `QuestionPurchased`, `QuestionOwnershipTransferred`

## Current Deployed Contract

**Base Sepolia (Testnet):**
| Contract | Address |
|----------|---------|
| **Proxy (USE THIS)** | `0x43C8f0774b7635cf16eCf2238b974ad3b0370937` |
| Implementation | `0x0C9B3D6406A1E3FEF06E82F448A429b0f975e0eA` |
| Version | v2.1.0 |
| USDC Token | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

**Verified Configuration:**
- Treasury: `0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9`
- Question Creation Fee: $2 USDC
- Answer Proposal Stake: $5 USDC
- Platform Fee: 1.5% (150 bps)
- Creator Fee: 0.5% (50 bps)

## Dev Server
```bash
cd apps/shares && npm run dev  # Runs on port 3003
```

## Key Files
- Contract: `contracts/AnswerSharesCore.sol` (21.12 KB)
- Contract config: `src/lib/contracts.ts` (ABI, addresses, types)
- Share formatting: `src/lib/utils.ts` (formatShares)
- Trading: `src/components/trading/` (BuySharesModal, SellSharesModal)

## Next Steps
1. **Build marketplace UI** - Add UI for listing/buying questions
2. **Test buy/sell** - Verify fractional shares work end-to-end
3. **Verify contract on BaseScan** - Run verification command

### Verify Contract Command
```bash
npx hardhat --config ./hardhat.config.js verify --network baseSepolia 0x0C9B3D6406A1E3FEF06E82F448A429b0f975e0eA
```

## Quick Start Next Session
```
Continue working on the Answer Shares app. Read apps/shares/SESSION_RESUME.md for context.

Last session: Added question marketplace (list/buy/transfer) and deployed v2.1.0 to Base Sepolia.
Contract proxy: 0x43C8f0774b7635cf16eCf2238b974ad3b0370937
```
