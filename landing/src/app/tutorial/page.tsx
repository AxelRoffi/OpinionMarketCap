import React from 'react';
import TutorialMission from '../TutorialMission';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OMC Tutorial | Learn the Infinite Marketplace',
  description: 'Master the art of opinion trading. Learn how to own narratives and earn profits in the infinite marketplace.',
}

export default function Tutorial() {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <TutorialMission />
    </>
  );
}