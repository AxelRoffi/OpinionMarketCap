# AnswerSharesCore Enhancement Requests

This file tracks planned contract enhancements for future upgrades.

---

## Enhancement #1: Claimable Sale Proceeds

**Status:** Planned
**Priority:** High
**Requested:** February 11, 2025

### Current Behavior
When a user sells shares, the USDC proceeds are transferred **directly to their wallet**:

```solidity
// AnswerSharesCore.sol line 594-595
usdcToken.safeTransfer(msg.sender, usdcReturned);
```

### Requested Behavior
Sale proceeds should go to the user's **claimable fees balance** instead, allowing users to:
- Accumulate earnings from multiple sales
- Claim whenever they want (batch withdrawals)
- Have consistent UX for all earnings (creator fees + sale proceeds)

### Implementation

In `sellShares()`, replace direct transfer with accumulation:

```solidity
// BEFORE (current):
usdcToken.safeTransfer(msg.sender, usdcReturned);

// AFTER (v2):
accumulatedFees[msg.sender] += uint96(usdcReturned);
totalAccumulatedFees += uint96(usdcReturned);
emit FeesAccumulated(msg.sender, uint96(usdcReturned), accumulatedFees[msg.sender]);
```

### Considerations

1. **uint96 overflow**: Current `accumulatedFees` uses `uint96` which maxes at ~79 billion USDC. Should be fine, but consider `uint128` for safety.

2. **Gas implications**:
   - Selling becomes cheaper (no external transfer)
   - Users pay gas to claim (but can batch)

3. **UX changes needed**:
   - Frontend should show "Claimable Balance" prominently
   - After selling, show "Added to claimable balance" instead of "Sent to wallet"
   - Encourage users to claim periodically

4. **Migration**: Existing users with positions won't be affected - only future sales will use the new logic.

### Files to Update

**Contract:**
- `contracts/AnswerSharesCore.sol` → Create `AnswerSharesCoreV2.sol`

**Frontend:**
- `src/components/trading/SellSharesModal.tsx` - Update success message
- `src/app/portfolio/page.tsx` - Emphasize claimable balance
- Add "Claim All" button in header/nav for quick access

---

## Enhancement #2: [Future Enhancement Title]

**Status:** Not Started
**Priority:** TBD
**Requested:** TBD

### Description
_Add description here_

---

## Upgrade Checklist

When implementing enhancements:

1. [ ] Create new contract version (e.g., `AnswerSharesCoreV2.sol`)
2. [ ] Write comprehensive tests for new functionality
3. [ ] Test upgrade path on local Hardhat
4. [ ] Deploy to Base Sepolia testnet first
5. [ ] Verify contract on BaseScan
6. [ ] Update frontend to handle new behavior
7. [ ] Test full flow on testnet
8. [ ] Deploy upgrade to mainnet (when ready)
9. [ ] Update `CLAUDE.md` with new contract details
