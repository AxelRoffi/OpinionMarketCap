// components/ConnectButton.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function CustomConnectButton() {
  return (
    <ConnectButton 
      chainStatus="icon"
      showBalance={false}
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
    />
  );
}