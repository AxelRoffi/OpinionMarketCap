'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function GlobalNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          {/* Desktop Navigation - Right aligned with green hover + bold */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto">
            <Link href="/leaderboard" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Leaderboard</Link>
            <Link href="/pools" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Pools</Link>
            <Link href="/marketplace" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Questions for Sale</Link>
            <Link href="/profile" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Profile</Link>
            <Link href="/referrals" className="text-gray-300 font-medium hover:text-purple-500 hover:font-bold transition-colors duration-200 flex items-center gap-1">
              <Gift className="w-4 h-4" />
              Referrals
            </Link>
            <Link href="/create" className="text-gray-300 font-medium hover:text-emerald-500 hover:font-bold transition-colors duration-200">Create</Link>
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
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link>
                <Link href="/pools" className="text-gray-300 hover:text-white transition-colors">Pools</Link>
                <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">Questions for Sale</Link>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
                <Link href="/referrals" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Referrals
                </Link>
                <Link href="/create" className="text-gray-300 hover:text-white transition-colors">Create</Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}