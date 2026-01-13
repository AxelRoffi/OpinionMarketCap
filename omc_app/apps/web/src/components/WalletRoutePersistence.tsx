'use client';

import { useState, useEffect } from 'react';
import { useWalletPersistence } from '@/hooks/useWalletPersistence';

// Inner component that uses wagmi hooks (only rendered on client)
function WalletRoutePersistenceInner() {
  // This component uses the hook to enable wallet persistence across routes
  useWalletPersistence();

  return null; // This component doesn't render anything
}

// Outer wrapper that ensures component only renders on client (after mount)
// This prevents SSR/static generation issues with wagmi hooks
export function WalletRoutePersistence() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/static generation, return null to avoid wagmi context errors
  if (!mounted) {
    return null;
  }

  return <WalletRoutePersistenceInner />;
}