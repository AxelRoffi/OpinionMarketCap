// app/components/OpinionTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract-config';
import { Opinion, SortConfig } from '@/types';

// Extended Opinion type with UI-specific fields
type EnhancedOpinion = Opinion & {
  lastPrice?: bigint;
  priceChange?: number;
};

export default function OpinionTable() {
  const [opinions, setOpinions] = useState<EnhancedOpinion[]>([]);
  const [allOpinions, setAllOpinions] = useState<EnhancedOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  // Add state for the toggle
  const [showInactive, setShowInactive] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'id',
    direction: 'desc'
  });

  useEffect(() => {
    async function fetchOpinions() {
      try {
        setLoading(true);
        
        // Create a client to interact with the blockchain
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http('https://sepolia.base.org')
        });
        
        // Get the total number of opinions
        const nextId = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'nextOpinionId',
        }) as bigint;
        
        // Fetch all opinions (starting from ID 1)
        const opinionPromises = [];
        for (let i = 1; i < Number(nextId); i++) {
          opinionPromises.push(
            client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'opinions',
              args: [BigInt(i)],
            })
          );
        }
        
        const fetchedOpinions = await Promise.all(opinionPromises);
        
        // Fetch history for each opinion to calculate price change
        const opinionsWithHistory = await Promise.all(
          fetchedOpinions.map(async (opinionData) => {
            // Convert tuple response to Opinion object
            const [id, question, creator, currentPrice, nextPrice, isActive, currentAnswer, currentAnswerOwner, totalVolume] = 
                opinionData as [bigint, string, string, bigint, bigint, boolean, string, string, bigint];
            
            const opinion: EnhancedOpinion = {
              id,
              question,
              creator,
              currentPrice,
              nextPrice, 
              isActive,
              currentAnswer,
              currentAnswerOwner,
              totalVolume
            };
            
            if (opinion.isActive) {
              try {
                const history = await client.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'getAnswerHistory',
                  args: [opinion.id],
                }) as { answer: string; owner: string; price: bigint; timestamp: bigint }[];
                
                // Calculate price change if we have enough history
                if (history.length > 1) {
                  const lastPrice = history[history.length - 2].price;
                  
                  // Calculate percentage change
                  const priceChange = currentPrice > lastPrice
                    ? Number(((currentPrice - lastPrice) * BigInt(10000)) / lastPrice) / 100
                    : -Number(((lastPrice - currentPrice) * BigInt(10000)) / lastPrice) / 100;
                  
                  return { 
                    ...opinion, 
                    lastPrice, 
                    priceChange 
                  };
                }
              } catch (error) {
                console.error(`Error fetching history for opinion ${opinion.id}:`, error);
              }
            }
            
            return opinion;
          })
        );
        
        // Store all opinions
        setAllOpinions(opinionsWithHistory);
        
        // Apply the filter based on showInactive state
        const filteredOpinions = showInactive 
          ? opinionsWithHistory 
          : opinionsWithHistory.filter(o => o.isActive);
        
        setOpinions(filteredOpinions);
      } catch (error) {
        console.error('Error fetching opinions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOpinions();
  }, [showInactive]); // Add showInactive to dependencies

  // Add effect to filter opinions when toggle changes
  useEffect(() => {
    if (allOpinions.length > 0) {
      const filteredOpinions = showInactive 
        ? allOpinions 
        : allOpinions.filter(o => o.isActive);
      
      setOpinions(filteredOpinions);
    }
  }, [showInactive, allOpinions]);

  const handleSort = (key: keyof EnhancedOpinion) => {
    setSortConfig(current => ({
      key: key as keyof Opinion,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // This function now handles the enhanced opinion type
  const sortedOpinions = [...opinions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    // Handle the case where the key might not exist on Opinion type
    const aValue = a[sortConfig.key as keyof EnhancedOpinion];
    const bValue = b[sortConfig.key as keyof EnhancedOpinion];
    
    // Handle different types of values
    if (typeof aValue === 'bigint' && typeof bValue === 'bigint') {
      return sortConfig.direction === 'asc' 
        ? aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        : aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // String comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortConfig.direction === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });

  // Format price from wei to USDC (6 decimals)
  const formatPrice = (price: bigint) => {
    return formatUnits(price, 6);
  };

  // Shorten Ethereum address for display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) return (
    <div className="rounded-xl border border-gray-200 bg-white shadow p-8">
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse text-center">
          <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="text-gray-500">Loading opinions...</div>
        </div>
      </div>
    </div>
  );
  
  if (opinions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opinions found</h3>
          <p className="text-gray-500 mb-6">Be the first to create an opinion on the platform!</p>
          <Link 
            href="/create" 
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Create Opinion
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
      {/* Add the toggle control */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-500">
          Showing {opinions.length} opinion{opinions.length !== 1 ? 's' : ''}
        </span>
        
        <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={showInactive} 
            onChange={() => setShowInactive(!showInactive)} 
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Show inactive opinions
          </span>
        </label>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              { key: 'id', label: '#' },
              { key: 'question', label: 'Question' },
              { key: 'currentAnswer', label: 'Answer' },
              { key: 'currentAnswerOwner', label: 'Owner' },
              { key: 'currentPrice', label: 'Price' },
              { key: 'isActive', label: 'Status' }, // Added status column
              { key: 'priceChange', label: '24h %' },
              { key: 'totalVolume', label: 'Volume' },
              { key: 'actions', label: '' }
            ].map((column) => (
              <th
                key={column.key}
                onClick={() => column.key !== 'actions' && handleSort(column.key as keyof EnhancedOpinion)}
                className={`px-6 py-4 text-left text-sm font-semibold text-gray-900 ${
                  column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortConfig.key === column.key && (
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
            <tr key={String(opinion.id)} className={`hover:bg-gray-50 ${!opinion.isActive ? 'opacity-60' : ''}`}>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {String(opinion.id)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                <Link 
                  href={`/opinions/${opinion.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {opinion.question}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {opinion.currentAnswer}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                {shortenAddress(opinion.currentAnswerOwner)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {formatPrice(opinion.currentPrice)} USDC
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  opinion.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {opinion.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className={`px-6 py-4 text-sm font-medium ${
                !opinion.priceChange ? 'text-gray-500' :
                opinion.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {opinion.priceChange !== undefined 
                  ? `${opinion.priceChange > 0 ? '+' : ''}${opinion.priceChange.toFixed(1)}%` 
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {formatPrice(opinion.totalVolume)} USDC
              </td>
              <td className="px-6 py-4 text-sm">
                {opinion.isActive ? (
                  <Link 
                    href={`/opinions/${opinion.id}`} 
                    className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    Buy Opinion
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-4 py-2 font-medium text-gray-400 cursor-not-allowed">
                    Inactive
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}