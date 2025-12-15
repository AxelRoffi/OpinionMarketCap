# OpinionMarketCap Deployment Guide

## Current Production Deployment (Base Mainnet)

### Deployed Contracts
- **OpinionCoreNoMod**: `0xC47bFEc4D53C51bF590beCEA7dC935116E210E97`
- **FeeManager**: `0x64997bd18520d93e7f0da87c69582d06b7f265d5`
- **PoolManager**: `0xd6f4125e1976c5eee6fc684bdb68d1719ac34259`
- **USDC Token**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Official Base USDC)

### Environment Configuration

#### Production (app.opinionmarketcap.xyz)
```env
NEXT_PUBLIC_NETWORK="base"
NEXT_PUBLIC_APP_URL="https://app.opinionmarketcap.xyz"
NEXT_PUBLIC_ALCHEMY_KEY="your-mainnet-alchemy-key"
```

#### Testnet (test.opinionmarketcap.xyz)
```env
NEXT_PUBLIC_NETWORK="baseSepolia"
NEXT_PUBLIC_APP_URL="https://test.opinionmarketcap.xyz"
NEXT_PUBLIC_ALCHEMY_KEY="your-testnet-alchemy-key"
```

## Directory Structure

### Active Contracts
```
contracts/active/
├── OpinionCoreNoMod.sol    # Main contract deployed on mainnet
├── FeeManager.sol          # Fee management
├── PoolManager.sol         # Pool management
├── interfaces/             # All contract interfaces
├── libraries/              # Utility libraries
└── structs/                # Data structures
```

### Active Scripts
```
scripts/_active/
├── deploy-mainnet.js           # Main deployment script
├── mainnet-deploy-config.js    # Configuration for mainnet
├── find-deployed-contracts.js  # Find deployed contracts
├── check-admin-rights.js       # Verify admin permissions
├── verify-opinioncore.js       # Contract verification
├── deploy_v2_final.js          # V2 deployment (future)
└── upgrade_to_v2.js            # V2 upgrade (future)
```

## Deployment Process

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env with your private key and API keys
```

### 2. Deploy to Mainnet
```bash
npx hardhat run scripts/_active/deploy-mainnet.js --network base
```

### 3. Verify Contracts
```bash
npx hardhat run scripts/_active/verify-opinioncore.js --network base
```

### 4. Check Deployment
```bash
npx hardhat run scripts/_active/find-deployed-contracts.js --network base
npx hardhat run scripts/_active/check-admin-rights.js --network base
```

## Frontend Deployment

### Vercel Configuration
1. Set up two deployments:
   - `app.opinionmarketcap.xyz` → Production (mainnet)
   - `test.opinionmarketcap.xyz` → Staging (testnet)

2. Configure environment variables in Vercel dashboard

3. Deploy:
```bash
vercel --prod
```

## Maintenance

### Checking Contract Status
```bash
# Check admin rights
npx hardhat run scripts/_active/check-admin-rights.js --network base

# Find deployed contracts
npx hardhat run scripts/_active/find-deployed-contracts.js --network base
```

### Future Upgrades
The V2 contracts are prepared but not yet deployed. When ready:
1. Deploy V2 implementation using `deploy_v2_final.js`
2. Upgrade proxy using `upgrade_to_v2.js`

## Security Notes
- Always test on testnet first
- Use hardware wallet for mainnet deployments
- Verify all contract addresses before interaction
- Keep private keys secure and never commit them