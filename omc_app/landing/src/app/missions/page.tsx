"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, Users, DollarSign, Target, Zap, Globe, Search, BarChart3, Infinity, Crown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"

export default function Mission() {
  const [mounted, setMounted] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    keywords: 0,
    markets: 0,
    community: 0
  })

  useEffect(() => {
    setMounted(true)
    
    // Animate statistics
    const timer = setTimeout(() => {
      setAnimatedStats({
        keywords: 100,
        markets: 100,
        community: 98
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const comparisonData = {
    polymarket: {
      scope: "~500 event predictions",
      resolution: "Resolves once",
      valueFlow: "Platform-centric",
      participants: "Speculators only",
      timeframe: "Event-based",
      examples: "Election outcomes, sports results"
    },
    google: {
      scope: "Billions of web pages",
      resolution: "Links list Algorithm-ranked",
      valueFlow: "Ad-revenue based",
      participants: "Advertisers & users",
      timeframe: "Real-time indexing",
      examples: "SEO content, paid ads"
    },
    omc: {
      scope: "Millions of decentralized opinion markets",
      resolution: "Never resolves - perpetual markets",
      valueFlow: "98% to community via smart contracts", 
      participants: "Everyone profits from knowledge on-chain",
      timeframe: "Continuous evolution with blockchain immutability",
      examples: "Best CRM, luxury brands, local businesses - all tokenized"
    }
  }

  const economicRoles = [
    {
      role: "Question Creator",
      description: "Creates a market/opinion, pays creation fee",
      earnings: "3% royalty on every future answer trade forever",
      example: "Created \"Best CRM for startups?\" → earns 3% of $50K volume = $1,500"
    },
    {
      role: "Current Answer Owner", 
      description: "Owns the current answer to any question",
      earnings: "95% when someone pays to change their answer",
      example: "Owns \"Salesforce\" at $500 → someone pays $650 → receives $617.50"
    },
    {
      role: "Enterprise Advertisers",
      description: "Compete for status positioning and market research",
      earnings: "Brand positioning and verified market consensus",
      example: "Luxury brands battle for \"Most prestigious watch brand?\""
    },
    {
      role: "Communities & Speculators",
      description: "Pool resources and trade on market knowledge",
      earnings: "95% value capture from successful predictions",
      example: "Early adopters buying low-priced answers before appreciation"
    }
  ]

  if (!mounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Navigation */}
      <LandingNavigation />
      
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={cn(
              "absolute w-1 h-1 rounded-full animate-pulse",
              i % 4 === 0 && "bg-blue-400/30",
              i % 4 === 1 && "bg-purple-400/30", 
              i % 4 === 2 && "bg-emerald-400/30",
              i % 4 === 3 && "bg-yellow-400/30"
            )}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (2 + Math.random() * 3) + 's'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            className="text-4xl md:text-7xl font-black mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              THE INFINITE
            </span>
            <br />
            <span className="text-white">MARKETPLACE</span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="text-yellow-400 font-semibold">Revolutionary Concept:</span> Where every monetizable search query becomes a tradeable opinion market
          </motion.p>

          {/* Animated Statistics */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-6">
              <div className="text-4xl font-bold text-blue-400">{animatedStats.keywords}M+</div>
              <div className="text-gray-300">Ad Keywords</div>
              <div className="text-sm text-gray-400">Potential OMC Markets</div>
            </div>
            <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-6">
              <div className="text-4xl font-bold text-purple-400">{animatedStats.markets}M+</div>
              <div className="text-gray-300">Opinion Markets</div>
              <div className="text-sm text-gray-400">vs ~500 Traditional</div>
            </div>
            <div className="bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-6">
              <div className="text-4xl font-bold text-emerald-400">{animatedStats.community}%</div>
              <div className="text-gray-300">To Community</div>
              <div className="text-sm text-gray-400">Value Distribution</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <Tabs defaultValue="concept" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
              <TabsTrigger value="concept" className="text-white data-[state=active]:bg-blue-600">The Concept</TabsTrigger>
              <TabsTrigger value="opportunity" className="text-white data-[state=active]:bg-purple-600">Market Size</TabsTrigger>
              <TabsTrigger value="comparison" className="text-white data-[state=active]:bg-emerald-600">Comparisons</TabsTrigger>
              <TabsTrigger value="economics" className="text-white data-[state=active]:bg-yellow-600">Economics</TabsTrigger>
              <TabsTrigger value="vision" className="text-white data-[state=active]:bg-red-600">Vision</TabsTrigger>
            </TabsList>

            {/* The Concept Tab */}
            <TabsContent value="concept" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-white mb-6">How It All Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-12">
                    <p className="text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
                      It all starts with a question and everyone has an opinion about it. OMC organizes those opinions in a revolutionary way - by creating tradeable markets around every valuable query by owning and trading on Base Blockchain.
                    </p>
                  </div>
                  
                  {/* Visual Flow */}
                  <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {[
                      { icon: <Search className="w-12 h-12" />, title: "Question Minted", desc: "\"Best CRM for startups?\"", color: "from-blue-500 to-cyan-500" },
                      { icon: <Target className="w-12 h-12" />, title: "Opinions Form", desc: "Multiple answers compete with price dimension", color: "from-purple-500 to-pink-500" },
                      { icon: <BarChart3 className="w-12 h-12" />, title: "Market Creates", desc: "Economic value emerges", color: "from-green-500 to-emerald-500" },
                      { icon: <DollarSign className="w-12 h-12" />, title: "Everyone Profits", desc: "98% goes to community", color: "from-yellow-500 to-orange-500" }
                    ].map((step, index) => (
                      <motion.div
                        key={step.title}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * index, duration: 0.6 }}
                      >
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                          `bg-gradient-to-r ${step.color}`
                        )}>
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-300">{step.desc}</p>
                        {index < 3 && <ArrowRight className="w-6 h-6 mx-auto mt-4 text-gray-400" />}
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Real-World Examples</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-600/20 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Local Business</h4>
                        <p className="text-gray-200">"Best pizza under $50 in Brooklyn?"</p>
                        <p className="text-sm text-gray-400 mt-2">Local restaurants compete for ownership and customer acquisition</p>
                      </div>
                      <div className="bg-purple-600/20 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-purple-300 mb-2">Luxury Market</h4>
                        <p className="text-gray-200">"Most iconic female fragrance?"</p>
                        <p className="text-sm text-gray-400 mt-2">Brands like Chanel pay premium for market positioning</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Opportunity Tab */}
            <TabsContent value="opportunity" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-white">The Infinite Market Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-8">
                    <p className="text-xl text-purple-300 font-semibold">
                      Every valuable search query becomes an economic battleground
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { query: "Best pizza under $50 in Brooklyn?", market: "Local restaurants compete for ownership", size: "Local Market" },
                      { query: "Most iconic female fragrance?", market: "Luxury brands like Chanel pay premium for status", size: "Global Luxury" },
                      { query: "Top CRM software for startups?", market: "Enterprise companies trade for market positioning", size: "B2B Software" },
                      { query: "Most effective skincare routine?", market: "Beauty brands and influencers monetize expertise", size: "Beauty & Wellness" }
                    ].map((example, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 * index, duration: 0.6 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-yellow-300 mb-2">"{example.query}"</h4>
                            <p className="text-gray-200 mb-2">{example.market}</p>
                            <span className="inline-block bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm">
                              {example.size}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-8 border border-purple-400/30">
                    <h3 className="text-2xl font-bold text-white mb-4">Market Size</h3>
                    <p className="text-3xl font-bold text-purple-300 mb-2">100+ Million Ad Keywords</p>
                    <p className="text-xl text-gray-300">=</p>
                    <p className="text-3xl font-bold text-blue-300">100+ Million Potential OMC Markets</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-white">How OMC Compares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="pb-4 text-gray-400">Aspect</th>
                          <th className="pb-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <BarChart3 className="w-5 h-5 text-red-400" />
                              <span className="text-red-300">Polymarket</span>
                            </div>
                          </th>
                          <th className="pb-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Search className="w-5 h-5 text-blue-400" />
                              <span className="text-blue-300">Google Search</span>
                            </div>
                          </th>
                          <th className="pb-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Crown className="w-5 h-5 text-yellow-400" />
                              <span className="text-yellow-300">OMC</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="space-y-4">
                        {[
                          { aspect: "Market Scope", poly: comparisonData.polymarket.scope, google: comparisonData.google.scope, omc: comparisonData.omc.scope },
                          { aspect: "Resolution", poly: comparisonData.polymarket.resolution, google: comparisonData.google.resolution, omc: comparisonData.omc.resolution },
                          { aspect: "Value Flow", poly: comparisonData.polymarket.valueFlow, google: comparisonData.google.valueFlow, omc: comparisonData.omc.valueFlow },
                          { aspect: "Participants", poly: comparisonData.polymarket.participants, google: comparisonData.google.participants, omc: comparisonData.omc.participants },
                          { aspect: "Examples", poly: comparisonData.polymarket.examples, google: comparisonData.google.examples, omc: comparisonData.omc.examples }
                        ].map((row, index) => (
                          <motion.tr
                            key={row.aspect}
                            className="border-b border-gray-700/50"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                          >
                            <td className="py-4 font-semibold text-gray-300">{row.aspect}</td>
                            <td className="py-4 text-center text-gray-400 text-sm">{row.poly}</td>
                            <td className="py-4 text-center text-gray-400 text-sm">{row.google}</td>
                            <td className="py-4 text-center text-yellow-200 text-sm font-semibold">{row.omc}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-emerald-300 mb-4">The OMC Web3 Advantage</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Infinity className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-200 font-semibold">Infinite Markets</p>
                        <p className="text-sm text-gray-400">No resolution limits, perpetual value</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-200 font-semibold">Decentralized Ownership</p>
                        <p className="text-sm text-gray-400">98% value via smart contracts</p>
                      </div>
                      <div className="text-center">
                        <Target className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-200 font-semibold">Market Validation</p>
                        <p className="text-sm text-gray-400">Financial skin in game on-chain</p>
                      </div>
                      <div className="text-center">
                        <Globe className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-200 font-semibold">Multi-Chain Access</p>
                        <p className="text-sm text-gray-400">Built on Base, accessible everywhere</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Economics Tab */}
            <TabsContent value="economics" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-white">How Everyone Makes Money</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {economicRoles.map((role, index) => (
                      <motion.div
                        key={role.role}
                        className="bg-gray-700/50 rounded-lg p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * index, duration: 0.6 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-yellow-300 mb-2">{role.role}</h3>
                            <p className="text-gray-200 mb-2">{role.description}</p>
                            <p className="text-emerald-300 font-semibold mb-3">{role.earnings}</p>
                            <div className="bg-blue-600/20 rounded-lg p-4">
                              <p className="text-blue-200 text-sm">{role.example}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-12 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-8 border border-emerald-400/30">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Money Flow Example</h3>
                    <div className="bg-gray-700/50 rounded-lg p-6">
                      <p className="text-yellow-300 font-semibold mb-2">Question: "Best project management tool?"</p>
                      <p className="text-blue-300 mb-4">Trade: User pays $200 to change answer to "Notion"</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-200">Current Answer Owner (95%):</span>
                          <span className="text-green-400 font-bold">$190</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">Question Creator (3%):</span>
                          <span className="text-blue-400 font-bold">$6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-200">Platform (2%):</span>
                          <span className="text-purple-400 font-bold">$4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vision Tab */}
            <TabsContent value="vision" className="mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-white">3-5 Year Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Evolution Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="pb-4 text-gray-400">Generation</th>
                            <th className="pb-4 text-gray-400">Paradigm</th>
                            <th className="pb-4 text-gray-400">Examples</th>
                            <th className="pb-4 text-gray-400">Value Capture</th>
                            <th className="pb-4 text-gray-400">User Experience</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-700/50">
                            <td className="py-4 text-blue-300">Web 1.0</td>
                            <td className="py-4 text-gray-300">Manual Curation</td>
                            <td className="py-4 text-gray-400">Yahoo Directory</td>
                            <td className="py-4 text-gray-400">Platform owners</td>
                            <td className="py-4 text-gray-400">Static, limited results</td>
                          </tr>
                          <tr className="border-b border-gray-700/50">
                            <td className="py-4 text-purple-300">Web 2.0</td>
                            <td className="py-4 text-gray-300">Algorithmic Ranking</td>
                            <td className="py-4 text-gray-400">Google Search</td>
                            <td className="py-4 text-gray-400">Advertisers</td>
                            <td className="py-4 text-gray-400">Dynamic but ad-driven</td>
                          </tr>
                          <tr>
                            <td className="py-4 text-yellow-300 font-bold">Web 3.0</td>
                            <td className="py-4 text-yellow-300 font-bold">Market Validation</td>
                            <td className="py-4 text-yellow-300 font-bold">OpinionMarketCap</td>
                            <td className="py-4 text-yellow-300 font-bold">Content creators</td>
                            <td className="py-4 text-yellow-300 font-bold">Value-based results</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Long-term Vision Points */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-purple-300">Revolutionary Changes</h3>
                        {[
                          "Replacing traditional search engines with market-driven information discovery",
                          "Creating a creator economy where 97% of volume flows to the OMC community", 
                          "Establishing a new paradigm for information valuation and exchange",
                          "Developing a global marketplace for human knowledge"
                        ].map((point, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                          >
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-200">{point}</p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-emerald-300">E-Commerce Revolution</h3>
                        <div className="bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-6">
                          <p className="text-gray-200 leading-relaxed">
                            Within 3-5 years, OpinionMarketCap aims to revolutionize e-commerce by enabling enterprises 
                            to conduct commerce with reduced friction, eliminating intermediaries that extract 10-15% 
                            commission on every transaction.
                          </p>
                        </div>
                        <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-6">
                          <p className="text-gray-200 leading-relaxed">
                            Smart contract technology enables value to flow directly between merchants and consumers, 
                            creating a more efficient and equitable commercial ecosystem.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Future Search Example */}
                    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-8 border border-purple-400/30">
                      <h3 className="text-2xl font-bold text-white mb-6">The Future of Search</h3>
                      <p className="text-gray-200 mb-4">
                        When searching for "best AI tools for content creation" on traditional platforms, users receive SEO-optimized listicles. 
                        On OMC, the same query shows multiple questions with financially-backed answers:
                      </p>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full mt-6">
                          <thead>
                            <tr className="border-b border-gray-600">
                              <th className="pb-2 text-left text-gray-400">Question</th>
                              <th className="pb-2 text-left text-gray-400">Current Answer</th>
                              <th className="pb-2 text-left text-gray-400">Owner</th>
                              <th className="pb-2 text-right text-gray-400">Price</th>
                              <th className="pb-2 text-right text-gray-400">Trades</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-700/50">
                              <td className="py-3 text-yellow-300">Best AI suite for content creators?</td>
                              <td className="py-3 text-gray-200 text-sm">Jasper AI for text, Midjourney for visuals...</td>
                              <td className="py-3 text-blue-300 text-sm">content_pro.base.eth</td>
                              <td className="py-3 text-right text-emerald-400 font-bold">450 USDC</td>
                              <td className="py-3 text-right text-gray-400">85</td>
                            </tr>
                            <tr className="border-b border-gray-700/50">
                              <td className="py-3 text-yellow-300">Most cost-effective AI tools?</td>
                              <td className="py-3 text-gray-200 text-sm">ChatGPT for drafting, Canva AI for images...</td>
                              <td className="py-3 text-blue-300 text-sm">budget_creator.base.eth</td>
                              <td className="py-3 text-right text-emerald-400 font-bold">325 USDC</td>
                              <td className="py-3 text-right text-gray-400">62</td>
                            </tr>
                            <tr>
                              <td className="py-3 text-yellow-300">Enterprise-grade AI solution?</td>
                              <td className="py-3 text-gray-200 text-sm">Microsoft Copilot suite with Azure...</td>
                              <td className="py-3 text-blue-300 text-sm">enterprise_advisor.base.eth</td>
                              <td className="py-3 text-right text-emerald-400 font-bold">580 USDC</td>
                              <td className="py-3 text-right text-gray-400">93</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Conclusion */}
                    <div className="text-center bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-8 border border-yellow-400/30">
                      <h3 className="text-2xl font-bold text-white mb-4">The Future We're Building</h3>
                      <p className="text-gray-200 leading-relaxed max-w-4xl mx-auto">
                        By putting information to the test of market forces, OpinionMarketCap is creating a future where 
                        the best answers rise to the top not through algorithmic manipulation or advertising dollars, 
                        but through the collective wisdom and financial backing of knowledgeable participants.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <h3 className="text-4xl font-bold text-white mb-6">Join The Revolution</h3>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            Be part of the infinite marketplace where knowledge meets profit and every opinion has value.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 group button-pulse button-hover-float"
            >
              Start Trading
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 button-hover-float"
            >
              Read Whitepaper
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}