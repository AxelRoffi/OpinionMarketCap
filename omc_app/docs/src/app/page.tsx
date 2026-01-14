'use client';

import { useEffect } from 'react';
import { BarChart3, ExternalLink, Twitter, Github, MessageCircle, BookOpen, Shield, Users } from 'lucide-react';

export default function DocsHome() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Active navigation tracking with Intersection Observer
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-100px 0px -66% 0px'
    });

    document.querySelectorAll('section[id]').forEach((section) => {
      navObserver.observe(section);
    });

    return () => {
      observer.disconnect();
      navObserver.disconnect();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
          /* BASE STYLES & DARK MODE */
          :root {
              --color-bg-primary: #0a0a0a;
              --color-bg-secondary: #1a1a1a;
              --color-text-primary: #ffffff;
              --color-text-secondary: #aaaaaa;
              --color-accent: #3b82f6;
              --color-accent-hover: #60a5fa;
              --sidebar-width: 280px;
              --content-max-width: 900px;
          }

          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }

          html {
              scroll-behavior: smooth;
          }

          body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: var(--color-bg-primary);
              color: var(--color-text-primary);
              line-height: 1.7;
              overflow-x: hidden;
          }

          /* TYPOGRAPHY */
          h1, h2, h3, h4 {
              color: var(--color-text-primary);
              font-weight: 700;
              line-height: 1.3;
          }

          h1 {
              font-size: 2.75rem;
              font-weight: 800;
              margin-bottom: 1rem;
              background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
          }

          h2 { 
              font-size: 2.25rem;
              border-bottom: 2px solid #333; 
              padding-bottom: 0.75rem; 
              margin-top: 4rem;
              margin-bottom: 2rem;
          }

          h3 { 
              font-size: 1.75rem;
              color: #e5e7eb;
              margin-top: 2.5rem;
              margin-bottom: 1.25rem;
          }

          h4 {
              font-size: 1.35rem;
              margin-top: 2rem;
              margin-bottom: 1rem;
              color: #d1d5db;
          }

          p, li {
              line-height: 1.8;
              color: var(--color-text-secondary);
              margin-bottom: 1.25rem;
              font-size: 1.05rem;
          }

          a {
              color: var(--color-accent);
              text-decoration: none;
              transition: all 0.2s ease;
          }

          a:hover {
              color: var(--color-accent-hover);
              text-decoration: underline;
          }

          /* TABLES */
          table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
              background-color: rgba(26, 26, 26, 0.5);
              border-radius: 8px;
              overflow: hidden;
          }

          th, td {
              padding: 14px 18px;
              text-align: left;
              border-bottom: 1px solid #333;
          }

          th {
              background-color: rgba(59, 130, 246, 0.1);
              font-weight: 600;
              color: var(--color-text-primary);
              font-size: 0.95rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }

          tr {
              transition: background-color 0.2s ease;
          }

          tbody tr:hover {
              background-color: rgba(59, 130, 246, 0.05);
          }

          /* LAYOUT STRUCTURE */
          .doc-container {
              display: flex;
              min-height: 100vh;
          }

          /* SIDEBAR (NAV) */
          .sidebar {
              position: sticky;
              left: 0;
              top: 0;
              width: var(--sidebar-width);
              height: 100vh;
              background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
              padding: 30px 0 30px 0;
              overflow-y: auto;
              z-index: 1000;
              border-right: 1px solid #2a2a2a;
              box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
              align-self: flex-start;
          }

          .sidebar::-webkit-scrollbar {
              width: 6px;
          }

          .sidebar::-webkit-scrollbar-track {
              background: #0a0a0a;
          }

          .sidebar::-webkit-scrollbar-thumb {
              background: #333;
              border-radius: 3px;
          }

          .sidebar::-webkit-scrollbar-thumb:hover {
              background: #444;
          }

          .sidebar-header {
              padding: 0 24px 24px;
              margin-bottom: 1.5rem;
              border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          }

          .sidebar-logo {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 8px;
          }

          .sidebar-logo-icon {
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .sidebar-logo-icon svg {
              color: #10b981;
          }

          .sidebar-title {
              font-size: 1.25rem;
              font-weight: 700;
              background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin: 0;
          }

          .sidebar-subtitle {
              font-size: 0.75rem;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
          }

          .sidebar nav ul {
              list-style: none;
              padding: 0 0 40px 0;
              margin: 0;
          }

          .sidebar nav li {
              position: relative;
          }

          .sidebar nav li a {
              display: block;
              padding: 14px 24px;
              color: #aaaaaa;
              text-decoration: none;
              font-size: 0.95rem;
              font-weight: 500;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              border-left: 3px solid transparent;
              position: relative;
          }

          .sidebar nav li a::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 3px;
              background: var(--color-accent);
              transform: scaleY(0);
              transition: transform 0.3s ease;
          }

          .sidebar nav li a:hover {
              background-color: rgba(59, 130, 246, 0.08);
              color: #ffffff;
              text-decoration: none;
              padding-left: 28px;
          }

          .sidebar nav li a:hover::before {
              transform: scaleY(1);
          }

          .sidebar nav li a.active {
              background-color: rgba(59, 130, 246, 0.15);
              color: #3b82f6;
              border-left-color: #3b82f6;
              font-weight: 600;
              padding-left: 28px;
          }

          .sidebar nav li a.active::before {
              transform: scaleY(1);
          }

          /* MAIN CONTENT AREA */
          .main-content-wrapper {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 100vh;
              background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
              margin-left: 0;
          }

          .content-block {
              width: 100%;
              max-width: var(--content-max-width);
              padding: 60px 50px 40px;
              margin: 0 auto;
              flex: 1;
          }

          /* CONTENT SECTIONS */
          .animate-on-scroll {
              opacity: 0;
              transform: translateY(30px);
              transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .animate-on-scroll.animate-in {
              opacity: 1;
              transform: translateY(0);
          }

          .animate-on-scroll.animate-in p,
          .animate-on-scroll.animate-in li {
              animation: fadeInText 0.8s ease forwards;
              opacity: 0;
          }

          .animate-on-scroll.animate-in p:nth-child(1) { animation-delay: 0.1s; }
          .animate-on-scroll.animate-in p:nth-child(2) { animation-delay: 0.15s; }
          .animate-on-scroll.animate-in p:nth-child(3) { animation-delay: 0.2s; }
          .animate-on-scroll.animate-in p:nth-child(4) { animation-delay: 0.25s; }
          .animate-on-scroll.animate-in p:nth-child(5) { animation-delay: 0.3s; }

          .animate-on-scroll.animate-in li:nth-child(1) { animation-delay: 0.1s; }
          .animate-on-scroll.animate-in li:nth-child(2) { animation-delay: 0.15s; }
          .animate-on-scroll.animate-in li:nth-child(3) { animation-delay: 0.2s; }
          .animate-on-scroll.animate-in li:nth-child(4) { animation-delay: 0.25s; }
          .animate-on-scroll.animate-in li:nth-child(5) { animation-delay: 0.3s; }

          .animate-on-scroll.animate-in h3 {
              animation: slideInLeft 0.6s ease forwards;
              opacity: 0;
          }

          .animate-on-scroll.animate-in h4 {
              animation: slideInLeft 0.6s ease forwards;
              animation-delay: 0.1s;
              opacity: 0;
          }

          .animate-on-scroll.animate-in table {
              animation: scaleIn 0.7s ease forwards;
              animation-delay: 0.2s;
              opacity: 0;
          }

          .animate-on-scroll.animate-in ul,
          .animate-on-scroll.animate-in ol {
              animation: fadeInText 0.6s ease forwards;
              animation-delay: 0.15s;
              opacity: 0;
          }

          section {
              margin-bottom: 5rem;
              scroll-margin-top: 100px;
              position: relative;
          }

          section::after {
              content: '';
              position: absolute;
              bottom: -2.5rem;
              left: 50%;
              transform: translateX(-50%);
              width: 60%;
              height: 1px;
              background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
              opacity: 0;
              animation: fadeInDivider 0.8s ease forwards 0.5s;
          }

          @keyframes fadeInDivider {
              to { opacity: 1; }
          }

          /* Enhanced text animations */
          .animate-on-scroll.animate-in strong {
              display: inline-block;
              animation: popIn 0.4s ease forwards;
              animation-delay: 0.3s;
              opacity: 0;
          }

          .animate-on-scroll.animate-in code {
              display: inline-block;
              animation: glowIn 0.6s ease forwards;
              animation-delay: 0.4s;
              opacity: 0;
          }

          /* Content Animations */
          @keyframes fadeInText {
              from {
                  opacity: 0;
                  transform: translateY(20px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }

          @keyframes slideInLeft {
              from {
                  opacity: 0;
                  transform: translateX(-30px);
              }
              to {
                  opacity: 1;
                  transform: translateX(0);
              }
          }

          @keyframes scaleIn {
              from {
                  opacity: 0;
                  transform: scale(0.9);
              }
              to {
                  opacity: 1;
                  transform: scale(1);
              }
          }

          @keyframes popIn {
              from {
                  opacity: 0;
                  transform: scale(0.8);
              }
              to {
                  opacity: 1;
                  transform: scale(1);
              }
          }

          @keyframes glowIn {
              from {
                  opacity: 0;
                  box-shadow: 0 0 0 rgba(59, 130, 246, 0);
              }
              to {
                  opacity: 1;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
              }
          }

          /* UTILITY CLASSES */
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .space-x-2 > * + * { margin-left: 0.5rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .w-8 { width: 2rem; }
          .h-8 { height: 2rem; }
          .w-5 { width: 1.25rem; }
          .h-5 { height: 1.25rem; }
          .w-4 { width: 1rem; }
          .h-4 { height: 1rem; }
          .w-3 { width: 0.75rem; }
          .h-3 { height: 0.75rem; }
          .text-xl { font-size: 1.25rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-white { color: #ffffff; }
          .text-gray-400 { color: #9ca3af; }
          .text-blue-400 { color: #60a5fa; }
          .text-blue-300 { color: #93c5fd; }
          .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
          .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }
          .to-purple-600 { --tw-gradient-to: #9333ea; }
          .bg-gray-900\/50 { background-color: rgba(17, 24, 39, 0.5); }
          .rounded-lg { border-radius: 0.5rem; }
          .border-t { border-top-width: 1px; }
          .border-gray-800 { border-color: #1f2937; }
          .transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }
          .hover\:text-white:hover { color: #ffffff; }
          .hover\:text-blue-300:hover { color: #93c5fd; }
          .inline-flex { display: inline-flex; }
          .gap-2 { gap: 0.5rem; }
          .gap-4 { gap: 1rem; }
          .gap-6 { gap: 1.5rem; }
          .gap-8 { gap: 2rem; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          @media (min-width: 768px) {
              .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
              .md\:flex-row { flex-direction: row; }
          }
          .flex-col { flex-direction: column; }
          .container { width: 100%; max-width: 1200px; margin: 0 auto; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
          .pt-8 { padding-top: 2rem; }
          .mt-8 { margin-top: 2rem; }
          .mt-16 { margin-top: 4rem; }

          strong {
              color: var(--color-text-primary);
              font-weight: 600;
              transition: all 0.3s ease;
          }

          .animate-on-scroll.animate-in strong:hover {
              color: var(--color-accent);
              transform: scale(1.05);
          }

          code {
              background-color: rgba(59, 130, 246, 0.1);
              padding: 3px 8px;
              border-radius: 4px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              color: #93c5fd;
              font-size: 0.9em;
              border: 1px solid rgba(59, 130, 246, 0.2);
              transition: all 0.3s ease;
              cursor: default;
          }

          .animate-on-scroll.animate-in code:hover {
              background-color: rgba(59, 130, 246, 0.2);
              border-color: rgba(59, 130, 246, 0.4);
              box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
              transform: translateY(-1px);
          }

          hr {
              border: none;
              height: 1px;
              background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%);
              margin: 4rem 0;
              opacity: 0;
              animation: expandLine 1s ease forwards;
          }

          @keyframes expandLine {
              from {
                  opacity: 0;
                  transform: scaleX(0);
              }
              to {
                  opacity: 1;
                  transform: scaleX(1);
              }
          }

          ol, ul {
              margin: 1.5rem 0;
              padding-left: 2rem;
          }

          li {
              margin-bottom: 0.75rem;
          }

          li ul, li ol {
              margin: 0.75rem 0;
              padding-left: 2rem;
          }

          /* FOOTER */
          footer {
              width: 100%;
              margin-left: 0 !important;
              margin-top: 0 !important;
          }

          /* RESPONSIVE DESIGN */
          @media (max-width: 768px) {
              :root {
                  --sidebar-width: 0px;
              }

              .sidebar {
                  position: fixed;
                  transform: translateX(-100%);
                  transition: transform 0.3s ease;
              }

              .sidebar.mobile-open {
                  transform: translateX(0);
              }

              .main-content-wrapper {
                  margin-left: 0;
                  width: 100%;
              }

              .content-block {
                  padding: 30px 20px;
              }

              h1 { font-size: 2rem; }
              h2 { font-size: 1.75rem; }
              h3 { font-size: 1.35rem; }
              h4 { font-size: 1.15rem; }
              
              p, li {
                  font-size: 1rem;
              }
          }
        `}</style>

      <div className="doc-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="sidebar-title">OpinionMarketCap</h2>
                <p className="sidebar-subtitle">Documentation</p>
              </div>
            </div>
          </div>
          <nav>
            <ul>
              <li><a href="#intro" className="nav-link">1. Introduction</a></li>
              <li><a href="#concepts" className="nav-link">2. Core Concepts</a></li>
              <li><a href="#quickstart" className="nav-link">3. Quick Start Guide</a></li>
              <li><a href="#trading" className="nav-link">4. Trading Guide</a></li>
              <li><a href="#minters" className="nav-link">5. Opinion Minters</a></li>
              <li><a href="#pool" className="nav-link">6. Pool System</a></li>
              <li><a href="#fees" className="nav-link">7. Fee Structure</a></li>
              <li><a href="#faq" className="nav-link">8. FAQ</a></li>
            </ul>
          </nav>
        </aside>

        <main className="main-content-wrapper">
          <div className="content-block">

            <section id="intro" className="animate-on-scroll">
              <h1>OpinionMarketCap | Official Documentation</h1>

              <h2>1. Introduction</h2>

              <h3>What is OpinionMarketCap (OMC)?</h3>
              <p>OpinionMarketCap is the first <strong>Opinion Lab</strong>, a new digital primitive and an infinite marketplace built on the <strong>Base</strong> blockchain. Our mission is clear: <strong>Own The Narrative, Earn The Profits</strong>.</p>
              <p>We offer a decentralized environment where opinions and convictions on any subject—from culture to technology, or local services—are forged into unique, tradable digital assets with no expiration date. By replacing opaque algorithms with market transparency, we allow collective consensus to determine the value of information.</p>

              <h3>Our Core Value Proposition</h3>
              <ul>
                <li><strong>98% of Value to the Community:</strong> The vast majority of platform fees are redistributed to Question Creators and traders.</li>
                <li><strong>Authentic Conviction:</strong> Participants must <strong>"put your money where your mouth is"</strong>, ensuring authentic conviction is backed by financial stake.</li>
                <li><strong>Security and Fairness:</strong> Our system incorporates Anti-MEV protection to guarantee fair transactions, free from front-running or sandwich attacks.</li>
              </ul>

              <h3>Opinion Lab vs. Prediction Market: A Fundamental Distinction</h3>
              <p>OpinionMarketCap is <strong>not</strong> a traditional prediction market. The distinction is crucial:</p>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Prediction Market (Old Way)</th>
                    <th>Opinion Lab (OpinionMarketCap)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Focus</strong></td>
                    <td>Betting on a specific <strong>future outcome</strong> (a fact).</td>
                    <td>Measuring <strong>sentiment</strong> on non-quantifiable things (a feeling).</td>
                  </tr>
                  <tr>
                    <td><strong>Resolution</strong></td>
                    <td>Resolves once at the expiry date.</td>
                    <td><strong>Never resolves</strong> (Infinite Market).</td>
                  </tr>
                  <tr>
                    <td><strong>Asset</strong></td>
                    <td>Singular future event (e.g., "Who will win the election?").</td>
                    <td><strong>Perpetual Question</strong> (e.g., "Best Pizza in Brooklyn?").</td>
                  </tr>
                  <tr>
                    <td><strong>Opportunity</strong></td>
                    <td>Limited, ends upon resolution.</td>
                    <td>Unlimited, trading continues <strong>forever</strong>.</td>
                  </tr>
                </tbody>
              </table>
              <p>The Opinion Lab is an instrument designed to financially measure sentiment and non-quantifiable narratives, providing a deeper signal than simple likes or upvotes.</p>

              <h3>Current Status</h3>
              <p>OMC is built on <strong>Base</strong>, offering speed and low transaction costs. The platform is currently available on the <strong>Base Sepolia Testnet</strong> for experimentation and testing prior to Mainnet launch.</p>

              <h3>The Three User Roles</h3>
              <ol>
                <li><strong>Minters (Opinion Minters):</strong> Those who create the initial <strong>Opinion</strong> (Question, initial Answer, and initial Price). They earn lifetime royalties on every transaction.</li>
                <li><strong>Traders (Answer Owners):</strong> Those who buy and sell the right to the current Answer. They profit from price movements.</li>
                <li><strong>Pool Members:</strong> Those who collaborate to collectively acquire high-value Answers and share rewards, fostering a community around a shared conviction.</li>
              </ol>
            </section>

            <hr />

            <section id="concepts" className="section-animate">
              <h2>2. Core Concepts</h2>

              <h3>The Anatomy of an Opinion</h3>
              <p>An Opinion on OMC is a combination of three distinct elements:</p>
              <ol>
                <li><strong>The Question:</strong> The underlying topic being debated (e.g., "Best Layer 2 for Gaming?"). <strong>This element never changes.</strong></li>
                <li><strong>The Answer:</strong> The current conviction or narrative (e.g., "Arbitrum"). <strong>This element changes</strong> when a new Trader buys the right to post their own Answer/narrative.</li>
                <li><strong>The Price:</strong> The cost to change the current Answer. <strong>This element changes</strong> based on market activity.</li>
              </ol>
              <p>When a Trader buys an Answer, they are exchanging a Price to secure the right to post their preferred Answer/Narrative.</p>

              <h3>Ownership Types</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ownership Type</th>
                    <th>Asset Held</th>
                    <th>Revenue Stream</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Question Ownership (Minter)</strong></td>
                    <td>The Question asset (the market itself)</td>
                    <td><strong>3% royalty</strong> on <strong>all transactions</strong> for life. The Minter can sell their Question and the associated royalties as they would any other business on the OMC marketplace.</td>
                  </tr>
                  <tr>
                    <td><strong>Answer Ownership (Trader)</strong></td>
                    <td>The right to hold the current narrative/Answer</td>
                    <td><strong>95% of the sales price</strong> when the Answer is bought by a new Trader.</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>Note:</strong> The terms <strong>Trader</strong> and <strong>Answer Owner</strong> are used interchangeably.</p>

              <h3>Price Discovery Mechanism</h3>
              <p>The price to change the current Answer is determined by a transparent, on-chain algorithm that is designed to replicate market conditions.</p>
              <ul>
                <li><strong>Trading the Answer:</strong> The price to acquire the right to change the current Answer can <strong>increase or decrease</strong> based on factors like trading volume and market dynamics, ensuring the price reflects true market demand.</li>
                <li><strong>Algorithm:</strong> The price-determining algorithm is <strong>entirely on-chain</strong>, guaranteeing transparency and immutability.</li>
              </ul>

              <h3>Revenue Streams Overview</h3>
              <p>The OMC system generates revenue for participants through several means:</p>
              <ol>
                <li><strong>Trading Profit:</strong> Realizing a profit by selling the Answer at a higher price than the initial purchase price (95% of the transaction).</li>
                <li><strong>Creation Royalties:</strong> Earning 3% of every transaction on the Question you Minted.</li>
                <li><strong>Pool Sharing:</strong> Sharing profits realized collectively within a Pool.</li>
                <li><strong>Question Sale:</strong> The Minter can sell the ownership of the Question (the 3% royalty stream) to another user.</li>
              </ol>
            </section>

            <hr />

            <section id="quickstart" className="section-animate">
              <h2>3. Quick Start Guide</h2>
              <p>The setup process for OpinionMarketCap is designed to take <strong>under 5 minutes</strong> on the Testnet.</p>

              <h3>Network and Wallet Setup (Base Sepolia)</h3>
              <p>OMC is deployed on Base. To start, configure your wallet (e.g., MetaMask, WalletConnect) for the <strong>Base Sepolia</strong> test network.</p>
              <table>
                <thead>
                  <tr>
                    <th>Detail</th>
                    <th>Value (Testnet)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Network</strong></td>
                    <td>Base Sepolia</td>
                  </tr>
                  <tr>
                    <td><strong>Chain ID</strong></td>
                    <td><code>84532</code></td>
                  </tr>
                  <tr>
                    <td><strong>RPC URL</strong></td>
                    <td>(Please refer to the "Launch App" or "Tutorial" links on <code>opinionmarketcap.xyz</code> for the most stable RPC and up-to-date token addresses.)</td>
                  </tr>
                </tbody>
              </table>

              <h3>Get Testnet Tokens</h3>
              <ol>
                <li><strong>Base Sepolia Ether (ETH):</strong> Obtain gas tokens (ETH) using a standard Base Sepolia faucet.</li>
                <li><strong>Testnet USDC Tokens:</strong> Trading on OMC primarily uses USDC. You will need to use the official OMC faucet (available via the dApp interface) to obtain Testnet USDC.</li>
              </ol>

              <h3>Your First Trade</h3>
              <ol>
                <li><strong>Connect Wallet:</strong> Connect your wallet to the OMC dApp.</li>
                <li><strong>Explore:</strong> Browse the "Browse Questions" section to find a topic of interest.</li>
                <li><strong>Buy the Opinion (Change the Answer):</strong>
                  <ul>
                    <li>Select the existing Answer you wish to change.</li>
                    <li>Confirm the purchase transaction.</li>
                    <li>You will be prompted to <strong>change the current Answer</strong> to your preferred narrative.</li>
                    <li>You can fill in optional fields like a description and a URL to drive external traffic to your narrative.</li>
                  </ul>
                </li>
                <li><strong>Confirmation:</strong> Congratulations, you are now the <strong>owner of the narrative</strong> for this Question, and you influence the discussion over that topic, backed by your digital status and financial stake.</li>
              </ol>
            </section>

            <hr />

            <section id="trading" className="section-animate">
              <h2>4. Trading Guide</h2>
              <p>Trading on OMC is the act of buying and selling the ownership of the current Answer to realize a profit.</p>

              <h3>The Trading Process</h3>
              <p>In general, buying an Answer means paying the price to <strong>change the current Answer</strong> and submit your own narrative.</p>
              <ol>
                <li><strong>Find the Opinion:</strong> Identify a relevant Question.</li>
                <li><strong>Evaluate:</strong> Analyze the price and volume of the Answers. High volume indicates strong market engagement.</li>
                <li><strong>Buy (Change the Answer):</strong> Pay the current price to replace the existing Answer with your own preferred narrative.</li>
                <li><strong>Profit:</strong> When another Trader chooses to buy (and change) the Answer, the previous owner (you) automatically sells the Answer and receives 95% of the transaction price.</li>
              </ol>

              <h3>Basic Strategies</h3>
              <ul>
                <li><strong>Momentum:</strong> Follow Answers whose trading volume is increasing rapidly, betting that the consensus or interest will continue to grow.</li>
                <li><strong>Contrarian:</strong> Bet against the current consensus if you believe the dominant opinion is overvalued and a narrative shift is imminent.</li>
              </ul>

              <h3>Risk Management & Digital Status</h3>
              <p>The primary risk is <strong>capital immobilization</strong>. If the Answer you possess is never bought by a new Trader, or if the price drops, your capital remains locked in that asset.</p>
              <ul>
                <li><strong>The Upside:</strong> The value of owning the narrative is the <strong>"digital status"</strong> it provides. By owning the Answer, you control the current narrative, driving discussions and traffic to your linked content.</li>
                <li><strong>Strategy:</strong> Diversify your holdings across different Questions to mitigate immobilization risk.</li>
              </ul>
            </section>

            <hr />

            <section id="minters" className="section-animate">
              <h2>5. Opinion Minters (Creation)</h2>
              <p>Opinion Minters create the foundational market asset (the Question) and establish the initial narrative. This is the path to generating a passive, perpetual income stream (royalties).</p>

              <h3>Opinion Creation Process</h3>
              <ol>
                <li><strong>Draft the Question:</strong> The Question should be clear, concise, and open to continuous debate (Evergreen).</li>
                <li><strong>Determine Initial Answer:</strong> Establish the single <strong>initial Answer</strong> that will be the starting point of the market.</li>
                <li><strong>Initial Price:</strong> Set the initial price for the first Trader to buy and change the Answer. The initial price range is typically <strong>1-100 USDC</strong>.</li>
                <li><strong>Categorization:</strong> Select the relevant category (Food, Tech, Sports, etc.).</li>
                <li><strong>Pay Creation Fee:</strong> Pay the required fee to forge the Opinion on the blockchain.</li>
              </ol>

              <h3>Structure of Creation Fees</h3>
              <ul>
                <li><strong>Initial Creation Fee:</strong> The current creation fee is <strong>20% of the initial price</strong> determined by the Opinion Minter. The platform reserves the right to adjust this percentage in the future.</li>
                <li><strong>Minimum Fee:</strong> The platform will enforce a minimum creation fee (<strong>e.g., 5 USDC</strong>) to prevent spam and ensure market quality.</li>
                <li><strong>Perpetual Royalties:</strong> The Minter receives <strong>3% of every transaction</strong> on their Question, forever.</li>
              </ul>
            </section>

            <hr />

            <section id="pool" className="section-animate">
              <h2>6. Pool System (Collaboration)</h2>
              <p>The Pool System enables users to pool capital, influence the market as a group, and share profits. It serves to build community and amplify market impact.</p>

              <h3>What is a Pool?</h3>
              <p>A Pool is a collective funding mechanism where multiple members contribute capital to acquire an Answer. This allows participants to acquire high-value Answers that might be too costly for a single Trader, and to share the inherent risks and rewards.</p>

              <h3>Detailed Pool Example: Acquiring a High-Value Answer</h3>
              <p>The Answer <strong>"Kylian Mbappé"</strong> on a popular Question currently costs <strong>1,000 USDC</strong> to acquire. A community decides to pool funds to take ownership and influence the narrative.</p>
              <ol>
                <li><strong>Pool Creation:</strong> <code>mbappe-czar.base.eth</code> creates the Pool, pays the <strong>5 USDC</strong> creation fee, and sets the target at 1,000 USDC with a 48-hour deadline.</li>
                <li><strong>Execution:</strong> The Pool successfully purchases the Answer for 1,000 USDC. The Answer is changed to "Kylian Mbappé (Next Generation GOAT)" and the Pool collectively becomes the Answer Owner.</li>
                <li><strong>Profit Distribution:</strong> 48 hours later, a large fund buys the Answer for <strong>2,000 USDC</strong>.
                  <ul>
                    <li><strong>Gross Revenue for Pool:</strong> $2,000 * 95% = 1,900 USDC</li>
                    <li><strong>Profit:</strong> 900 USDC</li>
                  </ul>
                </li>
              </ol>
              <table>
                <thead>
                  <tr>
                    <th>Pool Member</th>
                    <th>Contribution Ratio</th>
                    <th>Share of Profit (900 USDC)</th>
                    <th>Return (Profit + Initial)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>mbappe-czar.base.eth</code></td>
                    <td>50%</td>
                    <td>450 USDC</td>
                    <td>950 USDC</td>
                  </tr>
                  <tr>
                    <td><code>psg-fan.base.eth</code></td>
                    <td>30%</td>
                    <td>270 USDC</td>
                    <td>570 USDC</td>
                  </tr>
                  <tr>
                    <td><code>crypto-anon.base.eth</code></td>
                    <td>20%</td>
                    <td>180 USDC</td>
                    <td>380 USDC</td>
                  </tr>
                </tbody>
              </table>

              <h3>Penalty and Fund Safety</h3>
              <ul>
                <li><strong>Early Withdrawal Penalty:</strong> To prevent gaming and ensure commitment, a <strong>20% penalty</strong> is applied to contributors who withdraw their funds before the established deadline.</li>
                <li><strong>Non-Execution Safety:</strong> If the Pool fails to meet its funding goal by the deadline, all contributors automatically receive their contributed capital back (minus any withdrawal penalty, if applicable).</li>
              </ul>
            </section>

            <hr />

            <section id="fees" className="section-animate">
              <h2>7. Fee Structure</h2>
              <p>OMC's design emphasizes maximizing community value capture, with 98% of trading fees flowing back into the ecosystem.</p>

              <h3>Trading Fees (Transaction)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Beneficiary</th>
                    <th>Percentage of Sale Price</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Previous Answer Owner (Seller)</strong></td>
                    <td><strong>95%</strong></td>
                    <td>The main profit realized by the Trader.</td>
                  </tr>
                  <tr>
                    <td><strong>Question Creator (Minter)</strong></td>
                    <td><strong>3%</strong></td>
                    <td>Perpetual royalty for creating the asset.</td>
                  </tr>
                  <tr>
                    <td><strong>OMC Platform</strong></td>
                    <td><strong>2%</strong></td>
                    <td>Fee for platform maintenance and development.</td>
                  </tr>
                </tbody>
              </table>

              <h3>Detailed Money Flow Example: "GOAT of Soccer?"</h3>
              <p>Let's assume the question "GOAT of Soccer?" has been minted by <strong><code>omc-minter.base.eth</code></strong>.</p>
              <table>
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Participant</th>
                    <th>Address (Example)</th>
                    <th>Percentage</th>
                    <th>Amount (USDC)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Transaction Value: 100 USDC</strong></td>
                    <td>Trader 2 (Buyer) pays</td>
                    <td>N/A</td>
                    <td>100%</td>
                    <td>100.00</td>
                  </tr>
                  <tr>
                    <td><strong>Distribution</strong></td>
                    <td>Previous Answer Owner (Seller)</td>
                    <td><code>leo-fan.base.eth</code></td>
                    <td>95%</td>
                    <td><strong>95.00</strong></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>Question Minter (Royalty)</td>
                    <td><code>omc-minter.base.eth</code></td>
                    <td>3%</td>
                    <td><strong>3.00</strong></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>OMC Platform Fee</td>
                    <td>N/A</td>
                    <td>2%</td>
                    <td><strong>2.00</strong></td>
                  </tr>
                </tbody>
              </table>
              <p><strong>Outcome:</strong> <code>omc-minter.base.eth</code> earns <strong>3 USDC</strong> perpetually, and <code>leo-fan.base.eth</code> successfully exited their position for a <strong>95 USDC</strong> return. The new Answer Owner is the Trader 2 who paid 100 USDC.</p>

              <h3>Question Creation Fee</h3>
              <ul>
                <li><strong>Initial Fees:</strong> <strong>20% of the initial price</strong> set by the Opinion Minter.</li>
              </ul>

              <h3>Question Ownership Sale</h3>
              <p>If the Minter sells the Question asset itself (the 3% royalty stream):</p>
              <ul>
                <li><strong>Seller (Minter):</strong> 90% of the Question sale price.</li>
                <li><strong>OMC Platform:</strong> 10% of the Question sale price.</li>
              </ul>

              <h3>Anti-MEV Protection</h3>
              <p>OMC integrates protection against <strong>MEV (Maximal Extractable Value)</strong> attacks. This ensures Traders cannot be victims of front-running or sandwich attacks, guaranteeing fair price discovery and execution.</p>
            </section>

            <hr />

            <section id="faq" className="section-animate">
              <h2>8. FAQ (Frequently Asked Questions)</h2>

              <h3>How is OMC fundamentally different from other platforms?</h3>
              <p>OMC is a completely new digital primitive that measures financial engagement toward a narrative, which is exponentially more valuable than simple social media likes or bot-ridden upvotes. The Opinion Lab allows the market to measure the <strong>non-factual and non-quantifiable</strong> through transparent market mechanisms.</p>

              <h3>What is the Economic Incentive System?</h3>
              <p>OMC is designed to create a powerful feedback loop that drives organic activity and rewards participation:</p>
              <ul>
                <li><strong>For Answer Owners (Traders):</strong> They receive 95% of the transaction fee when someone buys (changes) their Answer. This is a direct incentive for Answer Owners to <strong>promote their narrative</strong> and the underlying Question to generate more trading interest.</li>
                <li><strong>For Question Minters:</strong> They receive a 3% royalty on every single transaction on their Question forever. This is a direct incentive for Minters to <strong>actively promote their Questions</strong> to ensure high trading volume.</li>
                <li><strong>Outcome:</strong> <strong>More activity equals more revenue for all participants.</strong></li>
              </ul>

              <h3>How is the platform protected against duplicate Questions?</h3>
              <p>While the platform is permissionless, a natural market defense against low-quality duplicates is implemented:</p>
              <ul>
                <li><strong>Unique, Increasing ID:</strong> Every Question minted receives a unique, sequential ID, which helps in identifying the original Question.</li>
                <li><strong>Natural Market Selection:</strong> Between two similar Questions, the market organically determines which one is more relevant. The Question with the most activity, higher trading volume, and established community will naturally prevail and capture the vast majority of the trading volume.</li>
              </ul>

              <h3>What are the Key Design Characteristics?</h3>
              <ul>
                <li><strong>Permissionless:</strong> The system requires <strong>no central authorization</strong> for Question creation or trading. Anyone can join and participate without gatekeepers.</li>
                <li><strong>Inherent Trade-offs:</strong> This decentralized architecture comes with both significant <strong>advantages</strong> (censorship resistance, transparency) and inherent <strong>disadvantages</strong> (such as potential for spam/duplicate assets, which the market mechanism is designed to mitigate).</li>
              </ul>

              <h3>Why Would People Buy and Own an Answer?</h3>
              <p>There are two primary drivers for acquiring and owning an Answer:</p>
              <ol>
                <li><strong>Digital Status & Influence (The Narrative Value):</strong>
                  <ul>
                    <li>By owning an Answer, you are not just trading; you are <strong>controlling the prevailing narrative</strong>. This grants a unique form of digital status and influence.</li>
                    <li><strong>Business Utility:</strong> Companies, influencers, or brands may buy and hold a specific Answer to control the narrative that directly impacts their product or service. The cost, even if thousands of USDC, is seen as a <strong>marketing expenditure</strong> to maintain the current consensus and drive traffic to their linked content, proving their conviction with financial commitment.</li>
                    <li><strong>The Power of Display:</strong> Spending thousands of dollars to own a specific narrative publicly demonstrates a level of <strong>unshakeable conviction</strong> and <strong>digital status</strong> far beyond what is possible with free engagement metrics like likes or retweets.</li>
                  </ul>
                </li>
                <li><strong>Speculation & Profit:</strong>
                  <ul>
                    <li>The core financial incentive is to buy the Answer at a low price, submit a new narrative, and profit when another Trader comes along, agrees the narrative is valuable, and buys (changes) the Answer at a higher price.</li>
                  </ul>
                </li>
              </ol>

              <h3>How does the platform generate revenue?</h3>
              <p>The OMC platform generates revenue by taking <strong>2% of every trade</strong> plus the <strong>initial creation fees</strong> for new Questions.</p>

              <h3>What is the minimum investment required to participate?</h3>
              <p>OMC is highly accessible:</p>
              <ul>
                <li><strong>Opinion Creation:</strong> You can create a revenue-generating asset in under 30 seconds, starting from a minimum fee of <strong>5 USDC</strong> (the platform's minimum to mint a Question).</li>
                <li><strong>Trading:</strong> You can start changing Answers on existing Questions from as low as <strong>1 USDC</strong>, depending on the market price of the Answer.</li>
              </ul>

              <h3>How is the price of an Answer determined?</h3>
              <p>The price is determined by a transparent, on-chain market algorithm (a bonding curve). The Answer's price <strong>increases and decreases</strong> based on indicators that replicate genuine market mechanisms. This system guarantees that liquidity is always available and that value is solely the result of the market's trading consensus.</p>

              <h3>What are the main risk factors?</h3>
              <p>The primary risks are:</p>
              <ul>
                <li><strong>Price Drop:</strong> The price of the Answer you hold may decrease if the trading consensus shifts strongly to another narrative or if the market for the Question becomes inactive.</li>
                <li><strong>Capital Immobilization:</strong> Your capital remains locked as the value of the Answer you own until another Trader purchases the right to change the Answer. (Remember, there is no final consensus, only Traders exchanging Answers).</li>
              </ul>
            </section>

          </div>
        </main>
      </div>

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
                <a
                  href="https://opinionmarketcap.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Visit Main Site <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://app.opinionmarketcap.xyz/create" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Create Opinion
                  </a>
                </li>
                <li>
                  <a href="https://app.opinionmarketcap.xyz/marketplace" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Marketplace
                  </a>
                </li>
                <li>
                  <a href="https://app.opinionmarketcap.xyz/pools" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Funding Pools
                  </a>
                </li>
                <li>
                  <a href="https://app.opinionmarketcap.xyz/leaderboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Leaderboard
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#intro"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/opinionmarketcap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                  >
                    GitHub <Github className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://opinionmarketcap.xyz/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="https://opinionmarketcap.xyz/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="https://opinionmarketcap.xyz/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Community & Social */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Community</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/opinionmktcap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                  >
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/opinionmarketcap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/opinionmarketcap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Telegram
                  </a>
                </li>
                <li>
                  <a href="https://opinionmarketcap.xyz/blog" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
                <p>&copy; 2024 OpinionMarketCap. All rights reserved.</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Built on Base Blockchain</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="https://opinionmarketcap.xyz/security"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Security
                </a>
                <a
                  href="https://opinionmarketcap.xyz/audit"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Audit Report
                </a>
                <a
                  href="https://opinionmarketcap.xyz/status"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  System Status
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}