'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function GlobalNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Now clickable */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            <h1 className="text-xl font-bold text-foreground">
              OpinionMarketCap
            </h1>
          </Link>

          {/* Desktop Navigation - Clean URLs matching menu items */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto mr-8">
            <Link href="/" className="text-muted-foreground font-medium hover:text-emerald hover:font-bold transition-colors duration-200">Market</Link>
            <Link href="/mint" className="text-muted-foreground font-medium hover:text-emerald hover:font-bold transition-colors duration-200">Mint</Link>
            <Link href="/marketplace" className="text-muted-foreground font-medium hover:text-emerald hover:font-bold transition-colors duration-200">Marketplace</Link>
            <Link href="/leaderboard" className="text-muted-foreground font-medium hover:text-emerald hover:font-bold transition-colors duration-200">Leaderboard</Link>
            <Link href="/pools" className="text-muted-foreground font-medium hover:text-emerald hover:font-bold transition-colors duration-200">Pools</Link>
            <Link href="/portfolio" className="text-muted-foreground font-medium hover:text-emerald hover:font-bold transition-colors duration-200">Portfolio</Link>
            <Link href="/referrals" className="text-muted-foreground font-medium hover:text-purple hover:font-bold transition-colors duration-200">Referrals</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Wallet Connection */}
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              <ConnectButton />
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
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
              className="md:hidden mt-4 pt-4 border-t border-border/40"
            >
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-muted-foreground hover:text-emerald hover:font-bold transition-colors duration-200">Market</Link>
                <Link href="/mint" className="text-muted-foreground hover:text-emerald hover:font-bold transition-colors duration-200">Mint</Link>
                <Link href="/marketplace" className="text-muted-foreground hover:text-emerald hover:font-bold transition-colors duration-200">Marketplace</Link>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-emerald hover:font-bold transition-colors duration-200">Leaderboard</Link>
                <Link href="/pools" className="text-muted-foreground hover:text-emerald hover:font-bold transition-colors duration-200">Pools</Link>
                <Link href="/portfolio" className="text-muted-foreground hover:text-emerald hover:font-bold transition-colors duration-200">Portfolio</Link>
                <Link href="/referrals" className="text-muted-foreground hover:text-purple hover:font-bold transition-colors duration-200">Referrals</Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}