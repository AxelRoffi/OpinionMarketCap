import type { Metadata } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './v2.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OMC — Take a stand. Get paid for it.',
  description: 'Mint your hot take. Hold the floor. When someone outbids you, they pay you to leave. You keep 3% forever.',
};

export default function PosterArcadeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${interTight.variable} ${jetbrainsMono.variable} font-body`}>
      {children}
    </div>
  );
}
