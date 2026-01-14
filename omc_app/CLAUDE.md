# Claude Code Session Memory - OpinionMarketCap Base Mainnet Deployment

## Current Status: DEPLOYED ON BASE MAINNET

All contracts successfully deployed and linked on Base Mainnet (Chain ID: 8453) on January 7, 2025.
Last upgrade: January 14, 2025 (OpinionExtensionsV2)

## Deployed Contract Addresses (Base Mainnet)

### Proxy Addresses (use these in frontend)
| Contract | Proxy Address |
|----------|---------------|
| ValidationLibrary | `0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5` |
| FeeManager | `0x31D604765CD76Ff098A283881B2ca57e7F703199` |
| PoolManager | `0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e` |
| OpinionAdmin | `0x4F0A1938E8707292059595275F9BBD067A301FD2` |
| OpinionExtensions | `0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA` |
| OpinionCore | `0x7b5d97fb78fbf41432F34f46a901C6da7754A726` |

### Implementation Addresses (for verification)
| Contract | Version | Implementation Address |
|----------|---------|------------------------|
| FeeManager | V1 | `0xa427dD680a9F56A26646e89A7DE74235486D07b9` |
| PoolManager | V1 | `0xb0461E420f65d711F84A7dAa0e94893482435617` |
| OpinionAdmin | V1 | `0xeF10FdFaf7876F63450207e62fba9d4b4A70DcBc` |
| OpinionExtensions | **V2** | `0x3c04ea0fb84622b263fbdc91d2a3fe5adb4c6682` |
| OpinionCore | **V2** | `0xe4fE91DDeF3E656905dA64b6194233c5f8DCBf26` |

### Configuration
| Setting | Address |
|---------|---------|
| USDC Token | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Treasury | `0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9` |
| Admin | `0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C` |

### Upgrade History
| Contract | Date | Version | Changes |
|----------|------|---------|---------|
| OpinionCore | Jan 12, 2025 | V2 | Fixed fee transfer bug, added pause/unpause |
| OpinionExtensions | Jan 14, 2025 | V2 | Fixed empty categories validation bug |

## Architecture: Modular (5 Contracts + Library)

The monolithic `OpinionMarketCapCore` (25.1KB) exceeded the 24KB limit, so we use the **modular architecture**:

| Contract | Size | Location |
|----------|------|----------|
| ValidationLibrary | 0.02 KB | `contracts/active/libraries/` |
| FeeManager | 10.5 KB | `contracts/active/` |
| PoolManager | 18.1 KB | `contracts/active/` |
| OpinionAdmin | 9.6 KB | `contracts/active/` |
| OpinionExtensions | 13.2 KB | `contracts/active/` |
| OpinionCore | 19.0 KB | `contracts/active/` |

All contracts are under the 24KB Base blockchain limit.

## Deployment Script

**Location**: `contracts/active/deploy/DeployModularContracts.js`

**Deployment Order**:
1. ValidationLibrary (required for linking)
2. FeeManager
3. PoolManager (with ValidationLibrary linking)
4. OpinionAdmin
5. OpinionExtensions
6. OpinionCore (with ValidationLibrary linking)

## Contract Upgradability (UUPS)

All contracts are UUPS upgradeable:

| Contract | UUPS | Authorization |
|----------|------|---------------|
| OpinionCore | ✅ | `ADMIN_ROLE` |
| FeeManager | ✅ | `ADMIN_ROLE` |
| OpinionAdmin | ✅ | `ADMIN_ROLE` |
| OpinionExtensions | ✅ | `ADMIN_ROLE` |
| PoolManager | ✅ | `ADMIN_ROLE` |

### How to Upgrade
```javascript
const NewImplementation = await ethers.getContractFactory("OpinionCoreV2", {
  libraries: { ValidationLibrary: libAddr }
});
await upgrades.upgradeProxy(proxyAddress, NewImplementation, {
  unsafeAllowLinkedLibraries: true
});
```

