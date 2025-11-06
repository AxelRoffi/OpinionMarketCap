# OpinionMarketCap Mainnet Deployment Guide

## 🚀 Overview

This guide walks you through deploying OpinionMarketCap to Base Mainnet with real USDC. Follow each step carefully as this involves real money.

## ⚠️ Security Checklist Before Deployment

- [ ] SecurityAuditor Agent has implemented all 5 critical security fixes
- [ ] All security vulnerabilities have been resolved
- [ ] Smart contracts have been thoroughly tested on testnet
- [ ] Multisig treasury wallet has been created and tested
- [ ] All team members understand emergency procedures

## 📋 Pre-Deployment Requirements

### 1. Environment Setup
```bash
# Copy the mainnet environment template
npm run mainnet:setup

# Edit .env.mainnet with your values
vim .env.mainnet
```

### 2. Required Information
- **Mainnet Private Key** - Deployment wallet (needs 0.05+ ETH)
- **BaseScan API Key** - Get from https://basescan.org/apis
- **Production Treasury** - MUST be multisig (Gnosis Safe recommended)
- **Admin Wallets** - 3-5 admin addresses for governance
- **Notification Webhooks** - Slack/Discord for alerts

### 3. Wallet Preparation
```bash
# Your deployment wallet needs:
# - 0.05+ ETH for gas fees (Base mainnet)
# - Access to your mainnet private key
# - Should NOT be your personal wallet (create dedicated deployment wallet)

# Check balance before deployment
npx hardhat run scripts/check-mainnet-balance.ts --network base
```

## 🔧 Deployment Process

### Option A: Safe Deployment (Recommended)

For maximum security, deploy through a multisig:

```bash
# 1. Validate everything is ready
npm run mainnet:validate

# 2. Generate Safe transaction data
npx hardhat run scripts/generate-safe-deployment.ts --network base

# 3. Import transaction into Safe wallet
# - Copy the generated JSON
# - Import into your Safe wallet interface
# - Collect required signatures (3/5)
# - Execute the transaction

# 4. Verify deployment
npm run mainnet:verify
```

### Option B: Direct Deployment

⚠️ **Use only if you fully understand the risks:**

```bash
# 1. Final validation
npm run mainnet:validate

# 2. Deploy to mainnet (THIS USES REAL ETH!)
npm run mainnet:deploy

# 3. Verify contracts on BaseScan
npm run mainnet:verify

# 4. Start monitoring
npm run mainnet:monitor
```

## 📊 Post-Deployment Checklist

### 1. Contract Verification
- [ ] OpinionCore verified on BaseScan
- [ ] FeeManager verified on BaseScan  
- [ ] PoolManager verified on BaseScan
- [ ] All contracts showing green checkmarks

### 2. Functional Testing
```bash
# Test basic functionality on mainnet
npx hardhat run scripts/test-mainnet-deployment.ts --network base

# Verify USDC integration
npx hardhat run scripts/test-usdc-integration.ts --network base

# Test admin functions
npx hardhat run scripts/test-admin-controls.ts --network base
```

### 3. Frontend Configuration

Update your frontend to use mainnet:

```bash
# In your frontend directory
cd frontend/

# Update environment for production
export NEXT_PUBLIC_ENVIRONMENT=production
export NEXT_PUBLIC_CHAIN_ID=8453

# Update contract addresses in lib/contracts.ts
# Use addresses from deployments/mainnet-deployment.json

# Deploy frontend to production
npm run build
npm run deploy # or your preferred deployment method
```

### 4. Monitoring Setup

```bash
# Start health monitoring
npm run mainnet:monitor

# Set up automated alerts
node scripts/setup-alerts.js

# Configure dashboard
# Import grafana-dashboard.json into your Grafana instance
```

## 🛡️ Security Measures

### 1. Treasury Security
- **MUST** be a multisig wallet (3/5 minimum)
- Test multisig functionality before mainnet
- Have emergency response procedures ready

