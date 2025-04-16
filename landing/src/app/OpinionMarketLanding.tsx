"use client"

import React, { CSSProperties, useEffect } from 'react';

const OpinionMarketLanding = () => {
  // Theme toggle functionality
  useEffect(() => {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      htmlElement.classList.remove('light');
      htmlElement.classList.add('dark');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    }
    
    // Toggle theme on click
    themeToggle?.addEventListener('click', () => {
      if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        htmlElement.classList.add('light');
        if (themeIcon) {
          themeIcon.classList.remove('fa-sun');
          themeIcon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', 'light');
      } else {
        htmlElement.classList.remove('light');
        htmlElement.classList.add('dark');
        if (themeIcon) {
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
        }
        localStorage.setItem('theme', 'dark');
      }
    });
  }, []);

  return (
    <div className="light">
      {/* Header/Navbar */}
      <header className="py-4 px-6 border-b border-main">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-chart-line text-purple-500 text-2xl"></i>
            <span className="font-bold text-xl">Opinion<span className="text-purple-500">Market</span>Cap <span className="text-sm font-normal text-secondary">(OMC)</span></span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-secondary hover:text-purple-500">Features</a>
            <a href="#how-it-works" className="text-secondary hover:text-purple-500">How It Works</a>
            <a href="#pools" className="text-secondary hover:text-purple-500">Opinion Pools</a>
            <a href="#google-alternative" className="text-secondary hover:text-purple-500">Beyond Google</a>
            <a href="#creators" className="text-secondary hover:text-purple-500">For Creators</a>
            <div className="theme-toggle" id="theme-toggle">
              <i className="fas fa-moon text-secondary"></i>
            </div>
          </nav>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Live Ticker */}
      <div className="bg-purple-100 dark:bg-gray-800 py-2 overflow-hidden">
        <div className="ticker">
          <div className="inline-block px-4">
            <span className="badge badge-hot mr-2">HOT🔥</span> "What's the best AI model?" - $215 USDC (↑15%)
          </div>
          <div className="inline-block px-4">
            <span className="badge badge-trending mr-2">TRENDING⚡</span> "Best crypto investment for 2025?" - $438 USDC (↑22%)
          </div>
          <div className="inline-block px-4">
            <span className="badge badge-new mr-2">NEW✨</span> "Which country will lead quantum computing?" - $105 USDC (↑5%)
          </div>
          <div className="inline-block px-4">
            <span className="badge badge-hot mr-2">HOT🔥</span> "Who will win the 2028 election?" - $2,100 USDC (↑8%)
          </div>
          <div className="inline-block px-4">
            <span className="badge badge-trending mr-2">TRENDING⚡</span> "Which L2 will have most TVL by 2026?" - $780 USDC (↑37%)
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Trade Opinions, <span className="gradient-text">Not Just Tokens</span>
            </h1>
            <p className="text-xl text-secondary mb-10">
              The first decentralized marketplace where opinions have real value. Buy answers, earn fees, and build your reputation in the marketplace of ideas. Welcome to <span className="font-semibold">OMC</span>!
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button className="btn-primary">
                <i className="fas fa-rocket mr-2"></i> Start Trading Opinions
              </button>
              <button className="btn-secondary">
                <i className="fas fa-plus-circle mr-2"></i> Create a Question
              </button>
            </div>
          </div>
          
          {/* Platform Stats */}
          <div className="stats-grid mt-16">
            <div className="card p-6 text-center">
              <h3 className="text-secondary mb-2 uppercase text-sm tracking-wider">Total Questions</h3>
              <p className="text-4xl font-bold gradient-text">5,230+</p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-secondary mb-2 uppercase text-sm tracking-wider">Trading Volume</h3>
              <p className="text-4xl font-bold gradient-text">$3.8M</p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-secondary mb-2 uppercase text-sm tracking-wider">Opinion Traders</h3>
              <p className="text-4xl font-bold gradient-text">10,400+</p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-secondary mb-2 uppercase text-sm tracking-wider">Active Pools</h3>
              <p className="text-4xl font-bold gradient-text">842</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-purple-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Introducing A New Asset Class: <span className="gradient-text">Opinion Trading</span></h2>
            <p className="text-xl text-secondary">
              For the first time ever, opinions have real monetary value. Buy the right to answer questions, profit from ownership, and build your reputation as an <span className="font-semibold">OMC</span> Opinion Trader.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="card p-8">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-coins text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Own Valuable Opinions</h3>
              <p className="text-secondary">Buy the right to answer questions and own that answer until someone purchases it from you.</p>
            </div>
            <div className="card p-8">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-chart-line text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Algorithmic Dynamic Pricing</h3>
              <p className="text-secondary">Prices fluctuate between -20% and +100% with each trade, programmatically and randomly designed for sustainable growth.</p>
            </div>
            <div className="card p-8">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-money-bill-wave text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Earn Passive Income</h3>
              <p className="text-secondary">Collect 95% of the fee when someone buys your answer. Create questions to earn 3% of every trade.</p>
            </div>
            <div className="card p-8">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-users text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Join Opinion Pools</h3>
              <p className="text-secondary">Combine resources with others to purchase high-value answers and share the rewards.</p>
            </div>
            <div className="card p-8">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-award text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Build Reputation</h3>
              <p className="text-secondary">Earn badges and status as you grow your portfolio of answers and create successful pools.</p>
            </div>
            <div className="card p-8">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-bolt text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Base Blockchain</h3>
              <p className="text-secondary">Built on Coinbase's Base L2 with lightning-fast transactions and gas fees under $0.01.</p>
            </div>
          </div>
        </div>
      </section>

                  {/* Trending Questions Table Section */}
