'use client'

import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Wallet,
  Zap,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Shield,
  Crown,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

// --- Reusable design system (same as landing, mission, how-it-works) ---

const GradientOrb = ({ color, size, position, delay = 0 }: { color: string, size: number, position: Record<string, string>, delay?: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none z-0"
    style={{
      width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(80px)",
      ...position
    }}
    animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0], scale: [1, 1.05, 0.95, 1] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const AnimatedSeparator = () => (
  <div className="relative h-px max-w-4xl mx-auto overflow-hidden my-4">
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const Section = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={cn("py-24 px-4 relative overflow-hidden", className)}>
    <div className="max-w-6xl mx-auto relative z-10">{children}</div>
  </section>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.h2
    className={cn("text-4xl md:text-5xl font-bold text-center mb-16 animated-gradient-text", className)}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >{children}</motion.h2>
);

const fadeInView = {
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.8, ease: "easeOut" as const }
};

const scaleUpView = {
  initial: { opacity: 0, scale: 0.8 } as const,
  whileInView: { opacity: 1, scale: 1 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }
};

const slideLeftView = {
  initial: { opacity: 0, x: -60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.8, ease: "easeOut" as const }
};

const slideRightView = {
  initial: { opacity: 0, x: 60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.8, ease: "easeOut" as const }
};


// ============================================================
// SECTION 1: HERO
// ============================================================
const HeroSection = () => {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: ((i * 7 + 3) % 100),
    yStart: ((i * 11 + 5) % 100),
    yEnd: ((i * 19 + 7) % 100),
    duration: 6 + (i % 8),
    delay: (i * 0.3) % 5,
    size: 1 + (i % 3),
    color: ['#3b82f6', '#8b5cf6', '#10b981', '#60a5fa', '#a855f7'][i % 5],
  }));

  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden hero-mesh-bg min-h-[80vh] flex flex-col justify-center">
      <GradientOrb color="rgba(59, 130, 246, 0.4)" size={600} position={{ top: '-10%', right: '-5%' }} delay={0} />
      <GradientOrb color="rgba(139, 92, 246, 0.3)" size={500} position={{ bottom: '0%', left: '-10%' }} delay={2} />

      <div className="absolute inset-0 z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size, height: p.size,
              background: p.color,
              left: `${p.x}%`,
              top: `${p.yStart}%`,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
            animate={{ y: [0, -40, 20, 0], opacity: [0.3, 0.8, 0.4, 0.3] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="animated-gradient-text">Your First Trade</span>
            <br />
            <span className="text-white">in 5 Minutes</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          No PhD in crypto. No jargon. Just money where your mouth is.
        </motion.p>

        <motion.p
          className="text-gray-500 text-lg mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Everything you need to go from zero to trading opinions on Base.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <a href="#setup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-bold rounded-full button-pulse cta-shimmer">
              Let's Go <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full">
              Skip to App <ArrowUpRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </motion.div>

        <motion.div
          className="mt-12"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-gray-500 mx-auto" />
        </motion.div>
      </div>
    </section>
  );
};


