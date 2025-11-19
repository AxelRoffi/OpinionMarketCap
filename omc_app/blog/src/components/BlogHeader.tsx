import Link from "next/link";
import { ExternalLink, Home, FileText, Info, BarChart3 } from "lucide-react";

export function BlogHeader() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-xl font-bold text-white">OpinionMarketCap</h1>
              <p className="text-xs text-gray-400">Blog</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link href="/categories" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
              <span>Categories</span>
            </Link>
            <Link href="/about" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="https://test.opinionmarketcap.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Launch dApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}