## Admin Management

### transferFullAdmin() Function
All contracts have a `transferFullAdmin(address newAdmin)` function for single-call admin transfer:

| Contract | Roles Transferred |
|----------|-------------------|
| OpinionCore | DEFAULT_ADMIN, ADMIN, MODERATOR |
| FeeManager | DEFAULT_ADMIN, ADMIN, TREASURY |
| OpinionAdmin | DEFAULT_ADMIN, ADMIN, MODERATOR, TREASURY |
| OpinionExtensions | DEFAULT_ADMIN, ADMIN |
| PoolManager | DEFAULT_ADMIN, ADMIN, MODERATOR |

**Usage**:
```solidity
// Transfer full admin to new address (call on each contract)
opinionCore.transferFullAdmin(newAdminAddress);
feeManager.transferFullAdmin(newAdminAddress);
poolManager.transferFullAdmin(newAdminAddress);
opinionAdmin.transferFullAdmin(newAdminAddress);
opinionExtensions.transferFullAdmin(newAdminAddress);
```

### Treasury Changes
Treasury address can be changed post-deployment via `setTreasury()` with 48h timelock.

### Individual Role Management
Standard OpenZeppelin AccessControl functions available:
- `grantRole(role, account)`
- `revokeRole(role, account)`
- `renounceRole(role, account)`

## Complete Admin Functions Reference

### OpinionCore (V2)

| Function | Role Required | Description |
|----------|---------------|-------------|
| `pause()` | ADMIN_ROLE | Pause all trading operations |
| `unpause()` | ADMIN_ROLE | Resume trading operations |
| `emergencyWithdraw(token, to, amount)` | ADMIN_ROLE | Emergency withdrawal (only when paused) |
| `rescueStuckFees()` | ADMIN_ROLE | Transfer stuck V1 fees to FeeManager |
| `transferFullAdmin(newAdmin)` | DEFAULT_ADMIN_ROLE | Transfer all admin roles |

### OpinionAdmin

| Function | Role Required | Description |
|----------|---------------|-------------|
| `pause()` | ADMIN_ROLE | Pause OpinionAdmin |
| `unpause()` | ADMIN_ROLE | Unpause OpinionAdmin |
| `emergencyWithdraw(token, to, amount)` | ADMIN_ROLE | Withdraw from OpinionAdmin |
| `setMinimumPrice(price)` | ADMIN_ROLE | Set min price (via OpinionCore) |
| `setQuestionCreationFee(fee)` | ADMIN_ROLE | Set creation fee |
| `setInitialAnswerPrice(price)` | ADMIN_ROLE | Set initial answer price |
| `setMaxInitialPrice(price)` | ADMIN_ROLE | Set max initial price |
| `setMaxPriceChange(change)` | ADMIN_ROLE | Set price change limit |
| `setMaxTradesPerBlock(max)` | ADMIN_ROLE | Set rate limit |
| `togglePublicCreation()` | ADMIN_ROLE | Enable/disable public creation |
| `setCoreContract(addr)` | ADMIN_ROLE | Update OpinionCore address |
| `setFeeManager(addr)` | ADMIN_ROLE | Update FeeManager address |
| `setPoolManager(addr)` | ADMIN_ROLE | Update PoolManager address |
| `setTreasury(addr)` | TREASURY_ROLE | Change treasury (48h timelock) |
| `confirmTreasuryChange()` | TREASURY_ROLE | Confirm treasury change |
| `deactivateOpinion(opinionId)` | MODERATOR_ROLE | Deactivate an opinion |
| `reactivateOpinion(opinionId)` | MODERATOR_ROLE | Reactivate an opinion |
| `moderateAnswer(opinionId, reason)` | MODERATOR_ROLE | Moderate an answer |
| `transferFullAdmin(newAdmin)` | DEFAULT_ADMIN_ROLE | Transfer all roles |

### FeeManager

