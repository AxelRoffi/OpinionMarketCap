# 🚀 OpinionMarketCap Mainnet Deployment Makefile

.PHONY: help install compile test deploy-testnet deploy-mainnet verify monitor clean

# Default target
help: ## Show this help message
	@echo "OpinionMarketCap Mainnet Deployment Commands"
	@echo "============================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Environment Variables Required:"
	@echo "  MAINNET_PRIVATE_KEY         - Mainnet deployment private key"
	@echo "  MAINNET_TREASURY_ADDRESS    - Multisig treasury address"  
	@echo "  BASESCAN_API_KEY           - BaseScan API key for verification"
	@echo ""

# Prerequisites
install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

check-env: ## Validate environment configuration
	@echo "🔍 Checking environment configuration..."
	@if [ -z "$$MAINNET_PRIVATE_KEY" ]; then echo "❌ MAINNET_PRIVATE_KEY not set"; exit 1; fi
	@if [ -z "$$MAINNET_TREASURY_ADDRESS" ]; then echo "❌ MAINNET_TREASURY_ADDRESS not set"; exit 1; fi  
	@if [ -z "$$BASESCAN_API_KEY" ]; then echo "❌ BASESCAN_API_KEY not set"; exit 1; fi
	@echo "✅ Environment configuration valid"

# Development
compile: ## Compile smart contracts
	@echo "🔨 Compiling contracts..."
	npm run compile:clean
	@echo "✅ Compilation complete"

test: ## Run contract tests
	@echo "🧪 Running tests..."
	npm run test:hardhat
	@echo "✅ Tests complete"

size-check: ## Check contract sizes
	@echo "📏 Checking contract sizes..."
	npm run size
	@echo "✅ Size check complete"

# Validation
validate-usdc: ## Validate USDC contract on mainnet
	@echo "🔍 Validating USDC contract..."
	npm run validate:usdc
	@echo "✅ USDC validation complete"

validate-all: check-env validate-usdc ## Run all validations
	@echo "✅ All validations passed"

# Testnet Deployment
deploy-testnet: compile ## Deploy to Base Sepolia testnet
	@echo "🧪 Deploying to testnet..."
	npm run deploy:testnet
	@echo "✅ Testnet deployment complete"

verify-testnet: ## Verify testnet contracts
	@echo "🔍 Verifying testnet contracts..."
	npm run verify:testnet
	@echo "✅ Testnet verification complete"

# Mainnet Preparation
prepare-mainnet: validate-all size-check ## Prepare for mainnet deployment
	@echo "🚀 Preparing for mainnet deployment..."
	@echo "⚠️  Final checks before mainnet:"
	@echo "   1. Contracts compiled and tested"
	@echo "   2. Environment variables validated" 
	@echo "   3. USDC contract verified"
	@echo "   4. Contract sizes within limits"
	@echo "✅ Mainnet preparation complete"

# Mainnet Deployment (Safe Multisig)
deploy-mainnet-safe: prepare-mainnet ## Generate Safe multisig deployment transactions
	@echo "🔒 Generating Safe deployment transactions..."
	npm run deploy:mainnet-safe
	@echo "✅ Safe deployment data generated"
	@echo ""
	@echo "📋 Next steps:"
	@echo "   1. Import transaction batch into Safe wallet"
	@echo "   2. Collect required signatures"
	@echo "   3. Execute deployment through Safe"
	@echo "   4. Run 'make verify-mainnet' after deployment"

# Mainnet Deployment (Direct)
deploy-mainnet-direct: prepare-mainnet ## Deploy directly to mainnet (DANGEROUS)
	@echo "🚨 DIRECT MAINNET DEPLOYMENT - REAL MONEY ALERT!"
	@echo "   This will use real ETH and deploy real contracts"
	@echo "   Are you sure you want to continue? [y/N]"
	@read -r CONFIRM; if [ "$$CONFIRM" != "y" ] && [ "$$CONFIRM" != "Y" ]; then echo "❌ Deployment cancelled"; exit 1; fi
	@echo "🚀 Deploying to mainnet..."
	npm run deploy:mainnet
	@echo "✅ Mainnet deployment complete"

# Verification
verify-mainnet: ## Verify mainnet contracts on BaseScan
	@echo "🔍 Verifying mainnet contracts..."
	npm run verify:mainnet
	@echo "✅ Mainnet verification complete"

# Monitoring
monitor-setup: ## Set up monitoring infrastructure
	@echo "📊 Setting up monitoring..."
	@if [ ! -f monitoring/prometheus-config.yml ]; then echo "❌ Prometheus config not found"; exit 1; fi
	@echo "✅ Monitoring setup ready"

monitor-health: ## Check deployment health
	@echo "🔔 Checking deployment health..."
	npm run monitor:health
	@echo "✅ Health check complete"

monitor-start: ## Start monitoring services
	@echo "📊 Starting monitoring services..."
	@if command -v docker-compose >/dev/null 2>&1; then \
		cd monitoring && docker-compose up -d; \
		echo "✅ Monitoring services started"; \
	else \
		echo "❌ docker-compose not found. Install Docker Compose to use monitoring"; \
		exit 1; \
	fi

