'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  BarChart3,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications';
import { useOnboardingContext } from '@/components/onboarding';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function GlobalNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open: openTutorial } = useOnboardingContext();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span className="text-base font-bold text-foreground hidden sm:inline">
              OpinionMarketCap
            </span>
            <span className="text-base font-bold text-foreground sm:hidden">
              OMC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto mr-3">
            <Link href="/" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Market</Link>
            <Link href="/mint" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Mint</Link>
            <Link href="/marketplace" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Marketplace</Link>
            <Link href="/leaderboard" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Leaderboard</Link>
            <Link href="/pools" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Pools</Link>
            <Link href="/portfolio" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Portfolio</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Tutorial Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openTutorial}
              className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-emerald-400 transition-colors h-7 px-2"
              title="Open Tutorial"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="text-xs">Tutorial</span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationCenter />

            {/* Wallet Connection */}
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              <ConnectButton />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-muted-foreground hover:text-foreground h-7 w-7 p-0"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
              className="lg:hidden mt-2 pt-2 border-t border-border/40"
            >
              <div className="flex flex-col gap-1 pb-2">
                <Link href="/" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted">Market</Link>
                <Link href="/mint" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted">Mint</Link>
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted">Marketplace</Link>
                <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted">Leaderboard</Link>
                <Link href="/pools" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted">Pools</Link>
                <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted">Portfolio</Link>
                <button
                  onClick={() => {
                    openTutorial();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted flex items-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Tutorial
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}