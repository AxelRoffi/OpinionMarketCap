'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Twitter, Github, MessageCircle, BookOpen, Shield, Users, BarChart3 } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">OpinionMarketCap</h3>
            </div>
            <p className="text-gray-400 text-sm">
              The decentralized prediction market platform on Base blockchain. Create, trade, and earn from your opinions.
            </p>
            <div className="pt-2">
              <Link 
                href="https://opinionmarketcap.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Visit Main Site <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/create" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Create Opinion
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/pools" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Funding Pools
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Referrals
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://docs.opinionmarketcap.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://github.com/opinionmarketcap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                >
                  GitHub <Github className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Social */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://twitter.com/opinionmktcap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" /> Twitter
                </Link>
              </li>
              <li>
                <Link 
                  href="https://discord.gg/opinionmarketcap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Discord
                </Link>
              </li>
              <li>
                <Link 
                  href="https://t.me/opinionmarketcap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Users className="w-4 h-4" /> Telegram
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
              <p>&copy; {currentYear} OpinionMarketCap. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Built on Base Blockchain</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="/security" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Security
              </Link>
              <Link 
                href="/audit" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Audit Report
              </Link>
              <Link 
                href="/status" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                System Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;