<section className="py-20">
  <div className="container mx-auto px-6">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Trending <span className="gradient-text">Questions</span></h2>
      
      <div className="card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
        <table className="w-full">
  <thead>
    <tr className="bg-purple-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <th className="px-6 py-4 text-left font-semibold text-sm">Question</th>
      <th className="px-6 py-4 text-left font-semibold text-sm">Current Answer</th>
      <th className="px-6 py-4 text-left font-semibold text-sm">Owner</th>
      <th className="px-6 py-4 text-left font-semibold text-sm">Price</th>
      <th className="px-6 py-4 text-left font-semibold text-sm">24h Change</th>
      <th className="px-6 py-4 text-left font-semibold text-sm">Action</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Most influential Prophet?</span>
        </div>
      </td>
      <td className="px-6 py-4">Satoshi Nakamoto</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">brian.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$3,245</td>
      <td className="px-6 py-4 text-green-500">↑ 67%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Most iconic female fragrance?</span>
        </div>
      </td>
      <td className="px-6 py-4">Chanel No. 5</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x7Fc6...3e51</span>
      </td>
      <td className="px-6 py-4 font-semibold">$1,876</td>
      <td className="px-6 py-4 text-green-500">↑ 34%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Most influential female pop singer?</span>
        </div>
      </td>
      <td className="px-6 py-4">Taylor Swift</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">taylor.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$4,190</td>
      <td className="px-6 py-4 text-green-500">↑ 78%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-new mr-2">NEW✨</span>
          <span className="font-medium">Best programming language for AI?</span>
        </div>
      </td>
      <td className="px-6 py-4">Python</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x3F9c...8dA2</span>
      </td>
      <td className="px-6 py-4 font-semibold">$2,345</td>
      <td className="px-6 py-4 text-green-500">↑ 45%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Greatest film of all time?</span>
        </div>
      </td>
      <td className="px-6 py-4">The Godfather</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">filmcritic.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$5,670</td>
      <td className="px-6 py-4 text-green-500">↑ 22%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Best cryptocurrency investment?</span>
        </div>
      </td>
      <td className="px-6 py-4">Ethereum</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0xaB7c...F431</span>
      </td>
      <td className="px-6 py-4 font-semibold">$3,890</td>
      <td className="px-6 py-4 text-red-500">↓ 12%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-new mr-2">NEW✨</span>
          <span className="font-medium">Most influential philosopher?</span>
        </div>
      </td>
      <td className="px-6 py-4">Aristotle</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">wisdom.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$1,250</td>
      <td className="px-6 py-4 text-green-500">↑ 15%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Most revolutionary tech invention?</span>
        </div>
      </td>
      <td className="px-6 py-4">The Internet</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x42Eb...9D76</span>
      </td>
      <td className="px-6 py-4 font-semibold">$6,720</td>
      <td className="px-6 py-4 text-green-500">↑ 56%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Best country to live in?</span>
        </div>
      </td>
      <td className="px-6 py-4">Switzerland</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">traveler.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$4,320</td>
      <td className="px-6 py-4 text-red-500">↓ 8%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Most important scientific breakthrough?</span>
        </div>
      </td>
      <td className="px-6 py-4">CRISPR gene editing</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x98F5...2cB7</span>
      </td>
      <td className="px-6 py-4 font-semibold">$5,120</td>
      <td className="px-6 py-4 text-green-500">↑ 92%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>

    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Best under $50 sushi in Brooklyn?</span>
        </div>
      </td>
      <td className="px-6 py-4">Sushi Katsuei</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">brooklyn.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$1,245</td>
      <td className="px-6 py-4 text-green-500">↑ 37%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Best wireless earbuds under $100?</span>
        </div>
      </td>
      <td className="px-6 py-4">Nothing Ear (2)</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x1A3d...7B92</span>
      </td>
      <td className="px-6 py-4 font-semibold">$876</td>
      <td className="px-6 py-4 text-green-500">↑ 42%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-new mr-2">NEW✨</span>
          <span className="font-medium">Best coffee shop for working in Austin?</span>
        </div>
      </td>
      <td className="px-6 py-4">Houndstooth Coffee</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">austin.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$590</td>
      <td className="px-6 py-4 text-green-500">↑ 25%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Most comfortable running shoes for beginners?</span>
        </div>
      </td>
      <td className="px-6 py-4">Brooks Ghost 15</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0xF57e...6C19</span>
      </td>
      <td className="px-6 py-4 font-semibold">$1,120</td>
      <td className="px-6 py-4 text-green-500">↑ 53%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Best daily moisturizer with SPF?</span>
        </div>
      </td>
      <td className="px-6 py-4">CeraVe AM Facial Moisturizing Lotion</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">skincare.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$1,840</td>
      <td className="px-6 py-4 text-green-500">↑ 67%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Best meal kit delivery service?</span>
        </div>
      </td>
      <td className="px-6 py-4">HelloFresh</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x6E91...4D83</span>
      </td>
      <td className="px-6 py-4 font-semibold">$2,190</td>
      <td className="px-6 py-4 text-red-500">↓ 5%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Best boutique hotel in Miami?</span>
        </div>
      </td>
      <td className="px-6 py-4">The Betsy South Beach</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">miami.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$3,250</td>
      <td className="px-6 py-4 text-green-500">↑ 78%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-new mr-2">NEW✨</span>
          <span className="font-medium">Best online course platform for beginners?</span>
        </div>
      </td>
      <td className="px-6 py-4">Coursera</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x8b2C...9E05</span>
      </td>
      <td className="px-6 py-4 font-semibold">$850</td>
      <td className="px-6 py-4 text-green-500">↑ 29%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Best non-alcoholic cocktail in San Francisco?</span>
        </div>
      </td>
      <td className="px-6 py-4">True Laurel's Shiso Zero-Proof</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">sfbayarea.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$970</td>
      <td className="px-6 py-4 text-green-500">↑ 45%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-hot mr-2">HOT🔥</span>
          <span className="font-medium">Best air fryer for a family of four?</span>
        </div>
      </td>
      <td className="px-6 py-4">Ninja DZ201 Foodi 8 Quart</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x3D45...5F72</span>
      </td>
      <td className="px-6 py-4 font-semibold">$1,520</td>
      <td className="px-6 py-4 text-green-500">↑ 62%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-trending mr-2">TRENDING⚡</span>
          <span className="font-medium">Best local craft beer in Portland?</span>
        </div>
      </td>
      <td className="px-6 py-4">Great Notion Brewing's Ripe IPA</td>
      <td className="px-6 py-4">
        <span className="text-purple-600 dark:text-purple-400">portland.base.eth</span>
      </td>
      <td className="px-6 py-4 font-semibold">$780</td>
      <td className="px-6 py-4 text-red-500">↓ 7%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
    
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4">
        <div>
          <span className="badge badge-new mr-2">NEW✨</span>
          <span className="font-medium">Best affordable clean beauty brand?</span>
        </div>
      </td>
      <td className="px-6 py-4">The Ordinary</td>
      <td className="px-6 py-4">
        <span className="font-mono text-xs">0x7Ba6...2dE4</span>
      </td>
      <td className="px-6 py-4 font-semibold">$920</td>
      <td className="px-6 py-4 text-green-500">↑ 31%</td>
      <td className="px-6 py-4">
        <button className="py-2 px-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
          Change Answer
        </button>
      </td>
    </tr>
  </tbody>
