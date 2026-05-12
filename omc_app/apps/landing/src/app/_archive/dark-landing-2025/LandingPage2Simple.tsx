"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, Infinity, TrendingUp, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"

export default function LandingPage2Simple() {
  const [mounted, setMounted] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div 
      className="min-h-screen bg-black text-white overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Navigation */}
      <LandingNavigation />
      
      {/* CSS Animated Background Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`css-particle-${i}`}
            className={cn(
              "absolute w-3 h-3 rounded-full animate-pulse",
              i % 5 === 0 && "bg-blue-400/40",
              i % 5 === 1 && "bg-purple-400/40", 
              i % 5 === 2 && "bg-emerald-400/40",
              i % 5 === 3 && "bg-yellow-400/40",
              i % 5 === 4 && "bg-red-400/40"
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

      {/* CSS Floating Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[
          { icon: <TrendingUp size={24} />, x: 10, y: 20 },
          { icon: <Users size={24} />, x: 80, y: 30 },
          { icon: <Globe size={24} />, x: 15, y: 70 },
          { icon: <Infinity size={24} />, x: 85, y: 75 },
        ].map((item, i) => (
          <div
            key={`float-icon-${i}`}
            className="absolute text-blue-400/20 floating-particle"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: i * 2 + 's'
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {/* Custom Cursor */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-white rounded-full pointer-events-none z-50"
        style={{
          left: springX,
          top: springY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
        }}
      />

      {/* Side Content - Left */}
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-30 hidden xl:block">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          {/* Live Stats */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="text-green-400 text-sm font-semibold mb-2">🔥 Live Market</div>
            <div className="text-white text-2xl font-bold">$247K</div>
            <div className="text-gray-400 text-xs">Total Volume</div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="text-blue-400 text-sm font-semibold mb-2">⚡ Active Now</div>
            <div className="text-white text-2xl font-bold">1,247</div>
            <div className="text-gray-400 text-xs">Traders Online</div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="text-purple-400 text-sm font-semibold mb-2">🏆 Community Rewards</div>
            <div className="text-white text-2xl font-bold">98%</div>
            <div className="text-gray-400 text-xs">Goes to Community</div>
          </div>
        </motion.div>
      </div>

      {/* Side Content - Right */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-30 hidden xl:block">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.7, duration: 1 }}
        >
          {/* Quick Features */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 w-48">
            <div className="text-emerald-400 text-sm font-semibold mb-3">✨ Features</div>
            <div className="space-y-2">
              <div className="text-white text-sm">• Instant Trading</div>
              <div className="text-white text-sm">• Pool Collaboration</div>
              <div className="text-white text-sm">• Real-time Analytics</div>
              <div className="text-white text-sm">• Question Ownership</div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 w-48">
            <div className="text-yellow-400 text-sm font-semibold mb-3">🏆 Achievements</div>
            <div className="space-y-2">
              <div className="text-white text-sm">• Creator Badge</div>
              <div className="text-white text-sm">• Master Trader</div>
              <div className="text-white text-sm">• Pool Pioneer</div>
              <div className="text-white text-sm">• Market Maverick</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        
        {/* Hero Section */}
        <motion.div
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* OpinionMarketCap Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              delay: 0.3 
            }}
          >
            <div className="text-4xl md:text-6xl font-black mb-4">
              {["OPINION", "MARKET", "CAP"].map((word, index) => (
                <motion.span
                  key={word}
                  className="inline-block animated-gradient-text mr-3"
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + index * 0.2,
                    ease: "easeOut"
                  }}
                  style={{
                    transformOrigin: "center bottom"
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            
            <motion.div
              className="text-3xl md:text-5xl font-bold text-white/90 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <span className="typewriter-large">The Infinite Marketplace</span>
            </motion.div>

            {/* Explanatory Claim */}
            <motion.div
              className="text-lg md:text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-semibold">
                Where Opinions Become Tradable Assets
              </span>
            </motion.div>
          </motion.div>

          {/* Main Claim */}
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-12 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <motion.span 
              className="text-white text-glow text-bounce"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              Own The Narrative,
            </motion.span>
            <br />
            <motion.span 
              className="text-shimmer bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-bounce"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              style={{ animationDelay: '0.5s' }}
            >
              Earn The Profits.
            </motion.span>
          </motion.h2>

          {/* CSS Animated Infinity Symbol */}
          <motion.div
            className="flex justify-center mb-16"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            <div className="text-6xl text-blue-400 animate-infinite-rotate">
              <Infinity />
            </div>
          </motion.div>

          {/* Secondary Explanation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Mint Opinion Market • Trade Opinion • Change the Narrative • Earn the Profits
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 group button-pulse button-hover-float"
            >
              <span className="group-hover:text-shimmer">Enter The Market</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 button-hover-float"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Built on Base Badge */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-blue-600/20 border border-blue-400/30 rounded-full px-6 py-3 backdrop-blur-sm">
              <div className="w-6 h-6 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-blue-300 font-semibold">Built on Base</span>
            </div>
          </motion.div>
        </motion.div>

        {/* CSS Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <div className="text-white/60">
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center relative">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
    </div>
  )
}