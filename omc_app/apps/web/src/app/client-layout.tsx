'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent SSR issues with wallet providers
const Providers = dynamic(() => import('./providers'), { ssr: false });
const GlobalNavbar = dynamic(() => import('@/components/GlobalNavbar').then(mod => ({ default: mod.GlobalNavbar })), { ssr: false });
const ExtensionErrorSuppressor = dynamic(() => import('@/components/ExtensionErrorSuppressor').then(mod => ({ default: mod.ExtensionErrorSuppressor })), { ssr: false });
const ExtensionErrorBoundary = dynamic(() => import('@/components/ExtensionErrorBoundary').then(mod => ({ default: mod.ExtensionErrorBoundary })), { ssr: false });
const ModeratedAnswersNotification = dynamic(() => import('@/components/ModeratedAnswersNotification').then(mod => ({ default: mod.ModeratedAnswersNotification })), { ssr: false });
const AdminModerationPanel = dynamic(() => import('@/components/AdminModerationPanel').then(mod => ({ default: mod.AdminModerationPanel })), { ssr: false });
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

  // During SSR/static generation, render a minimal layout
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    );
  }

  return (
    <ExtensionErrorBoundary>
      <Providers>
        <ExtensionErrorSuppressor />
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <GlobalNavbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ModeratedAnswersNotification />
          <AdminModerationPanel isAdmin={false} />
        </div>
        <Toaster position="top-right" />
      </Providers>
    </ExtensionErrorBoundary>
  );
}
