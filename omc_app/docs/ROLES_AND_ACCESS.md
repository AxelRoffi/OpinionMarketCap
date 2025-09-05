# Roles and Access Diagram for Opinion Market

## Contract Structure
```
OpinionMarket
  ├─> OpinionCore
  |    ├─> FeeManager
  |    └─> PoolManager
  ├─> FeeManager
  └─> PoolManager
```

## Authorization and Data Flow
```
+------------------+     +-------------+     +-------------+
| Opinion Market   |---->| OpinionCore |---->| FeeManager  |
| (facade contract)|     | (core       |     | (fee        |
+------------------+     |  logic)     |     |  management)|
        |                +-------------+     +-------------+
        |                      |
        |                      v
        |                +-------------+
        +--------------->| PoolManager |
                         | (pool       |
                         |  management)|
                         +-------------+
```

## Contract Roles Overview

### OpinionCore
- **ADMIN_ROLE** = keccak256("ADMIN_ROLE")
  - General administration role, can modify parameters and roles
- **MODERATOR_ROLE** = keccak256("MODERATOR_ROLE")
  - Can moderate opinions (deactivation/reactivation)
- **MARKET_CONTRACT_ROLE** = keccak256("MARKET_CONTRACT_ROLE")
  - Reserved for the OpinionMarket contract, allows it to interact with OpinionCore
- **POOL_MANAGER_ROLE** = keccak256("POOL_MANAGER_ROLE")
  - Reserved for the PoolManager contract, allows it to update opinions

### FeeManager
- **ADMIN_ROLE** = keccak256("ADMIN_ROLE")
  - Administration of the fee system, can modify parameters
- **TREASURY_ROLE** = keccak256("TREASURY_ROLE")
  - Can withdraw accumulated platform fees
- **CORE_CONTRACT_ROLE** = keccak256("CORE_CONTRACT_ROLE")
  - Reserved for the OpinionCore contract, can accumulate fees and update MEV data

### PoolManager
- **ADMIN_ROLE** = keccak256("ADMIN_ROLE")
  - Pool administration, can modify parameters
- **MODERATOR_ROLE** = keccak256("MODERATOR_ROLE")
  - Can manage pools (extension, cancellation, etc.)

### OpinionMarket
- **ADMIN_ROLE** = keccak256("ADMIN_ROLE")
  - General administration, can update contract addresses
- **MODERATOR_ROLE** = keccak256("MODERATOR_ROLE")
  - Can moderate opinions and pools
- **OPERATOR_ROLE** = keccak256("OPERATOR_ROLE")
  - Can pause/unpause contracts in case of emergency
- **TREASURY_ROLE** = keccak256("TREASURY_ROLE")
  - Can withdraw platform funds

## Inter-Contract Authorizations

| Source Contract | Grants Role | To Target Contract | To Allow |
|----------------|--------------|----------------|----------------|
| OpinionCore | MARKET_CONTRACT_ROLE | OpinionMarket | Calls to opinion functions |
| OpinionCore | POOL_MANAGER_ROLE | PoolManager | Opinion updates by pools |
| FeeManager | CORE_CONTRACT_ROLE | OpinionCore | Fee accumulation, MEV penalties |

## Administrative Roles and Their Functions

| Contract | Role | Main Functions |
|---------|------|----------------------|
| OpinionCore | ADMIN_ROLE | Price parameters, opinion creation, contract updates |
| OpinionCore | MODERATOR_ROLE | Deactivation/reactivation of opinions |
| FeeManager | ADMIN_ROLE | Fee parameters, cooldown periods |
| FeeManager | TREASURY_ROLE | Withdrawal of platform fees |
| PoolManager | ADMIN_ROLE | Pool parameters, creation/contribution fees |
| PoolManager | MODERATOR_ROLE | Deadline management, pool cancellation |
| OpinionMarket | ADMIN_ROLE | Contract address updates |
| OpinionMarket | OPERATOR_ROLE | System pause/unpause |
| OpinionMarket | TREASURY_ROLE | Fee withdrawal via FeeManager |

## Implementation Examples

### OpinionCore Role Usage Example

```solidity
// In OpinionCore.sol
// Role definition
bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");

// Role check in a function
function createOpinion(...) external onlyRole(MARKET_CONTRACT_ROLE) {
    // Only OpinionMarket contract can call this
    // ...
}
```

### FeeManager Role Usage Example

```solidity
// In FeeManager.sol
// Role definition
bytes32 public constant CORE_CONTRACT_ROLE = keccak256("CORE_CONTRACT_ROLE");

// Role check in a function
function accumulateFee(...) external onlyRole(CORE_CONTRACT_ROLE) {
    // Only OpinionCore contract can call this
    // ...
}
```

## Points of Attention

1. **Default Admin Role** - An address with DEFAULT_ADMIN_ROLE can grant any role; manage this role carefully
   
2. **Direct Address Checks** - Some contracts check the address directly instead of using roles:
   ```solidity
   // In PoolManager.sol
   require(msg.sender == address(opinionCore), "Unauthorized caller");
   ```

3. **Reciprocal Verification** - Checks between OpinionCore and PoolManager must be reciprocal to avoid security issues

4. **Role Initialization** - Proper role setup during deployment is critical; use the setup script

5. **Role Naming Confusion** - Same role names (e.g., ADMIN_ROLE) across different contracts have different meanings and permissions

## Deployment Process

1. Deploy contracts in this order:
   - USDC (or use existing)
   - FeeManager
   - PoolManager
   - OpinionCore
   - OpinionMarket

2. After deployment, run the role setup script to configure authorizations

3. Verify role assignments before enabling the system for users