"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { TrendingUp, Plus, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Mock data for development - will be replaced with contract reads
const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "Best L2 for DeFi?",
    creator: "0x1234...5678",
    totalVolume: 2450,
    answers: [
      { id: 1, text: "Base", shares: 450, poolValue: 892, priceChange: 23.5 },
      { id: 2, text: "Arbitrum", shares: 320, poolValue: 534, priceChange: 12.1 },
      { id: 3, text: "Optimism", shares: 180, poolValue: 245, priceChange: -5.2 },
    ],
  },
  {
    id: 2,
    text: "Most undervalued AI token?",
    creator: "0xabcd...ef01",
    totalVolume: 1820,
    answers: [
      { id: 4, text: "FET", shares: 280, poolValue: 445, priceChange: 45.2 },
      { id: 5, text: "RENDER", shares: 210, poolValue: 312, priceChange: 18.7 },
      { id: 6, text: "TAO", shares: 150, poolValue: 198, priceChange: -2.1 },
    ],
  },
  {
    id: 3,
    text: "Next 10x memecoin?",
    creator: "0x9876...5432",
    totalVolume: 5230,
    answers: [
      { id: 7, text: "PEPE", shares: 890, poolValue: 1845, priceChange: 67.3 },
      { id: 8, text: "WIF", shares: 650, poolValue: 1120, priceChange: 34.5 },
      { id: 9, text: "BONK", shares: 420, poolValue: 678, priceChange: 8.9 },
    ],
  },
];

function AnswerCard({
  answer,
  rank,
  onBuy,
  onSell
}: {
  answer: typeof MOCK_QUESTIONS[0]["answers"][0];
  rank: number;
  onBuy: () => void;
  onSell: () => void;
}) {
  const pricePerShare = answer.poolValue / answer.shares;
  const isPositive = answer.priceChange >= 0;

  const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <span className="text-2xl">{medalEmoji || rank}</span>
        <div>
          <div className="font-semibold text-lg">{answer.text}</div>
          <div className="text-sm text-muted-foreground">
            {answer.shares.toLocaleString()} shares · ${pricePerShare.toFixed(2)}/share
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1 font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {isPositive ? "+" : ""}{answer.priceChange.toFixed(1)}%
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBuy}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Buy
          </button>
          <button
            onClick={onSell}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-lg font-medium transition-colors"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: typeof MOCK_QUESTIONS[0] }) {
  const [expanded, setExpanded] = useState(true);

  // Sort answers by pool value (market cap)
  const sortedAnswers = [...question.answers].sort((a, b) => b.poolValue - a.poolValue);
  const leadingAnswer = sortedAnswers[0];

  return (
    <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
      {/* Question Header */}
      <div
        className="p-6 cursor-pointer hover:bg-card/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>by {question.creator}</span>
              <span>·</span>
              <span>${question.totalVolume.toLocaleString()} volume</span>
              <span>·</span>
              <span>{question.answers.length} answers</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Leading Answer</div>
            <div className="text-lg font-semibold text-primary">{leadingAnswer.text}</div>
          </div>
        </div>
      </div>

      {/* Answers List */}
      {expanded && (
        <div className="px-6 pb-6 space-y-3">
          {sortedAnswers.map((answer, index) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              rank={index + 1}
              onBuy={() => console.log("Buy", answer.text)}
              onSell={() => console.log("Sell", answer.text)}
            />
          ))}

          {/* Add Answer Button */}
          <button className="w-full p-4 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Propose New Answer ($5 stake)
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Opinion Shares</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">BETA</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
              <Plus className="w-5 h-5" />
              Create Question
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Trade Opinions Like Stocks
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Buy shares in answers you believe will become popular.
          Sell anytime. The most popular answer leads.
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold">$9.5K</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Active Questions</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold">9</div>
            <div className="text-sm text-muted-foreground">Tradeable Answers</div>
          </div>
        </div>
      </section>

      {/* Questions Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Trending Questions</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-secondary rounded-lg text-sm">Hot</button>
            <button className="px-3 py-1.5 hover:bg-secondary rounded-lg text-sm text-muted-foreground">New</button>
            <button className="px-3 py-1.5 hover:bg-secondary rounded-lg text-sm text-muted-foreground">Top</button>
          </div>
        </div>

        <div className="space-y-6">
          {MOCK_QUESTIONS.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">1. Create or Propose</h3>
            <p className="text-sm text-muted-foreground">
              Anyone can create a question ($2) or propose an answer ($5 stake becomes your first shares)
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">2. Buy & Sell Shares</h3>
            <p className="text-sm text-muted-foreground">
              Buy shares in answers you believe will gain popularity. Price goes up when more people buy.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">3. Sell Anytime</h3>
            <p className="text-sm text-muted-foreground">
              Sell your shares back to the pool anytime. No need to find a buyer.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Opinion Shares - Trade opinions like memecoins</p>
          <p className="mt-2">Built on Base</p>
        </div>
      </footer>
    </div>
  );
}
