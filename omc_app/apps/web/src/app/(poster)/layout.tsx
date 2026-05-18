import { type ReactNode } from 'react';
import { Nav, Halftone } from '@/components/poster-arcade';
import { DappBottomChrome } from './_chrome/DappBottomChrome';

export const metadata = {
  title: 'OpinionMarketCap — Take a stand. Get paid for it.',
};

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="pa-root min-h-screen bg-canvas text-ink font-display">
      <Halftone as="main" className="flex flex-col min-h-screen">
        {/* Top nav */}
        <Nav />

        {/* Route content + bottom chrome. DappBottomChrome handles its own
            content padding and visibility (hidden on admin routes). */}
        <DappBottomChrome>{children}</DappBottomChrome>
      </Halftone>
    </div>
  );
}
