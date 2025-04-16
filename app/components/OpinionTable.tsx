'use client';

import { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { ConnectButton } from '@coinbase/onchainkit';
import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

// Contract information
const contractAddress = '0x42785b24fc527B031A8e83f845e37cB827416791';

// Define ABI for the specific functions we need
const abi = parseAbi([
  'function nextOpinionId() external view returns (uint256)',
  'function opinions(uint256 opinionId) external view returns (uint256 id, string question, address creator, uint256 currentPrice, uint256 nextPrice, bool isActive, string currentAnswer, address currentAnswerOwner, uint256 totalVolume)',
  'function getAnswerHistory(uint256 opinionId) external view returns (tuple(string answer, address owner, uint256 price, uint256 timestamp)[])'
]);

// Modified to match contract's Opinion structure
type Opinion = {
  id: bigint;
  question: string;
  creator: string;
  currentPrice: bigint;
  nextPrice: bigint;
  isActive: boolean;
  currentAnswer: string;
  currentAnswerOwner: string;
  totalVolume: bigint;
  lastPrice?: bigint;
  priceChange?: number;
};

type SortConfig = {
  key: keyof Opinion | null;
  direction: 'asc' | 'desc';
};

export default function OpinionTable() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  // Check wallet connection using window.ethereum
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts'
          });
          setConnected(accounts.length > 0);
        } catch (error) {
          console.error('Error checking connection:', error);
          setConnected(false);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setConnected(accounts.length > 0);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

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
          address: contractAddress,
          abi,
          functionName: 'nextOpinionId',
        }) as bigint;
        
        // Fetch all opinions (starting from ID 1)
        const opinionPromises = [];
        for (let i = 1; i < Number(nextId); i++) {
          opinionPromises.push(
            client.readContract({
              address: contractAddress,
              abi,
              functionName: 'opinions',
              args: [BigInt(i)],
            })
          );
        }
        
        const fetchedOpinions = await Promise.all(opinionPromises);
        
        // Fetch history for each opinion to calculate price change
        const opinionsWithHistory = await Promise.all(
          fetchedOpinions.map(async (opinion) => {
            // Handle both tuple and object responses
            const typedOpinion = opinion as Opinion;
            
            if (typedOpinion.isActive) {
              try {
                const history = await client.readContract({
                  address: contractAddress,
                  abi,
                  functionName: 'getAnswerHistory',
                  args: [typedOpinion.id],
                }) as { answer: string; owner: string; price: bigint; timestamp: bigint }[];
                
                // Calculate price change if we have enough history
                if (history.length > 1) {
                  const currentPrice = typedOpinion.currentPrice;
                  const lastPrice = history[history.length - 2].price;
                  
                  // Calculate percentage change
                  const priceChange = currentPrice > lastPrice
                    ? Number(((currentPrice - lastPrice) * BigInt(10000)) / lastPrice) / 100
                    : -Number(((lastPrice - currentPrice) * BigInt(10000)) / lastPrice) / 100;
                  
                  return { 
                    ...typedOpinion, 
                    lastPrice, 
                    priceChange 
                  };
                }
              } catch (error) {
                console.error(`Error fetching history for opinion ${typedOpinion.id}:`, error);
              }
            }
            
            return typedOpinion;
          })
        );
        
        setOpinions(opinionsWithHistory.filter(o => o.isActive));
      } catch (error) {
        console.error('Error fetching opinions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOpinions();
  }, [connected]);

  const handleSort = (key: keyof Opinion) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedOpinions = [...opinions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
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

  if (loading) return <div className="text-center py-8">Loading opinions...</div>;
  
  if (opinions.length === 0) {
    return <div className="text-center py-8">No opinions found. Create the first one!</div>;
  }
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['question', 'currentAnswer', 'currentPrice', 'priceChange', 'totalVolume', 'currentAnswerOwner', 'actions'].map((key) => (
              <th
                key={key}
                onClick={() => key !== 'actions' && handleSort(key as keyof Opinion)}
                className={`px-6 py-4 text-left text-sm font-semibold text-gray-900 ${
                  key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {key === 'priceChange' ? '24h %' : 
                   key === 'currentPrice' ? 'Price' :
                   key === 'currentAnswer' ? 'Answer' :
                   key === 'currentAnswerOwner' ? 'Owner' :
                   key === 'totalVolume' ? 'Volume' :
                   key.charAt(0).toUpperCase() + key.slice(1)}
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
            <tr key={String(opinion.id)} className="hover:bg-gray-50">
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
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {formatPrice(opinion.currentPrice)} USDC
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
              <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                {`${opinion.currentAnswerOwner.slice(0, 6)}...${opinion.currentAnswerOwner.slice(-4)}`}
              </td>
              <td className="px-6 py-4 text-sm">
                <Link href={`/opinions/${opinion.id}`} className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-600 hover:bg-blue-100 transition-colors">
                  Buy Opinion
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}