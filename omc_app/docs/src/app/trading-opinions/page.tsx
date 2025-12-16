import { TrendingUp, Shield, Zap, Target, BarChart3, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";

export default function TradingOpinionsPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Trading & Opinions Guide
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Master the mechanics of opinion trading and price discovery on OpinionMarketCap
        </p>
      </div>

      {/* How Opinion Trading Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How Opinion Trading Works</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">The Basic Trading Cycle</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">1</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Find an Opinion</h4>
                <p className="text-gray-300 text-sm">Browse questions and evaluate current answers. Look for opinions you believe you can improve upon or that seem undervalued.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">2</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Provide Better Answer</h4>
                <p className="text-gray-300 text-sm">Submit your improved answer along with optional description and links. Pay the current price to become the new answer owner.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">3</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Own the Narrative</h4>
                <p className="text-gray-300 text-sm">Your answer becomes the current narrative. Others must pay you (plus fees) if they want to change it.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">4</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Earn from Next Trade</h4>
                <p className="text-gray-300 text-sm">When someone outbids you, receive 87% of their payment. The price also increases for future trades.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">What You're Trading</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Answer Ownership:</strong> Right to control the current narrative</li>
              <li>• <strong>Revenue Rights:</strong> Earn from all future answer changes</li>
              <li>• <strong>Visibility:</strong> Your answer is prominently displayed</li>
              <li>• <strong>Influence:</strong> Shape public discourse on important topics</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">What You're NOT Trading</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Question Ownership:</strong> Original creators keep this forever</li>
              <li>• <strong>Past Answers:</strong> History is immutable and permanent</li>
              <li>• <strong>Other Users' Tokens:</strong> Each opinion is independent</li>
              <li>• <strong>Platform Governance:</strong> No voting rights included</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Price Discovery Mechanism */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Price Discovery Mechanism</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Bonding Curve Algorithm</h3>
          <p className="text-gray-300 text-sm mb-4">
            OpinionMarketCap uses a sophisticated bonding curve algorithm that automatically adjusts prices based on trading activity and competition levels. This ensures fair price discovery while preventing manipulation.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 text-center">
              <BarChart3 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-emerald-400 font-semibold text-sm mb-1">Initial Price</h4>
              <p className="text-gray-300 text-xs">Set by creator (1-100 USDC)</p>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 text-center">
              <TrendingUp className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="text-cyan-400 font-semibold text-sm mb-1">Dynamic Pricing</h4>
              <p className="text-gray-300 text-xs">Increases with competition</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <Shield className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-purple-400 font-semibold text-sm mb-1">Price Limits</h4>
              <p className="text-gray-300 text-xs">Max 200% increase per trade</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Price Increase Factors</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ArrowUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Competition Level</p>
                  <p className="text-gray-400 text-xs">More unique traders = higher increases</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Trading Frequency</p>
                  <p className="text-gray-400 text-xs">Recent activity drives prices up</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Volume History</p>
                  <p className="text-gray-400 text-xs">Higher past volume indicates demand</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">Price Moderation Factors</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ArrowDown className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Time Since Last Trade</p>
                  <p className="text-gray-400 text-xs">Longer gaps moderate increases</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowDown className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Price Floor Protection</p>
                  <p className="text-gray-400 text-xs">Minimum 1 USDC maintained</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowDown className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Maximum Change Limit</p>
                  <p className="text-gray-400 text-xs">200% cap prevents price shocks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Discovery Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Price Discovery Examples</h2>
        
        <div className="space-y-6">
          {/* Low Competition Example */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Example 1: Low Competition Opinion</h3>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">5 USDC</div>
                <div className="text-sm text-gray-400">Initial Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">6 USDC</div>
                <div className="text-sm text-gray-400">After Trade 1</div>
                <div className="text-xs text-gray-500">(+20%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">7.5 USDC</div>
                <div className="text-sm text-gray-400">After Trade 2</div>
                <div className="text-xs text-gray-500">(+25%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">9.5 USDC</div>
                <div className="text-sm text-gray-400">After Trade 3</div>
                <div className="text-xs text-gray-500">(+27%)</div>
              </div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-emerald-300 text-sm">
                <strong>Scenario:</strong> Niche opinion with occasional interest. Moderate price increases allow multiple participants to engage affordably.
              </p>
            </div>
          </div>

          {/* High Competition Example */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Example 2: High Competition Opinion</h3>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">20 USDC</div>
                <div className="text-sm text-gray-400">Initial Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">35 USDC</div>
                <div className="text-sm text-gray-400">After Trade 1</div>
                <div className="text-xs text-gray-500">(+75%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">65 USDC</div>
                <div className="text-sm text-gray-400">After Trade 2</div>
                <div className="text-xs text-gray-500">(+86%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">130 USDC</div>
                <div className="text-sm text-gray-400">After Trade 3</div>
                <div className="text-xs text-gray-500">(+100%)</div>
              </div>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-300 text-sm">
                <strong>Scenario:</strong> Viral question with many competing traders. Rapid price increases reflect high demand and competition intensity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MEV Protection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Anti-MEV Protection</h2>
        
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">What is MEV?</h3>
              <p className="text-gray-300 text-sm">
                Maximum Extractable Value (MEV) refers to unfair trading practices like front-running, where bots see your pending transaction and jump ahead to profit at your expense.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-red-400 font-semibold mb-2 text-sm">Common MEV Attacks:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Front-running your trades</li>
                <li>• Sandwich attacks (trade before and after you)</li>
                <li>• Price manipulation</li>
                <li>• Block space auction manipulation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-red-400 font-semibold mb-2 text-sm">Impact on Users:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Higher prices than expected</li>
                <li>• Failed transactions</li>
                <li>• Reduced profits from trading</li>
                <li>• Unfair competition</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Our Protection System</h3>
              <p className="text-gray-300 text-sm">
                OpinionMarketCap implements real-time MEV detection and penalty systems to ensure fair trading for all participants.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-emerald-400 font-semibold mb-2 text-sm">Detection Methods:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Transaction timing analysis</li>
                <li>• Pattern recognition algorithms</li>
                <li>• Block position monitoring</li>
                <li>• User behavior tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-2 text-sm">Protection Measures:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Additional penalty fees for MEV</li>
                <li>• Reduced payouts to attackers</li>
                <li>• Priority protection for regular users</li>
                <li>• Automatic refund mechanisms</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Strategies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Basic Trading Strategies</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Early Entry Strategy */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-400">Early Entry Strategy</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Identify promising questions early when prices are still low, before they gain widespread attention.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Best For:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• New or recently created opinions</li>
                  <li>• Topics you have expertise in</li>
                  <li>• Questions with potential for virality</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Risks:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Opinion might not gain traction</li>
                  <li>• Long holding periods</li>
                  <li>• Lower immediate returns</li>
                </ul>
              </div>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded p-3">
              <p className="text-emerald-300 text-xs">
                <strong>💡 Tip:</strong> Look for well-crafted questions in trending categories with initial prices under 10 USDC.
              </p>
            </div>
          </div>

          {/* Momentum Trading Strategy */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-orange-400">Momentum Trading</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Jump into trending opinions that are gaining rapid traction and trading volume.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Best For:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Opinions with recent trading spikes</li>
                  <li>• Hot topics in the news</li>
                  <li>• Questions with high engagement</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Risks:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Higher entry prices</li>
                  <li>• More competition from other traders</li>
                  <li>• Potential for quick reversals</li>
                </ul>
              </div>
            </div>
            <div className="bg-orange-900/30 border border-orange-500/30 rounded p-3">
              <p className="text-orange-300 text-xs">
                <strong>⚡ Tip:</strong> Monitor trading volume and price velocity indicators to identify momentum opportunities.
              </p>
            </div>
          </div>

          {/* Contrarian Strategy */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">Contrarian Approach</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Provide alternative perspectives on established opinions, especially those with weak current answers.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Best For:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Opinions with questionable current answers</li>
                  <li>• Your areas of expertise</li>
                  <li>• Undervalued but important topics</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Risks:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• May go against popular sentiment</li>
                  <li>• Requires strong conviction</li>
                  <li>• Potential backlash from community</li>
                </ul>
              </div>
            </div>
            <div className="bg-purple-900/30 border border-purple-500/30 rounded p-3">
              <p className="text-purple-300 text-xs">
                <strong>🎯 Tip:</strong> Research thoroughly and provide compelling evidence to support contrarian views.
              </p>
            </div>
          </div>

          {/* Portfolio Diversification */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400">Portfolio Diversification</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Spread investments across multiple opinions, categories, and price ranges to manage risk.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Best For:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Risk-averse traders</li>
                  <li>• Long-term value accumulation</li>
                  <li>• Consistent, steady returns</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Approach:</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Mix of categories and price points</li>
                  <li>• Balance between early and trending opinions</li>
                  <li>• Regular portfolio rebalancing</li>
                </ul>
              </div>
            </div>
            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded p-3">
              <p className="text-cyan-300 text-xs">
                <strong>🛡️ Tip:</strong> Never put more than 20% of your capital into a single opinion, no matter how promising.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Analysis Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Market Analysis & Indicators</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Key Metrics to Monitor</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 text-center">
              <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-emerald-400 font-semibold text-sm mb-1">Price Velocity</h4>
              <p className="text-gray-300 text-xs">Rate of price change over time</p>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 text-center">
              <BarChart3 className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="text-cyan-400 font-semibold text-sm mb-1">Volume Trend</h4>
              <p className="text-gray-300 text-xs">Total trading volume and growth</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 text-center">
              <Target className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <h4 className="text-orange-400 font-semibold text-sm mb-1">Competition Level</h4>
              <p className="text-gray-300 text-xs">Number of unique traders</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-purple-400 font-semibold text-sm mb-1">Answer Quality</h4>
              <p className="text-gray-300 text-xs">Subjective assessment of responses</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Bullish Indicators</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Increasing trade frequency</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Growing number of unique traders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Viral potential topic or question</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Weak current answer (improvement opportunity)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Related news or trending events</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Warning Signals</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Declining trade volume</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Long gaps between trades</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Extremely high current price vs. value</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Strong current answer (hard to improve)</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Topic losing relevance or interest</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Risk Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Risk Management</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Common Risks</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Market Risk</h4>
                <p className="text-gray-300 text-xs">Opinion prices can be volatile and unpredictable</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Competition Risk</h4>
                <p className="text-gray-300 text-xs">Other traders may outbid you quickly</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Illiquidity Risk</h4>
                <p className="text-gray-300 text-xs">Some opinions may have very low trading activity</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Platform Risk</h4>
                <p className="text-gray-300 text-xs">Smart contract bugs or network issues</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Risk Mitigation</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Position Sizing</h4>
                <p className="text-gray-300 text-xs">Never risk more than you can afford to lose</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Diversification</h4>
                <p className="text-gray-300 text-xs">Spread investments across multiple opinions</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Research</h4>
                <p className="text-gray-300 text-xs">Thoroughly analyze before investing significant amounts</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Exit Planning</h4>
                <p className="text-gray-300 text-xs">Know when to sell and cut losses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-900/20 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Important Reminder</h3>
              <p className="text-gray-300 text-sm">
                This is currently a <strong>testnet environment</strong> using free tokens. While the mechanics are identical to mainnet, 
                there's no real financial risk. Use this opportunity to experiment with different strategies and learn the platform 
                before mainnet deployment in Q1 2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-gray-300 mb-6">Put these concepts into practice on the OpinionMarketCap testnet</p>
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
              href="/trading-guide" 
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Advanced Trading Guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}