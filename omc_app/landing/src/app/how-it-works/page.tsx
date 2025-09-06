"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, ArrowDown, TrendingUp, Users, DollarSign, Target, Zap, Globe, Award, 
  Search, BarChart3, Coins, Crown, Brain, Layers, Lock, Shield, ChevronRight,
  Play, Pause, RotateCcw, Plus, Minus, CheckCircle, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"

export default function HowItWorks() {
  const [mounted, setMounted] = useState(false)
  const [activeDemo, setActiveDemo] = useState(0)
  const [bondingPrice, setBondingPrice] = useState(10.5)
  const [tradingStep, setTradingStep] = useState(0)
  const [simulationRunning, setSimulationRunning] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate trading demo
  const startSimulation = () => {
    setSimulationRunning(true)
    setTradingStep(0)
    
    const steps = [0, 1, 2, 3, 4]
    let currentStep = 0
    
    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps.length) {
        setSimulationRunning(false)
        clearInterval(interval)
        return
      }
      setTradingStep(currentStep)
    }, 2000)
  }

  const paradigmComparison = [
    {
      title: "Traditional Web Search",
      subtitle: "Algorithm-Driven Results",
      steps: [
        { icon: <Search className="w-8 h-8" />, text: "Search Query", desc: "User asks question" },
        { icon: <Brain className="w-8 h-8" />, text: "Algorithm", desc: "Black box processing" },
        { icon: <Layers className="w-8 h-8" />, text: "Ranked Results", desc: "SEO-optimized content" },
        { icon: <DollarSign className="w-8 h-8" />, text: "Ad Revenue", desc: "Platform profits" }
      ],
      color: "from-gray-500 to-gray-700",
      problems: ["No financial incentive for quality", "Algorithm manipulation", "Platform keeps all value"]
    },
    {
      title: "AI/LLM Responses",
      subtitle: "Model-Generated Answers",
      steps: [
        { icon: <Search className="w-8 h-8" />, text: "Prompt Input", desc: "User asks question" },
        { icon: <Brain className="w-8 h-8" />, text: "AI Processing", desc: "Neural network inference" },
        { icon: <Layers className="w-8 h-8" />, text: "Generated Response", desc: "Single answer output" },
        { icon: <DollarSign className="w-8 h-8" />, text: "Subscription Revenue", desc: "Platform profits" }
      ],
      color: "from-green-500 to-teal-600",
      problems: ["No accuracy verification", "Massive energy consumption", "No financial incentive for correctness"]
    },
    {
      title: "OpinionMarketCap (OMC)",
      subtitle: "Market-Driven Consensus",
      steps: [
        { icon: <Target className="w-8 h-8" />, text: "Question Minted", desc: "Blockchain asset created" },
        { icon: <Coins className="w-8 h-8" />, text: "Market Forms", desc: "Financial competition" },
        { icon: <TrendingUp className="w-8 h-8" />, text: "Price Discovery", desc: "Best answers rise" },
        { icon: <Users className="w-8 h-8" />, text: "Community Profits", desc: "98% value shared" }
      ],
      color: "from-blue-500 to-purple-600",
      benefits: ["Financial skin in the game", "Transparent market forces", "Community-first economics"]
    }
  ]

  const coreSteps = [
    {
      title: "Question Minting on OpinionMarketCap",
      description: "Transform your insight into a tradeable blockchain asset",
      visual: "🎯",
      details: "Set initial answer, initial price, description and link, creation fee = 20% initial price. Your question becomes an NFT-like asset with ongoing royalty potential.",
      example: "\"Best CRM for startups?\" → Initial answer: \"HubSpot\" → Starting price: 12 USDC"
    },
    {
      title: "Market Creation & Price Discovery",
      description: "OpinionMarketCap's bonding curve creates instant liquidity",
      visual: "📈",
      details: "As more people buy the right to change the answer, the price increases exponentially, replicating market forces. Early believers get better prices, rewarding conviction.",
      example: "HubSpot answer: 12 → 15 → 22 → 35 USDC as demand increases"
    },
    {
      title: "Trading & Ownership Transfer",
      description: "Buy, sell, and own the best answers on OMC",
      visual: "🔄",
      details: "Anyone can challenge the current answer by paying the higher price. 95% goes to the previous owner.",
      example: "Someone pays 35 USDC to change answer for \"Salesforce\" → Previous owner receives 33.25 USDC profit"
    },
    {
      title: "Continuous Value Generation",
      description: "Every trade generates fees for the OpinionMarketCap ecosystem",
      visual: "💰",
      details: "Question creators earn 3% royalty forever. Current owners earn 95% on each sale. Platform takes only 2%.",
      example: "35 USDC trade → Owner: 33.25, Creator: 1.05, OMC Platform: 0.70"
    }
  ]

  const economicRoles = [
    {
      role: "Question Creator",
      icon: <Crown className="w-6 h-6" />,
      description: "Mints valuable questions on OpinionMarketCap",
      earnings: "3% royalty on every future trade forever",
      example: "Created \"Best AI tool?\" → 500 USDC total volume → Earned 15 USDC in royalties",
      color: "from-yellow-500 to-orange-500"
    },
    {
      role: "Answer Owner", 
      icon: <Award className="w-6 h-6" />,
      description: "Owns the current best answer in OMC markets",
      earnings: "95% of sale price when someone buys their answer",
      example: "Owns \"ChatGPT\" answer at 80 USDC → Sells for 120 USDC → Earns 114 USDC",
      color: "from-blue-500 to-cyan-500"
    },
    {
      role: "Trader/Speculator",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Buys undervalued answers on OpinionMarketCap",
      earnings: "95% profit when reselling at higher prices",
      example: "Bought \"Notion\" at 25 USDC → Market recognizes value → Sold at 60 USDC",
      color: "from-green-500 to-emerald-500"
    },
    {
      role: "Pool Participant",
      icon: <Users className="w-6 h-6" />,
      description: "Collaborates in OMC prediction pools",
      earnings: "Share of pool rewards when targets are reached",
      example: "Joined 10-person pool → Target reached → Shared 500 USDC reward according to pool share",
      color: "from-purple-500 to-pink-500"
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
        {[...Array(60)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={cn(
              "absolute w-1 h-1 rounded-full animate-pulse",
              i % 5 === 0 && "bg-blue-400/30",
              i % 5 === 1 && "bg-purple-400/30", 
              i % 5 === 2 && "bg-emerald-400/30",
              i % 5 === 3 && "bg-yellow-400/30",
              i % 5 === 4 && "bg-cyan-400/30"
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
            <span className="text-white">How</span>{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              OpinionMarketCap
            </span>
            <br />
            <span className="text-white">Works</span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Understanding the <span className="text-blue-400 font-semibold">new paradigm</span> where opinions become tradeable assets
            and every valuable question creates an <span className="text-purple-400 font-semibold">infinite marketplace</span>
          </motion.p>

          <motion.div
            className="flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              onClick={startSimulation}
              disabled={simulationRunning}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold"
            >
              {simulationRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Simulation Running
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Interactive Demo
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Paradigm Comparison */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-white">The Paradigm Shift:</span>{" "}
            <span className="bg-gradient-to-r from-red-400 to-yellow-500 bg-clip-text text-transparent">Old Web</span>{" "}
            vs{" "}
            <span className="bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">AI</span>{" "}
            vs{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">OMC</span>
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {paradigmComparison.map((paradigm, paradigmIndex) => (
              <motion.div
                key={paradigm.title}
                initial={{ opacity: 0, x: paradigmIndex === 0 ? -50 : paradigmIndex === 2 ? 50 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + paradigmIndex * 0.3, duration: 0.8 }}
              >
                <Card className={cn(
                  "bg-gray-800/50 border-2 backdrop-blur-sm h-full",
                  paradigmIndex === 0 ? "border-gray-600" : 
                  paradigmIndex === 1 ? "border-green-500" : "border-purple-500"
                )}>
                  <CardHeader>
                    <CardTitle className={cn(
                      "text-2xl text-center",
                      paradigmIndex === 0 ? "text-gray-300" : 
                      paradigmIndex === 1 ? "text-green-300" : "text-purple-300"
                    )}>
                      {paradigm.title}
                    </CardTitle>
                    <p className="text-gray-400 text-center">{paradigm.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {paradigm.steps.map((step, stepIndex) => (
                        <motion.div
                          key={stepIndex}
                          className="flex items-center space-x-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5 + paradigmIndex * 0.3 + stepIndex * 0.2, duration: 0.5 }}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            `bg-gradient-to-r ${paradigm.color}`
                          )}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{step.text}</h4>
                            <p className="text-sm text-gray-400">{step.desc}</p>
                          </div>
                          {stepIndex < paradigm.steps.length - 1 && (
                            <ArrowDown className="w-5 h-5 text-gray-500 absolute left-6 mt-16" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-8 p-4 rounded-lg bg-gray-700/50">
                      <h4 className={cn(
                        "font-semibold mb-3",
                        paradigmIndex === 2 ? "text-green-300" : "text-red-300"
                      )}>
                        {paradigmIndex === 2 ? "OMC Benefits:" : "Problems:"}
                      </h4>
                      <ul className="space-y-2">
                        {(paradigm.problems || paradigm.benefits)?.map((item, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-center space-x-2">
                            {paradigmIndex === 2 ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                            )}
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Core Concepts */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              OMC Core Concepts
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {coreSteps.map((step, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveDemo(index)}
              >
                <Card className={cn(
                  "bg-gray-800/50 border-gray-700 backdrop-blur-sm transition-all duration-300 h-full",
                  activeDemo === index && "border-blue-500 shadow-blue-500/20 shadow-2xl",
                  "hover:border-purple-400/50"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-6xl">{step.visual}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-300 mb-4">{step.description}</p>
                        
                        <AnimatePresence mode="wait">
                          {activeDemo === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4"
                            >
                              <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-400/30">
                                <p className="text-blue-200 text-sm leading-relaxed mb-3">
                                  {step.details}
                                </p>
                                <div className="bg-gray-700/50 rounded p-3">
                                  <p className="text-yellow-300 text-sm font-mono">
                                    Example: {step.example}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Trading Simulation */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <Card className="bg-gray-800/50 border-purple-500 backdrop-blur-sm max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-white">
                Live Trading Simulation on <span className="text-purple-400">OpinionMarketCap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Trading Steps */}
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { title: "Question", desc: "\"Best CRM?\"", icon: <Target className="w-6 h-6" /> },
                    { title: "Current Answer", desc: "HubSpot (12 USDC)", icon: <Award className="w-6 h-6" /> },
                    { title: "New Bid", desc: "Salesforce (18 USDC)", icon: <TrendingUp className="w-6 h-6" /> },
                    { title: "Trade Executed", desc: "Ownership transfers", icon: <Zap className="w-6 h-6" /> },
                    { title: "Profits Distributed", desc: "98% to community", icon: <DollarSign className="w-6 h-6" /> }
                  ].map((step, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-center p-4 rounded-lg border transition-all duration-500",
                        tradingStep >= index && simulationRunning || !simulationRunning ? 
                          "border-green-500 bg-green-500/20" : 
                          "border-gray-600 bg-gray-700/30"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                        tradingStep >= index && simulationRunning || !simulationRunning ?
                          "bg-green-500" : "bg-gray-600"
                      )}>
                        {step.icon}
                      </div>
                      <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-300 mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Money Flow Breakdown */}
                {(tradingStep >= 4 || !simulationRunning) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-6"
                  >
                    <h3 className="text-xl font-bold text-emerald-300 mb-4 text-center">
                      OpinionMarketCap Trade Settlement: 18 USDC
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">17.10 USDC</div>
                        <div className="text-sm text-green-300">Previous Owner (95%)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">0.54 USDC</div>
                        <div className="text-sm text-blue-300">Question Creator (3%)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">0.36 USDC</div>
                        <div className="text-sm text-purple-300">OMC Platform (2%)</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Economic Roles */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Economic Roles in OpinionMarketCap
            </span>
          </h2>

          <Accordion type="single" collapsible className="max-w-4xl mx-auto">
            {economicRoles.map((role, index) => (
              <AccordionItem key={index} value={`role-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      `bg-gradient-to-r ${role.color}`
                    )}>
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{role.role}</h3>
                      <p className="text-gray-400">{role.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="ml-16 space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-300 mb-2">How They Earn on OMC:</h4>
                      <p className="text-gray-200">{role.earnings}</p>
                    </div>
                    <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-300 mb-2">Real Example:</h4>
                      <p className="text-blue-200 font-mono text-sm">{role.example}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Experience <span className="text-purple-400">OpinionMarketCap</span>?
          </h3>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            Join the infinite marketplace where your knowledge becomes tradeable assets and every opinion has measurable value.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 group button-pulse button-hover-float"
            >
              Start Trading on OMC
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 button-hover-float"
            >
              Take Interactive Tutorial
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}