| Function | Role Required | Description |
|----------|---------------|-------------|
| `pause()` | ADMIN_ROLE | Pause FeeManager |
| `unpause()` | ADMIN_ROLE | Unpause FeeManager |
| `withdrawPlatformFees(token, recipient)` | TREASURY_ROLE | Withdraw platform fees to treasury |
| `claimAccumulatedFees()` | Any user | Claim accumulated creator fees |
| `setPlatformFeePercent(percent)` | ADMIN_ROLE | Set platform fee (max 10%) |
| `setCreatorFeePercent(percent)` | ADMIN_ROLE | Set creator fee (max 10%) |
| `setMevPenaltyPercent(percent)` | ADMIN_ROLE | Set MEV penalty (max 50%) |
| `setTreasury(addr)` | ADMIN_ROLE | Change treasury (48h timelock) |
| `confirmTreasuryChange()` | ADMIN_ROLE | Confirm treasury change |
| `grantCoreContractRole(addr)` | ADMIN_ROLE | Grant CORE_CONTRACT_ROLE |
| `revokeCoreContractRole(addr)` | ADMIN_ROLE | Revoke CORE_CONTRACT_ROLE |
| `transferFullAdmin(newAdmin)` | DEFAULT_ADMIN_ROLE | Transfer all roles |

### PoolManager

| Function | Role Required | Description |
|----------|---------------|-------------|
| `setOpinionCore(addr)` | ADMIN_ROLE | Set OpinionCore address |
| `setPoolCreationFee(fee)` | ADMIN_ROLE | Set pool creation fee |
| `transferFullAdmin(newAdmin)` | DEFAULT_ADMIN_ROLE | Transfer all roles |

### OpinionExtensions

| Function | Role Required | Description |
|----------|---------------|-------------|
| `setCoreContract(addr)` | ADMIN_ROLE | Set OpinionCore address |
| `addCategoryToCategories(category)` | ADMIN_ROLE | Add new category |
| `transferFullAdmin(newAdmin)` | DEFAULT_ADMIN_ROLE | Transfer all roles |

## Configuration Verified

| Parameter | Value |
|-----------|-------|
| minimumPrice | 1 USDC |
| questionCreationFee | 2 USDC (or 20% of initial price, whichever is higher) |
| initialAnswerPrice | 1 USDC |
| maxInitialPrice | 100 USDC |
| maxTradesPerBlock | 0 (unlimited) |
| platformFeePercent | 2% |
| creatorFeePercent | 3% |
| mevPenaltyPercent | 0% (disabled) |
| poolCreationFee | 5 USDC |
| poolContributionFee | 0 USDC (free) |
| maxPoolDuration | 60 days |
| earlyExitPenalty | 20% |
| poolThreshold | 100 USDC |
| categories | 40 |
| maxDescriptionLength | 120 chars | ⚠️ Contract bug - see Known Issues |
| maxQuestionLength | 60 chars |
| maxAnswerLength | 60 chars |
| isPublicCreationEnabled | true |

## Frontend/Landing Alignment

All frontend and landing page values are now aligned with smart contract specs:

| Item | Contract | Frontend | Landing |
|------|----------|----------|---------|
| Creation fee min | 2 USDC | ✅ | ✅ |
| Pool contribution fee | 0 USDC | ✅ | ✅ |
| Pool max duration | 60 days | ✅ | ✅ |
| Description length | 120 chars | ✅ | N/A |
| Categories | 40 | ✅ | N/A |

## Pre-Deployment Checklist

Update `.env` file with:
```bash
TREASURY_ADDRESS=<your-treasury-safe-address>
ADMIN_ADDRESS=<your-admin-safe-address>
USDC_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  # Base Mainnet USDC
```

**Important**: The `.env` currently has placeholder values that MUST be replaced.

## Deployment Command

```bash
npx hardhat run contracts/active/deploy/DeployModularContracts.js --network base
```

