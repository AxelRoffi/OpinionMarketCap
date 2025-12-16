import { Zap, Shield, TrendingUp, Users, BarChart3, Globe } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Platform Overview
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Understanding OpinionMarketCap: The first marketplace where opinions become tradeable assets
        </p>
      </div>

      {/* What is OpinionMarketCap */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What is OpinionMarketCap?</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            OpinionMarketCap is a revolutionary prediction market platform built on the Base blockchain that transforms opinions into tradeable digital assets. Our core philosophy is simple: <span className="text-emerald-400 font-semibold">"Own The Narrative, Earn The Profits"</span>.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Unlike traditional prediction markets focused on binary outcomes, OpinionMarketCap creates liquid markets around open-ended questions and evolving narratives. Users can create questions, provide answers, and trade ownership rights while earning from the ongoing conversation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">🎯 Opinion Leaders</h3>
            <p className="text-gray-300 text-sm">Create compelling questions, set initial narratives, and earn royalties from every future trade on your questions.</p>
          </div>
          <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">⚡ Opinion Traders</h3>
            <p className="text-gray-300 text-sm">Provide winning answers, own trending conversations, and profit when others want to take over your narrative.</p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <TrendingUp className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Dynamic Pricing</h3>
            <p className="text-gray-400 text-sm">Algorithmic bonding curve pricing ensures fair price discovery with no manipulation possible.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <Shield className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Anti-MEV Protection</h3>
            <p className="text-gray-400 text-sm">Built-in protection against front-running and other MEV attacks for fair trading.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <Users className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Pool System</h3>
            <p className="text-gray-400 text-sm">Collective funding pools allow communities to jointly own and control opinions.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <BarChart3 className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
            <p className="text-gray-400 text-sm">Live price charts, trading volume, and competition metrics for informed decision making.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <Zap className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Instant Trading</h3>
            <p className="text-gray-400 text-sm">Fast, gas-optimized transactions on Base blockchain with USDC settlements.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <Globe className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Open Protocol</h3>
            <p className="text-gray-400 text-sm">Fully decentralized smart contracts with transparent, verifiable operations.</p>
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Platform Architecture</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Smart Contract System</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">OpinionCore</span>
              <span className="text-emerald-400 font-mono text-sm">0xB2D35055550e2D49E5b2C21298528579A8bF7D2f</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">FeeManager</span>
              <span className="text-emerald-400 font-mono text-sm">0xc8f879d86266C334eb9699963ca0703aa1189d8F</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">PoolManager</span>
              <span className="text-emerald-400 font-mono text-sm">0x3B4584e690109484059D95d7904dD9fEbA246612</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">USDC Token</span>
              <span className="text-emerald-400 font-mono text-sm">0x036CbD53842c5426634e7929541eC2318f3dCF7e</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Frontend Deployment</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">dApp (Trading)</span>
              <a href="https://test.opinionmarketcap.xyz" className="text-cyan-400 hover:underline">test.opinionmarketcap.xyz</a>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Landing Page</span>
              <a href="https://opinionmarketcap.xyz" className="text-cyan-400 hover:underline">opinionmarketcap.xyz</a>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Network</span>
              <span className="text-cyan-400">Base Sepolia Testnet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Platform Status</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">🧪 Current Status: Testnet</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Running on Base Sepolia testnet</li>
              <li>• Full feature set available for testing</li>
              <li>• Real-time Alchemy webhook integration</li>
              <li>• Comprehensive admin dashboard</li>
              <li>• Anti-MEV protection active</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-3">🚀 Mainnet Roadmap</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Q1 2025: Mainnet deployment</li>
              <li>• Professional security audit</li>
              <li>• Multisig treasury controls</li>
              <li>• Advanced governance system</li>
              <li>• Mobile-first optimization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading Opinions?</h2>
          <p className="text-gray-300 mb-6">Jump into the testnet and experience the future of opinion markets</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/quick-start" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Quick Start Guide
            </a>
            <a 
              href="https://test.opinionmarketcap.xyz" 
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Launch dApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}