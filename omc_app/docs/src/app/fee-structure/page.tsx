import { DollarSign, TrendingUp, Crown, Users, Shield, Calculator, AlertTriangle, CheckCircle, Zap } from "lucide-react";

export default function FeeStructurePage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Complete Fee Structure
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Comprehensive breakdown of all fees, royalties, and economic incentives in the OpinionMarketCap ecosystem
        </p>
      </div>

      {/* Fee Structure Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Fee Structure Overview</h2>
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-emerald-400 mb-4">Three-Tier Fee System</h3>
          <p className="text-gray-300 mb-6 text-lg">
            OpinionMarketCap uses a sophisticated fee structure that rewards all participants while maintaining platform sustainability. 
            Every transaction generates value for creators, traders, and the platform ecosystem.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-6 text-center">
              <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-emerald-400 font-semibold mb-2">Creation Fees</h4>
              <p className="text-gray-300 text-sm">One-time fees for minting new opinions on-chain</p>
            </div>
            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-6 text-center">
              <TrendingUp className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
              <h4 className="text-cyan-400 font-semibold mb-2">Trading Fees</h4>
              <p className="text-gray-300 text-sm">Fees applied to every answer trade, distributed to stakeholders</p>
            </div>
            <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-6 text-center">
              <Crown className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <h4 className="text-orange-400 font-semibold mb-2">Ownership Sales</h4>
              <p className="text-gray-300 text-sm">Fees when question ownership is transferred between users</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Key Principles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Creator Incentives:</strong> Permanent 3% royalty on all trades rewards quality questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Trader Rewards:</strong> 87% of trade value goes to previous answer owner</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Platform Sustainability:</strong> 10% platform fee supports development and operations</span>
              </li>
            </ul>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Anti-MEV Protection:</strong> Additional penalties for malicious trading patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Pool Integration:</strong> Special handling for collective ownership scenarios</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Transparent Processing:</strong> All fees calculated and distributed automatically on-chain</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Opinion Creation Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Opinion Creation Fees</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-4">Configurable Creation Fee System</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Current Fee Structure</h4>
              <div className="space-y-3">
                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                  <h5 className="text-orange-400 text-sm font-semibold mb-1">Base Rate</h5>
                  <p className="text-gray-300 text-xs mb-1">20% of initial price chosen by creator</p>
                  <p className="text-gray-400 text-xs">This percentage is configurable by platform admins</p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                  <h5 className="text-red-400 text-sm font-semibold mb-1">Minimum Floor</h5>
                  <p className="text-gray-300 text-xs mb-1">5 USDC absolute minimum</p>
                  <p className="text-gray-400 text-xs">Ensures all opinions contribute meaningful value</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Fee Examples</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-800 rounded p-3 flex justify-between">
                  <span className="text-gray-300">Initial Price: 5 USDC</span>
                  <span className="text-orange-400">Fee: 5 USDC (minimum)</span>
                </div>
                <div className="bg-gray-800 rounded p-3 flex justify-between">
                  <span className="text-gray-300">Initial Price: 30 USDC</span>
                  <span className="text-orange-400">Fee: 6 USDC (20%)</span>
                </div>
                <div className="bg-gray-800 rounded p-3 flex justify-between">
                  <span className="text-gray-300">Initial Price: 75 USDC</span>
                  <span className="text-orange-400">Fee: 15 USDC (20%)</span>
                </div>
                <div className="bg-gray-800 rounded p-3 flex justify-between">
                  <span className="text-gray-300">Initial Price: 100 USDC</span>
                  <span className="text-orange-400">Fee: 20 USDC (20%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Why Creation Fees Exist</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Quality Control:</strong> Encourages thoughtful, well-crafted questions</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Spam Prevention:</strong> Prevents low-effort or malicious content</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Platform Sustainability:</strong> Funds development and infrastructure</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Economic Alignment:</strong> Creators invest in their opinion's success</span>
              </li>
            </ul>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Strategic Considerations</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>ROI Calculation:</strong> Factor creation fee into expected royalty returns</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Price Optimization:</strong> Higher initial price = higher future royalties</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Market Positioning:</strong> Balance accessibility vs. revenue potential</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Break-even Analysis:</strong> Plan for required trading volume</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Answer Trading Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Answer Trading Fees</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Three-Way Fee Split</h3>
          <p className="text-gray-300 text-sm mb-6">
            Every answer trade generates fees that are automatically split between three parties, creating a sustainable ecosystem that rewards all participants.
          </p>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">10%</div>
              <h4 className="text-red-400 font-semibold mb-2">Platform Fee</h4>
              <p className="text-gray-300 text-sm mb-3">Goes directly to platform treasury</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Development funding</li>
                <li>• Infrastructure costs</li>
                <li>• Security audits</li>
                <li>• Platform improvements</li>
              </ul>
            </div>
            
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">3%</div>
              <h4 className="text-orange-400 font-semibold mb-2">Creator Royalty</h4>
              <p className="text-gray-300 text-sm mb-3">Permanent royalty to question creator</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Rewards quality questions</li>
                <li>• Passive income stream</li>
                <li>• Intellectual property value</li>
                <li>• Lifetime earnings potential</li>
              </ul>
            </div>
            
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">87%</div>
              <h4 className="text-emerald-400 font-semibold mb-2">Previous Owner</h4>
              <p className="text-gray-300 text-sm mb-3">Reward for current answer owner</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Trading profit incentive</li>
                <li>• Answer quality reward</li>
                <li>• Risk compensation</li>
                <li>• Market participation driver</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-6">
            <h4 className="text-yellow-400 font-semibold mb-3">💰 Trading Fee Example (50 USDC Trade)</h4>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white mb-1">50 USDC</div>
                <div className="text-sm text-gray-400">Total Trade Price</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400 mb-1">5 USDC</div>
                <div className="text-sm text-gray-400">Platform Fee (10%)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400 mb-1">1.50 USDC</div>
                <div className="text-sm text-gray-400">Creator Royalty (3%)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400 mb-1">43.50 USDC</div>
                <div className="text-sm text-gray-400">Previous Owner (87%)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Special Pool Handling</h3>
            <p className="text-gray-300 text-sm mb-4">
              When pools own answers, the reward distribution is handled differently to account for collective ownership.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <span><strong>Pool Distribution:</strong> 87% split among all pool members proportionally</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <span><strong>Automatic Processing:</strong> PoolManager handles reward calculations</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <span><strong>No Additional Fees:</strong> Same fee structure applies to pool-owned opinions</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">MEV Protection Fees</h3>
            <p className="text-gray-300 text-sm mb-4">
              Additional penalty fees are applied when MEV (Maximum Extractable Value) attacks are detected.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>MEV Detection:</strong> Pattern recognition identifies suspicious trading</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Penalty Structure:</strong> Additional fees reduce attacker profits</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Treasury Destination:</strong> Extra fees go to platform treasury</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Question Ownership Sales */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Question Ownership Sales</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Question Sale Fee Structure</h3>
          <p className="text-gray-300 text-sm mb-6">
            Question creators can sell their ownership (and future royalty rights) to other users. This creates a market for intellectual property rights.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">10%</div>
              <h4 className="text-yellow-400 font-semibold mb-2">Platform Fee</h4>
              <p className="text-gray-300 text-sm mb-3">Transaction facilitation fee</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Smart contract execution</li>
                <li>• Ownership transfer security</li>
                <li>• Platform maintenance</li>
                <li>• Legal compliance</li>
              </ul>
            </div>
            
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">90%</div>
              <h4 className="text-emerald-400 font-semibold mb-2">Seller Receives</h4>
              <p className="text-gray-300 text-sm mb-3">Net proceeds to question seller</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Immediate liquidity</li>
                <li>• Capital for new projects</li>
                <li>• Risk reduction strategy</li>
                <li>• Portfolio rebalancing</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6">
            <h4 className="text-cyan-400 font-semibold mb-3">📊 Question Sale Example (1,000 USDC Sale)</h4>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-white mb-1">1,000 USDC</div>
                <div className="text-sm text-gray-400">Sale Price</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-400 mb-1">100 USDC</div>
                <div className="text-sm text-gray-400">Platform Fee (10%)</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400 mb-1">900 USDC</div>
                <div className="text-sm text-gray-400">Seller Receives (90%)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">When to Sell Question Ownership</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Peak Interest:</strong> Question has high trading volume and attention</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Capital Needs:</strong> Want immediate liquidity for other investments</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Risk Reduction:</strong> Prefer lump sum over uncertain future royalties</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Portfolio Rebalancing:</strong> Diversify across different opinion types</span>
              </li>
            </ul>
          </div>

          <div className="bg-orange-900/20 border border-orange-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Valuation Considerations</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <span><strong>Historical Volume:</strong> Past trading activity indicates future potential</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <span><strong>Topic Longevity:</strong> Will this question remain relevant?</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <span><strong>Price Trends:</strong> Are answer prices increasing over time?</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <span><strong>Discount Rate:</strong> NPV of future royalty stream vs immediate payment</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fee Economics Analysis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Fee Economics & Impact Analysis</h2>
        
        <div className="space-y-6">
          {/* Revenue Projections */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Revenue Projection Examples</h3>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <h4 className="text-emerald-400 font-semibold mb-3">Low-Volume Opinion</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Initial Price:</strong> 5 USDC</p>
                  <p><strong>Monthly Trades:</strong> 3</p>
                  <p><strong>Avg Trade Price:</strong> 8 USDC</p>
                  <p><strong>Monthly Creator Royalty:</strong> ~0.72 USDC (3%)</p>
                  <p><strong>Annual Projection:</strong> ~8.64 USDC</p>
                </div>
                <div className="mt-3 p-2 bg-emerald-800/30 rounded">
                  <p className="text-emerald-400 text-xs"><strong>ROI:</strong> 173% annually on 5 USDC creation fee</p>
                </div>
              </div>
              
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-3">Medium-Volume Opinion</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Initial Price:</strong> 25 USDC</p>
                  <p><strong>Monthly Trades:</strong> 12</p>
                  <p><strong>Avg Trade Price:</strong> 45 USDC</p>
                  <p><strong>Monthly Creator Royalty:</strong> ~16.20 USDC (3%)</p>
                  <p><strong>Annual Projection:</strong> ~194.40 USDC</p>
                </div>
                <div className="mt-3 p-2 bg-cyan-800/30 rounded">
                  <p className="text-cyan-400 text-xs"><strong>ROI:</strong> 3,888% annually on 5 USDC creation fee</p>
                </div>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-orange-400 font-semibold mb-3">High-Volume Opinion</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Initial Price:</strong> 75 USDC</p>
                  <p><strong>Monthly Trades:</strong> 25</p>
                  <p><strong>Avg Trade Price:</strong> 180 USDC</p>
                  <p><strong>Monthly Creator Royalty:</strong> ~135 USDC (3%)</p>
                  <p><strong>Annual Projection:</strong> ~1,620 USDC</p>
                </div>
                <div className="mt-3 p-2 bg-orange-800/30 rounded">
                  <p className="text-orange-400 text-xs"><strong>ROI:</strong> 10,800% annually on 15 USDC creation fee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Economics */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Platform Economics & Sustainability</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Revenue Streams</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Creation Fees:</strong> One-time revenue from new opinions (20% of initial price)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Trading Fees:</strong> Recurring revenue from all answer trades (10% per trade)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Ownership Sales:</strong> Revenue from question ownership transfers (10% per sale)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>MEV Penalties:</strong> Additional revenue from anti-manipulation measures</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Platform Expenses</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Development:</strong> Core team salaries and contractor payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Infrastructure:</strong> Hosting, databases, blockchain nodes, monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Security:</strong> Regular audits, bug bounties, security tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Operations:</strong> Marketing, support, legal, compliance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Economic Incentives */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Economic Incentive Analysis</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-3">👑 Opinion Leaders</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• <strong>High Reward:</strong> Successful questions can generate 10x+ returns</li>
                  <li>• <strong>Low Risk:</strong> One-time creation fee, unlimited upside</li>
                  <li>• <strong>Passive Income:</strong> No ongoing effort required</li>
                  <li>• <strong>Portfolio Building:</strong> Diversify across multiple topics</li>
                </ul>
              </div>
              
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-3">⚡ Opinion Traders</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• <strong>Active Rewards:</strong> 87% of trade value for answer owners</li>
                  <li>• <strong>Skill Premium:</strong> Better answers command higher prices</li>
                  <li>• <strong>Market Timing:</strong> Rewards for identifying opportunities</li>
                  <li>• <strong>Risk Management:</strong> Can diversify across positions</li>
                </ul>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-3">🤝 Pool Members</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• <strong>Collective Power:</strong> Access to expensive opinions</li>
                  <li>• <strong>Shared Risk:</strong> Diversified exposure through pools</li>
                  <li>• <strong>Community Benefits:</strong> Shared research and strategy</li>
                  <li>• <strong>Lower Barriers:</strong> Small contributions, big opportunities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Optimization Strategies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Fee Optimization Strategies</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">For Opinion Leaders</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Optimal Pricing:</strong> Set initial prices based on expected trading volume, not just accessibility</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Quality Investment:</strong> Higher creation fees often correlate with better questions and more trading</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Portfolio Approach:</strong> Create multiple opinions to diversify royalty income streams</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Timing Strategy:</strong> Launch questions when related topics are trending for maximum visibility</span>
              </li>
            </ul>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">For Opinion Traders</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Value Analysis:</strong> Factor in fee structure when calculating potential returns</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Hold Duration:</strong> Consider how long you plan to hold before being outbid</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Competition Assessment:</strong> Higher competition = higher potential next trade price</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <span><strong>Quality Premium:</strong> Superior answers justify higher entry prices due to longer hold times</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fee Structure Summary */}
      <section className="mb-12">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-indigo-400 mb-6 text-center">Complete Fee Structure Reference</h2>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-6">
              <h3 className="text-indigo-400 font-semibold text-lg mb-4">Opinion Creation</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Base Rate:</span>
                  <span className="text-indigo-400">20% of initial price</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Fee:</span>
                  <span className="text-indigo-400">5 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="text-indigo-400">Platform Treasury</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-purple-400 font-semibold text-lg mb-4">Answer Trading</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="text-red-400">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Creator Royalty:</span>
                  <span className="text-orange-400">3%</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Owner:</span>
                  <span className="text-emerald-400">87%</span>
                </div>
              </div>
            </div>

            <div className="bg-pink-900/30 border border-pink-500/30 rounded-lg p-6">
              <h3 className="text-pink-400 font-semibold text-lg mb-4">Question Sales</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="text-red-400">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Seller Receives:</span>
                  <span className="text-emerald-400">90%</span>
                </div>
                <div className="flex justify-between">
                  <span>Transfer:</span>
                  <span className="text-pink-400">Complete ownership</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-800/30 border border-indigo-500/30 rounded-lg p-6">
            <h3 className="text-indigo-400 font-semibold mb-4 text-center">Key Economic Insights</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
              <ul className="space-y-2">
                <li>• <strong>Creators:</strong> Earn 3% royalty on every trade forever</li>
                <li>• <strong>Traders:</strong> Keep 87% of trade value when outbid</li>
                <li>• <strong>Platform:</strong> 10% fee ensures sustainable development</li>
              </ul>
              <ul className="space-y-2">
                <li>• <strong>Pools:</strong> Same fee structure, distributed proportionally</li>
                <li>• <strong>MEV Protection:</strong> Additional penalties for malicious behavior</li>
                <li>• <strong>Transparency:</strong> All fees calculated and distributed automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Start Earning with OpinionMarketCap</h2>
          <p className="text-gray-300 mb-6">
            Understanding the fee structure is the first step to maximizing your returns. Practice on testnet before mainnet deployment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://test.opinionmarketcap.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Test Fee Structure
            </a>
            <a 
              href="/creating-opinions" 
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Create Your First Opinion
            </a>
          </div>
          <p className="text-amber-400 text-sm mt-4 font-semibold">
            💡 All fees are automatically calculated and distributed by smart contracts - no manual processing required!
          </p>
        </div>
      </section>
    </div>
  );
}