import { Brain, Crown, Zap, Users, TrendingUp, DollarSign, Shield, ArrowRight } from "lucide-react";

export default function PlatformBasicsPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Platform Basics
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Deep dive into the core mechanics that power OpinionMarketCap
        </p>
      </div>

      {/* Core Concepts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Core Concepts</h2>
        
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
            <Brain className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Questions</h3>
            <p className="text-gray-300 text-sm mb-3">
              Open-ended questions that spark conversation and debate. Max 52 characters, categorized for discovery.
            </p>
            <div className="text-xs text-yellow-300 bg-yellow-900/20 rounded p-2">
              Example: "Will AI replace software developers by 2030?"
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
            <Zap className="h-8 w-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-orange-400 mb-3">Answers</h3>
            <p className="text-gray-300 text-sm mb-3">
              Responses that represent the current narrative. Answer owners profit when others want to change the narrative.
            </p>
            <div className="text-xs text-orange-300 bg-orange-900/20 rounded p-2">
              Example: "Not fully, but AI will automate 60% of coding tasks"
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <Crown className="h-8 w-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ownership</h3>
            <p className="text-gray-300 text-sm mb-3">
              Two types: Question ownership (permanent royalties) and Answer ownership (current narrative control).
            </p>
            <div className="text-xs text-cyan-300 bg-cyan-900/20 rounded p-2">
              Question owners earn 3% from all trades forever
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">How They Work Together</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-gray-300 text-sm"><strong>Question Creator</strong> posts an engaging question and initial answer, setting the conversation in motion</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-gray-300 text-sm"><strong>Answer Traders</strong> pay to provide better answers, taking ownership of the current narrative</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-gray-300 text-sm"><strong>All Participants</strong> benefit: creators get royalties, traders earn from narrative ownership, and the market discovers truth</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">User Roles</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Opinion Leaders */}
          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-8 w-8 text-orange-400" />
              <h3 className="text-2xl font-bold text-orange-400">Opinion Leaders</h3>
            </div>
            
            <p className="text-gray-300 mb-6">Question creators who spark conversations and earn passive income from their intellectual contributions.</p>
            
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-white">What They Do:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Create engaging, thought-provoking questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Provide initial answers to seed discussion</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Set strategic initial pricing (1-100 USDC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Choose optimal categories for discovery</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">💰 Revenue Model</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 3% royalty from every answer trade (forever)</li>
                <li>• Can sell question ownership for lump sum</li>
                <li>• Higher initial prices = higher ongoing royalties</li>
              </ul>
            </div>
          </div>

          {/* Opinion Traders */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-8 w-8 text-cyan-400" />
              <h3 className="text-2xl font-bold text-cyan-400">Opinion Traders</h3>
            </div>
            
            <p className="text-gray-300 mb-6">Active participants who provide answers, control narratives, and profit from market dynamics.</p>
            
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-white">What They Do:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Find undervalued or trending opinions</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Provide compelling alternative answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Time market entry for maximum profit</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">Build portfolios across multiple opinions</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-2">⚡ Revenue Model</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 87% of next trade price when someone outbids</li>
                <li>• Can sell answer ownership anytime</li>
                <li>• Profit scales with opinion popularity</li>
              </ul>
            </div>
          </div>

          {/* Pool Participants */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-8 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-purple-400">Pool Participants</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-300 mb-4">Community members who collectively fund expensive opinions (≥100 USDC) through pooled resources.</p>
                
                <h4 className="text-lg font-semibold text-white mb-2">What They Do:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">Contribute USDC to collective pools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">Vote on pool target opinions and answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">Share in collective ownership and profits</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">🤝 Revenue Model</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Proportional share of pool profits</li>
                  <li>• Access to high-value opinions otherwise too expensive</li>
                  <li>• Reduced individual risk through diversification</li>
                  <li>• Community governance over pool decisions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Economic Model */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Economic Model</h2>
        
        <div className="space-y-6">
          {/* Creation Economics */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Opinion Creation Economics
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Creation Fee Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Fee:</span>
                    <span className="text-emerald-400">20% of initial price</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Fee:</span>
                    <span className="text-emerald-400">5 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee Recipient:</span>
                    <span className="text-emerald-400">Platform Treasury</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Pricing Strategy Impact</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• <strong>Low Initial Price (1-5 USDC):</strong> Easy entry, but lower royalties</div>
                  <div>• <strong>Medium Price (10-30 USDC):</strong> Balanced accessibility and returns</div>
                  <div>• <strong>High Price (50-100 USDC):</strong> Maximum royalties, pool-worthy</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">💡 Example Calculation</h4>
              <p className="text-sm text-gray-300">
                Initial Price: 25 USDC → Creation Fee: 5 USDC (20%) → Creator Pays: 5 USDC total
                <br />
                Future Royalties: 3% × trade volume (potentially hundreds of USDC over time)
              </p>
            </div>
          </div>

          {/* Trading Economics */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Answer Trading Economics
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">10%</div>
                <div className="text-sm text-gray-400">Platform Fee</div>
                <div className="text-xs text-gray-500 mt-1">Goes to treasury</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">3%</div>
                <div className="text-sm text-gray-400">Creator Royalty</div>
                <div className="text-xs text-gray-500 mt-1">Question owner (permanent)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-2">87%</div>
                <div className="text-sm text-gray-400">Previous Owner</div>
                <div className="text-xs text-gray-500 mt-1">Answer owner reward</div>
              </div>
            </div>

            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-2">⚡ Trading Example</h4>
              <p className="text-sm text-gray-300 mb-2">Opinion Price: 50 USDC</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• New trader pays: 50 USDC</li>
                <li>• Platform receives: 5 USDC (10%)</li>
                <li>• Question creator receives: 1.50 USDC (3%)</li>
                <li>• Previous answer owner receives: 43.50 USDC (87%)</li>
              </ul>
            </div>
          </div>

          {/* Question Sales */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Question Ownership Sales
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Sale Fee Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee:</span>
                    <span className="text-yellow-400">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seller Receives:</span>
                    <span className="text-yellow-400">90%</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <p className="text-xs text-yellow-300">
                    <strong>Note:</strong> Question ownership includes all future 3% royalties from answer trades
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Strategic Considerations</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• High-volume opinions = higher sale value</li>
                  <li>• Trending topics command premium prices</li>
                  <li>• Early sale vs. long-term royalty collection</li>
                  <li>• Market timing affects sale success</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Pricing Algorithm */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Dynamic Pricing Algorithm</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">How Prices Change</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Bonding Curve:</strong> Algorithmic pricing prevents manipulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Competition Tracking:</strong> More traders = higher price increases</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Maximum Change:</strong> 200% price increase limit per trade</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Minimum Floor:</strong> 1 USDC minimum price maintained</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-4">Price Factors</h3>
              <div className="space-y-3">
                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                  <h4 className="text-orange-400 text-sm font-semibold mb-1">Trading Volume</h4>
                  <p className="text-xs text-gray-300">Higher trade frequency increases next price</p>
                </div>
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
                  <h4 className="text-cyan-400 text-sm font-semibold mb-1">Competition Level</h4>
                  <p className="text-xs text-gray-300">More unique traders = steeper price increases</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                  <h4 className="text-purple-400 text-sm font-semibold mb-1">Time Since Last Trade</h4>
                  <p className="text-xs text-gray-300">Longer gaps can moderate price increases</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-MEV Protection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Anti-MEV Protection</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">MEV Attack Vectors</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Front-running: Seeing pending trades and jumping ahead</li>
              <li>• Sandwich attacks: Wrapping user trades with manipulative trades</li>
              <li>• Price manipulation: Artificial price pumping before user trades</li>
              <li>• Block timing: Exploiting transaction ordering within blocks</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Our Protection Methods</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• MEV penalty fees for suspicious patterns</li>
              <li>• Transaction timing analysis</li>
              <li>• Price impact limits per trade</li>
              <li>• User behavior monitoring</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">How It Works</h3>
          <p className="text-gray-300 text-sm mb-4">
            Our smart contracts analyze trading patterns in real-time. When MEV-like behavior is detected, additional penalty fees are applied, and the extra fees go to the platform treasury instead of the attacker.
          </p>
          <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
            <p className="text-cyan-300 text-sm">
              <strong>Result:</strong> Fair trading for genuine participants while making MEV attacks unprofitable.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Ready to Dive Deeper?</h2>
          <p className="text-gray-300 mb-6 text-center">Explore specific aspects of the platform that interest you most</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/creating-opinions" 
              className="bg-gray-900 border border-gray-800 hover:border-orange-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-orange-400 font-semibold mb-2">🎯 Create Opinions</h3>
              <p className="text-gray-300 text-sm">Master question creation</p>
            </a>
            
            <a 
              href="/trading-opinions" 
              className="bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-cyan-400 font-semibold mb-2">⚡ Trading Guide</h3>
              <p className="text-gray-300 text-sm">Advanced trading strategies</p>
            </a>
            
            <a 
              href="/pool-system" 
              className="bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-purple-400 font-semibold mb-2">🤝 Pool System</h3>
              <p className="text-gray-300 text-sm">Collective ownership</p>
            </a>
            
            <a 
              href="/fee-structure" 
              className="bg-gray-900 border border-gray-800 hover:border-yellow-500 rounded-lg p-4 transition-colors block text-center"
            >
              <h3 className="text-yellow-400 font-semibold mb-2">💰 Fee Structure</h3>
              <p className="text-gray-300 text-sm">Complete economics</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}