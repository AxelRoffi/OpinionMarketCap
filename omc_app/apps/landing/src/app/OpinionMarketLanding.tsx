"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, BarChart2, Check, Crown, Layers, Lightbulb, Menu, X, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [activePersona, setActivePersona] = useState<"leader" | "trader" | null>(null)
  const [email, setEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
                <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                  How It Works
                </Link>
                <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                  Testimonials
                </Link>
              </nav>
              <ThemeToggle />
              <Button variant="outline" className="hidden md:flex hover:glow-orange">
                Connect Wallet
              </Button>
              <Button className="hidden md:flex hover:glow-cyan">Launch App</Button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-lg z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/how-it-works"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#features"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#testimonials"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
                  <Button variant="outline" className="hover:glow-orange">
                    Connect Wallet
                  </Button>
                  <Button className="hover:glow-cyan">Launch App</Button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight mb-6"
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
                OWN THE NARRATIVE.
              </motion.span>
              <motion.span
                className="headline-cyan"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                EARN THE PROFITS.
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              The first marketplace where opinions become tradeable assets.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button size="lg" className="cta-leader hover:scale-105 transition-all duration-300">
                Become Opinion Leader
                <Crown className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" className="cta-trader hover:scale-105 transition-all duration-300">
                Be An Opinion Trader
                <Zap className="ml-2 h-4 w-4" />
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

      {/* Dual Persona Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
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
                  <h3 className="text-xl font-bold text-orange-500">OPINION LEADER</h3>
                </div>
                <h4 className="text-2xl font-bold mb-6">"Create the conversation"</h4>
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
                  Start Leading
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
                  <h3 className="text-xl font-bold text-cyan-500">OPINION TRADER</h3>
                </div>
                <h4 className="text-2xl font-bold mb-6">"Own the narrative"</h4>
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
                  Start Trading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="overview" className="py-20 relative bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            HOW IT WORKS
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-500 hover:glow-yellow group-hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse-glow-yellow">
                    <Lightbulb className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">Ask a Question</h3>
                  <p className="text-center text-muted-foreground">Submit any question and set the conversation in motion</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card border border-orange-500/30 hover:border-orange-500/50 transition-all duration-500 hover:glow-orange group-hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse-glow">
                    <Layers className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">Trade Opinions</h3>
                  <p className="text-center text-muted-foreground">Buy and sell the right to answer questions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-500 hover:glow-cyan group-hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/20 rounded-full flex items-center justify-center animate-pulse-glow-cyan">
                    <Crown className="h-8 w-8 text-cyan-500" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">Earn Profits</h3>
                  <p className="text-center text-muted-foreground">Get paid when others want in on your narrative</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fair Trading Section */}
      <section id="features" className="py-20 relative bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">FAIR & SECURE TRADING</h2>

            <div className="space-y-6">
              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Algorithmic pricing</h3>
                  <p className="text-muted-foreground">
                    Our bonding curve algorithm ensures fair pricing with no manipulation possible
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Anti-MEV protection built-in</h3>
                  <p className="text-muted-foreground">
                    Advanced protection against front-running and other MEV attacks
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4 p-6 rounded-xl glass-card border border-border/50 hover:border-emerald-500/50 transition-all duration-500 hover:glow-emerald"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-full bg-emerald-500/20 shrink-0 animate-pulse-glow-emerald">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Transparent on-chain trading</h3>
                  <p className="text-muted-foreground">
                    Every trade is fully transparent and verifiable on the blockchain
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to own the narrative?</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join the testnet now and be among the first to experience the future of opinion trading
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button size="lg" className="cta-leader hover:scale-105 transition-all duration-300">
                Join as Opinion Leader
                <Crown className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" className="cta-trader hover:scale-105 transition-all duration-300">
                Start Opinion Trading
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email for testnet access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input border-border/50 focus:border-orange-500/50"
                />
                <Button className="hover:glow-orange">Sign Up</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">We'll notify you when testnet access is available</p>
            </div>
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

        .hover\\:glow-orange:hover {
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
        }

        .hover\\:glow-cyan:hover {
          box-shadow: 0 0 30px rgba(0, 210, 255, 0.5);
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
        .animate-pulse-glow-emerald {
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
          .headline-cyan {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  )
}