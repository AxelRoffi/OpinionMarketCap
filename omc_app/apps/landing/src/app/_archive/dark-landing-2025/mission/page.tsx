'use client'

import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Crown,
  Search,
  BarChart3,
  DollarSign,
  TrendingUp,
  Zap,
  Users,
  Palette,
  MessageCircle,
  Flame,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

// --- Reusable components (same patterns as landing page) ---

const GradientOrb = ({ color, size, position, delay = 0 }: { color: string, size: number, position: Record<string, string>, delay?: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none z-0"
    style={{
      width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(80px)",
      ...position
    }}
    animate={{
      x: [0, 30, -20, 0],
      y: [0, -20, 15, 0],
      scale: [1, 1.05, 0.95, 1]
    }}
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

// Animation props
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

// Animated counter
const AnimatedCounter = ({ end, duration = 2, prefix = "", suffix = "" }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ============================================================
// SECTION 1: HERO — "Why We Built This"
// ============================================================
const HeroSection = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
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
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden hero-mesh-bg min-h-[90vh] flex flex-col justify-center">
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
          <span className="text-white">The internet is full of opinions.</span>
          <br />
          <motion.span
            className="animated-gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            None of them cost anything.
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Anyone can post &ldquo;Salesforce is the best CRM&rdquo; on Reddit. Zero consequences if they&apos;re wrong. Zero reward if they&apos;re right.
        </motion.p>

        <motion.p
          className="text-xl md:text-2xl text-white font-bold max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          We built OMC to change that. Back it with money &mdash; or don&apos;t bother.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Button asChild size="lg" className="cta-shimmer button-pulse bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              Launch App
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            <a href="#the-insight">How It Works</a>
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 bounce-down"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <ChevronDown className="w-8 h-8 text-blue-400/60 mx-auto" />
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================
// SECTION 2: THE INSIGHT — "Google Guesses. We Prove."
// ============================================================
const InsightSection = () => {
  const platforms = [
    {
      name: "Google",
      icon: <Search className="w-8 h-8" />,
      verdict: "10 blue links ranked by an algorithm nobody understands.",
      flaw: "Best SEO wins. Not the best answer.",
      color: "text-gray-400",
      borderColor: "border-gray-700",
      bgColor: "bg-gray-800/30",
    },
    {
      name: "Polymarket",
      icon: <BarChart3 className="w-8 h-8" />,
      verdict: "Yes/no bets that expire when the event ends.",
      flaw: "~500 markets. Binary outcomes only.",
      color: "text-gray-400",
      borderColor: "border-gray-700",
      bgColor: "bg-gray-800/30",
    },
    {
      name: "OMC",
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      verdict: "Answers backed by real money. They never expire. They keep growing.",
      flaw: "The answer with the most money behind it wins.",
      color: "text-blue-400",
      borderColor: "border-blue-500/50",
      bgColor: "bg-blue-900/20",
      glow: true,
    },
  ];

  return (
    <Section id="the-insight">
      <GradientOrb color="rgba(59, 130, 246, 0.2)" size={400} position={{ top: '10%', right: '0%' }} delay={1} />
      <SectionTitle>Google Guesses. We Prove.</SectionTitle>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {platforms.map((p, i) => (
          <motion.div
            key={p.name}
            className={cn(
              "rounded-xl border p-8 relative",
              p.borderColor, p.bgColor,
              p.glow && "shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            )}
            {...scaleUpView}
            transition={{ ...scaleUpView.transition, delay: i * 0.15 }}
          >
            {p.glow && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                WINNER
              </div>
            )}
            <div className={cn("mb-4", p.color)}>{p.icon}</div>
            <h3 className={cn("text-2xl font-bold mb-3", p.glow ? "text-white" : "text-gray-300")}>{p.name}</h3>
            <p className={cn("text-lg mb-4", p.glow ? "text-gray-200" : "text-gray-400")}>{p.verdict}</p>
            <p className={cn("text-sm font-semibold", p.glow ? "text-blue-300" : "text-gray-500")}>{p.flaw}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center text-xl text-gray-300 max-w-3xl mx-auto"
        {...fadeInView}
      >
        Not the one with the best SEO. Not the one an algorithm picked. The one people put <span className="text-green-400 font-bold">real money</span> behind.
      </motion.p>
    </Section>
  );
};

// ============================================================
// SECTION 3: HOW THE MONEY FLOWS — "Everyone Eats"
// ============================================================
const MoneyFlowSection = () => {
  const roles = [
    {
      title: "Question Creator",
      icon: <Zap className="w-6 h-6" />,
      copy: "Mint a question. Every time someone trades an answer, you get 3% royalty. Forever. Not a month. Not a year. Forever.",
      accent: "from-green-500 to-emerald-500",
      borderColor: "border-l-green-500",
    },
    {
      title: "Answer Owner",
      icon: <DollarSign className="w-6 h-6" />,
      copy: "You own the current answer. Someone disagrees? They pay you to take it. You keep 95%.",
      accent: "from-blue-500 to-cyan-500",
      borderColor: "border-l-blue-500",
    },
    {
      title: "The Trader",
      icon: <TrendingUp className="w-6 h-6" />,
      copy: "Buy answers cheap before they blow up. Sell when someone wants it more. Same game, new arena.",
      accent: "from-purple-500 to-pink-500",
      borderColor: "border-l-purple-500",
    },
  ];

  const moneyBars = [
    { label: "Previous Answer Owner", amount: 190, percent: 95, color: "bg-green-500" },
    { label: "Question Creator", amount: 6, percent: 3, color: "bg-blue-500" },
    { label: "Platform", amount: 4, percent: 2, color: "bg-purple-500" },
  ];

  return (
    <Section>
      <GradientOrb color="rgba(16, 185, 129, 0.2)" size={400} position={{ bottom: '0%', left: '-5%' }} delay={1} />
      <SectionTitle>Everyone Eats</SectionTitle>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            className={cn("bg-gray-800/50 border-l-4 rounded-xl p-8", role.borderColor)}
            {...fadeInView}
            transition={{ ...fadeInView.transition, delay: i * 0.15 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
          >
            <div className={cn("w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center text-white mb-4", role.accent)}>
              {role.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
            <p className="text-gray-300 leading-relaxed">{role.copy}</p>
          </motion.div>
        ))}
      </div>

      {/* Money flow example */}
      <motion.div
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-2xl mx-auto"
        {...fadeInView}
      >
        <p className="text-gray-400 text-sm mb-2">Example trade</p>
        <p className="text-white font-bold text-lg mb-1">&ldquo;Best project management tool?&rdquo;</p>
        <p className="text-gray-300 mb-6">Someone pays <span className="text-green-400 font-bold">$200</span> to change the answer to &ldquo;Notion&rdquo;</p>

        <div className="space-y-4">
          {moneyBars.map((bar, i) => (
            <motion.div
              key={bar.label}
              className="space-y-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{bar.label} ({bar.percent}%)</span>
                <span className="text-white font-bold">${bar.amount}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", bar.color)}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bar.percent}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
};

// ============================================================
// SECTION 4: THE SCALE — "100 Million Markets. Day One."
// ============================================================
const ScaleSection = () => {
  const tickerItems = [
    { q: "Best CRM for startups?", price: "$342" },
    { q: "Top running shoes 2025?", price: "$178" },
    { q: "Most iconic watch brand?", price: "$1,240" },
    { q: "Best pizza in Brooklyn?", price: "$89" },
    { q: "Most effective skincare?", price: "$456" },
    { q: "Best L2 blockchain?", price: "$2,100" },
    { q: "Top AI coding tool?", price: "$670" },
    { q: "Best noise-canceling headphones?", price: "$234" },
    { q: "Most undervalued NFT project?", price: "$890" },
    { q: "Best coffee shop in Manhattan?", price: "$67" },
  ];

  return (
    <Section className="bg-gradient-to-b from-transparent via-blue-900/20 to-transparent">
      <GradientOrb color="rgba(139, 92, 246, 0.25)" size={500} position={{ top: '-10%', left: '30%' }} delay={0} />

      <SectionTitle>100 Million Markets. Day One.</SectionTitle>

      <div className="text-center mb-12">
        <motion.div
          className="text-6xl md:text-8xl font-black text-white mb-4"
          {...fadeInView}
        >
          <AnimatedCounter end={100000000} duration={3} suffix="+" />
        </motion.div>
        <motion.p className="text-gray-400 text-lg" {...fadeInView}>
          potential markets from Google Ads keywords alone
        </motion.p>
      </div>

      <motion.div
        className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        {...fadeInView}
      >
        <p className="text-lg text-gray-300">
          Google Ads has <span className="text-blue-400 font-bold">100+ million</span> keywords businesses pay to rank for.
          Every. Single. One. is an OMC market waiting to happen.
        </p>
        <p className="text-gray-400">
          &ldquo;Best CRM?&rdquo; &ldquo;Top running shoes?&rdquo; &ldquo;Most iconic watch brand?&rdquo;
        </p>
        <p className="text-xl text-white font-bold">
          Polymarket has ~500 markets. We have a hundred million.
        </p>
      </motion.div>

      {/* Auto-scrolling ticker */}
      <div className="relative overflow-hidden py-4">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10" />
        <motion.div
          className="flex gap-4 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 flex-shrink-0"
            >
              <span className="text-gray-300 text-sm">{item.q}</span>
              <span className="text-green-400 font-bold text-sm">{item.price}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 5: THE VISION — "Search is Broken"
// ============================================================
const VisionSection = () => {
  const eras = [
    {
      era: "Web 1.0",
      desc: "Yahoo tells you what to read. Editors decide what matters.",
      color: "text-gray-500",
      dotColor: "bg-gray-500",
      highlight: false,
    },
    {
      era: "Web 2.0",
      desc: "Google's algorithm decides what's \"true.\" Whoever pays the most ad money is #1.",
      color: "text-gray-400",
      dotColor: "bg-gray-400",
      highlight: false,
    },
    {
      era: "AI Era",
      desc: "ChatGPT makes it up. Sounds confident. Often wrong. Can't verify anything.",
      color: "text-gray-400",
      dotColor: "bg-purple-400",
      highlight: false,
    },
    {
      era: "OMC",
      desc: "The answer with the most money behind it wins. On-chain. Transparent. Verifiable.",
      color: "text-blue-400",
      dotColor: "bg-blue-500",
      highlight: true,
    },
  ];

  return (
    <Section>
      <GradientOrb color="rgba(59, 130, 246, 0.15)" size={400} position={{ top: '20%', right: '-5%' }} delay={2} />
      <SectionTitle>Search is Broken. We&apos;re Fixing It.</SectionTitle>

      <div className="max-w-2xl mx-auto relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-blue-500/50 to-blue-500" />

        <div className="space-y-12">
          {eras.map((e, i) => (
            <motion.div
              key={e.era}
              className="flex items-start gap-6 relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
            >
              {/* Dot */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10",
                e.highlight ? "bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "bg-gray-800 border border-gray-600"
              )}>
                <div className={cn("w-3 h-3 rounded-full", e.dotColor)} />
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1 rounded-xl p-6",
                e.highlight
                  ? "bg-blue-900/20 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "bg-gray-800/30 border border-gray-700/50"
              )}>
                <h3 className={cn(
                  "text-xl font-bold mb-2",
                  e.highlight ? "text-blue-400" : e.color
                )}>
                  {e.era}
                  {e.highlight && (
                    <motion.span
                      className="ml-2 text-yellow-400 text-sm"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      NOW
                    </motion.span>
                  )}
                </h3>
                <p className={cn(
                  "leading-relaxed",
                  e.highlight ? "text-gray-200 font-medium" : "text-gray-400"
                )}>{e.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 6: WHO'S PLAYING — "Real Use Cases"
// ============================================================
const UseCasesSection = () => {
  const cases = [
    {
      emoji: <Palette className="w-8 h-8" />,
      title: "Brands",
      copy: "Luxury houses fighting for 'Most prestigious watch?' This is advertising with skin in the game.",
      gradient: "from-pink-500/20 to-purple-500/20",
      hoverGlow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    },
    {
      emoji: <Users className="w-8 h-8" />,
      title: "Communities",
      copy: "Crypto Twitter pooling money on 'Best L2?' Put your bags where your mouth is.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      hoverGlow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    },
    {
      emoji: <MessageCircle className="w-8 h-8" />,
      title: "Creators",
      copy: "Mint questions. Earn royalties every time someone trades an answer. Forever. The first question marketplace.",
      gradient: "from-green-500/20 to-emerald-500/20",
      hoverGlow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    },
    {
      emoji: <Flame className="w-8 h-8" />,
      title: "Degens",
      copy: "Buy answers cheap. Wait for someone to disagree. Collect. You know the drill.",
      gradient: "from-orange-500/20 to-red-500/20",
      hoverGlow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]",
    },
  ];

  return (
    <Section>
      <GradientOrb color="rgba(139, 92, 246, 0.15)" size={400} position={{ bottom: '10%', left: '0%' }} delay={1} />
      <SectionTitle>Who&apos;s Already Playing?</SectionTitle>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            className={cn(
              "bg-gradient-to-br border border-gray-700 rounded-xl p-8 transition-all duration-300 cursor-default",
              c.gradient, c.hoverGlow
            )}
            {...scaleUpView}
            transition={{ ...scaleUpView.transition, delay: i * 0.12 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="text-white mb-4">{c.emoji}</div>
            <h3 className="text-xl font-bold text-white mb-3">{c.title}</h3>
            <p className="text-gray-300 leading-relaxed">{c.copy}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 7: FINAL CTA — "Stop Talking. Start Trading."
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

      {/* Particles */}
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
          Stop Talking. Start Trading.
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 mb-10"
          {...fadeInView}
        >
          Your opinion is worthless until there&apos;s money on it.
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
            <a href="/whitepaper">Read the Whitepaper</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================
export default function Mission() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <LandingNavigation />
      <HeroSection />
      <AnimatedSeparator />
      <InsightSection />
      <AnimatedSeparator />
      <MoneyFlowSection />
      <AnimatedSeparator />
      <ScaleSection />
      <AnimatedSeparator />
      <VisionSection />
      <AnimatedSeparator />
      <UseCasesSection />
      <AnimatedSeparator />
      <FinalCTASection />
    </div>
  );
}
