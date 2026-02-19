'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function GlobalNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-card/80">
      <div className="container mx-auto px-3 sm:px-4 py-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span className="text-base font-bold text-foreground hidden sm:inline">
              OpinionMarketCap
            </span>
            <span className="text-base font-bold text-foreground sm:hidden">
              OMC
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile (using bottom nav instead) */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto mr-3">
            <Link
              href="/"
              className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted"
            >
              Market
            </Link>
            <Link
              href="/create"
              className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted"
            >
              Create
            </Link>
            <Link
              href="/marketplace"
              className="text-xs text-muted-foreground font-medium hover:text-purple-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted"
            >
              Marketplace
            </Link>
            <Link
              href="/leaderboard"
              className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted"
            >
              Leaderboard
            </Link>
            <Link
              href="/portfolio"
              className="text-xs text-muted-foreground font-medium hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted"
            >
              Portfolio
            </Link>
          </nav>

          {/* Right Side - Wallet & Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <div className="[&>div]:!bg-emerald-600 [&>div:hover]:!bg-emerald-700 [&>div]:!rounded-lg [&_button]:!text-sm [&_button]:!font-medium">
              <ConnectButton
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                chainStatus={{
                  smallScreen: 'icon',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
