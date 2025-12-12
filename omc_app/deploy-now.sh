#!/bin/bash
echo "🚀 Starting deployment at $(date)"
npx hardhat run scripts/step-by-step-deploy.js --network base-mainnet
echo "✅ Deployment completed at $(date)"