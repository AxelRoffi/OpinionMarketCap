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

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        
        {/* Hero Section */}
        <motion.div
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* OMC Logo */}
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
            <h1 
              className="text-7xl md:text-8xl font-black mb-4 animated-gradient-text"
            >
              OMC
            </h1>
            
            <motion.div
              className="text-2xl md:text-3xl font-semibold text-white/80 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              The Infinite Marketplace
            </motion.div>
          </motion.div>

          {/* Main Claim */}
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-12 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <span className="text-white">Own the narrative,</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              earn the profits.
            </span>
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

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 group"
            >
              Enter the Market
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Learn More
            </Button>
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