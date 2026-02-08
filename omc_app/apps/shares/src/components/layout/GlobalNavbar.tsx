'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function GlobalNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span className="text-base font-bold text-foreground hidden sm:inline">
              AnswerShares
            </span>
            <span className="text-base font-bold text-foreground sm:hidden">
              AS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto mr-3">
            <Link href="/" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Questions</Link>
            <Link href="/create" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Create</Link>
            <Link href="/portfolio" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Portfolio</Link>
            <Link href="/leaderboard" className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Leaderboard</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet Connection */}
            <div className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg">
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
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
                >
                  Questions
                </Link>
                <Link
                  href="/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
                >
                  Create
                </Link>
                <Link
                  href="/portfolio"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
                >
                  Portfolio
                </Link>
                <Link
                  href="/leaderboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
                >
                  Leaderboard
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
