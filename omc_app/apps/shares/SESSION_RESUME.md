# Session Resume Prompt - Answer Shares App

## Quick Start Next Session
```
Continue working on the Answer Shares app. Read apps/shares/SESSION_RESUME.md for context.

Last session (Feb 12, 2025): Implemented 3-column answer grid, compact cards, and upgraded contract to v2.2.0 with volume tracking fix.

Contract proxy: 0x43C8f0774b7635cf16eCf2238b974ad3b0370937 (Base Sepolia)
```

## Project Location
```
/Users/axelroffi/Desktop/OpinionMarketCap/OpinionMarkeCap-ALL/OpinionMarketCap_V1/opinionmarketcap_app/omc_app/apps/shares
```

## Current Deployed Contract

**Base Sepolia (Testnet):**
| Contract | Address |
|----------|---------|
| **Proxy (USE THIS)** | `0x43C8f0774b7635cf16eCf2238b974ad3b0970937` |
| Implementation | Upgraded to v2.2.0 |
| Version | v2.2.0 |
| USDC Token | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

**Configuration:**
- Treasury: `0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9`
- Question Creation Fee: $2 USDC
- Answer Proposal Stake: $5 USDC
- Platform Fee: 1.5% (150 bps)
- Creator Fee: 0.5% (50 bps)
- Question Sale Fee: 10% platform

## What Was Completed (Feb 12, 2025 - Latest Session)

### UI Changes
1. **3-Column Answer Grid** - Answers now display in responsive grid:
   - 1 column on mobile
   - 2 columns on tablet (md)
   - 3 columns on desktop (lg)

2. **Compact AnswerCard** - Redesigned for grid layout:
   - Removed 160px chart section
   - Kept % variation badge (shows price change)
   - 2x2 stats grid (Pool, Price, Shares, Holders)
   - Compact position info inline
   - Full height cards for alignment

3. **Relocated Sidebar Content**:
   - "Question Creator" moved into question header card (left side)
   - "How Shares Work" removed (already in Quick Trade panel as collapsible)

4. **Modal Scrolling** - All modals have `max-h-[90vh] overflow-y-auto`

5. **Propose New Answer** - Integrated into Quick Trade dropdown (purple option)

6. **Home Page Cards** - Added MCap label and price/share display

7. **ListQuestionModal** - Added fee breakdown UI (90% seller / 10% platform)

### Contract Changes (v2.2.0)
- **Volume Tracking Fix**: `sellShares()` now adds `grossReturn` to `question.totalVolume`
- Volume = sum of all buy + sell trades

### Bug Fixes
- Fixed Question struct parsing (10 fields: added owner, salePrice)
- Fixed BigInt conversion errors
- Fixed webpack cache corruption (clear .next folder)

## Key Files

| File | Purpose |
|------|---------|
| `contracts/AnswerSharesCore.sol` | Main contract (v2.2.0) |
| `src/app/questions/[id]/page.tsx` | Question detail page (3-col grid) |
| `src/components/answers/AnswerCard.tsx` | Compact answer card |
| `src/components/trading/InlineTradingPanel.tsx` | Quick Trade panel |
| `src/hooks/useQuestions.ts` | Questions hook with leading answer data |
| `src/hooks/useQuestion.ts` | Single question hook |
| `scripts/upgrade-volume-fix.js` | Upgrade script for v2.2.0 |

## Dev Server
```bash
cd apps/shares && npm run dev  # Runs on port 3003
```

## Commands
```bash
# Start dev server
npm run dev

# Build
npm run build

# Clear cache (if webpack errors)
rm -rf .next && npm run build

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Upgrade contract
npx hardhat run scripts/upgrade-volume-fix.js --network baseSepolia
```

## Contract Features Summary

### v2.1.0 Features
- 2 decimal places for shares (`SHARES_DECIMALS = 100`)
- Question Marketplace (list/buy/transfer)
- Owner field separate from creator
- Sale price tracking

### v2.2.0 Features
- Volume tracking includes sells (not just buys)

## WalletConnect
- Project ID: `a7338e7cc63e3567c5749216ca5c7f8d`
- Configured in `.env.local`

## Git Status
- Branch: `main`
- Latest commit: `a49d3fc` - feat(shares): 3-column answer grid + UI improvements
- Pushed to origin

## Potential Next Tasks
1. Test 3-column layout on live site
2. Contract verification on BaseScan (API issues before)
3. Portfolio page enhancements
4. Leaderboard improvements
5. Mobile responsiveness testing
6. Deploy to Base Mainnet when ready
