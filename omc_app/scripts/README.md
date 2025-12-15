# Scripts Directory Structure

## Active Scripts
The `_active/` directory contains essential scripts for deployment and management:

### Deployment Scripts
- **deploy-mainnet.js** - Main deployment script for Base mainnet
- **mainnet-deploy-config.js** - Configuration parameters for mainnet deployment
- **deploy_v2_final.js** - Future V2 deployment script
- **upgrade_to_v2.js** - Script to upgrade from V1 to V2

### Utility Scripts
- **find-deployed-contracts.js** - Locate deployed contracts on chain
- **check-admin-rights.js** - Verify admin permissions
- **verify-opinioncore.js** - Verify contracts on BaseScan

## Archive Directory
The `_archive/old_deployments/` directory contains 270+ historical scripts used during development. These are preserved for reference but are not actively maintained.

## Usage Examples

### Deploy to Mainnet
```bash
npx hardhat run scripts/_active/deploy-mainnet.js --network base
```

### Check Deployment
```bash
npx hardhat run scripts/_active/find-deployed-contracts.js --network base
```

### Verify Contracts
```bash
npx hardhat run scripts/_active/verify-opinioncore.js --network base
```