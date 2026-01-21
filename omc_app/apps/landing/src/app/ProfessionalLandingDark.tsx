'use client'

import { Button } from "@/components/ui/button"
import { LandingNavigation } from "@/components/LandingNavigation"
import { motion, AnimatePresence } from "framer-motion"
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
  Globe,
  Play,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Flame,
  Activity,
  BarChart3,
  Twitter,
  MessageCircle,
  Copy,
  ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"

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
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

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

// Live Stats Data (simulated - would be fetched from blockchain in production)
const useLiveStats = () => {
  const [stats, setStats] = useState({
    activeOpinions: 47,
    totalVolume: 12847,
    tradesToday: 156,
    activeTraders: 89
  });

  useEffect(() => {
    // Simulate live updates
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
      <motion.div
        className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2"
        whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)" }}
      >
        <Activity className="w-4 h-4 text-green-400" />
        <span className="text-gray-400 text-sm">Active Opinions:</span>
        <span className="text-white font-bold">
          <AnimatedCounter end={stats.activeOpinions} />
        </span>
        <motion.span
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2"
        whileHover={{ scale: 1.05, borderColor: "rgba(34, 197, 94, 0.5)" }}
      >
        <DollarSign className="w-4 h-4 text-green-400" />
        <span className="text-gray-400 text-sm">Total Volume:</span>
        <span className="text-green-400 font-bold">
          $<AnimatedCounter end={stats.totalVolume} suffix=" USDC" />
        </span>
      </motion.div>

      <motion.div
        className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2"
        whileHover={{ scale: 1.05, borderColor: "rgba(147, 51, 234, 0.5)" }}
      >
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-gray-400 text-sm">Trades Today:</span>
        <span className="text-orange-400 font-bold">
          <AnimatedCounter end={stats.tradesToday} />
        </span>
      </motion.div>

      <motion.div
        className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2"
        whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)" }}
      >
        <Users className="w-4 h-4 text-blue-400" />
        <span className="text-gray-400 text-sm">Active Traders:</span>
        <span className="text-blue-400 font-bold">
          <AnimatedCounter end={stats.activeTraders} />
        </span>
      </motion.div>
    </motion.div>
  );
};

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
    <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
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
        className="text-xl md:text-2xl text-blue-400 font-bold mb-4"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
      >
        Pay to Impose Your Truth - Earn Royalties Forever on Base
      </motion.p>
      <motion.p
        className="text-lg md:text-xl text-gray-300 font-medium mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
      >
        The First Opinion Lab: Own The Narrative, Earn The Profits
      </motion.p>

      {/* Live Stats Bar */}
      <LiveStatsBar />

      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center items-center my-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]">
          <a href="https://app.opinionmarketcap.xyz/create" target="_blank" rel="noopener noreferrer">
            Connect Wallet & Mint Now
            <ArrowUpRight className="w-5 h-5 ml-2" />
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:border-gray-500 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
          <a href="https://app.opinionmarketcap.xyz/" target="_blank" rel="noopener noreferrer">Browse Questions</a>
        </Button>
      </motion.div>

      <motion.div
        className="inline-flex items-center justify-center py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <motion.p
          className="text-blue-300 font-semibold tracking-widest text-2xl md:text-3xl"
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
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() => shareOnTwitter("Just discovered @OpinionMarketCap - trade opinions for profit on Base!", "https://opinionmarketcap.xyz")}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
        >
          <Twitter className="w-4 h-4" />
          Share on X
        </button>
      </motion.div>
    </div>
    </section>
  );
};

