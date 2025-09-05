'use client'

import React from 'react';
import Link from 'next/link';

export default function WhitePaper() {
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Header/Navbar */}
      <header className='py-4 px-6 border-b border-main'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link href="/" className='flex items-center space-x-2'>
            <i className='fas fa-chart-line text-purple-500 text-2xl'></i>
            <span className='font-bold text-xl'>Opinion<span className='text-purple-500'>Market</span>Cap <span className='text-sm font-normal text-secondary'>(OMC)</span></span>
          </Link>
          <Link href="/" className='bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition'>
            Back to Home
          </Link>
        </div>
      </header>

      {/* White Paper Content */}
      <div className='container mx-auto px-6 py-12'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-4xl font-bold mb-6'>OpinionMarketCap: A Decentralized Marketplace for Valuable Information</h1>

          <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8'>
            <p className='text-lg text-center italic text-secondary'>Version 1.0 - April 2025</p>
          </div>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>Abstract</h2>
            <p className='text-secondary mb-4'>
              OpinionMarketCap (OMC) introduces a novel decentralized platform that creates a marketplace for opinions and answers.
              By allowing users to buy the right to answer questions, it establishes a new economic model where the perceived
              value of information is directly reflected in its price.
            </p>
            <p className='text-secondary'>
              This paper outlines the system's architecture, economic incentives, and security measures that combine to create
              a self-sustaining ecosystem for high-quality information exchange. OMC represents a paradigm shift from traditional
              web search and information retrieval systems toward a market-driven approach where information providers are directly
              compensated based on the value of their contributions.
            </p>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>1. Introduction</h2>
            <p className='text-secondary mb-4'>
              The internet has evolved into humanity's primary information repository, yet the mechanisms for determining information
              quality remain largely based on opaque algorithms, centralized moderation, or ad-driven business models that often
              prioritize engagement over accuracy. Traditional search engines like Google provide valuable services but suffer from
              fundamental limitations:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Reliance on algorithmic interpretation of content quality</li>
              <li>Vulnerability to SEO manipulation and content farms</li>
              <li>Misaligned incentives where advertisers, not information providers, capture value</li>
              <li>Centralized control of information ranking and visibility</li>
            </ul>
            <p className='text-secondary mb-4'>
              OpinionMarketCap addresses these limitations by creating a decentralized marketplace for opinions where:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Information value is directly determined by market forces</li>
              <li>Content creators and answer owners are economically rewarded</li>
              <li>Communities can collaboratively fund and maintain high-quality answers</li>
              <li>Value flows to information providers rather than intermediaries</li>
            </ul>
            <p className='text-secondary mb-4'>
              By leveraging blockchain technology, specifically the Base Layer 2 solution, OMC enables a transparent, efficient,
              and economically sustainable system for information exchange.
            </p>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr className='bg-gray-100 dark:bg-gray-800'>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Platform</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Question</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Answer</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Ranking Method</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Value Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Google</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>"Best programming language 2025?"</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Multiple results based on SEO</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Algorithm + Ads</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Ad revenue to Google</td>
                  </tr>
                  <tr className='bg-purple-50 dark:bg-purple-900/20'>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>OMC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>"Best programming language 2025?"</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>"Python for versatility and AI integration"</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Market price: 35 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>95% to answer owner (alex.base.eth), 3% to question creator, 2% to platform</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='mb-12'>
        <h2 className='text-2xl font-bold mb-4'>2. System Overview</h2>
        <p className='text-secondary mb-4'>
            OpinionMarketCap is built as a decentralized application on the Base blockchain with a simple yet powerful economic model.
            At its core are three fundamental components:
        </p>

        <h3 className='text-xl font-bold mt-6 mb-3'>2.1. Questions</h3>
        <p className='text-secondary mb-4'>
            Questions form the foundation of the platform. Each question:
        </p>
        <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
            <li>Has a unique identifier</li>
            <li>Has a creator who pays a fee to mint its question on OMC</li>
            <li>Has a creator who receives ongoing royalties</li>
            <li>Can include supplementary information via IPFS and external links</li>
            <li>Is subject to character limits to ensure clarity and focus</li>
            <li>Maintains a complete history of all answers and transactions</li>
        </ul>

        <div className='overflow-x-auto mt-6'>
            <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
            <thead>
                <tr className='bg-gray-100 dark:bg-gray-800'>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>Question ID</th>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>Question</th>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>Creator</th>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>Total Volume</th>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>Trades</th>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>Creator Royalties</th>
                <th className='border border-gray-300 dark:border-gray-700 p-2'>IPFS Link</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>#423</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>Which L2 has the brightest future in 2025?</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>blockchain_insights.base.eth</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>1,245 USDC</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>17</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>37.35 USDC</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>QmX72... (L2 comparison chart)</td>
                </tr>
                <tr className='bg-purple-50 dark:bg-purple-900/20'>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>#156</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>Best zero-knowledge scaling solution?</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>zk_researcher.base.eth</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>950 USDC</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>12</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>28.5 USDC</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>QmZ83... (Technical diagrams)</td>
                </tr>
                <tr>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>#782</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>Most undervalued gaming token?</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>crypto_gamer.base.eth</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>2,340 USDC</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>25</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>70.2 USDC</td>
                <td className='border border-gray-300 dark:border-gray-700 p-2'>QmT47... (Market analysis)</td>
                </tr>
            </tbody>
            </table>
        </div>

        <h3 className='text-xl font-bold mt-6 mb-3'>2.2. Answers</h3>
        <p className='text-secondary mb-4'>
            Answers represent the current response to a question:
        </p>
        <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
        <li>The most valuable/expensive answer is prominently displayed as the current consensus, reflecting market-validated information ranking</li>
            <li>Ownership of answers can be transferred through purchases</li>
            <li>The price of answers increases probabilistically after each purchase</li>
            <li>Answer owners capture value when their answer is purchased by others</li>
            <li>Answer history records can be accessed</li>
        </ul>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 border-l-4 border-blue-500 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">
        Example: "What's the best DEX for low slippage swaps?"
        </h3>
        <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-medium">
          #212
        </span>
      </div>
    </div>

        <h4 className='text-xl font-bold mt-6 mb-3'></h4>
        

        <div className='overflow-x-auto mt-6'>
            <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
            <thead>
                <tr>
                <th className='border border-gray-300 p-2'>Order</th>
                <th className='border border-gray-300 p-2'>Answer</th>
                <th className='border border-gray-300 p-2'>Owner</th>
                <th className='border border-gray-300 p-2'>Price Paid</th>
                <th className='border border-gray-300 p-2'>Date</th>
                <th className='border border-gray-300 p-2'>Fee Distribution</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className='border border-gray-300 p-2'>1</td>
                <td className='border border-gray-300 p-2'>Uniswap V3</td>
                <td className='border border-gray-300 p-2'>defi_watcher.base.eth</td>
                <td className='border border-gray-300 p-2'>1.00 USDC</td>
                <td className='border border-gray-300 p-2'>Jan 15, 2025</td>
                <td className='border border-gray-300 p-2'>Initial answer</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>2</td>
                <td className='border border-gray-300 p-2'>Curve Finance</td>
                <td className='border border-gray-300 p-2'>liquidity_lover.base</td>
                <td className='border border-gray-300 p-2'>1.32 USDC</td>
                <td className='border border-gray-300 p-2'>Feb 03, 2025</td>
                <td className='border border-gray-300 p-2'>1.25 USDC to previous owner</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>3</td>
                <td className='border border-gray-300 p-2'>Balancer for complex trades</td>
                <td className='border border-gray-300 p-2'>trader_x.base.eth</td>
                <td className='border border-gray-300 p-2'>2.17 USDC</td>
                <td className='border border-gray-300 p-2'>Mar 12, 2025</td>
                <td className='border border-gray-300 p-2'>2.06 USDC to previous owner</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>4</td>
                <td className='border border-gray-300 p-2'>dYdX with limit orders</td>
                <td className='border border-gray-300 p-2'>margin_master.base.eth</td>
                <td className='border border-gray-300 p-2'>4.51 USDC</td>
                <td className='border border-gray-300 p-2'>Apr 02, 2025</td>
                <td className='border border-gray-300 p-2'>4.28 USDC to previous owner</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Next price</td>
                <td className='border border-gray-300 p-2'>--</td>
                <td className='border border-gray-300 p-2'>--</td>
                <td className='border border-gray-300 p-2'>5.86 USDC</td>
                <td className='border border-gray-300 p-2'>--</td>
                <td className='border border-gray-300 p-2'>--</td>
                </tr>
            </tbody>
            </table>
        </div>

        <h3 className='text-xl font-bold mt-6 mb-3'>2.3. Pools</h3>
        <p className='text-secondary mb-4'>
            Pools enable community collaboration:
        </p>
        <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
            <li>Multiple users can contribute funds toward changing an answer</li>
            <li>Pool creators coordinate efforts to reach pricing thresholds</li>
            <li>Contributors receive proportional rewards when pool-owned answers are purchased</li>
            <li>Pools democratize participation when individual price points become prohibitive</li>
        </ul>

        <div className='overflow-x-auto mt-6'>
            <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
            <thead>
                <tr>
                <th className='border border-gray-300 p-2'>Pool Information</th>
                <th className='border border-gray-300 p-2'>Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className='border border-gray-300 p-2'>Question #891</td>
                <td className='border border-gray-300 p-2'>Best AI model for creative writing?</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Current Answer</td>
                <td className='border border-gray-300 p-2'>Claude Haiku</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Current Owner</td>
                <td className='border border-gray-300 p-2'>ai_investor.base.eth</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Current Price</td>
                <td className='border border-gray-300 p-2'>215 USDC</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Next Price</td>
                <td className='border border-gray-300 p-2'>278 USDC</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Pool Name</td>
                <td className='border border-gray-300 p-2'>GPT Advocates</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Pool Creator</td>
                <td className='border border-gray-300 p-2'>gpt_fan.base.eth</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Proposed Answer</td>
                <td className='border border-gray-300 p-2'>GPT-4o with specific prompting techniques</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Total Pooled</td>
                <td className='border border-gray-300 p-2'>320 USDC</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Contributors</td>
                <td className='border border-gray-300 p-2'>12</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>Status</td>
                <td className='border border-gray-300 p-2'>Ready to Execute</td>
                </tr>
            </tbody>
            </table>

            <table className='w-full border-collapse border border-gray-300 mt-4'>
            <thead>
                <tr>
                <th className='border border-gray-300 p-2'>Contributor</th>
                <th className='border border-gray-300 p-2'>Contribution</th>
                <th className='border border-gray-300 p-2'>Percentage</th>
                <th className='border border-gray-300 p-2'>Potential Reward</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className='border border-gray-300 p-2'>gpt_fan.base.eth</td>
                <td className='border border-gray-300 p-2'>100 USDC</td>
                <td className='border border-gray-300 p-2'>31.25%</td>
                <td className='border border-gray-300 p-2'>Proportional share of 95% when sold</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>ai_prompt.base.eth</td>
                <td className='border border-gray-300 p-2'>80 USDC</td>
                <td className='border border-gray-300 p-2'>25%</td>
                <td className='border border-gray-300 p-2'>Proportional share of 95% when sold</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>writer_dao.base.eth</td>
                <td className='border border-gray-300 p-2'>50 USDC</td>
                <td className='border border-gray-300 p-2'>15.63%</td>
                <td className='border border-gray-300 p-2'>Proportional share of 95% when sold</td>
                </tr>
                <tr>
                <td className='border border-gray-300 p-2'>9 other contributors</td>
                <td className='border border-gray-300 p-2'>90 USDC (5-50 USDC each)</td>
                <td className='border border-gray-300 p-2'>28.12%</td>
                <td className='border border-gray-300 p-2'>Proportional share of 95% when sold</td>
                </tr>
            </tbody>
            </table>
        </div>
        </section>


          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>3. Economic Model</h2>
            <p className='text-secondary mb-4'>
              The OMC economic model creates a self-sustaining ecosystem with multiple value capture mechanisms:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>3.1. Dynamic Pricing</h3>
            <p className='text-secondary mb-4'>
              Answer prices follow a probabilistic growth trajectory:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Each new purchase increases the price by -15% to +99%</li>
              <li>The average expected price increase is approximately 10-12%</li>
              <li>Price adjustments are derived from random factors including blockchain variables</li>
              <li>Price floors prevent devaluation below minimum thresholds</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr className='bg-gray-100 dark:bg-gray-800'>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Transaction</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>New Owner</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Last Price</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Next Price</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Change</th>
                    <th className='border border-gray-300 dark:border-gray-700 p-2'>Change %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Initial</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>creator.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>-</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.00 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>-</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>-</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Purchase 1</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>nft_bull.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.00 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.18 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+0.18 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+18%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Purchase 2</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>collector_x.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.18 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.06 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>-0.12 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>-10%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Purchase 3</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>blue_chip.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.06 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.53 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+0.47 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+44%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Purchase 4</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>rare_hunter.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>1.53 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>2.29 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+0.76 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+50%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Purchase 5</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>nft_whale.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>2.29 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>3.96 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+1.67 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+73%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>Purchase 15</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>current_owner.base.eth</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>18.42 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>28.37 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+9.95 USDC</td>
                    <td className='border border-gray-300 dark:border-gray-700 p-2'>+54%</td>
                  </tr>
                </tbody>
              </table>
              <p className='mt-4 text-secondary'>
                This model creates a natural opportunity for value appreciation while maintaining market efficiency. After approximately 100 trades, the expected price can reach 2,100 USDC from an initial 1 USDC, reflecting the compound effect of multiple market participants valuing the information.
              </p>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>3.2. Fee Distribution</h3>
            <p className='text-secondary mb-4'>
              When an answer is purchased, the transaction fee is distributed as follows:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>95% to the current answer owner</li>
              <li>2% to the platform for maintenance and development</li>
              <li>3% to the original question creator</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Transaction Detail</th>
                    <th className='border border-gray-300 p-2'>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question ID</td>
                    <td className='border border-gray-300 p-2'>#512</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Purchase Price</td>
                    <td className='border border-gray-300 p-2'>42 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Buyer</td>
                    <td className='border border-gray-300 p-2'>risk_averse.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Previous Owner</td>
                    <td className='border border-gray-300 p-2'>stablecoin_expert.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question Creator</td>
                    <td className='border border-gray-300 p-2'>finance_guru.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Previous Owner Receives (95%)</td>
                    <td className='border border-gray-300 p-2'>39.9 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Creator Receives (3%)</td>
                    <td className='border border-gray-300 p-2'>1.26 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Platform Receives (2%)</td>
                    <td className='border border-gray-300 p-2'>0.84 USDC</td>
                  </tr>
                </tbody>
              </table>
              <p className='mt-4 text-secondary'>
                This distribution ensures that:
              </p>
              <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
                <li>Answer owners capture significant value from their contributions</li>
                <li>Question creators receive ongoing royalties for initiating valuable discussions</li>
                <li>The platform remains sustainable without relying on advertising or data harvesting</li>
              </ul>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>3.3. Pool Economics</h3>
            <p className='text-secondary mb-4'>
              Pools introduce a collaborative economic model:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Pool creation requires a nominal fee (TBD) split between platform and question creator</li>
              <li>Contributors provide funds toward a common goal</li>
              <li>Rewards are distributed proportionally to contribution amounts</li>
              <li>Pools enable fractional ownership of high-value answers</li>
            </ul>

        <div className="bg-gray-100 p-4 rounded-lg mb-4 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                     Example:"What's the best regulatory country for crypto companies?"
                </h3>
                <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                #123
                </span>
            </div>
        </div>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Pool Information</th>
                    <th className='border border-gray-300 p-2'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Name</td>
                    <td className='border border-gray-300 p-2'>"Regulatory Hawks"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Answer Changed From</td>
                    <td className='border border-gray-300 p-2'>"Cayman Islands"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Answer Changed To</td>
                    <td className='border border-gray-300 p-2'>"Switzerland with specific licensing"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Purchase Price</td>
                    <td className='border border-gray-300 p-2'>650 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Later Sold For</td>
                    <td className='border border-gray-300 p-2'>825 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Contributors</td>
                    <td className='border border-gray-300 p-2'>23</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Reward (95%)</td>
                    <td className='border border-gray-300 p-2'>783.75 USDC</td>
                  </tr>
                </tbody>
              </table>

              <table className='table-auto w-full border-collapse border border-gray-300 mt-4'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Contributor</th>
                    <th className='border border-gray-300 p-2'>Contribution</th>
                    <th className='border border-gray-300 p-2'>Percentage</th>
                    <th className='border border-gray-300 p-2'>Reward Received</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>legal_1.base.eth</td>
                    <td className='border border-gray-300 p-2'>130 USDC</td>
                    <td className='border border-gray-300 p-2'>20%</td>
                    <td className='border border-gray-300 p-2'>156.75 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>crypto_lawyer.base.eth</td>
                    <td className='border border-gray-300 p-2'>65 USDC</td>
                    <td className='border border-gray-300 p-2'>10%</td>
                    <td className='border border-gray-300 p-2'>78.38 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>regulatory_expert.base.eth</td>
                    <td className='border border-gray-300 p-2'>52 USDC</td>
                    <td className='border border-gray-300 p-2'>8%</td>
                    <td className='border border-gray-300 p-2'>62.70 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>20 other contributors</td>
                    <td className='border border-gray-300 p-2'>403 USDC</td>
                    <td className='border border-gray-300 p-2'>62%</td>
                    <td className='border border-gray-300 p-2'>485.92 USDC</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>4. Key Roles and Participants</h2>
            <p className='text-secondary mb-4'>
              The OMC ecosystem involves several key roles:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>4.1. Question Creators</h3>
            <p className='text-secondary mb-4'>
              Question creators initiate discussions and receive ongoing royalties:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Earn 3% of all future transactions related to their question</li>
              <li>Set initial context through question formulation</li>
              <li>Can enhance questions with supporting materials (images, links)</li>
              <li>Maintain a stake in the long-term success of their questions</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Question ID</th>
                    <th className='border border-gray-300 p-2'>Question Created</th>
                    <th className='border border-gray-300 p-2'>Total Transactions</th>
                    <th className='border border-gray-300 p-2'>Total Volume</th>
                    <th className='border border-gray-300 p-2'>Creator Royalties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>#128</td>
                    <td className='border border-gray-300 p-2'>"Most secure non-custodial wallet?"</td>
                    <td className='border border-gray-300 p-2'>53</td>
                    <td className='border border-gray-300 p-2'>2,850 USDC</td>
                    <td className='border border-gray-300 p-2'>85.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>#246</td>
                    <td className='border border-gray-300 p-2'>"Best hardware wallet for multiple coins?"</td>
                    <td className='border border-gray-300 p-2'>38</td>
                    <td className='border border-gray-300 p-2'>1,950 USDC</td>
                    <td className='border border-gray-300 p-2'>58.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>#389</td>
                    <td className='border border-gray-300 p-2'>"Most promising L1 for 2025?"</td>
                    <td className='border border-gray-300 p-2'>67</td>
                    <td className='border border-gray-300 p-2'>4,200 USDC</td>
                    <td className='border border-gray-300 p-2'>126.00 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>#412</td>
                    <td className='border border-gray-300 p-2'>"Best tax software for crypto traders?"</td>
                    <td className='border border-gray-300 p-2'>42</td>
                    <td className='border border-gray-300 p-2'>2,100 USDC</td>
                    <td className='border border-gray-300 p-2'>63.00 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>#583</td>
                    <td className='border border-gray-300 p-2'>"Most secure multisig solution?"</td>
                    <td className='border border-gray-300 p-2'>29</td>
                    <td className='border border-gray-300 p-2'>1,450 USDC</td>
                    <td className='border border-gray-300 p-2'>43.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total</td>
                    <td className='border border-gray-300 p-2'>5 Questions</td>
                    <td className='border border-gray-300 p-2'>229</td>
                    <td className='border border-gray-300 p-2'>12,550 USDC</td>
                    <td className='border border-gray-300 p-2'>376.50 USDC</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>4.2. Answer Owners</h3>
            <p className='text-secondary mb-4'>
              Answer owners provide information and capture value:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Purchase the right to set the answer to a question</li>
              <li>Receive 95% of the purchase price when their answer is bought</li>
              <li>Establish expertise and reputation through answer ownership</li>
              <li>Can be individuals or pools representing communities</li>
            </ul>

            <div className="bg-gray-100 p-4 rounded-lg mb-4 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                     Example: "What type of DeFi liquidity pool combines a stablecoin with Ethereum while offering protection against value fluctuations?"
                </h3>
                <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                #123
                </span>
            </div>
        </div>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Transaction Detail</th>
                    <th className='border border-gray-300 p-2'>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Answer Owner</td>
                    <td className='border border-gray-300 p-2'>defi_whisperer.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Answer</td>
                    <td className='border border-gray-300 p-2'>"USDC-ETH stable pairs with IL hedging"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Purchase Price</td>
                    <td className='border border-gray-300 p-2'>78 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Holding Period</td>
                    <td className='border border-gray-300 p-2'>3 weeks</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Sold For</td>
                    <td className='border border-gray-300 p-2'>105 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Owner Received (95%)</td>
                    <td className='border border-gray-300 p-2'>99.75 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Profit (28% ROI)</td>
                    <td className='border border-gray-300 p-2'>21.75 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>New Owner</td>
                    <td className='border border-gray-300 p-2'>yield_hunter.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>New Answer</td>
                    <td className='border border-gray-300 p-2'>"Stablecoin-only autocompounders with insurance"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>4.3. Pool Creators and Contributors</h3>
            <p className='text-secondary mb-4'>
              Pools enable community participation:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Pool creators organize collaborative efforts</li>
              <li>Contributors provide funds in proportion to their means</li>
              <li>Rewards are distributed based on contribution percentage</li>
              <li>Creates an inclusive model for participation at any price point</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Pool Information</th>
                    <th className='border border-gray-300 p-2'>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question #972</td>
                    <td className='border border-gray-300 p-2'>"Will Bitcoin reach $100K in 2025?"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Current Answer</td>
                    <td className='border border-gray-300 p-2'>"Yes, driven by institutional adoption"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Current Price</td>
                    <td className='border border-gray-300 p-2'>620 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Next Price</td>
                    <td className='border border-gray-300 p-2'>750 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Name</td>
                    <td className='border border-gray-300 p-2'>"Bitcoin Bears"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Creator</td>
                    <td className='border border-gray-300 p-2'>bear_market.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Proposed Answer</td>
                    <td className='border border-gray-300 p-2'>"No, regulatory challenges will limit growth"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Contributors</td>
                    <td className='border border-gray-300 p-2'>15</td>
                  </tr>
                </tbody>
              </table>

              <table className='w-full border-collapse border border-gray-300 mt-4'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Contributor</th>
                    <th className='border border-gray-300 p-2'>Contribution</th>
                    <th className='border border-gray-300 p-2'>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>bear_market.base.eth</td>
                    <td className='border border-gray-300 p-2'>150 USDC</td>
                    <td className='border border-gray-300 p-2'>20%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>crypto_trader.base.eth</td>
                    <td className='border border-gray-300 p-2'>200 USDC</td>
                    <td className='border border-gray-300 p-2'>26.67%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>cautious_investor.base.eth</td>
                    <td className='border border-gray-300 p-2'>100 USDC</td>
                    <td className='border border-gray-300 p-2'>13.33%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>12 other contributors</td>
                    <td className='border border-gray-300 p-2'>300 USDC (5-50 USDC each)</td>
                    <td className='border border-gray-300 p-2'>40%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Pool Amount</td>
                    <td className='border border-gray-300 p-2'>750 USDC</td>
                    <td className='border border-gray-300 p-2'>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>4.4. Governance Roles</h3>
            <p className='text-secondary mb-4'>
              The platform includes defined governance roles:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Administrators manage system parameters and upgrades</li>
              <li>Operators handle day-to-day platform operations</li>
              <li>Treasury managers oversee financial aspects</li>
            </ul>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>5. Technical Architecture</h2>
            <p className='text-secondary mb-4'>
              OpinionMarketCap is built with modern blockchain technology to ensure security, scalability, and user experience:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>5.1. Smart Contract Design</h3>
            <p className='text-secondary mb-4'>
              The core contract implements:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>UUPS upgradeability pattern for future enhancements</li>
              <li>Role-based access control for governance</li>
              <li>Non-custodial financial transactions</li>
              <li>Gas-optimized storage patterns</li>
              <li>Reentrancy protection</li>
              <li>Comprehensive event emissions</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Upgrade Parameter</th>
                    <th className='border border-gray-300 p-2'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Upgrade Method</td>
                    <td className='border border-gray-300 p-2'>UUPS (Universal Upgradeable Proxy Standard)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>New Features</td>
                    <td className='border border-gray-300 p-2'>Enhanced pool functionality, proportional reward distribution</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Authorizer</td>
                    <td className='border border-gray-300 p-2'>Contract owner (ADMIN_ROLE)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Data Migration</td>
                    <td className='border border-gray-300 p-2'>None required (storage layout preserved)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Downtime</td>
                    <td className='border border-gray-300 p-2'>Zero (seamless upgrade)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>User Action Required</td>
                    <td className='border border-gray-300 p-2'>None</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Gas Cost</td>
                    <td className='border border-gray-300 p-2'>0.0015 ETH (~$3.00)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>5.2. Base Layer 2 Integration</h3>
            <p className='text-secondary mb-4'>
              OMC is deployed on Base, a leading Layer 2 blockchain solution, chosen for:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Low transaction costs (typically less than $0.01)</li>
              <li>High throughput (thousands of transactions per second)</li>
              <li>Ethereum security guarantees</li>
              <li>Established ecosystem and tooling</li>
              <li>Growing user base and adoption</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Chain</th>
                    <th className='border border-gray-300 p-2'>Transaction</th>
                    <th className='border border-gray-300 p-2'>Gas Units</th>
                    <th className='border border-gray-300 p-2'>Gas Price</th>
                    <th className='border border-gray-300 p-2'>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Ethereum</td>
                    <td className='border border-gray-300 p-2'>Submit answer to Question #567</td>
                    <td className='border border-gray-300 p-2'>120,000</td>
                    <td className='border border-gray-300 p-2'>25 gwei</td>
                    <td className='border border-gray-300 p-2'>$3.75</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Polygon</td>
                    <td className='border border-gray-300 p-2'>Submit answer to Question #567</td>
                    <td className='border border-gray-300 p-2'>120,000</td>
                    <td className='border border-gray-300 p-2'>50 gwei</td>
                    <td className='border border-gray-300 p-2'>$0.12</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Arbitrum</td>
                    <td className='border border-gray-300 p-2'>Submit answer to Question #567</td>
                    <td className='border border-gray-300 p-2'>120,000</td>
                    <td className='border border-gray-300 p-2'>0.1 gwei</td>
                    <td className='border border-gray-300 p-2'>$0.03</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Base</td>
                    <td className='border border-gray-300 p-2'>Submit answer to Question #567</td>
                    <td className='border border-gray-300 p-2'>120,000</td>
                    <td className='border border-gray-300 p-2'>0.03 gwei</td>
                    <td className='border border-gray-300 p-2'>$0.004</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Page</th>
                    <th className='border border-gray-300 p-2'>Load Time</th>
                    <th className='border border-gray-300 p-2'>Components</th>
                    <th className='border border-gray-300 p-2'>Interactive Time</th>
                    <th className='border border-gray-300 p-2'>Web Vitals Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Home Page</td>
                    <td className='border border-gray-300 p-2'>1.2s</td>
                    <td className='border border-gray-300 p-2'>28</td>
                    <td className='border border-gray-300 p-2'>1.8s</td>
                    <td className='border border-gray-300 p-2'>92/100</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question Detail</td>
                    <td className='border border-gray-300 p-2'>1.5s</td>
                    <td className='border border-gray-300 p-2'>35</td>
                    <td className='border border-gray-300 p-2'>2.1s</td>
                    <td className='border border-gray-300 p-2'>89/100</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Creation</td>
                    <td className='border border-gray-300 p-2'>0.9s</td>
                    <td className='border border-gray-300 p-2'>22</td>
                    <td className='border border-gray-300 p-2'>1.5s</td>
                    <td className='border border-gray-300 p-2'>95/100</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Profile Dashboard</td>
                    <td className='border border-gray-300 p-2'>1.7s</td>
                    <td className='border border-gray-300 p-2'>42</td>
                    <td className='border border-gray-300 p-2'>2.3s</td>
                    <td className='border border-gray-300 p-2'>87/100</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Search Results</td>
                    <td className='border border-gray-300 p-2'>1.3s</td>
                    <td className='border border-gray-300 p-2'>31</td>
                    <td className='border border-gray-300 p-2'>1.9s</td>
                    <td className='border border-gray-300 p-2'>90/100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>6. Security Measures</h2>
            <p className='text-secondary mb-4'>
              OpinionMarketCap incorporates robust security measures to protect the integrity of the market:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>6.1. Anti-MEV Protection</h3>
            <p className='text-secondary mb-4'>
              To prevent manipulation by automated trading bots:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Transaction rate limiting prevents multiple trades per block</li>
              <li>Rapid trade penalties disincentivize sandwich attacks</li>
              <li>Cooldown periods between consecutive trades</li>
              <li>Dynamic fee adjustments for suspicious activity patterns</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Parameter</th>
                    <th className='border border-gray-300 p-2'>Value</th>
                    <th className='border border-gray-300 p-2'>Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>MAX_TRADES_PER_BLOCK</td>
                    <td className='border border-gray-300 p-2'>3</td>
                    <td className='border border-gray-300 p-2'>Limited bot address to 3 transactions per block</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>RAPID_TRADE_WINDOW</td>
                    <td className='border border-gray-300 p-2'>30 seconds</td>
                    <td className='border border-gray-300 p-2'>Increased fees for trades within 30s window</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Detection</td>
                    <td className='border border-gray-300 p-2'>Bot activity on Question #309</td>
                    <td className='border border-gray-300 p-2'>Multiple transaction attempts in single block</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Standard Fee</td>
                    <td className='border border-gray-300 p-2'>5%</td>
                    <td className='border border-gray-300 p-2'>Normal fee distribution (2%/3%)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>MEV Penalty Fee</td>
                    <td className='border border-gray-300 p-2'>20%</td>
                    <td className='border border-gray-300 p-2'>Increased platform fee for rapid trading</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Result</td>
                    <td className='border border-gray-300 p-2'>Failed manipulation</td>
                    <td className='border border-gray-300 p-2'>Bot unable to capture value through MEV</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>6.2. Price Manipulation Prevention</h3>
            <p className='text-secondary mb-4'>
              The system prevents price manipulation:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Maximum price change limits (200%)</li>
              <li>Minimum price floors</li>
              <li>Random price adjustments to prevent predictable exploitation</li>
              <li>Multi-factor entropy sources for price calculations</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Parameter</th>
                    <th className='border border-gray-300 p-2'>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question #472</td>
                    <td className='border border-gray-300 p-2'>"Most undervalued DeFi token?"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Previous Price</td>
                    <td className='border border-gray-300 p-2'>45 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>New Price</td>
                    <td className='border border-gray-300 p-2'>128 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Price Change</td>
                    <td className='border border-gray-300 p-2'>+185%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Max Allowed Change</td>
                    <td className='border border-gray-300 p-2'>200%</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Entropy Sources</td>
                    <td className='border border-gray-300 p-2'>10 (timestamp, prevrandao, nonce, etc.)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Manipulation Attempt</td>
                    <td className='border border-gray-300 p-2'>Failed (unpredictable outcome)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>6.3. Fund Security</h3>
            <p className='text-secondary mb-4'>
              Financial security is ensured through:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Non-custodial transaction model</li>
              <li>Pull payment patterns for fee withdrawals</li>
              <li>Emergency pause functionality</li>
              <li>Role-based access to sensitive functions</li>
              <li>Comprehensive audit trails</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Security Feature</th>
                    <th className='border border-gray-300 p-2'>Implementation</th>
                    <th className='border border-gray-300 p-2'>Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pull Pattern</td>
                    <td className='border border-gray-300 p-2'>claimAccumulatedFees()</td>
                    <td className='border border-gray-300 p-2'>User initiates withdrawal, preventing auto-push attacks</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Balance Tracking</td>
                    <td className='border border-gray-300 p-2'>accumulatedFees mapping</td>
                    <td className='border border-gray-300 p-2'>Accurate balance tracking per address</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Checks-Effects-Interactions</td>
                    <td className='border border-gray-300 p-2'>State updates before transfers</td>
                    <td className='border border-gray-300 p-2'>Prevents reentrancy attacks</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Event Emission</td>
                    <td className='border border-gray-300 p-2'>FeesClaimed event</td>
                    <td className='border border-gray-300 p-2'>Transparent audit trail</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>NonReentrant</td>
                    <td className='border border-gray-300 p-2'>Modifier on withdraw functions</td>
                    <td className='border border-gray-300 p-2'>Prevents multiple withdraw calls</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Example Withdrawal</td>
                    <td className='border border-gray-300 p-2'>235 USDC by defi_wizard.base.eth</td>
                    <td className='border border-gray-300 p-2'>Successful, secure withdrawal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>7. Community Building Features</h2>
            <p className='text-secondary mb-4'>
              OMC is designed to foster vibrant information communities:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>7.1. Pool Collaboration</h3>
            <p className='text-secondary mb-4'>
              Pools enable social coordination:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Shared goals around specific answers</li>
              <li>Transparent contribution tracking</li>
              <li>Collective ownership of information</li>
              <li>Proportional reward distribution</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Pool Information</th>
                    <th className='border border-gray-300 p-2'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question #823</td>
                    <td className='border border-gray-300 p-2'>"Most influential female singer?"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Previous Answer</td>
                    <td className='border border-gray-300 p-2'>"Queen Beyonce"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Previous Owner</td>
                    <td className='border border-gray-300 p-2'>jay-z.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Name</td>
                    <td className='border border-gray-300 p-2'>"Swifties"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pool Creator</td>
                    <td className='border border-gray-300 p-2'>Taylor4ever.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Proposed Answer</td>
                    <td className='border border-gray-300 p-2'>"Taylor Swift"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Contributors</td>
                    <td className='border border-gray-300 p-2'>28</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Amount</td>
                    <td className='border border-gray-300 p-2'>1,250 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Status</td>
                    <td className='border border-gray-300 p-2'>Executed Successfully</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>7.2. Status and Recognition</h3>
            <p className='text-secondary mb-4'>
              The platform incorporates recognition mechanisms:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Pool creator badges for successful collaborations</li>
              <li>Answer ownership history is permanently recorded</li>
              <li>Contribution records establish reputation</li>
              <li>Public transaction history creates transparency</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Achievement</th>
                    <th className='border border-gray-300 p-2'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Badges</td>
                    <td className='border border-gray-300 p-2'>Pool Pioneer (5+ successful pools)</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Questions Created</td>
                    <td className='border border-gray-300 p-2'>8</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Answers Owned</td>
                    <td className='border border-gray-300 p-2'>12</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pools Created</td>
                    <td className='border border-gray-300 p-2'>5</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Pools Contributed To</td>
                    <td className='border border-gray-300 p-2'>17</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Volume Generated</td>
                    <td className='border border-gray-300 p-2'>4,250 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Community Recognition</td>
                    <td className='border border-gray-300 p-2'>Top 50 contributor</td>
                  </tr>
                </tbody>
              </table>

              <table className='w-full border-collapse border border-gray-300 mt-4'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Pool Created</th>
                    <th className='border border-gray-300 p-2'>Question</th>
                    <th className='border border-gray-300 p-2'>Result</th>
                    <th className='border border-gray-300 p-2'>Contributors</th>
                    <th className='border border-gray-300 p-2'>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>AI Truth</td>
                    <td className='border border-gray-300 p-2'>#421: "Most promising AI architecture?"</td>
                    <td className='border border-gray-300 p-2'>Successful</td>
                    <td className='border border-gray-300 p-2'>23</td>
                    <td className='border border-gray-300 p-2'>850 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>DeFi Maximalists</td>
                    <td className='border border-gray-300 p-2'>#534: "Best DeFi yield strategy?"</td>
                    <td className='border border-gray-300 p-2'>Successful</td>
                    <td className='border border-gray-300 p-2'>18</td>
                    <td className='border border-gray-300 p-2'>720 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>L2 Believers</td>
                    <td className='border border-gray-300 p-2'>#602: "Most scalable L2 solution?"</td>
                    <td className='border border-gray-300 p-2'>Successful</td>
                    <td className='border border-gray-300 p-2'>31</td>
                    <td className='border border-gray-300 p-2'>1,450 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>NFT Collectors</td>
                    <td className='border border-gray-300 p-2'>#738: "Next blue-chip NFT collection?"</td>
                    <td className='border border-gray-300 p-2'>Successful</td>
                    <td className='border border-gray-300 p-2'>15</td>
                    <td className='border border-gray-300 p-2'>680 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>ZK Advocates</td>
                    <td className='border border-gray-300 p-2'>#891: "Best zk rollup implementation?"</td>
                    <td className='border border-gray-300 p-2'>Successful</td>
                    <td className='border border-gray-300 p-2'>27</td>
                    <td className='border border-gray-300 p-2'>1,100 USDC</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>7.3. Information Provenance</h3>
            <p className='text-secondary mb-4'>
              All information changes are recorded with:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Timestamp of each answer change</li>
              <li>Identity of the answerer</li>
              <li>Price paid for the answer</li>
              <li>Complete transaction history</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Order</th>
                    <th className='border border-gray-300 p-2'>Date</th>
                    <th className='border border-gray-300 p-2'>Answer</th>
                    <th className='border border-gray-300 p-2'>Owner</th>
                    <th className='border border-gray-300 p-2'>Price Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>1</td>
                    <td className='border border-gray-300 p-2'>Jan 2025</td>
                    <td className='border border-gray-300 p-2'>"Solidity with formal verification"</td>
                    <td className='border border-gray-300 p-2'>security_dev.base.eth</td>
                    <td className='border border-gray-300 p-2'>1 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>2</td>
                    <td className='border border-gray-300 p-2'>Feb 2025</td>
                    <td className='border border-gray-300 p-2'>"Rust with Solana support"</td>
                    <td className='border border-gray-300 p-2'>solana_builder.base.eth</td>
                    <td className='border border-gray-300 p-2'>2.3 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>3</td>
                    <td className='border border-gray-300 p-2'>Mar 2025</td>
                    <td className='border border-gray-300 p-2'>"Vyper for EVM contracts"</td>
                    <td className='border border-gray-300 p-2'>vyper_expert.base.eth</td>
                    <td className='border border-gray-300 p-2'>8.2 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>4</td>
                    <td className='border border-gray-300 p-2'>Apr 2025</td>
                    <td className='border border-gray-300 p-2'>"Move language (Sui/Aptos)"</td>
                    <td className='border border-gray-300 p-2'>move_advocate.base.eth</td>
                    <td className='border border-gray-300 p-2'>14.5 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>5</td>
                    <td className='border border-gray-300 p-2'>May 2025</td>
                    <td className='border border-gray-300 p-2'>"Solidity with AI auditing integration"</td>
                    <td className='border border-gray-300 p-2'>current_owner.base.eth</td>
                    <td className='border border-gray-300 p-2'>32.1 USDC</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>8. Applications and Use Cases</h2>
            <p className='text-secondary mb-4'>
              OpinionMarketCap can transform numerous domains:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>8.1. Information Markets</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Prediction markets for future events</li>
              <li>Expert consensus on complex topics</li>
              <li>Real-time opinion aggregation</li>
              <li>Crowd-sourced knowledge curation</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Question Information</th>
                    <th className='border border-gray-300 p-2'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question #501</td>
                    <td className='border border-gray-300 p-2'>"Will OpenAI release GPT-5 in 2025?"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Creator</td>
                    <td className='border border-gray-300 p-2'>ai_researcher.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Current Answer</td>
                    <td className='border border-gray-300 p-2'>"Yes, but with limited API access"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Current Price</td>
                    <td className='border border-gray-300 p-2'>185 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Transactions</td>
                    <td className='border border-gray-300 p-2'>42</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Volume</td>
                    <td className='border border-gray-300 p-2'>3,250 USDC</td>
                  </tr>
                </tbody>
              </table>

              <table className='w-full border-collapse border border-gray-300 mt-4'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Date</th>
                    <th className='border border-gray-300 p-2'>Event</th>
                    <th className='border border-gray-300 p-2'>Price Before</th>
                    <th className='border border-gray-300 p-2'>Price After</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Feb 15, 2025</td>
                    <td className='border border-gray-300 p-2'>OpenAI CEO hints at new model</td>
                    <td className='border border-gray-300 p-2'>45 USDC</td>
                    <td className='border border-gray-300 p-2'>82 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Mar 10, 2025</td>
                    <td className='border border-gray-300 p-2'>OpenAI announces focus on safety</td>
                    <td className='border border-gray-300 p-2'>95 USDC</td>
                    <td className='border border-gray-300 p-2'>75 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Apr 22, 2025</td>
                    <td className='border border-gray-300 p-2'>Insider leak about GPT-5 training</td>
                    <td className='border border-gray-300 p-2'>98 USDC</td>
                    <td className='border border-gray-300 p-2'>145 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>May 18, 2025</td>
                    <td className='border border-gray-300 p-2'>Contradicting statements from OpenAI</td>
                    <td className='border border-gray-300 p-2'>155 USDC</td>
                    <td className='border border-gray-300 p-2'>185 USDC</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>8.2. Creator Economy</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Direct monetization of valuable insights</li>
              <li>Ongoing royalties for question creators</li>
              <li>Community funding for collaborative content</li>
              <li>Recognition and status for knowledge providers</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Question Creation Date</th>
                    <th className='border border-gray-300 p-2'>Transactions</th>
                    <th className='border border-gray-300 p-2'>Total Volume</th>
                    <th className='border border-gray-300 p-2'>Creator Royalties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Jan 2025</td>
                    <td className='border border-gray-300 p-2'>38</td>
                    <td className='border border-gray-300 p-2'>2,150 USDC</td>
                    <td className='border border-gray-300 p-2'>64.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Jan 2025</td>
                    <td className='border border-gray-300 p-2'>45</td>
                    <td className='border border-gray-300 p-2'>2,800 USDC</td>
                    <td className='border border-gray-300 p-2'>84.00 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Feb 2025</td>
                    <td className='border border-gray-300 p-2'>29</td>
                    <td className='border border-gray-300 p-2'>1,750 USDC</td>
                    <td className='border border-gray-300 p-2'>52.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Feb 2025</td>
                    <td className='border border-gray-300 p-2'>39</td>
                    <td className='border border-gray-300 p-2'>2,300 USDC</td>
                    <td className='border border-gray-300 p-2'>69.00 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Mar 2025</td>
                    <td className='border border-gray-300 p-2'>67</td>
                    <td className='border border-gray-300 p-2'>4,200 USDC</td>
                    <td className='border border-gray-300 p-2'>126.00 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Mar 2025</td>
                    <td className='border border-gray-300 p-2'>71</td>
                    <td className='border border-gray-300 p-2'>4,850 USDC</td>
                    <td className='border border-gray-300 p-2'>145.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Apr 2025</td>
                    <td className='border border-gray-300 p-2'>40</td>
                    <td className='border border-gray-300 p-2'>2,850 USDC</td>
                    <td className='border border-gray-300 p-2'>85.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Apr 2025</td>
                    <td className='border border-gray-300 p-2'>57</td>
                    <td className='border border-gray-300 p-2'>3,950 USDC</td>
                    <td className='border border-gray-300 p-2'>118.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>May 2025</td>
                    <td className='border border-gray-300 p-2'>48</td>
                    <td className='border border-gray-300 p-2'>3,750 USDC</td>
                    <td className='border border-gray-300 p-2'>112.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>May 2025</td>
                    <td className='border border-gray-300 p-2'>63</td>
                    <td className='border border-gray-300 p-2'>4,850 USDC</td>
                    <td className='border border-gray-300 p-2'>145.50 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total</td>
                    <td className='border border-gray-300 p-2'>510</td>
                    <td className='border border-gray-300 p-2'>35,250 USDC</td>
                    <td className='border border-gray-300 p-2'>1,057.50 USDC</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>8.3. Decision Making</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Crowd-sourced answers to strategic questions</li>
              <li>Market-validated opinions on controversial topics</li>
              <li>Price signals indicating information confidence</li>
              <li>Transparent history of opinion evolution</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Question Information</th>
                    <th className='border border-gray-300 p-2'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Question #678</td>
                    <td className='border border-gray-300 p-2'>"Best allocation strategy for DAO treasuries in 2025?"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Creator</td>
                    <td className='border border-gray-300 p-2'>dao_strategist.base.eth</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Current Answer</td>
                    <td className='border border-gray-300 p-2'>"40% ETH, 30% stables, 20% BTC, 10% DAO-specific tokens"</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Current Price</td>
                    <td className='border border-gray-300 p-2'>420 USDC</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Transactions</td>
                    <td className='border border-gray-300 p-2'>35</td>
                  </tr>
                </tbody>
              </table>

              <table className='w-full border-collapse border border-gray-300 mt-4'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Price</th>
                    <th className='border border-gray-300 p-2'>Owner</th>
                    <th className='border border-gray-300 p-2'>Notable Feature</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>1 USDC</td>
                    <td className='border border-gray-300 p-2'>dao_strategist.base.eth</td>
                    <td className='border border-gray-300 p-2'>Initial Answer</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>15 USDC</td>
                    <td className='border border-gray-300 p-2'>treasury_expert.base.eth</td>
                    <td className='border border-gray-300 p-2'>Added BTC allocation</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>218 USDC</td>
                    <td className='border border-gray-300 p-2'>risk_manager.base.eth</td>
                    <td className='border border-gray-300 p-2'>Increased stables during market uncertainty</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>342 USDC</td>
                    <td className='border border-gray-300 p-2'>investment_dao.base.eth</td>
                    <td className='border border-gray-300 p-2'>Added protocol tokens</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>495 USDC</td>
                    <td className='border border-gray-300 p-2'>defi_analyst.base.eth</td>
                    <td className='border border-gray-300 p-2'>Added yield-generating strategies</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>420 USDC</td>
                    <td className='border border-gray-300 p-2'>institutional_advisor.base.eth</td>
                    <td className='border border-gray-300 p-2'>Balanced approach with diversity</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>8.4. Search Alternative</h3>
            <p className='text-secondary mb-4'>
              Market-based answer ranking rather than algorithmic:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Information value determined by actual market prices</li>
              <li>Direct compensation to information providers</li>
              <li>Manipulation resistance through economic incentives</li>
            </ul>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>9. Roadmap</h2>
            <p className='text-secondary mb-4'>
              The OpinionMarketCap roadmap envisions transformative impact:
            </p>

            <h3 className='text-xl font-bold mt-6 mb-3'>Phase 1: Platform Launch</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Core platform deployment</li>
              <li>Basic UI implementation</li>
              <li>Initial community building</li>
              <li>Educational materials</li>
            </ul>

            <div className='overflow-x-auto mt-6'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Metric</th>
                    <th className='border border-gray-300 p-2'>Target</th>
                    
                    <th className='border border-gray-300 p-2'>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Curated Questions + Platform Launch</td>
                    <td className='border border-gray-300 p-2'>100</td>
                    <td className='border border-gray-300 p-2'>July 2025</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>User-Generated Questions</td>
                    <td className='border border-gray-300 p-2'>250</td>
                    <td className='border border-gray-300 p-2'>September 2025</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Daily Active Users (DAU)</td>
                    <td className='border border-gray-300 p-2'>2,500</td>
                    <td className='border border-gray-300 p-2'>December 2025</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Total Transactions</td>
                    <td className='border border-gray-300 p-2'>5,000</td>
                    <td className='border border-gray-300 p-2'>December 2025</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Trading Volume</td>
                    <td className='border border-gray-300 p-2'>100,000 USDC</td>
                    <td className='border border-gray-300 p-2'>December 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-bold mt-6 mb-3'>Phase 2: Enhanced Features</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Advanced pool functionality</li>
              <li>Mobile optimization</li>
              <li>Analytics dashboard</li>
            </ul>

            <h3 className='text-xl font-bold mt-6 mb-3'>Phase 3: Ecosystem Growth</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Integration with other platforms</li>
              <li>Enhanced visualization tools</li>
            </ul>

            <h3 className='text-xl font-bold mt-6 mb-3'>Phase 4: Search Revolution</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Building a comprehensive question database</li>
              <li>Developing specialized search interfaces</li>
              <li>Creating information market indices</li>
              <li>Establishing OMC as the go-to platform for high-value information</li>
            </ul>

            <h3 className='text-xl font-bold mt-6 mb-3'>Long-term Vision</h3>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Replacing traditional search engines with market-driven information discovery</li>
              <li>Creating a creator economy where 97% of volume flows to the OMC community</li>
              <li>Establishing a new paradigm for information valuation and exchange</li>
              <li>Developing a global marketplace for human knowledge</li>
              <li>Within 3-5 years, OpinionMarketCap aims to revolutionize 
                the e-commerce landscape by directly addressing fundamental 
                limitations in the search and discovery industry. 
                By leveraging its decentralized marketplace infrastructure, 
                OMC will enable enterprises to conduct commerce with significantly 
                reduced friction by eliminating intermediaries. Through smart contract technology, 
                businesses can bypass traditional e-commerce platforms that currently extract 10-15% commission
                 on every transaction, creating a more efficient and equitable commercial ecosystem 
                 where value flows directly between merchants and consumers.</li>
            </ul>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4'>10. Conclusion</h2>
            <p className='text-secondary mb-4'>
              OpinionMarketCap represents a fundamental innovation in how we value, exchange, and discover information. By creating a direct market for opinions and answers, it aligns economic incentives with information quality and creates new opportunities for creators, communities, and knowledge seekers.
            </p>
            <p className='text-secondary mb-4'>
              The combination of blockchain technology, market mechanisms, and community collaboration enables a system where:
            </p>
            <ul className='list-disc pl-6 mb-4 space-y-2 text-secondary'>
              <li>Information providers are directly rewarded for valuable contributions</li>
              <li>Communities can collectively determine the value of answers</li>
              <li>Question creators receive ongoing compensation for initiating important discussions</li>
              <li>Users gain access to market-validated information</li>
            </ul>

            <div className='overflow-x-auto mt-4'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Generation</th>
                    <th className='border border-gray-300 p-2'>Paradigm</th>
                    <th className='border border-gray-300 p-2'>Examples</th>
                    <th className='border border-gray-300 p-2'>Value Capture</th>
                    <th className='border border-gray-300 p-2'>User Experience</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Web 1.0</td>
                    <td className='border border-gray-300 p-2'>Manual Curation</td>
                    <td className='border border-gray-300 p-2'>Yahoo Directory</td>
                    <td className='border border-gray-300 p-2'>Platform owners</td>
                    <td className='border border-gray-300 p-2'>Static, limited results</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Web 2.0</td>
                    <td className='border border-gray-300 p-2'>Algorithmic Ranking</td>
                    <td className='border border-gray-300 p-2'>Google Search</td>
                    <td className='border border-gray-300 p-2'>Advertisers</td>
                    <td className='border border-gray-300 p-2'>Dynamic but ad-driven</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Web 3.0</td>
                    <td className='border border-gray-300 p-2'>Market Validation</td>
                    <td className='border border-gray-300 p-2'>OpinionMarketCap</td>
                    <td className='border border-gray-300 p-2'>Content creators</td>
                    <td className='border border-gray-300 p-2'>Value-based results</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className='text-secondary mt-4'>
              When searching for "best AI tools for content creation" on traditional platforms, users receive SEO-optimized listicles. On OMC, the same query shows multiple questions with financially-backed answers:
            </p>

            <div className='mt-4 overflow-x-auto'>
              <table className='w-full border-collapse border border-gray-300 dark:border-gray-700'>
                <thead>
                  <tr>
                    <th className='border border-gray-300 p-2'>Question</th>
                    <th className='border border-gray-300 p-2'>Current Answer</th>
                    <th className='border border-gray-300 p-2'>Owner</th>
                    <th className='border border-gray-300 p-2'>Price</th>
                    <th className='border border-gray-300 p-2'>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-gray-300 p-2'>Best AI suite for content creators?</td>
                    <td className='border border-gray-300 p-2'>"Jasper AI for text, Midjourney for visuals, ElevenLabs for audio"</td>
                    <td className='border border-gray-300 p-2'>content_pro.base.eth</td>
                    <td className='border border-gray-300 p-2'>450 USDC</td>
                    <td className='border border-gray-300 p-2'>85</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Most cost-effective AI content tools?</td>
                    <td className='border border-gray-300 p-2'>"ChatGPT for drafting, Canva AI for images, Descript for audio"</td>
                    <td className='border border-gray-300 p-2'>budget_creator.base.eth</td>
                    <td className='border border-gray-300 p-2'>325 USDC</td>
                    <td className='border border-gray-300 p-2'>62</td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 p-2'>Enterprise-grade AI content solution?</td>
                    <td className='border border-gray-300 p-2'>"Microsoft Copilot suite with Azure integrations"</td>
                    <td className='border border-gray-300 p-2'>enterprise_advisor.base.eth</td>
                    <td className='border border-gray-300 p-2'>580 USDC</td>
                    <td className='border border-gray-300 p-2'>93</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className='text-secondary mt-4'>
              This represents not just opinions, but market-validated consensus with significant financial commitment – a new paradigm for discovering and valuing human knowledge. The financial stakes ensure that information providers have skin in the game, aligning their incentives with information accuracy and creating a more trustworthy information ecosystem for everyone.
            </p>
            <p className='text-secondary mt-4'>
              By putting information to the test of market forces, OpinionMarketCap is creating a future where the best answers rise to the top not through algorithmic manipulation or advertising dollars, but through the collective wisdom and financial backing of knowledgeable participants.
            </p>
            <p className='text-secondary mt-4'>
              As OMC grows, it has the potential to transform our relationship with information, replacing opaque algorithmic ranking with transparent market signals and ensuring that value flows to those who create and curate the world's knowledge.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
