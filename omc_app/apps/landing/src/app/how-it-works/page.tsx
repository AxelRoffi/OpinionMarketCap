'use client'

import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Zap,
  DollarSign,
  TrendingUp,
  Target,
  Crown,
  Users,
  Shield,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

// --- Reusable components (same as landing + mission pages) ---

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
            key={`p-${p.id}`}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ x: `${p.x}vw`, y: `${p.yStart}vh`, opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0], y: [`${p.yStart}vh`, `${p.yEnd}vh`] }}
            transition={{ duration: p.duration, repeat: Infinity, repeatType: "loop", ease: "linear", delay: p.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-7xl font-black mb-8 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="text-white">Three steps.</span>
          <br />
          <motion.span
            className="animated-gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            That&apos;s it.
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Create a question. Own an answer. Get paid when someone disagrees. No PhD in crypto required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            <a href="#step-1">Show Me</a>
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 bounce-down"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <ChevronDown className="w-8 h-8 text-blue-400/60 mx-auto" />
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================
// SECTION 2: THE THREE STEPS
// ============================================================
const StepsSection = () => {
  const steps = [
    {
      number: "01",
      title: "Ask a Question",
      subtitle: "Mint it. Own it. Earn from it.",
      copy: "Think of a question people argue about. \"Best CRM for startups?\" \"Most overrated sneaker brand?\" \"Best pizza in New York?\" Mint it on OMC. You just created a market.",
      detail: "Set your first answer and an initial price (1-100 USDC). The creation fee is 20% of that price. Now you own the question — and you'll earn 3% royalty on every single trade. Forever.",
      example: { label: "You mint:", question: "\"Best CRM for startups?\"", answer: "Your answer: \"HubSpot\"", price: "Starting price: $10 USDC" },
      icon: <Target className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-l-blue-500",
    },
    {
      number: "02",
      title: "Someone Disagrees",
      subtitle: "They pay you to prove it.",
      copy: "Someone thinks \"Salesforce\" is better? They can't just tweet about it. They have to pay more than the current price to take ownership. The price goes up with every trade.",
      detail: "When someone submits a new answer, 95% of what they pay goes to the previous answer owner. That's you. The other 5% splits between the question creator (3%) and the platform (2%).",
      example: { label: "A trader pays:", question: "New answer: \"Salesforce\"", answer: "They pay: $15 USDC", price: "You receive: $14.25 (95%)" },
      icon: <RefreshCw className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      borderColor: "border-l-green-500",
    },
    {
      number: "03",
      title: "Everyone Gets Paid",
      subtitle: "95% stays in the community.",
      copy: "Every trade distributes money instantly. No waiting. No middleman. Smart contracts handle everything on Base blockchain. The question creator earns royalties on every future trade. Forever.",
      detail: "Prices go up as more people trade. Early buyers get better prices. Late buyers pay more — but they also earn more when the next person disagrees. It's a market.",
      example: { label: "After 20 trades:", question: "Question creator earned: $18 in royalties", answer: "Current answer price: $120 USDC", price: "Total volume: $600 USDC" },
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-l-purple-500",
    },
  ];

  return (
    <Section id="step-1">
      <GradientOrb color="rgba(59, 130, 246, 0.2)" size={400} position={{ top: '5%', right: '-5%' }} delay={1} />
      <GradientOrb color="rgba(16, 185, 129, 0.15)" size={350} position={{ bottom: '10%', left: '-5%' }} delay={3} />

      <SectionTitle>How It Actually Works</SectionTitle>

      <div className="space-y-20">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="grid md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Left: copy */}
            <div className={cn(i % 2 === 1 && "md:order-2")}>
              <motion.div
                className="text-7xl font-black text-gray-800 mb-4"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
              >
                {step.number}
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-blue-400 font-semibold mb-4">{step.subtitle}</p>
              <p className="text-gray-300 leading-relaxed mb-4">{step.copy}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{step.detail}</p>
            </div>

            {/* Right: example card */}
            <div className={cn(i % 2 === 1 && "md:order-1")}>
              <motion.div
                className={cn("bg-gray-800/50 border-l-4 rounded-xl p-8", step.borderColor)}
                {...scaleUpView}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <div className={cn("w-14 h-14 rounded-full bg-gradient-to-r flex items-center justify-center text-white mb-6", step.color)}>
                  {step.icon}
                </div>
                <p className="text-gray-400 text-sm mb-3">{step.example.label}</p>
                <p className="text-white font-bold text-lg mb-1">{step.example.question}</p>
                <p className="text-gray-300 mb-1">{step.example.answer}</p>
                <p className="text-green-400 font-bold">{step.example.price}</p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 3: LIVE TRADE WALKTHROUGH
// ============================================================
const TradeWalkthrough = () => {
  const [step, setStep] = useState(0);

  const stages = [
    { label: "Question minted", question: "\"Best project management tool?\"", answer: "Notion", price: 10, owner: "alice.base.eth", action: "Alice creates the question" },
    { label: "First trade", question: "\"Best project management tool?\"", answer: "Monday.com", price: 18, owner: "bob.base.eth", action: "Bob disagrees — pays $18" },
    { label: "Price climbs", question: "\"Best project management tool?\"", answer: "Asana", price: 29, owner: "carol.base.eth", action: "Carol jumps in — pays $29" },
    { label: "Big move", question: "\"Best project management tool?\"", answer: "Linear", price: 52, owner: "dave.base.eth", action: "Dave bets on Linear — pays $52" },
  ];

  const current = stages[step];

  const moneyFlow = step > 0 ? {
    owner: Math.round(current.price * 0.95 * 100) / 100,
    creator: Math.round(current.price * 0.03 * 100) / 100,
    platform: Math.round(current.price * 0.02 * 100) / 100,
  } : null;

  return (
    <Section className="bg-gradient-to-b from-transparent via-blue-900/20 to-transparent">
      <GradientOrb color="rgba(139, 92, 246, 0.2)" size={400} position={{ top: '0%', left: '20%' }} delay={0} />

      <SectionTitle>Watch a Trade Happen</SectionTitle>

      <div className="max-w-3xl mx-auto">
        <motion.div
          className="bg-gray-800/60 border border-gray-700 rounded-xl p-8 mb-8"
          {...fadeInView}
        >
          {/* Current state */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-400">Step {step + 1} of {stages.length}</span>
            <span className="text-sm text-blue-400 font-medium">{current.label}</span>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-gray-400 text-sm mb-1">{current.action}</p>
            <h3 className="text-xl font-bold text-white mb-4">{current.question}</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Current Answer</p>
                <p className="text-white font-bold">{current.answer}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Price</p>
                <p className="text-green-400 font-bold">${current.price} USDC</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Owner</p>
                <p className="text-blue-400 font-bold text-sm">{current.owner}</p>
              </div>
            </div>

            {/* Money flow for trades */}
            {moneyFlow && (
              <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                <p className="text-green-400 text-sm font-semibold mb-2">Money distributed instantly:</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Previous owner: <span className="text-green-400 font-bold">${moneyFlow.owner}</span></span>
                  <span className="text-gray-300">Creator: <span className="text-blue-400 font-bold">${moneyFlow.creator}</span></span>
                  <span className="text-gray-300">Platform: <span className="text-purple-400 font-bold">${moneyFlow.platform}</span></span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Price bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>$10</span>
              <span>$52</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                animate={{ width: `${((current.price - 10) / 42) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-center gap-3">
          {stages.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "w-12 h-12 rounded-full font-bold text-sm transition-all duration-300",
                step === i
                  ? "bg-blue-600 text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 4: THE ROLES — Who Makes Money?
// ============================================================
const RolesSection = () => {
  const roles = [
    {
      icon: <Crown className="w-7 h-7" />,
      title: "Question Creators",
      tagline: "Mint once. Earn forever.",
      copy: "You spot a question people will argue about. You mint it. Every single time someone trades an answer — this week, next year, a decade from now — you get 3%. That's passive income on human disagreement.",
      stat: "3% royalty on every trade",
      color: "from-yellow-500 to-orange-500",
      borderColor: "border-l-yellow-500",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Answer Owners",
      tagline: "Get paid to be right.",
      copy: "You own the current answer. You believe it's correct. If nobody disagrees, you hold. When someone does disagree, they pay you 95% of the new price to take ownership. You profit either way.",
      stat: "95% of every incoming trade",
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-l-blue-500",
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Traders",
      tagline: "Buy the dip. Sell the conviction.",
      copy: "You see an answer priced at $15 that should be at $100. You buy it. You wait. Someone with deeper conviction comes along and pays you to take it. Classic buy low, sell high.",
      stat: "95% profit on every flip",
      color: "from-green-500 to-emerald-500",
      borderColor: "border-l-green-500",
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Pool Members",
      tagline: "Team up. Split the wins.",
      copy: "Can't afford a $200 answer alone? Pool with others. Contribute what you can. If the pool hits its target, rewards get distributed based on your share. Collective conviction, individual profit.",
      stat: "Proportional pool rewards",
      color: "from-purple-500 to-pink-500",
      borderColor: "border-l-purple-500",
    },
  ];

  return (
    <Section>
      <GradientOrb color="rgba(234, 179, 8, 0.15)" size={400} position={{ top: '10%', right: '-5%' }} delay={2} />

      <SectionTitle>Who Makes Money?</SectionTitle>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            className={cn("bg-gray-800/50 border-l-4 rounded-xl p-8", role.borderColor)}
            {...scaleUpView}
            transition={{ ...scaleUpView.transition, delay: i * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
          >
            <div className={cn("w-14 h-14 rounded-full bg-gradient-to-r flex items-center justify-center text-white mb-4", role.color)}>
              {role.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
            <p className="text-blue-400 font-semibold text-sm mb-3">{role.tagline}</p>
            <p className="text-gray-300 leading-relaxed mb-4">{role.copy}</p>
            <div className="bg-gray-700/50 rounded-lg px-4 py-2 inline-block">
              <span className="text-green-400 font-bold text-sm">{role.stat}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 5: WHY IT WORKS
// ============================================================
const WhyItWorks = () => {
  const reasons = [
    {
      title: "Skin in the game",
      copy: "Anybody can post an opinion on Reddit for free. On OMC, your opinion costs money. That filter alone makes answers 10x more valuable.",
    },
    {
      title: "Prices don't lie",
      copy: "The most-backed answer isn't the loudest — it's the one with the most money behind it. Markets are the best truth machines ever invented.",
    },
    {
      title: "Everyone profits",
      copy: "98% of every dollar stays in the community. Question creators, answer owners, traders — everyone eats. The platform takes just 2%.",
    },
    {
      title: "No expiration",
      copy: "Unlike prediction markets, OMC questions never resolve. \"Best CRM\" will be debated forever. Your royalties compound forever.",
    },
  ];

  return (
    <Section>
      <GradientOrb color="rgba(59, 130, 246, 0.15)" size={350} position={{ bottom: '10%', left: '5%' }} delay={1} />

      <SectionTitle>Why This Works</SectionTitle>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {reasons.map((r, i) => (
          <motion.div
            key={r.title}
            className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ borderColor: "rgba(59, 130, 246, 0.3)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">{r.title}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{r.copy}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 6: FINAL CTA
// ============================================================
const FinalCTASection = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: ((i * 13 + 5) % 100),
    yStart: 100 + (i % 3) * 10,
    yEnd: -10 - (i % 4) * 5,
    duration: 6 + (i % 5),
    delay: (i * 0.5) % 4,
    size: 1 + (i % 2),
    color: ['#3b82f6', '#8b5cf6', '#60a5fa'][i % 3],
  }));

  return (
    <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-transparent via-blue-900/30 to-transparent">
      <GradientOrb color="rgba(59, 130, 246, 0.3)" size={500} position={{ top: '20%', left: '30%' }} delay={0} />

      <div className="absolute inset-0 z-0">
        {particles.map((p) => (
          <motion.div
            key={`cta-p-${p.id}`}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ x: `${p.x}vw`, y: `${p.yStart}vh`, opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], y: [`${p.yStart}%`, `${p.yEnd}%`] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
          />
        ))}
      </div>

      <div className="text-center relative z-10 max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow"
          {...fadeInView}
        >
          Simple enough?
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 mb-10"
          {...fadeInView}
        >
          Create a question. Trade an answer. Get paid when someone disagrees. That&apos;s the whole game.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeInView}
        >
          <Button asChild size="lg" className="cta-shimmer button-pulse bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              Put Your Money Where Your Mouth Is
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            <a href="/tutorial">Take the Tutorial</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <LandingNavigation />
      <HeroSection />
      <AnimatedSeparator />
      <StepsSection />
      <AnimatedSeparator />
      <TradeWalkthrough />
      <AnimatedSeparator />
      <RolesSection />
      <AnimatedSeparator />
      <WhyItWorks />
      <AnimatedSeparator />
      <FinalCTASection />
    </div>
  );
}
