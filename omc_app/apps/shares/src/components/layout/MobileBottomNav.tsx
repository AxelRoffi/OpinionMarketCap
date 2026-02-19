'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Plus, User, Trophy, Store } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', icon: BarChart3, label: 'Market' },
  { href: '/marketplace', icon: Store, label: 'Shop' },
  { href: '/create', icon: Plus, label: 'Create', isCenter: true },
  { href: '/leaderboard', icon: Trophy, label: 'Rank' },
  { href: '/portfolio', icon: User, label: 'Portfolio' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Check if current path matches (handles nested routes)
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Glass background */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-border/50" />

      {/* Safe area padding for iOS */}
      <div className="relative px-2 pt-1.5 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);

            if (item.isCenter) {
              // Center Create button - elevated
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-5"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-background"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[60px]"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative p-1.5 rounded-xl transition-colors ${
                    active ? 'bg-emerald-500/10' : ''
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-emerald-500' : 'text-muted-foreground'
                    }`}
                  />
                  {active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500"
                    />
                  )}
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    active ? 'text-emerald-500' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
