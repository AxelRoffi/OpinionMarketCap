import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpDown, 
  ExternalLink, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { TradingActivity } from '../types/opinion-types';
import { formatUSDC, formatAddress } from '../hooks/use-opinion-detail';
import { ClickableAddress } from '@/components/ui/clickable-address';

interface OpinionActivityProps {
  activity: TradingActivity[];
  loading?: boolean;
}

export function OpinionActivity({ activity, loading }: OpinionActivityProps) {
  const [sortBy, setSortBy] = useState<'timestamp' | 'price'>('timestamp');
  const [filterType, setFilterType] = useState<'all' | 'answer_change' | 'question_trade'>('all');
  const [showAll, setShowAll] = useState(false);

  // Filter and sort activity
  const filteredActivity = activity
    .filter(item => filterType === 'all' || item.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return b.timestamp - a.timestamp;
        case 'price':
          return Number(b.price) - Number(a.price);
        default:
          return 0;
      }
    });

  const displayedActivity = showAll ? filteredActivity : filteredActivity.slice(0, 5);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Trading Activity</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-muted-foreground/20 rounded"></div>
                    <div className="w-24 h-3 bg-muted-foreground/20 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4 sm:mb-0">
          Trading Activity
        </h2>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Filter */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('answer_change')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'answer_change'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Answers
            </button>
            <button
              onClick={() => setFilterType('question_trade')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'question_trade'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Trades
            </button>
          </div>

          {/* Sort */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'timestamp' ? 'price' : 'timestamp')}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortBy === 'timestamp' ? 'Time' : 'Price'}
          </Button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {displayedActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No trading activity yet</p>
            <p className="text-sm">Be the first to trade this opinion!</p>
          </div>
        ) : (
          displayedActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Activity Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === 'answer_change'
                    ? 'bg-emerald-600/20 text-emerald-500'
                    : 'bg-blue-600/20 text-blue-500'
                }`}>
                  {item.type === 'answer_change' ? (
                    <ArrowUpDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                </div>

                {/* Activity Details */}
                <div>
                  <div className="flex items-center space-x-2">
                    <ClickableAddress
                      address={item.user}
                      className="text-foreground font-medium hover:text-emerald-500 cursor-pointer transition-colors"
                    >
                      {formatAddress(item.user)}
                    </ClickableAddress>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        item.type === 'answer_change'
                          ? 'bg-emerald-600/20 text-emerald-500'
                          : 'bg-blue-600/20 text-blue-500'
                      }`}
                    >
                      {item.type === 'answer_change' ? 'Changed Answer' : 'Traded'}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-sm mt-1">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-500 transition-colors cursor-pointer inline-flex items-center gap-1 group"
                        title="View source link"
                      >
                        <span>
                          {item.answer.length > 50 ? `${item.answer.substring(0, 50)}...` : item.answer}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/70 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                      </a>
                    ) : (
                      <span>
                        {item.answer.length > 50 ? `${item.answer.substring(0, 50)}...` : item.answer}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground/70 text-xs mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(item.timestamp)}</span>
                    {item.transactionHash && (
                      <button className="flex items-center space-x-1 hover:text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        <span>View tx</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-foreground font-semibold">
                  {formatUSDC(item.price)}
                </div>
                <div className="text-muted-foreground text-sm">
                  Price paid
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More Button */}
      {filteredActivity.length > 5 && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            {showAll ? 'Show Less' : `Show All ${filteredActivity.length} Activities`}
          </Button>
        </div>
      )}
    </div>
  );
}