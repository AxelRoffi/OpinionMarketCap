import React from 'react';
import LandingPage2 from '../LandingPage2';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OMC | The Infinite Marketplace',
  description: 'Own the narrative, earn the profits. OMC - The radical new way to trade opinions.',
}

export default function Landing2() {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <LandingPage2 />
    </>
  );
}