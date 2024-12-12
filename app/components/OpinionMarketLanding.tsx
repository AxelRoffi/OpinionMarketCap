'use client'

import React, { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Moon, Sun, ArrowRight, Wallet, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Card Components
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div 
    style={{
      borderRadius: '12px',
      border: '1px solid #eaeaea',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'white'
    }}
    className={className}
  >
    {children}
  </div>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div 
    style={{
      padding: '24px'
    }}
    className={className}
  >
    {children}
  </div>
);

interface MarketQuestion {
  id: number;
  question: string;
  currentAnswer: string;
  price: string;
  change: number;
  volume: string;
  owner: string;
}

export const OpinionMarketLanding: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.beehiiv.com/v2/publications/pub_04278a10-fd19-436b-94e7-5ab8a44e3bc9/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BEEHIIV_API_KEY}`, // This needs to be your actual API key
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: true,
          utm_source: 'website'
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
      } else {
        const errorData = await response.json();
        console.error('Subscription error:', errorData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
};

  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 16px',
    },
    topBanner: {
      backgroundColor: '#4763FF',
      color: 'white',
      padding: '12px 0',
      textAlign: 'center',
      fontWeight: 500
    },
    nav: {
      borderBottom: '1px solid #eaeaea',
      backgroundColor: 'white'
    },
    navInner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px'
    },
    navLink: {
      color: '#4763FF',
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      marginLeft: '16px'
    },
    button: {
      backgroundColor: '#4763FF',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '8px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 500
    },
    outlineButton: {
      backgroundColor: 'transparent',
      color: '#4763FF',
      border: '2px solid #4763FF',
      padding: '10px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 500
    },
    hero: {
      textAlign: 'center',
      padding: '96px 0 64px'
    },
    heroTitle: {
      fontSize: '64px',
      fontWeight: 'bold',
      marginBottom: '24px',
      color: '#111'
    },
    heroSubtitle: {
      fontSize: '24px',
      color: '#666',
      marginBottom: '24px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      maxWidth: '896px',
      margin: '48px auto 0'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    statLabel: {
      color: '#666'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      textAlign: 'left',
      padding: '16px',
      borderBottom: '1px solid #eaeaea',
      fontWeight: 500
    },
    tableCell: {
      padding: '16px',
      borderBottom: '1px solid #eaeaea'
    },
    footer: {
      backgroundColor: '#4763FF',
      color: 'white',
      padding: '64px 0'
    }
  } as const;

  const mockQuestions: MarketQuestion[] = [
    { id: 1, question: "Goat of soccer?", currentAnswer: "Messi", price: "2450", change: 15.5, volume: "125K", owner: "messi.base.eth" },
    { id: 2, question: "Greatest NFT project?", currentAnswer: "BAYC", price: "1850", change: -5.2, volume: "82K", owner: "punk.base.eth" },
    { id: 3, question: "Best Pizza in NY?", currentAnswer: "Grimaldi's", price: "3200", change: 25.8, volume: "151K", owner: "nyc.base.eth" },
    { id: 4, question: "Most trusted crypto-exchange?", currentAnswer: "Binance", price: "4100", change: 12.3, volume: "203K", owner: "trader.base.eth" },
    { id: 5, question: "Best Hip Hop Album ever?", currentAnswer: "Illmatic", price: "2800", change: -8.4, volume: "95K", owner: "beats.base.eth" },
    { id: 6, question: "Most beautiful city?", currentAnswer: "Paris", price: "3600", change: 18.9, volume: "178K", owner: "travel.base.eth" },
    { id: 7, question: "Best watch brand?", currentAnswer: "Rolex", price: "5200", change: 22.1, volume: "245K", owner: "luxe.base.eth" },
    { id: 8, question: "Most iconic luxury brand?", currentAnswer: "Louis Vuitton", price: "4800", change: -3.7, volume: "192K", owner: "fashion.base.eth" },
    { id: 9, question: "Best SF movie ever?", currentAnswer: "Blade Runner", price: "2900", change: 9.6, volume: "134K", owner: "film.base.eth" },
    { id: 10, question: "Goat of Basketball?", currentAnswer: "Jordan", price: "4500", change: 16.2, volume: "215K", owner: "nba.base.eth" }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Top Banner */}
      <div style={styles.topBanner as React.CSSProperties}>
        🚀 Built on Base blockchain - The most efficient L2 for Web3 social applications
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={{ ...styles.container, ...styles.navInner }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp style={{ height: 24, width: 24, color: '#4763FF' }} />
            <span style={{ marginLeft: '8px', fontSize: '20px', fontWeight: 600 }}>
              OpinionMarketCap
            </span>
            <Link href="/roadmap" style={styles.navLink}>
              Roadmap <ExternalLink style={{ marginLeft: 4, height: 16, width: 16 }} />
            </Link>
            <Link href="/twitter" style={styles.navLink}>
              Twitter <ExternalLink style={{ marginLeft: 4, height: 16, width: 16 }} />
            </Link>
          </div>
          <button style={styles.button}>
            <Wallet style={{ height: 20, width: 20 }} />
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>
            Trade Opinions, Not Just Crypto
          </h1>
          <p style={styles.heroSubtitle}>
            The first decentralized opinion exchange platform on Base
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button style={styles.button}>Start Trading</button>
            <button style={styles.outlineButton}>Learn More</button>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <Card>
              <CardContent>
                <div style={styles.statValue}>1,234</div>
                <div style={styles.statLabel}>Active Questions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div style={styles.statValue}>$5.82M</div>
                <div style={styles.statLabel}>Total Volume in USDC</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div style={styles.statValue}>892</div>
                <div style={styles.statLabel}>Active Traders</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Questions Table */}
        <div style={{ margin: '64px 0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Top Questions
          </h2>
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>#</th>
                    <th style={styles.tableHeader}>Question</th>
                    <th style={styles.tableHeader}>Current Opinion</th>
                    <th style={styles.tableHeader}>Price (USDC)</th>
                    <th style={styles.tableHeader}>24h Change</th>
                    <th style={styles.tableHeader}>Volume</th>
                    <th style={styles.tableHeader}>Owner</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockQuestions.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.tableCell}>{item.id}</td>
                      <td style={styles.tableCell}>{item.question}</td>
                      <td style={styles.tableCell}>{item.currentAnswer}</td>
                      <td style={styles.tableCell}>${item.price}</td>
                      <td style={{ 
                        ...styles.tableCell, 
                        color: item.change >= 0 ? '#10B981' : '#EF4444'
                      }}>
                        {item.change >= 0 ? (
                          <ChevronUp style={{ display: 'inline', height: 16, width: 16 }} />
                        ) : (
                          <ChevronDown style={{ display: 'inline', height: 16, width: 16 }} />
                        )}
                        {Math.abs(item.change)}%
                      </td>
                      <td style={styles.tableCell}>${item.volume}</td>
                      <td style={styles.tableCell}>{item.owner}</td>
                      <td style={styles.tableCell}>
                        <button style={{ ...styles.button, padding: '8px 16px', fontSize: '14px' }}>
                          Change Opinion
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div style={{ margin: '64px 0', maxWidth: '960px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '48px' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: '0 auto', maxWidth: '960px', justifyContent: 'center', }}>
            {/* Card 1: Change Opinions */}
            <Card>
              <CardContent>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Buy & Sell Opinions
                </h3>
                <p style={{ fontSize: '20px', color: '#666', marginBottom: '24px' }}>
                  Buy the right to change opinions using USDC
                </p>
                <div style={{ 
                  backgroundColor: '#F3F4F6', 
                  padding: '24px', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#666'
                }}>
                  Example: If someone changes your opinion for 1000 USDC, you receive 950 USDC (95%).
                  
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Exponential Growth */}
            <Card>
              <CardContent>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Exponential Growth
                </h3>
                <p style={{ fontSize: '20px', color: '#666' }}>
                  ~15% price increase per trade. After 100 trades, opinions can cost millions to change!
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Permanent Opinions */}
            <Card>
              <CardContent>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Permanent Opinions
                </h3>
                <p style={{ fontSize: '20px', color: '#666' }}>
                  Engrave unchangeable opinions for 100,000,000 USDC
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Add Questions */}
            <Card>
              <CardContent>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Create Opinion Market & Make a Passive Income 4EVER !!
                </h3>
                <p style={{ fontSize: '20px', color: '#666' }}>
                  Phase 1, only admin adds opinion market. Phase 2 users can add opinion markets for a fee and earn 4% on each trade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Newsletter Section */}
        <div style={styles.footer}>
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Stay Updated
            </h2>
            <p style={{ marginBottom: '32px' }}>
              Get early access and updates about OpinionMarketCap
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  width: '100%',
                  maxWidth: '320px'
                }}
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                style={{ 
                  backgroundColor: 'white',
                  color: '#4763FF',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                <ArrowRight style={{ height: 16, width: 16 }} />
              </button>
            </form>
            {submitStatus === 'success' && (
              <p style={{ color: 'white', marginTop: '16px' }}>✓ Thanks for subscribing!</p>
            )}
            {submitStatus === 'error' && (
              <p style={{ color: 'white', marginTop: '16px' }}>Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};