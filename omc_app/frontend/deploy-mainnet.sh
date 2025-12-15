#!/bin/bash

# Deploy script for OpinionMarketCap Frontend to Mainnet
# Target: app.opinionmarketcap.xyz

echo "🚀 Deploying OpinionMarketCap to Mainnet..."
echo "📍 Target: app.opinionmarketcap.xyz"
echo "⚠️  WARNING: This will deploy to PRODUCTION with REAL MONEY!"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please ensure .env.production is configured with mainnet settings."
    exit 1
fi

# Confirm deployment
read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Building for production..."
# Use production environment
export NODE_ENV=production
npm run build:production

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# If using Vercel
if command -v vercel &> /dev/null; then
    echo "🔧 Deploying with Vercel..."
    echo "Make sure app.opinionmarketcap.xyz is configured in Vercel dashboard"
    
    # Deploy to production
    vercel --prod
    
    echo ""
    echo "✅ Deployment initiated!"
    echo "📍 Check https://app.opinionmarketcap.xyz once deployment completes"
else
    echo "⚠️  Vercel CLI not found. Please install with: npm i -g vercel"
    echo "Or deploy manually using your preferred method."
fi

echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✓ Verify environment at https://app.opinionmarketcap.xyz"
echo "2. ✓ Test wallet connection"
echo "3. ✓ Create a test opinion"
echo "4. ✓ Verify redirect after opinion creation works"
echo "5. ✓ Check network is Base Mainnet (not testnet)"
echo ""
echo "🎉 Deployment script completed!"