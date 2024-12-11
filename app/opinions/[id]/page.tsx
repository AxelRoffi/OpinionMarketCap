'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import BuyOpinionModal from '@/app/components/BuyOpinionModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const priceHistory = [
  { date: '2024-01-01', price: 0.05, volume: 0.2 },
  { date: '2024-01-02', price: 0.06, volume: 0.3 },
  { date: '2024-01-03', price: 0.055, volume: 0.15 },
  { date: '2024-01-04', price: 0.07, volume: 0.4 },
  { date: '2024-01-05', price: 0.08, volume: 0.35 },
  { date: '2024-01-06', price: 0.075, volume: 0.25 },
  { date: '2024-01-07', price: 0.09, volume: 0.5 },
  { date: '2024-01-08', price: 0.1, volume: 0.45 },
];

type TimeRange = '24h' | '7d' | '30d' | 'all';

export default function OpinionPage({ params }: { params: Promise<{ id: string }> }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const resolvedParams = use(params);
  
  const mockOpinion = {
    id: parseInt(resolvedParams.id),
    question: "Best blockchain?",
    answer: "Ethereum",
    price: "0.1 ETH",
    lastPrice: "0.08 ETH",
    priceChange: 25.0,
    volume: "1.5 ETH",
    owner: "0x1234...5678"
  };

  const handleBuyOpinion = (answer: string) => {
    // TODO: Implement contract interaction
    console.log('Buying opinion with answer:', answer);
  };

  const TimeRangeButton = ({ range }: { range: TimeRange }) => (
    <button
      onClick={() => setTimeRange(range)}
      className={`px-4 py-2 text-sm font-medium rounded-lg ${
        timeRange === range
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {range.toUpperCase()}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Opinions
          </Link>
        </nav>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mockOpinion.question}
              </h1>
              <p className="mt-1 text-gray-500">
                Opinion #{mockOpinion.id}
              </p>
            </div>
            <button 
              onClick={() => setIsBuyModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Buy Opinion
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-xl font-semibold">{mockOpinion.price}</p>
              <p className={`text-sm ${mockOpinion.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {mockOpinion.priceChange > 0 ? '+' : ''}{mockOpinion.priceChange.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-xl font-semibold">{mockOpinion.volume}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Current Owner</p>
              <p className="text-xl font-mono">{mockOpinion.owner}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Opinion Changes</p>
              <p className="text-xl font-semibold">24</p>
              <p className="text-sm text-gray-500">All Time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Price History</h2>
            <div className="flex gap-2">
              <TimeRangeButton range="24h" />
              <TimeRangeButton range="7d" />
              <TimeRangeButton range="30d" />
              <TimeRangeButton range="all" />
            </div>
          </div>
          
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={priceHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value} ETH`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} ETH`]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Opinion History</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opinion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Paid</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">2024-02-04</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Ethereum</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">0x1234...5678</td>
                  <td className="px-6 py-4 text-sm text-gray-900">0.1 ETH</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <BuyOpinionModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          onSubmit={handleBuyOpinion}
          currentPrice={mockOpinion.price.replace(' ETH', '')}
          paymentToken="ETH"
        />
      </div>
    </div>
  );
}