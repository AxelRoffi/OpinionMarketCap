#!/bin/bash

echo "🚀 Starting OpinionMarketCap Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating .env.local from example..."
    cp .env.example .env.local
    echo "✏️ Please edit .env.local with your WalletConnect Project ID"
fi

echo "🌐 Starting development server..."
npm run dev