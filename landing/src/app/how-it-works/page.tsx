"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import {
  ArrowRight,
  BarChart2,
  Check,
  ChevronDown,
  Crown,
  DollarSign,
  Download,
  Layers,
  Lock,
  Play,
  Shield,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export default function HowItWorksPage() {
  const [mounted, setMounted] = useState(false)
  const [activePersona, setActivePersona] = useState<"leader" | "trader" | null>(null)
  const [expandAllFaqs, setExpandAllFaqs] = useState(false)
  const [accumulatedFees, setAccumulatedFees] = useState(0)
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      speed: number
      opacity: number
    }>
  >([])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 10 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 10 })

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 6 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    }))
    setParticles(newParticles)
    setMounted(true)
  }, [])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Fee accumulation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAccumulatedFees((prev) => {
        const increment = Math.random() * 0.5 + 0.1
        return Math.min(prev + increment, 2847.32)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Toggle all FAQs
  const toggleAllFaqs = () => {
    setExpandAllFaqs(!expandAllFaqs)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        />

        {/* Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-orange-500/30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-40 right-40 w-24 h-24 border border-cyan-500/30 animate-spin-reverse" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rotate-45 animate-morph" />

        {/* Energy Waves */}
        <div className="absolute inset-0">
          <div className="energy-wave bg-gradient-to-r from-transparent via-orange-500/20 to-transparent h-1 w-full animate-energy-wave" />
          <div
            className="energy-wave bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent h-1 w-full animate-energy-wave"
            style={{ animationDelay: "5s", top: "60%" }}
          />
        </div>

        {/* Lightning Effects */}
        <div className="absolute top-10 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-yellow-500 to-transparent animate-lightning opacity-0" />
        <div
          className="absolute bottom-20 left-1/3 w-px h-24 bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-lightning opacity-0"
          style={{ animationDelay: "7s" }}
        />

        {/* Particle System */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `linear-gradient(45deg, #FF6B35, #00D2FF)`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255, 107, 53, 0.5)`,
              animationDuration: `${particle.speed}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {particles.slice(0, 20).map((particle, i) => (
            <line
              key={`line-${i}`}
              x1={`${particle.x}%`}
              y1={`${particle.y}%`}
              x2={`${particles[(i + 1) % 20]?.x}%`}
              y2={`${particles[(i + 1) % 20]?.y}%`}
              stroke="url(#gradient)"
              strokeWidth="0.5"
              opacity="0.3"
              className="animate-pulse"
            />
          ))}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <BarChart2 className="h-6 w-6 text-emerald-500" />
              <span>OpinionMarketCap</span>
            </Link>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/how-it-works" className="text-sm font-medium text-primary transition-colors">
                  How It Works
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Leaderboard
                </Link>
                <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                  Profile
                </Link>
              </nav>
              <ThemeToggle />
              <Button variant="outline" className="hidden md:flex hover:glow-orange">
                Connect Wallet
              </Button>
              <Button className="hidden md:flex hover:glow-cyan">Launch App</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className="block mb-2 headline-orange"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                HOW OpinionMarketCap WORKS
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-6 headline-cyan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Turn your opinions into profitable assets
            </motion.p>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              From question to cash in 3 simple steps.
              <br />
              Ready to own the narrative?
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button size="lg" variant="outline" className="hover:glow-orange group">
                <Play className="mr-2 h-4 w-4 group-hover:animate-pulse" /> Watch Demo
              </Button>
              <Button size="lg" className="cta-trader hover:scale-105 transition-all duration-300">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mouse Ripple Effect */}
        <motion.div
          className="fixed pointer-events-none z-0 w-8 h-8 rounded-full border border-orange-500/50"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      </section>

      {/* The BIG IDEA Section - Updated to Vertical Layout */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">THE BIG IDEA</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A way to settle disputes that matter to you.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Step 1 - The Problem */}
            <motion.div
              className="relative mb-12"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-6 md:gap-8">
                {/* Large Number */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-lg animate-pulse-glow">
                    1
                  </div>
                  <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-orange-500/50 animate-ping" />
                </div>

                {/* Content Card */}
                <motion.div
                  className="flex-1 glass-card border border-orange-500/30 rounded-2xl p-6 md:p-8 hover:border-orange-500/50 transition-all duration-500 hover:glow-orange"
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-orange-500">
                    THE PROBLEM: ENDLESS ONLINE DEBATES
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    "Goat of Soccer?" → Messi, Ronaldo, Zidane, Maradona, Pelé... ?
                  </p>
                  <p className="text-muted-foreground">
                    Online debates never settle anything. Just opinions flying around.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Connecting Arrow */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-8 h-16 flex flex-col items-center">
                  <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-cyan-500 animate-pulse" />
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-cyan-500 animate-bounce" />
                </div>
                <div className="absolute inset-0 animate-pulse-glow-cyan" />
              </div>
            </motion.div>

            {/* Step 2 - The Solution */}
            <motion.div
              className="relative mb-12"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-6 md:gap-8">
                {/* Large Number */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-lg animate-pulse-glow-cyan">
                    2
                  </div>
                  <div
                    className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-cyan-500/50 animate-ping"
                    style={{ animationDelay: "1s" }}
                  />
                </div>

                {/* Content Card */}
                <motion.div
                  className="flex-1 glass-card border border-cyan-500/30 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-all duration-500 hover:glow-cyan"
                  whileHover={{ scale: 1.02, rotateY: -2 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-cyan-500">
                    THE SOLUTION: OpinionMarketCap SETTLES IT
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    The official answer = whoever paid the last price and claimed it
                  </p>
                  <p className="text-muted-foreground">
                    Want to change it? Pay the price. Put your money where your opinion is.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Connecting Arrow */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-8 h-16 flex flex-col items-center">
                  <div className="w-px h-12 bg-gradient-to-b from-cyan-500 to-yellow-500 animate-pulse" />
                  <div
                    className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-yellow-500 animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
                <div className="absolute inset-0 animate-pulse-glow-yellow" />
              </div>
            </motion.div>

            {/* Step 3 - The Result */}
            <motion.div
              className="relative mb-12"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-6 md:gap-8">
                {/* Large Number */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-lg animate-pulse-glow-yellow">
                    3
                  </div>
                  <div
                    className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-yellow-500/50 animate-ping"
                    style={{ animationDelay: "2s" }}
                  />
                </div>

                {/* Content Card */}
                <motion.div
                  className="flex-1 glass-card border border-yellow-500/30 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-all duration-500 hover:glow-yellow"
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-yellow-500">THE RESULT: SKIN IN THE GAME</h3>
                  <p className="text-lg text-muted-foreground mb-4">No more worthless likes or upvotes</p>
                  <p className="text-muted-foreground">Real money = real conviction = real answers</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            viewport={{ once: true }}
          >
            <div className="text-2xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-cyan-500 to-orange-500 bg-clip-text text-transparent animate-pulse-glow">
              It's democracy, but with economic consequences.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Choose Your Path Section */}
      <section className="py-20 relative bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">WHAT TYPE OF USER ARE YOU?</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Opinion Leader Card */}
            <motion.div
              className={cn(
                "group relative rounded-2xl overflow-hidden transition-all duration-500 border border-orange-500/30",
                "hover:shadow-[0_0_40px_rgba(255,107,53,0.4)] hover:-translate-y-2 hover:scale-105",
                "glass-card",
                activePersona === "leader" ? "ring-2 ring-orange-500 glow-orange" : "",
              )}
              onMouseEnter={() => setActivePersona("leader")}
              onMouseLeave={() => setActivePersona(null)}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ rotateY: 5, rotateX: 5 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 animate-border-glow opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 md:p-10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-orange-500/20 animate-pulse-glow">
                    <Crown className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-500">I WANT TO CREATE</h3>
                </div>
                <h4 className="text-2xl font-bold mb-6">Become an Opinion Leader</h4>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Create viral questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Set the initial narrative</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Earn fees from all future trades</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Build your influence</span>
                  </li>
                </ul>
                <Button className="cta-leader w-full hover:scale-105 transition-all duration-300">
                  Become Opinion Leader
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Opinion Trader Card */}
            <motion.div
              className={cn(
                "group relative rounded-2xl overflow-hidden transition-all duration-500 border border-cyan-500/30",
                "hover:shadow-[0_0_40px_rgba(0,210,255,0.4)] hover:-translate-y-2 hover:scale-105",
                "glass-card",
                activePersona === "trader" ? "ring-2 ring-cyan-500 glow-cyan" : "",
              )}
              onMouseEnter={() => setActivePersona("trader")}
              onMouseLeave={() => setActivePersona(null)}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ rotateY: -5, rotateX: 5 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 animate-border-glow-cyan opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 md:p-10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-cyan-500/20 animate-pulse-glow-cyan">
                    <Zap className="h-6 w-6 text-cyan-500" />
                  </div>
                  <h3 className="text-xl font-bold text-cyan-500">I WANT TO TRADE</h3>
                </div>
                <h4 className="text-2xl font-bold mb-6">Be an Opinion Trader</h4>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Find trending opinions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Propose winning answers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Own the conversation topic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Profit when others trade</span>
                  </li>
                </ul>
                <Button className="cta-trader w-full hover:scale-105 transition-all duration-300">
                  Start Opinion Trading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="text-center mt-8 text-muted-foreground">
            <p>
              Note: You can obviously do both! Many users create some questions and trade on others. Pick your starting
              point.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Flows (Tabbed Interface) */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">STEP-BY-STEP GUIDE</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Follow these simple steps to get started</p>
          </motion.div>

          <Tabs defaultValue="leader" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-8 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger
                value="leader"
                className="w-1/2 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500"
              >
                <Crown className="mr-2 h-4 w-4" /> For Opinion Leaders
              </TabsTrigger>
              <TabsTrigger
                value="trader"
                className="w-1/2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-500"
              >
                <Zap className="mr-2 h-4 w-4" /> For Opinion Traders
              </TabsTrigger>
            </TabsList>

            {/* For Opinion Leaders */}
            <TabsContent value="leader" className="mt-0">
              <div className="glass-card border border-orange-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-center mb-8 text-orange-500">CREATE TIMELESS DEBATES</h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 animate-pulse-glow">
                          1
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">CREATE A TIMELESS QUESTION</h4>
                          <p className="text-muted-foreground mb-2">
                            Examples: "Most Iconic Female Fragrance?" "Most Beautiful City in the World?"
                          </p>
                          <p className="text-muted-foreground">Choose topics that spark endless debate overtime</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 2 - Updated with Link and Price */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 animate-pulse-glow">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold mb-4">PROVIDE FIRST ANSWER + DESCRIPTION + LINK + PRICE</h4>

                          {/* Form-like Demo */}
                          <div className="space-y-3 mb-4 p-4 rounded-xl bg-muted/20 border border-orange-500/20">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-orange-500 w-20">Answer:</span>
                              <span className="text-muted-foreground">"Chanel No. 5"</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-sm font-medium text-orange-500 w-20">Description:</span>
                              <span className="text-muted-foreground">
                                "Timeless elegance, worn by Marilyn Monroe..."{" "}
                                <span className="text-xs text-muted-foreground/60">(optional)</span>
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <span className="text-sm font-medium text-orange-500 sm:w-20">Link:</span>
                              <span className="text-muted-foreground break-all">
                                shop.chanel.com/n5 <span className="text-xs text-muted-foreground/60">(optional)</span>
                              </span>
                            </div>
                            <div className="mb-3">
                              <span className="text-sm font-medium text-orange-500 block mb-2">Initial Price:</span>
                              <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg inline-block mb-2">
                                <span className="font-bold text-green-700 dark:text-green-400">15 USDC</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <span>(2-100 USDC range) </span>
                                <span className="font-bold text-orange-500">you choose</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <span className="font-medium text-blue-600 dark:text-blue-400">💡 Pro tip:</span> Drive traffic towards your page to increase visibility and engagement
                            </div>
                          </div>

                          <p className="text-muted-foreground">
                            You become the first owner of this narrative{" "}
                            <span className="font-bold text-orange-500">and set the initial price</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 animate-pulse-glow">
                          3
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">EARN FROM TRADES</h4>
                          <p className="text-muted-foreground mb-2">
                            Every time someone challenges your answer, you earn fees
                          </p>
                          <p className="text-muted-foreground">Your question becomes a revenue stream</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 4 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 animate-pulse-glow">
                          4
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">SCALE UP</h4>
                          <p className="text-muted-foreground">
                            Create more debate-worthy questions, build your reputation
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Profit Example */}
                  <motion.div
                    className="glass-card border border-yellow-500/30 rounded-xl p-6 h-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-yellow-500" /> PROFIT EXAMPLE:
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Create "Best Coffee City in Europe?" at 10 USDC</p>
                      <p>→ 5 trades happen at 13, 17, 22, 29, 38 USDC</p>
                      <p>→ You earn 3% creator fee on each trade = 3.57 USDC total</p>
                      <p>→ Plus you still own the question for future trades!</p>
                    </div>

                    <div className="mt-6">
                      <Button className="w-full cta-leader hover:scale-105 transition-all duration-300">
                        Become Opinion Leader
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            {/* For Opinion Traders */}
            <TabsContent value="trader" className="mt-0">
              <div className="glass-card border border-cyan-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-center mb-8 text-cyan-500">CLAIM YOUR POSITION</h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 animate-pulse-glow-cyan">
                          1
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">FIND DEBATES YOU CARE ABOUT</h4>
                          <p className="text-muted-foreground mb-2">
                            Browse timeless questions with ongoing discussions
                          </p>
                          <p className="text-muted-foreground">
                            "Most Influential Artist?" "Best Programming Language?"
                          </p>
                          <p className="text-muted-foreground">Look for narratives you want to claim</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 animate-pulse-glow-cyan">
                          2
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">PROPOSE YOUR ANSWER + DESCRIPTION</h4>
                          <p className="text-muted-foreground mb-2">
                            Answer: "Frida Kahlo"
                            <br />
                            Description: "Revolutionary impact on feminism and art..." (optional)
                          </p>
                          <p className="text-muted-foreground">Pay the algorithmic price to become new owner</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 animate-pulse-glow-cyan">
                          3
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">OWN THE NARRATIVE</h4>
                          <p className="text-muted-foreground mb-2">You now control this conversation topic</p>
                          <p className="text-muted-foreground">Your answer becomes the "official" position</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Step 4 */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 animate-pulse-glow-cyan">
                          4
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2">DRIVE VALUE FROM OWNERSHIP</h4>
                          <p className="text-muted-foreground mb-2">
                            Even if no immediate resale, you control the narrative
                          </p>
                          <p className="text-muted-foreground">
                            Add links to drive traffic - it's like owning top Google SERP spot
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Profit Example */}
                  <motion.div
                    className="glass-card border border-yellow-500/30 rounded-xl p-6 h-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-yellow-500" /> PROFIT EXAMPLE:
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Buy "Greatest Rapper Ever?" for 25 USDC (propose "Kendrick Lamar")</p>
                      <p>→ Someone challenges with "Jay-Z" and pays 33 USDC</p>
                      <p>→ You receive 95% = 31.35 USDC (6.35 USDC profit!)</p>
                      <p>→ Hold longer for potentially bigger returns</p>
                    </div>

                    <div className="mt-6">
                      <Button className="w-full cta-trader hover:scale-105 transition-all duration-300">
                        Start Opinion Trading
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Question Business Section */}
      <section className="py-20 relative bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">YOUR QUESTION IS YOUR BUSINESS</h2>
            <p className="text-xl md:text-2xl font-bold headline-cyan mb-4">💼 CREATE, MARKET & SELL</p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Questions aren't just debates - they're income-generating assets.
              <br />
              Build valuable discussions, drive traffic, then sell the entire business.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Business Model Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* Create, Market & Sell */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
              >
                <Card className="h-full glass-card border-border/50 hover:border-yellow-500/50 transition-all duration-500 hover:glow-yellow">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse-glow-yellow">
                        <Crown className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center mb-4 text-yellow-500">🏢 BUSINESS MODEL</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Create engaging questions that attract traders</li>
                      <li>• Market your questions to build trading volume</li>
                      <li>• Generate consistent creator fees (3% per trade)</li>
                      <li>• Sell the entire question + revenue stream when ready</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Ownership Transfer */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
              >
                <Card className="h-full glass-card border-border/50 hover:border-orange-500/50 transition-all duration-500 hover:glow-orange">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse-glow">
                        <Users className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center mb-4 text-orange-500">🔄 OWNERSHIP TRANSFER</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Transfer complete ownership of your question to someone else</p>
                      <p>New owner receives ALL future creator fees from every trade</p>
                      <p>You get paid upfront for the business you built</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Marketing */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
              >
                <Card className="h-full glass-card border-border/50 hover:border-cyan-500/50 transition-all duration-500 hover:glow-cyan">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse-glow-cyan">
                        <Target className="h-6 w-6 text-cyan-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center mb-4 text-cyan-500">🎯 MARKETING YOUR QUESTIONS</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Share on social media to drive initial trading</li>
                      <li>• Engage with your community around the topic</li>
                      <li>• Add compelling descriptions and links</li>
                      <li>• Build reputation as a thought leader</li>
                      <li>• Create questions that matter to specific niches</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Business Value */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
              >
                <Card className="h-full glass-card border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-glow-emerald">
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center mb-4 text-emerald-500">📈 BUSINESS VALUE</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Questions with high trading volume = higher sale value</p>
                      <p>Consistent fee generation = proven revenue stream</p>
                      <p>Niche expertise = premium pricing for influencers</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Business Example */}
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="glass-card border border-yellow-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-500">
                <h3 className="text-2xl font-bold text-center mb-8 text-yellow-500 flex items-center justify-center gap-2">
                  <DollarSign className="h-6 w-6" />💰 BUSINESS EXAMPLE:
                </h3>

                <div className="space-y-6">
                  {/* Day 1-3 - Creation */}
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-yellow-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <span className="font-bold text-yellow-400">Day 1-3:</span> Create{" "}
                        <span className="font-bold text-cyan-400">"Best Productivity App for Remote Work?"</span>
                      </p>
                    </div>
                  </motion.div>

                  {/* Day 4-15 - Growth */}
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-emerald-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-bold">
                      2-6
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-3">
                        <span className="font-bold text-emerald-400">Day 4-15:</span> Market it, build community, generate{" "}
                        <span className="font-bold text-emerald-400">85 USDC</span> in fees
                      </p>
                      {/* Revenue Growth Visualization */}
                      <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          transition={{ duration: 3, delay: 0.5 }}
                          viewport={{ once: true }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          85 USDC in creator fees
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Day 16+ - Sale */}
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-orange-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 text-sm font-bold">
                      7
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <span className="font-bold text-orange-400">Day 16+:</span> Sell question for{" "}
                        <span className="font-bold text-orange-400">500 USDC</span> to a productivity influencer
                      </p>
                    </div>
                  </motion.div>

                  {/* Total Result */}
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold">
                      ∑
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <span className="font-bold text-purple-400">Result:</span>{" "}
                        <span className="font-bold text-purple-400 text-xl">585 USDC total</span> (85 + 500) + they get ongoing revenue stream
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button className="cta-leader hover:scale-105 transition-all duration-300">
                    Create Your First Business
                    <Crown className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="hover:glow-yellow">
                    Browse Questions for Sale
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Business Growth Visualization */}
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="glass-card border border-emerald-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-500">
                <h3 className="text-2xl font-bold text-center mb-8 text-emerald-500 flex items-center justify-center gap-2">
                  <BarChart2 className="h-6 w-6" />
                  Question Business Growth Timeline
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Phase 1: Creation & Launch */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow-yellow">
                        <span className="text-2xl font-bold text-yellow-500">1</span>
                      </div>
                      <h4 className="text-lg font-bold text-yellow-500 mb-2">CREATE & LAUNCH</h4>
                      <p className="text-sm text-muted-foreground">Design compelling question, set initial answer, start marketing</p>
                    </div>
                  </motion.div>

                  {/* Phase 2: Growth & Optimization */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow-emerald">
                        <span className="text-2xl font-bold text-emerald-500">2</span>
                      </div>
                      <h4 className="text-lg font-bold text-emerald-500 mb-2">GROW & OPTIMIZE</h4>
                      <p className="text-sm text-muted-foreground">Build community, drive trades, accumulate fees, prove revenue</p>
                    </div>
                  </motion.div>

                  {/* Phase 3: Monetization */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                        <span className="text-2xl font-bold text-orange-500">3</span>
                      </div>
                      <h4 className="text-lg font-bold text-orange-500 mb-2">MONETIZE & SELL</h4>
                      <p className="text-sm text-muted-foreground">Market to buyers, negotiate sale, transfer ownership, profit</p>
                    </div>
                  </motion.div>
                </div>

                {/* Success Metrics */}
                <div className="mt-8 grid md:grid-cols-4 gap-4">
                  <motion.div
                    className="text-center p-4 rounded-lg bg-muted/20 border border-yellow-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-yellow-500">15+</div>
                    <div className="text-xs text-muted-foreground">Trades Generated</div>
                  </motion.div>
                  <motion.div
                    className="text-center p-4 rounded-lg bg-muted/20 border border-emerald-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-emerald-500">85</div>
                    <div className="text-xs text-muted-foreground">USDC in Fees</div>
                  </motion.div>
                  <motion.div
                    className="text-center p-4 rounded-lg bg-muted/20 border border-orange-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-orange-500">500</div>
                    <div className="text-xs text-muted-foreground">USDC Sale Price</div>
                  </motion.div>
                  <motion.div
                    className="text-center p-4 rounded-lg bg-muted/20 border border-purple-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-purple-500">585</div>
                    <div className="text-xs text-muted-foreground">USDC Total ROI</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pool Feature: Collaboration & Profit Section */}
      <section className="py-20 relative bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">
              Pool Feature: Collaboration & Profit
            </h2>
            <p className="text-xl md:text-2xl font-bold headline-cyan mb-4">TOO EXPENSIVE ALONE? COLLABORATE!</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Step 1: Create a Pool */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-cyan-500/50 transition-all duration-500 hover:glow-cyan">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse-glow-cyan">
                      <Users className="h-6 w-6 text-cyan-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-cyan-500">🤝 CREATE A POOL</h3>
                  <p className="text-center text-muted-foreground text-sm">
                    When an answer costs too much to change solo, create a pool! Add your proposed answer, description,
                    and links you want to promote.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Bring Like-Minded People */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-blue-500/50 transition-all duration-500 hover:glow-blue">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse-glow-blue">
                      <UserPlus className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-blue-500">👥 BRING LIKE-MINDED PEOPLE</h3>
                  <p className="text-center text-muted-foreground text-sm">
                    Rally others who share your view to contribute funds together. Pool funds until you reach the target
                    price to change the narrative.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3: Execute Together */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-purple-500/50 transition-all duration-500 hover:glow-purple">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse-glow-purple">
                      <Target className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-purple-500">🎯 EXECUTE TOGETHER</h3>
                  <p className="text-center text-muted-foreground text-sm">
                    When pool reaches target price, the answer changes automatically. Your proposed answer becomes the
                    official narrative.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 4: Rewards for All */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-glow-emerald">
                      <DollarSign className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-emerald-500">💰 REWARDS FOR ALL</h3>
                  <p className="text-center text-muted-foreground text-sm">
                    When someone later wants to change YOUR answer, everyone gets rewarded. Rewards distributed
                    proportionally to each person's contribution.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Collaboration Example */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="glass-card border border-cyan-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-center mb-8 text-cyan-500 flex items-center justify-center gap-2">
                <Zap className="h-6 w-6" />🔥 COLLABORATION EXAMPLE:
              </h3>

              <div className="space-y-6">
                {/* Pool Creation */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-cyan-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Answer "Best Investment Strategy?" costs <span className="font-bold text-red-400">1500 USDC</span>{" "}
                      to change
                    </p>
                  </div>
                </motion.div>

                {/* Pool Setup */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-blue-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-500 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      → Create pool: <span className="font-bold text-blue-400">"Index Fund Investing"</span> with
                      detailed description
                    </p>
                  </div>
                </motion.div>

                {/* Pool Funding */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-3">
                      → <span className="font-bold text-purple-400">10 people</span> contribute 150 USDC each ={" "}
                      <span className="font-bold text-emerald-400">1500 USDC total</span>
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 2, delay: 0.5 }}
                        viewport={{ once: true }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        1500/1500 USDC (100%)
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Answer Change */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-emerald-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      → Answer changes to <span className="font-bold text-emerald-400">"Index Fund Investing"</span>
                    </p>
                  </div>
                </motion.div>

                {/* Profit Distribution */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-yellow-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold">
                    5
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      → Later someone pays <span className="font-bold text-yellow-400">200 USDC</span> to change it
                      again
                    </p>
                    <p className="text-muted-foreground mt-1">
                      → All <span className="font-bold text-cyan-400">10 contributors</span> share the{" "}
                      <span className="font-bold text-emerald-400">190 USDC</span> (95% of 200) proportionally
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button className="cta-trader hover:scale-105 transition-all duration-300">
                  Start a Pool
                  <Users className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="hover:glow-cyan">
                  Join Existing Pools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Economics & Pricing Section */}
      <section className="py-20 relative bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">HOW PRICING WORKS</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Algorithmic Pricing */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-orange-500/50 transition-all duration-500 hover:glow-orange">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse-glow">
                      <BarChart2 className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4">ALGORITHMIC PRICING</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">No manipulation - prices set by smart contracts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Fair market value based on activity and demand</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Anti-MEV protection keeps trading honest</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Fee Structure */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-cyan-500/50 transition-all duration-500 hover:glow-cyan">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse-glow-cyan">
                      <DollarSign className="h-6 w-6 text-cyan-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4">FEE STRUCTURE</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        95% to previous owner • 3% creator fee • 2% platform fee
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Creators earn from every future trade on their questions
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Traders profit when someone wants their narrative</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Price Discovery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-yellow-500/50 transition-all duration-500 hover:glow-yellow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse-glow-yellow">
                      <Layers className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4">PRICE DISCOVERY</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Dynamic pricing responds to market activity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Hot topics = higher prices • Cold topics = opportunities
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">4-regime system ensures fair price movements</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fee Accumulation & Claiming Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">Fee Accumulation & Claiming</h2>
            <p className="text-xl md:text-2xl font-bold headline-cyan mb-4">EARN AND CLAIM ANYTIME</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Fees Accumulate Automatically */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-glow-emerald">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-emerald-500">
                    💰 FEES ACCUMULATE AUTOMATICALLY
                  </h3>
                  <p className="text-center text-muted-foreground text-sm">
                    Every trade generates fees that accumulate in your account. No complex staking or locking - your
                    earnings pile up continuously.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Multiple Revenue Streams */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-yellow-500/50 transition-all duration-500 hover:glow-yellow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse-glow-yellow">
                      <Layers className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-yellow-500">🎯 MULTIPLE REVENUE STREAMS</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Creator fees (3%) from every trade on your questions</li>
                    <li>• Owner profits (95%) when someone buys your answers</li>
                    <li>• Pool rewards when collaborative answers get purchased</li>
                    <li>• Question sale proceeds when you sell entire questions</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Claim Whenever You Want */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-cyan-500/50 transition-all duration-500 hover:glow-cyan">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse-glow-cyan">
                      <Zap className="h-6 w-6 text-cyan-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-cyan-500">⚡ CLAIM WHENEVER YOU WANT</h3>
                  <p className="text-center text-muted-foreground text-sm">
                    No waiting periods, no minimum amounts, no restrictions. Your fees, your timing, your control.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instant Withdrawals */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="h-full glass-card border-border/50 hover:border-orange-500/50 transition-all duration-500 hover:glow-orange">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse-glow">
                      <Download className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-4 text-orange-500">💸 INSTANT WITHDRAWALS</h3>
                  <p className="text-center text-muted-foreground text-sm">
                    Click "Claim Fees" → Approve transaction → USDC in your wallet. Gas-efficient claiming process on
                    Base network.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Earnings Dashboard Preview */}
          <motion.div
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="glass-card border border-emerald-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-center mb-8 text-emerald-500 flex items-center justify-center gap-2">
                <Wallet className="h-6 w-6" />
                Your Earnings Dashboard
              </h3>

              {/* Live Fee Counter */}
              <div className="text-center mb-8">
                <div className="text-4xl md:text-6xl font-black mb-2">
                  <motion.span
                    className="headline-emerald"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {accumulatedFees.toFixed(2)} USDC
                  </motion.span>
                </div>
                <p className="text-muted-foreground">Total Accumulated Fees</p>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-emerald-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-muted-foreground">Creator Fees:</span>
                    <span className="font-bold text-emerald-400">782.15 USDC</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-cyan-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-muted-foreground">Trading Profits:</span>
                    <span className="font-bold text-cyan-400">624.30 USDC</span>
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-muted-foreground">Pool Rewards:</span>
                    <span className="font-bold text-purple-400">189.12 USDC</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-yellow-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-muted-foreground">Pending Claims:</span>
                    <span className="font-bold text-yellow-400">0 USDC</span>
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="cta-emerald hover:scale-105 transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" />
                  Claim All Fees
                </Button>
                <Button variant="outline" className="hover:glow-emerald">
                  View Detailed Breakdown
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Earnings Example */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="glass-card border border-yellow-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-center mb-8 text-yellow-500 flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />🔥 EARNINGS EXAMPLE:
              </h3>

              <div className="space-y-6">
                {/* Week 1 */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-emerald-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <span className="font-bold text-emerald-400">Day 1-2:</span> Create 3 questions → Earn{" "}
                      <span className="font-bold text-emerald-400">125 USDC</span> in creator fees
                    </p>
                  </div>
                </motion.div>

                {/* Week 2 */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-cyan-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <span className="font-bold text-cyan-400">Day 3-4:</span> Trade 5 answers → Earn{" "}
                      <span className="font-bold text-cyan-400">285 USDC</span> in profits
                    </p>
                  </div>
                </motion.div>

                {/* Week 3 */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-500 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <span className="font-bold text-purple-400">Day 5-7:</span> Pool rewards → Earn{" "}
                      <span className="font-bold text-purple-400">145 USDC</span> from collaboration
                    </p>
                  </div>
                </motion.div>

                {/* Total */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-yellow-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold">
                    ∑
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <span className="font-bold text-yellow-400">Total accumulated:</span>{" "}
                      <span className="font-bold text-yellow-400 text-xl">555 USDC</span> ready to claim anytime!
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button className="cta-emerald hover:scale-105 transition-all duration-300">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Check My Fees
                </Button>
                <Button className="cta-trader hover:scale-105 transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" />
                  Claim Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security & Fairness Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">BUILT FOR TRUST</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">TRANSPARENT PRICING</h3>
                  <p className="text-muted-foreground">All calculations happen on-chain</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">ANTI-MEV PROTECTION</h3>
                  <p className="text-muted-foreground">Advanced bot protection</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <Lock className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">SECURE OWNERSHIP</h3>
                  <p className="text-muted-foreground">True blockchain assets on Base</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">USDC PAYMENTS</h3>
                  <p className="text-muted-foreground">Stable cryptocurrency, instant settlements</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 headline-orange">FREQUENTLY ASKED QUESTIONS</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4" value={expandAllFaqs ? "all" : undefined}>
              <AccordionItem value="item-1" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">How is this different from Twitter or Reddit?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Twitter/Reddit rely on worthless upvotes that bots can manipulate. On OMC, we use the most valuable
                  "like" - money with skin in the game.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">What if no one wants to trade my answer?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Even without instant cash, you control the narrative and can drive traffic to any page through links.
                  It's like having the #1 spot on Google search results for that topic.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">Can I lose money?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  You're not "losing money" - you're investing in something that matters to you and claiming your
                  position on debates you care about.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">What makes a good question?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Good questions are <span className="font-bold text-orange-500">timeless</span> and <span className="font-bold text-cyan-500">very specific</span>:
                  <br/><br/>
                  <span className="font-bold text-orange-500">• Timeless:</span> "Greatest Movie Ever?" "Most Important Invention?" - won't become outdated quickly
                  <br/>
                  <span className="font-bold text-cyan-500">• Very specific:</span> "Best sushi restaurant in Manhattan under $100?" - clear, unambiguous topics
                  <br/><br/>
                  Avoid deadline-based questions - they expire and lose value.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">What about copycat questions?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  <div className="space-y-3">
                    <p>Each question has a unique ID number. If someone creates a duplicate like:</p>
                    <div className="p-3 rounded-lg bg-muted/20 border border-red-500/20">
                      <p className="text-sm">
                        "Goat of Soccer?" <span className="text-emerald-400 font-bold">(ID: 123)</span> vs "Best of
                        Soccer?" <span className="text-red-400 font-bold">(ID: 235)</span>
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>→ The lowest ID (123) stays active, the copycat (235) gets deactivated</p>
                      <p>→ Fees from deactivated questions are non-refunded</p>
                      <p>→ OMC maintains a fair, spam-free platform for genuine debates</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">Can I sell my questions?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Yes! Your questions are businesses you can sell. Transfer ownership and all future revenue streams to
                  someone else. Get paid upfront for your creation while they get the ongoing income.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">How do pools work?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  When an answer costs too much to change alone, create a pool with your proposed answer. Rally others
                  to contribute funds together. When you reach the target, the answer changes and everyone shares future
                  rewards proportionally.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-8 text-center">
              <Button variant="outline" onClick={toggleAllFaqs} className="hover:glow-orange">
                {expandAllFaqs ? "Collapse All FAQs" : "Expand All FAQs"}
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${expandAllFaqs ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 headline-orange">READY TO START?</h2>

            <div className="glass-card border border-border/50 rounded-xl p-6 md:p-8 mb-10">
              <ol className="space-y-4 text-left">
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                    1
                  </div>
                  <span>Connect your wallet (MetaMask, Coinbase Wallet, etc.)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                    2
                  </div>
                  <span>Get some USDC for trading</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                    3
                  </div>
                  <span>Get some Base ETH for gas fees</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                    4
                  </div>
                  <span>Choose your path: Create or Trade</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                    5
                  </div>
                  <span>Own your first narrative</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    6
                  </div>
                  <span>Start earning fees from day one</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    7
                  </div>
                  <span>Claim your accumulated earnings anytime</span>
                </li>
              </ol>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground mb-6">
                  💡 Need tokens? We'll help you bridge from Ethereum mainnet
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button size="lg" className="cta-leader hover:scale-105 transition-all duration-300">
                Join Testnet
              </Button>
              <Button size="lg" variant="outline" className="hover:glow-orange">
                Connect Wallet
              </Button>
              <Button size="lg" variant="outline" className="hover:glow-cyan">
                Get USDC
              </Button>
              <Button size="lg" variant="outline" className="hover:glow-yellow">
                Bridge to Base
              </Button>
            </div>

            <p className="text-muted-foreground">
              Questions? Join our{" "}
              <Link href="#" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                Discord community
              </Link>{" "}
              →
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-500" />
              <span className="font-bold">OpinionMarketCap</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">© 2025 OpinionMarketCap. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        /* Headline Colors */
        .headline-orange {
          background: linear-gradient(45deg, #FF6B35, #F7931E, #FFD23F);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
          animation: gradient-shift 3s ease-in-out infinite;
        }

        .headline-cyan {
          background: linear-gradient(45deg, #00D2FF, #3A7BD5, #00D2FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(0, 210, 255, 0.5);
          animation: gradient-shift-cyan 3s ease-in-out infinite;
        }

        .headline-emerald {
          background: linear-gradient(45deg, #10B981, #34D399, #6EE7B7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
          animation: gradient-shift-emerald 3s ease-in-out infinite;
        }

        /* CTA Buttons */
        .cta-leader {
          background: linear-gradient(45deg, #FF6B35, #F7931E, #FFD23F);
          color: black;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
        }

        .cta-leader:hover {
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
          transform: translateY(-2px);
        }

        .cta-trader {
          background: linear-gradient(45deg, #00D2FF, #3A7BD5, #00D2FF);
          color: white;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);
        }

        .cta-trader:hover {
          box-shadow: 0 0 30px rgba(0, 210, 255, 0.5);
          transform: translateY(-2px);
        }

        .cta-emerald {
          background: linear-gradient(45deg, #10B981, #34D399, #6EE7B7);
          color: black;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .cta-emerald:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
          transform: translateY(-2px);
        }

        /* Glass Effects */
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        /* Glow Effects */
        .glow-orange {
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
        }

        .glow-cyan {
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);
        }

        .glow-yellow {
          box-shadow: 0 0 20px rgba(255, 210, 63, 0.3);
        }

        .glow-emerald {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .glow-blue {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .glow-purple {
          box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
        }

        .hover\\:glow-orange:hover {
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
        }

        .hover\\:glow-cyan:hover {
          box-shadow: 0 0 30px rgba(0, 210, 255, 0.5);
        }

        .hover\\:glow-emerald:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
        }

        .hover\\:glow-blue:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }

        .hover\\:glow-purple:hover {
          box-shadow: 0 0 30px rgba(147, 51, 234, 0.5);
        }

        /* Animations */
        @keyframes gradient-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(20deg); }
        }

        @keyframes gradient-shift-cyan {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(-20deg); }
        }

        @keyframes gradient-shift-emerald {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(15deg); }
        }

        @keyframes float-particle {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.8;
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes morph {
          0%, 100% { transform: rotate(45deg) scale(1); }
          50% { transform: rotate(225deg) scale(1.2); }
        }

        @keyframes energy-wave {
          0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(100vw) skewX(-15deg); opacity: 0; }
        }

        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          5%, 85% { opacity: 1; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 53, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.8); }
        }

        @keyframes pulse-glow-cyan {
          0%, 100% { box-shadow: 0 0 5px rgba(0, 210, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(0, 210, 255, 0.8); }
        }

        @keyframes pulse-glow-yellow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 210, 63, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 210, 63, 0.8); }
        }

        @keyframes pulse-glow-emerald {
          0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
        }

        @keyframes pulse-glow-blue {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }

        @keyframes pulse-glow-purple {
          0%, 100% { box-shadow: 0 0 5px rgba(147, 51, 234, 0.5); }
          50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.8); }
        }

        @keyframes border-glow {
          0%, 100% { 
            background: linear-gradient(45deg, transparent, rgba(255, 107, 53, 0.3), transparent);
          }
          50% { 
            background: linear-gradient(45deg, transparent, rgba(255, 107, 53, 0.6), transparent);
          }
        }

        @keyframes border-glow-cyan {
          0%, 100% { 
            background: linear-gradient(45deg, transparent, rgba(0, 210, 255, 0.3), transparent);
          }
          50% { 
            background: linear-gradient(45deg, transparent, rgba(0, 210, 255, 0.6), transparent);
          }
        }

        /* Animation Classes */
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .animate-morph {
          animation: morph 8s ease-in-out infinite;
        }

        .animate-energy-wave {
          animation: energy-wave 10s linear infinite;
        }

        .animate-lightning {
          animation: lightning 15s linear infinite;
        }

        .animate-float-particle {
          animation: float-particle 6s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-pulse-glow-cyan {
          animation: pulse-glow-cyan 2s ease-in-out infinite;
        }

        .animate-pulse-glow-yellow {
          animation: pulse-glow-yellow 2s ease-in-out infinite;
        }

        .animate-pulse-glow-emerald {
          animation: pulse-glow-emerald 2s ease-in-out infinite;
        }

        .animate-pulse-glow-blue {
          animation: pulse-glow-blue 2s ease-in-out infinite;
        }

        .animate-pulse-glow-purple {
          animation: pulse-glow-purple 2s ease-in-out infinite;
        }

        .animate-border-glow {
          animation: border-glow 3s ease-in-out infinite;
        }

        .animate-border-glow-cyan {
          animation: border-glow-cyan 3s ease-in-out infinite;
        }

        /* Performance Optimizations */
        .animate-float-particle,
        .animate-pulse-slow,
        .animate-spin-slow,
        .animate-spin-reverse,
        .animate-morph {
          will-change: transform;
        }

        .animate-pulse-glow,
        .animate-pulse-glow-cyan,
        .animate-pulse-glow-yellow,
        .animate-pulse-glow-emerald,
        .animate-pulse-glow-blue,
        .animate-pulse-glow-purple {
          will-change: box-shadow;
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-float-particle,
          .animate-pulse-slow,
          .animate-spin-slow,
          .animate-spin-reverse,
          .animate-morph,
          .animate-energy-wave,
          .animate-lightning,
          .animate-pulse-glow,
          .animate-pulse-glow-cyan,
          .animate-pulse-glow-yellow,
          .animate-pulse-glow-emerald,
          .animate-pulse-glow-blue,
          .animate-pulse-glow-purple,
          .animate-border-glow,
          .animate-border-glow-cyan {
            animation: none;
          }
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .animate-float-particle {
            animation-duration: 8s;
          }
          
          .headline-orange,
          .headline-cyan,
          .headline-emerald {
            font-size: 2.5rem;
          }
          
          /* Better mobile spacing */
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          /* Mobile-friendly text sizes */
          h1 {
            font-size: 2rem !important;
            line-height: 1.2;
          }
          
          h2 {
            font-size: 1.75rem !important;
            line-height: 1.3;
          }
          
          h3 {
            font-size: 1.25rem !important;
            line-height: 1.4;
          }
          
          /* Improve card spacing on mobile */
          .glass-card {
            margin-bottom: 1rem;
            padding: 1rem !important;
          }
          
          /* Better button sizing */
          .cta-leader,
          .cta-trader {
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
          }
          
          /* Prevent horizontal scroll */
          .max-w-4xl,
          .max-w-3xl,
          .max-w-2xl {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }
          
          /* Better grid layouts on mobile */
          .grid.md\\:grid-cols-2 {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .grid.md\\:grid-cols-3 {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}