## Features

### Core Features
- Opinion creation with 1-100 USDC initial price range
- Answer submission with dynamic bonding curve pricing
- Question trading marketplace
- Question ownership transfer (free)
- Answer ownership transfer (free)
- 40 categories system
- Extension slots for future features

### Pool System
- 100 USDC threshold for pool creation
- 5 USDC pool creation fee
- Free pool contribution (0 USDC fee)
- Dynamic pricing with NextPrice targeting
- Early withdrawal with 20% penalty
- Max 60 days duration

### Fee System
- Platform fees: 2%
- Creator fees: 3%
- MEV protection: Disabled (0%)
- Fee accumulation and claiming
- Treasury management with timelock

### Admin Controls
- All parameters configurable post-deployment
- Pause/unpause functionality
- Emergency withdraw capability
- Role-based access control
- Single-call admin transfer via `transferFullAdmin()`
- UUPS upgradeable contracts

## Admin Frontend

Located at `apps/web/src/app/admin/` with full functionality:
- Role management (grant/revoke admin/moderator)
- Contract pause/unpause
- Price settings (min price, creation fee, max change)
- Text length settings (all configurable)
- Category management
- Treasury management (with 48h timelock)
- Contract upgrade scheduling (with 72h timelock)
- Moderation tools

## Documentation

- `contracts/active/MODULAR_DEPLOYMENT_SUMMARY.md` - Full architecture details
- `contracts/active/PRE_DEPLOYMENT_CHECKLIST.md` - Deployment checklist

## Test Script

A deployment test script exists at `scripts/test-deploy.js` that:
- Deploys all 6 contracts with proper library linking
- Verifies all configuration parameters
- Confirms contract interactions work correctly

Run with: `npx hardhat run scripts/test-deploy.js`

## Session History

### January 6, 2025 Session
- Verified modular architecture is the correct deployment target
- Confirmed all contracts compile and are under 24KB
- Created and ran deployment simulation on local Hardhat
- All 6 contracts deployed successfully
- All configuration parameters verified correct
- Added UUPS upgradability to all contracts (OpinionCore, FeeManager, OpinionAdmin, OpinionExtensions)
- Added `transferFullAdmin()` function to all contracts for single-call admin transfer
- Aligned frontend with contract specs:
  - Fixed creation fee: 5 USDC → 2 USDC minimum in landing/tutorial
  - Fixed pool contribution fee: 1 USDC → 0 USDC (free)
  - Fixed pool max duration: 30 → 60 days
  - Fixed description length: 240 → 280 chars (Note: Actual limit is 120 due to contract bug)
  - Synced categories: 25 → 40 (matching contract)
- **Project cleanup**: Removed 182 obsolete files (70k+ lines deleted):
  - Old deployment JSONs and configuration files
  - Old verification scripts
  - Old analysis/utility scripts
  - Flattened contracts and temp files
  - Old HTML test files
  - Old contract folders (`_archive`, `core`, `fixed`, `simple`, `documentation`, `src`)
- Committed cleanup to GitHub (`b9dd517`)

### January 7, 2025 Session - MAINNET DEPLOYMENT
- Fixed deployment script for ethers v6 compatibility
- Added `setCoreContract()` to OpinionAdmin and OpinionExtensions for post-deployment linking
- Added `setOpinionCore()` to PoolManager for post-deployment linking
- Added `unsafeAllowLinkedLibraries: true` for ValidationLibrary linking
- **Successfully deployed all 6 contracts to Base Mainnet**
- Linked all contracts (PoolManager, OpinionAdmin, OpinionExtensions → OpinionCore)
- Updated frontend with new contract addresses (`apps/web/src/lib/contracts.ts` and `contracts-mainnet.ts`)
- Deployment info saved to `deployments/base-mainnet-final.json`

