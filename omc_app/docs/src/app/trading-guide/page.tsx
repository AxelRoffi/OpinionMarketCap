import { TrendingUp, Target, BarChart3, Brain, Zap, Shield, AlertTriangle, CheckCircle, Eye, Clock, Users } from "lucide-react";

export default function TradingGuidePage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Advanced Trading Guide
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Master advanced trading strategies, market analysis, and portfolio management for OpinionMarketCap
        </p>
      </div>

      {/* Advanced Trading Strategies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Trading Strategies</h2>
        
        <div className="space-y-8">
          {/* Momentum Trading */}
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <Zap className="h-8 w-8 text-red-400" />
              <h3 className="text-2xl font-bold text-red-400">Momentum Trading Mastery</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Identifying Momentum</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Volume Spikes:</strong> 3+ trades within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Price Velocity:</strong> Consistent 50%+ increases per trade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>New Traders:</strong> Different addresses joining competition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Social Signals:</strong> External attention (news, social media)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Execution Tactics</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Early Entry:</strong> Join within first 3-5 trades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Quality Answers:</strong> Provide genuinely better responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Quick Decisions:</strong> Don't hesitate once trend is confirmed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Exit Strategy:</strong> Take profits before momentum exhaustion</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6">
              <h4 className="text-red-400 font-semibold mb-3">⚡ Momentum Trading Example</h4>
              <p className="text-gray-300 text-sm mb-3">
                <strong>Scenario:</strong> "Will GPT-5 be released in 2024?" starts trending after OpenAI announcement.
              </p>
              <div className="grid md:grid-cols-4 gap-3 text-xs">
                <div className="bg-red-800/30 rounded p-2 text-center">
                  <div className="text-red-400 font-bold">Trade 1</div>
                  <div className="text-gray-300">15 USDC</div>
                  <div className="text-gray-400">Entry point</div>
                </div>
                <div className="bg-red-700/30 rounded p-2 text-center">
                  <div className="text-red-400 font-bold">Trade 2</div>
                  <div className="text-gray-300">28 USDC</div>
                  <div className="text-gray-400">+87% momentum</div>
                </div>
                <div className="bg-red-600/30 rounded p-2 text-center">
                  <div className="text-red-400 font-bold">Your Trade</div>
                  <div className="text-gray-300">45 USDC</div>
                  <div className="text-gray-400">Join momentum</div>
                </div>
                <div className="bg-red-500/30 rounded p-2 text-center">
                  <div className="text-red-400 font-bold">Exit</div>
                  <div className="text-gray-300">39.15 USDC</div>
                  <div className="text-gray-400">87% profit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contrarian Strategy */}
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <Brain className="h-8 w-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-purple-400">Contrarian Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Spotting Opportunities</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Weak Answers:</strong> Current response lacks depth or accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Market Overreaction:</strong> Price doesn't match question quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Expertise Edge:</strong> You have specialized knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Long-term View:</strong> Market sentiment vs fundamentals</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Risk Management</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Strong Conviction:</strong> Be certain of your analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Position Sizing:</strong> Start small, scale if proven right</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Timeline Expectations:</strong> May take longer to pay off</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Exit Rules:</strong> Know when you're wrong</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
              <h4 className="text-purple-400 font-semibold mb-3">🎯 Contrarian Success Framework</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-800/30 rounded p-3">
                  <h5 className="text-purple-300 font-semibold text-sm mb-1">Research Phase</h5>
                  <p className="text-gray-300 text-xs">Deep dive into topic, verify facts, identify market blind spots</p>
                </div>
                <div className="bg-purple-800/30 rounded p-3">
                  <h5 className="text-purple-300 font-semibold text-sm mb-1">Entry Phase</h5>
                  <p className="text-gray-300 text-xs">Provide compelling counter-narrative with strong evidence</p>
                </div>
                <div className="bg-purple-800/30 rounded p-3">
                  <h5 className="text-purple-300 font-semibold text-sm mb-1">Hold Phase</h5>
                  <p className="text-gray-300 text-xs">Wait for market to recognize value, defend position if needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arbitrage Opportunities */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <BarChart3 className="h-8 w-8 text-emerald-400" />
              <h3 className="text-2xl font-bold text-emerald-400">Arbitrage & Efficiency Plays</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Find pricing inefficiencies and capitalize on market gaps before algorithmic price discovery corrects them.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <h4 className="text-emerald-400 font-semibold mb-3">Time-Based Arbitrage</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Stale prices after long inactivity periods</li>
                  <li>• Pre-announcement vs post-announcement gaps</li>
                  <li>• Weekend vs weekday pricing differences</li>
                  <li>• Time zone advantages on global topics</li>
                </ul>
              </div>
              
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-3">Information Arbitrage</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Exclusive access to relevant data</li>
                  <li>• Language barriers (translate insights)</li>
                  <li>• Cross-platform intelligence</li>
                  <li>• Professional network advantages</li>
                </ul>
              </div>
              
              <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
                <h4 className="text-teal-400 font-semibold mb-3">Quality Arbitrage</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Superficial vs deep analysis gaps</li>
                  <li>• Emotional vs rational pricing</li>
                  <li>• Short-term vs long-term perspectives</li>
                  <li>• Technical vs fundamental analysis</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-6">
              <h4 className="text-emerald-400 font-semibold mb-3">⚡ Quick Arbitrage Checklist</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>✓ Price hasn't moved in 24+ hours</li>
                  <li>✓ New relevant information available</li>
                  <li>✓ Current answer quality is poor</li>
                  <li>✓ Competition level is low</li>
                </ul>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>✓ You have superior information/analysis</li>
                  <li>✓ Market cap vs attention mismatch</li>
                  <li>✓ Clear improvement opportunity</li>
                  <li>✓ Risk/reward ratio favorable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Portfolio Management</h2>
        
        <div className="space-y-6">
          {/* Position Sizing */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Dynamic Position Sizing</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-3">Kelly Criterion Approach</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Size positions based on your edge and confidence level. Higher conviction = larger position.
                </p>
                <div className="text-xs text-yellow-300 bg-yellow-900/30 rounded p-2">
                  Formula: f = (bp - q) / b<br/>
                  f = fraction to wager<br/>
                  b = odds, p = win probability, q = loss probability
                </div>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-orange-400 font-semibold mb-3">Risk Budgeting</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• High confidence: 5-10% of capital</li>
                  <li>• Medium confidence: 2-5% of capital</li>
                  <li>• Low confidence: 0.5-2% of capital</li>
                  <li>• Experimental: &lt;0.5% of capital</li>
                </ul>
              </div>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-3">Volatility Adjustment</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Adjust position sizes based on expected price volatility and competition levels.
                </p>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• High volatility = smaller positions</li>
                  <li>• Stable opinions = larger positions</li>
                  <li>• New questions = conservative sizing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Diversification Strategy */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Strategic Diversification</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Portfolio Allocation Framework</h4>
                <div className="space-y-3">
                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
                    <h5 className="text-cyan-400 text-sm font-semibold mb-1">Core Holdings (40-50%)</h5>
                    <p className="text-gray-300 text-xs">Established opinions with steady trading activity</p>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
                    <h5 className="text-emerald-400 text-sm font-semibold mb-1">Growth Positions (30-40%)</h5>
                    <p className="text-gray-300 text-xs">Trending topics with momentum potential</p>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                    <h5 className="text-orange-400 text-sm font-semibold mb-1">Speculative Plays (10-20%)</h5>
                    <p className="text-gray-300 text-xs">High-risk, high-reward contrarian bets</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Correlation Management</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Category Spread:</strong> Max 30% in any single category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Price Range Mix:</strong> Low, medium, high price positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Timeline Diversity:</strong> Short and long-term questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Competition Levels:</strong> Mix of competitive and niche opinions</span>
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded">
                  <p className="text-cyan-300 text-xs">
                    <strong>💡 Pro Tip:</strong> Monitor portfolio correlation weekly. If multiple positions move together, consider rebalancing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rebalancing Rules */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Portfolio Rebalancing Rules</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Trigger Conditions</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Single position exceeds 20% of portfolio</li>
                  <li>• Category concentration above 40%</li>
                  <li>• Monthly performance review shows imbalance</li>
                  <li>• Major market events change landscape</li>
                  <li>• New high-conviction opportunities arise</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Rebalancing Actions</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Scale down oversized positions</li>
                  <li>• Exit underperforming opinions after 30 days</li>
                  <li>• Add to underweighted categories</li>
                  <li>• Take profits from 3x gainers</li>
                  <li>• Rotate from mature to emerging topics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Analysis Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Market Analysis</h2>
        
        <div className="space-y-6">
          {/* Technical Indicators */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Custom Technical Indicators</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <TrendingUp className="h-6 w-6 text-emerald-400 mb-2" />
                <h4 className="text-emerald-400 font-semibold text-sm mb-1">Velocity Index</h4>
                <p className="text-gray-300 text-xs mb-2">Price change rate over time periods</p>
                <div className="text-xs text-emerald-300">
                  Formula: (P₂ - P₁) / (T₂ - T₁)
                </div>
              </div>
              
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <BarChart3 className="h-6 w-6 text-cyan-400 mb-2" />
                <h4 className="text-cyan-400 font-semibold text-sm mb-1">Competition Density</h4>
                <p className="text-gray-300 text-xs mb-2">Unique traders per price level</p>
                <div className="text-xs text-cyan-300">
                  Traders / Price Range
                </div>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <Clock className="h-6 w-6 text-orange-400 mb-2" />
                <h4 className="text-orange-400 font-semibold text-sm mb-1">Activity Score</h4>
                <p className="text-gray-300 text-xs mb-2">Trading frequency weighted by recency</p>
                <div className="text-xs text-orange-300">
                  Σ(Trades × Time Weight)
                </div>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <Users className="h-6 w-6 text-purple-400 mb-2" />
                <h4 className="text-purple-400 font-semibold text-sm mb-1">Quality Index</h4>
                <p className="text-gray-300 text-xs mb-2">Answer depth and relevance score</p>
                <div className="text-xs text-purple-300">
                  Subjective: 1-10 scale
                </div>
              </div>
            </div>
          </div>

          {/* Market Sentiment Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Market Sentiment Framework</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-3">🟢 Bullish Signals</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Increasing trade frequency</li>
                  <li>• New trader participation</li>
                  <li>• Price stability after increases</li>
                  <li>• Quality answer improvements</li>
                  <li>• External validation (news, events)</li>
                  <li>• Category-wide momentum</li>
                </ul>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-3">🟡 Neutral/Mixed</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Steady but slow trading</li>
                  <li>• Price oscillating around mean</li>
                  <li>• Mixed quality answers</li>
                  <li>• Moderate competition</li>
                  <li>• No clear external catalysts</li>
                  <li>• Seasonal/cyclical patterns</li>
                </ul>
              </div>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-3">🔴 Bearish Signals</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Declining trade volume</li>
                  <li>• Long periods of inactivity</li>
                  <li>• Answer quality degradation</li>
                  <li>• Single-trader dominance</li>
                  <li>• Negative external events</li>
                  <li>• Category-wide decline</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Predictive Modeling */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Predictive Analysis Methods</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Quantitative Models</h4>
                <div className="space-y-3">
                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
                    <h5 className="text-cyan-400 text-sm font-semibold mb-1">Price Momentum Model</h5>
                    <p className="text-gray-300 text-xs">Predict next price based on historical velocity and competition</p>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
                    <h5 className="text-emerald-400 text-sm font-semibold mb-1">Volume Forecasting</h5>
                    <p className="text-gray-300 text-xs">Estimate future trading activity using time series analysis</p>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                    <h5 className="text-orange-400 text-sm font-semibold mb-1">Regression Analysis</h5>
                    <p className="text-gray-300 text-xs">Correlate external events with price movements</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Qualitative Indicators</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Topic Relevance:</strong> Current events impact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Answer Innovation:</strong> New perspectives emerging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Community Interest:</strong> Social media buzz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Expert Participation:</strong> Authority figures joining</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Media Coverage:</strong> Mainstream attention</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Management Advanced */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Risk Management</h2>
        
        <div className="space-y-6">
          {/* Risk Metrics */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Key Risk Metrics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
                <h4 className="text-red-400 font-semibold text-sm mb-2">Maximum Drawdown</h4>
                <p className="text-gray-300 text-xs mb-1">Largest peak-to-trough decline</p>
                <div className="text-red-300 text-lg font-bold">-15%</div>
                <div className="text-gray-400 text-xs">Target: &lt;-20%</div>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 text-center">
                <h4 className="text-orange-400 font-semibold text-sm mb-2">Sharpe Ratio</h4>
                <p className="text-gray-300 text-xs mb-1">Risk-adjusted returns</p>
                <div className="text-orange-300 text-lg font-bold">1.8</div>
                <div className="text-gray-400 text-xs">Target: {'>'}1.5</div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <h4 className="text-yellow-400 font-semibold text-sm mb-2">Win Rate</h4>
                <p className="text-gray-300 text-xs mb-1">Percentage of profitable trades</p>
                <div className="text-yellow-300 text-lg font-bold">67%</div>
                <div className="text-gray-400 text-xs">Target: {'>'}60%</div>
              </div>
              
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 text-center">
                <h4 className="text-emerald-400 font-semibold text-sm mb-2">Position Correlation</h4>
                <p className="text-gray-300 text-xs mb-1">Average correlation between positions</p>
                <div className="text-emerald-300 text-lg font-bold">0.23</div>
                <div className="text-gray-400 text-xs">Target: &lt;0.3</div>
              </div>
            </div>
          </div>

          {/* Stress Testing */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Portfolio Stress Testing</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-3">Black Swan Events</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Platform technical issues</li>
                  <li>• Major regulatory changes</li>
                  <li>• Economic market crashes</li>
                  <li>• Mass coordination events</li>
                </ul>
                <div className="mt-3 p-2 bg-red-800/30 rounded">
                  <p className="text-red-300 text-xs">Expected Impact: -30 to -50%</p>
                </div>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-orange-400 font-semibold mb-3">Market Corrections</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Category-wide sentiment shifts</li>
                  <li>• Seasonal trading pattern changes</li>
                  <li>• Competition level increases</li>
                  <li>• Quality standard improvements</li>
                </ul>
                <div className="mt-3 p-2 bg-orange-800/30 rounded">
                  <p className="text-orange-300 text-xs">Expected Impact: -10 to -25%</p>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-3">Normal Volatility</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Individual position swings</li>
                  <li>• Short-term sentiment changes</li>
                  <li>• Trader rotation effects</li>
                  <li>• News cycle impacts</li>
                </ul>
                <div className="mt-3 p-2 bg-yellow-800/30 rounded">
                  <p className="text-yellow-300 text-xs">Expected Impact: -5 to -15%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Protocols */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Emergency Response Protocols</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Automated Triggers</h4>
                <div className="space-y-3">
                  <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                    <h5 className="text-red-400 text-sm font-semibold mb-1">Stop-Loss Levels</h5>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Individual position: -50%</li>
                      <li>• Portfolio daily: -10%</li>
                      <li>• Portfolio monthly: -25%</li>
                    </ul>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                    <h5 className="text-orange-400 text-sm font-semibold mb-1">Position Sizing Cuts</h5>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• High volatility: Reduce 50%</li>
                      <li>• Correlation spike: Diversify</li>
                      <li>• Uncertainty: Cash increase</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Manual Interventions</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Portfolio Review:</strong> Complete analysis within 24h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span><strong>Position Audit:</strong> Verify all holdings and risks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Strategy Pivot:</strong> Adjust approach based on new conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Recovery Plan:</strong> Systematic rebuilding process</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Trading Setup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Professional Trading Setup</h2>
        
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-indigo-400 mb-6">Complete Trading Environment</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Essential Tools & Tracking</h4>
              <div className="space-y-3">
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded p-3">
                  <h5 className="text-indigo-400 text-sm font-semibold mb-1">Portfolio Tracker</h5>
                  <p className="text-gray-300 text-xs">Real-time position monitoring, P&L calculation, risk metrics</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                  <h5 className="text-purple-400 text-sm font-semibold mb-1">Market Scanner</h5>
                  <p className="text-gray-300 text-xs">Automated opportunity detection, alert system, trend identification</p>
                </div>
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
                  <h5 className="text-cyan-400 text-sm font-semibold mb-1">Research Dashboard</h5>
                  <p className="text-gray-300 text-xs">News aggregation, social sentiment, external data feeds</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Workflow Optimization</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                  <span><strong>Morning Routine:</strong> Check overnight changes, scan for new opportunities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                  <span><strong>Research Phase:</strong> Deep dive on 3-5 potential trades</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                  <span><strong>Execution Window:</strong> Make trades during peak activity hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                  <span><strong>Evening Review:</strong> Analyze performance, plan next day</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-6">
            <h4 className="text-indigo-400 font-semibold mb-3">🚀 Performance Targets (Testnet Practice)</h4>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">15%</div>
                <div className="text-xs text-gray-400">Monthly Return Target</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">70%</div>
                <div className="text-xs text-gray-400">Win Rate Goal</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400 mb-1">1.8</div>
                <div className="text-xs text-gray-400">Minimum Sharpe Ratio</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400 mb-1">-20%</div>
                <div className="text-xs text-gray-400">Max Drawdown Limit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Master Advanced Trading on Testnet</h2>
          <p className="text-gray-300 mb-6">Practice these advanced strategies risk-free before mainnet deployment</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://test.opinionmarketcap.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Practice Advanced Trading
            </a>
            <a 
              href="/pool-system" 
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Explore Pool System
            </a>
          </div>
          <p className="text-amber-400 text-sm mt-4 font-semibold">
            ⚠️ Advanced strategies require careful risk management. Start small and scale gradually.
          </p>
        </div>
      </section>
    </div>
  );
}