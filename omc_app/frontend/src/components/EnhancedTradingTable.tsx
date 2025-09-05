'use client';

import { useState, useMemo } from 'react';
import { 
  ExternalLink, 
  Copy, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Check,
  Flame,
  Sparkles,
  MessageCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import SimpleSubmitModal from './SimpleSubmitModal';

type SortField = 'id' | 'question' | 'answer' | 'price' | 'priceChange' | 'volume' | 'owner';
type SortDirection = 'asc' | 'desc';
type StatusType = 'hot' | 'trending' | 'new' | 'controversial';

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
  link?: string;
  status: StatusType[];
}

interface EnhancedTradingTableProps {
  opinions: Omit<OpinionData, 'status'>[];
}

const StatusBadge = ({ status, tooltip }: { status: StatusType; tooltip: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const statusConfig = {
    hot: { icon: Flame, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', label: 'Hot' },
    trending: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Trending' },
    new: { icon: Sparkles, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: 'New' },
    controversial: { icon: MessageCircle, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', label: 'Controversial' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border transition-all duration-200 cursor-help ${config.color}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg border border-gray-700 whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-xs"
      title={`Copy ${label || 'text'}`}
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
};

const PriceChangeCell = ({ current, last }: { current: bigint; last: bigint }) => {
  const calculatePriceChange = (current: bigint, last: bigint) => {
    if (last === BigInt(0)) return { change: 0, percentage: '+0.0%' };
    
    const diff = Number(current - last);
    const percentage = (diff / Number(last)) * 100;
    
    return {
      change: diff,
      percentage: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
    };
  };

  const priceChange = calculatePriceChange(current, last);
  const isPositive = priceChange.change >= 0;
  const isNeutral = priceChange.change === 0;

  const ArrowIcon = isPositive ? ChevronUp : ChevronDown;
  const colorClass = isNeutral 
    ? 'text-gray-400' 
    : isPositive 
      ? 'text-emerald-400' 
      : 'text-red-400';

  return (
    <div className={`flex items-center font-medium transition-colors duration-200 ${colorClass}`}>
      {!isNeutral && <ArrowIcon className="w-4 h-4 mr-1" />}
      {priceChange.percentage}
    </div>
  );
};

const BuyButton = ({ 
  opinion, 
  formatUSDC, 
  onBuyClick 
}: { 
  opinion: Omit<OpinionData, 'status'>; 
  formatUSDC: (wei: bigint | number) => string;
  onBuyClick: (opinion: Omit<OpinionData, 'status'>) => void;
}) => {
  return (
    <button 
      onClick={() => onBuyClick(opinion)}
      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
    >
      Buy for {formatUSDC(opinion.nextPrice)}
    </button>
  );
};

const SortableHeader = ({ 
  field, 
  children, 
  onSort, 
  sortField, 
  sortDirection 
}: { 
  field: SortField; 
  children: React.ReactNode;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}) => {
  const isActive = sortField === field;
  const SortIcon = sortDirection === 'asc' ? ArrowUp : ArrowDown;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-2 text-left hover:text-emerald-400 transition-colors duration-200 group w-full"
    >
      <span className="font-semibold text-sm tracking-wide">{children}</span>
      <div className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        <SortIcon className="w-4 h-4" />
      </div>
    </button>
  );
};

const TruncatedText = ({ text, maxLength = 25 }: { text: string; maxLength?: number }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const truncated = text.length > maxLength;
  const displayText = truncated ? `${text.slice(0, maxLength)}...` : text;

  if (!truncated) {
    return <span>{text}</span>;
  }

  return (
    <div className="relative">
      <span
        className="cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {displayText}
      </span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-700 whitespace-nowrap z-50 max-w-xs">
          {text}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default function EnhancedTradingTable({ opinions }: EnhancedTradingTableProps) {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedOpinion, setSelectedOpinion] = useState<Omit<OpinionData, 'status'> | null>(null);

  // Format USDC function
  const formatUSDC = (wei: bigint | number) => {
    const usdc = Number(wei) / 1_000_000;
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted opinions
  const sortedOpinions = useMemo(() => {
    if (opinions.length === 0) return [];

    return [...opinions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'question':
          comparison = a.question.localeCompare(b.question);
          break;
        case 'answer':
          comparison = a.currentAnswer.localeCompare(b.currentAnswer);
          break;
        case 'price':
          comparison = Number(a.nextPrice - b.nextPrice);
          break;
        case 'priceChange':
          const aChange = Number(a.nextPrice - a.lastPrice);
          const bChange = Number(b.nextPrice - b.lastPrice);
          comparison = aChange - bChange;
          break;
        case 'volume':
          comparison = Number(a.totalVolume - b.totalVolume);
          break;
        case 'owner':
          comparison = a.currentAnswerOwner.localeCompare(b.currentAnswerOwner);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [opinions, sortField, sortDirection]);
  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Mock status assignment based on opinion data
  const getOpinionStatus = (opinion: Omit<OpinionData, 'status'>): StatusType[] => {
    const statuses: StatusType[] = [];
    
    // Hot: High volume
    if (Number(opinion.totalVolume) > 1_000_000) { // > 1 USDC
      statuses.push('hot');
    }
    
    // Trending: Price increased
    if (opinion.nextPrice > opinion.lastPrice) {
      statuses.push('trending');
    }
    
    // New: Low ID numbers
    if (opinion.id <= 2) {
      statuses.push('new');
    }
    
    return statuses;
  };

  const handleBuyClick = (opinion: Omit<OpinionData, 'status'>) => {
    setSelectedOpinion(opinion);
  };

  if (opinions.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700/50">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-200 mb-2">No Opinions Yet</h3>
        <p className="text-gray-400 text-lg">Be the first to create an opinion and start trading!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700/50">
        <div className="grid grid-cols-12 gap-4 text-gray-300">
          <div className="col-span-1">
            <SortableHeader field="id" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              #
            </SortableHeader>
          </div>
          <div className="col-span-2">
            <SortableHeader field="question" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              Question
            </SortableHeader>
          </div>
          <div className="col-span-2">
            <SortableHeader field="answer" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              Current Answer
            </SortableHeader>
          </div>
          <div className="col-span-1">
            <SortableHeader field="price" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              Price
            </SortableHeader>
          </div>
          <div className="col-span-1">
            <SortableHeader field="priceChange" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              Change
            </SortableHeader>
          </div>
          <div className="col-span-1">
            <SortableHeader field="volume" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              Volume
            </SortableHeader>
          </div>
          <div className="col-span-2">
            <SortableHeader field="owner" onSort={handleSort} sortField={sortField} sortDirection={sortDirection}>
              Owner
            </SortableHeader>
          </div>
          <div className="col-span-1">
            <span className="font-semibold text-sm tracking-wide">Link</span>
          </div>
          <div className="col-span-1">
            <span className="font-semibold text-sm tracking-wide">Actions</span>
          </div>
        </div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-gray-700/30">
        {sortedOpinions.map((opinion) => {
          const statuses = getOpinionStatus(opinion);
          
          return (
            <div 
              key={opinion.id} 
              className="px-6 py-4 hover:bg-gray-700/20 transition-all duration-200 group"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* ID */}
                <div className="col-span-1">
                  <span className="text-gray-300 font-mono font-medium text-lg">
                    {opinion.id}
                  </span>
                </div>
                
                {/* Question with Status Badges */}
                <div className="col-span-2 space-y-2">
                  <div className="text-white font-semibold text-base leading-tight">
                    <TruncatedText text={opinion.question} maxLength={30} />
                  </div>
                  {statuses.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {statuses.map((status) => (
                        <StatusBadge 
                          key={status} 
                          status={status} 
                          tooltip={`This opinion is ${status}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Current Answer */}
                <div className="col-span-2">
                  <div className="text-gray-300 font-medium">
                    <TruncatedText text={opinion.currentAnswer} maxLength={20} />
                  </div>
                </div>
                
                {/* Price */}
                <div className="col-span-1">
                  <div className="text-white font-bold text-lg">
                    {formatUSDC(opinion.nextPrice)}
                  </div>
                </div>
                
                {/* Price Change */}
                <div className="col-span-1">
                  <PriceChangeCell current={opinion.nextPrice} last={opinion.lastPrice} />
                </div>
                
                {/* Volume */}
                <div className="col-span-1">
                  <div className="text-gray-300 font-medium">
                    {formatUSDC(opinion.totalVolume)}
                  </div>
                </div>
                
                {/* Owner */}
                <div className="col-span-2 flex items-center space-x-2">
                  <span className="text-gray-400 font-mono text-sm">
                    {truncateAddress(opinion.currentAnswerOwner)}
                  </span>
                  <CopyButton text={opinion.currentAnswerOwner} label="address" />
                </div>
                
                {/* Link */}
                <div className="col-span-1">
                  {opinion.link ? (
                    <a
                      href={opinion.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all duration-200"
                      title="View full question"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="col-span-1">
                  <BuyButton opinion={opinion} formatUSDC={formatUSDC} onBuyClick={handleBuyClick} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Answer Modal */}
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