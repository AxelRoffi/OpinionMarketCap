import { Users, Target, TrendingUp, DollarSign, Shield, Crown, AlertTriangle, CheckCircle, Zap } from "lucide-react";

export default function PoolSystemPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Pool System Guide
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Collective ownership and trading through community-driven pools for expensive opinions
        </p>
      </div>

      {/* Pool System Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What Are Opinion Pools?</h2>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Users className="h-8 w-8 text-purple-400" />
            <h3 className="text-2xl font-bold text-purple-400">Collective Opinion Trading</h3>
          </div>
          
          <p className="text-gray-300 mb-6 text-lg">
            Pools enable communities to collectively fund and control expensive opinions that would be too costly for individual traders. 
            When multiple people contribute to a pool, they can target high-value opinions and share both ownership and profits.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
              <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-purple-400 font-semibold text-sm mb-1">Pool & Trade</h4>
              <p className="text-gray-300 text-xs">Combine resources to trade expensive opinions</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
              <Crown className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-purple-400 font-semibold text-sm mb-1">Shared Control</h4>
              <p className="text-gray-300 text-xs">Community decides on answers and strategy</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
              <DollarSign className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-purple-400 font-semibold text-sm mb-1">Split Rewards</h4>
              <p className="text-gray-300 text-xs">Profits distributed proportionally</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">How Pool Trading Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">1</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Pool Formation</h4>
                <p className="text-gray-300 text-sm">Community identifies a high-value opinion target (≥100 USDC) and creates a funding pool.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">2</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Contribution Phase</h4>
                <p className="text-gray-300 text-sm">Members contribute USDC to the pool. Each contribution earns proportional ownership shares.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">3</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Pool Execution</h4>
                <p className="text-gray-300 text-sm">When target is reached, pool executes the trade. The PoolManager becomes the answer owner.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">4</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Profit Distribution</h4>
                <p className="text-gray-300 text-sm">When the opinion is outbid, profits are automatically distributed to pool members based on their share.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Eligibility & Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Pool Eligibility & Requirements</h2>
        
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Minimum Price Requirement</h3>
              <p className="text-gray-300 text-sm">
                Only opinions with a <strong>next price ≥ 100 USDC</strong> are eligible for pool creation. 
                This ensures pools target genuinely expensive opinions that benefit from collective funding.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">✅ Pool-Eligible Opinions</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Next price is 100 USDC or higher</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Opinion is currently active and tradeable</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>High-quality question with trading history</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Strong community interest or momentum</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Opportunity for answer improvement</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">❌ Not Pool-Eligible</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Next price below 100 USDC threshold</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Deactivated or moderated opinions</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Very new opinions without trading history</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Opinions already owned by another pool</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>Topics with legal or ethical concerns</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to Participate in Pools</h2>
        
        <div className="space-y-6">
          {/* Joining Existing Pools */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Joining Existing Pools</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Step-by-Step Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <span className="text-gray-300 text-sm">Browse active pools in the "Pools" section</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <span className="text-gray-300 text-sm">Review target opinion, current funding, and pool strategy</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <span className="text-gray-300 text-sm">Contribute USDC to pools that match your conviction</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                    <span className="text-gray-300 text-sm">Receive pool shares proportional to your contribution</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">What to Look For</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span><strong>Clear Strategy:</strong> Well-defined answer and rationale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span><strong>Funding Progress:</strong> Pool nearing its target amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span><strong>Quality Target:</strong> High-value opinion worth the investment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span><strong>Active Community:</strong> Engaged pool members and discussion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span><strong>Timing:</strong> Optimal moment for the planned trade</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Creating New Pools */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Creating New Pools</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Pool Creation Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <span className="text-gray-300 text-sm">Identify a high-value opinion target (≥100 USDC)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <span className="text-gray-300 text-sm">Develop a compelling answer and strategy</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <span className="text-gray-300 text-sm">Set funding target and contribution parameters</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                    <span className="text-gray-300 text-sm">Create pool and make initial contribution</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</div>
                    <span className="text-gray-300 text-sm">Promote pool to attract other contributors</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Success Factors</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span><strong>Strong Thesis:</strong> Clear reasoning for why this trade will succeed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span><strong>Community Building:</strong> Engage others in the strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span><strong>Reasonable Target:</strong> Funding goal that's achievable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span><strong>Timing:</strong> Create pools when community interest is high</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span><strong>Lead by Example:</strong> Make substantial initial contribution</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Economics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Pool Economics & Profit Distribution</h2>
        
        <div className="space-y-6">
          {/* Contribution & Ownership */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Contribution & Ownership Structure</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Share Calculation</h4>
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-300 text-sm mb-3">
                    <strong>Pool Share = Your Contribution ÷ Total Pool Value</strong>
                  </p>
                  <div className="space-y-2 text-xs text-gray-300">
                    <p>• Shares are calculated proportionally</p>
                    <p>• Early contributors get same rate as late contributors</p>
                    <p>• No dilution or premium pricing</p>
                    <p>• Shares determine profit distribution</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Example Calculation</h4>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Target Opinion Price:</span>
                      <span className="text-emerald-400">150 USDC</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Your Contribution:</span>
                      <span className="text-cyan-400">30 USDC</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Total Pool Raised:</span>
                      <span className="text-orange-400">150 USDC</span>
                    </div>
                    <hr className="border-gray-700" />
                    <div className="flex justify-between text-white font-semibold">
                      <span>Your Pool Share:</span>
                      <span className="text-emerald-400">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-2">💡 Key Points</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Minimum contribution: Usually 1-5 USDC depending on pool</li>
                <li>• No maximum contribution limit (but large contributions may dominate)</li>
                <li>• Contributions are locked once pool executes the trade</li>
                <li>• Shares remain constant until profits are distributed</li>
              </ul>
            </div>
          </div>

          {/* Profit Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Profit Distribution Mechanism</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">When Pools Get Outbid</h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>When someone outbids a pool-owned opinion, the profit distribution follows standard fee structure:</p>
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>10%:</strong> Platform fee (to treasury)</li>
                      <li>• <strong>3%:</strong> Creator royalty (to question owner)</li>
                      <li>• <strong>87%:</strong> Pool profits (distributed to members)</li>
                    </ul>
                  </div>
                  <p>The 87% profit is automatically distributed to pool members based on their exact share percentage.</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Distribution Example</h4>
                <div className="bg-gray-800 rounded-lg p-4 mb-3">
                  <div className="space-y-2 text-sm">
                    <div className="text-yellow-400 font-semibold mb-2">Pool outbid for 300 USDC</div>
                    <div className="flex justify-between text-gray-300">
                      <span>Platform Fee (10%):</span>
                      <span className="text-red-400">-30 USDC</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Creator Royalty (3%):</span>
                      <span className="text-orange-400">-9 USDC</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold">
                      <span>Pool Profits (87%):</span>
                      <span className="text-emerald-400">261 USDC</span>
                    </div>
                    <hr className="border-gray-700 my-2" />
                    <div className="text-cyan-400 text-xs">Your 20% share = 52.2 USDC profit</div>
                    <div className="text-gray-400 text-xs">Original 30 USDC investment + 52.2 USDC profit = 82.2 USDC total</div>
                  </div>
                </div>
                <div className="text-emerald-300 text-xs bg-emerald-900/20 rounded p-2">
                  <strong>Return:</strong> 174% gain (82.2 ÷ 30 = 2.74x your investment)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Strategy & Governance */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Pool Strategy & Governance</h2>
        
        <div className="space-y-6">
          {/* Strategy Development */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Collective Strategy Development</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Answer Development Process</h4>
                <div className="space-y-3">
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                    <h5 className="text-purple-400 text-sm font-semibold mb-1">1. Research Phase</h5>
                    <p className="text-gray-300 text-xs">Pool members collaborate to research the topic and identify weaknesses in the current answer</p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                    <h5 className="text-purple-400 text-sm font-semibold mb-1">2. Strategy Discussion</h5>
                    <p className="text-gray-300 text-xs">Community discusses different approaches and builds consensus around the best strategy</p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                    <h5 className="text-purple-400 text-sm font-semibold mb-1">3. Answer Crafting</h5>
                    <p className="text-gray-300 text-xs">Final answer is crafted based on collective input and refined through community feedback</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Decision Making</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Proportional Influence:</strong> Larger contributors have more weight in decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Consensus Building:</strong> Focus on strategies that most members support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Expertise Recognition:</strong> Domain experts' opinions carry additional weight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span><strong>Final Decision:</strong> Pool creator or majority can finalize execution</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Management for Pools */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Pool Risk Management</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Common Pool Risks</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Coordination Failure:</strong> Pool can't agree on strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Timing Risk:</strong> Market conditions change before execution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Competition Risk:</strong> Other traders outbid the pool quickly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Quality Risk:</strong> Collective answer isn't actually better</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span><strong>Liquidity Risk:</strong> Opinion becomes less tradeable</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Risk Mitigation Strategies</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Clear Leadership:</strong> Designated pool manager for final decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Timeline Limits:</strong> Set deadlines for decision-making</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Quality Standards:</strong> Minimum criteria for answer quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Exit Mechanisms:</strong> Ways to refund if pool fails to execute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Diversification:</strong> Don't put all funds in one pool</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Success Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Pool Success Case Studies</h2>
        
        <div className="space-y-6">
          {/* Example 1: Tech Opinion Pool */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">Case Study 1: AI Regulation Pool</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Pool Details</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Target Opinion:</strong> "Will EU pass comprehensive AI regulation by end of 2024?"</p>
                  <p><strong>Current Answer:</strong> "Unlikely due to industry lobbying" (weak, outdated)</p>
                  <p><strong>Target Price:</strong> 180 USDC</p>
                  <p><strong>Pool Strategy:</strong> Leverage insider knowledge of recent EU developments</p>
                  <p><strong>Contributors:</strong> 12 members, including policy experts</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Results</h4>
                <div className="space-y-3">
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded p-3">
                    <p className="text-blue-300 text-sm"><strong>Pool Answer:</strong> "Yes, AI Act will pass in modified form by Q4 2024 based on latest committee progress"</p>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-2">
                    <p className="text-emerald-400 text-sm"><strong>Outcome:</strong> Held position for 3 weeks, outbid for 320 USDC</p>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2">
                    <p className="text-yellow-400 text-sm"><strong>Returns:</strong> 78% average return for pool members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2: Crypto Market Pool */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Case Study 2: Bitcoin Price Prediction Pool</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Pool Details</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Target Opinion:</strong> "Will Bitcoin reach $100K in 2024?"</p>
                  <p><strong>Current Answer:</strong> "Yes, due to ETF approval momentum" (surface-level analysis)</p>
                  <p><strong>Target Price:</strong> 250 USDC</p>
                  <p><strong>Pool Strategy:</strong> Provide nuanced analysis incorporating market cycles and macro factors</p>
                  <p><strong>Contributors:</strong> 8 members, mix of traders and analysts</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Results</h4>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 border border-orange-500/30 rounded p-3">
                    <p className="text-orange-300 text-sm"><strong>Pool Answer:</strong> "Unlikely to reach $100K in 2024. ETF momentum already priced in, macro headwinds and halving timing suggest $85K ceiling"</p>
                  </div>
                  <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                    <p className="text-red-400 text-sm"><strong>Outcome:</strong> Quickly outbid by bullish trader for 275 USDC</p>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-2">
                    <p className="text-emerald-400 text-sm"><strong>Returns:</strong> 10% quick return, but missed long-term potential</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Key Lessons from Successful Pools</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-800/30 rounded p-3">
              <h4 className="text-purple-300 font-semibold text-sm mb-2">Quality Over Speed</h4>
              <p className="text-gray-300 text-xs">Best pools take time to craft genuinely superior answers rather than rushing to execute</p>
            </div>
            <div className="bg-purple-800/30 rounded p-3">
              <h4 className="text-purple-300 font-semibold text-sm mb-2">Expertise Matters</h4>
              <p className="text-gray-300 text-xs">Pools with domain experts consistently outperform generalist approaches</p>
            </div>
            <div className="bg-purple-800/30 rounded p-3">
              <h4 className="text-purple-300 font-semibold text-sm mb-2">Community Coordination</h4>
              <p className="text-gray-300 text-xs">Success requires both financial coordination and intellectual collaboration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started with Pools */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Join the Pool Revolution?</h2>
          <p className="text-gray-300 mb-6">
            Start with small contributions to learn pool dynamics, then scale up as you gain experience with collective trading
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://test.opinionmarketcap.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Explore Active Pools
            </a>
            <a 
              href="/fee-structure" 
              className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Understand Pool Economics
            </a>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-800/30 rounded p-3">
              <div className="text-purple-400 font-semibold mb-1">Minimum Investment</div>
              <div className="text-gray-300">Usually 1-5 USDC per pool</div>
            </div>
            <div className="bg-purple-800/30 rounded p-3">
              <div className="text-purple-400 font-semibold mb-1">Target Opinions</div>
              <div className="text-gray-300">100+ USDC next price</div>
            </div>
            <div className="bg-purple-800/30 rounded p-3">
              <div className="text-purple-400 font-semibold mb-1">Expected Returns</div>
              <div className="text-gray-300">30-200% depending on success</div>
            </div>
          </div>
          <p className="text-amber-400 text-sm mt-4 font-semibold">
            ⚠️ Remember: This is testnet. Practice pool strategies risk-free before mainnet!
          </p>
        </div>
      </section>
    </div>
  );
}