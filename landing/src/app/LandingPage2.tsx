"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { ArrowRight, Infinity, TrendingUp, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

interface FloatingElement {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  icon: React.ReactNode
}

export default function LandingPage2() {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Initialize particles
  useEffect(() => {
    const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080
    
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    
    setParticles(newParticles)
    
    // Floating elements
    const icons = [
      <TrendingUp key="trend" size={24} />,
      <Users key="users" size={24} />,
      <Globe key="globe" size={24} />,
      <Infinity key="infinity" size={24} />
    ]
    
    const newFloatingElements: FloatingElement[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      icon: icons[Math.floor(Math.random() * icons.length)]
    }))
    
    setFloatingElements(newFloatingElements)
    setMounted(true)
  }, [])

  // Canvas animation - Simplified and fixed
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mounted || particles.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    setCanvasSize()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Simple particle drawing without state updates
      particles.forEach((particle, index) => {
        // Update position
        const newX = particle.x + particle.vx
        const newY = particle.y + particle.vy
        
        // Bounce off edges
        if (newX <= 0 || newX >= canvas.width) {
          particles[index].vx = -particle.vx
        } else {
          particles[index].x = newX
        }
        
        if (newY <= 0 || newY >= canvas.height) {
          particles[index].vy = -particle.vy  
        } else {
          particles[index].y = newY
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particles[index].x, particles[index].y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 120)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      setCanvasSize()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mounted, particles])

  // Mouse tracking
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
      
      {/* Animated Background Particles (CSS-based fallback) */}
      <div className="absolute inset-0 z-0">
        {mounted && [...Array(20)].map((_, i) => {
          const colors = ['bg-blue-400/40', 'bg-purple-400/40', 'bg-emerald-400/40', 'bg-yellow-400/40', 'bg-red-400/40']
          const randomColor = colors[Math.floor(Math.random() * colors.length)]
          const duration = Math.max(10, Math.random() * 20 + 10) // Ensure positive duration
          
          return (
            <motion.div
              key={`particle-${i}`}
              className={`absolute w-3 h-3 ${randomColor} rounded-full`}
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                opacity: 0.3
              }}
              animate={{
                x: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%'
                ],
                y: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%'
                ],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }}
            />
          )
        })}
      </div>

      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 opacity-70"
      />

      {/* Floating Elements */}
      {mounted && floatingElements.map((element) => (
        <motion.div
          key={`float-${element.id}`}
          className="absolute text-blue-400/20 pointer-events-none z-10"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [element.rotation, element.rotation + 360],
            scale: [element.scale, element.scale * 1.2, element.scale],
          }}
          transition={{
            duration: Math.max(8, 8 + Math.random() * 4),
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          {element.icon}
        </motion.div>
      ))}

      {/* Custom Cursor - Fixed visibility */}
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
            <motion.h1 
              className="text-7xl md:text-8xl font-black mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                background: 'linear-gradient(90deg, #60A5FA, #A855F7, #34D399, #60A5FA)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 4s ease infinite'
              }}
            >
              OMC
            </motion.h1>
            
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

          {/* Animated Infinity Symbol */}
          <motion.div
            className="flex justify-center mb-16"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                repeatType: "loop",
                ease: "linear" 
              }}
              className="text-6xl text-blue-400"
            >
              <Infinity />
            </motion.div>
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
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "loop" 
                }}
              >
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.div>
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

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "loop" 
            }}
            className="text-white/60"
          >
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-white/60 rounded-full mt-2"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "loop" 
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
    </div>
  )
}