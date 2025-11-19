import { Book, Code, Globe, Zap, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DocsHome() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          OpinionMarketCap Documentation
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Complete documentation for the OpinionMarketCap prediction market platform built on Base blockchain.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link href="/getting-started" className="block group">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <Book className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400">Getting Started</h3>
            <p className="text-gray-400">Learn the basics and start trading opinions on the platform.</p>
          </div>
        </Link>

        <Link href="/smart-contracts" className="block group">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <Code className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400">Smart Contracts</h3>
            <p className="text-gray-400">Technical documentation for developers and integrators.</p>
          </div>
        </Link>

        <Link href="/api-reference" className="block group">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <Globe className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400">API Reference</h3>
            <p className="text-gray-400">Complete API documentation for building on OpinionMarketCap.</p>
          </div>
        </Link>

        <Link href="/trading-guide" className="block group">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <TrendingUp className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400">Trading Guide</h3>
            <p className="text-gray-400">Advanced strategies and tips for successful opinion trading.</p>
          </div>
        </Link>

        <Link href="/security" className="block group">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <Shield className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400">Security</h3>
            <p className="text-gray-400">Security best practices and audit reports.</p>
          </div>
        </Link>

        <Link href="/integrations" className="block group">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <Zap className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400">Integrations</h3>
            <p className="text-gray-400">Connect with wallets, exchanges, and third-party services.</p>
          </div>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-gray-300">Connect your wallet to <a href="https://test.opinionmarketcap.xyz" className="text-emerald-400 hover:underline">test.opinionmarketcap.xyz</a></p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-gray-300">Get some Base Sepolia ETH and USDC from faucets</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-gray-300">Create your first opinion or trade existing ones</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
            <p className="text-gray-300">Join pools to collectively fund and control opinions</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-2">Platform Status</h3>
        <p className="text-gray-300 mb-3">
          Currently running on Base Sepolia testnet. Mainnet deployment planned for Q1 2025.
        </p>
        <div className="flex space-x-4 text-sm">
          <span className="text-gray-400">dApp: <span className="text-emerald-400">test.opinionmarketcap.xyz</span></span>
          <span className="text-gray-400">Network: <span className="text-emerald-400">Base Sepolia</span></span>
        </div>
      </div>
    </div>
  );
}