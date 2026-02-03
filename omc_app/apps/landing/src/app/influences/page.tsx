'use client'

import { motion } from "framer-motion"
import {
  ArrowUpRight,
  ChevronDown,
  BookOpen,
  Lightbulb,
  Layers,
  Globe,
  Sparkles,
  ExternalLink,
  Quote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

// --- Reusable design system (same as landing, mission, how-it-works, tutorial) ---

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
// SECTION 1: HERO — The Origin Story
// ============================================================
const HeroSection = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: ((i * 7 + 3) % 100),
    yStart: ((i * 11 + 5) % 100),
    duration: 6 + (i % 8),
    delay: (i * 0.3) % 5,
    size: 1 + (i % 3),
    color: ['#3b82f6', '#8b5cf6', '#10b981', '#60a5fa', '#a855f7'][i % 5],
  }));

  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden hero-mesh-bg min-h-[80vh] flex flex-col justify-center">
      <GradientOrb color="rgba(59, 130, 246, 0.35)" size={600} position={{ top: '-10%', right: '-5%' }} delay={0} />
      <GradientOrb color="rgba(139, 92, 246, 0.25)" size={500} position={{ bottom: '0%', left: '-10%' }} delay={2} />

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
            <span className="animated-gradient-text">The Genesis</span>
            <br />
            <span className="text-white">of an Idea</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          From a childhood bet to a new digital economy.
        </motion.p>

        <motion.p
          className="text-gray-500 text-lg mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          The philosophy, influences, and on-chain pioneers behind OMC.
        </motion.p>

        <motion.div
          className="mt-8"
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
// SECTION 2: THE SPARK — The Harry Potter Story
// ============================================================
const SparkSection = () => (
  <Section>
    <GradientOrb color="rgba(234, 179, 8, 0.15)" size={450} position={{ top: '5%', right: '-5%' }} delay={1} />

    <SectionTitle>It Started With a $20 Bill</SectionTitle>

    {/* The blockquote */}
    <motion.div
      className="relative max-w-4xl mx-auto mb-16"
      {...fadeInView}
    >
      <div className="absolute -top-6 -left-4 text-blue-500/20">
        <Quote className="w-16 h-16" />
      </div>
      <blockquote className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 md:p-12">
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed italic">
          &quot;My kids were debating the Harry Potter series. The elder argued that <em>Prisoner of Azkaban</em> was
          the best. The younger was convinced it was <em>Goblet of Fire</em>. They couldn&apos;t agree.
        </p>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed italic mt-4">
          Finally, the elder said: <span className="text-yellow-400 font-semibold not-italic">&apos;I&apos;ll give you $20 if you agree with me.&apos;</span>
        </p>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed italic mt-4">
          The younger accepted. Pocketed the bill. The next day, they both agreed on <em>Prisoner of Azkaban</em>.
        </p>
        <p className="text-lg md:text-xl text-white leading-relaxed mt-6 not-italic font-semibold">
          Money had settled a debate that facts never could. That was the spark.&quot;
        </p>
        <footer className="mt-6 text-gray-500 text-sm not-italic">— The founder of OMC</footer>
      </blockquote>
    </motion.div>

    {/* The insight */}
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <motion.div
        className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8"
        {...slideLeftView}
      >
        <Lightbulb className="w-8 h-8 text-yellow-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-3">The Question</h3>
        <p className="text-gray-400">
          Could this mechanism be formalized? Could we create a system where the weight of an opinion is measured not by likes or upvotes — but by economic commitment?
        </p>
      </motion.div>

      <motion.div
        className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8"
        {...slideRightView}
      >
        <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-3">The Answer</h3>
        <p className="text-gray-400">
          OMC. Not a social platform. Not another DeFi protocol. An economic game built on one premise: <span className="text-white font-semibold">the financialization of narrative itself.</span>
        </p>
      </motion.div>
    </div>
  </Section>
);