// Testimonials Carousel
const testimonials = [
  {
    quote: "Minted 'Best Layer 2?' and earned 200 USDC in royalties in the first week!",
    author: "0x7d3...8f2a",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234ade80'/%3E%3C/svg%3E",
    profit: "+$200",
    category: "Crypto"
  },
  {
    quote: "Finally a platform where my hot takes actually make money. Soccer GOAT debates are fire!",
    author: "soccerfan.eth",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2360a5fa'/%3E%3C/svg%3E",
    profit: "+$450",
    category: "Sports"
  },
  {
    quote: "As a food blogger, I turned my restaurant knowledge into passive income. Game changer!",
    author: "foodie_nyc",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f472b6'/%3E%3C/svg%3E",
    profit: "+$180",
    category: "Food"
  },
  {
    quote: "The pool system is genius - teamed up with others to take over the 'Best DEX' answer!",
    author: "defi_maxi.eth",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23a855f7'/%3E%3C/svg%3E",
    profit: "+$320",
    category: "DeFi"
  },
  {
    quote: "Local knowledge pays. My 'Best coffee in Austin' question generates $50/week royalties.",
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
      <SectionTitle>What Traders Are Saying</SectionTitle>

      <div className="relative max-w-4xl mx-auto">
        {/* Main testimonial */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-12"
          >
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
                  <span className="text-green-400 font-bold text-lg">
                    {testimonials[currentIndex].profit}
                  </span>
                </div>
              </div>
            </div>

            {/* Share this testimonial */}
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
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
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

// Explainer Video Section
const ExplainerVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Section>
      <SectionTitle>See How It Works in 90 Seconds</SectionTitle>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-gray-700"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {!isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
              {/* Video thumbnail/placeholder */}
              <div className="text-center">
                <motion.button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                </motion.button>
                <h3 className="text-2xl font-bold text-white mb-2">How Opinion Trading Works</h3>
                <p className="text-gray-400">Learn the mechanics: Mint, Trade, Pool & Profit</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-red-500/80 rounded-full text-xs text-white">LIVE</span>
                <span className="px-3 py-1 bg-gray-700/80 rounded-full text-xs text-gray-300">1:30</span>
              </div>
            </div>
          ) : (
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="OMC Explainer Video"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </motion.div>

        {/* Quick infographic below video */}
        <motion.div
          className="grid grid-cols-4 gap-4 mt-8"
          variants={fadeIn}
        >
          {[
            { step: "1", title: "Mint", desc: "Create a question", color: "text-red-400" },
            { step: "2", title: "Trade", desc: "Buy/sell answers", color: "text-green-400" },
            { step: "3", title: "Pool", desc: "Team up for power", color: "text-purple-400" },
            { step: "4", title: "Profit", desc: "Earn royalties forever", color: "text-yellow-400" }
          ].map((item, i) => (
            <motion.div
              key={i}
              className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
              whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
            >
              <div className={`text-3xl font-black ${item.color} mb-2`}>{item.step}</div>
              <div className="text-white font-semibold">{item.title}</div>
              <div className="text-gray-400 text-sm">{item.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

// Trending Opinions Section
const trendingOpinions = [
  {
    id: 1,
    question: "Best Layer 2 for DeFi?",
    currentAnswer: "Arbitrum",
    price: 45.20,
    volume24h: 1240,
    trades: 23,
    trend: "up",
    category: "Crypto"
  },
  {
    id: 2,
    question: "GOAT of Basketball?",
    currentAnswer: "Michael Jordan",
    price: 78.50,
    volume24h: 3420,
    trades: 67,
    trend: "up",
    category: "Sports"
  },
  {
    id: 3,
    question: "Best Pizza in NYC?",
    currentAnswer: "Di Fara Pizza",
    price: 23.10,
    volume24h: 890,
    trades: 18,
    trend: "down",
    category: "Food"
  },
  {
    id: 4,
    question: "Most Overrated Tech Company?",
    currentAnswer: "Apple",
    price: 52.80,
    volume24h: 2100,
    trades: 41,
    trend: "up",
    category: "Tech"
  },
  {
    id: 5,
    question: "Best Anime of All Time?",
    currentAnswer: "Attack on Titan",
    price: 31.40,
    volume24h: 1560,
    trades: 34,
    trend: "up",
    category: "Entertainment"
  }
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
        <SectionTitle className="mb-0">Trending Now</SectionTitle>
        <motion.span
          className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          LIVE
        </motion.span>
      </div>
      <p className="text-center text-gray-400 mb-12">Hot opinions with the most activity right now</p>

      <div className="space-y-4 max-w-4xl mx-auto">
        {trendingOpinions.map((opinion, index) => (
          <motion.div
            key={opinion.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 hover:border-blue-500/30 transition-all"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                    {opinion.category}
                  </span>
                  {opinion.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                  )}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{opinion.question}</h4>
                <p className="text-gray-400">
                  Current Answer: <span className="text-blue-400 font-medium">{opinion.currentAnswer}</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-xl">${opinion.price.toFixed(2)}</div>
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Trade
                  </a>

                  <button
                    onClick={() => shareOnTwitter(
                      `Check out this trending opinion on @OpinionMarketCap: "${opinion.question}" - Current answer: ${opinion.currentAnswer}`,
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

      <motion.div
        className="text-center mt-8"
        whileHover={{ scale: 1.05 }}
      >
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
          {/* Newsletter signup */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-700 rounded-2xl p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
                <p className="text-gray-400">Get notified about new features, trending opinions, and platform updates.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                OpinionMarketCap
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                The infinite marketplace where opinions become tradable assets on Base.
              </p>
              {/* Social share buttons */}
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
                © 2025 OpinionMarketCap. An Opinion Labs Project. All rights reserved.
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

      {/* Hero with Live Stats */}
      <HeroSection />

      {/* Trending Opinions - Creates FOMO */}
      <TrendingOpinionsSection />

      <Separator />

      {/* Explainer Video */}
      <ExplainerVideoSection />

      <Separator />

      {/* Problem/Solution */}
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

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      <Footer />
    </div>
  )
}
