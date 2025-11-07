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
- **Main branch**: Stable at commit 9010b46 (TypeScript & SSG fixes applied)
- **Latest fixes**: FormData interface compatibility + Next.js 15 SSG support
- **Vercel Status**: ✅ DEPLOYMENT READY (all build errors resolved)
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

## Current Development State (Updated 2025-11-07)

### ✅ Recently Completed (Commits 93226a2 - 9010b46)
1. **TypeScript Compilation**: ✅ Fixed FormData interface compatibility across create form components
2. **Next.js 15 SSG**: ✅ Resolved useSearchParams() Suspense boundary issues
3. **Vercel Deployment**: ✅ All build errors resolved, deployment ready
4. **Form Systems**: ✅ Multi-category selection interfaces working correctly
5. **Static Generation**: ✅ Homepage and all routes successfully prerender

### 🚧 Current Priority Tasks
1. **Admin Dashboard**: Complete `/admin/page.tsx` (34KB in progress)
2. **Mainnet Configuration**: Prepare production environment variables
3. **Security Audit**: Address smart contract vulnerabilities before mainnet
4. **Performance Testing**: Full app testing on test.opinionmarketcap.xyz

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

- When asking what should be next development features, do not forget to implement indexing for fast upload page
- Review all rules in @contracts/core/OpinionCore.sol
- In @contracts/core/PoolManager.sol, add a restriction to create pools only when NextPrice >= 100 USDC to prevent low-value or spam pool creation
- Add referral for free mint, free OpinionCreation
- Remove rate limiting

## Sub-Agent & MCP Architecture Details

### OpinionMarketCap Sub-Agent Architecture

- Comprehensive multi-agent system for automated testing, optimization, and deployment
- Includes specialized agents for smart contract validation, UX enhancement, and workflow automation
- Implements modular architecture with distinct capabilities for different development aspects

#### Key Sub-Agents and Their Responsibilities

1. **ContractGuardian (Smart Contract Testing Sub-Agent)**
   - Automates comprehensive smart contract testing workflow
   - Handles compilation, testing, deployment, and security checks
   - Triggers on git commits and contract file changes

2. **UXOptimizer (UI/UX Enhancement Sub-Agent)**
   - Analyzes UI components for performance and accessibility
   - Runs automated audits and generates improvement suggestions
   - Can auto-implement simple UI fixes

3. **Specialized Agents**
   - Trading Logic Validator: Checks opinion trading mechanics
   - Security Auditor: Continuous security monitoring
   - Gas Optimizer: Analyzes and suggests transaction cost reductions
   - Marketing Automation Agent: Handles social media and engagement tasks

#### MCP (Master Control Program) Integrations

- Web3 Development MCP: Handles blockchain-related tooling
- Frontend Testing MCP: Manages comprehensive frontend testing
- Deployment Pipeline MCP: Manages CI/CD and environment configurations

#### Automated Workflow Examples

- Smart Contract Update Flow: Comprehensive testing and deployment verification
- Frontend Enhancement Flow: Automated UI analysis and improvement suggestions

#### Implementation Roadmap

- Phased approach from core testing to full system integration
- Focuses on incrementally adding automation and cross-agent communication

## Security Analysis and Deployment Recommendations

### Critical Security Assessment (Urgent Review Required)

- **Frontend**: 75% ready (professional quality, needs configuration)
- **Smart Contracts**: 35% ready (major security issues)
- **Overall Status**: NOT SAFE for real money deployment

#### Key Security Blockers

1. **Smart Contract Security Issues**
   - Centralized admin control vulnerability
   - Price manipulation risks
   - Unsafe upgrade patterns

2. **Frontend Configuration Risks**
   - Testnet hardcoding
   - Missing financial safety features
   - Lack of transaction protections

#### Recommended Action Plan

- Implement multisig treasury controls
- Fix price manipulation vulnerabilities
- Add secure upgrade governance
- Enhance frontend transaction safety
- Conduct professional security audit
- Launch with strict limits and monitoring

#### Implementation Timeline

- Option 1 (Recommended): 3-4 months comprehensive security fix
- Option 2 (Risky): 2-4 weeks minimal fixes

#### Key Recommendations

- Do not rush to mainnet
- Secure additional funding for security improvements
- Hire specialized security experts
- Implement gradual, limited launch with strict controls

#### Cost-Benefit Analysis

- Quick launch risks: 30-50% exploit probability
- Proper security approach: 90%+ success probability
- Recommended investment: $75k-$150k for comprehensive security hardening

#### Immediate Next Steps

