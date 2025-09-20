import React from 'react';
import ProfessionalLandingDark from './ProfessionalLandingDark';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpinionMarketCap | The Infinite Marketplace',
  description: 'Own The Narrative, Earn The Profits. Where opinions become tradable assets - mint questions, earn royalties forever.',
}

export default function Landing() {
  return <ProfessionalLandingDark />;
}