### 2. Admin Access Control
- Distribute admin roles across multiple wallets
- Use hardware wallets for admin keys
- Never store private keys in plain text

### 3. Launch Strategy
```bash
# Start with restricted access
# Only admins can create questions initially
npx hardhat run scripts/set-admin-only-mode.ts --network base

# Gradually increase limits
# Start with 1K USDC daily volume limit
npx hardhat run scripts/set-launch-limits.ts --network base

# Monitor for 48 hours before opening to public
npm run mainnet:monitor
```

## 📈 Gradual Rollout Plan

### Phase 1: Admin Testing (Day 1-2)
- Admin-only question creation
- Max 10 USDC per trade
- Max 100 USDC daily volume
- 24/7 monitoring

### Phase 2: Limited Beta (Day 3-7) 
- Invite 10-20 trusted users
- Max 100 USDC per trade
- Max 1K USDC daily volume
- Daily health checks

### Phase 3: Public Launch (Day 8+)
- Open question creation to public
- Max 1K USDC per trade
- Max 10K USDC daily volume
- Automated monitoring with alerts

## 🚨 Emergency Procedures

### If Something Goes Wrong

```bash
# 1. PAUSE THE SYSTEM IMMEDIATELY
npx hardhat run scripts/emergency-pause.ts --network base

# 2. Notify all stakeholders
# Use your configured webhooks

# 3. Assess the situation
npm run mainnet:monitor
npx hardhat run scripts/emergency-assessment.ts --network base

# 4. If funds are at risk, prepare emergency withdrawal
npx hardhat run scripts/prepare-emergency-withdrawal.ts --network base
```

### Emergency Contacts
- Technical Lead: [Your primary contact]
- Security Expert: [Security lead contact]
- Legal/Compliance: [Legal contact]
- Community Manager: [Community contact]

## 📊 Key Metrics to Monitor

### Technical Metrics
- Transaction success rate (should be >95%)
- Average gas costs (should be <$0.50)
- Contract response times
- Error rates by function

### Business Metrics  
- Daily active users
- Daily trading volume
- Question creation rate
- User retention

### Security Metrics
- Failed transaction patterns
- Unusual gas usage
- Rapid price movements
- Access control violations

## 🔧 Troubleshooting Common Issues

### Deployment Fails
```bash
# Check gas prices
npx hardhat run scripts/check-gas-price.ts --network base

# Check wallet balance
npx hardhat run scripts/check-balance.ts --network base

# Validate environment
npm run mainnet:validate
```

### Contract Verification Fails
```bash
# Manual verification on BaseScan
# 1. Go to basescan.org
# 2. Search for your contract address
# 3. Click "Contract" tab
# 4. Click "Verify and Publish"
# 5. Follow verification wizard
```

### Frontend Connection Issues
```bash
# Check contract addresses match
# Compare frontend config with deployment addresses

# Verify network configuration
# Ensure RPC URLs are correct

# Test wallet connection
# Use MetaMask network settings for Base
```

## 🎯 Success Criteria

Your mainnet deployment is successful when:

- [ ] All contracts deployed and verified
- [ ] Basic functionality tests pass
- [ ] Frontend connects and displays data
- [ ] Multisig treasury is operational
- [ ] Monitoring systems are active
- [ ] Emergency procedures are tested
- [ ] Team is ready for 24/7 support

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs** - All scripts provide detailed logging
2. **Review this guide** - Ensure all steps were followed
3. **Test on testnet first** - Replicate issue on Base Sepolia
4. **Contact the team** - Use your designated emergency contacts

## 🎉 Post-Launch Activities

After successful deployment:

1. **Announce launch** - Social media, blog post, community
2. **Monitor closely** - First 48 hours are critical
3. **Gather feedback** - User experience and issues
4. **Plan updates** - Based on real-world usage
5. **Scale gradually** - Increase limits as confidence grows

---

**Remember: Mainnet deployment involves real money. Take your time, double-check everything, and don't hesitate to ask for help.**

**Good luck with your launch! 🚀**