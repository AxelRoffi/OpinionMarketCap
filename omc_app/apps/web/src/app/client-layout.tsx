'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Dynamic imports to prevent SSR issues with wallet providers
const Providers = dynamic(() => import('./providers'), { ssr: false });
const AnalyticsProvider = dynamic(() => import('@/components/providers/AnalyticsProvider').then(mod => ({ default: mod.AnalyticsProvider })), { ssr: false });
const GlobalNavbar = dynamic(() => import('@/components/GlobalNavbar').then(mod => ({ default: mod.GlobalNavbar })), { ssr: false });
const ExtensionErrorSuppressor = dynamic(() => import('@/components/ExtensionErrorSuppressor').then(mod => ({ default: mod.ExtensionErrorSuppressor })), { ssr: false });
const ExtensionErrorBoundary = dynamic(() => import('@/components/ExtensionErrorBoundary').then(mod => ({ default: mod.ExtensionErrorBoundary })), { ssr: false });
const ModeratedAnswersNotification = dynamic(() => import('@/components/ModeratedAnswersNotification').then(mod => ({ default: mod.ModeratedAnswersNotification })), { ssr: false });
const AdminModerationPanel = dynamic(() => import('@/components/AdminModerationPanel').then(mod => ({ default: mod.AdminModerationPanel })), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer').then(mod => ({ default: mod.Footer })), { ssr: false });
const Toaster = dynamic(() => import('sonner').then(mod => ({ default: mod.Toaster })), { ssr: false });
const OnboardingWizard = dynamic(() => import('@/components/onboarding').then(mod => ({ default: mod.OnboardingWizard })), { ssr: false });
const OnboardingProvider = dynamic(() => import('@/components/onboarding').then(mod => ({ default: mod.OnboardingProvider })), { ssr: false });

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  // Poster Arcade redesign lives under /v2/* — it brings its own chrome.
  // Hide legacy navbar/footer/onboarding/admin panel on those routes.
  const isV2 = pathname?.startsWith('/v2') ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/static generation, render a minimal loading state
  // Do NOT render children - they might try to use wagmi hooks before providers are ready
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
              {isV2 ? (
                /* /v2/* — Poster Arcade chrome owns the page; legacy shell stays out of the way */
                <>{children}</>
              ) : (
                <div className="min-h-screen bg-background text-foreground flex flex-col">
                  <GlobalNavbar />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                  <ModeratedAnswersNotification />
                  <AdminModerationPanel isAdmin={false} />
                </div>
              )}
              <Toaster position="top-right" />
              {!isV2 && <OnboardingWizard />}
            </OnboardingProvider>
          </AnalyticsProvider>
        </Providers>
      </ExtensionErrorBoundary>
    </ThemeProvider>
  );
}
