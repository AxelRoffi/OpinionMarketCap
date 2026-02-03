import React from 'react';
import ProfessionalLandingDark from './ProfessionalLandingDark';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpinionMarketCap | Opinions Are Free. Yours Isn\'t.',
  description: 'Put your money where your mouth is. Back your opinion with real money on Base. Get paid when someone disagrees.',
}

export default function Landing() {
  return <ProfessionalLandingDark />;
}