1. Pause mainnet deployment
2. Develop detailed security remediation plan
3. Engage security audit firm
4. Implement recommended fixes
5. Plan phased, controlled launch with strict monitoring

## 🚀 MAINNET LAUNCH READINESS CHECKLIST

### ✅ COMPLETED (Frontend - 90% Ready)
- [x] **TypeScript Compilation**: All interface compatibility issues resolved
- [x] **Next.js 15 SSG**: Static generation working correctly
- [x] **Vercel Deployment**: Build pipeline stable and error-free
- [x] **Form Systems**: Create opinion forms fully functional
- [x] **Wallet Integration**: wagmi 2.15.6 + RainbowKit 2.2.8 working
- [x] **Real-time Events**: Alchemy webhook integration implemented
- [x] **Responsive Design**: Mobile and desktop UI complete
- [x] **Category System**: Multi-category selection with adult content verification

### 🚧 IN PROGRESS (25% Complete)
- [ ] **Admin Dashboard**: Complete `/admin/page.tsx` implementation
- [ ] **Environment Configuration**: Mainnet vs testnet environment switching
- [ ] **Production Wagmi Config**: Mainnet-ready wallet configuration
- [ ] **Error Handling**: Production-grade error boundaries and fallbacks

### ❌ CRITICAL BLOCKERS (0% Complete - MUST FIX BEFORE MAINNET)

#### 1. Smart Contract Security (HIGH PRIORITY)
- [ ] **Centralized Admin Controls**: Implement multisig treasury
- [ ] **Price Manipulation**: Fix auction dynamics vulnerabilities
- [ ] **Upgrade Governance**: Remove unsafe upgrade patterns
- [ ] **Access Control**: Audit role-based permissions
- [ ] **Economic Exploits**: Review fee distribution logic
- [ ] **Reentrancy Protection**: Audit all state-changing functions

#### 2. Professional Security Audit (REQUIRED)
- [ ] **External Audit**: Engage Consensys Diligence, Trail of Bits, or OpenZeppelin
- [ ] **Formal Verification**: Mathematical proof of core trading logic
- [ ] **Economic Security**: Game theory analysis of incentive mechanisms
- [ ] **Integration Testing**: Full end-to-end security testing

#### 3. Production Infrastructure (MEDIUM PRIORITY)
- [ ] **Mainnet Contracts**: Deploy to Base mainnet with proper configuration
- [ ] **USDC Integration**: Switch from testnet to mainnet USDC token
- [ ] **RPC Configuration**: Production-grade RPC endpoints with failover
- [ ] **Monitoring**: Real-time alerting for contract interactions
- [ ] **Circuit Breakers**: Emergency pause mechanisms

#### 4. Legal & Compliance (REQUIRED)
- [ ] **Terms of Service**: Legal framework for prediction markets
- [ ] **Regulatory Review**: Compliance with gambling/securities laws
- [ ] **Privacy Policy**: GDPR/CCPA compliance
- [ ] **Risk Disclosures**: Clear warning about financial risks

#### 5. Launch Strategy (FINAL PHASE)
- [ ] **Beta Testing**: Limited launch with trusted users
- [ ] **Liquidity Bootstrap**: Initial market makers and content
- [ ] **Marketing Campaign**: Professional landing page and social media
- [ ] **Community Guidelines**: Moderation policies and enforcement

### ⏰ ESTIMATED TIMELINE TO MAINNET

#### FAST TRACK (6-8 weeks) - HIGH RISK
- Week 1-2: Smart contract security fixes
- Week 3-4: Basic external audit
- Week 5-6: Production deployment and testing
- Week 7-8: Limited mainnet launch

#### RECOMMENDED TRACK (3-4 months) - SECURE
- Month 1: Comprehensive smart contract remediation
- Month 2: Professional security audit and fixes
- Month 3: Production infrastructure and legal compliance
- Month 4: Beta testing and controlled mainnet launch

### 💰 ESTIMATED COSTS
- **Security Audit**: $50k-$100k (professional audit firm)
- **Legal Compliance**: $25k-$50k (regulatory review)
- **Infrastructure**: $5k-$10k/month (production RPC + monitoring)
- **Insurance**: $10k-$25k (smart contract insurance)
- **Total Launch Budget**: $90k-$185k

### 🔥 CRITICAL RECOMMENDATION
**DO NOT LAUNCH TO MAINNET** until smart contract security issues are resolved. The current 35% security readiness poses unacceptable risks for real money transactions.

**Next Immediate Action**: Schedule security audit consultation with reputable firm.