# Deployment and Initialization Plan

## Deployment Order
1. Deploy the USDC contract (or use an existing address)
2. Deploy FeeManager
3. Deploy PoolManager
4. Deploy OpinionCore (reference to FeeManager and PoolManager)
5. Deploy OpinionMarket (reference to all other contracts)

## Role Initialization (CRITICAL for security)
After deployment, run the `setup-roles.js` script to properly configure the authorizations between contracts.

## Post-Deployment Verifications
1. Verify that OpinionCore has granted MARKET_CONTRACT_ROLE to OpinionMarket
2. Verify that OpinionCore has granted POOL_MANAGER_ROLE to PoolManager
3. Verify that FeeManager has granted CORE_CONTRACT_ROLE to OpinionCore
4. Test a complete operation flow to ensure that authorizations work