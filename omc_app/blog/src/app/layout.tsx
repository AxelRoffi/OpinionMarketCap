import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogFooter } from "@/components/BlogFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpinionMarketCap Blog",
  description: "Latest news, updates, and insights from the OpinionMarketCap prediction market platform",
  keywords: ["prediction markets", "blockchain", "Base", "USDC", "blog", "news"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="min-h-screen flex flex-col">
          <BlogHeader />
          <main className="flex-1">
            {children}
          </main>
          <BlogFooter />
        </div>
      </body>
    </html>
  );
}