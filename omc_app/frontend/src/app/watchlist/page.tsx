'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  ExternalLink, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  BookmarkX
} from 'lucide-react';
import Link from 'next/link';
import { useWatchlist } from '@/hooks/useWatchlist';
import { formatTimeAgo } from '@/app/profile/hooks/use-user-profile';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist, isLoading } = useWatchlist();

  const formatUSDC = (amount: bigint): string => {
    return `$${(Number(amount) / 1_000_000).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Watchlist</h1>
          <p className="text-gray-400">
            Track your favorite opinions and get notified of price changes
          </p>
        </div>
        {watchlist.length > 0 && (
          <Button
            onClick={clearWatchlist}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <BookmarkX className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Watchlist Count */}
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-yellow-400" />
        <span className="text-gray-300">
          {watchlist.length} opinion{watchlist.length !== 1 ? 's' : ''} watched
        </span>
      </div>

      {/* Watchlist Content */}
      {watchlist.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Bookmark className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Watched Opinions Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start watching opinions to track their performance and get easy access to trade them.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Eye className="w-4 h-4 mr-2" />
                Browse Opinions
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {watchlist.map((item) => (
            <Card key={item.opinionId} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Opinion Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-blue-600 text-white"
                      >
                        Question #{item.opinionId}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Added {formatTimeAgo(item.addedAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {item.question}
                    </h3>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-400">Price when added: </span>
                        <span className="font-semibold">
                          {formatUSDC(item.currentPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/opinions/${item.opinionId}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      onClick={() => removeFromWatchlist(item.opinionId)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-white mb-2">
            How to use your Watchlist
          </h4>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>• Click the <Bookmark className="w-4 h-4 inline mx-1" /> Watch button on any opinion page to add it to your watchlist</p>
            <p>• Your watchlist is stored locally and synced per wallet address</p>
            <p>• Use this page to quickly access and trade your favorite opinions</p>
            <p>• Remove opinions by clicking the trash icon or clear all at once</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}