</table>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <button className="btn-primary">
          <i className="fas fa-plus-circle mr-2"></i> View All Questions
        </button>
      </div>
    </div>
  </div>
</section>

      {/* Google Alternative Section */}
      <section id="google-alternative" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Beyond Google: <span className="gradient-text">Monetary-Based Search</span></h2>
            <p className="text-xl text-secondary">
              While Google relies on a secret proprietary algorithm (PageRank) to determine what's relevant, <span className="font-semibold">OMC</span> introduces a transparent, market-driven approach to ranking information.
            </p>
            <br></br>
            <p className="text-xl text-secondary">
              With time and its economic mechanism, OMC would get bigger && bigger with user-generated questions and its valuable answers <span className="font-semibold">and would challenge Google in terms of search for access to valuable information.</span>
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2">
              <div className="card p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-10 h-10 bg-purple-100 dark:bg-purple-700 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-search text-purple-600 dark:text-white"></i>
                  </span>
                  The Problem With Traditional Search
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="fas fa-times-circle text-red-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Opaque algorithms that no one fully understands</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-times-circle text-red-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Manipulated by SEO and content farms</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-times-circle text-red-500 mt-1 mr-3"></i>
                    <span className="text-secondary">No financial incentives for providing valuable answers</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-times-circle text-red-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Prioritizes advertising revenue over quality</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-times-circle text-red-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Controlled by a few powerful corporations</span>
                  </li>
                </ul>
                
                <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">Google's PageRank: A Black Box</h4>
                  <p className="text-secondary">Google's algorithm uses hundreds of secret signals to rank content in your search results. No transparency, no economic value for creators, and no way to participate in the system.</p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="card p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-10 h-10 bg-purple-100 dark:bg-purple-700 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-lightbulb text-purple-600 dark:text-white"></i>
                  </span>
                  The <span className="gradient-text">OMC</span> Solution
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span className="text-secondary"><strong>Market-based ranking:</strong> The most valuable answers rise to the top based on actual monetary value</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span className="text-secondary"><strong>Transparent mechanics:</strong> Everyone can see exactly how the system works—no secret algorithms</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span className="text-secondary"><strong>Economic incentives:</strong> Answer providers earn real money for valuable contributions</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span className="text-secondary"><strong>Community governance:</strong> Users collectively determine the value of information</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span className="text-secondary"><strong>Decentralized system:</strong> No single entity controls what information is valuable</span>
                  </li>
                </ul>
                
                <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">OMC's Market-Based Ranking: Transparent & Valuable</h4>
                  <p className="text-secondary">When someone pays to change an answer, they're signaling its value. This creates a natural, transparent ranking system where the most valuable information rises to the top—not based on a secret algorithm, but on actual human-assigned value.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6">
              "The future of search isn't PageRank, it's DollarRank"
            </p>
            <button className="btn-primary">
              <i className="fas fa-lightbulb mr-2"></i> See How OMC Replaces Google
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-purple-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Revolutionary <span className="gradient-text">Platform Features</span></h2>
            <p className="text-xl text-secondary">
              OpinionMarketCap (OMC) combines Web3 innovation with market dynamics to create a platform where ideas have tangible value.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Feature Block 1: Opinion Trading */}
            <div className="w-full lg:w-1/2">
              <div className="card p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-10 h-10 bg-purple-100 dark:bg-purple-700 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-exchange-alt text-purple-600 dark:text-white"></i>
                  </span>
                  Opinion Trading Mechanics
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Each question has one current answer owned by someone at any time</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Algorithmically designed pricing causes prices to randomly change between -20% and +100% with each purchase</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Visualize price trends with advanced charts and volume tracking</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Indicators for "Hot 🔥", "Trending ⚡", and "New ✨" questions</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Complete transaction history for each question's ownership</span>
                  </li>
                </ul>
                
                {/* Example Question Card */}
                <div className="mt-8 p-4 bg-purple-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="badge badge-hot mr-2">HOT🔥</span>
                      <h4 className="font-medium">Which AI model will dominate in 2026?</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">$1,230 <span className="text-sm text-green-500">↑67%</span></p>
                      <p className="text-xs text-secondary">Volume: $12,450</p>
                    </div>
                  </div>
                  <p className="bg-white dark:bg-gray-700 p-2 rounded mb-2 text-sm"><strong>Current Answer:</strong> "Claude AI"</p>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Owned by: vitalik.eth</span>
                    <span>14 owners historically</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Block 2: Opinion Pools */}
            <div className="w-full lg:w-1/2">
              <div className="card p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-10 h-10 bg-purple-100 dark:bg-purple-700 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-users text-purple-600 dark:text-white"></i>
                  </span>
                  Opinion Pools
                </h3>
                <p className="text-secondary mb-6">
                  Our revolutionary <strong>Opinion Pools</strong> system allows users to combine resources for greater impact:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Pool funds with like-minded contributors to purchase high-value opinions</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Share ownership and fee rewards proportionally to your contribution</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Earn "Pool Creator" badges for initiating successful pools</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Foster communities around shared perspectives and interests</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-purple-500 mt-1 mr-3"></i>
                    <span className="text-secondary">Track your contributions and rewards across multiple pools</span>
                  </li>
                </ul>
                
                {/* Example Pool Card */}
                <div className="mt-8 p-4 bg-purple-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="badge badge-trending mr-2">TRENDING⚡</span>
                      <h4 className="font-medium">Web3 Gaming Future Pool</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">$956 <span className="text-xs text-secondary">/ $1,230</span></p>
                      <p className="text-xs text-secondary">112 contributors</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <p className="text-sm text-center mb-2">78% funded</p>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded mb-2 text-sm">
                    <strong>Proposed Answer:</strong> "Immutable X and Ronin"
                  </div>
                  <button className="w-full py-2 bg-purple-600 rounded text-sm font-medium text-white hover:bg-purple-700 transition">Contribute to Pool</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Economy Section */}
      <section id="creators" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Creator <span className="gradient-text">Economy</span></h2>
            <p className="text-xl text-secondary">
              Create popular questions and earn passive income through our revolutionary fee structure. With <span className="font-semibold">OMC</span>, creators are rewarded for starting valuable conversations.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2">
              <div className="card p-8 h-full">
                <h3 className="text-2xl font-bold mb-6">Earn Passive Income</h3>
                <p className="text-secondary mb-6">
                  As a question creator, you earn 3% of every transaction fee, forever. No tokens required - direct USDC earnings straight to your wallet.
                </p>
                
                <div className="mb-8">
                  <h4 className="font-semibold mb-2">How Creator Fees Work:</h4>
                  <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-4">
                      <span className="text-secondary">Current Answer Owner</span>
                      <span className="font-bold">95%</span>
                    </div>
                    <div className="flex justify-between mb-4 text-purple-600 dark:text-purple-400">
                      <span>Question Creator</span>
                      <span className="font-bold">3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Platform</span>
                      <span className="font-bold">2%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-coins text-purple-600 dark:text-purple-500 mt-1 mr-3 text-xl"></i>
                    <div>
                      <h4 className="font-semibold">Create Once, Earn Forever</h4>
                      <p className="text-secondary">Ask engaging questions that attract high volume trading</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-chart-line text-purple-600 dark:text-purple-500 mt-1 mr-3 text-xl"></i>
                    <div>
                      <h4 className="font-semibold">Scale Your Earnings</h4>
                      <p className="text-secondary">Create multiple questions to diversify your income streams</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-dollar-sign text-purple-600 dark:text-purple-500 mt-1 mr-3 text-xl"></i>
                    <div>
                      <h4 className="font-semibold">Higher Prices = Higher Rewards</h4>
                      <p className="text-secondary">As answer prices increase, so do your earnings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="card p-8 h-full">
                <h3 className="text-2xl font-bold mb-6">Creator Success Stories</h3>
                
                {/* Testimonial Card */}
                <div className="mb-6 bg-purple-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-700 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-user text-purple-600 dark:text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">@crypto_influencer</h4>
                      <p className="text-xs text-secondary">Creator of 14 questions</p>
                    </div>
                  </div>
                  <p className="text-secondary italic">
                    "I earned 120 USDC in passive income last month just from creating popular questions. The best part is I don't have to maintain them - they generate income automatically on OMC."
                  </p>
                </div>
                
                {/* Earnings Example */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Creator Earnings Example:</h4>
                  <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg">
                    
                    <p className="mb-2"><strong>Question:</strong> "Best crypto investment for 2025?"</p>
                    <ul className="space-y-2 text-sm text-secondary">
                      <li>• Current Price: $438 USDC</li>
                      <li>• Total Volume: $24,500 USDC</li>
                      <li>• Number of Trades: 112</li>
                      <li>• Creator Earnings: $735 USDC (3% of volume)</li>
                    </ul>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-purple-600 rounded font-medium text-white hover:bg-purple-700 transition">
                  <i className="fas fa-plus-circle mr-2"></i> Create Your First Question
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section with Beehiiv Integration */}
      <section className="py-16 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 md:p-10 shadow-lg">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-2/3 mb-6 md:mb-0 md:pr-8">
                  <h3 className="text-2xl font-bold mb-3">Join the <span className="gradient-text">OMC Newsletter</span></h3>
                  <p className="text-secondary mb-4">
                    Get early access, trading insights, and opinion market trends delivered straight to your inbox. Be the first to know when we launch new features!
                  </p>
                  
                  {/* Beehiiv iframe integration */}
                  <iframe 
                    src="https://embeds.beehiiv.com/816397ad-ba2f-457a-898f-265a3673ce4f" 
                    width="100%" 
                    height={320}
                    style={{
                      borderRadius: '4px',
                      margin: 0,
                      backgroundColor: 'transparent'
                    } as CSSProperties}
                  />
                </div>
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-36 h-36 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                      <i className="fas fa-envelope-open-text text-4xl text-purple-600 dark:text-purple-400"></i>
                    </div>
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <i className="fas fa-bell text-xl text-green-600 dark:text-green-400"></i>
                    </div>
                    <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <i className="fas fa-star text-lg text-yellow-600 dark:text-yellow-400"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpinionMarketLanding;