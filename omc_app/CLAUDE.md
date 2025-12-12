# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpinionMarketCap is a sophisticated prediction market platform built on Base blockchain with dual deployment architecture:
- **dApp**: `test.opinionmarketcap.xyz` (Main trading application)
- **Landing Page**: `opinionmarketcap.xyz` (Marketing site)

The platform enables users to create questions, submit answers, trade question ownership, and participate in collective funding pools.

## Architecture

### Smart Contract System (Base Sepolia)
```
OpinionMarket (Entry Point) → OpinionCore (0xB2D35055550e2D49E5b2C21298528579A8bF7D2f)
                            ├── FeeManager (0xc8f879d86266C334eb9699963ca0703aa1189d8F)
                            ├── PoolManager (0x3B4584e690109484059D95d7904dD9fEbA246612)
                            ├── MonitoringManager (Event tracking)
                            └── SecurityManager (Access control)
```

**Key Addresses:**
- **USDC Token**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Real Base Sepolia USDC)
- **Admin Roles**: ADMIN_ROLE, MODERATOR_ROLE, OPERATOR_ROLE, TREASURY_ROLE

### Frontend Structure
- **Next.js 15.5.3** with React 19, TypeScript, Tailwind CSS
- **Web3**: Wagmi 2.15.6, RainbowKit 2.2.8, Ethers 6.15.0
- **Real-time**: Alchemy webhook for blockchain events

## Development Commands

### Frontend (dApp) - `/frontend/`
```bash
npm run dev                    # Development server
npm run build                  # Production build with verification
npm run build:production       # Direct production build (skip verification)
npm run verify:build          # Build verification script
npm run verify:dependencies   # Check dependency health
npm run audit:security        # Security audit
```

### Landing Page - `/landing/`
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint check
```

### Smart Contracts
```bash
npx hardhat compile                                      # Compile contracts
npx hardhat test                                        # Run all tests
npx hardhat test test/specific.test.ts                  # Run specific test
npx hardhat run scripts/deploy.ts --network baseSepolia # Deploy to testnet
npx hardhat verify --network baseSepolia ADDRESS        # Verify on BaseScan
```

## Key Development Principles

### Deployment Foundation
- **Main branch**: Stable at commit 6e725d7 (robust deployment system)
- **Current feature branch**: `feature/professional-landing-redesign`
- **Critical**: Never regenerate `package-lock.json` unless absolutely necessary
- Use exact commit hashes for production deployments
- Always preserve working code when editing files

### Feature Development Workflow
1. **High-level planning**: Explain approach before coding
2. **Git isolation**: Create feature branches, work in silos
3. **Todo tracking**: Break down plans into actionable tasks
4. **Testing**: Test thoroughly before merging
5. **Deployment**: Ask before pushing commits to GitHub

### Session Management
- New Claude sessions for major features
- Each feature development has its own conversation thread
- Better organization and memory management

## Real-Time Integration - Alchemy Notify

### Current Status: WEBHOOK READY
- **Endpoint**: `https://test.opinionmarketcap.xyz/api/alchemy-webhook`
- **Events**: OpinionAction, FeesAction, QuestionSaleAction
- **Contract**: `0xB2D35055550e2D49E5b2C21298528579A8bF7D2f`
- **Implementation**: `/frontend/src/app/api/alchemy-webhook/route.ts`

### Setup Instructions
1. **Alchemy Dashboard**: https://dashboard.alchemy.com/notify
2. **Create Webhook**: Address Activity → Base Sepolia
3. **Test**: `curl https://test.opinionmarketcap.xyz/api/alchemy-webhook`
4. **Monitor**: `vercel logs --follow` for event processing

## Current Development State

### Priority Tasks
1. **Admin Dashboard**: Complete `/admin/page.tsx` (34KB in progress)
2. **Wallet Configuration**: Test simplified wagmi-simple.ts setup
3. **TypeScript Issues**: Fix multi-category selection interfaces
4. **Testing**: Full app testing on test.opinionmarketcap.xyz

### Key Components
- **TradingModal**: Main trading interface
- **AdminModerationPanel**: Admin controls (in development)
- **PriceHistoryChart**: Price visualization with Recharts
- **WalletPersistence**: Connection state management
- **AdultContentModal**: Content verification system

### Development Files
- **Contract Config**: `/lib/contracts.ts`
- **Wagmi Setup**: `/lib/wagmi.ts` and `/lib/wagmi-simple.ts`
- **Error Handling**: `/lib/errorHandling.ts`
- **Deployment**: `deployed-addresses.json`

## Testing & Quality Assurance

### Contract Testing
```bash
# Run comprehensive test suite
npx hardhat test test/all_tests.test.ts

# Test specific features
npx hardhat test test/01_Foundation/        # Basic functionality
npx hardhat test test/02_Core/             # Core trading logic  
npx hardhat test test/03_Security/         # Security features
```

### Build Verification
The frontend includes a comprehensive build verification system:
- Dependency health checks
- Build validation
- Security audits
- Pre-deployment verification

