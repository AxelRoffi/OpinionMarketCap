import { Wallet, ArrowRight, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

export default function QuickStartPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Quick Start Guide
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Get trading opinions in under 5 minutes on the OpinionMarketCap testnet
        </p>
      </div>

      {/* Prerequisites Alert */}
      <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Before You Start</h3>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• You'll need a crypto wallet (MetaMask or Coinbase Wallet recommended)</li>
              <li>• This is testnet - no real money required!</li>
              <li>• All tokens are free from faucets</li>
              <li>• Takes ~5 minutes to complete setup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step-by-Step Process */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-8">4-Step Quick Start Process</h2>
        
        {/* Step 1: Connect Wallet */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 ml-12">
            <p className="text-gray-300 mb-4">Navigate to the dApp and connect your wallet to Base Sepolia testnet.</p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">🚀 Launch dApp</span>
                <a 
                  href="https://app.opinionmarketcap.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  app.opinionmarketcap.xyz
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Click "Connect Wallet" in the top right corner</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Choose MetaMask, Coinbase Wallet, or WalletConnect</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Approve the connection in your wallet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Get Testnet Tokens */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
            <h3 className="text-xl font-semibold text-white">Get Testnet Tokens</h3>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 ml-12">
            <p className="text-gray-300 mb-4">You need Base Sepolia ETH (for gas) and USDC (for trading). Both are free!</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-emerald-400 font-semibold mb-2">🔷 Base Sepolia ETH</h4>
                <p className="text-gray-300 text-sm mb-3">Required for transaction fees</p>
                <a 
                  href="https://www.alchemy.com/faucets/base-sepolia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                >
                  Alchemy Base Faucet
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">💰 USDC Testnet</h4>
                <p className="text-gray-300 text-sm mb-3">Used for all trading</p>
                <div className="text-xs text-gray-400 font-mono bg-gray-700 rounded p-2 mb-2 break-all">
                  0x036CbD53842c5426634e7929541eC2318f3dCF7e
                </div>
                <a 
                  href="https://faucet.circle.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                >
                  Circle USDC Faucet
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                <strong>💡 Pro Tip:</strong> Request at least 100 USDC to have plenty for trading. Most opinions cost 1-20 USDC to trade.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Make Your First Trade */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
            <h3 className="text-xl font-semibold text-white">Make Your First Trade</h3>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 ml-12">
            <p className="text-gray-300 mb-4">Choose between creating a new opinion or trading existing ones.</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-4">
                <h4 className="text-orange-400 font-semibold mb-2">🎯 Create Opinion (Leader Path)</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Click "Create Opinion" button</li>
                  <li>• Enter engaging question (max 52 chars)</li>
                  <li>• Provide initial answer</li>
                  <li>• Set initial price (1-100 USDC)</li>
                  <li>• Choose 1-3 categories</li>
                  <li>• Pay creation fee (20% of initial price, min 5 USDC)</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">⚡ Trade Opinion (Trader Path)</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Browse existing opinions</li>
                  <li>• Click on interesting question</li>
                  <li>• Review current answer & price</li>
                  <li>• Click "Submit New Answer"</li>
                  <li>• Provide better answer</li>
                  <li>• Pay current price to take ownership</li>
                </ul>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4">
              <p className="text-emerald-300 text-sm">
                <strong>🏆 Recommended:</strong> Start by trading existing opinions to understand the mechanics before creating your own!
              </p>
            </div>
          </div>
        </div>

        {/* Step 4: Join a Pool */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
            <h3 className="text-xl font-semibold text-white">Join a Pool (Optional)</h3>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 ml-12">
            <p className="text-gray-300 mb-4">Pool system allows collective ownership of expensive opinions (≥100 USDC).</p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Navigate to "Pools" section</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Find a pool targeting an opinion you're interested in</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Contribute USDC to the pool</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">Share profits when the pool successfully trades</span>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                <strong>🚀 Advanced:</strong> Pools are perfect for expensive opinions where individual trading might be too costly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Issues & Solutions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Common Issues & Solutions</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">❌ "Insufficient allowance" error</h3>
            <p className="text-gray-300 text-sm mb-2">
              <strong>Solution:</strong> You need to approve USDC spending before trading.
            </p>
            <p className="text-gray-400 text-sm">The dApp will prompt you to approve USDC when needed. Always approve the exact amount or more.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Wallet not connecting</h3>
            <p className="text-gray-300 text-sm mb-2">
              <strong>Solution:</strong> Ensure you're on Base Sepolia network.
            </p>
            <p className="text-gray-400 text-sm">Check our <a href="/wallet-setup" className="text-emerald-400 hover:underline">Wallet Setup guide</a> for detailed network configuration.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Transaction failing</h3>
            <p className="text-gray-300 text-sm mb-2">
              <strong>Solution:</strong> Make sure you have enough Base Sepolia ETH for gas fees.
            </p>
            <p className="text-gray-400 text-sm">Each transaction costs ~$0.01 worth of ETH on testnet. Get more from the Alchemy faucet if needed.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Opinion not loading</h3>
            <p className="text-gray-300 text-sm mb-2">
              <strong>Solution:</strong> Refresh the page or check if the opinion was deactivated.
            </p>
            <p className="text-gray-400 text-sm">Some opinions may be moderated. Look for the "Active" status indicator.</p>
          </div>
        </div>
      </section>

      {/* Success Checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Success Checklist</h2>
        
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">✅ You're ready when you have:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Wallet connected to Base Sepolia</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Base Sepolia ETH for gas</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">USDC testnet tokens (50+ recommended)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Completed first trade</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Understanding of fee structure</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Ready to explore pools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">What's Next?</h2>
          <p className="text-gray-300 mb-6 text-center">Now that you're set up, dive deeper into the platform capabilities</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <a 
              href="/platform-basics" 
              className="bg-gray-900 border border-gray-800 hover:border-emerald-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-emerald-400 font-semibold mb-2">📚 Learn the Basics</h3>
              <p className="text-gray-300 text-sm">Understand core mechanics and economics</p>
            </a>
            
            <a 
              href="/creating-opinions" 
              className="bg-gray-900 border border-gray-800 hover:border-orange-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-orange-400 font-semibold mb-2">🎯 Create Opinions</h3>
              <p className="text-gray-300 text-sm">Master the art of question creation</p>
            </a>
            
            <a 
              href="/trading-guide" 
              className="bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-cyan-400 font-semibold mb-2">⚡ Trading Strategies</h3>
              <p className="text-gray-300 text-sm">Advanced tips for successful trading</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}