import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { GlobalNavbar } from "@/components/layout";

export const metadata: Metadata = {
  title: "Answer Shares | Trade Opinions Like Stocks",
  description: "Buy and sell shares in answers. The best answers rise to the top.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <GlobalNavbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
