'use client'

import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { motion } from "framer-motion"
import { 
  Users, 
  Coins,
  DollarSign,
  Zap,
  Target,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Animation Variants ---
const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

// --- Reusable Components ---
const Section = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.section 
    className={cn("py-24 px-4", className)}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true, amount: 0.2 }}
    transition={{ staggerChildren: 0.2 }}
  >
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </motion.section>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.h2 
    className={cn("text-4xl md:text-5xl font-bold text-center text-white mb-20", className)}
    variants={fadeIn}
    whileHover={{ 
      scale: 1.05, 
      textShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
    }}
    animate={{
      backgroundImage: [
        "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(59,130,246,0.8) 50%, rgba(255,255,255,1) 100%)",
        "linear-gradient(45deg, rgba(59,130,246,0.8) 0%, rgba(255,255,255,1) 50%, rgba(59,130,246,0.8) 100%)",
        "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(59,130,246,0.8) 50%, rgba(255,255,255,1) 100%)"
      ]
    }}
    transition={{ duration: 0.3, ease: "easeOut", backgroundImage: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
    style={{ backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
  >
    {children}
  </motion.h2>
);

const Separator = () => <div className="border-t border-gray-800/60 max-w-4xl mx-auto" />;

// --- Enhanced Sections ---

const HeroSection = () => {
  // Create predictable particle data to avoid hydration mismatch
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: ((i * 7) % 100),
    y: ((i * 13) % 100),
    duration: 10 + (i % 10),
    delay: (i * 0.5) % 5,
    yStart: ((i * 11) % 100),
    yEnd: ((i * 19) % 100)
  }));

  return (
    <section className="relative pt-40 pb-24 px-4 text-center overflow-hidden">
      {/* Subtle, professional particle background */}
      <div className="absolute inset-0 z-0">
          {particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              initial={{ x: `${particle.x}vw`, y: `${particle.yStart}vh`, opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0], y: [`${particle.yStart}vh`, `${particle.yEnd}vh`] }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: particle.delay
              }}
            />
          ))}
      </div>

    <div className="relative z-10">
      <motion.h1 
        className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.05,
          textShadow: "0 0 30px rgba(59, 130, 246, 0.8)"
        }}
        transition={{ 
          duration: 0.8, 
          delay: 0.1
        }}
        style={{ cursor: "default" }}
      >
        <motion.span 
          className="text-white"
          animate={{
            opacity: [0.7, 1, 0.7],
            backgroundImage: [
              "linear-gradient(45deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.7) 100%)",
              "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%)",
              "linear-gradient(45deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.7) 100%)"
            ]
          }} 
          transition={{
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            backgroundImage: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ backgroundClip: "text", WebkitBackgroundClip: "text" }}
        >OPINION
        </motion.span>
        <motion.span 
          className="text-blue-400"
          animate={{
            color: ["#60a5fa", "#3b82f6", "#1d4ed8", "#3b82f6", "#60a5fa"]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        > MARKET</motion.span>
        <motion.span 
          className="text-white"
          animate={{
            opacity: [1, 0.8, 1],
            textShadow: [
              "0 0 0px rgba(255, 255, 255, 0)",
              "0 0 20px rgba(255, 255, 255, 0.5)",
              "0 0 0px rgba(255, 255, 255, 0)"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        > CAP</motion.span>
      </motion.h1>
      <motion.p 
        className="text-2xl md:text-3xl text-gray-300 font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
      >
        The First Opinion Lab, a New Digital Primitive.
      </motion.p>
      <motion.p 
        className="text-xl md:text-2xl text-blue-400 font-bold mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
      >
        Own The Narrative, Earn The Profits
      </motion.p>
      <motion.div 
        className="flex flex-col sm:flex-row gap-6 justify-center items-center my-12"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <a href="https://test.opinionmarketcap.xyz/create" target="_blank" rel="noopener noreferrer">Mint & Earn</a>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(100,116,139,0)] hover:shadow-[0_0_20px_rgba(100,116,139,0.3)]">
          <a href="https://test.opinionmarketcap.xyz/" target="_blank" rel="noopener noreferrer">Browse Questions</a>
        </Button>
      </motion.div>
      <motion.div 
        className="inline-flex items-center justify-center py-3"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <motion.p 
          className="text-blue-300 font-semibold tracking-widest text-3xl md:text-4xl"
          animate={{ y: [-3, 3, -3] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          OMC IS BASE BASED
        </motion.p>
      </motion.div>
    </div>
    </section>
  );
};

const HowItWorksInteractive = () => {
  const steps = [
    { icon: <Target/>, title: "Mint an Asset", description: "Forge any question into a unique, tradable digital asset on the blockchain.", color: "red", bgColor: "bg-red-900/30", borderColor: "border-red-400/30", iconColor: "text-red-400" },
    { icon: <TrendingUp/>, title: "Trade the Answer", description: "Buy and sell the right to the answer on a transparent, liquid market.", color: "green", bgColor: "bg-green-900/30", borderColor: "border-green-400/30", iconColor: "text-green-400" },
    { icon: <DollarSign/>, title: "Earn the Profit", description: "When someone buys your answer, you get 95% of the price. The question minter earns 3% forever.", color: "yellow", bgColor: "bg-yellow-900/30", borderColor: "border-yellow-400/30", iconColor: "text-yellow-400" },
    { icon: <Users/>, title: "Pool Your Power", description: "Team up with others to collectively acquire high-value answers and share the rewards.", color: "purple", bgColor: "bg-purple-900/30", borderColor: "border-purple-400/30", iconColor: "text-purple-400" }
  ];

  return (
    <Section>
      <SectionTitle>How It Really Works</SectionTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <motion.div 
            key={index} 
            variants={fadeIn} 
            className="text-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg hover:-translate-y-2"
            whileHover={{ 
              scale: 1.03, 
              rotateY: 2,
              boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)"
            }}
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              hover: { duration: 0.3, ease: "easeOut" },
              y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
            }}
          >
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
    </Section>
  );
};

const NewParadigmSection = () => (
  <Section className="bg-gray-800/50">
    <SectionTitle>A New Paradigm for Information</SectionTitle>
    <div className="grid md:grid-cols-3 gap-10 items-start">
      <motion.div variants={fadeIn}>
        <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">The Old Way: Web2</h3>
        <ul className="space-y-4 text-lg text-gray-300">
          <li className="flex items-start"><span className="text-red-400 mr-3 mt-1">×</span>Opaque algorithms decide what you see.</li>
          <li className="flex items-start"><span className="text-red-400 mr-3 mt-1">×</span>Value is captured by platforms, not creators.</li>
          <li className="flex items-start"><span className="text-red-400 mr-3 mt-1">×</span>Narratives are easily manipulated by bots and ads.</li>
        </ul>
      </motion.div>
      <motion.div variants={fadeIn}>
        <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">The Half-Step: AI & LLMs</h3>
        <ul className="space-y-4 text-lg text-gray-300">
          <li className="flex items-start"><span className="text-yellow-400 mr-3 mt-1">!</span>Prone to hallucinations. Value captured by platforms</li>
          <li className="flex items-start"><span className="text-yellow-400 mr-3 mt-1">!</span>Centralized, generate content from Web2.</li>
          <li className="flex items-start"><span className="text-yellow-400 mr-3 mt-1">!</span>Massive energy consumption for every query.</li>
        </ul>
      </motion.div>
      <motion.div variants={fadeIn} className="border-2 border-green-400 p-6 rounded-lg shadow-[0_0_20px_rgba(45,212,191,0.5)]">
        <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">The OMC Way: An Opinion Lab</h3>
        <ul className="space-y-4 text-lg text-gray-300">
          <li className="flex items-start"><CheckCircle className="text-green-400 mr-3 mt-1 flex-shrink-0" />Market-driven consensus determines value.</li>
          <li className="flex items-start"><CheckCircle className="text-green-400 mr-3 mt-1 flex-shrink-0" />98% of value goes directly to the community.</li>
          <li className="flex items-start"><CheckCircle className="text-green-400 mr-3 mt-1 flex-shrink-0" />Financial skin-in-the-game ensures authentic conviction.</li>
        </ul>
      </motion.div>
    </div>
  </Section>
);

const UseCasesSection = () => {
  const categories = [
    { name: "Food & Culture", icon: "🍕", example: `"Best Pizza in Brooklyn?"`, backText: "Local restaurants, food delivery apps, and culinary influencers compete for visibility in food debates." },
    { name: "Sports & Entertainment", icon: "⚽", example: `"Who is the GOAT of Soccer?"`, backText: "Sports fans, betting platforms, and athletes' sponsors invest in defending their champions and legends." },
    { name: "Technology & Web3", icon: "💻", example: `"Best Layer 2 for Gaming?"`, backText: "Blockchain projects, gaming studios, and crypto investors battle for developer mindshare and adoption." },
    { name: "Local & Community", icon: "🏙️", example: `"Most reliable plumber in Miami?"`, backText: "Service professionals, local directories, and neighborhood communities trade recommendations for real business value." }
  ];

  return (
    <Section>
      <SectionTitle>An Infinite Universe of Questions</SectionTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((cat, i) => (
          <motion.div 
            key={i} 
            variants={fadeIn}
            className="flip-card perspective-1000"
          >
            <div className="flip-card-inner relative w-full h-64">
              {/* Front of Card */}
              <div className="flip-card-front flex flex-col items-center justify-center p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="text-6xl mb-4">{cat.icon}</div>
                <h3 className="text-xl font-semibold text-white text-center">{cat.name}</h3>
              </div>
              {/* Back of Card */}
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

const GenesisVisionSection = () => (
  <Section className="bg-gray-800/50">
    <SectionTitle>Our Story & Vision</SectionTitle>
    <div className="max-w-4xl mx-auto text-center">
      <motion.div variants={fadeIn} className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 mb-16">
        <p className="text-xl italic leading-relaxed text-gray-100 border-l-4 border-blue-400 pl-6">
          {`"Once, I was listening to my kids debating overt the Harry Potter series. The elder, whose favorite novel was 'The Prisoner of Azkaban', argued its supremacy with passion. The younger, however, was convinced 'The Goblet of Fire' was the best. They couldn't agree. Finally, the elder said, 'I'll give you $20 if you agree with me that 'Prisoner of Azkaban' is the best and most important.' The younger, after a moment's thought, accepted the deal and pocketed the bill. The next day, when I asked which was the best novel, they both agreed on 'Prisoner of Azkaban'. It struck me then: money had become a mechanism to settle a dispute that facts never could. That was the spark that led to OMC."`}
        </p>
        <p className="text-right mt-4 text-gray-400">- Axel, OMC Founder</p>
      </motion.div>
      <motion.div variants={fadeIn}>
        <motion.h3 
          className="text-3xl font-bold text-white mb-6"
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 20px rgba(59, 130, 246, 0.6)"
          }}
          animate={{
            backgroundImage: [
              "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(59,130,246,0.8) 50%, rgba(255,255,255,1) 100%)",
              "linear-gradient(45deg, rgba(59,130,246,0.8) 0%, rgba(255,255,255,1) 50%, rgba(59,130,246,0.8) 100%)",
              "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(59,130,246,0.8) 50%, rgba(255,255,255,1) 100%)"
            ]
          }}
          transition={{ 
            hover: { duration: 0.3, ease: "easeOut" },
            backgroundImage: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
        >
          The Future is Community-Owned
        </motion.h3>
        <motion.p 
          className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto"
          whileHover={{ 
            scale: 1.02,
            color: "#e5e7eb"
          }}
          animate={{
            opacity: [0.9, 1, 0.9]
          }}
          transition={{ 
            hover: { duration: 0.3, ease: "easeOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          OMC is more than a platform; it&apos;s a new economic primitive. We are building a future where the value of information flows directly to the people who create and curate it. By replacing opaque algorithms with transparent markets, we can build a more equitable foundation for knowledge, and eventually, for commerce itself.
        </motion.p>
      </motion.div>
    </div>
  </Section>
);

const AnatomyOfATradeSection = () => (
    <Section>
        <SectionTitle>Anatomy of a Trade</SectionTitle>
        <motion.div 
            className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-8"
            variants={fadeIn}
            whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.3)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <motion.h4 
                className="text-2xl font-semibold text-white mb-6 text-center"
                animate={{ 
                    textShadow: [
                        "0 0 0px rgba(255, 255, 255, 0)",
                        "0 0 10px rgba(255, 255, 255, 0.3)",
                        "0 0 0px rgba(255, 255, 255, 0)"
                    ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                💰 Money Flow Per Trade
            </motion.h4>
            <div className="space-y-4 max-w-md mx-auto">
                <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-700/30"
                    variants={fadeIn}
                    whileHover={{ x: 5, backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-gray-300">Trader pays:</span>
                    <span className="font-semibold text-white">$100 USDC</span>
                </motion.div>
                <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-green-900/20"
                    variants={fadeIn}
                    whileHover={{ x: 5, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-green-400">Previous Answer Owner (95%):</span>
                    <span className="font-semibold text-green-400">$95.00</span>
                </motion.div>
                <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-blue-900/20"
                    variants={fadeIn}
                    whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-blue-400">Question Minter (3%):</span>
                    <span className="font-semibold text-blue-400">$3.00</span>
                </motion.div>
                <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-purple-900/20"
                    variants={fadeIn}
                    whileHover={{ x: 5, backgroundColor: "rgba(147, 51, 234, 0.2)" }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-purple-400">OMC Platform (2%):</span>
                    <span className="font-semibold text-purple-400">$2.00</span>
                </motion.div>
            </div>
        </motion.div>
    </Section>
);

const Footer = () => (
    <footer className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">OpinionMarketCap</h4>
              <p className="text-gray-300 text-sm">
                The infinite marketplace where opinions become tradable assets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="/mission" className="block text-gray-300 hover:text-blue-400">Mission</a>
                <a href="/how-it-works" className="block text-gray-300 hover:text-blue-400">How it Works</a>
                <a href="/tutorial" className="block text-gray-300 hover:text-blue-400">Tutorial</a>
                <a href="/influences" className="block text-gray-300 hover:text-blue-400">Influences</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-blue-400">Discord</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">Twitter</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">GitHub</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-blue-400">Terms</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">Privacy</a>
                <a href="#" className="block text-gray-300 hover:text-blue-400">Docs</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 OpinionMarketCap. An Opinion Labs Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
);

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
      
      <HeroSection />
      <Separator />
      <Section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeIn}>
              <motion.h2 
                className="text-3xl font-bold text-white mb-6"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 15px rgba(239, 68, 68, 0.5)"
                }}
                animate={{
                  color: ["#ffffff", "#fca5a5", "#ffffff"]
                }}
                transition={{ 
                  hover: { duration: 0.3, ease: "easeOut" },
                  color: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                The Current Problem
              </motion.h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Traditional prediction markets are limited and centralized. Prediction markets are a form of betting on a future outcome, and they resolve only once. Most people can&apos;t profit from their present knowledge and insights.
              </p>
            </motion.div>
            <motion.div variants={fadeIn}>
              <motion.h2 
                className="text-3xl font-bold text-blue-400 mb-6"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 15px rgba(59, 130, 246, 0.8)"
                }}
                animate={{
                  color: ["#60a5fa", "#3b82f6", "#60a5fa"]
                }}
                transition={{ 
                  hover: { duration: 0.3, ease: "easeOut" },
                  color: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
              >
                Our Solution: An Opinion Lab
              </motion.h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                OpinionMarketCap (OMC) is a new type of dApp, an Opinion Lab. It&apos;s not about betting on the future; it&apos;s about owning the present. OMC creates an infinite marketplace where you can own, trade, and profit from your opinion on anything, forever.
              </p>
            </motion.div>
          </div>
        </div>
      </Section>
      <NewParadigmSection />
      <Separator />
      <Section>
        <SectionTitle>
            Everything You Need to Profit from Opinions
        </SectionTitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              variants={fadeIn} 
              className="text-center p-6"
              whileHover={{ scale: 1.05, y: -10 }}
              animate={{ rotateY: [0, 2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-900/30 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 180, scale: 1.2 }}
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0)",
                    "0 0 0 10px rgba(59, 130, 246, 0.1)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ 
                  hover: { duration: 0.3 },
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Zap className="w-8 h-8 text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Trading</h3>
              <p className="text-gray-300">Trade opinions instantly with transparent pricing and protected transactions.</p>
            </motion.div>
            <motion.div 
              variants={fadeIn} 
              className="text-center p-6"
              whileHover={{ scale: 1.05, y: -10 }}
              animate={{ rotateY: [0, -2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-green-900/30 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: -180, scale: 1.2 }}
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0)",
                    "0 0 0 10px rgba(34, 197, 94, 0.1)",
                    "0 0 0 0 rgba(34, 197, 94, 0)"
                  ]
                }}
                transition={{ 
                  hover: { duration: 0.3 },
                  boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                }}
              >
                <Users className="w-8 h-8 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Pool Collaboration</h3>
              <p className="text-gray-300">Create pools with others to amplify market impact and share rewards.</p>
            </motion.div>
            <motion.div 
              variants={fadeIn} 
              className="text-center p-6"
              whileHover={{ scale: 1.05, y: -10 }}
              animate={{ rotateY: [0, 2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-purple-900/30 border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.2 }}
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(147, 51, 234, 0)",
                    "0 0 0 10px rgba(147, 51, 234, 0.1)",
                    "0 0 0 0 rgba(147, 51, 234, 0)"
                  ]
                }}
                transition={{ 
                  hover: { duration: 0.3 },
                  boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
                }}
              >
                <Coins className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Question Ownership</h3>
              <p className="text-gray-300">Mint questions & earn 3% royalties from every transaction, forever. Or sell it</p>
            </motion.div>
            <motion.div 
              variants={fadeIn} 
              className="text-center p-6"
              whileHover={{ scale: 1.05, y: -10 }}
              animate={{ rotateY: [0, -2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-red-900/30 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: -360, scale: 1.2 }}
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 0 10px rgba(239, 68, 68, 0.1)",
                    "0 0 0 0 rgba(239, 68, 68, 0)"
                  ]
                }}
                transition={{ 
                  hover: { duration: 0.3 },
                  boxShadow: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }
                }}
              >
                <Shield className="w-8 h-8 text-red-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Anti-MEV Protection</h3>
              <p className="text-gray-300">Protected from front-running and sandwich attacks for fair trading.</p>
            </motion.div>
        </div>
      </Section>
      <HowItWorksInteractive />
      <Separator />
      <UseCasesSection />
      <Separator />
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center text-white mb-16"
            whileHover={{ 
              scale: 1.05,
              textShadow: "0 0 20px rgba(34, 197, 94, 0.6)"
            }}
            animate={{
              backgroundImage: [
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(34,197,94,0.8) 50%, rgba(255,255,255,1) 100%)",
                "linear-gradient(45deg, rgba(34,197,94,0.8) 0%, rgba(255,255,255,1) 50%, rgba(34,197,94,0.8) 100%)",
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(34,197,94,0.8) 50%, rgba(255,255,255,1) 100%)"
              ]
            }}
            transition={{ 
              hover: { duration: 0.3, ease: "easeOut" },
              backgroundImage: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            Examples of High-Earning Minted Questions
          </motion.h2>
          <motion.div 
            className="bg-gray-800 border border-gray-700 rounded-2xl p-8"
            whileHover={{ scale: 1.02, borderColor: "rgba(34, 197, 94, 0.3)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-gray-900/50 border border-gray-600 rounded-xl p-6"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  borderColor: "rgba(34, 197, 94, 0.4)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.15)"
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h4 className="font-semibold text-white mb-2">&quot;Who is the GOAT of Soccer?&quot;</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$23.4K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$468</span>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gray-900/50 border border-gray-600 rounded-xl p-6"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  borderColor: "rgba(34, 197, 94, 0.4)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.15)"
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h4 className="font-semibold text-white mb-2">&quot;iPhone vs Android - Which is Superior?&quot;</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$31.8K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">1,593</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$636</span>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gray-900/50 border border-gray-600 rounded-xl p-6"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  borderColor: "rgba(34, 197, 94, 0.4)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.15)"
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h4 className="font-semibold text-white mb-2">&quot;Most Overrated TV Show Ever?&quot;</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$14.2K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">673</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$284</span>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gray-900/50 border border-gray-600 rounded-xl p-6"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  borderColor: "rgba(34, 197, 94, 0.4)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.15)"
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h4 className="font-semibold text-white mb-2">&quot;Best Pizza in Brooklyn under 50 USDC?&quot;</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="font-medium text-white">$18.7K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Traders:</span>
                    <span className="font-medium text-white">892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Minter earned:</span>
                    <span className="font-semibold text-green-400">$374</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <AnatomyOfATradeSection />
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center text-white mb-16"
            whileHover={{ 
              scale: 1.05,
              textShadow: "0 0 20px rgba(255, 215, 0, 0.7)"
            }}
            animate={{
              backgroundImage: [
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,215,0,0.8) 50%, rgba(255,255,255,1) 100%)",
                "linear-gradient(45deg, rgba(255,215,0,0.8) 0%, rgba(255,255,255,1) 50%, rgba(255,215,0,0.8) 100%)",
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,215,0,0.8) 50%, rgba(255,255,255,1) 100%)"
              ]
            }}
            transition={{ 
              hover: { duration: 0.3, ease: "easeOut" },
              backgroundImage: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            Mint Once, Earn Forever
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">The Power of Timeless Questions</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">No Expiration Dates</h4>
                    <p className="text-gray-300">Your questions generate income indefinitely</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Evergreen Topics</h4>
                    <p className="text-gray-300">Food, sports, culture never go out of style</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Global Appeal</h4>
                    <p className="text-gray-300">Questions that interest people worldwide</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Compound Earnings</h4>
                    <p className="text-gray-300">More popular questions attract more traders over time</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
              <h4 className="text-xl font-bold text-white mb-6">💡 Pro Tip</h4>
              <p className="text-gray-300 mb-6">
                Questions that spark passionate debates generate the most trading volume. 
                Think about topics people love to argue about!
              </p>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-600 rounded-xl p-6">
                <h5 className="font-semibold text-white mb-3">Best Performing Categories:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sports GOAT debates</span>
                    <span className="text-green-400 font-medium">$300-600/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Food & restaurant reviews</span>
                    <span className="text-green-400 font-medium">$200-400/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tech product comparisons</span>
                    <span className="text-green-400 font-medium">$250-500/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Local city knowledge</span>
                    <span className="text-green-400 font-medium">$150-350/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center text-white mb-16"
            whileHover={{ 
              scale: 1.05,
              textShadow: "0 0 20px rgba(239, 68, 68, 0.6)"
            }}
            animate={{
              backgroundImage: [
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(239,68,68,0.8) 50%, rgba(255,255,255,1) 100%)",
                "linear-gradient(45deg, rgba(239,68,68,0.8) 0%, rgba(255,255,255,1) 50%, rgba(239,68,68,0.8) 100%)",
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(239,68,68,0.8) 50%, rgba(255,255,255,1) 100%)"
              ]
            }}
            transition={{ 
              hover: { duration: 0.3, ease: "easeOut" },
              backgroundImage: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            Enterprise-Grade Security
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-gray-800 border-2 border-red-900/50 rounded-xl p-6 text-center"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                borderColor: "rgba(239, 68, 68, 0.7)",
                boxShadow: "0 15px 30px rgba(239, 68, 68, 0.2)"
              }}
              animate={{ rotateY: [0, 1, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-red-900/30 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Shield className="w-8 h-8 text-red-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-3">Anti-MEV Protection</h3>
              <p className="text-gray-300 text-sm">No front-running or sandwich attacks</p>
            </motion.div>
            <motion.div 
              className="bg-gray-800 border-2 border-blue-900/50 rounded-xl p-6 text-center"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                borderColor: "rgba(59, 130, 246, 0.7)",
                boxShadow: "0 15px 30px rgba(59, 130, 246, 0.2)"
              }}
              animate={{ rotateY: [0, -1, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-900/30 border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Target className="w-8 h-8 text-blue-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-3">Smart Contract Audited</h3>
              <p className="text-gray-300 text-sm">Verified and secure on Base</p>
            </motion.div>
            <motion.div 
              className="bg-gray-800 border-2 border-green-900/50 rounded-xl p-6 text-center"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                borderColor: "rgba(34, 197, 94, 0.7)",
                boxShadow: "0 15px 30px rgba(34, 197, 94, 0.2)"
              }}
              animate={{ rotateY: [0, 1, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-green-900/30 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <DollarSign className="w-8 h-8 text-green-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-3">Transparent Pricing</h3>
              <p className="text-gray-300 text-sm">All fees and royalties visible</p>
            </motion.div>
            <motion.div 
              className="bg-gray-800 border-2 border-purple-900/50 rounded-xl p-6 text-center"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                borderColor: "rgba(147, 51, 234, 0.7)",
                boxShadow: "0 15px 30px rgba(147, 51, 234, 0.2)"
              }}
              animate={{ rotateY: [0, -1, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-purple-900/30 border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Globe className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-3">Decentralized</h3>
              <p className="text-gray-300 text-sm">Community-owned and operated</p>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl font-bold mb-8"
            whileHover={{ 
              scale: 1.05,
              textShadow: "0 0 20px rgba(147, 51, 234, 0.6)"
            }}
            animate={{
              backgroundImage: [
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(147,51,234,0.8) 50%, rgba(255,255,255,1) 100%)",
                "linear-gradient(45deg, rgba(147,51,234,0.8) 0%, rgba(255,255,255,1) 50%, rgba(147,51,234,0.8) 100%)",
                "linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(147,51,234,0.8) 50%, rgba(255,255,255,1) 100%)"
              ]
            }}
            transition={{ 
              hover: { duration: 0.3, ease: "easeOut" },
              backgroundImage: { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            Built for the Community
          </motion.h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            98% of platform fees go back to traders and question minters.
            Transparent, decentralized, and fair.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              className="bg-gray-900/50 border border-gray-700 rounded-xl p-8"
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                borderColor: "rgba(59, 130, 246, 0.5)",
                boxShadow: "0 15px 30px rgba(59, 130, 246, 0.15)"
              }}
              animate={{ rotateY: [0, 2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div 
                className="text-3xl font-bold text-blue-400 mb-2"
                animate={{ color: ["#60a5fa", "#3b82f6", "#60a5fa"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                $2,847
              </motion.div>
              <div className="text-gray-300 mb-2">Monthly Income</div>
              <div className="text-gray-400 text-sm">Food blogger • 47 restaurant questions</div>
            </motion.div>
            <motion.div 
              className="bg-gray-900/50 border border-gray-700 rounded-xl p-8"
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                borderColor: "rgba(34, 197, 94, 0.5)",
                boxShadow: "0 15px 30px rgba(34, 197, 94, 0.15)"
              }}
              animate={{ rotateY: [0, -2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
            >
              <motion.div 
                className="text-3xl font-bold text-green-400 mb-2"
                animate={{ color: ["#4ade80", "#22c55e", "#4ade80"] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                $1,923
              </motion.div>
              <div className="text-gray-300 mb-2">Monthly Income</div>
              <div className="text-gray-400 text-sm">Sports fan • 23 GOAT debates</div>
            </motion.div>
            <motion.div 
              className="bg-gray-900/50 border border-gray-700 rounded-xl p-8"
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                borderColor: "rgba(147, 51, 234, 0.5)",
                boxShadow: "0 15px 30px rgba(147, 51, 234, 0.15)"
              }}
              animate={{ rotateY: [0, 2, 0] }}
              transition={{ 
                hover: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }
              }}
            >
              <motion.div 
                className="text-3xl font-bold text-purple-400 mb-2"
                animate={{ color: ["#a855f7", "#9333ea", "#a855f7"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                $1,456
              </motion.div>
              <div className="text-gray-300 mb-2">Monthly Income</div>
              <div className="text-gray-400 text-sm">Local guide • 34 city questions</div>
            </motion.div>
          </div>
        </div>
      </section>
      <GenesisVisionSection />
      <Footer />
    </div>
  )
}
