# FeeManager Contract Architecture Analysis

## Overview
The FeeManager contract is a sophisticated, upgradeable smart contract that manages all fee-related operations for the OpinionMarketCap platform. It follows OpenZeppelin's security patterns and implements role-based access control.

## Key Features

### 1. Security Patterns
- **Upgradeable**: Uses OpenZeppelin's upgradeable contracts pattern
- **Access Control**: Role-based permissions with 3 distinct roles
- **Reentrancy Protection**: Uses `nonReentrant` modifier
- **Pausable**: Can be paused in emergency situations
- **SafeERC20**: Safe token transfers to prevent common vulnerabilities

### 2. Role System
- **ADMIN_ROLE**: Full administrative control (fee parameters, role management)
- **TREASURY_ROLE**: Can withdraw platform fees to treasury
- **CORE_CONTRACT_ROLE**: Allows OpinionCore contract to accumulate fees

### 3. Fee Structure
- **Platform Fee**: 2% (goes to treasury)
- **Creator Fee**: 3% (goes to opinion creator)
- **MEV Penalty**: 20% (anti-MEV protection)
- **Configurable**: All fees can be updated by admin with cooldown protection

## Core Functions Analysis

### Fee Accumulation (`accumulateFee`)
- **Purpose**: Called by OpinionCore to accumulate fees for users
- **Access**: Restricted to CORE_CONTRACT_ROLE
- **Storage**: Uses `mapping(address => uint96) accumulatedFees`
- **Events**: Emits `FeesAccumulated` and `FeesAction` events

### Fee Claiming (`claimAccumulatedFees`)
- **Purpose**: Allows users to claim their accumulated fees
- **Access**: Public (any user can claim their own fees)
- **Security**: Uses checks-effects-interactions pattern
- **Protection**: Reentrancy guard, pausable, zero-amount check

### Dependencies
- **USDC Token**: ERC20 contract for fee payments
- **Treasury**: Address that receives platform fees
- **OpinionCore**: Contract that accumulates fees (must have CORE_CONTRACT_ROLE)

## Key State Variables

### Fee Tracking
- `accumulatedFees[address]`: Individual user fee balances (uint96)
- `totalAccumulatedFees`: Total fees accumulated for all users (uint96)

### Contract Configuration
- `usdcToken`: IERC20 interface to USDC token
- `treasury`: Address receiving platform fees
- `platformFeePercent`: Platform fee percentage (2%)
- `creatorFeePercent`: Creator fee percentage (3%)

### Security Parameters
- `treasuryChangeTimestamp`: Timelock for treasury changes (48 hours)
- `parameterUpdateCooldown`: Cooldown between parameter updates (1 day)
- `lastParameterUpdate`: Tracks last update time for each parameter

## MEV Protection
- **Rapid Trade Window**: 30 seconds
- **MEV Penalty**: 20% penalty for rapid trades
- **Tracking**: Stores last trade time and price per user per opinion

## Known Issues & Limitations

1. **Missing Dependencies**: Functions `getCreatorForOpinion` and `getCreatorForPool` return `address(0)`
2. **Integration Required**: Needs proper integration with OpinionCore contract
3. **Role Setup**: OpinionCore contract must be granted CORE_CONTRACT_ROLE

## Transaction Flow for Fee Claiming

1. **User calls** `claimAccumulatedFees()`
2. **Contract checks** user has accumulated fees > 0
3. **Reset fees** to 0 (prevents reentrancy)
4. **Transfer USDC** from contract to user
5. **Emit events** for transparency

## Error Conditions

- `NoFeesToClaim()`: User has 0 accumulated fees
- `ZeroAddressNotAllowed()`: Invalid address parameters
- `AccessControlUnauthorizedAccount()`: Insufficient permissions
- Contract paused or insufficient balance

## Integration Points

### OpinionCore Integration
- OpinionCore must call `accumulateFee(recipient, amount)` when fees are generated
- OpinionCore must have CORE_CONTRACT_ROLE granted
- OpinionCore handles the initial USDC collection from users

### Frontend Integration
- Read `getAccumulatedFees(userAddress)` to display claimable fees
- Call `claimAccumulatedFees()` to execute fee claiming
- Monitor events for transaction confirmation

## Deployment Configuration

### Current Addresses (Base Sepolia)
- **FeeManager**: `0xc8f879d86266C334eb9699963ca0703aa1189d8F`
- **USDC Token**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Treasury**: `0xFb7eF00D5C2a87d282F273632e834f9105795067`
- **OpinionCore**: `0xB2D35055550e2D49E5b2C21298528579A8bF7D2f`

## Next Steps for Implementation

1. **Verify Roles**: Ensure OpinionCore has CORE_CONTRACT_ROLE
2. **Test Read Functions**: Verify `getAccumulatedFees` works correctly
3. **Create Minimal Transaction**: Build simplest possible claim transaction
4. **Test Gas Estimation**: Ensure proper gas limits
5. **Implement UI**: Build user-friendly claiming interface