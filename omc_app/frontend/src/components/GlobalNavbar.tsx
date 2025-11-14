'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  BarChart3,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useWatchlist';

export function GlobalNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getWatchlistCount } = useWatchlist();
  const watchlistCount = getWatchlistCount();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-700/40 backdrop-blur-sm bg-gray-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Now clickable */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            <h1 className="text-xl font-bold text-white">
              OpinionMarketCap
            </h1>
          </Link>

          {/* Desktop Navigation - Clean URLs matching menu items */}
          <nav className="hidden md:flex items-center space-x-6 ml-auto">
            <Link href="/" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Market</Link>
            <Link href="/mint" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Mint</Link>
            <Link href="/marketplace" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Marketplace</Link>
            <Link href="/leaderboard" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Leaderboard</Link>
            <Link href="/pools" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Pools</Link>
            <Link href="/watchlist" className="text-gray-300 font-medium hover:text-yellow-500 hover:font-bold transition-colors duration-200 relative">
              Watchlist
              {watchlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {watchlistCount > 9 ? '9+' : watchlistCount}
                </span>
              )}
            </Link>
            <Link href="/portfolio" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Portfolio</Link>
            <Link href="/referrals" className="text-gray-300 font-medium hover:text-purple-500 hover:font-bold transition-colors duration-200">Referrals</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle - ENABLED functionality with proper spacing */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white mx-4"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {/* Wallet Connection */}
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              <ConnectButton />
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-gray-700/40"
            >
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">Market</Link>
                <Link href="/mint" className="text-gray-300 hover:text-white transition-colors">Mint</Link>
                <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">Marketplace</Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link>
                <Link href="/pools" className="text-gray-300 hover:text-white transition-colors">Pools</Link>
                <Link href="/watchlist" className="text-gray-300 hover:text-yellow-400 transition-colors relative">
                  Watchlist
                  {watchlistCount > 0 && (
                    <span className="absolute -top-1 -right-3 bg-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {watchlistCount > 9 ? '9+' : watchlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">Portfolio</Link>
                <Link href="/referrals" className="text-gray-300 hover:text-purple-400 transition-colors">Referrals</Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}