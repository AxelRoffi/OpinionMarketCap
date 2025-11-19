'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Code, Globe, TrendingUp, Shield, Zap, Home, ExternalLink, BarChart3 } from "lucide-react";

const navigation = [
  {
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/", icon: Home },
      { name: "Quick Start", href: "/getting-started", icon: Book },
      { name: "Platform Basics", href: "/platform-basics", icon: Book },
      { name: "Wallet Setup", href: "/wallet-setup", icon: Book },
    ]
  },
  {
    title: "Trading & Opinions",
    items: [
      { name: "Creating Opinions", href: "/creating-opinions", icon: TrendingUp },
      { name: "Trading Guide", href: "/trading-guide", icon: TrendingUp },
      { name: "Pool System", href: "/pools", icon: TrendingUp },
      { name: "Fee Structure", href: "/fees", icon: TrendingUp },
    ]
  },
  {
    title: "Technical",
    items: [
      { name: "Smart Contracts", href: "/smart-contracts", icon: Code },
      { name: "API Reference", href: "/api-reference", icon: Globe },
      { name: "Integrations", href: "/integrations", icon: Zap },
      { name: "Security", href: "/security", icon: Shield },
    ]
  },
];

export function DocsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="p-6">
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <BarChart3 className="w-8 h-8 text-emerald-500" />
          <div>
            <h1 className="text-xl font-bold text-white">OpinionMarketCap</h1>
            <p className="text-xs text-gray-400">Documentation</p>
          </div>
        </Link>
      </div>

      <div className="space-y-8">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-emerald-900/50 text-emerald-400 border border-emerald-500/30"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          External Links
        </h3>
        <ul className="space-y-2">
          <li>
            <a
              href="https://test.opinionmarketcap.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>dApp</span>
            </a>
          </li>
          <li>
            <a
              href="https://opinionmarketcap.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Website</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}