import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Share2,
  BookmarkPlus,
  Bookmark,
  Zap,
  Target,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { OpinionDetail } from '../types/opinion-types';
import { formatUSDC, formatAddress, calculateChange } from '../hooks/use-opinion-detail';
import { ClickableAddress } from '@/components/ui/clickable-address';
import { formatQuestion } from '@/lib/format-utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { SocialShareModal } from '@/components/ui/social-share-modal';
import { useState } from 'react';

// Category color mapping - all 40 categories with distinct colors
const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    // Tech & Digital
    'Technology': 'bg-blue-600 text-white hover:bg-blue-700',
    'AI & Robotics': 'bg-cyan-600 text-white hover:bg-cyan-700',
    'Crypto & Web3': 'bg-orange-500 text-white hover:bg-orange-600',
    'DeFi (Decentralized Finance)': 'bg-yellow-500 text-white hover:bg-yellow-600',
    'Gaming': 'bg-purple-600 text-white hover:bg-purple-700',
    'Social Media': 'bg-indigo-500 text-white hover:bg-indigo-600',

    // Science & Environment
    'Science': 'bg-indigo-600 text-white hover:bg-indigo-700',
    'Environment & Climate': 'bg-green-600 text-white hover:bg-green-700',

    // Business & Finance
    'Business & Finance': 'bg-emerald-600 text-white hover:bg-emerald-700',
    'Real Estate': 'bg-stone-600 text-white hover:bg-stone-700',
    'Career & Workplace': 'bg-teal-600 text-white hover:bg-teal-700',

    // Politics & Society
    'Politics': 'bg-red-600 text-white hover:bg-red-700',
    'Law & Legal': 'bg-slate-600 text-white hover:bg-slate-700',
    'News': 'bg-sky-600 text-white hover:bg-sky-700',

    // Sports & Automotive
    'Sports': 'bg-yellow-600 text-white hover:bg-yellow-700',
    'Automotive': 'bg-zinc-600 text-white hover:bg-zinc-700',

    // Entertainment & Media
    'Movies': 'bg-purple-700 text-white hover:bg-purple-800',
    'TV Shows': 'bg-violet-600 text-white hover:bg-violet-700',
    'Music': 'bg-pink-600 text-white hover:bg-pink-700',
    'Podcasts': 'bg-green-700 text-white hover:bg-green-800',
    'Literature': 'bg-amber-700 text-white hover:bg-amber-800',

    // Arts & Culture
    'Art & Design': 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
    'Photography': 'bg-sky-500 text-white hover:bg-sky-600',
    'Celebrities & Pop Culture': 'bg-rose-500 text-white hover:bg-rose-600',
    'Humor & Memes': 'bg-orange-400 text-white hover:bg-orange-500',
    'Fashion': 'bg-pink-500 text-white hover:bg-pink-600',

    // Lifestyle
    'Beauty & Skincare': 'bg-rose-400 text-white hover:bg-rose-500',
    'Health & Fitness': 'bg-lime-600 text-white hover:bg-lime-700',
    'Food & Drink': 'bg-amber-500 text-white hover:bg-amber-600',
    'Travel': 'bg-cyan-500 text-white hover:bg-cyan-600',
    'DIY & Home Improvement': 'bg-orange-600 text-white hover:bg-orange-700',
    'Pets & Animals': 'bg-amber-600 text-white hover:bg-amber-700',

    // Knowledge & Learning
    'History': 'bg-stone-500 text-white hover:bg-stone-600',
    'Philosophy': 'bg-purple-500 text-white hover:bg-purple-600',
    'Spirituality & Religion': 'bg-violet-500 text-white hover:bg-violet-600',
    'Education': 'bg-blue-500 text-white hover:bg-blue-600',

    // Relationships & Family
    'Relationships': 'bg-pink-400 text-white hover:bg-pink-500',
    'Parenting & Family': 'bg-lime-500 text-white hover:bg-lime-600',

    // Other
    'True Crime': 'bg-red-700 text-white hover:bg-red-800',
    'Adult (NSFW)': 'bg-red-900 text-white hover:bg-red-800',
    'Other': 'bg-gray-600 text-white hover:bg-gray-700',
  };
  return colorMap[category] || 'bg-gray-600 text-white hover:bg-gray-700';
};

interface OpinionHeaderProps {
  opinion: OpinionDetail;
  onBack: () => void;
  onTrade: () => void;
  onCreatePool: () => void;
  onListForSale: () => void;
  onCancelListing: () => void;
}

