'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Dynamic imports to prevent SSR issues with wallet providers
const Providers = dynamic(() => import('./providers'), { ssr: false });
const AnalyticsProvider = dynamic(() => import('@/components/providers/AnalyticsProvider').then(mod => ({ default: mod.AnalyticsProvider })), { ssr: false });
const ExtensionErrorSuppressor = dynamic(() => import('@/components/ExtensionErrorSuppressor').then(mod => ({ default: mod.ExtensionErrorSuppressor })), { ssr: false });
const ExtensionErrorBoundary = dynamic(() => import('@/components/ExtensionErrorBoundary').then(mod => ({ default: mod.ExtensionErrorBoundary })), { ssr: false });
const Toaster = dynamic(() => import('sonner').then(mod => ({ default: mod.Toaster })), { ssr: false });
const OnboardingProvider = dynamic(() => import('@/components/onboarding').then(mod => ({ default: mod.OnboardingProvider })), { ssr: false });

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);
  // Poster Arcade is the production chrome for every route in the app.
  // Admin + dev routes all live inside the (poster) route group, so the
  // (poster)/layout.tsx supplies chrome uniformly. The legacy GlobalNavbar
  // / Footer / onboarding chrome is no longer used.

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ExtensionErrorBoundary>
        <Providers>
          <AnalyticsProvider>
            <OnboardingProvider>
              <ExtensionErrorSuppressor />
              {children}
              <Toaster position="top-right" />
            </OnboardingProvider>
          </AnalyticsProvider>
        </Providers>
      </ExtensionErrorBoundary>
    </ThemeProvider>
  );
}
