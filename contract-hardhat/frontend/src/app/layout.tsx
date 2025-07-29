import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import { GlobalNavbar } from "@/components/GlobalNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpinionMarketCap",
  description: "Prediction market platform - Trade opinions and earn USDC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-gray-900 text-white">
            <GlobalNavbar />
            <main>
              {children}
            </main>
          </div>
          <Toaster 
            theme="dark"
            position="top-right"
          />
        </Providers>
      </body>
    </html>
  );
}
