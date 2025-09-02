'use client';

import { useWalletPersistence } from '@/hooks/useWalletPersistence';

export function WalletRoutePersistence() {
  // This component uses the hook to enable wallet persistence across routes
  useWalletPersistence();
  
  return null; // This component doesn't render anything
}