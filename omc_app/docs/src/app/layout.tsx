import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DocsNavigation } from "@/components/DocsNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpinionMarketCap Documentation",
  description: "Complete documentation for the OpinionMarketCap prediction market platform",
  keywords: ["prediction markets", "blockchain", "Base", "USDC", "documentation"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}