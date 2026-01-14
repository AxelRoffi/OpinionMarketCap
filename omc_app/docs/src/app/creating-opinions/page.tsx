import { Lightbulb, Crown, Target, Image, Link as LinkIcon, AlertTriangle, CheckCircle, DollarSign, TrendingUp } from "lucide-react";

export default function CreatingOpinionsPage() {
  return (
    <div className="docs-content">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Creating Opinions Guide
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Master the art of opinion creation: from crafting engaging questions to optimizing for maximum engagement and revenue
        </p>
      </div>

      {/* Opinion Creation Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Opinion Creation Overview</h2>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Crown className="h-8 w-8 text-orange-400" />
            <h3 className="text-2xl font-bold text-orange-400">Become an Opinion Leader</h3>
          </div>
          <p className="text-gray-300 mb-6 text-lg">
            As an Opinion Leader, you create the questions that spark conversations and earn passive income from every trade. 
            Your intellectual contribution becomes a permanent revenue stream.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4 text-center">
              <Lightbulb className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <h4 className="text-yellow-400 font-semibold text-sm mb-1">Create Questions</h4>
              <p className="text-gray-300 text-xs">Craft engaging, thought-provoking questions</p>
            </div>
            <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4 text-center">
              <TrendingUp className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <h4 className="text-orange-400 font-semibold text-sm mb-1">Earn Forever</h4>
              <p className="text-gray-300 text-xs">3% royalty from every future trade</p>
            </div>
            <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4 text-center">
              <Crown className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <h4 className="text-orange-400 font-semibold text-sm mb-1">Build Influence</h4>
              <p className="text-gray-300 text-xs">Shape discourse on important topics</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">The Opinion Creation Process</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">1</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Craft Your Question</h4>
                <p className="text-gray-300 text-sm">Create an engaging question (max 52 chars) that invites debate and multiple perspectives.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">2</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Provide Initial Answer</h4>
                <p className="text-gray-300 text-sm">Give your perspective to seed the discussion and establish the initial narrative.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">3</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Set Strategic Price</h4>
                <p className="text-gray-300 text-sm">Choose initial price (1-100 USDC) balancing accessibility with potential royalties.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">4</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Choose Categories</h4>
                <p className="text-gray-300 text-sm">Select 1-3 categories to help users discover your opinion in relevant topics.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 mt-1">5</div>
              <div>
                <h4 className="text-white font-semibold mb-1">Pay Creation Fee</h4>
                <p className="text-gray-300 text-sm">Pay 20% of initial price (minimum 2 USDC) to mint your opinion on-chain.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Question Crafting Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Crafting Engaging Questions</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">✅ Best Practices</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Be Specific:</strong> "Will AI replace 50% of software jobs by 2030?" vs "Will AI replace jobs?"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Invite Debate:</strong> Questions with multiple valid perspectives generate more trading</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Stay Current:</strong> Reference trending topics, recent events, or emerging technologies</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Be Concise:</strong> Make every character count within the 52-character limit</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Use Action Words:</strong> "Will", "Should", "Can", "How" create dynamic questions</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">❌ Common Mistakes</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Too Vague:</strong> "What about crypto?" doesn't invite specific answers</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Too Obvious:</strong> Questions with clear unanimous answers won't generate trades</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Too Niche:</strong> Extremely specialized topics limit your audience</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Inappropriate Content:</strong> Offensive or harmful content will be moderated</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span><strong>Typos/Grammar:</strong> Poor quality reduces credibility and engagement</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Question Examples by Category</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold text-sm mb-2">🏛️ Politics</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>"Who wins 2024 US presidential election?"</li>
                <li>"Will EU ban TikTok by end of 2024?"</li>
                <li>"Should AI have voting rights by 2030?"</li>
              </ul>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold text-sm mb-2">💰 Crypto</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>"Will BTC hit $100K in 2024?"</li>
                <li>"Which L2 will have highest TVL by 2025?"</li>
                <li>"Will Ethereum flip Bitcoin by 2030?"</li>
              </ul>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold text-sm mb-2">🔬 Technology</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>"Will AGI be achieved by 2025?"</li>
                <li>"Can quantum computers break Bitcoin?"</li>
                <li>"Will Apple release AR glasses in 2024?"</li>
              </ul>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold text-sm mb-2">📈 Business</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>"Will Tesla hit $1T market cap?"</li>
                <li>"Which company leads AI race in 2025?"</li>
                <li>"Will remote work become permanent?"</li>
              </ul>
            </div>
            <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4">
              <h4 className="text-pink-400 font-semibold text-sm mb-2">🎭 Culture</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>"Will streaming replace movie theaters?"</li>
                <li>"Which social platform wins Gen Alpha?"</li>
                <li>"Will NFTs make a comeback in 2024?"</li>
              </ul>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-yellow-400 font-semibold text-sm mb-2">⚽ Sports</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>"Who wins World Cup 2026?"</li>
                <li>"Will esports be in Olympics 2028?"</li>
                <li>"Can anyone beat Mahomes in 2024?"</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Strategy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Initial Pricing Strategy</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Price Range: 1-100 USDC</h3>
          <p className="text-gray-300 text-sm mb-4">
            Your initial price determines both accessibility and your potential royalty income. Consider your target audience, topic importance, and revenue goals.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-3">💚 Low Price (1-10 USDC)</h4>
              <div className="space-y-2 text-sm text-gray-300 mb-3">
                <p><strong>Best for:</strong> Viral questions, broad appeal topics, building audience</p>
                <p><strong>Pros:</strong> High accessibility, more traders, faster growth</p>
                <p><strong>Cons:</strong> Lower royalty per trade</p>
              </div>
              <div className="text-xs text-emerald-300 bg-emerald-900/30 rounded p-2">
                Example: "Will AI replace influencers?" at 3 USDC
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-3">🧡 Medium Price (15-40 USDC)</h4>
              <div className="space-y-2 text-sm text-gray-300 mb-3">
                <p><strong>Best for:</strong> Specialized topics, quality-focused discussions</p>
                <p><strong>Pros:</strong> Balanced accessibility and returns, serious traders</p>
                <p><strong>Cons:</strong> May limit casual participation</p>
              </div>
              <div className="text-xs text-orange-300 bg-orange-900/30 rounded p-2">
                Example: "Which blockchain wins enterprise adoption?" at 25 USDC
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-3">❤️ High Price (50-100 USDC)</h4>
              <div className="space-y-2 text-sm text-gray-300 mb-3">
                <p><strong>Best for:</strong> Expert opinions, high-stakes topics, pool candidates</p>
                <p><strong>Pros:</strong> Maximum royalty potential, premium positioning</p>
                <p><strong>Cons:</strong> Limited accessibility, may need pools</p>
              </div>
              <div className="text-xs text-red-300 bg-red-900/30 rounded p-2">
                Example: "Will quantum computing break encryption by 2030?" at 75 USDC
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">💰 Revenue Calculation Examples</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Low Price Strategy (3 USDC initial)</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Creation fee: 2 USDC (20%, but minimum)</li>
                <li>• Your cost: 2 USDC total</li>
                <li>• Per trade royalty: ~0.15-0.60 USDC (3% of trade price)</li>
                <li>• Break even: ~15-30 trades</li>
                <li>• Potential: High volume = high total returns</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">High Price Strategy (50 USDC initial)</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Creation fee: 10 USDC (20%)</li>
                <li>• Your cost: 10 USDC total</li>
                <li>• Per trade royalty: ~1.50-6.00 USDC (3% of trade price)</li>
                <li>• Break even: ~2-7 trades</li>
                <li>• Potential: Lower volume but higher per-trade returns</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Category Selection Strategy</h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Available Categories</h3>
          <p className="text-gray-300 text-sm mb-4">Choose 1-3 categories that best represent your question for optimal discovery.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3 text-center">
              <span className="text-orange-400 font-semibold">🪙 Crypto</span>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 text-center">
              <span className="text-blue-400 font-semibold">🏛️ Politics</span>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3 text-center">
              <span className="text-emerald-400 font-semibold">🔬 Science</span>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 text-center">
              <span className="text-purple-400 font-semibold">💻 Technology</span>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3 text-center">
              <span className="text-yellow-400 font-semibold">⚽ Sports</span>
            </div>
            <div className="bg-pink-900/20 border border-pink-500/30 rounded p-3 text-center">
              <span className="text-pink-400 font-semibold">🎭 Entertainment</span>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3 text-center">
              <span className="text-cyan-400 font-semibold">🌍 Culture</span>
            </div>
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded p-3 text-center">
              <span className="text-indigo-400 font-semibold">🌐 Web</span>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded p-3 text-center">
              <span className="text-green-400 font-semibold">📱 Social Media</span>
            </div>
            <div className="bg-gray-700/20 border border-gray-500/30 rounded p-3 text-center">
              <span className="text-gray-400 font-semibold">❓ Other</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Category Selection Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Primary Category:</strong> Choose the most relevant category first</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Cross-Category Appeal:</strong> Select 2-3 categories for broader reach</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Popular Categories:</strong> Crypto, Technology, Politics tend to have more activity</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Avoid "Other":</strong> Unless your topic truly doesn't fit elsewhere</span>
              </li>
            </ul>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Multi-Category Examples</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white font-semibold mb-1">"Will Tesla accept Bitcoin payments again?"</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Crypto</span>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Technology</span>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">"Will AI regulation pass in 2024?"</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Politics</span>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Technology</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Science</span>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">"Which streaming platform wins sports?"</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Sports</span>
                  <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded">Entertainment</span>
                  <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Web</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Features</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* IPFS Images */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Image className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">IPFS Images</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Add visual context to your opinions with IPFS-hosted images. Perfect for charts, memes, or illustrative content.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Supported Formats:</h4>
                <p className="text-gray-300 text-xs">PNG, JPG, GIF, WEBP (max 10MB recommended)</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">IPFS Hash Format:</h4>
                <p className="text-gray-300 text-xs font-mono">QmXxXxXx... (max 68 characters)</p>
              </div>
            </div>
            <div className="bg-purple-900/30 border border-purple-500/30 rounded p-3">
              <p className="text-purple-300 text-xs">
                <strong>💡 Tip:</strong> Use services like Pinata or Infura to upload images to IPFS, then use the hash in your opinion.
              </p>
            </div>
          </div>

          {/* External Links */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="h-6 w-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400">External Links</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Reference external sources, articles, or relevant content to provide additional context for your opinion.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Link Types:</h4>
                <p className="text-gray-300 text-xs">News articles, research papers, social media, documentation</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Format:</h4>
                <p className="text-gray-300 text-xs">Full URL including https:// (max 260 characters)</p>
              </div>
            </div>
            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded p-3">
              <p className="text-cyan-300 text-xs">
                <strong>🔗 Example:</strong> "https://example.com/ai-research-breakthrough-2024"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-900/20 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Content Moderation</h3>
              <p className="text-gray-300 text-sm">
                All images and links are subject to moderation. Inappropriate, spam, or malicious content will be removed. 
                IPFS content should comply with platform guidelines and local laws.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Optimization Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Optimization for Success</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Timing Your Opinion Launch</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <h4 className="text-emerald-400 font-semibold text-sm mb-2">🌅 Peak Hours</h4>
                <p className="text-gray-300 text-xs mb-2">8-10 AM, 7-9 PM EST</p>
                <p className="text-gray-400 text-xs">Highest user activity and engagement</p>
              </div>
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold text-sm mb-2">📅 Best Days</h4>
                <p className="text-gray-300 text-xs mb-2">Tuesday-Thursday</p>
                <p className="text-gray-400 text-xs">Optimal attention and participation</p>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-orange-400 font-semibold text-sm mb-2">📈 Trend Riding</h4>
                <p className="text-gray-300 text-xs mb-2">During news cycles</p>
                <p className="text-gray-400 text-xs">Capitalize on current events</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Maximizing Long-term Revenue</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Volume Strategy</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Create multiple opinions on trending topics</li>
                  <li>• Price for accessibility (5-15 USDC range)</li>
                  <li>• Focus on broad appeal questions</li>
                  <li>• Build reputation for quality content</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Premium Strategy</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Focus on expert-level opinions</li>
                  <li>• Higher pricing (25-75 USDC range)</li>
                  <li>• Target sophisticated audiences</li>
                  <li>• Establish thought leadership</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Building Your Opinion Portfolio</h3>
            <p className="text-gray-300 text-sm mb-4">
              Successful Opinion Leaders don't rely on single hits. Build a diverse portfolio of questions across categories and price ranges.
            </p>
            <div className="grid md:grid-cols-4 gap-3">
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3 text-center">
                <div className="text-lg font-bold text-cyan-400 mb-1">70%</div>
                <div className="text-xs text-gray-400">Accessible opinions (1-10 USDC)</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3 text-center">
                <div className="text-lg font-bold text-orange-400 mb-1">20%</div>
                <div className="text-xs text-gray-400">Medium pricing (15-30 USDC)</div>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3 text-center">
                <div className="text-lg font-bold text-red-400 mb-1">10%</div>
                <div className="text-xs text-gray-400">Premium opinions (50+ USDC)</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 text-center">
                <div className="text-lg font-bold text-purple-400 mb-1">3-5</div>
                <div className="text-xs text-gray-400">Categories covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Create Your First Opinion?</h2>
          <p className="text-gray-300 mb-6">Start building your reputation as an Opinion Leader and earn from every future trade</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://app.opinionmarketcap.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Create Opinion Now
            </a>
            <a 
              href="/fee-structure" 
              className="border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              View Fee Structure
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Remember: This is testnet. Perfect your strategy with free tokens before mainnet!
          </p>
        </div>
      </section>
    </div>
  );
}