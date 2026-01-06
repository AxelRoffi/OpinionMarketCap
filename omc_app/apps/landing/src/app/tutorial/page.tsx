"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Info, Copy, ExternalLink,
  Wallet, Coins, Target, TrendingUp, Users, Shield, Zap, DollarSign,
  Clock, Award, Crown, Globe, BookOpen, Settings, AlertCircle, CheckSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"

interface PrerequisiteStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'error'
  icon: React.ReactNode
  details: {
    what: string
    why: string
    how: string[]
    links?: { text: string, url: string }[]
  }
}

export default function Tutorial() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("prerequisites")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStep[]>([
    {
      id: "wallet",
      title: "Connect Web3 Wallet",
      description: "MetaMask, WalletConnect, or any EVM Wallet",
      status: 'pending',
      icon: <Wallet className="w-6 h-6" />,
      details: {
        what: "A Web3 wallet to interact with OpinionMarketCap on Base Sepolia testnet",
        why: "Required to sign transactions, hold digital assets, and pay gas fees",
        how: [
          "Install a Web3 Wallet extension or mobile app",
          "Create new wallet or import existing one", 
          "Add Base Sepolia network (Chain ID: 84532)",
          "Connect wallet to OpinionMarketCap platform"
        ],
        links: [
          { text: "MetaMask Download", url: "https://metamask.io/download/" },
          { text: "Base Network Guide", url: "https://docs.base.org/using-base/" }
        ]
      }
    },
    {
      id: "eth",
      title: "Get Base Sepolia ETH",
      description: "For transaction gas fees (~0.0001 base sepolia ETH needed)",
      status: 'pending',
      icon: <Zap className="w-6 h-6" />,
      details: {
        what: "Base Sepolia ETH to pay for blockchain transaction fees",
        why: "Every transaction (minting, trading, pool participation... ) requires gas fees",
        how: [
          "Visit Base Sepolia faucet websites",
          "Connect your wallet to the faucet",
          "Request testnet ETH (usually 0.1 ETH per day)",
          "Wait for transaction confirmation"
        ],
        links: [
          { text: "Base Sepolia Faucet", url: "https://www.alchemy.com/faucets/base-sepolia" },
          { text: "Alternative Faucet", url: "https://docs.base.org/tools/network-faucets/" }
        ]
      }
    },
    {
      id: "usdc",
      title: "Get Base Sepolia USDC",
      description: "Trading currency for OpinionMarketCap (10+ USDC recommended)",
      status: 'pending',
      icon: <DollarSign className="w-6 h-6" />,
      details: {
        what: "Test USDC tokens for trading on OpinionMarketCap",
        why: "USDC is the primary trading currency for all OMC operations",
        how: [
          "Visit Circle's official USDC faucet",
          "Select 'Base Sepolia' network",
          "Select 'USDC' token type",
          "Fill your wallet address and request tokens"
        ],
        links: [
          { text: "Circle USDC Faucet", url: "https://faucet.circle.com/" }
        ]
      }
    }
  ])

  const contractAddresses = [
    { name: "USDC Token", address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", purpose: "Trading currency", explorerUrl: "https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e" },
    { name: "OpinionCore", address: "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f", purpose: "Main opinion markets", explorerUrl: "https://sepolia.basescan.org/address/0xB2D35055550e2D49E5b2C21298528579A8bF7D2f" },
    { name: "PoolManager", address: "0x3B4584e690109484059D95d7904dD9fEbA246612", purpose: "Collaborative pools", explorerUrl: "https://sepolia.basescan.org/address/0x3B4584e690109484059D95d7904dD9fEbA246612" },
    { name: "FeeManager", address: "0xc8f879d86266C334eb9699963ca0703aa1189d8F", purpose: "Creator fee claims", explorerUrl: "https://sepolia.basescan.org/address/0xc8f879d86266C334eb9699963ca0703aa1189d8F" }
  ]


  const mintingSteps = [
    {
      field: "Question Text",
      type: "Text Input",
      required: true,
      description: "Your question that creates the market (max 51 characters)",
      example: "'Best CRM software for startups under 100 employees?'",
      validation: "1-250 characters, must be a clear question",
      purpose: "Creates the tradeable opinion market"
    },
    {
      field: "Initial Answer",
      type: "Text Input", 
      required: true,
      description: "Your proposed answer to start the market (max 50 characters)",
      example: "'HubSpot'",
      validation: "1-50 characters, should be specific and valuable",
      purpose: "Sets the starting point for market competition"
    },
    {
      field: "Initial Price",
      type: "Number Input",
      required: true,
      description: "Starting price in USDC (minimum 1 USDC)",
      example: "25.00 (means someone must pay 25 USDC to replace your answer)",
      validation: "≥ 1 USDC, decimals allowed",
      purpose: "Determines market entry point and creation fee"
    },
    {
      field: "Category Selection",
      type: "Dropdown",
      required: true,
      description: "Choose the most relevant category for your question",
      example: "Technology (for 'Best AI writing tool?')",
      validation: "Must select one of our available categories",
      purpose: "Helps users discover relevant markets, improves price accuracy"
    },
    {
      field: "Description",
      type: "Text Input",
      required: false,
      description: "Argument over your answer and explain why it is the best",
      example: "best features for small teams and affordable pricing",
      validation: "1-120 characters, should be specific and valuable",
      purpose: "Give more context to your answer and why you chose this one specifically"
    },
    {
      field: "External link",
      type: "Text Input",
      required: false,
      description: "Add extra context to your answer or description, it can be a picture, a text, a video",
      example: <a href="https://www.opinionmarketcap.xyz/" target="_blank" rel="noopener 
  noreferrer" className="text-blue-400 hover:text-blue-300 
  underline">https://www.opinionmarketcap.xyz/</a>,
      validation: "1-260 characters",
      purpose: "Add extra context to your answer and drive traffic to your page"
    },
    {
      field: "Creation Fee",
      type: "Auto-Calculated",
      required: true,
      description: "Automatically calculated: MAX(2 USDC, 20% of initial price)",
      example: "10 USDC price → 2 USDC fee (minimum) | 20 USDC price → 4 USDC fee (20%)",
      validation: "Automatically deducted from your wallet",
      purpose: "Prevents spam questions, ensures creator commitment"
    }
  ]

  const tradingFlow = [
    {
      step: "Market Discovery",
      description: "Browse available opinion markets by category or search",
      details: "Find undervalued answers or markets in your expertise area"
    },
    {
      step: "Price Analysis", 
      description: "Check current answer, price, and market activity",
      details: "OnChain algorithm shows NextPrice - unpredictable to prevent gaming"
    },
    {
      step: "Submit Bid",
      description: "Pay the NextPrice to become the new answer owner",
      details: "Must pay full amount upfront - no partial payments or reservations"
    },
    {
      step: "Ownership Transfer",
      description: "Previous owner automatically receives 95% of your payment",
      details: "Instant settlement - no delays or manual claiming needed"
    },
    {
      step: "Fee Distribution",
      description: "3% goes to question creator, 2% to OMC platform",
      details: "All fees distributed automatically via smart contracts, claim your fees whenever you want"
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleStepCompletion = (stepId: string) => {
    const step = prerequisites.find(p => p.id === stepId)
    if (step) {
      const newStatus = step.status === 'completed' ? 'pending' : 'completed'
      setPrerequisites(prev => 
        prev.map(p => p.id === stepId ? { ...p, status: newStatus } : p)
      )
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Navigation */}
      <LandingNavigation />
      
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={cn(
              "absolute w-1 h-1 rounded-full animate-pulse",
              i % 4 === 0 && "bg-blue-400/20",
              i % 4 === 1 && "bg-purple-400/20", 
              i % 4 === 2 && "bg-emerald-400/20",
              i % 4 === 3 && "bg-yellow-400/20"
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

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              Complete Guide
            </span>
            <br />
            <span className="text-white">to OMC</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Master the infinite marketplace - from wallet setup to advanced trading strategies
          </p>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700 mb-8">
              <TabsTrigger value="prerequisites" className="text-white data-[state=active]:bg-blue-600">Prerequisites</TabsTrigger>
              <TabsTrigger value="contracts" className="text-white data-[state=active]:bg-purple-600">Contracts</TabsTrigger>
              <TabsTrigger value="minting" className="text-white data-[state=active]:bg-emerald-600">Minting Guide</TabsTrigger>
              <TabsTrigger value="trading" className="text-white data-[state=active]:bg-yellow-600">Trading Guide</TabsTrigger>
              <TabsTrigger value="pools" className="text-white data-[state=active]:bg-red-600">Pool System</TabsTrigger>
              <TabsTrigger value="advanced" className="text-white data-[state=active]:bg-cyan-600">Advanced</TabsTrigger>
            </TabsList>

            {/* Prerequisites Tab */}
            <TabsContent value="prerequisites">
              <div className="space-y-8">
                <Card className="bg-gray-800/50 border-blue-500">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-300 flex items-center space-x-2">
                      <CheckSquare className="w-6 h-6" />
                      <span>Getting Started Checklist</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {prerequisites.map((step, index) => (
                        <motion.div
                          key={step.id}
                          className={cn(
                            "border rounded-lg p-6 transition-all duration-300",
                            step.status === 'completed' && "border-green-500 bg-green-500/10",
                            step.status === 'pending' && "border-gray-600 bg-gray-700/30",
                            step.status === 'error' && "border-red-500 bg-red-500/10"
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center",
                                step.status === 'completed' && "bg-green-500",
                                step.status === 'pending' && "bg-gray-600", 
                                step.status === 'error' && "bg-red-500"
                              )}>
                                {step.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : step.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-300 mb-4">{step.description}</p>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-blue-300 mb-2">What you need:</h4>
                                    <p className="text-gray-200 text-sm">{step.details.what}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-purple-300 mb-2">Why it's required:</h4>
                                    <p className="text-gray-200 text-sm">{step.details.why}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-emerald-300 mb-2">How to get it:</h4>
                                    <ol className="list-decimal list-inside space-y-1 text-gray-200 text-sm">
                                      {step.details.how.map((instruction, idx) => (
                                        <li key={idx}>{instruction}</li>
                                      ))}
                                    </ol>
                                  </div>
                                  
                                  {step.details.links && (
                                    <div>
                                      <h4 className="font-semibold text-yellow-300 mb-2">Helpful links:</h4>
                                      <div className="space-y-2">
                                        {step.details.links.map((link, idx) => (
                                          <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>{link.text}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant={step.status === 'completed' ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleStepCompletion(step.id)}
                              className={step.status === 'completed' ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {step.status === 'completed' ? 'Completed' : 'Mark Complete'}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contract Addresses Tab */}
            <TabsContent value="contracts">
              <Card className="bg-gray-800/50 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-purple-300 flex items-center space-x-2">
                    <Settings className="w-6 h-6" />
                    <span>OpinionMarketCap Contract Addresses</span>
                  </CardTitle>
                  <p className="text-gray-400 mt-2">Base Sepolia Testnet - Save these addresses for interactions</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractAddresses.map((contract, index) => (
                      <motion.div
                        key={contract.name}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white">{contract.name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{contract.purpose}</p>
                            <code className="text-blue-300 bg-blue-900/30 px-2 py-1 rounded text-sm">
                              {contract.address}
                            </code>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(contract.address)}
                              className="text-white"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(contract.explorerUrl, '_blank')}
                              className="text-white"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-8 bg-blue-600/20 border border-blue-400/30 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-2">Important Notes:</h4>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>• These are Base Sepolia testnet addresses - DO NOT use on mainnet</li>
                          <li>• USDC is the primary trading currency for all OMC operations</li>
                          <li>• PoolManager handles all collaborative pool functionality</li>
                          <li>• FeeManager is where users claim their rewards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Minting Guide Tab */}
            <TabsContent value="minting">
              <Card className="bg-gray-800/50 border-emerald-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-emerald-300 flex items-center space-x-2">
                    <Target className="w-6 h-6" />
                    <span>Opinion Minting Guide</span>
                  </CardTitle>
                  <p className="text-gray-400 mt-2">Mint your first tradeable opinion market on OMC under 60 secondes</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  

                  {/* Form Fields Section */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Fill Required Fields</h3>
                    <div className="space-y-6">
                      {mintingSteps.map((step, index) => (
                        <motion.div
                          key={step.field}
                          className="bg-gray-700/30 rounded-lg p-6 border border-gray-600"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-white">{step.field}</h4>
                            <div className="flex space-x-2">
                              <span className={cn(
                                "px-2 py-1 rounded text-xs",
                                step.required ? "bg-red-600/20 text-red-300" : "bg-gray-600/20 text-gray-400"
                              )}>
                                {step.required ? 'Required' : 'Optional'}
                              </span>
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                {step.type}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 mb-3">{step.description}</p>
                          
                          <div className="bg-blue-900/30 rounded p-3 mb-3">
                            <p className="text-blue-200 text-sm font-mono">{step.example}</p>
                          </div>
                          
                          <div className="text-sm text-gray-400 mb-3">
                            <strong>Validation:</strong> {step.validation}
                          </div>
                          
                          <div className="bg-yellow-600/20 border border-yellow-400/30 rounded p-3">
                            <div className="flex items-start space-x-2">
                              <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <p className="text-yellow-200 text-sm">{step.purpose}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Creation Fee Explanation */}
                  <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-6">
                    <h4 className="font-bold text-red-300 mb-3 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Creation Fee Logic (Anti-Spam Protection)</span>
                    </h4>
                    <div className="space-y-4 text-red-200">
                      <div>
                        <strong>Formula:</strong> <code>MAX(2 USDC, initial_price × 0.20)</code>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-900/30 rounded p-3">
                          <strong>Example 1:</strong> 10 USDC initial price<br/>
                          10 × 0.20 = 2 USDC<br/>
                          MAX(2, 2) = <strong>2 USDC fee</strong>
                        </div>
                        <div className="bg-red-900/30 rounded p-3">
                          <strong>Example 2:</strong> 20 USDC initial price<br/>
                          20 × 0.20 = 4 USDC<br/>
                          MAX(2, 4) = <strong>4 USDC fee</strong>
                        </div>
                      </div>
                      <p className="text-sm">This prevents spam questions while ensuring creators have skin in the game. Higher initial prices require proportionally higher commitment.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Guide Tab */}
            <TabsContent value="trading">
              <Card className="bg-gray-800/50 border-yellow-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-yellow-300 flex items-center space-x-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Trading System Deep Dive</span>
                  </CardTitle>
                  <p className="text-gray-400 mt-2">Master OpinionMarketCap's anti-gaming trading mechanics</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Trading Flow */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Trading Process Flow</h3>
                    <div className="space-y-4">
                      {tradingFlow.map((step, index) => (
                        <motion.div
                          key={step.step}
                          className="flex items-start space-x-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1 bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                            <h4 className="font-bold text-white mb-2">{step.step}</h4>
                            <p className="text-gray-300 mb-2">{step.description}</p>
                            <p className="text-yellow-200 text-sm">{step.details}</p>
                          </div>
                          {index < tradingFlow.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-gray-500 absolute left-4 mt-12" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Bonding Curve Explanation */}
                  <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-6">
                    <h4 className="font-bold text-purple-300 mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Anti-Gaming Bonding Curve</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-purple-200 mb-2">How It Works:</h5>
                        <ul className="text-purple-100 text-sm space-y-1 list-disc list-inside">
                          <li>NextPrice determined by onchain algorithm (not fixed formula)</li>
                          <li>Considers market volume, trading frequency, and historical data</li>
                          <li>Algorithm evolves and adapts to prevent exploitation</li>
                          <li>Price jumps are unpredictable to stop MEV extraction</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-purple-200 mb-2">Why This Prevents Gaming:</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-purple-900/30 rounded p-3">
                            <strong className="text-purple-200">🤖 Bot Protection:</strong><br/>
                            <span className="text-purple-100 text-sm">No fixed formula means bots can't calculate exact profit margins</span>
                          </div>
                          <div className="bg-purple-900/30 rounded p-3">
                            <strong className="text-purple-200">⚡ MEV Resistance:</strong><br/>
                            <span className="text-purple-100 text-sm">Unpredictable price changes prevent front-running attacks</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-900/30 rounded p-3">
                        <strong className="text-purple-200">Traditional bonding curves are exploitable:</strong><br/>
                        <span className="text-purple-100 text-sm">Fixed formulas allow sophisticated traders to calculate exact entry/exit points, extract MEV, and manipulate markets. OMC's dynamic algorithm creates fair price discovery.</span>
                      </div>
                    </div>
                  </div>

                  {/* Fee Distribution */}
                  <div className="bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-6">
                    <h4 className="font-bold text-emerald-300 mb-4">Automatic Fee Distribution (98% to Community)</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center bg-emerald-900/30 rounded p-4">
                        <div className="text-3xl font-bold text-emerald-300">95%</div>
                        <div className="text-emerald-200 text-sm">Previous Owner</div>
                        <div className="text-emerald-100 text-xs mt-1">Instant payout</div>
                      </div>
                      <div className="text-center bg-blue-900/30 rounded p-4">
                        <div className="text-3xl font-bold text-blue-300">3%</div>
                        <div className="text-blue-200 text-sm">Question Creator</div>
                        <div className="text-blue-100 text-xs mt-1">Forever royalty</div>
                      </div>
                      <div className="text-center bg-purple-900/30 rounded p-4">
                        <div className="text-3xl font-bold text-purple-300">2%</div>
                        <div className="text-purple-200 text-sm">OMC Platform</div>
                        <div className="text-purple-100 text-xs mt-1">Development</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pool System Tab */}
            <TabsContent value="pools">
              <Card className="bg-gray-800/50 border-red-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-300 flex items-center space-x-2">
                    <Users className="w-6 h-6" />
                    <span>Collaborative Pool System</span>
                  </CardTitle>
                  <p className="text-gray-400 mt-2">Team up with other traders to reach higher price targets</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Pool Mechanics */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">How Pools Work</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-6">
                        <h4 className="font-bold text-blue-300 mb-3">Pool Creation</h4>
                        <ul className="text-blue-200 text-sm space-y-2">
                          <li>• Select any active opinion market</li>
                          <li>• Target Price is set automatically == nextPrice</li>
                          <li>• Contribute your USDC amount plus an extra 5 usdc pool creation fee </li>
                          <li>• Set expiration date (1-30 days)</li>
                          <li>• Give your pool a name and propose an answer, market your pool</li>
                          <li>• Others can join your pool</li>
                        </ul>
                      </div>
                      
                      <div className="bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-6">
                        <h4 className="font-bold text-emerald-300 mb-3">Pool Participation</h4>
                        <ul className="text-emerald-200 text-sm space-y-2">
                          <li>• Browse pools by category/target</li>
                          <li>• Check progress vs target price</li>
                          <li>• Add your contribution amount</li>
                          <li>• Share proportional rewards</li>
                          <li>• Automatic execution when target reached</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Pool Example */}
                  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-lg p-6">
                    <h4 className="font-bold text-white mb-4">Real Pool Example</h4>
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                      <p className="text-yellow-300 font-semibold mb-2">Question: "Most popular US female artist ?"</p>
                      <p className="text-gray-200 mb-2">Current Answer: "Beyonce" at 4500 USDC</p>
                      <p className="text-blue-300 mb-2">Pool Target: Reach 6000 USDC ("Taylor Swift")</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Pool Contributors:</span>
                        <span className="text-purple-300">250 participants</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">If target reached:</span>
                        <span className="text-blue-300">"Taylor Swift" is promoted as top answer for this question.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Contributors share:</span>
                        <span className="text-blue-300">Contributors earn pool shares proportional to their contributions, allowing them to benefit from profits generated by future trades.</span>
                      </div>
                      <div className="bg-red-600/20 border border-red-400/30 rounded p-3 mt-3">
                        <p className="text-red-200 text-sm"><strong>Important:</strong> Pool fees go 100% to platform treasury to prevent gaming. This ensures pools are used for legitimate collaboration, not system exploitation.</p>
                      </div>
                    </div>
                  </div>

                  {/* Anti-Gaming Rules */}
                  <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-6">
                    <h4 className="font-bold text-red-300 mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Anti-Gaming Pool Rules</span>
                    </h4>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-900/30 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <strong className="text-green-300">SUCCESS</strong>
                        </div>
                        <p className="text-green-200 text-sm">Target price reached → Everyone shares rewards proportionally</p>
                      </div>
                      
                      <div className="bg-blue-900/30 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <strong className="text-blue-300">EXPIRED</strong>
                        </div>
                        <p className="text-blue-200 text-sm">Target not reached by deadline → Full refund to all participants</p>
                      </div>
                      
                      <div className="bg-red-900/30 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <strong className="text-red-300">EARLY EXIT</strong>
                        </div>
                        <p className="text-red-200 text-sm">Withdraw before expiry → 20% penalty </p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-red-200 mb-2">Why The 20% Early Exit Penalty?</h5>
                      <ul className="text-red-100 text-sm space-y-1 list-disc list-inside">
                        <li>Prevents "pump and dump" pool manipulation strategies</li>
                        <li>Stops users from joining, influencing price, then leaving</li>
                        <li>Protects committed participants from trolling behavior</li>
                        <li>Creates aligned incentives for pool success</li>
                        <li>Penalty goes to platform treasury</li>
                      </ul>
                    </div>
                  </div>

                  {/* Pool Example */}
                  <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                    <h4 className="font-bold text-white mb-4">Pool Example Walkthrough</h4>
                    <div className="space-y-4">
                      <div className="bg-yellow-600/20 border border-yellow-400/30 rounded p-4">
                        <strong className="text-yellow-300">Scenario:</strong> <h5 className="text-white mb-3">"Most popular US female artist ?" currently at 450 USDC</h5>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-3">
                        <div className="bg-blue-900/30 rounded p-3">
                          <strong className="text-blue-300">Pool Target:</strong><br/>
                          <span className="text-blue-200 text-sm">600 USDC</span>
                        </div>
                        <div className="bg-purple-900/30 rounded p-3">
                          <strong className="text-purple-300">Your Contribution:</strong><br/>
                          <span className="text-purple-200 text-sm">60 USDC</span>
                        </div>
                        <div className="bg-emerald-900/30 rounded p-3">
                          <strong className="text-emerald-300">Total Pool:</strong><br/>
                          <span className="text-emerald-200 text-sm">600 USDC (20 people)</span>
                        </div>
                        <div className="bg-red-900/30 rounded p-3">
                          <strong className="text-red-300">Your Share:</strong><br/>
                          <span className="text-red-200 text-sm">10% (60/600)</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-600/20 border border-green-400/30 rounded p-4">
                        <strong className="text-green-300">Result when target reached:</strong><br/>
                        <span className="text-green-200 text-sm">Pool becomes new answer owner → Earns 95% of future trades → You get 10% of rewards on next trade</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Strategies Tab */}
            <TabsContent value="advanced">
              <Card className="bg-gray-800/50 border-cyan-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-300 flex items-center space-x-2">
                    <Crown className="w-6 h-6" />
                    <span>Advanced OpinionMarketCap Strategies</span>
                  </CardTitle>
                  <p className="text-gray-400 mt-2">Pro tips for maximizing profits and understanding market dynamics</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="creator-strategy">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-3">
                          <Crown className="w-5 h-5 text-yellow-400" />
                          <span className="text-lg font-semibold text-white">Question Creator Strategy</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="bg-yellow-600/20 border border-yellow-400/30 rounded p-4">
                            <strong className="text-yellow-300">Best practices:</strong>
                            <ul className="text-yellow-200 text-sm mt-2 space-y-1 list-disc list-inside">
                              <li>Ask questions that sparkle endless debates</li>
                              <li>Research current market gaps and underserved topics</li>
                              <li>Set realistic but attractive initial prices</li>
                              <li>Choose specific, actionable questions over vague ones</li>
                              <li>Consider seasonal/trending topics for higher volume</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-600/20 border border-green-400/30 rounded p-4">
                            <strong className="text-green-300">Revenue optimization:</strong>
                            <p className="text-green-200 text-sm mt-2">Your 3% royalty compounds over time. A successful question generating 1000 USDC in trading volume earns you 30 USDC. Focus on evergreen topics with lasting relevance. You can list for selling the question you minted on our marketplace</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="trading-strategy">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          <span className="text-lg font-semibold text-white">Advanced Trading Tactics</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-blue-600/20 border border-blue-400/30 rounded p-4">
                              <strong className="text-blue-300">Value Investing:</strong>
                              <ul className="text-blue-200 text-sm mt-2 space-y-1 list-disc list-inside">
                                <li>Look for undervalued answers in your expertise</li>
                                <li>Buy early in trending topics</li>
                                <li>Hold positions in evergreen markets</li>
                                <li>Monitor category-specific trends</li>
                              </ul>
                            </div>
                            
                            <div className="bg-purple-600/20 border border-purple-400/30 rounded p-4">
                              <strong className="text-purple-300">Market Timing:</strong>
                              <ul className="text-purple-200 text-sm mt-2 space-y-1 list-disc list-inside">
                                <li>Watch for algorithm price adjustments</li>
                                <li>Enter during low activity periods</li>
                                <li>Exit before major market shifts</li>
                                <li>Track creator histories for quality</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pool-strategy">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-red-400" />
                          <span className="text-lg font-semibold text-white">Pool Mastery</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="bg-red-600/20 border border-red-400/30 rounded p-4">
                            <strong className="text-red-300">Pool Selection Criteria:</strong>
                            <ul className="text-red-200 text-sm mt-2 space-y-1 list-disc list-inside">
                              <li>Analyze gap between current and target price</li>
                              <li>Check pool creator's track record</li>
                              <li>Assess market momentum and trend direction</li>
                              <li>Consider time to expiration vs target difficulty</li>
                              <li>Evaluate other participants' commitment levels</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-600/20 border border-orange-400/30 rounded p-4">
                            <strong className="text-orange-300">Risk Management:</strong>
                            <p className="text-orange-200 text-sm mt-2">Never put all funds in one pool. Diversify across categories, target prices, and time horizons. Remember the 20% early exit penalty when planning your commitment.</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="troubleshooting">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                          <span className="text-lg font-semibold text-white">Troubleshooting Common Issues</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-3">
                            {[
                              {
                                problem: "Transaction Failed - Insufficient Gas",
                                solution: "Increase gas limit in your wallet or wait for lower network congestion"
                              },
                              {
                                problem: "USDC Approval Required",
                                solution: "Approve USDC spending for OpinionMarketCap contracts before trading"
                              },
                              {
                                problem: "Pool Target Too High",
                                solution: "Choose realistic targets - algorithm considers market conditions"
                              },
                              {
                                problem: "Question Creation Rejected",
                                solution: "Check character limits, ensure question is clear, and verify USDC balance"
                              },
                              {
                                problem: "Can't Claim Creator Fees",
                                solution: "Use FeeManager contract directly or wait for UI fee claiming feature"
                              }
                            ].map((item, index) => (
                              <div key={index} className="bg-gray-700/50 rounded p-4 border border-gray-600">
                                <strong className="text-orange-300">{item.problem}</strong>
                                <p className="text-gray-300 text-sm mt-1">{item.solution}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <h3 className="text-3xl font-bold text-white mb-6">Ready to Start Trading?</h3>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            You now have everything needed to master OpinionMarketCap. Start with small amounts and build your expertise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 group"
            >
              Launch OpinionMarketCap App
              <ExternalLink className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setActiveTab("prerequisites")}
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Review Prerequisites
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}