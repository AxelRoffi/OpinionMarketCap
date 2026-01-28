import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import { DEFAULT_META, BASE_URL, PRIMARY_KEYWORDS } from "@/lib/seo";

// Force dynamic rendering to avoid SSR issues with wallet providers
export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: DEFAULT_META.title,
    template: `%s | ${DEFAULT_META.siteName}`,
  },
  description: DEFAULT_META.description,
  keywords: PRIMARY_KEYWORDS,
  authors: [{ name: DEFAULT_META.author }],
  creator: DEFAULT_META.author,
  publisher: DEFAULT_META.author,

  // Canonical URL
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: DEFAULT_META.locale,
    url: BASE_URL,
    siteName: DEFAULT_META.siteName,
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OpinionMarketCap - Trade Opinions on Base Blockchain',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: DEFAULT_META.twitterHandle,
    creator: DEFAULT_META.twitterHandle,
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    images: ['/og-image.png'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Verification (add your IDs when ready)
  // verification: {
  //   google: 'your-google-verification-code',
  // },

  // App-specific
  applicationName: DEFAULT_META.siteName,
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
