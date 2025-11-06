'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import SimpleSubmitModal from './SimpleSubmitModal';
import { formatQuestion } from '@/lib/format-utils';

interface OpinionData {
  id: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  currentAnswerOwner: string;
  isActive: boolean;
  creator: string;
  categories: string[];
}

interface ModernTradingTableProps {
  opinions: OpinionData[];
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  period, 
  icon 
}: {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  icon: string;
}) => (
  <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-400">{icon} {title}</div>
      <div className={`text-xs px-2 py-1 rounded ${
        isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
      }`}>
        {change} {period}
      </div>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export default function ModernTradingTable({ opinions }: ModernTradingTableProps) {
  const [selectedTab, setSelectedTab] = useState('All Opinions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpinion, setSelectedOpinion] = useState<OpinionData | null>(null);

  const formatLargeUSDC = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const calculateChange = (current: bigint, last: bigint) => {
    if (last === BigInt(0)) return { percentage: 0, isPositive: true };
    const diff = Number(current - last);
    const percentage = (diff / Number(last)) * 100;
    return { percentage: Math.abs(percentage), isPositive: diff >= 0 };
  };

  // Calculate real stats from contract data
  const stats = useMemo(() => {
    const totalVolumeWei = opinions.reduce((sum, opinion) => sum + Number(opinion.totalVolume), 0);
    const totalVolumeUSDC = totalVolumeWei / 1_000_000;
    
    const totalTradingValue = opinions.reduce((sum, opinion) => sum + Number(opinion.nextPrice), 0);
    const avgTradingValue = totalTradingValue / Math.max(opinions.length, 1) / 1_000_000;

    return {
      totalVolume: totalVolumeUSDC,
      activeQuestions: opinions.length,
      avgPrice: avgTradingValue,
      totalValue: totalTradingValue / 1_000_000
    };
  }, [opinions]);

  const filteredOpinions = useMemo(() => {
    return opinions.filter(opinion => 
      opinion?.question?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      opinion?.currentAnswer?.toLowerCase()?.includes(searchQuery.toLowerCase())
    );
  }, [opinions, searchQuery]);

  const handleTrade = (opinion: OpinionData) => {
    setSelectedOpinion(opinion);
  };

  // Get all unique categories from opinions
  const categories = useMemo(() => {
    const cats = ['All Categories'];
    const uniqueCategories = new Set<string>();
    
    opinions.forEach(opinion => {
      if (opinion.categories) {
        opinion.categories.forEach(category => uniqueCategories.add(category));
      }
    });
    
    cats.push(...Array.from(uniqueCategories).sort());
    return cats;
  }, [opinions]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <h1 className="text-xl font-bold">OpinionMarketCap</h1>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <button className="text-white font-medium">Leaderboard</button>
                <button className="text-gray-300 hover:text-white">Profile</button>
                <button className="text-gray-300 hover:text-white">Create</button>
                <button className="text-gray-300 hover:text-white">🌙</button>
              </div>
              <div className="ml-8">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Market Cap"
            value={formatLargeUSDC(stats.totalVolume)}
            change="+2.3%"
            isPositive={true}
            period="24h"
            icon="💰"
          />
          <StatCard
            title="24h Volume"
            value={formatLargeUSDC(stats.totalVolume)}
            change="+8.7%"
            isPositive={true}
            period="24h"
            icon="📊"
          />
          <StatCard
            title="Active Traders"
            value="1"
            change="+0%"
            isPositive={true}
            period="24h"
            icon="👥"
          />
          <StatCard
            title="Total Opinions"
            value={stats.activeQuestions.toString()}
            change="+0"
            isPositive={true}
            period="today"
            icon="💭"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search opinions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-80 text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <select className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white">
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option>Market Cap</option>
              <option>Price</option>
              <option>Volume</option>
            </select>
            <button className="p-2 text-gray-400 hover:text-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 mb-6">
          {['📊 All Opinions', '🔥 Trending', '⭐ Featured'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === tab || (selectedTab === 'All Opinions' && tab === '📊 All Opinions')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Opinion Market Table */}
        <div className="bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold flex items-center">
              📊 Opinion Market ({filteredOpinions.length})
            </h2>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-11 gap-4 px-4 py-3 text-sm font-medium text-gray-400 border-b border-gray-800">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Opinion</div>
            <div className="col-span-2">Answer</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">24h Change</div>
            <div className="col-span-1">Total Volume</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-800">
            {filteredOpinions.map((opinion) => {
              const change = calculateChange(opinion.nextPrice, opinion.lastPrice);
              const displayCategory = opinion.categories && opinion.categories.length > 0 
                ? opinion.categories[0] 
                : 'Other';
              
              return (
                <div key={opinion.id} className="grid grid-cols-11 gap-4 px-4 py-4 hover:bg-gray-800/30 transition-colors">
                  {/* ID */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-gray-400 font-medium">{opinion.id}</span>
                  </div>

                  {/* Opinion */}
                  <div className="col-span-3">
                    <div className="font-medium text-white mb-1">{formatQuestion(opinion.question)}</div>
                    <div className="text-sm text-gray-400">
                      by {opinion.creator.slice(0, 6)}...{opinion.creator.slice(-4)}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
                        {displayCategory}
                      </span>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="col-span-2">
                    <div className="mb-1">
                      {opinion.link ? (
                        <a
                          href={opinion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:text-emerald-400 transition-colors cursor-pointer inline-flex items-center gap-1 group"
                          title="View source link"
                        >
                          {opinion.currentAnswer}
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                        </a>
                      ) : (
                        <div className="font-medium text-white">{opinion.currentAnswer}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      by {opinion.currentAnswerOwner.slice(0, 6)}...{opinion.currentAnswerOwner.slice(-4)}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center">
                    <span className="font-semibold text-white">
                      ${(Number(opinion.nextPrice) / 1_000_000).toFixed(2)}
                    </span>
                  </div>

                  {/* 24h Change */}
                  <div className="col-span-1 flex items-center">
                    <div className={`flex items-center space-x-1 ${
                      change.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="font-medium">{change.percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Total Volume */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-gray-300">
                      ${formatLargeUSDC(Number(opinion.totalVolume) / 1_000_000).replace('$', '')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center space-x-2">
                    <button 
                      onClick={() => handleTrade(opinion)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded text-sm font-medium"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-8">
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
            <span>📝</span>
            <span>Create New Opinion</span>
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
            <span>📊</span>
            <span>View Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedOpinion && (
        <SimpleSubmitModal
          isOpen={!!selectedOpinion}
          onClose={() => setSelectedOpinion(null)}
          opinionId={selectedOpinion.id}
          question={selectedOpinion.question}
          currentAnswer={selectedOpinion.currentAnswer}
          nextPrice={selectedOpinion.nextPrice}
        />
      )}
    </div>
  );
}