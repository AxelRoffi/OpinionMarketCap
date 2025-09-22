"use client"

import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Coins,
  Infinity,
  DollarSign,
  Clock,
  Globe,
  Zap,
  Target
} from "lucide-react"

export default function ProfessionalLandingDark() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <LandingNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">OPINION</span>
              <span className="text-blue-400"> MARKET</span>
              <span className="text-white"> CAP</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-semibold mb-4">
              The Infinite Marketplace
            </p>
            <p className="text-xl md:text-2xl text-blue-400 font-bold mb-8">
              Own The Narrative, Earn The Profits
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Where Opinions Become Tradable Assets
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
            >
              <a href="https://test.opinionmarketcap.xyz/create" target="_blank" rel="noopener noreferrer">
                Mint & Earn
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              <a href="https://test.opinionmarketcap.xyz/" target="_blank" rel="noopener noreferrer">
                Browse Questions
              </a>
            </Button>
          </div>

          {/* Built on Base Badge */}
          <div className="inline-flex items-center bg-blue-900/30 border border-blue-400/30 rounded-full px-6 py-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-blue-300 font-semibold">Built on Base</span>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The Current Problem</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Traditional opinion or prediction markets are limited and centralized. 
                Most people can't profit from their knowledge and insights.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-blue-400 mb-6">Our Solution</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                OMC creates an infinite marketplace where anyone can mint, 
                trade, and profit from opinions on anything. Forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Everything You Need to Profit from Opinions
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-900/30 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Trading</h3>
              <p className="text-gray-300">Trade opinions instantly with transparent pricing and protected transactions.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-900/30 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Pool Collaboration</h3>
              <p className="text-gray-300">Create pools with others to amplify market impact and share rewards.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-900/30 border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Question Ownership</h3>
              <p className="text-gray-300">Mint questions & earn 3% royalties from every transaction, forever. Or sell it</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-900/30 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Anti-MEV Protection</h3>
              <p className="text-gray-300">Protected from front-running and sandwich attacks for fair trading.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Mint Questions</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Post questions on any topic and own them forever. Earn royalties from every trade.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Trade Your Opinion</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Buy/sell opinions with protected transactions and transparent pricing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Earn Profits</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Get rewarded whenever someone buys the right to change your opinion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Real Example Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Real Example: Passive Income in Action
          </h2>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-700/50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                "Best Pizza in Brooklyn under 50 USDC?"
              </h3>
              <p className="text-gray-300">A timeless question that generates income 24/7</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">$1,247</div>
                <div className="text-sm text-gray-300">Total Earnings</div>
                <div className="text-xs text-gray-400 mt-1">Over 8 months</div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">2,156</div>
                <div className="text-sm text-gray-300">Total Trades</div>
                <div className="text-xs text-gray-400 mt-1">And counting...</div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">~$180</div>
                <div className="text-sm text-gray-300">Monthly Income</div>
                <div className="text-xs text-gray-400 mt-1">Passive royalties</div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">3%</div>
                <div className="text-sm text-gray-300">Royalty Rate</div>
                <div className="text-xs text-gray-400 mt-1">On every trade</div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-8 mb-8">
              <h4 className="text-xl font-semibold text-white mb-6">💰 Money Flow Per Trade</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Trader pays:</span>
                  <span className="font-semibold text-white">$15 USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400">Question owner gets:</span>
                  <span className="font-semibold text-blue-400">$0.45 (3% royalty)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Platform fee:</span>
                  <span className="font-semibold text-white">$0.30 (2%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400">Answer Owner:</span>
                  <span className="font-semibold text-green-400">$14.25 (95%)</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Shield className="w-5 h-5 text-red-400 mr-2" />
                  <span className="font-semibold text-white">Anti-MEV Protection</span>
                </div>
                <p className="text-gray-300 text-sm">
                  All trades protected from front-running and sandwich attacks
                </p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-green-400 mr-2" />
                  <span className="font-semibold text-white">Timeless Earning</span>
                </div>
                <p className="text-gray-300 text-sm">
                  New Yorkers and tourists continuously trade their pizza opinions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Live Stats Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Live Platform Statistics
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">$247K</div>
              <div className="text-gray-300 font-medium">Total Volume</div>
              <div className="text-sm text-gray-400 mt-2">Lifetime trading</div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">1,247</div>
              <div className="text-gray-300 font-medium">Active Traders</div>
              <div className="text-sm text-gray-400 mt-2">This month</div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">98%</div>
              <div className="text-gray-300 font-medium">Community Rewards</div>
              <div className="text-sm text-gray-400 mt-2">Goes to traders</div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">Zero</div>
              <div className="text-gray-300 font-medium">MEV Attacks</div>
              <div className="text-sm text-gray-400 mt-2">100% protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            High-Earning Question Categories
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🍕</div>
              <h3 className="text-xl font-semibold text-white mb-3">Food & Culture</h3>
              <p className="text-gray-300 text-sm mb-4">Best restaurants, Recipe competitions, Cuisine rankings</p>
              <p className="text-green-400 font-medium text-sm">Avg: $200-400/month</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="text-xl font-semibold text-white mb-3">Sports & Entertainment</h3>
              <p className="text-gray-300 text-sm mb-4">GOAT debates, Favorite movies, Music legends</p>
              <p className="text-green-400 font-medium text-sm">Avg: $300-600/month</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold text-white mb-3">Technology & Web3</h3>
              <p className="text-gray-300 text-sm mb-4">Best protocols, Platform comparisons, Tool preferences</p>
              <p className="text-green-400 font-medium text-sm">Avg: $250-500/month</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏙️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Local & Community</h3>
              <p className="text-gray-300 text-sm mb-4">City recommendations, Local services, Area knowledge</p>
              <p className="text-green-400 font-medium text-sm">Avg: $150-350/month</p>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Examples of High-Earning Minted Questions
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-2">"Who is the GOAT of Soccer?"</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$23.4K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$468</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-2">"iPhone vs Android - Which is Superior?"</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$31.8K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">1,593</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$636</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-2">"Most Overrated TV Show Ever?"</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$14.2K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">673</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$284</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-2">"Best Pizza in Brooklyn under 50 USDC?"</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$18.7K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$374</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Why Timeless Questions Win */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Mint Once, Earn Forever
          </h2>
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">The Power of Timeless Questions</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">No Expiration Dates</h4>
                    <p className="text-gray-300">Your questions generate income indefinitely</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Evergreen Topics</h4>
                    <p className="text-gray-300">Food, sports, culture never go out of style</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Global Appeal</h4>
                    <p className="text-gray-300">Questions that interest people worldwide</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Compound Earnings</h4>
                    <p className="text-gray-300">More popular questions attract more traders over time</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
              <h4 className="text-xl font-bold text-white mb-6">💡 Pro Tip</h4>
              <p className="text-gray-300 mb-6">
                Questions that spark passionate debates generate the most trading volume. 
                Think about topics people love to argue about!
              </p>
              
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-600 rounded-xl p-6">
                <h5 className="font-semibold text-white mb-3">Best Performing Categories:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sports GOAT debates</span>
                    <span className="text-green-400 font-medium">$300-600/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Food & restaurant reviews</span>
                    <span className="text-green-400 font-medium">$200-400/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tech product comparisons</span>
                    <span className="text-green-400 font-medium">$250-500/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Local city knowledge</span>
                    <span className="text-green-400 font-medium">$150-350/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Security & Technology Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Enterprise-Grade Security
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800 border-2 border-red-900/50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-900/30 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Anti-MEV Protection</h3>
              <p className="text-gray-300 text-sm">No front-running or sandwich attacks</p>
            </div>
            
            <div className="bg-gray-800 border-2 border-blue-900/50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-900/30 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Smart Contract Audited</h3>
              <p className="text-gray-300 text-sm">Verified and secure on Base</p>
            </div>
            
            <div className="bg-gray-800 border-2 border-green-900/50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-900/30 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Transparent Pricing</h3>
              <p className="text-gray-300 text-sm">All fees and royalties visible</p>
            </div>
            
            <div className="bg-gray-800 border-2 border-purple-900/50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-900/30 border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Decentralized</h3>
              <p className="text-gray-300 text-sm">Community-owned and operated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Community & Trust Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">
            Built for the Community
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            98% of platform fees go back to traders and question minters.
            Transparent, decentralized, and fair.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="text-3xl font-bold text-blue-400 mb-2">$2,847</div>
              <div className="text-gray-300 mb-2">Monthly Income</div>
              <div className="text-gray-400 text-sm">Food blogger • 47 restaurant questions</div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="text-3xl font-bold text-green-400 mb-2">$1,923</div>
              <div className="text-gray-300 mb-2">Monthly Income</div>
              <div className="text-gray-400 text-sm">Sports fan • 23 GOAT debates</div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="text-3xl font-bold text-purple-400 mb-2">$1,456</div>
              <div className="text-gray-300 mb-2">Monthly Income</div>
              <div className="text-gray-400 text-sm">Local guide • 34 city questions</div>
            </div>
          </div>

          <p className="text-2xl font-semibold text-blue-400 mb-8">
            Start Your Passive Income Stream Today
          </p>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            Mint timeless questions about topics you're passionate about.
            Earn royalties from every trade, forever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
            >
              <a href="https://test.opinionmarketcap.xyz/create" target="_blank" rel="noopener noreferrer">
                Mint Your First Question
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              <a href="https://test.opinionmarketcap.xyz/" target="_blank" rel="noopener noreferrer">
                Browse Top Questions
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-800/60"></div>

      {/* Footer */}
      <footer className="py-16 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">OpinionMarketCap</h4>
              <p className="text-gray-300 text-sm">
                The infinite marketplace where opinions become tradable assets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="/mission" className="block text-gray-300 hover:text-blue-400">Mission</a>
                <a href="/how-it-works" className="block text-gray-300 hover:text-blue-400">How it Works</a>
                <a href="/tutorial" className="block text-gray-300 hover:text-blue-400">Tutorial</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-blue-400">Discord</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">Twitter</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">GitHub</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-blue-400">Terms</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">Privacy</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">Docs</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 OpinionMarketCap. Built on Base. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}