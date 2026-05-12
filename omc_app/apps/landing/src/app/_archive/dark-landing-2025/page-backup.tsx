import React from 'react';
import OpinionMarketLanding from './OpinionMarketLanding';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpinionMarketCap (OMC) | The Marketplace of Ideas',
}

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <OpinionMarketLanding />
    </>
  );
}