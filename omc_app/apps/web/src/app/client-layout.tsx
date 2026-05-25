'use client';

import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Code-split the heavy provider chain (wagmi + react-query + RainbowKit)
// but allow it to render server-side. wagmi's `ssr: true` config plus
// RainbowKit's `mounted` render-prop on the connect button keep the
// server/client render trees in sync.
const Providers = dynamic(() => import('./providers'));
const AnalyticsProvider = dynamic(
  () =>
    import('@/components/providers/AnalyticsProvider').then((mod) => ({
      default: mod.AnalyticsProvider,
    })),
  { ssr: false },
);
const ExtensionErrorSuppressor = dynamic(
  () =>
    import('@/components/ExtensionErrorSuppressor').then((mod) => ({
      default: mod.ExtensionErrorSuppressor,
    })),
  { ssr: false },
);
const ExtensionErrorBoundary = dynamic(() =>
  import('@/components/ExtensionErrorBoundary').then((mod) => ({
    default: mod.ExtensionErrorBoundary,
  })),
);
const Toaster = dynamic(
  () => import('sonner').then((mod) => ({ default: mod.Toaster })),
  { ssr: false },
);
const OnboardingProvider = dynamic(
  () =>
    import('@/components/onboarding').then((mod) => ({
      default: mod.OnboardingProvider,
    })),
  { ssr: false },
);

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
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
