'use client';

import { useEffect, useState } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import { getContracts } from '@/lib/contracts';
import { shortenAddress, formatUSDC, formatShares } from '@/lib/utils';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { Answer } from '@/lib/contracts';

interface TradeEvent {
  type: 'buy' | 'sell';
  answerId: bigint;
  user: string;
  shares: bigint;
  amount: bigint; // cost for buy, returnAmount for sell
  timestamp: number;
  blockNumber: bigint;
  txHash: string;
}

interface ActivityFeedProps {
  answerIds: bigint[];
  answers: Answer[];
  maxItems?: number;
}

export function ActivityFeed({ answerIds, answers, maxItems = 10 }: ActivityFeedProps) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const publicClient = usePublicClient();

  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create a map of answerId -> answerText for display
  const answerMap = new Map<string, string>();
  answers.forEach((a) => {
    answerMap.set(a.id.toString(), a.text);
  });

  useEffect(() => {
    if (!publicClient || answerIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchTrades = async () => {
      setIsLoading(true);

      try {
        // Fetch buy events for all answer IDs
        const buyPromises = answerIds.map((answerId) =>
          publicClient.getLogs({
            address: contracts.ANSWER_SHARES_CORE,
            event: parseAbiItem('event SharesBought(uint256 indexed answerId, address indexed buyer, uint256 shares, uint256 cost, uint256 newPrice)'),
            args: { answerId },
            fromBlock: 'earliest',
            toBlock: 'latest',
          })
        );

        // Fetch sell events for all answer IDs
        const sellPromises = answerIds.map((answerId) =>
          publicClient.getLogs({
            address: contracts.ANSWER_SHARES_CORE,
            event: parseAbiItem('event SharesSold(uint256 indexed answerId, address indexed seller, uint256 shares, uint256 returnAmount, uint256 newPrice)'),
            args: { answerId },
            fromBlock: 'earliest',
            toBlock: 'latest',
          })
        );

        const [buyResults, sellResults] = await Promise.all([
          Promise.all(buyPromises),
          Promise.all(sellPromises),
        ]);

        // Process buy events
        const buyEvents: TradeEvent[] = buyResults.flatMap((events) =>
          events.map((e) => ({
            type: 'buy' as const,
            answerId: e.args.answerId!,
            user: e.args.buyer as string,
            shares: e.args.shares!,
            amount: e.args.cost!,
            timestamp: Date.now(), // We'll use block number for ordering
            blockNumber: e.blockNumber,
            txHash: e.transactionHash,
          }))
        );

        // Process sell events
        const sellEvents: TradeEvent[] = sellResults.flatMap((events) =>
          events.map((e) => ({
            type: 'sell' as const,
            answerId: e.args.answerId!,
            user: e.args.seller as string,
            shares: e.args.shares!,
            amount: e.args.returnAmount!,
            timestamp: Date.now(),
            blockNumber: e.blockNumber,
            txHash: e.transactionHash,
          }))
        );

        // Combine and sort by block number (most recent first)
        const allTrades = [...buyEvents, ...sellEvents]
          .sort((a, b) => Number(b.blockNumber - a.blockNumber))
          .slice(0, maxItems);

        setTrades(allTrades);
      } catch (error) {
        console.error('[ActivityFeed] Failed to fetch trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [publicClient, answerIds, contracts.ANSWER_SHARES_CORE, maxItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No trades yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Be the first to trade!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trades.map((trade, index) => {
        const answerText = answerMap.get(trade.answerId.toString()) || `Answer #${trade.answerId}`;
        const truncatedAnswer = answerText.length > 20 ? answerText.slice(0, 20) + '...' : answerText;

        return (
          <div
            key={`${trade.txHash}-${index}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            {/* Icon */}
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                trade.type === 'buy'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {trade.type === 'buy' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-foreground">
                  {shortenAddress(trade.user)}
                </span>
                <span className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                  {trade.type === 'buy' ? 'bought' : 'sold'}
                </span>
                <span className="font-medium">{formatShares(trade.shares)}</span>
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {truncatedAnswer}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <div className={`text-xs font-medium ${
                trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
              }`}>
                {trade.type === 'buy' ? '+' : '-'}{formatUSDC(trade.amount)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
