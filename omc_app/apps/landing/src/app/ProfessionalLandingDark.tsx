'use client'

import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  DollarSign,
  Target,
  CheckCircle,
  TrendingUp,
  Shield,
  Globe,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Flame,
  Activity,
  BarChart3,
  Twitter,
  MessageCircle,
  Copy,
  ArrowUpRight,
  ArrowRight,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

// Share functionality
const shareOnTwitter = (text: string, url: string) => {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
};

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

// Animated counter component
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

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// --- Gradient Orb Component ---
const GradientOrb = ({ color, size, position, delay = 0 }: {
  color: string, size: number, position: React.CSSProperties, delay?: number
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(80px)",
      opacity: 0.15,
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

// --- Animated Separator ---
const AnimatedSeparator = () => (
  <div className="relative h-px max-w-4xl mx-auto overflow-hidden my-2">
    <motion.div
      className="absolute inset-0 h-px"
      style={{ background: "linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #3b82f6, transparent)" }}
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    <div className="absolute inset-0 h-px bg-gray-800/60" />
  </div>
);

// --- Animation Props (spread onto motion elements) ---
const fadeInView = {
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.8, ease: "easeOut" as const }
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

const scaleUpView = {
  initial: { opacity: 0, scale: 0.8 } as const,
  whileInView: { opacity: 1, scale: 1 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }
};

// Variant-based stagger for lists (parent must be motion element with initial/whileInView)
const staggerChildren = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } }
};
const fadeInChild = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 }
};
const fadeInChildRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 }
};

// --- Reusable Components ---
const Section = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section
    id={id}
    className={cn("py-24 px-4 relative overflow-hidden", className)}
  >
    <div className="max-w-6xl mx-auto relative z-10">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.h2
    className={cn("text-4xl md:text-5xl font-bold text-center mb-20 animated-gradient-text", className)}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{
      scale: 1.05,
      textShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
    }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {children}
  </motion.h2>
);