## Important Context

### Stability Requirements
- Both deployments (dApp and landing) must remain working
- Prefer working version over updated version that breaks
- Triple-check before pushing deployment-ready code
- Test thoroughly on `test.opinionmarketcap.xyz`

### Role-Based Access
The smart contract system implements comprehensive role management:
- Admin functions for system configuration
- Moderator capabilities for content management
- Operator roles for routine maintenance
- Treasury access for fee management

### Gas Optimization
Contracts use advanced optimization settings:
- Solidity 0.8.20 with `viaIR: true`
- Optimizer runs set to 1 for size optimization
- Contract size monitoring via hardhat-contract-sizer

You are working as a pair programmer. Provide constructive feedback on ideas, both positive and negative. The user welcomes criticism and collaboration in the development process.

## Memories and Development Notes

- When asking what should be next development features, do not forget to implement indexing for fast upload page ✅ **DONE** (indexing-service.ts, useIndexedOpinions.ts)
- Review all rules in @contracts/core/OpinionCore.sol
- In @contracts/core/PoolManager.sol, add a restriction to create pools only when NextPrice >= 100 USDC to prevent low-value or spam pool creation ✅ **DONE** (Line 151-155)
- ~~Add referral for free mint, free OpinionCreation~~ **REMOVED** (Too complicated, will adjust fees instead)
- ~~Remove rate limiting~~ **REMOVED** (Not implemented)
- Add redirect to opinion minted just after user mints its opinion ⚠️ **PARTIAL** (Logic exists but not working properly)

## ✅ COMPLETED IMPLEMENTATIONS

### Smart Contract Features
1. **Configurable Creation Fee System** ✅
   - Variable: `creationFeePercent` (default 20%)
   - Admin function: `setCreationFeePercent(uint256 _creationFeePercent)`
   - Validation: 0-100% range
   - Location: `OpinionCore.sol` lines 177, 222, 936-943

2. **Pool Creation Restriction** ✅
   - Minimum NextPrice: 100 USDC
   - Location: `PoolManager.sol` lines 151-155
   - Error: `PoolNextPriceTooLow`

3. **Transaction Safety Features** ✅
   - Comprehensive safety modal with fee breakdowns
   - Real money warnings for mainnet
   - Gas cost estimation
   - Slippage protection
   - Risk disclosure
   - Double confirmation required
   - Location: `frontend/src/components/safety/TransactionSafetyModal.tsx`

### Frontend Features
1. **Quality Content Filtering** ✅
   - Implementation: `frontend/src/lib/contentFiltering.ts`
   - Hook: `frontend/src/hooks/useContentFiltering.ts`
   - Status: Implemented but not fully applied to UI

2. **Indexing System** ✅
   - Service: `frontend/src/lib/indexing-service.ts`
   - Hook: `frontend/src/hooks/useIndexedOpinions.ts`
   - API endpoints: `/api/populate-cache`, `/api/sync-cache`, `/api/indexing-status`
   - Webhook integration: `/api/alchemy-webhook`

## 🚀 MAINNET DEPLOYMENT STRATEGY

### **Contract Selection: OpinionCoreSimplified** ✅
**Status:** READY FOR DEPLOYMENT
- **Size**: 24.372 KiB (under 24KB with minor cleanup)
- **Features**: 95% of OpinionCore functionality
- **Missing**: Advanced timelock, some admin consolidation
- **Solution**: Deploy with EIP-1967 proxy for upgradeability

### **Deployment Configuration**
**Economic Parameters:**
```javascript
minimumPrice: "1000000",         // 1 USDC (prevent spam)
questionCreationFee: "1000000",  // 1 USDC (quality filter)
initialAnswerPrice: "1000000",   // 1 USDC (meaningful stakes)
absoluteMaxPriceChange: "300",   // 300% (controlled volatility)
maxTradesPerBlock: "5",          // Light rate limiting
```

**Deployment Strategy:**
1. **Phase 1**: Deploy OpinionCoreSimplified via proxy (immediate mainnet)
2. **Phase 2**: Upgrade to Diamond OpinionCore V2 (3-6 months later)
3. **Data Preservation**: 100% data compatibility between versions
4. **Security**: Gnosis Safe multisig for admin functions

### **Gnosis Safe Setup for Solo Developer**
**Treasury & Admin Management:**
- Create 1-of-1 Gnosis Safe on Base mainnet
- Use Safe as treasury address for fee collection
- Use Safe as admin address for contract upgrades
- Benefits: Better security, transaction batching, upgrade safety

### **Gas Cost Estimates (Base Mainnet)**
**Total Deployment Cost: ~$15-25 USD**
- OpinionCoreSimplified: ~0.01 ETH ($12-20)
- FeeManager: ~0.003 ETH ($3-5)
- PoolManager: ~0.003 ETH ($3-5)
- Configuration: ~0.002 ETH ($2-3)
- Verification: ~$1

