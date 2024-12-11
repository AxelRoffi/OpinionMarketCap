'use client';

import { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

type Opinion = {
  id: number;
  question: string;
  answer: string;
  price: string;
  owner: string;
  priceChange: number;
  volume: string;
  lastPrice: string;
};

type SortConfig = {
  key: keyof Opinion | null;
  direction: 'asc' | 'desc';
};

const mockOpinions: Opinion[] = [
  {
    id: 1,
    question: "Best blockchain?",
    answer: "Ethereum",
    price: "0.1 ETH",
    lastPrice: "0.08 ETH",
    priceChange: 25.0,
    volume: "1.5 ETH",
    owner: "0x1234...5678"
  },
  {
    id: 2,
    question: "Most innovative crypto project?",
    answer: "Bitcoin",
    price: "0.2 ETH",
    lastPrice: "0.25 ETH",
    priceChange: -20.0,
    volume: "2.8 ETH",
    owner: "0x8765...4321"
  },
  {
    id: 3,
    question: "Best NFT marketplace?",
    answer: "OpenSea",
    price: "0.15 ETH",
    lastPrice: "0.15 ETH",
    priceChange: 0,
    volume: "0.9 ETH",
    owner: "0x9876...1234"
  }
];

export default function OpinionTable() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  const handleSort = (key: keyof Opinion) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedOpinions = [...mockOpinions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['question', 'answer', 'price', 'priceChange', 'volume', 'owner', 'actions'].map((key) => (
              <th
                key={key}
                onClick={() => key !== 'actions' && handleSort(key as keyof Opinion)}
                className={`px-6 py-4 text-left text-sm font-semibold text-gray-900 ${
                  key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {key === 'priceChange' ? '24h %' : key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortConfig.key === key && (
                    sortConfig.direction === 'asc' ? 
                      <ArrowUpIcon className="h-4 w-4" /> : 
                      <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedOpinions.map((opinion) => (
            <tr key={opinion.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                <Link 
                  href={`/opinions/${opinion.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {opinion.question}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {opinion.answer}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {opinion.price}
              </td>
              <td className={`px-6 py-4 text-sm font-medium ${
                opinion.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {opinion.priceChange > 0 ? '+' : ''}{opinion.priceChange.toFixed(1)}%
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {opinion.volume}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                {opinion.owner}
              </td>
              <td className="px-6 py-4 text-sm">
                <button className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-600 hover:bg-blue-100 transition-colors">
                  Buy Opinion
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