// --- Live Stats ---
const useLiveStats = () => {
  const [stats, setStats] = useState({
    activeOpinions: 47,
    totalVolume: 12847,
    tradesToday: 156,
    activeTraders: 89
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tradesToday: prev.tradesToday + Math.floor(Math.random() * 3),
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 50)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

const LiveStatsBar = () => {
  const stats = useLiveStats();

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {[
        { icon: <Activity className="w-4 h-4 text-green-400" />, label: "Active Opinions:", value: <AnimatedCounter end={stats.activeOpinions} />, color: "text-white", borderHover: "rgba(59, 130, 246, 0.5)", dot: true },
        { icon: <DollarSign className="w-4 h-4 text-green-400" />, label: "Total Volume:", value: <><span>$</span><AnimatedCounter end={stats.totalVolume} suffix=" USDC" /></>, color: "text-green-400", borderHover: "rgba(34, 197, 94, 0.5)" },
        { icon: <Flame className="w-4 h-4 text-orange-400" />, label: "Trades Today:", value: <AnimatedCounter end={stats.tradesToday} />, color: "text-orange-400", borderHover: "rgba(147, 51, 234, 0.5)" },
        { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Active Traders:", value: <AnimatedCounter end={stats.activeTraders} />, color: "text-blue-400", borderHover: "rgba(59, 130, 246, 0.5)" }
      ].map((stat, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2"
          whileHover={{ scale: 1.05, borderColor: stat.borderHover }}
        >
          {stat.icon}
          <span className="text-gray-400 text-sm">{stat.label}</span>
          <span className={cn("font-bold", stat.color)}>{stat.value}</span>
          {stat.dot && (
            <motion.span
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============================================================
// SECTION 1: HERO - Upgraded with bigger particles, gradient orbs, pulsing CTA
// ============================================================
const HeroSection = () => {
  // Upgraded particles: 60 total, mix of small + larger "star" particles, some drift horizontally
  const particles = Array.from({ length: 60 }, (_, i) => {
    const isStar = i < 8; // First 8 are larger "star" particles
    const driftsHorizontal = i >= 8 && i < 20; // Next 12 drift horizontally
    return {
      id: i,
      x: ((i * 7 + 3) % 100),
      yStart: ((i * 11 + 5) % 100),
      yEnd: ((i * 19 + 7) % 100),
      xEnd: driftsHorizontal ? ((i * 23) % 80) + 10 : ((i * 7 + 3) % 100),
      duration: isStar ? 5 + (i % 4) : 8 + (i % 8),
      delay: (i * 0.3) % 6,
      size: isStar ? 4 + (i % 5) : 1 + (i % 3),
      opacity: isStar ? 0.8 : 0.5,
      color: ['#3b82f6', '#8b5cf6', '#10b981', '#60a5fa', '#a855f7', '#818cf8', '#34d399'][i % 7],
      driftsHorizontal,
    };
  });

  return (
    <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden hero-mesh-bg">
      {/* Gradient orbs */}
      <GradientOrb color="rgba(59, 130, 246, 0.4)" size={600} position={{ top: '-10%', right: '-5%' }} delay={0} />
      <GradientOrb color="rgba(139, 92, 246, 0.3)" size={500} position={{ bottom: '0%', left: '-10%' }} delay={2} />
      <GradientOrb color="rgba(16, 185, 129, 0.15)" size={400} position={{ top: '30%', left: '40%' }} delay={4} />

      {/* Rotating glow ring behind title */}
      <div
        className="absolute top-1/3 left-1/2 glow-ring pointer-events-none z-0"
        style={{
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15), transparent, rgba(59,130,246,0.1), transparent, rgba(139,92,246,0.1), rgba(59,130,246,0.15))',
          filter: 'blur(40px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Upgraded particles */}
      <div className="absolute inset-0 z-0">
        {particles.map((p) => (
          <motion.div
            key={`particle-${p.id}`}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: p.size >= 4 ? `0 0 ${p.size * 2}px ${p.color}` : 'none'
            }}
            initial={{ x: `${p.x}vw`, y: `${p.yStart}vh`, opacity: 0 }}
            animate={p.driftsHorizontal
              ? { opacity: [0, p.opacity, 0], x: [`${p.x}vw`, `${p.xEnd}vw`], y: [`${p.yStart}vh`, `${p.yEnd}vh`] }
              : { opacity: [0, p.opacity, 0], y: [`${p.yStart}vh`, `${p.yEnd}vh`] }
            }
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Dramatic title: each word slides from different direction */}
        <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ cursor: "default" }}>
          <motion.span
            className="inline-block text-white"
            initial={{ opacity: 0, x: -80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <motion.span
              animate={{
                opacity: [0.7, 1, 0.7],
                textShadow: [
                  "0 0 0px rgba(255, 255, 255, 0)",
                  "0 0 20px rgba(255, 255, 255, 0.4)",
                  "0 0 0px rgba(255, 255, 255, 0)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >OPINION</motion.span>
          </motion.span>
          <motion.span
            className="inline-block text-blue-400"
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <motion.span
              animate={{
                color: ["#60a5fa", "#3b82f6", "#1d4ed8", "#3b82f6", "#60a5fa"],
                textShadow: [
                  "0 0 0px rgba(59, 130, 246, 0)",
                  "0 0 30px rgba(59, 130, 246, 0.6)",
                  "0 0 0px rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >{" "}MARKET</motion.span>
          </motion.span>
          <motion.span
            className="inline-block text-white"
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <motion.span
              animate={{
                opacity: [1, 0.8, 1],
                textShadow: [
                  "0 0 0px rgba(255, 255, 255, 0)",
                  "0 0 20px rgba(255, 255, 255, 0.5)",
                  "0 0 0px rgba(255, 255, 255, 0)"
                ]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >{" "}CAP</motion.span>
          </motion.span>
        </h1>

        {/* Tagline with underline sweep on "Yours isn't" */}
        <motion.p
          className="text-2xl md:text-3xl font-black mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
        >
          <span className="text-white">Opinions are free. </span>
          <span className="relative inline-block">
            <span className="animated-gradient-text">Yours isn&apos;t.</span>
            <span
              className="absolute bottom-0 left-0 w-full h-[3px] underline-sweep rounded-full"
              style={{ background: 'linear-gradient(-45deg, #60A5FA, #A855F7, #34D399, #FBBF24)' }}
            />
          </span>
        </motion.p>
        <motion.p
          className="text-lg md:text-xl text-gray-300 font-medium mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85 }}
        >
          Back your opinion with real money. Get paid when someone disagrees.
        </motion.p>

        <LiveStatsBar />

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center my-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}
        >
          {/* Pulsing + shimmer CTA button */}
          <Button asChild size="lg" className="cta-shimmer button-pulse bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              Put Your Money Where Your Mouth Is
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </motion.div>

        <motion.div
          className="inline-flex items-center justify-center py-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <motion.p
            className="text-blue-300 font-semibold tracking-widest text-2xl md:text-3xl text-glow"
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            OMC IS BASE BASED
          </motion.p>
        </motion.div>

        {/* Share CTA */}
        <motion.div
          className="flex justify-center gap-4 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={() => shareOnTwitter("Opinions are free. Mine isn't. Put your money where your mouth is on @OpinionMarketCap", "https://opinionmarketcap.xyz")}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </button>
        </motion.div>

        {/* Bouncing down arrow */}
        <motion.div
          className="mt-12 bounce-down"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ChevronDown className="w-8 h-8 text-blue-400/60 mx-auto" />
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================
// SECTION 2: THE DARE - Red/blue glow, staggered bullets, VS divider
// ============================================================
const TheDareSection = () => (
  <Section className="bg-gray-800/50">
    {/* Background orbs for contrast */}
    <GradientOrb color="rgba(239, 68, 68, 0.3)" size={400} position={{ top: '10%', left: '-5%' }} delay={0} />
    <GradientOrb color="rgba(59, 130, 246, 0.3)" size={400} position={{ top: '10%', right: '-5%' }} delay={1.5} />

    <SectionTitle>Everyone Has Opinions. Few Back Them Up.</SectionTitle>
    <div className="grid md:grid-cols-2 gap-16 items-start relative">
      {/* Left column - slides from left */}
      <motion.div {...slideLeftView}>
        <motion.h3
          className="text-2xl font-bold text-red-400 mb-8"
          animate={{ color: ["#f87171", "#ef4444", "#f87171"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          Talk is Cheap
        </motion.h3>
        <motion.ul className="space-y-5 text-lg text-gray-300" variants={staggerChildren} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {[
            "Crypto Twitter debates that go nowhere",
            "Reddit threads with 10,000 comments and zero stakes",
            "AI-generated hot takes with no skin in the game",
            "Influencers who shill without consequence"
          ].map((text, i) => (
            <motion.li
              key={i}
              className="flex items-start"
              variants={fadeInChild}
            >
              <XCircle className="text-red-400 mr-3 mt-1 flex-shrink-0 w-5 h-5" />
              {text}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      {/* VS divider for mobile */}
      <div className="md:hidden flex justify-center -my-8">
        <motion.div
          className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 10px rgba(59, 130, 246, 0.3)",
              "0 0 25px rgba(139, 92, 246, 0.5)",
              "0 0 10px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white font-bold text-sm">VS</span>
        </motion.div>
      </div>

      {/* Right column - slides from right, with animated border */}
      <motion.div
        {...slideRightView}
        className="relative p-[2px] rounded-xl overflow-hidden"
      >
        {/* Rotating gradient border */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6, #8b5cf6, #3b82f6)",
            borderRadius: "0.75rem"
          }}
        />
        <div className="relative bg-gray-800 rounded-xl p-8">
          <motion.h3
            className="text-2xl font-bold text-blue-400 mb-8"
            animate={{ color: ["#60a5fa", "#3b82f6", "#60a5fa"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            OMC is Proof
          </motion.h3>
          <motion.ul className="space-y-5 text-lg text-gray-300" variants={staggerChildren} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {[
              "Your opinion has a price tag",
              "Disagree? Pay up.",
              "95% goes to the person you're replacing",
              "The market decides who's right"
            ].map((text, i) => (
              <motion.li
                key={i}
                className="flex items-start"
                variants={fadeInChildRight}
              >
                <CheckCircle className="text-blue-400 mr-3 mt-1 flex-shrink-0 w-5 h-5" />
                {text}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </div>
  </Section>
);

// ============================================================
// SECTION 3: HOW IT WORKS + MONEY FLOW - Step numbers, connecting arrows, animated bars
// ============================================================
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Target />,
      num: "01",
      title: "Mint a Question",
      description: "Create any question. Set the first answer. Earn 3% royalties on every future trade. Forever.",
      bgColor: "bg-red-900/30",
      borderColor: "border-red-400/30",
      iconColor: "text-red-400",
      glowColor: "rgba(239, 68, 68, 0.3)"
    },
    {
      icon: <TrendingUp />,
      num: "02",
      title: "Trade the Answer",
      description: "See a wrong answer? Pay to replace it. If someone replaces yours, you get 95% of what they paid.",
      bgColor: "bg-green-900/30",
      borderColor: "border-green-400/30",
      iconColor: "text-green-400",
      glowColor: "rgba(34, 197, 94, 0.3)"
    },
    {
      icon: <Users />,
      num: "03",
      title: "Pool Your Power",
      description: "Team up with others to collectively take over expensive answers. Split the rewards.",
      bgColor: "bg-purple-900/30",
      borderColor: "border-purple-400/30",
      iconColor: "text-purple-400",
      glowColor: "rgba(139, 92, 246, 0.3)"
    }
  ];

  const moneyFlowItems = [
    { label: "Previous Answer Owner", amount: 95, color: "green", prefix: "$" },
    { label: "Question Creator (royalties forever)", amount: 3, color: "blue", prefix: "$" },
    { label: "Platform", amount: 2, color: "purple", prefix: "$" }
  ];

  const colorMap: Record<string, { bg: string, text: string, bar: string }> = {
    green: { bg: "bg-green-900/20", text: "text-green-400", bar: "bg-green-500" },
    blue: { bg: "bg-blue-900/20", text: "text-blue-400", bar: "bg-blue-500" },
    purple: { bg: "bg-purple-900/20", text: "text-purple-400", bar: "bg-purple-500" }
  };

  return (
    <Section id="how-it-works">
      <GradientOrb color="rgba(34, 197, 94, 0.2)" size={500} position={{ top: '20%', left: '30%' }} delay={0} />

      <SectionTitle>Three Ways to Profit</SectionTitle>

      <div className="grid md:grid-cols-3 gap-8 mb-16 relative">
        {/* Connecting arrows (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0">
          <motion.div
            className="h-0.5 mx-24"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4), transparent)" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        </div>

        {steps.map((step, index) => (
          <motion.div
            key={index}
            {...scaleUpView}
            className="relative text-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 z-10"
            whileHover={{
              scale: 1.05,
              borderColor: step.glowColor,
              boxShadow: `0 10px 40px ${step.glowColor}`
            }}
          >
            {/* Large step number */}
            <motion.div
              className="absolute -top-4 -left-2 text-6xl font-black text-white/5"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
              {step.num}
            </motion.div>

            <motion.div
              className={`w-16 h-16 ${step.bgColor} ${step.borderColor} rounded-full flex items-center justify-center mx-auto mb-6`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className={step.iconColor}>{step.icon}</div>
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
            <p className="text-gray-300">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Inline Money Flow with animated bars */}
      <motion.div
        className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-8 max-w-lg mx-auto"
        {...fadeInView}
        whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.3)" }}
      >
        <motion.h4
          className="text-xl font-semibold text-white mb-6 text-center"
          animate={{
            textShadow: [
              "0 0 0px rgba(255, 255, 255, 0)",
              "0 0 10px rgba(255, 255, 255, 0.3)",
              "0 0 0px rgba(255, 255, 255, 0)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          Per $100 Trade
        </motion.h4>
        <div className="space-y-4">
          {moneyFlowItems.map((item, i) => {
            const colors = colorMap[item.color];
            return (
              <motion.div
                key={i}
                className={`p-3 rounded-lg ${colors.bg}`}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`${colors.text} font-medium`}>{item.label}</span>
                  <span className={`font-bold ${colors.text} text-lg`}>
                    <AnimatedCounter end={item.amount} prefix={item.prefix} duration={1.5} />
                  </span>
                </div>
                {/* Animated bar */}
                <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${colors.bar} rounded-full`}
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${item.amount}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Section>
  );
};

// ============================================================
// SECTION 4: TRENDING NOW - Gradient borders, price pulse, LIVE glow
// ============================================================
const trendingOpinions = [
  { id: 1, question: "Best Layer 2 for DeFi?", currentAnswer: "Arbitrum", price: 45.20, trades: 23, trend: "up", category: "Crypto" },
  { id: 2, question: "GOAT of Basketball?", currentAnswer: "Michael Jordan", price: 78.50, trades: 67, trend: "up", category: "Sports" },
  { id: 3, question: "Best Pizza in NYC?", currentAnswer: "Di Fara Pizza", price: 23.10, trades: 18, trend: "down", category: "Food" },
  { id: 4, question: "Most Overrated Tech Company?", currentAnswer: "Apple", price: 52.80, trades: 41, trend: "up", category: "Tech" },
  { id: 5, question: "Best Anime of All Time?", currentAnswer: "Attack on Titan", price: 31.40, trades: 34, trend: "up", category: "Entertainment" }
];

const TrendingOpinionsSection = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (id: number) => {
    await copyToClipboard(`https://app.opinionmarketcap.xyz/opinion/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Section className="bg-gray-800/30">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Flame className="w-8 h-8 text-orange-500" />
        <SectionTitle className="mb-0">Live Opinions. Real Money.</SectionTitle>
        <motion.span
          className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 5px rgba(249, 115, 22, 0.3)",
              "0 0 20px rgba(249, 115, 22, 0.6)",
              "0 0 5px rgba(249, 115, 22, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          LIVE
        </motion.span>
      </div>
      <p className="text-center text-gray-400 mb-12">These takes are being traded right now</p>

      <div className="space-y-4 max-w-4xl mx-auto">
        {trendingOpinions.map((opinion, index) => (
          <motion.div
            key={opinion.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 transition-all group"
            whileHover={{
              y: -8,
              borderColor: "rgba(59, 130, 246, 0.4)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)"
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                    {opinion.category}
                  </span>
                  {opinion.trend === "up" ? (
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                    </motion.div>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{opinion.question}</h4>
                <p className="text-gray-400">
                  Current Answer: <span className="text-blue-400 font-medium">{opinion.currentAnswer}</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-xl price-pulse">${opinion.price.toFixed(2)}</div>
                  <div className="text-gray-500 text-xs">Next Price</div>
                </div>

                <div className="text-center">
                  <div className="text-white font-semibold">{opinion.trades}</div>
                  <div className="text-gray-500 text-xs">Trades 24h</div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://app.opinionmarketcap.xyz/opinion/${opinion.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  >
                    Challenge This
                  </a>

                  <button
                    onClick={() => shareOnTwitter(
                      `The current answer to "${opinion.question}" is ${opinion.currentAnswer}. Think you know better? Put your money where your mouth is on @OpinionMarketCap`,
                      `https://app.opinionmarketcap.xyz/opinion/${opinion.id}`
                    )}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                    title="Share on X"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopy(opinion.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="Copy link"
                  >
                    {copiedId === opinion.id ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="text-center mt-8" whileHover={{ scale: 1.05 }}>
        <a
          href="https://app.opinionmarketcap.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold"
        >
          View All Opinions
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>
    </Section>
  );
};

// ============================================================
// SECTION 5: TESTIMONIALS - Gradient border, profit glow, decorative quotes
// ============================================================
const testimonials = [
  {
    quote: "Someone paid $47 to disagree with my take on 'Best Layer 2'. I pocketed $44.65. Being wrong never felt so good.",
    author: "0x7d3...8f2a",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234ade80'/%3E%3C/svg%3E",
    profit: "+$200",
    category: "Crypto"
  },
  {
    quote: "I minted 'GOAT of Soccer?' for $5. It's been flipped 67 times. I've earned $180 in royalties just from people arguing.",
    author: "soccerfan.eth",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2360a5fa'/%3E%3C/svg%3E",
    profit: "+$450",
    category: "Sports"
  },
  {
    quote: "Put $23 on 'Best Pizza in NYC'. Someone disagreed 2 hours later. I made $21.85 for having a pizza opinion.",
    author: "foodie_nyc",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f472b6'/%3E%3C/svg%3E",
    profit: "+$180",
    category: "Food"
  },
  {
    quote: "Our pool of 8 people took over the 'Best DEX' answer. When someone challenged us, we all split $320.",
    author: "defi_maxi.eth",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23a855f7'/%3E%3C/svg%3E",
    profit: "+$320",
    category: "DeFi"
  },
  {
    quote: "My 'Best coffee in Austin' question generates $50/week in royalties. Turns out people really argue about coffee.",
    author: "austin_local",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23fbbf24'/%3E%3C/svg%3E",
    profit: "+$200/mo",
    category: "Local"
  }
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => setCurrentIndex(index);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);

  return (
    <Section className="bg-gradient-to-b from-gray-900 to-gray-800/50">
      <SectionTitle>What Happens When You Back Your Opinion</SectionTitle>

      <div className="relative max-w-4xl mx-auto">
        {/* Decorative quote marks */}
        <div className="absolute -top-8 left-4 text-8xl font-serif text-blue-500/10 pointer-events-none select-none">&ldquo;</div>
        <div className="absolute -bottom-8 right-4 text-8xl font-serif text-blue-500/10 pointer-events-none select-none">&rdquo;</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
            transition={{ duration: 0.5 }}
          >
            {/* Card with gradient border */}
            <div className="relative p-[2px] rounded-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                  borderRadius: "1rem"
                }}
              />
              <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].author}
                    className="w-20 h-20 rounded-full border-2 border-gray-600"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xl md:text-2xl text-white mb-4 italic">
                      &ldquo;{testimonials[currentIndex].quote}&rdquo;
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <span className="text-gray-400">- {testimonials[currentIndex].author}</span>
                      <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                        {testimonials[currentIndex].category}
                      </span>
                      <motion.span
                        className="text-green-400 font-bold text-lg"
                        animate={{
                          textShadow: [
                            "0 0 5px rgba(34, 197, 94, 0.3)",
                            "0 0 15px rgba(34, 197, 94, 0.6)",
                            "0 0 5px rgba(34, 197, 94, 0.3)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {testimonials[currentIndex].profit}
                      </motion.span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => shareOnTwitter(
                      `"${testimonials[currentIndex].quote}" - ${testimonials[currentIndex].author} on @OpinionMarketCap`,
                      "https://opinionmarketcap.xyz"
                    )}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "w-8 bg-blue-500" : "bg-gray-600 hover:bg-gray-500"
                )}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 6: USE CASES - Emoji bounce, card glow, staggered entrance
// ============================================================
const UseCasesSection = () => {
  const categories = [
    {
      name: "Food & Culture",
      icon: "\u{1F355}",
      example: `"Best Pizza in Brooklyn?"`,
      backText: "Restaurants, food bloggers, and locals will fight over this forever. You earn every time.",
      glowColor: "rgba(249, 115, 22, 0.3)"
    },
    {
      name: "Sports",
      icon: "\u{26BD}",
      example: `"Who is the GOAT of Soccer?"`,
      backText: "Messi vs Ronaldo debates have been free for 20 years. Not anymore.",
      glowColor: "rgba(34, 197, 94, 0.3)"
    },
    {
      name: "Crypto & Tech",
      icon: "\u{1F4BB}",
      example: `"Best Layer 2 for Gaming?"`,
      backText: "Blockchain projects and their communities will literally pay to be the answer.",
      glowColor: "rgba(59, 130, 246, 0.3)"
    },
    {
      name: "Local Knowledge",
      icon: "\u{1F3D9}\u{FE0F}",
      example: `"Most reliable plumber in Miami?"`,
      backText: "Real businesses will pay to be the top recommendation. You get royalties.",
      glowColor: "rgba(139, 92, 246, 0.3)"
    }
  ];

  return (
    <Section>
      <SectionTitle>Every Argument Is an Opportunity</SectionTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="flip-card perspective-1000"
            whileHover={{ boxShadow: `0 10px 40px ${cat.glowColor}` }}
          >
            <div className="flip-card-inner relative w-full h-64">
              <div className="flip-card-front flex flex-col items-center justify-center p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                >
                  {cat.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white text-center">{cat.name}</h3>
              </div>
              <div className="flip-card-back flex flex-col items-center justify-center p-6 rounded-xl bg-blue-900/70 border border-blue-500/30">
                <p className="text-lg font-semibold text-blue-100 text-center mb-3">{cat.example}</p>
                <p className="text-sm text-blue-200 text-center">{cat.backText}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 7: THE NUMBERS - Count-up animations, green accent bars, gradient bg
// ============================================================
const TheNumbersSection = () => {
  const examples = [
    { question: "GOAT of Soccer?", volume: 23400, royalties: 702 },
    { question: "iPhone vs Android?", volume: 31800, royalties: 954 },
    { question: "Most Overrated TV Show?", volume: 14200, royalties: 426 },
    { question: "Best Pizza in Brooklyn?", volume: 18700, royalties: 561 }
  ];

  const bestCategories = [
    { name: "Sports GOAT debates", range: "$300-600/mo" },
    { name: "Food & restaurant reviews", range: "$200-400/mo" },
    { name: "Tech comparisons", range: "$250-500/mo" },
    { name: "Local knowledge", range: "$150-350/mo" }
  ];

  return (
    <Section className="bg-gradient-to-b from-gray-800/50 via-green-900/10 to-gray-800/50">
      <GradientOrb color="rgba(34, 197, 94, 0.2)" size={500} position={{ top: '10%', right: '10%' }} delay={0} />

      <SectionTitle>The Math Doesn&apos;t Lie</SectionTitle>
      <motion.p
        className="text-center text-xl text-gray-300 -mt-12 mb-16"
        {...fadeInView}
      >
        Mint once. Earn 3% royalties. <motion.span
          className="text-green-400 font-semibold"
          animate={{
            textShadow: [
              "0 0 5px rgba(34, 197, 94, 0.3)",
              "0 0 20px rgba(34, 197, 94, 0.6)",
              "0 0 5px rgba(34, 197, 94, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >Forever.</motion.span>
      </motion.p>

      <motion.div
        className="bg-gray-900/50 border border-gray-700 rounded-2xl p-8 mb-12"
        whileHover={{ scale: 1.01, borderColor: "rgba(34, 197, 94, 0.3)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {examples.map((item, i) => (
            <motion.div
              key={i}
              className="relative bg-gray-800/50 border border-gray-600 rounded-xl p-6 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                borderColor: "rgba(34, 197, 94, 0.4)",
                boxShadow: "0 10px 25px rgba(34, 197, 94, 0.15)"
              }}
            >
              {/* Green accent bar on left */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                style={{ transformOrigin: "top" }}
              />
              <h4 className="font-semibold text-white mb-3">&quot;{item.question}&quot;</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Volume:</span>
                  <span className="font-medium text-white">
                    $<AnimatedCounter end={item.volume} duration={2} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Your 3% Royalties:</span>
                  <span className="font-bold text-green-400 text-lg price-pulse">
                    $<AnimatedCounter end={item.royalties} duration={2.5} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.p
        className="text-center text-gray-300 text-lg mb-12"
        {...fadeInView}
      >
        Questions don&apos;t expire. Sports, food, tech &mdash; people will argue about these forever. Your royalties compound.
      </motion.p>

      {/* Best categories */}
      <motion.div
        className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-600 rounded-xl p-6 max-w-md mx-auto"
        {...scaleUpView}
      >
        <h5 className="font-semibold text-white mb-4 text-center">Best Performing Categories</h5>
        <div className="space-y-3 text-sm">
          {bestCategories.map((cat, i) => (
            <motion.div
              key={i}
              className="flex justify-between"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-gray-300">{cat.name}</span>
              <span className="text-green-400 font-medium">{cat.range}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
};

// ============================================================
// SECTION 8: ORIGIN STORY - Quote glow, $20 highlight
// ============================================================
const OriginStorySection = () => (
  <Section>
    <SectionTitle>How a <span className="text-yellow-400">$20</span> Bet Started Everything</SectionTitle>
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 mb-10 relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ borderColor: "rgba(59, 130, 246, 0.4)" }}
        animate={{
          boxShadow: [
            "0 0 0px rgba(59, 130, 246, 0)",
            "0 0 20px rgba(59, 130, 246, 0.15)",
            "0 0 0px rgba(59, 130, 246, 0)"
          ]
        }}
        transition={{ duration: 0.8, ease: "easeOut", boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        <p className="text-xl italic leading-relaxed text-gray-100 border-l-4 border-blue-400 pl-6">
          {`"Once, I was listening to my kids debating over the Harry Potter series. The elder, whose favorite novel was 'The Prisoner of Azkaban', argued its supremacy with passion. The younger, however, was convinced 'The Goblet of Fire' was the best. They couldn't agree. Finally, the elder said, 'I'll give you `}
          <motion.span
            className="text-yellow-400 font-bold"
            animate={{
              textShadow: [
                "0 0 5px rgba(250, 204, 21, 0.3)",
                "0 0 15px rgba(250, 204, 21, 0.6)",
                "0 0 5px rgba(250, 204, 21, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >$20</motion.span>
          {` if you agree with me that 'Prisoner of Azkaban' is the best and most important.' The younger, after a moment's thought, accepted the deal and pocketed the bill. The next day, when I asked which was the best novel, they both agreed on 'Prisoner of Azkaban'."`}
        </p>
        <p className="text-right mt-4 text-gray-400">&mdash; Axel, OMC Founder</p>
      </motion.div>
      <motion.p
        className="text-xl text-center text-gray-300 font-medium"
        {...fadeInView}
      >
        That was the spark. Money settles debates that facts never could. <span className="text-blue-400 font-semibold">OMC puts that on-chain.</span>
      </motion.p>
    </div>
  </Section>
);

// ============================================================
// SECTION 9: TRUST - Larger badges, rotating borders, spring pop-in
// ============================================================
const TrustSection = () => {
  const badges = [
    { icon: <Target className="w-7 h-7" />, title: "Verified on Base", desc: "Smart contracts verified on BaseScan", color: "blue" },
    { icon: <Shield className="w-7 h-7" />, title: "Anti-MEV", desc: "Protected from front-running", color: "red" },
    { icon: <Users className="w-7 h-7" />, title: "98% to Community", desc: "Only 2% platform fee", color: "green" },
    { icon: <Globe className="w-7 h-7" />, title: "Open Source", desc: "Transparent, auditable code", color: "purple" }
  ];

  const colorMap: Record<string, { bg: string, border: string, text: string, glow: string }> = {
    blue: { bg: "bg-blue-900/30", border: "border-blue-400/30", text: "text-blue-400", glow: "rgba(59, 130, 246, 0.3)" },
    red: { bg: "bg-red-900/30", border: "border-red-400/30", text: "text-red-400", glow: "rgba(239, 68, 68, 0.3)" },
    green: { bg: "bg-green-900/30", border: "border-green-400/30", text: "text-green-400", glow: "rgba(34, 197, 94, 0.3)" },
    purple: { bg: "bg-purple-900/30", border: "border-purple-400/30", text: "text-purple-400", glow: "rgba(139, 92, 246, 0.3)" }
  };

  return (
    <Section className="bg-gray-800/50 py-16">
      <SectionTitle className="mb-12">Battle-Tested. Community-Owned.</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge, i) => {
          const colors = colorMap[badge.color];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.175, 0.885, 0.32, 1.275]
              }}
              className="relative p-[1px] rounded-xl overflow-hidden"
              whileHover={{ scale: 1.08, y: -5 }}
            >
              {/* Subtle rotating gradient border */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                  borderRadius: "0.75rem"
                }}
              />
              <div className="relative text-center p-6 bg-gray-900/90 rounded-xl">
                <div className={`w-14 h-14 ${colors.bg} ${colors.border} border rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <div className={colors.text}>{badge.icon}</div>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">{badge.title}</h4>
                <p className="text-gray-400 text-xs">{badge.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 10: FINAL CTA - Gradient background, pulsing CTA, particles, text glow
// ============================================================
const FinalCTASection = () => {
  const miniParticles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: ((i * 11) % 100),
    yStart: 100 + (i % 5) * 10,
    yEnd: -(i % 5) * 10,
    duration: 6 + (i % 4),
    delay: (i * 0.6) % 4,
    size: 1 + (i % 2),
    color: ['#3b82f6', '#8b5cf6', '#60a5fa'][i % 3]
  }));

  return (
    <Section className="py-20 bg-gradient-to-b from-gray-900 via-blue-900/20 to-purple-900/20">
      <GradientOrb color="rgba(59, 130, 246, 0.3)" size={500} position={{ top: '0%', left: '20%' }} delay={0} />
      <GradientOrb color="rgba(139, 92, 246, 0.3)" size={400} position={{ bottom: '0%', right: '20%' }} delay={2} />

      {/* Mini particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {miniParticles.map((p) => (
          <motion.div
            key={`cta-p-${p.id}`}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ x: `${p.x}%`, y: `${p.yStart}%`, opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0], y: [`${p.yStart}%`, `${p.yEnd}%`] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow"
          {...fadeInView}
          whileHover={{ scale: 1.03 }}
        >
          Ready to Put Your Money Where Your Mouth Is?
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          {...fadeInView}
        >
          Create a question. Trade an answer. Get paid when someone disagrees.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeInView}
        >
          <Button asChild size="lg" className="button-pulse bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              Launch App
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            <a href="https://docs.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">Read the Docs</a>
          </Button>
        </motion.div>
      </div>
    </Section>
  );
};

// ============================================================
// SECTION 11: FOOTER
// ============================================================
const Footer = () => (
  <footer className="py-16 bg-gray-900">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            OpinionMarketCap
          </h4>
          <p className="text-gray-300 text-sm mb-4">
            Where opinions have price tags.
          </p>
          <div className="flex gap-3">
            <a
              href="https://twitter.com/OpinionMarketCap"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/opinionmarketcap"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <div className="space-y-2 text-sm">
            <a href="/mission" className="block text-gray-300 hover:text-blue-400">Mission</a>
            <a href="/how-it-works" className="block text-gray-300 hover:text-blue-400">How it Works</a>
            <a href="/tutorial" className="block text-gray-300 hover:text-blue-400">Tutorial</a>
            <a href="/influences" className="block text-gray-300 hover:text-blue-400">Influences</a>
            <a href="/whitepaper" className="block text-gray-300 hover:text-blue-400">Whitepaper</a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Community</h4>
          <div className="space-y-2 text-sm">
            <a href="https://discord.gg/opinionmarketcap" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-blue-400">Discord</a>
            <a href="https://twitter.com/OpinionMarketCap" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-blue-400">Twitter/X</a>
            <a href="https://github.com/opinionmarketcap" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-blue-400">GitHub</a>
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-blue-400">Launch App</a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Resources</h4>
          <div className="space-y-2 text-sm">
            <a href="/whitepaper" className="block text-gray-300 hover:text-blue-400">Documentation</a>
            <a href="https://basescan.org/address/0x7b5d97fb78fbf41432F34f46a901C6da7754A726" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-blue-400">Smart Contract</a>
            <a href="#" className="block text-gray-300 hover:text-blue-400">API (Coming Soon)</a>
            <a href="#" className="block text-gray-300 hover:text-blue-400">Brand Kit</a>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="border-t border-gray-800 mt-12 pt-8">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <h5 className="text-sm font-semibold text-yellow-500 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Risk Disclaimer
          </h5>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            <strong className="text-gray-300">Trading opinions involves significant risk.</strong> The value of opinions can fluctuate rapidly and you may lose some or all of your investment. Past performance is not indicative of future results. OpinionMarketCap is a decentralized protocol on the Base blockchain - we do not hold custody of your funds. Always do your own research (DYOR) and never invest more than you can afford to lose.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            <strong className="text-gray-300">Not financial advice.</strong> Nothing on this website constitutes investment advice, financial advice, trading advice, or any other sort of advice. You should conduct your own research and consult with independent financial advisors before making any investment decisions.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            <strong className="text-gray-300">Regulatory notice.</strong> OpinionMarketCap may not be available in all jurisdictions. It is your responsibility to ensure compliance with your local laws and regulations. This platform is not intended for residents of prohibited jurisdictions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2025 OpinionMarketCap. Where opinions have price tags.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-300">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ProfessionalLandingDark() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
          .flip-card-inner { transition: transform 0.7s; transform-style: preserve-3d; }
          .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
          .flip-card-front, .flip-card-back {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .flip-card-back { transform: rotateY(180deg); }
        `
      }} />
      <LandingNavigation />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. The Dare */}
      <TheDareSection />

      <AnimatedSeparator />

      {/* 3. How It Works + Money Flow */}
      <HowItWorksSection />

      <AnimatedSeparator />

      {/* 4. Trending Now */}
      <TrendingOpinionsSection />

      <AnimatedSeparator />

      {/* 5. Testimonials */}
      <TestimonialsCarousel />

      <AnimatedSeparator />

      {/* 6. Use Cases */}
      <UseCasesSection />

      <AnimatedSeparator />

      {/* 7. The Numbers */}
      <TheNumbersSection />

      {/* 8. Origin Story */}
      <OriginStorySection />

      <AnimatedSeparator />

      {/* 9. Trust */}
      <TrustSection />

      {/* 10. Final CTA */}
      <FinalCTASection />

      {/* 11. Footer */}
      <Footer />
    </div>
  )
}
