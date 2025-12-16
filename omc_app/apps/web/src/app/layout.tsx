import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ExtensionErrorSuppressor } from "@/components/ExtensionErrorSuppressor";
import { ExtensionErrorBoundary } from "@/components/ExtensionErrorBoundary";
import { WalletPersistence } from "@/components/WalletPersistence";
import { WalletRoutePersistence } from "@/components/WalletRoutePersistence";
import { ModeratedAnswersNotification } from "@/components/ModeratedAnswersNotification";
import { AdminModerationPanel } from "@/components/AdminModerationPanel";
import { Footer } from "@/components/Footer";

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
        <ExtensionErrorBoundary>
          <Providers>
            <ExtensionErrorSuppressor />
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <GlobalNavbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <ModeratedAnswersNotification />
              <AdminModerationPanel isAdmin={false} />
            </div>
            <Toaster 
              position="top-right"
            />
          </Providers>
        </ExtensionErrorBoundary>
      </body>
    </html>
  );
}
