'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Twitter, Github, MessageCircle, BarChart3, Shield } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">AnswerShares</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Trade shares in answers you believe in. The best answers rise to the top through market dynamics.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Questions
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Create Question
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://docs.answershares.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-1"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/answershares"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-1"
                >
                  GitHub <Github className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Social */}
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://twitter.com/answershares"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" /> Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://discord.gg/answershares"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; {currentYear} AnswerShares. All rights reserved.</p>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Built on Base Blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
