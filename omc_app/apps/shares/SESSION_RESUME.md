# Session Resume Prompt - Answer Shares App

## Project Location
```
/Users/axelroffi/Desktop/OpinionMarketCap/OpinionMarkeCap-ALL/OpinionMarketCap_V1/opinionmarketcap_app/omc_app/apps/shares
```

## What Was Completed (Feb 11, 2025)
Implemented **2 decimal places for shares** (Polymarket-style):

**Contract (`contracts/AnswerSharesCore.sol` v2.0.0):**
- `SHARES_DECIMALS = 100` (1 share = 100 internal units)
- Updated price formula: `(poolValue * 1e6 * SHARES_DECIMALS) / totalShares`
- $5 USDC at $1/share = 4.90 shares (after 2% fee)

**Frontend:**
- `formatShares()` auto-divides BigInt by 100 for display
- Fixed price calculations in Buy/Sell modals
- Added InlineTradingPanel, PriceSparkline, ActivityFeed, market stats

## Current Deployed Contract
- **Base Sepolia**: `0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA` (v1.2.0 - OLD, no decimals)
- **New contract v2.0.0 needs deployment** to test decimal shares

## Next Steps
1. **Deploy v2.0.0 contract** to Base Sepolia with decimal shares
2. **Update contract address** in `src/lib/contracts.ts`
3. **Test end-to-end**: buy/sell with fractional shares
4. Consider: upgrade script vs fresh deployment

## Dev Server
```bash
cd apps/shares && npm run dev  # Runs on port 3003
```

## Key Files
- Contract: `contracts/AnswerSharesCore.sol`
- Contract config: `src/lib/contracts.ts` (SHARES_DECIMALS, addresses)
- Share formatting: `src/lib/utils.ts` (formatShares)
- Trading: `src/components/trading/` (BuySharesModal, SellSharesModal, InlineTradingPanel)

## Quick Start Next Session
Copy this to start your next Claude Code session:

```
Continue working on the Answer Shares app. Read apps/shares/SESSION_RESUME.md for context.

Last session: Implemented 2 decimal places for shares in contract and frontend.
Next: Deploy the updated v2.0.0 contract to Base Sepolia and test.
```
