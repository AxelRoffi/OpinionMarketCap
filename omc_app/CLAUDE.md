# Claude Code Session Memory - OpinionMarketCap Base Mainnet Deployment

## Current Status: READY FOR MAINNET DEPLOYMENT

Contracts verified and deployment tested on local Hardhat network. All systems ready for Base mainnet.

## Architecture: Modular (5 Contracts)

The monolithic `OpinionMarketCapCore` (25.1KB) exceeded the 24KB limit, so we use the **modular architecture**:

| Contract | Size | Location |
|----------|------|----------|
| ValidationLibrary | 0.02 KB | `contracts/active/libraries/` |
| FeeManager | 9.09 KB | `contracts/active/` |
| PoolManager | 17.51 KB | `contracts/active/` |
| OpinionAdmin | 8.02 KB | `contracts/active/` |
| OpinionExtensions | 11.89 KB | `contracts/active/` |
| OpinionCore | 17.57 KB | `contracts/active/` |

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
| poolContributionFee | 0 USDC (free) |
| maxPoolDuration | 60 days |
| earlyExitPenalty | 20% |
| poolThreshold | 100 USDC |
| categories | 40 |
| isPublicCreationEnabled | true |

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

## Documentation

- `contracts/active/MODULAR_DEPLOYMENT_SUMMARY.md` - Full architecture details
- `contracts/active/PRE_DEPLOYMENT_CHECKLIST.md` - Deployment checklist

## Test Script

A deployment test script was created at `scripts/test-deploy.js` that:
- Deploys all 6 contracts with proper library linking
- Verifies all configuration parameters
- Confirms contract interactions work correctly

Run with: `npx hardhat run scripts/test-deploy.js`

## Session History

### January 2025 Session
- Verified modular architecture is the correct deployment target
- Confirmed all contracts compile and are under 24KB
- Created and ran deployment simulation on local Hardhat
- All 6 contracts deployed successfully
- All configuration parameters verified correct
- Updated documentation to reflect current state