// ============================================================
// SECTION 2: SETUP — "Three Things. That's It."
// ============================================================
const SetupSection = () => {
  const steps = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Get a Wallet",
      subtitle: "Your crypto identity",
      description: "MetaMask, Coinbase Wallet, or any EVM wallet. If you have one, skip this.",
      action: "Install MetaMask",
      actionUrl: "https://metamask.io/download/",
      color: "blue",
      details: [
        "Install the browser extension or mobile app",
        "Create a new wallet (save your seed phrase somewhere safe)",
        "The wallet auto-connects to Base network",
      ],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Get ETH on Base",
      subtitle: "For gas fees (~$0.01 per trade)",
      description: "You need a tiny amount of ETH to pay transaction fees. We're talking pennies.",
      action: "Bridge to Base",
      actionUrl: "https://bridge.base.org/",
      color: "purple",
      details: [
        "Buy ETH on Coinbase and send to Base",
        "Or bridge from Ethereum using the Base Bridge",
        "$5 of ETH lasts hundreds of trades",
      ],
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Get USDC",
      subtitle: "Your trading currency",
      description: "USDC is the dollar of crypto. 1 USDC = $1. Always. That's what you trade with on OMC.",
      action: "Get USDC on Base",
      actionUrl: "https://www.coinbase.com/",
      color: "emerald",
      details: [
        "Buy USDC directly on Coinbase",
        "Or swap any token for USDC on a DEX",
        "Start with as little as $5 — no minimum",
      ],
    },
  ];

  const colorMap: Record<string, { bg: string, border: string, text: string, glow: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-purple-500/20" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  };

  return (
    <Section id="setup">
      <SectionTitle>Three Things. That&apos;s It.</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-2xl mx-auto" {...fadeInView}>
        Wallet. ETH. USDC. You probably have two of these already.
      </motion.p>

      <div className="space-y-8">
        {steps.map((step, i) => {
          const c = colorMap[step.color];
          return (
            <motion.div
              key={step.title}
              className={cn(
                "relative rounded-2xl border p-8 md:p-10 transition-all",
                c.bg, c.border,
                `hover:shadow-xl hover:${c.glow}`
              )}
              {...(i % 2 === 0 ? slideLeftView : slideRightView)}
              transition={{ duration: 0.8, ease: "easeOut" as const, delay: i * 0.15 }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Number + Icon */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black", c.bg, c.text)}>
                    {i + 1}
                  </div>
                  <div className={cn(c.text)}>{step.icon}</div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{step.title}</h3>
                  <p className={cn("text-sm font-medium mb-3", c.text)}>{step.subtitle}</p>
                  <p className="text-gray-300 mb-4">{step.description}</p>

                  <ul className="space-y-2 mb-6">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-400 text-sm">
                        <CheckCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", c.text)} />
                        {d}
                      </li>
                    ))}
                  </ul>

                  <a href={step.actionUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className={cn("border-current", c.text, "hover:bg-white/5")}>
                      {step.action} <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p className="text-center text-gray-500 mt-10 text-sm" {...fadeInView}>
        Total time: ~3 minutes if you already have a wallet. Done? Let's make money.
      </motion.p>
    </Section>
  );
};


// ============================================================
// SECTION 3: MINT — "Create a Market. Earn Forever."
// ============================================================
const MintSection = () => {
  const fields = [
    {
      name: "Your Question",
      required: true,
      example: '"Best CRM for startups?"',
      tip: "Ask something people will fight about. Debate = volume = money.",
      maxChars: "60 chars",
    },
    {
      name: "Your Answer",
      required: true,
      example: '"HubSpot"',
      tip: "Be specific. 'HubSpot' beats 'there are many good options'.",
      maxChars: "60 chars",
    },
    {
      name: "Initial Price",
      required: true,
      example: "$25 USDC",
      tip: "This is how much someone pays to replace your answer. Higher = more skin in the game.",
      maxChars: "$1 – $100",
    },
    {
      name: "Category",
      required: true,
      example: "Technology",
      tip: "40 categories. Pick the right one — it helps traders find your market.",
      maxChars: "Pick 1-3",
    },
    {
      name: "Description",
      required: false,
      example: '"Best features for small teams at affordable pricing"',
      tip: "Argue your case. Why is your answer the right one?",
      maxChars: "120 chars",
    },
    {
      name: "External Link",
      required: false,
      example: "https://hubspot.com",
      tip: "Add proof. A link to back up your answer drives credibility.",
      maxChars: "URL",
    },
  ];

  return (
    <Section>
      <GradientOrb color="rgba(16, 185, 129, 0.2)" size={500} position={{ top: '10%', left: '-10%' }} delay={1} />

      <SectionTitle>Create a Market. Earn Forever.</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-6 max-w-3xl mx-auto" {...fadeInView}>
        Mint a question. Every time someone trades an answer, you get <span className="text-emerald-400 font-bold">3% royalty</span>. Not for a month. Not for a year. Forever.
      </motion.p>

      <AnimatedSeparator />

      {/* Form fields */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        {fields.map((field, i) => (
          <motion.div
            key={field.name}
            className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
            {...scaleUpView}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-white">{field.name}</h4>
              <div className="flex gap-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  field.required ? "bg-red-500/20 text-red-300" : "bg-gray-600/30 text-gray-500"
                )}>
                  {field.required ? "Required" : "Optional"}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-600/30 text-gray-400">
                  {field.maxChars}
                </span>
              </div>
            </div>

            <div className="bg-gray-900/60 rounded-lg px-4 py-3 mb-3 font-mono text-blue-300 text-sm">
              {field.example}
            </div>

            <p className="text-gray-400 text-sm">{field.tip}</p>
          </motion.div>
        ))}
      </div>

      {/* Fee formula */}
      <motion.div
        className="mt-12 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8"
        {...fadeInView}
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          Creation Fee — Skin in the Game
        </h3>
        <div className="mb-4">
          <code className="text-emerald-300 bg-emerald-900/30 px-3 py-2 rounded-lg text-lg font-bold">
            MAX(2 USDC, price × 20%)
          </code>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-900/40 rounded-lg p-4">
            <p className="text-gray-400 text-sm">$10 initial price</p>
            <p className="text-white font-bold">→ $2 fee <span className="text-gray-500 font-normal">(minimum)</span></p>
          </div>
          <div className="bg-gray-900/40 rounded-lg p-4">
            <p className="text-gray-400 text-sm">$50 initial price</p>
            <p className="text-white font-bold">→ $10 fee <span className="text-gray-500 font-normal">(20%)</span></p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-4">No spam. No throwaway questions. If you mint it, you mean it.</p>
      </motion.div>
    </Section>
  );
};


// ============================================================
// SECTION 4: TRADE — "See Something Wrong? Fix It. Get Paid."
// ============================================================
const TradeSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Find a market",
      description: "Browse by category or search. Look for answers you think are wrong — that's where the money is.",
      icon: <Target className="w-6 h-6" />,
      color: "blue",
    },
    {
      title: "Check the price",
      description: "Every market shows the NextPrice — what it costs to replace the current answer. Dynamic pricing means it changes based on activity.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "purple",
    },
    {
      title: "Submit your answer",
      description: "Pay the NextPrice, write your answer. You're now the answer owner. The previous owner gets 95% of what you paid. Instantly.",
      icon: <Zap className="w-6 h-6" />,
      color: "emerald",
    },
    {
      title: "Collect when someone disagrees",
      description: "Someone thinks you're wrong? They pay to replace you. You keep 95%. The question creator gets 3%. OMC gets 2%.",
      icon: <DollarSign className="w-6 h-6" />,
      color: "yellow",
    },
  ];

  const stepColors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  };

  return (
    <Section>
      <GradientOrb color="rgba(139, 92, 246, 0.2)" size={500} position={{ top: '-5%', right: '-5%' }} delay={0.5} />

      <SectionTitle>See Something Wrong? Fix It. Get Paid.</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-3xl mx-auto" {...fadeInView}>
        Trading on OMC means putting your money where your conviction is. Disagree with an answer? Replace it. Agree? Sit back and collect.
      </motion.p>

      {/* Interactive step selector */}
      <div className="grid md:grid-cols-4 gap-3 mb-8">
        {steps.map((step, i) => (
          <motion.button
            key={step.title}
            className={cn(
              "text-left rounded-xl border p-5 transition-all cursor-pointer",
              activeStep === i
                ? stepColors[step.color]
                : "bg-gray-800/30 border-gray-700/50 hover:border-gray-600"
            )}
            onClick={() => setActiveStep(i)}
            {...scaleUpView}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                activeStep === i ? stepColors[step.color] : "bg-gray-700 text-gray-400"
              )}>
                {i + 1}
              </span>
              {step.icon}
            </div>
            <h4 className="font-bold text-white text-sm">{step.title}</h4>
          </motion.button>
        ))}
      </div>

      {/* Active step detail */}
      <motion.div
        key={activeStep}
        className={cn(
          "rounded-2xl border p-8 md:p-10",
          stepColors[steps[activeStep].color]
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4 mb-4">
          {steps[activeStep].icon}
          <h3 className="text-2xl font-bold text-white">{steps[activeStep].title}</h3>
        </div>
        <p className="text-gray-300 text-lg">{steps[activeStep].description}</p>
      </motion.div>

      {/* Fee breakdown */}
      <motion.div className="mt-12" {...fadeInView}>
        <h3 className="text-xl font-bold text-white text-center mb-8">Where Your Money Goes</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { pct: "95%", label: "Previous Owner", sublabel: "Instant payout", color: "emerald" },
            { pct: "3%", label: "Question Creator", sublabel: "Forever royalty", color: "blue" },
            { pct: "2%", label: "OMC Platform", sublabel: "Keeps the lights on", color: "purple" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="text-center bg-gray-800/40 rounded-xl p-6 border border-gray-700/50"
              {...scaleUpView}
              transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.15 }}
            >
              <div className={cn(
                "text-4xl font-black mb-2",
                item.color === "emerald" && "text-emerald-400",
                item.color === "blue" && "text-blue-400",
                item.color === "purple" && "text-purple-400",
              )}>
                {item.pct}
              </div>
              <div className="text-white font-semibold text-sm">{item.label}</div>
              <div className="text-gray-500 text-xs mt-1">{item.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Anti-gaming note */}
      <motion.div
        className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 flex items-start gap-4"
        {...fadeInView}
      >
        <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-purple-300 mb-1">Dynamic Pricing — No Gaming</h4>
          <p className="text-gray-400 text-sm">
            NextPrice is calculated by an on-chain algorithm using market volume, trading frequency, and 14 entropy sources. No fixed formula. No MEV extraction. No bots predicting exact profit margins. Fair game.
          </p>
        </div>
      </motion.div>
    </Section>
  );
};


