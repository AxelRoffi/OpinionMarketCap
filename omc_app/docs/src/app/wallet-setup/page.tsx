import { Wallet, ExternalLink, Copy, AlertTriangle, CheckCircle, Settings, Smartphone } from "lucide-react";

export default function WalletSetupPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Wallet Setup Guide
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Configure your crypto wallet for seamless trading on OpinionMarketCap
        </p>
      </div>

      {/* Supported Wallets */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Wallets</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-8 w-8 text-orange-400" />
              <h3 className="text-lg font-semibold text-orange-400">MetaMask</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Most popular browser extension wallet with excellent Base support.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Browser extension</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Mobile app available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Hardware wallet support</span>
              </div>
            </div>
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm"
            >
              Download MetaMask
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-8 w-8 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-400">Coinbase Wallet</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Native Base support with excellent mobile experience and built-in dApp browser.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Native Base integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Mobile-first design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Built-in dApp browser</span>
              </div>
            </div>
            <a 
              href="https://wallet.coinbase.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              Download Coinbase Wallet
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-8 w-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">WalletConnect</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Connect any WalletConnect-compatible wallet for maximum flexibility.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">Universal compatibility</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">QR code connection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-300">100+ supported wallets</span>
              </div>
            </div>
            <a 
              href="https://walletconnect.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              Learn About WalletConnect
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Recommended Choice</h3>
              <p className="text-gray-300 text-sm">
                We recommend <strong>Coinbase Wallet</strong> for the best Base experience, or <strong>MetaMask</strong> if you prefer browser-based wallets. Both have excellent Base Sepolia testnet support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Base Sepolia Network Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Base Sepolia Network Configuration</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Network Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Network Name:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">Base Sepolia</span>
                  <Copy className="h-4 w-4 text-gray-500 hover:text-emerald-400 cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">RPC URL:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">https://sepolia.base.org</span>
                  <Copy className="h-4 w-4 text-gray-500 hover:text-emerald-400 cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Chain ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">84532</span>
                  <Copy className="h-4 w-4 text-gray-500 hover:text-emerald-400 cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Currency Symbol:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">ETH</span>
                  <Copy className="h-4 w-4 text-gray-500 hover:text-emerald-400 cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Block Explorer:</span>
                <a 
                  href="https://sepolia.basescan.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="font-mono text-sm">sepolia.basescan.org</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MetaMask Setup */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-4">MetaMask Setup Steps</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-gray-300 text-sm mb-2"><strong>Open MetaMask</strong> and click on the network dropdown at the top</p>
                <div className="text-xs text-gray-400">Currently shows "Ethereum Mainnet" by default</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-gray-300 text-sm mb-2"><strong>Click "Add Network"</strong> then "Add a network manually"</p>
                <div className="text-xs text-gray-400">Located at the bottom of the network list</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-gray-300 text-sm mb-2"><strong>Enter the network details</strong> from the table above</p>
                <div className="text-xs text-gray-400">Copy and paste each field carefully</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
              <div>
                <p className="text-gray-300 text-sm mb-2"><strong>Click "Save"</strong> and switch to Base Sepolia network</p>
                <div className="text-xs text-gray-400">MetaMask will automatically switch to the new network</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coinbase Wallet Setup */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Coinbase Wallet Setup</h3>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>Good News:</strong> Coinbase Wallet includes Base Sepolia by default! Simply open the network selector and choose "Base Sepolia" from the list. No manual configuration needed.
            </p>
          </div>
        </div>
      </section>

      {/* Token Contracts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Token Contracts</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* USDC Token */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">USDC (Trading Currency)</h3>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Contract Address:</div>
                <div className="bg-gray-800 rounded p-2 flex items-center justify-between">
                  <span className="text-cyan-400 font-mono text-sm break-all">0x036CbD53842c5426634e7929541eC2318f3dCF7e</span>
                  <Copy className="h-4 w-4 text-gray-500 hover:text-cyan-400 cursor-pointer shrink-0 ml-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Symbol:</span>
                  <span className="text-cyan-400 ml-2">USDC</span>
                </div>
                <div>
                  <span className="text-gray-400">Decimals:</span>
                  <span className="text-cyan-400 ml-2">6</span>
                </div>
              </div>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
              <p className="text-cyan-300 text-sm">
                <strong>Usage:</strong> All opinion trading is done in USDC. Get free testnet USDC from Circle's faucet.
              </p>
            </div>
            <a 
              href="https://faucet.circle.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
            >
              Get Free USDC
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* ETH for Gas */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">ETH (Gas Fees)</h3>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Native Currency:</div>
                <div className="bg-gray-800 rounded p-2">
                  <span className="text-purple-400 font-semibold">Base Sepolia ETH</span>
                </div>
              </div>
              <div className="text-sm">
                <div className="text-gray-400 mb-2">Typical Costs:</div>
                <ul className="space-y-1 text-purple-300">
                  <li>• Create Opinion: ~0.003 ETH</li>
                  <li>• Submit Answer: ~0.002 ETH</li>
                  <li>• Approve USDC: ~0.001 ETH</li>
                </ul>
              </div>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 mb-4">
              <p className="text-purple-300 text-sm">
                <strong>Recommended:</strong> Get at least 0.1 ETH for extensive testing. It's free!
              </p>
            </div>
            <div className="space-y-2">
              <a 
                href="https://www.alchemy.com/faucets/base-sepolia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                Alchemy Base Faucet
                <ExternalLink className="h-4 w-4" />
              </a>
              <a 
                href="https://docs.base.org/tools/network-faucets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                Base Official Faucets
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Adding Tokens to Wallet */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Adding USDC to Your Wallet</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Auto-Detection vs Manual Addition</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-white font-semibold mb-3">MetaMask</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• USDC may auto-detect when you receive tokens</li>
                <li>• If not, click "Import tokens" at bottom of asset list</li>
                <li>• Paste USDC contract address: <span className="text-cyan-400 font-mono">0x036C...DCF7e</span></li>
                <li>• Symbol and decimals should auto-fill</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Coinbase Wallet</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Usually auto-detects USDC on Base networks</li>
                <li>• If needed: tap "+" button in assets</li>
                <li>• Search for "USDC" or paste contract address</li>
                <li>• Confirm addition to wallet</li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-emerald-300 text-sm">
              <strong>💡 Pro Tip:</strong> After getting USDC from the faucet, it should appear in your wallet automatically. If not, use the contract address above to add it manually.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Common Issues & Solutions</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">❌ "Wrong Network" Error</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong>Problem:</strong> Wallet is connected to the wrong network (e.g., Ethereum mainnet instead of Base Sepolia).
            </p>
            <p className="text-emerald-400 text-sm">
              <strong>Solution:</strong> Switch to Base Sepolia in your wallet's network selector. The dApp will often prompt you to switch automatically.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Transactions Failing</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong>Problem:</strong> All transactions are failing or pending indefinitely.
            </p>
            <div className="text-emerald-400 text-sm space-y-1">
              <p><strong>Solutions:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Check you have Base Sepolia ETH for gas fees</li>
                <li>• Reset your wallet's transaction nonce (in advanced settings)</li>
                <li>• Try increasing gas limit manually</li>
                <li>• Wait for network congestion to clear</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ USDC Not Showing</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong>Problem:</strong> Got USDC from faucet but it's not visible in wallet.
            </p>
            <div className="text-emerald-400 text-sm space-y-1">
              <p><strong>Solutions:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Manually add USDC token using contract address above</li>
                <li>• Refresh wallet or restart browser</li>
                <li>• Check transaction was successful on BaseScan</li>
                <li>• Ensure you're on Base Sepolia network</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ dApp Not Connecting</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong>Problem:</strong> Wallet connection button doesn't work or wallet popup doesn't appear.
            </p>
            <div className="text-emerald-400 text-sm space-y-1">
              <p><strong>Solutions:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Refresh the page and try again</li>
                <li>• Disable popup blockers for the site</li>
                <li>• Try a different connection method (WalletConnect vs extension)</li>
                <li>• Clear browser cache and cookies</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Wallet Setup Success Checklist</h2>
        
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">✅ You're ready when you have:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Wallet installed and set up</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Base Sepolia network configured</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Base Sepolia ETH for gas fees (0.1+ recommended)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">USDC testnet tokens (100+ recommended)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">USDC token visible in wallet</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 text-sm">Successfully connected to dApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Wallet Ready? Start Trading!</h2>
          <p className="text-gray-300 mb-6">Now that your wallet is configured, you're ready to start trading opinions</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://test.opinionmarketcap.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Launch dApp
            </a>
            <a 
              href="/quick-start" 
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Quick Start Guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}