import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Share2, 
  BookmarkPlus,
  Zap,
  Target
} from 'lucide-react';
import { OpinionDetail } from '../types/opinion-types';
import { formatUSDC, formatAddress, calculateChange } from '../hooks/use-opinion-detail';
import { ClickableAddress } from '@/components/ui/clickable-address';

interface OpinionHeaderProps {
  opinion: OpinionDetail;
  onBack: () => void;
  onTrade: () => void;
  onCreatePool: () => void;
}

export function OpinionHeader({ opinion, onBack, onTrade, onCreatePool }: OpinionHeaderProps) {
  const change = calculateChange(opinion.nextPrice, opinion.lastPrice);
  const marketCap = Number(opinion.totalVolume) / 1_000_000;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Markets</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Watch
          </Button>
        </div>
      </div>

      {/* Opinion Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Question and Answer */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
              {opinion.question}
            </h1>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Created by</span>
              <ClickableAddress 
                address={opinion.creator}
                className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                {formatAddress(opinion.creator)}
              </ClickableAddress>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Answer</span>
              <Badge 
                variant={opinion.isActive ? 'default' : 'secondary'}
                className={opinion.isActive ? 'bg-emerald-600' : 'bg-gray-600'}
              >
                {opinion.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              {opinion.currentAnswer}
            </p>
            {opinion.currentAnswerDescription && (
              <p className="text-gray-300 text-sm mb-2">
                {opinion.currentAnswerDescription}
              </p>
            )}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Owned by</span>
              <ClickableAddress 
                address={opinion.currentAnswerOwner}
                className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                {formatAddress(opinion.currentAnswerOwner)}
              </ClickableAddress>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Right: Price and Stats */}
        <div className="space-y-4">
          {/* Price Card */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="text-center space-y-2">
              <div className="text-gray-400 text-sm">Current Price</div>
              <div className="text-3xl font-bold text-white">
                {formatUSDC(opinion.nextPrice)}
              </div>
              <div className={`flex items-center justify-center space-x-1 ${
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
                <span className="text-gray-400 text-sm">
                  (${change.absolute.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-600 text-center">
              <div className="text-gray-400 text-xs mb-1">Market Cap</div>
              <div className="text-white font-semibold">
                ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-600 text-center">
              <div className="text-gray-400 text-xs mb-1">Volume</div>
              <div className="text-white font-semibold">
                {formatUSDC(opinion.totalVolume)}
              </div>
            </div>
          </div>

          {/* Trade Button */}
          <Button
            onClick={onTrade}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
          >
            <Zap className="w-5 h-5 mr-2" />
            Trade This Opinion
          </Button>

          {/* Create Pool Button */}
          <Button
            onClick={onCreatePool}
            variant="outline"
            className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold py-3 mt-2 transition-all duration-200"
          >
            <Target className="w-5 h-5 mr-2" />
            Create Pool
          </Button>
        </div>
      </div>
    </div>
  );
}