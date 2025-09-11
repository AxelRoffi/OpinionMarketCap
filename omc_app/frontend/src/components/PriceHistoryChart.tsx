import React from 'react';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { OpinionData } from '@/app/page';

interface PriceHistoryChartProps {
  opinion: OpinionData;
  change: { percentage: number; isPositive: boolean };
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ opinion, change }) => {
  const { priceHistory, isLoading, error } = usePriceHistory(opinion.id);

  if (isLoading) {
    return (
      <div className="w-32 h-10 bg-gray-700/50 rounded flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-32 h-10 bg-gray-700/50 rounded flex items-center justify-center">
        <span className="text-xs text-red-500">Error</span>
      </div>
    );
  }

  const formattedHistory = priceHistory ? priceHistory.map(item => ({
    timestamp: Number(item.timestamp) * 1000,
    price: Number(item.price) / 1_000_000
  })) : [];

  // Add initial price point if not present
  if (formattedHistory.length > 0) {
      const initialPrice = 5.0; // Assuming initial price is 5 USDC
      if (formattedHistory[0].price !== initialPrice) {
          formattedHistory.unshift({
              timestamp: formattedHistory[0].timestamp - 3600000, // 1 hour before first trade
              price: initialPrice
          });
      }
  } else {
    // If there is no history, we can create a simple chart from initial to current price
    const initialPrice = 5.0;
    const currentPrice = Number(opinion.nextPrice) / 1_000_000;
    const opinionCreationTime = opinion.createdAt || (Date.now() - 86400000);
    formattedHistory.push({ timestamp: opinionCreationTime, price: initialPrice });
    formattedHistory.push({ timestamp: Date.now(), price: currentPrice });
  }

  const strokeColor = change.isPositive ? "#10b981" : "#ef4444";

  return (
    <div className="w-32 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedHistory}>
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