### January 8, 2025 Session - CONTRACT VERIFICATION
All contracts successfully verified on BaseScan:
- ✅ ValidationLibrary: `0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5`
- ✅ OpinionCore impl: `0xe4fe91ddef3e656905da64b6194233c5f8dcbf26`
- ✅ FeeManager impl: `0xa427dD680a9F56A26646e89A7DE74235486D07b9`
- ✅ PoolManager impl: `0xb0461E420f65d711F84A7dAa0e94893482435617`
- ✅ OpinionAdmin impl: `0xeF10FdFaf7876F63450207e62fba9d4b4A70DcBc`
- ✅ OpinionExtensions impl: `0x5B84109Bf13E4564EA6F4d6F6c24c161d7597c98`

**Key insights for verification**:
- Must use exact build-info from `artifacts/build-info/*.json` (includes `debug.revertStrings: "strip"`)
- For contracts with many dependencies, create minimal JSON with only required imports
- Use `scripts/extract-minimal-json.js [ContractName]` to generate verification JSONs
- Verification files saved in `deployments/`: `*-minimal.json` and `*-exact.json`

### January 12, 2025 Session - V2 UPGRADE
- **Fixed critical fee transfer bug**: Fees were stuck in OpinionCore instead of being transferred to FeeManager
- **Upgraded OpinionCore to V2** with:
  - `pause()` / `unpause()` admin functions
  - `emergencyWithdraw()` function (when paused)
  - `rescueStuckFees()` to recover V1 fees
  - Fixed `submitAnswer()` to transfer fees to FeeManager
- **Rescued 0.3641 USDC** stuck fees from V1 to FeeManager
- **Fixed FeeManager permissions**: Granted CORE_CONTRACT_ROLE to OpinionCore
- **Fixed hardcoded contract addresses** in frontend hooks (old testnet addresses)
- **Updated frontend**: Transparent fee breakdown in trading modal
- **Updated Solidity to 0.8.22** for OpenZeppelin 5.x compatibility

**V2 Implementation**: `0xe4fE91DDeF3E656905dA64b6194233c5f8DCBf26`

---

## Known Issues (Deployed Contracts)

### Fee Transfer Bug (V1) - FIXED in V2
**Severity:** Critical
**Status:** ✅ FIXED in V2 upgrade (January 12, 2025)

**Issue:** In V1, `submitAnswer()` collected fees but didn't transfer them to FeeManager. Fees (5% = 2% platform + 3% creator) were stuck in OpinionCore.

**Fix:** V2 now transfers fees to FeeManager after each trade. Stuck V1 fees (0.3641 USDC) were rescued.

### Description Length Limit Bug
**Severity:** Medium
**Status:** Active in deployed contracts
**Affected:** OpinionCore.sol, ValidationLibrary.sol

**Issue:** The contract defines `MAX_DESCRIPTION_LENGTH = 280` but calls `ValidationLibrary.validateDescription(description)` without passing the maxLength parameter. The overloaded function without the parameter defaults to **120 characters**.

**Location:**
- `contracts/active/OpinionCore.sol:231` - calls `ValidationLibrary.validateDescription(description)`
- `contracts/active/libraries/ValidationLibrary.sol:89` - defaults to 120 chars

**Impact:** Users cannot create opinions with descriptions longer than 120 characters, even though the UI previously showed 280 as the limit.

**Fix for V2:** Change the call to `ValidationLibrary.validateDescription(description, MAX_DESCRIPTION_LENGTH)` to use the configurable limit.

### Empty Categories Validation Bug - FIXED in V2
**Severity:** Medium
**Status:** ✅ FIXED in V2 upgrade (January 14, 2025)
**Affected:** OpinionExtensions.sol

**Issue:** The `validateCategories()` function in OpinionExtensions only checks if there are **too many** categories (max 3), but doesn't check if there are **zero** categories. An empty array passes validation and returns `true`, allowing opinions to be created without any categories.