// ============================================================
// SECTION 3: PHILOSOPHY — Three Intellectual Pillars
// ============================================================
const PhilosophySection = () => {
  const pillars = [
    {
      title: "Mimetic Desire → Memetic Desire",
      thinker: "René Girard",
      thinkerUrl: "https://en.wikipedia.org/wiki/Ren%C3%A9_Girard",
      color: "blue",
      description: "Girard argued we desire things not for their intrinsic value, but because others desire them. In the digital age, this has fused with the viral power of memes. OMC is the first platform to translate this fundamental human driver into a tradeable, on-chain asset.",
      punchline: "We don't want things. We want what others want. OMC makes that impulse tradeable.",
    },
    {
      title: "Reflexivity",
      thinker: "George Soros",
      thinkerUrl: "https://en.wikipedia.org/wiki/Reflexivity_(social_theory)",
      color: "purple",
      description: "Market participants' perceptions shape the fundamentals they're meant to reflect. In OMC, the \"fundamental value\" of an answer is nothing more than the market's perception of it. The price doesn't reflect value — the price is the value.",
      punchline: "The answer with the most money behind it wins. Not the one with the best argument.",
    },
    {
      title: "Durex Codex, Sed Codex",
      thinker: "Code is Law",
      thinkerUrl: "https://basescan.org/address/0x7b5d97fb78fbf41432F34f46a901C6da7754A726",
      color: "emerald",
      description: "\"The Code is Harsh, but it is The Code.\" The rules are encoded in smart contracts, enforced with absolute certainty. Not a promise — a verifiable reality. Transparent, auditable, immutable. Every trade, every fee, every transfer.",
      punchline: "No middlemen. No moderation. No exceptions. The protocol decides.",
    },
  ];

  const colorMap: Record<string, { bg: string, border: string, text: string, accent: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", accent: "text-blue-300" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", accent: "text-purple-300" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", accent: "text-emerald-300" },
  };

  return (
    <Section>
      <GradientOrb color="rgba(139, 92, 246, 0.2)" size={500} position={{ top: '-5%', left: '-10%' }} delay={0.5} />

      <SectionTitle>The Intellectual Foundations</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-3xl mx-auto" {...fadeInView}>
        Three ideas that shaped how OMC works — and why it works.
      </motion.p>

      <div className="space-y-8">
        {pillars.map((pillar, i) => {
          const c = colorMap[pillar.color];
          return (
            <motion.div
              key={pillar.title}
              className={cn("rounded-2xl border p-8 md:p-10", c.bg, c.border)}
              {...(i % 2 === 0 ? slideLeftView : slideRightView)}
              transition={{ duration: 0.8, ease: "easeOut" as const, delay: i * 0.15 }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className={cn("text-5xl font-black opacity-30", c.text)}>
                    0{i + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{pillar.title}</h3>
                  <a
                    href={pillar.thinkerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("text-sm font-medium hover:underline inline-flex items-center gap-1 mb-4", c.text)}
                  >
                    {pillar.thinker} <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-gray-300 mb-4">{pillar.description}</p>
                  <p className={cn("font-semibold text-sm", c.accent)}>
                    → {pillar.punchline}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};


// ============================================================
// SECTION 4: PIONEERS — On-Chain Experiments That Paved the Way
// ============================================================
const PioneersSection = () => {
  const pioneers = [
    {
      name: "This Artwork Is Always On Sale",
      url: "https://thisartworkisalwaysonsale.com/",
      inspiration: "Radical Markets",
      inspirationUrl: "https://www.radicalxchange.org/media/papers/radical-markets.pdf",
      lesson: "Proved that Harberger-style economics could function in the wild. Self-assessed pricing creates fascinating market dynamics.",
      whatWeTook: "We made price discovery fully dynamic and market-driven. Not self-assessed — the crowd decides.",
      color: "yellow",
    },
    {
      name: "Nouns DAO",
      url: "https://nouns.wtf",
      inspiration: "Perpetual auctions",
      lesson: "Proved that a community can thrive around a \"forever game.\" One NFT per day, auctioned forever. Simple mechanic, powerful community.",
      whatWeTook: "We applied the \"forever game\" concept not to a single asset, but to infinite user-generated markets of ideas.",
      color: "blue",
    },
    {
      name: "Satoshi's Place",
      url: "https://satoshis.place/",
      inspiration: "Competitive on-chain spaces",
      lesson: "Demonstrated the raw human desire for competitive, on-chain social expression. Pay to paint pixels. Chaos ensues.",
      whatWeTook: "We added economic sophistication. Dynamic pricing ensures that as a narrative heats up, the cost to control it rises. Filters for true conviction.",
      color: "purple",
    },
  ];

  const colorMap: Record<string, { bg: string, border: string, text: string }> = {
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  };

  return (
    <Section>
      <SectionTitle>Standing on the Shoulders of Giants</SectionTitle>
      <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-3xl mx-auto" {...fadeInView}>
        We studied the on-chain experiments that came before us. Learned their lessons. Built on their innovation.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6">
        {pioneers.map((pioneer, i) => {
          const c = colorMap[pioneer.color];
          return (
            <motion.div
              key={pioneer.name}
              className={cn("rounded-2xl border p-8 flex flex-col", c.bg, c.border)}
              {...scaleUpView}
              transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.15 }}
            >
              <a
                href={pioneer.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("text-lg font-bold hover:underline inline-flex items-center gap-2 mb-1", c.text)}
              >
                {pioneer.name} <ExternalLink className="w-4 h-4" />
              </a>
              {pioneer.inspirationUrl ? (
                <a
                  href={pioneer.inspirationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 text-sm hover:text-gray-400 mb-4"
                >
                  Inspired by: {pioneer.inspiration}
                </a>
              ) : (
                <p className="text-gray-500 text-sm mb-4">{pioneer.inspiration}</p>
              )}

              <p className="text-gray-300 text-sm mb-4 flex-1">{pioneer.lesson}</p>

              <div className="bg-gray-900/40 rounded-lg p-4 mt-auto">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">What we took</p>
                <p className={cn("text-sm font-medium", c.text)}>{pioneer.whatWeTook}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};


// ============================================================
// SECTION 5: THE CORE INSIGHT — Why Opinions, Not Predictions
// ============================================================
const CoreInsightSection = () => (
  <Section>
    <GradientOrb color="rgba(16, 185, 129, 0.15)" size={500} position={{ bottom: '10%', right: '-10%' }} delay={1.5} />

    <SectionTitle>A Market for Every Question</SectionTitle>

    <div className="grid md:grid-cols-2 gap-12 items-center">
      <motion.div {...slideLeftView}>
        <p className="text-gray-300 text-lg mb-6">
          How do you settle endless debates like &quot;Who is the GOAT of soccer?&quot; or &quot;What&apos;s the most beautiful city?&quot;
        </p>
        <p className="text-gray-300 text-lg mb-6">
          We believe a <span className="text-white font-semibold">$1 economic commitment</span> to an answer is infinitely more powerful than 10,000 likes. Likes are free. Money isn&apos;t.
        </p>
        <p className="text-gray-300 text-lg">
          In OMC, <span className="text-white font-semibold">minting a question is creating a market.</span> Anyone can do it in 60 seconds. From that moment, anyone in the world can compete to claim the answer — as long as they&apos;re willing to pay.
        </p>
      </motion.div>

      <motion.div {...slideRightView}>
        <div className="space-y-4">
          {[
            { label: "Prediction markets", desc: "Binary outcomes. Yes/No. Expire when the event ends.", dim: true },
            { label: "Social media", desc: "Likes, upvotes, comments. Free. Gameable. Worthless signal.", dim: true },
            { label: "OMC", desc: "Perpetual markets. Never expire. Keep growing. Money-backed conviction.", dim: false },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className={cn(
                "rounded-xl border p-6 transition-all",
                item.dim
                  ? "bg-gray-800/30 border-gray-700/30 opacity-60"
                  : "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10"
              )}
              {...scaleUpView}
              transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: 0.3 + i * 0.15 }}
            >
              <h4 className={cn("font-bold mb-1", item.dim ? "text-gray-500" : "text-blue-400")}>{item.label}</h4>
              <p className={cn("text-sm", item.dim ? "text-gray-600" : "text-gray-300")}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Key differentiators */}
    <motion.div className="mt-16 grid md:grid-cols-3 gap-6" {...fadeInView}>
      {[
        {
          title: "Self-Resolving",
          description: "No oracles. No external judges. The market resolves itself with every new answer. Truly decentralized.",
          icon: <Layers className="w-6 h-6" />,
          color: "emerald",
        },
        {
          title: "Perpetual",
          description: "Markets never close. \"Best CRM?\" trades today, tomorrow, and in 10 years. As long as people have opinions, the market lives.",
          icon: <Globe className="w-6 h-6" />,
          color: "blue",
        },
        {
          title: "Ownership is Real",
          description: "Your answer is a blockchain asset. Immutable. Censorship-resistant. You own it until someone pays more.",
          icon: <BookOpen className="w-6 h-6" />,
          color: "purple",
        },
      ].map((item, i) => (
        <motion.div
          key={item.title}
          className={cn(
            "rounded-xl border p-6",
            item.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20",
            item.color === "blue" && "bg-blue-500/10 border-blue-500/20",
            item.color === "purple" && "bg-purple-500/10 border-purple-500/20",
          )}
          {...scaleUpView}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number], delay: i * 0.15 }}
        >
          <div className={cn(
            "mb-3",
            item.color === "emerald" && "text-emerald-400",
            item.color === "blue" && "text-blue-400",
            item.color === "purple" && "text-purple-400",
          )}>
            {item.icon}
          </div>
          <h4 className="font-bold text-white mb-2">{item.title}</h4>
          <p className="text-gray-400 text-sm">{item.description}</p>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);


// ============================================================
// SECTION 6: THE VISION — Ocean of Liberty
// ============================================================
const VisionSection = () => (
  <Section>
    <GradientOrb color="rgba(59, 130, 246, 0.2)" size={500} position={{ top: '10%', left: '-10%' }} delay={0} />

    <SectionTitle>An Ocean of Liberty</SectionTitle>

    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 md:p-10"
        {...fadeInView}
      >
        <p className="text-gray-300 text-lg mb-4">
          In an era dominated by centralized platforms that control what you see and what you can say, OMC offers something radical: <span className="text-white font-semibold">an open protocol for free expression backed by economics.</span>
        </p>
        <p className="text-gray-300 text-lg">
          Every opinion is a blockchain asset. Your ownership is immutable. No algorithm can suppress it. No moderator can delete it. No corporation can monetize it without you getting paid.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6"
          {...slideLeftView}
        >
          <h4 className="font-bold text-white mb-3">For Creators</h4>
          <p className="text-gray-400 text-sm">
            Mint questions. Earn 3% royalty on every trade. Forever. This isn&apos;t the creator economy — this is the creator <em>ownership</em> economy. You built the market. You own the revenue stream.
          </p>
        </motion.div>

        <motion.div
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6"
          {...slideRightView}
        >
          <h4 className="font-bold text-white mb-3">For Brands</h4>
          <p className="text-gray-400 text-sm">
            The world&apos;s first advertising platform with built-in exit liquidity. A marketing expense becomes a potential investment. Own the answer to &quot;Best luxury watch?&quot; and the market works for you.
          </p>
        </motion.div>

        <motion.div
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6"
          {...slideLeftView}
          transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.15 }}
        >
          <h4 className="font-bold text-white mb-3">For Communities</h4>
          <p className="text-gray-400 text-sm">
            Pool money together. Back your tribe&apos;s answer. Crypto Twitter arguing over the best L2? Put your bags where your mouth is. Pools make collective conviction tradeable.
          </p>
        </motion.div>

        <motion.div
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6"
          {...slideRightView}
          transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.15 }}
        >
          <h4 className="font-bold text-white mb-3">For Traders</h4>
          <p className="text-gray-400 text-sm">
            A new asset class. Buy answers cheap before they blow up. Sell when someone disagrees. Same game, new arena. Social arbitrage meets on-chain economics.
          </p>
        </motion.div>
      </div>
    </div>
  </Section>
);


// ============================================================
// SECTION 7: THE FUTURE
// ============================================================
const FutureSection = () => (
  <Section>
    <SectionTitle>From Opinions to Everything</SectionTitle>
    <motion.p className="text-center text-gray-400 text-lg -mt-12 mb-16 max-w-3xl mx-auto" {...fadeInView}>
      If we can create an efficient market for an opinion, what else can we do?
    </motion.p>

    <div className="max-w-4xl mx-auto">
      <motion.div
        className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 md:p-10"
        {...fadeInView}
      >
        <p className="text-gray-300 text-lg mb-6">
          The same smart contracts that settle debates about the best CRM can enable merchants and consumers to transact directly — eliminating the 10-15% commissions extracted by intermediaries.
        </p>
        <p className="text-gray-300 text-lg mb-6">
          Our oracle-less architecture doesn&apos;t need external data feeds. The market is the oracle. This makes the system more robust, more decentralized, and infinitely more scalable than anything that came before.
        </p>
        <p className="text-white text-lg font-semibold">
          Today: a marketplace for opinions. Tomorrow: a new primitive for global commerce.
        </p>
      </motion.div>

      {/* Verified contracts callout */}
      <motion.div
        className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-xl p-6"
        {...fadeInView}
      >
        <p className="text-gray-500 text-sm mb-3">Everything is on-chain and verifiable:</p>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "OpinionCore", url: "https://basescan.org/address/0x7b5d97fb78fbf41432F34f46a901C6da7754A726" },
            { name: "PoolManager", url: "https://basescan.org/address/0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e" },
            { name: "FeeManager", url: "https://basescan.org/address/0x31D604765CD76Ff098A283881B2ca57e7F703199" },
          ].map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 transition-colors"
            >
              {c.name} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  </Section>
);


// ============================================================
// SECTION 8: FINAL CTA
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
        Own the Narrative.{" "}
        <span className="animated-gradient-text">Earn the Profit.</span>
      </motion.h2>

      <motion.p
        className="text-xl text-gray-400 mb-10"
        {...fadeInView}
        transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.2 }}
      >
        The future of opinions isn&apos;t free. It&apos;s on-chain, transparent, and yours to own.
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
export default function InfluencesPage() {
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
      <SparkSection />
      <AnimatedSeparator />
      <PhilosophySection />
      <AnimatedSeparator />
      <PioneersSection />
      <AnimatedSeparator />
      <CoreInsightSection />
      <AnimatedSeparator />
      <VisionSection />
      <AnimatedSeparator />
      <FutureSection />
      <AnimatedSeparator />
      <FinalCTASection />
    </div>
  );
}