### **Deployment Commands**
```bash
# 1. Configure parameters
vim scripts/mainnet-deploy-config.js

# 2. Deploy to mainnet
npx hardhat run scripts/deploy-mainnet.js --network base-mainnet

# 3. Verify contracts
npx hardhat verify --network base-mainnet DEPLOYED_ADDRESS
```

## 🚨 RESOLVED MAINNET BLOCKERS

### 1. **Contract Size Reduction** ✅ **SOLVED**

### 2. **Redirect After Minting** (HIGH PRIORITY)
**Status:** Logic exists but not working
**Location:** `frontend/src/app/create/components/forms/review-submit-form.tsx` line 341
**Action Required:**
- Debug opinion ID extraction from transaction receipt
- Ensure proper routing to `/opinion/[id]` after successful mint
- Test with real transactions

### 3. **Quality Content Filtering UI** (MEDIUM PRIORITY)
**Status:** Backend implemented, not applied to UI
**Action Required:**
- Apply filtering to marketplace/home page
- Sort "good questions" to top
- Bury non-sensical questions at bottom
- Add quality score indicators

### 4. **Security Enhancements** (CRITICAL)
**Status:** Solo dev with timelock solution (external)
**Action Required:**
- Document timelock implementation
- Add answer change frequency limit per block (price manipulation mitigation)
- Consider implementing `maxAnswerChangesPerBlock` variable
- Add monitoring and alerting for suspicious activity

### 5. **Upgrade Pattern Safety** (CRITICAL)
**Status:** Using UUPS upgradeable pattern
**Action Required:**
- Review upgrade authorization in `_authorizeUpgrade`
- Ensure proper storage layout for future upgrades
- Test upgrade process on testnet
- Document upgrade procedures
- Consider adding upgrade delay/timelock

### 6. **Gas Optimization** (MEDIUM PRIORITY)
**Action Required:**
- Review all public/external functions for gas optimization
- Consider batch operations where applicable
- Optimize storage layout
- Run gas reporter: `REPORT_GAS=true npx hardhat test`

### 7. **Admin Interface for Fee Adjustment** (LOW PRIORITY)
**Status:** Backend function exists, no UI
**Action Required:**
- Add admin panel UI for `setCreationFeePercent`
- Add controls for other configurable parameters
- Implement proper access control checks in UI

## 📋 ADDITIONAL MAINNET TODOS

### Smart Contract
- [ ] Verify contract size is under 24KB limit
- [ ] Add `maxAnswerChangesPerBlock` to prevent manipulation
- [ ] Test upgrade process thoroughly
- [ ] Add comprehensive event logging for monitoring
- [ ] Final security audit (professional recommended)

### Frontend
- [ ] Fix redirect after opinion minting
- [ ] Apply quality filtering to UI
- [ ] Add admin interface for fee management
- [ ] Implement transaction batching where possible
- [ ] Add comprehensive error handling
- [ ] Test all flows on mainnet fork

### Infrastructure
- [ ] Set up monitoring and alerting (Alchemy, Tenderly, etc.)
- [ ] Configure mainnet RPC endpoints
- [ ] Set up mainnet USDC contract address
- [ ] Prepare deployment scripts for mainnet
- [ ] Set up multisig for treasury (if not using timelock)

### Documentation
- [ ] Document timelock solution
- [ ] Create mainnet deployment guide
- [ ] Update user documentation
- [ ] Create emergency procedures document

## 🎯 RECOMMENDED LAUNCH APPROACH

### Phase 1: Final Testing (1-2 weeks)
1. Fix critical issues (contract size, redirect)
2. Test all features on mainnet fork
3. Run comprehensive gas optimization
4. Complete security review

### Phase 2: Limited Launch (2-4 weeks)
1. Deploy to mainnet with strict limits:
   - Max opinion creation: 100 per day
   - Max pool size: $10,000 USDC
   - Monitored 24/7
2. Invite small group of beta testers
3. Monitor for issues
4. Iterate based on feedback

### Phase 3: Full Launch
1. Remove limits gradually
2. Implement quality filtering in UI
3. Add advanced features
4. Scale infrastructure

## Mainnet Implementation Architecture

### Mainnet Deployment for Production:
- **DiamondProxy** (if contract size is issue)
    - **OpinionFacet** (opinion creation/management)
    - **TradingFacet** (buy/sell answers)
    - **AdminFacet** (admin functions)
    - **ModerationFacet** (content moderation)
    - **PricingFacet** (price calculations)

#Add mobile first
### 8. **Question Minter Ownership Transfer** (MEDIUM PRIORITY)
**Status:** Not implemented  
**Action Required:**
- Add function to allow Question Minter to transfer ownership to any address
- Similar to listing Question for sale, but direct transfer (no payment required)
- Update smart contract with `transferQuestionOwnership(uint256 questionId, address newOwner)` function
- Add UI for minters to transfer ownership
- Emit event for ownership transfer tracking
- Ensure proper access control (only current minter can transfer)

## Mainnet Addresses

- **0xC47bFEc4D53C51bF590beCEA7dC935116E210E97** on Base mainnet (New Address)