**Location:**
- `contracts/active/OpinionExtensions.sol:263-278` - `validateCategories()` missing minimum check
- Note: `ValidationLibrary.validateOpinionCategories()` has the correct check at line 111, but OpinionCore uses OpinionExtensions

**Impact:** Opinions can be created without categories. Opinion #1 on mainnet has empty categories array.

**Fix:** OpinionExtensionsV2.sol created with:
```solidity
uint256 public constant MIN_CATEGORIES_PER_OPINION = 1;

function validateCategories(string[] memory _categories) external view returns (bool) {
    if (_categories.length < MIN_CATEGORIES_PER_OPINION) return false;  // V2 FIX
    if (_categories.length > MAX_CATEGORIES_PER_OPINION) return false;
    // ... rest of validation
}
```

**Upgrade Script:** `contracts/active/deploy/UpgradeOpinionExtensionsV2.js`

**V2 Implementation:** `0x3c04ea0fb84622b263fbdc91d2a3fe5adb4c6682`

### Poor Transaction Error Messages
**Severity:** Low (UX issue)
**Status:** Needs improvement
**Affected:** Frontend transaction handling

**Issue:** When transactions revert on-chain, users see generic error messages like "Transaction reverted" without clear explanation of why (e.g., description too long, invalid category, insufficient allowance).

**Improvement needed:**
- Parse revert reasons from contract errors
- Map common revert messages to user-friendly explanations
- Show specific validation errors before transaction is sent (client-side pre-validation)
- Add better error decoding in `review-submit-form.tsx` and other transaction forms

---

## Security Concerns for V2 Upgrade (per contract)

### ValidationLibrary
1. **Empty description handling**: `validateDescription` allows empty strings - consider if desired in all contexts
2. **keccak256 collisions**: Category name comparison via `keccak256` may have collisions - consider alternatives
3. **Edge case validation**: No validation for negative values or overflow/underflow scenarios
4. **Comprehensive input validation**: Not all functions have thorough input validation

### OpinionCore
1. **SafeERC20**: Continue using SafeERC20 for token transfers ✅
2. **Access Control**: Properly implements role-based access ✅
3. **ReentrancyGuard**: Protected against reentrancy ✅
4. **Rate Limiting**: Ensure rate limit is set appropriately for system requirements
5. **Parameter Updates**: Ensure only authorized contracts can update core parameters
6. **Event Emission**: Events logged for monitoring ✅

### FeeManager
1. **Treasury Management**: Ensure treasury change process (with timelock) cannot be manipulated
2. **Parameter Cooldown**: Cooldown period may impact flexibility - evaluate trade-offs
3. **MEV Protection**: Verify MEV penalty mechanism effectively mitigates risks
4. **Withdrawal Security**: Ensure only treasury can withdraw accumulated fees
5. **Zero Address Checks**: Implemented ✅
6. **SafeERC20**: Using SafeERC20 ✅

### PoolManager
1. **Insufficient Access Control**: Consider more granular role permissions with minimal privileges
2. **Integer Overflow**: Ensure all token amount calculations are secure (SafeMath)
3. **Address Validation**: Validate all addresses passed to functions
4. **External Calls**: Secure trust boundaries in `distributePoolRewards` and similar
5. **Consistent Error Handling**: Provide informative error messages
6. **Gas Optimization**: Consider minimizing storage reads/writes

### OpinionAdmin
1. **Treasury Timelock**: Delay mechanism may introduce risks - cannot be exploited to delay critical updates
2. **Deactivate/Reactivate**: Currently stubs - implement proper moderation logic to prevent abuse
3. **Input Validation**: Ensure all external function inputs are validated
4. **Pending Treasury Change**: Potential attack vector if not handled securely
5. **External Calls**: Verify role grant/revoke functions are secure

### OpinionExtensions
1. **Category Management**: Validate category additions/removals cannot cause inconsistencies
2. **Extension Slots**: Future extensions should follow same security patterns
3. **Role Permissions**: Ensure only authorized accounts can modify extensions
