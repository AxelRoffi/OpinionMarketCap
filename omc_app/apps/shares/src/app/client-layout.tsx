'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Dynamic imports to prevent SSR issues with wallet providers
const Providers = dynamic(() => import('./providers').then(mod => ({ default: mod.Providers })), { ssr: false });
const GlobalNavbar = dynamic(() => import('@/components/layout').then(mod => ({ default: mod.GlobalNavbar })), { ssr: false });
const MobileBottomNav = dynamic(() => import('@/components/layout').then(mod => ({ default: mod.MobileBottomNav })), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer').then(mod => ({ default: mod.Footer })), { ssr: false });
const Toaster = dynamic(() => import('sonner').then(mod => ({ default: mod.Toaster })), { ssr: false });

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/static generation, render a minimal loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Providers>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <GlobalNavbar />
          {/* Main content with bottom padding for mobile nav */}
          <main className="flex-grow pb-bottom-nav lg:pb-0">
            {children}
          </main>
          {/* Footer - hidden on mobile */}
          <div className="hidden lg:block">
            <Footer />
          </div>
          {/* Mobile bottom navigation */}
          <MobileBottomNav />
        </div>
        <Toaster position="top-center" richColors />
      </Providers>
    </ThemeProvider>
  );
}
