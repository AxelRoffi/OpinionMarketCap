'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCcw,
  Copy,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getBlockExplorerUrl, isMainnet, CURRENT_USDC } from '@/lib/environment';

/**
 * 📊 TRANSACTION HISTORY & RECOVERY
 * 
 * Provides comprehensive transaction tracking and failed transaction recovery
 * Essential for user confidence and debugging
 */

interface TransactionRecord {
  hash: string;
  type: 'submit_answer' | 'buy_question' | 'create_opinion' | 'join_pool' | 'create_pool' | 'approve';
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  timestamp: number;
  amount?: bigint;
  gasUsed?: bigint;
  gasPrice?: bigint;
  opinionId?: number;
  poolId?: number;
  error?: string;
  retryable?: boolean;
  blockNumber?: bigint;
}

interface TransactionHistoryProps {
  className?: string;
  maxItems?: number;
  showFilters?: boolean;
}

const TRANSACTION_TYPES = {
  submit_answer: { label: 'Submit Answer', icon: '💬', color: 'blue' },
  buy_question: { label: 'Buy Question', icon: '🛒', color: 'green' },
  create_opinion: { label: 'Create Opinion', icon: '✨', color: 'purple' },
  join_pool: { label: 'Join Pool', icon: '🏊', color: 'cyan' },
  create_pool: { label: 'Create Pool', icon: '🎯', color: 'orange' },
  approve: { label: 'Approve USDC', icon: '✅', color: 'gray' },
} as const;

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_ICONS = {
  pending: Clock,
  success: CheckCircle,
  failed: AlertTriangle,
  cancelled: RefreshCcw,
};

export function TransactionHistory({ 
  className = "",
  maxItems = 50,
  showFilters = true 
}: TransactionHistoryProps) {
  const { address } = useAccount();
  
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isMainnetEnv = isMainnet();

  // Load transaction history from localStorage
  useEffect(() => {
    if (!address) return;

    const storageKey = `opinionmarket.transactions.${address.toLowerCase()}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert bigint strings back to bigint
        const converted = parsed.map((tx: any) => ({
          ...tx,
          amount: tx.amount ? BigInt(tx.amount) : undefined,
          gasUsed: tx.gasUsed ? BigInt(tx.gasUsed) : undefined,
          gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
          blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
        }));
        setTransactions(converted.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    }
  }, [address, maxItems]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.opinionId?.toString().includes(searchQuery) ||
        tx.poolId?.toString().includes(searchQuery)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, filterStatus, searchQuery]);

  // Save transaction to history
  const saveTransaction = (tx: TransactionRecord) => {
    if (!address) return;

    const storageKey = `opinionmarket.transactions.${address.toLowerCase()}`;
    try {
      const existing = localStorage.getItem(storageKey);
      const current = existing ? JSON.parse(existing) : [];
      
      // Convert bigints to strings for storage
      const toStore = {
        ...tx,
        amount: tx.amount?.toString(),
        gasUsed: tx.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: tx.blockNumber?.toString(),
      };
      
      // Add new transaction, avoiding duplicates
      const updated = [toStore, ...current.filter((existing: any) => existing.hash !== tx.hash)]
        .slice(0, maxItems);
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // Reload from storage to update state
      setTransactions(current => [tx, ...current.filter(existing => existing.hash !== tx.hash)]);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  // Format USDC amount
  const formatUSDC = (wei?: bigint): string => {
    if (!wei) return '-';
    const usdc = Number(wei) / 1_000_000;
    return usdc.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  // Format gas cost
  const formatGasCost = (gasUsed?: bigint, gasPrice?: bigint): string => {
    if (!gasUsed || !gasPrice) return '-';
    const costETH = formatEther(gasUsed * gasPrice);
    return `${parseFloat(costETH).toFixed(6)} ETH`;
  };

  // Copy transaction hash
  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      // Show temporary feedback (you could use a toast here)
    } catch (error) {
      console.error('Failed to copy hash:', error);
    }
  };

  // Export transaction history
  const exportHistory = () => {
    const data = filteredTransactions.map(tx => ({
      Hash: tx.hash,
      Type: TRANSACTION_TYPES[tx.type].label,
      Status: tx.status.toUpperCase(),
      Amount: tx.amount ? formatUSDC(tx.amount) : '-',
      'Gas Cost': formatGasCost(tx.gasUsed, tx.gasPrice),
      Timestamp: new Date(tx.timestamp).toISOString(),
      'Opinion ID': tx.opinionId || '-',
      'Pool ID': tx.poolId || '-',
      Error: tx.error || '-'
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opinionmarket-transactions-${address}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Retry failed transaction
  const retryTransaction = (tx: TransactionRecord) => {
    // This would trigger the original transaction flow again
    alert(`Retry functionality for ${tx.type} would be implemented here.`);
  };

  if (!address) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <History className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Connect your wallet to view transaction history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <History className="w-5 h-5 mr-2" />
              Transaction History
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportHistory}
                disabled={filteredTransactions.length === 0}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by hash, type, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(TRANSACTION_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Transaction Table */}
          {filteredTransactions.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gas</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx, index) => {
                    const txType = TRANSACTION_TYPES[tx.type];
                    const StatusIcon = STATUS_ICONS[tx.status];
                    
                    return (
                      <TableRow key={tx.hash + index}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{txType.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{txType.label}</div>
                              {(tx.opinionId || tx.poolId) && (
                                <div className="text-xs text-gray-500">
                                  {tx.opinionId && `Opinion #${tx.opinionId}`}
                                  {tx.poolId && `Pool #${tx.poolId}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={STATUS_COLORS[tx.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {tx.status}
                          </Badge>
                          {tx.error && (
                            <div className="text-xs text-red-600 mt-1 truncate max-w-[100px]">
                              {tx.error}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {formatUSDC(tx.amount)}
                            {tx.amount && (
                              <div className="text-xs text-gray-500">
                                {CURRENT_USDC.SYMBOL}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {formatGasCost(tx.gasUsed, tx.gasPrice)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyHash(tx.hash)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getBlockExplorerUrl(tx.hash), '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            
                            {tx.status === 'failed' && tx.retryable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryTransaction(tx)}
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                              >
                                <RefreshCcw className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Transactions Found</h3>
              <p className="text-gray-400">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Your transaction history will appear here after you make your first trade.'
                }
              </p>
            </div>
          )}

          {/* Failed Transaction Recovery */}
          {filteredTransactions.some(tx => tx.status === 'failed' && tx.retryable) && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Failed Transactions Detected</strong><br />
                Some transactions failed but may be retryable. Check the transaction details and try again if appropriate.
                {isMainnetEnv && ' Remember that gas fees were still charged for failed transactions.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to add transactions to history
export const useTransactionHistory = () => {
  const addTransaction = (tx: Omit<TransactionRecord, 'timestamp'>) => {
    const record: TransactionRecord = {
      ...tx,
      timestamp: Date.now()
    };
    
    // This would be called from components when transactions occur
    // For now, we'll just store it
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('transaction-added', { detail: record });
      window.dispatchEvent(event);
    }
  };

  return { addTransaction };
};

export default TransactionHistory;