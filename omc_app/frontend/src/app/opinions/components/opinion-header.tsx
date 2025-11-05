import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Share2, 
  BookmarkPlus,
  Zap,
  Target,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { OpinionDetail } from '../types/opinion-types';
import { formatUSDC, formatAddress, calculateChange } from '../hooks/use-opinion-detail';
import { ClickableAddress } from '@/components/ui/clickable-address';
import { formatQuestion } from '@/lib/format-utils';

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
  const change = calculateChange(opinion.nextPrice, opinion.lastPrice);
  const marketCap = Number(opinion.totalVolume) / 1_000_000;

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
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Watch</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Question Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 text-sm font-medium bg-blue-600/10 px-3 py-1.5 rounded-md border border-blue-600/20">
                Question #{opinion.id}
              </span>
              {opinion.categories.map((category, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {category}
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

    </div>
  );
}