monitor-stop: ## Stop monitoring services
	@echo "📊 Stopping monitoring services..."
	@if command -v docker-compose >/dev/null 2>&1; then \
		cd monitoring && docker-compose down; \
		echo "✅ Monitoring services stopped"; \
	else \
		echo "⚠️  docker-compose not found"; \
	fi

# Full Deployment Workflows
mainnet-safe-workflow: ## Complete Safe multisig deployment workflow
	@echo "🔒 Starting Safe deployment workflow..."
	$(MAKE) deploy-mainnet-safe
	@echo ""
	@echo "🎉 Safe deployment workflow complete!"
	@echo "   Follow the generated instructions to complete deployment"

mainnet-direct-workflow: ## Complete direct deployment workflow (DANGEROUS)
	@echo "🚨 Starting direct mainnet workflow..."
	$(MAKE) deploy-mainnet-direct
	$(MAKE) verify-mainnet
	$(MAKE) monitor-health
	@echo ""
	@echo "🎉 Direct mainnet deployment complete!"
	@echo "   Platform is live at https://opinionmarketcap.xyz"

# Maintenance
clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	npx hardhat clean
	rm -rf artifacts cache typechain-types
	@echo "✅ Clean complete"

logs: ## Show recent deployment logs
	@echo "📜 Recent deployment logs..."
	@if [ -f monitoring-report-latest.json ]; then \
		cat monitoring-report-latest.json | jq '.alerts' 2>/dev/null || cat monitoring-report-latest.json; \
	else \
		echo "No logs found. Run monitoring first."; \
	fi

status: ## Show current deployment status
	@echo "📊 Current deployment status..."
	@if [ -f deployed-addresses-mainnet.json ]; then \
		echo "✅ Mainnet deployment found:"; \
		cat deployed-addresses-mainnet.json | jq -r '"OpinionCore: " + .opinionCore, "FeeManager: " + .feeManager, "PoolManager: " + .poolManager, "Deployed: " + .deployedAt' 2>/dev/null; \
	else \
		echo "❌ No mainnet deployment found"; \
	fi

# Emergency
emergency-monitor: ## Emergency monitoring check
	@echo "🚨 EMERGENCY MONITORING CHECK"
	@echo "=============================="
	$(MAKE) monitor-health
	@echo ""
	@echo "📞 If critical issues found:"
	@echo "   1. Check contract addresses on BaseScan"
	@echo "   2. Verify treasury balances"
	@echo "   3. Contact technical support team"
	@echo "   4. Consider pausing contracts if necessary"

# Documentation
docs: ## Generate deployment documentation
	@echo "📚 Generating documentation..."
	@echo "# OpinionMarketCap Mainnet Deployment" > DEPLOYMENT.md
	@echo "" >> DEPLOYMENT.md
	@echo "Generated on: $$(date)" >> DEPLOYMENT.md
	@if [ -f deployed-addresses-mainnet.json ]; then \
		echo "## Contract Addresses" >> DEPLOYMENT.md; \
		cat deployed-addresses-mainnet.json >> DEPLOYMENT.md; \
	fi
	@echo "✅ Documentation generated: DEPLOYMENT.md"

# Quick Start Targets
quick-testnet: compile deploy-testnet verify-testnet ## Quick testnet deployment
	@echo "🎉 Quick testnet deployment complete!"

quick-mainnet-safe: prepare-mainnet deploy-mainnet-safe ## Quick Safe mainnet preparation
	@echo "🎉 Quick Safe preparation complete!"

# Safety Reminders
mainnet-warnings: ## Show important mainnet warnings
	@echo "🚨 MAINNET DEPLOYMENT WARNINGS"
	@echo "==============================="
	@echo ""
	@echo "⚠️  REAL MONEY: All transactions use real ETH and USDC"
	@echo "⚠️  IRREVERSIBLE: Smart contracts cannot be easily changed"
	@echo "⚠️  SECURITY: Ensure private keys are secure"
	@echo "⚠️  TESTING: Test thoroughly on testnet first"  
	@echo "⚠️  MULTISIG: Use Safe multisig for treasury operations"
	@echo "⚠️  MONITORING: Set up monitoring before going live"
	@echo "⚠️  EMERGENCY: Have emergency procedures ready"
	@echo ""
	@echo "✅ Read and understood? Proceed with deployment commands"

# Environment Setup
setup-env: ## Set up environment files
	@echo "⚙️  Setting up environment files..."
	@if [ ! -f .env.mainnet ]; then \
		echo "Creating .env.mainnet from template..."; \
		cp .env.mainnet.template .env.mainnet 2>/dev/null || echo "Template not found"; \
	fi
	@echo "✅ Environment setup complete"
	@echo "   Edit .env.mainnet with your configuration"

# All-in-one targets
all-testnet: install compile test deploy-testnet verify-testnet ## Complete testnet workflow
	@echo "🎉 Complete testnet workflow finished!"

all-mainnet-safe: install mainnet-warnings setup-env mainnet-safe-workflow ## Complete Safe mainnet workflow  
	@echo "🎉 Complete Safe mainnet workflow finished!"