// ============================================================
// SECTION 5: POOLS — "Can't Afford It Alone? Team Up."
// ============================================================
const PoolSection = () => {
  return (
    <Section>
      <GradientOrb color="rgba(239, 68, 68, 0.15)" size={450} position={{ bottom: '5%', right: '-5%' }} delay={1.5} />

      <SectionTitle>Can&apos;t Afford It Alone? Team Up.</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-3xl mx-auto" {...fadeInView}>
        Pools let you team up with other traders to collectively buy an answer. Split the cost. Share the rewards.
      </motion.p>

      {/* How pools work — two columns */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8"
          {...slideLeftView}
        >
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-3">
            <Target className="w-6 h-6" />
            Create a Pool
          </h3>
          <ul className="space-y-3">
            {[
              "Pick any active opinion market",
              "Target price is set automatically (= NextPrice)",
              "Contribute your USDC + $5 pool creation fee",
              "Set expiration (1–60 days)",
              "Name it, propose an answer, market it",
              "Others join and add their money",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-blue-400 font-bold mt-0.5">→</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8"
          {...slideRightView}
        >
          <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
            <Users className="w-6 h-6" />
            Join a Pool
          </h3>
          <ul className="space-y-3">
            {[
              "Browse active pools by category",
              "Check progress toward target price",
              "Contribute any amount (free, no fee)",
              "Share rewards proportional to your contribution",
              "Auto-executes when target is reached",
              "Full refund if pool expires without hitting target",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-emerald-400 font-bold mt-0.5">→</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Example scenario */}
      <motion.div
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8 mb-8"
        {...fadeInView}
      >
        <h3 className="text-xl font-bold text-white mb-6">Real Example</h3>

        <div className="bg-gray-900/40 rounded-xl p-5 mb-6">
          <p className="text-yellow-400 font-semibold">&quot;Most popular US female artist?&quot;</p>
          <p className="text-gray-400 mt-1">Current answer: <span className="text-white font-semibold">Beyoncé</span> at $4,500</p>
          <p className="text-blue-400 mt-1">Pool target: <span className="font-semibold">$6,000</span> for &quot;Taylor Swift&quot;</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pool target", value: "$6,000", color: "text-blue-400" },
            { label: "Your share", value: "$600 (10%)", color: "text-purple-400" },
            { label: "Contributors", value: "20 people", color: "text-emerald-400" },
            { label: "If it hits", value: "You earn 10% of rewards when someone replaces the answer", color: "text-yellow-400" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-900/40 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className={cn("font-bold text-sm", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm">
          Pool hits target → answer changes to &quot;Taylor Swift&quot; → pool becomes the answer owner → everyone earns proportional rewards when someone pays to replace the answer.
        </p>
      </motion.div>

      {/* Three outcomes */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "Target Hit",
            description: "Everyone shares rewards proportionally. Pool becomes the answer owner.",
            color: "emerald",
          },
          {
            icon: <Shield className="w-6 h-6" />,
            title: "Pool Expires",
            description: "Target not reached by deadline? Full refund to all contributors. No loss.",
            color: "blue",
          },
          {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: "Early Exit",
            description: "Withdraw before expiry? 20% penalty. Prevents pump-and-dump manipulation.",
            color: "red",
          },
        ].map((outcome, i) => (
          <motion.div
            key={outcome.title}
            className={cn(
              "rounded-xl border p-6",
              outcome.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20",
              outcome.color === "blue" && "bg-blue-500/10 border-blue-500/20",
              outcome.color === "red" && "bg-red-500/10 border-red-500/20",
            )}
            {...scaleUpView}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.15 }}
          >
            <div className={cn(
              "mb-3",
              outcome.color === "emerald" && "text-emerald-400",
              outcome.color === "blue" && "text-blue-400",
              outcome.color === "red" && "text-red-400",
            )}>
              {outcome.icon}
            </div>
            <h4 className="font-bold text-white mb-2">{outcome.title}</h4>
            <p className="text-gray-400 text-sm">{outcome.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};


// ============================================================
// SECTION 6: PRO TIPS — "Play Smarter"
// ============================================================
const ProTipsSection = () => {
  const tips = [
    {
      icon: <Crown className="w-7 h-7" />,
      role: "Question Creator",
      color: "yellow",
      tips: [
        "Ask questions that spark endless debate — controversy = volume = royalties",
        "Evergreen topics beat trending ones. 'Best CRM?' pays forever. 'Best meme this week?' dies in 7 days.",
        "Set realistic initial prices. $25 is a sweet spot — high enough to signal quality, low enough to attract first traders.",
        "You can sell your question on the marketplace. Create it. Build volume. Cash out.",
      ],
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      role: "Answer Trader",
      color: "emerald",
      tips: [
        "Buy answers in your area of expertise. You know something the market doesn't? That's alpha.",
        "Watch for underpriced markets — low activity + strong opinion = opportunity.",
        "Hold positions in evergreen markets. 'Best programming language?' will trade for years.",
        "Track category trends. When a sector heats up, all its markets move.",
      ],
    },
    {
      icon: <Users className="w-7 h-7" />,
      role: "Pool Strategist",
      color: "blue",
      tips: [
        "Never put all your funds in one pool. Diversify across categories and timeframes.",
        "Check pool progress before joining. 80% funded = likely to hit. 10% funded with 2 days left = probably not.",
        "The 20% early exit penalty is real. Only join pools you're committed to.",
        "Create pools around events — product launches, elections, award shows. Timing is everything.",
      ],
    },
  ];

  const colorMap: Record<string, { bg: string, border: string, text: string, dot: string }> = {
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  };

  return (
    <Section>
      <SectionTitle>Play Smarter</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-2xl mx-auto" {...fadeInView}>
        You know the rules. Now learn how the smart money plays.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6">
        {tips.map((group, i) => {
          const c = colorMap[group.color];
          return (
            <motion.div
              key={group.role}
              className={cn("rounded-2xl border p-8", c.bg, c.border)}
              {...scaleUpView}
              transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.15 }}
            >
              <div className={cn("mb-4", c.text)}>{group.icon}</div>
              <h3 className="text-xl font-bold text-white mb-6">{group.role}</h3>
              <ul className="space-y-4">
                {group.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-3 text-gray-300 text-sm">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", c.dot)} />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};


// ============================================================
// SECTION 7: CONTRACTS — "On-Chain. Verified. Transparent."
// ============================================================
const ContractsSection = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const contracts = [
    { name: "USDC Token", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", purpose: "Trading currency", url: "https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
    { name: "OpinionCore", address: "0x7b5d97fb78fbf41432F34f46a901C6da7754A726", purpose: "Main opinion markets", url: "https://basescan.org/address/0x7b5d97fb78fbf41432F34f46a901C6da7754A726" },
    { name: "PoolManager", address: "0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e", purpose: "Collaborative pools", url: "https://basescan.org/address/0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e" },
    { name: "FeeManager", address: "0x31D604765CD76Ff098A283881B2ca57e7F703199", purpose: "Fee claims & royalties", url: "https://basescan.org/address/0x31D604765CD76Ff098A283881B2ca57e7F703199" },
  ];

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <Section>
      <GradientOrb color="rgba(59, 130, 246, 0.15)" size={400} position={{ top: '20%', left: '-10%' }} delay={2} />

      <SectionTitle>On-Chain. Verified. Transparent.</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-3xl mx-auto" {...fadeInView}>
        Every trade, every fee, every pool — it&apos;s all on Base mainnet. Verified on BaseScan. No trust required.
      </motion.p>

      <div className="space-y-4">
        {contracts.map((contract, i) => (
          <motion.div
            key={contract.name}
            className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/30 transition-colors"
            {...fadeInView}
            transition={{ duration: 0.8, ease: "easeOut" as const, delay: i * 0.1 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-white">{contract.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">{contract.purpose}</span>
              </div>
              <code className="text-blue-300 text-sm font-mono">{contract.address}</code>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(contract.address)}
                className={cn(
                  "p-2 rounded-lg border transition-all text-sm",
                  copiedAddress === contract.address
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600"
                )}
              >
                {copiedAddress === contract.address ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={contract.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p className="text-center text-gray-600 text-sm mt-8" {...fadeInView}>
        Base Mainnet (Chain ID: 8453) — All contracts UUPS upgradeable and verified on BaseScan.
      </motion.p>
    </Section>
  );
};


// ============================================================
// SECTION 8: TROUBLESHOOTING — Quick hits
// ============================================================
const TroubleshootingSection = () => {
  const issues = [
    { problem: "Transaction failed", fix: "Check you have enough ETH for gas (~$0.01). Increase gas limit in wallet if needed." },
    { problem: "USDC approval required", fix: "First trade requires approving USDC spending. It's a one-time transaction — confirm it in your wallet." },
    { problem: "Can't create question", fix: "Check character limits (60 chars question, 60 chars answer, 120 chars description). Verify USDC balance covers creation fee." },
    { problem: "Can't claim creator fees", fix: "Go to the FeeManager contract on BaseScan and call claimAccumulatedFees(). UI claiming coming soon." },
    { problem: "Pool target seems high", fix: "Target = NextPrice, set by the algorithm. If it's high, that means the market is hot. Team up bigger." },
  ];

  return (
    <Section>
      <SectionTitle>Something Broke?</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-2xl mx-auto" {...fadeInView}>
        Quick fixes for common issues. If it&apos;s not here, hit us up on Discord.
      </motion.p>

      <div className="space-y-3 max-w-3xl mx-auto">
        {issues.map((item, i) => (
          <motion.div
            key={item.problem}
            className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-orange-500/30 transition-colors"
            {...fadeInView}
            transition={{ duration: 0.8, ease: "easeOut" as const, delay: i * 0.08 }}
          >
            <h4 className="font-bold text-orange-400 mb-1">{item.problem}</h4>
            <p className="text-gray-400 text-sm">{item.fix}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};


// ============================================================
// SECTION 9: FINAL CTA
// ============================================================
const FinalCTASection = () => (
  <section className="relative py-32 px-4 text-center overflow-hidden">
    <GradientOrb color="rgba(59, 130, 246, 0.3)" size={600} position={{ top: '-20%', left: '20%' }} delay={0} />
    <GradientOrb color="rgba(139, 92, 246, 0.25)" size={500} position={{ bottom: '-10%', right: '10%' }} delay={1.5} />

    <div className="max-w-3xl mx-auto relative z-10">
      <motion.h2
        className="text-4xl md:text-6xl font-black text-white mb-6"
        {...fadeInView}
      >
        Stop Reading.{" "}
        <span className="animated-gradient-text">Start Trading.</span>
      </motion.h2>

      <motion.p
        className="text-xl text-gray-400 mb-10"
        {...fadeInView}
        transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.2 }}
      >
        You&apos;ve read the tutorial. You know how it works. Now go put your money where your mouth is.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        {...fadeInView}
        transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.4 }}
      >
        <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-lg font-bold rounded-full button-pulse cta-shimmer">
            Launch App <ArrowUpRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
        <a href="/whitepaper">
          <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-10 py-5 text-lg rounded-full">
            Read the Whitepaper
          </Button>
        </a>
      </motion.div>
    </div>
  </section>
);


// ============================================================
// MAIN PAGE
// ============================================================
export default function Tutorial() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <LandingNavigation />
      <HeroSection />
      <AnimatedSeparator />
      <SetupSection />
      <AnimatedSeparator />
      <MintSection />
      <AnimatedSeparator />
      <TradeSection />
      <AnimatedSeparator />
      <PoolSection />
      <AnimatedSeparator />
      <ProTipsSection />
      <AnimatedSeparator />
      <ContractsSection />
      <AnimatedSeparator />
      <TroubleshootingSection />
      <AnimatedSeparator />
      <FinalCTASection />
    </div>
  );
}