export function OpinionHeader({ opinion, onBack, onTrade, onCreatePool, onListForSale, onCancelListing }: OpinionHeaderProps) {
  const { address } = useAccount();
  const router = useRouter();
  const change = calculateChange(opinion.nextPrice, opinion.lastPrice);
  const marketCap = Number(opinion.totalVolume) / 1_000_000;

  // Local state for modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Watchlist functionality
  const { isWatched, toggleWatchlist } = useWatchlist();
  const isOpinionWatched = isWatched(opinion.id);

  // Handle category click - navigate to main page filtered by category
  const handleCategoryClick = (category: string) => {
    // Navigate to main page with category query param
    router.push(`/?category=${encodeURIComponent(category)}`);
  };

  // Handle share button click - opens modal instead of direct sharing
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Handle watch button click
  const handleWatch = () => {
    toggleWatchlist({
      id: opinion.id,
      question: opinion.question,
      nextPrice: opinion.nextPrice
    });
  };

  // Check if current user can list this question for sale
  const canListForSale = address?.toLowerCase() === opinion.questionOwner?.toLowerCase() && 
                         (opinion.salePrice === 0n || opinion.salePrice === undefined);
  
  // Check if question is currently for sale
  const isForSale = opinion.salePrice > 0n;

  // Check if current user can cancel this listing
  const canCancelListing = address?.toLowerCase() === opinion.questionOwner?.toLowerCase() && isForSale;

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      {/* Header Navigation */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors duration-200"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            onClick={handleWatch}
            variant="outline"
            size="sm"
            className={`transition-colors duration-200 ${
              isOpinionWatched 
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white' 
                : 'border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white'
            }`}
          >
            {isOpinionWatched ? (
              <Bookmark className="w-4 h-4 mr-2" />
            ) : (
              <BookmarkPlus className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">
              {isOpinionWatched ? 'Watching' : 'Watch'}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Question Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-blue-400 text-sm font-medium bg-blue-600/10 px-3 py-1.5 rounded-md border border-blue-600/20">
                Question #{opinion.id}
              </span>
              {/* Show categories or fallback to "Other" */}
              {(opinion.categories && opinion.categories.length > 0 ? opinion.categories : ['Other']).map((category, index) => (
                <Badge
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className={`${getCategoryColor(category)} px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-transform hover:scale-105`}
                >
                  {category}
                  {category === 'Adult' && ' 🔞'}
                </Badge>
              ))}
            </div>
            <Badge 
              variant={opinion.isActive ? 'default' : 'secondary'}
              className={opinion.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-600'}
            >
              {opinion.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {formatQuestion(opinion.question)}
          </h1>
          
          <div className="text-gray-400 text-sm">
            <span>Created by </span>
            <ClickableAddress 
              address={opinion.creator}
              className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              {formatAddress(opinion.creator)}
            </ClickableAddress>
          </div>
        </div>

        {/* Balanced Layout - Answer 50%, Price & Volume 25% each */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Current Answer - Takes 2/4 (50%) width */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="mb-2">
              <span className="text-gray-400 text-sm font-medium">Current Answer</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              {opinion.link ? (
                <a
                  href={opinion.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold text-xl hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-2 group"
                  title="View source link"
                >
                  {opinion.currentAnswer}
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                </a>
              ) : (
                <p className="text-white font-semibold text-xl">
                  {opinion.currentAnswer}
                </p>
              )}
            </div>
            {opinion.currentAnswerDescription && (
              <p className="text-gray-300 text-sm mb-2">
                {opinion.currentAnswerDescription}
              </p>
            )}
            <div className="text-gray-400 text-sm">
              <span>Owned by </span>
              <ClickableAddress 
                address={opinion.currentAnswerOwner}
                className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                {formatAddress(opinion.currentAnswerOwner)}
              </ClickableAddress>
            </div>
          </div>

          {/* Current Price - Takes 1/4 (25%) width */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">Current Price</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {formatUSDC(opinion.nextPrice)}
              </div>
              <div className={`flex items-center justify-center space-x-1 text-sm ${
                change.isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {change.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {change.isPositive ? '+' : '-'}{change.percentage.toFixed(1)}%
                </span>
                <span className="text-gray-400 text-xs">
                  (${change.absolute.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Total Volume - Takes 1/4 (25%) width */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">Total Volume</div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {formatUSDC(opinion.totalVolume)}
              </div>
            </div>
          </div>
        </div>

        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onTrade}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
          >
            <Zap className="w-5 h-5 mr-2" />
            Trade This Opinion
          </Button>

{/* Pool Creation Button with NextPrice Requirement */}
          {opinion.nextPrice >= 100_000_000 ? (
            <Button
              onClick={onCreatePool}
              variant="outline"
              className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold py-3 transition-all duration-200"
            >
              <Target className="w-5 h-5 mr-2" />
              Create Pool
            </Button>
          ) : (
            <div className="w-full">
              <Button
                disabled
                variant="outline"
                className="w-full border-gray-600 text-gray-500 cursor-not-allowed font-semibold py-3"
              >
                <Target className="w-5 h-5 mr-2" />
                Create Pool
              </Button>
              <p className="text-xs text-gray-400 mt-1 text-center">
                Pool creation requires NextPrice ≥ 100 USDC<br />
                Current: {formatUSDC(opinion.nextPrice)}
              </p>
            </div>
          )}
        </div>

        {/* Question Marketplace Status */}
        {isForSale && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <Tag className="w-5 h-5" />
              <span className="font-medium">
                This question is listed for sale at {formatUSDC(opinion.salePrice)}
              </span>
            </div>
          </div>
        )}

        {/* Marketplace Actions */}
        {(canListForSale || canCancelListing) && (
          <div className="flex gap-4 justify-center">
            {canListForSale && (
              <Button
                onClick={onListForSale}
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white font-semibold px-6 py-2 transition-all duration-200"
              >
                <Tag className="w-4 h-4 mr-2" />
                List for Sale
              </Button>
            )}

            {canCancelListing && (
              <Button
                onClick={onCancelListing}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-semibold px-6 py-2 transition-all duration-200"
              >
                <Tag className="w-4 h-4 mr-2" />
                Cancel Listing
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        opinion={opinion}
      />
    </div>
  );
}