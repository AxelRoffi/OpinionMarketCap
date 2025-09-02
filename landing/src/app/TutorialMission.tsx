"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle, Play, Target, Trophy, Users, Brain, TrendingUp, Infinity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed'
}

interface Mission {
  id: number
  title: string
  description: string
  reward: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completed: boolean
}

export default function TutorialMission() {
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showMissions, setShowMissions] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const steps: Step[] = [
    {
      id: 0,
      title: "Understanding OMC",
      description: "Learn what the Infinite Marketplace is and how opinion trading works",
      icon: <Brain className="w-8 h-8" />,
      status: activeStep === 0 ? 'active' : completedSteps.includes(0) ? 'completed' : 'pending'
    },
    {
      id: 1,
      title: "Create Your First Opinion",
      description: "Craft a compelling question and submit it to the marketplace",
      icon: <Target className="w-8 h-8" />,
      status: activeStep === 1 ? 'active' : completedSteps.includes(1) ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: "Trade & Earn",
      description: "Buy, sell, and trade opinions to maximize your profits",
      icon: <TrendingUp className="w-8 h-8" />,
      status: activeStep === 2 ? 'active' : completedSteps.includes(2) ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: "Join Pool Power",
      description: "Collaborate with others in prediction pools for bigger rewards",
      icon: <Users className="w-8 h-8" />,
      status: activeStep === 3 ? 'active' : completedSteps.includes(3) ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: "Master the Market",
      description: "Advanced strategies for dominating the infinite marketplace",
      icon: <Trophy className="w-8 h-8" />,
      status: activeStep === 4 ? 'active' : completedSteps.includes(4) ? 'completed' : 'pending'
    }
  ]

  const missions: Mission[] = [
    {
      id: 1,
      title: "First Opinion Creator",
      description: "Create your first opinion and earn your creator badge",
      reward: "100 OMC + Creator Badge",
      difficulty: 'beginner',
      completed: false
    },
    {
      id: 2,
      title: "Trading Rookie",
      description: "Complete 5 successful trades with positive returns",
      reward: "250 OMC + Trader Badge",
      difficulty: 'beginner',
      completed: false
    },
    {
      id: 3,
      title: "Pool Pioneer",
      description: "Join 3 prediction pools and contribute to their success",
      reward: "500 OMC + Pioneer Badge",
      difficulty: 'intermediate',
      completed: false
    },
    {
      id: 4,
      title: "Market Maverick",
      description: "Achieve 1000 USDC in total trading volume",
      reward: "1000 OMC + Maverick Badge",
      difficulty: 'intermediate',
      completed: false
    },
    {
      id: 5,
      title: "Infinite Master",
      description: "Own 10 questions simultaneously and maintain profitability",
      reward: "5000 OMC + Master Badge + Exclusive Access",
      difficulty: 'advanced',
      completed: false
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
      if (stepId === activeStep && stepId < steps.length - 1) {
        setActiveStep(stepId + 1)
      }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative"
      onMouseMove={handleMouseMove}
    >
      {/* Navigation */}
      <LandingNavigation />
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 border-2 border-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: springX,
          top: springY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              Master
            </span>{" "}
            <span className="text-white">the</span>{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Infinite
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Your journey to becoming an opinion trading master starts here.
            Learn, practice, and dominate the marketplace.
          </motion.p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="bg-gray-800/50 rounded-full p-2 backdrop-blur-sm border border-gray-700">
            <button
              onClick={() => setShowMissions(false)}
              className={cn(
                "px-8 py-3 rounded-full transition-all duration-300 font-semibold",
                !showMissions 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              Tutorial Steps
            </button>
            <button
              onClick={() => setShowMissions(true)}
              className={cn(
                "px-8 py-3 rounded-full transition-all duration-300 font-semibold ml-2",
                showMissions 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              Missions
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showMissions ? (
            /* Tutorial Steps */
            <motion.div
              key="tutorial"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card className={cn(
                      "bg-gray-800/50 border-gray-700 backdrop-blur-sm transition-all duration-300",
                      step.status === 'active' && "border-blue-500 shadow-blue-500/20 shadow-2xl",
                      step.status === 'completed' && "border-green-500 shadow-green-500/20"
                    )}>
                      <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                          <div className={cn(
                            "flex items-center justify-center w-16 h-16 rounded-full",
                            step.status === 'pending' && "bg-gray-700 text-gray-400",
                            step.status === 'active' && "bg-blue-600 text-white animate-pulse",
                            step.status === 'completed' && "bg-green-600 text-white"
                          )}>
                            {step.status === 'completed' ? <CheckCircle className="w-8 h-8" /> : step.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
                            <p className="text-gray-300 text-lg">{step.description}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {step.status === 'active' && (
                              <Button
                                onClick={() => completeStep(step.id)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform transition-all duration-300 hover:scale-105"
                              >
                                <Play className="w-5 h-5 mr-2" />
                                Start
                              </Button>
                            )}
                            
                            {step.status === 'completed' && (
                              <div className="text-green-400 font-semibold">
                                ✓ Completed
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Missions */
            <motion.div
              key="missions"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map((mission, index) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border capitalize",
                            getDifficultyColor(mission.difficulty)
                          )}>
                            {mission.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                          {mission.description}
                        </p>
                        
                        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                          <div className="text-yellow-400 font-semibold text-sm mb-1">Reward:</div>
                          <div className="text-white font-bold">{mission.reward}</div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
                          disabled={mission.completed}
                        >
                          {mission.completed ? 'Completed' : 'Start Mission'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center text-purple-400 text-lg mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Infinity className="w-8 h-8" />
          </motion.div>
          
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Begin?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are already earning profits by owning the narrative.
            The infinite marketplace awaits.
          </p>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white px-12 py-4 text-xl font-bold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110"
          >
            Enter OMC
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}