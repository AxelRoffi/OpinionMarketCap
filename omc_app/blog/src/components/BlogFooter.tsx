import Link from "next/link";
import { ExternalLink, BarChart3 } from "lucide-react";

export function BlogFooter() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-bold text-white">OpinionMarketCap</h3>
            </div>
            <p className="text-gray-400 text-sm">
              The world's most advanced prediction market platform built on Base blockchain.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://test.opinionmarketcap.xyz" className="text-gray-400 hover:text-emerald-400 text-sm flex items-center space-x-1">
                  <span>dApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://docs.opinionmarketcap.xyz" className="text-gray-400 hover:text-emerald-400 text-sm flex items-center space-x-1">
                  <span>Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://opinionmarketcap.xyz" className="text-gray-400 hover:text-emerald-400 text-sm flex items-center space-x-1">
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Blog</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-emerald-400 text-sm">Home</Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-emerald-400 text-sm">Categories</Link>
              </li>
              <li>
                <Link href="/archive" className="text-gray-400 hover:text-emerald-400 text-sm">Archive</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-emerald-400 text-sm">About</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm">Discord</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm">Telegram</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm">GitHub</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between text-sm text-gray-400">
          <p>&copy; 2024 OpinionMarketCap. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-emerald-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}