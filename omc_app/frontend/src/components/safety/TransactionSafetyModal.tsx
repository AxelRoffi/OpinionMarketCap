'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  DollarSign,
  Clock,
  Shield,
  Info,
  CheckCircle,
  X,
  Calculator,
  Zap
} from 'lucide-react';
import { formatEther, parseEther } from 'viem';
import { useGasPrice, useEstimateGas } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

import { isMainnet, CURRENT_USDC, CURRENT_FEATURES } from '@/lib/environment';

/**
 * 🚨 TRANSACTION SAFETY MODAL
 * 
 * Comprehensive safety confirmation for mainnet transactions
 * - Real money warnings
 * - Gas cost estimation
 * - Slippage protection
 * - Risk disclosure
 * - Double confirmation required
 */

export interface TransactionDetails {
  type: 'submit_answer' | 'buy_question' | 'create_opinion' | 'join_pool' | 'create_pool';
  amount: bigint;
  description: string;
  recipient?: string;
  estimatedGas?: bigint;
  additionalInfo?: {
    opinionId?: number;
    poolId?: number;
    newPrice?: bigint;
    oldPrice?: bigint;
  };
}

interface TransactionSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: SafetyConfirmationOptions) => void;
  transactionDetails: TransactionDetails;
  isLoading?: boolean;
  error?: string | null;
}

export interface SafetyConfirmationOptions {
  slippageTolerance: number;
  maxGasPrice: bigint;
  acceptRisks: boolean;
  doubleConfirmed: boolean;
}

const TRANSACTION_TYPES = {
  submit_answer: {
    title: 'Submit New Answer',
    icon: Zap,
    riskLevel: 'medium' as const,
    description: 'You are submitting a new answer and will become the current owner.'
  },
  buy_question: {
    title: 'Purchase Question Ownership',
    icon: DollarSign,
    riskLevel: 'high' as const,
    description: 'You are purchasing ownership of this question. You will receive future trading fees.'
  },
  create_opinion: {
    title: 'Create New Opinion',
    icon: CheckCircle,
    riskLevel: 'low' as const,
    description: 'You are creating a new opinion with an initial answer.'
  },
  join_pool: {
    title: 'Join Pool',
    icon: Shield,
    riskLevel: 'medium' as const,
    description: 'You are contributing to a collective pool to submit an answer.'
  },
  create_pool: {
    title: 'Create Pool',
    icon: Shield,
    riskLevel: 'medium' as const,
    description: 'You are creating a new collective pool for an opinion.'
  }
};

const RISK_COLORS = {
  low: 'bg-green-50 border-green-200 text-green-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-red-50 border-red-200 text-red-800'
};

export function TransactionSafetyModal({
  isOpen,
  onClose,
  onConfirm,
  transactionDetails,
  isLoading = false,
  error = null
}: TransactionSafetyModalProps) {
  const [slippageTolerance, setSlippageTolerance] = useState<number[]>([1.0]); // 1% default
  const [maxGasPriceGwei, setMaxGasPriceGwei] = useState<number[]>([CURRENT_FEATURES.MAX_GAS_PRICE_GWEI]);
  const [acceptRisks, setAcceptRisks] = useState(false);
  const [doubleConfirmation, setDoubleConfirmation] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [countdown, setCountdown] = useState(5); // 5 second safety delay

  // Gas estimation
  const { data: gasPrice } = useGasPrice();
  const currentGasGwei = gasPrice ? Number(formatEther(gasPrice)) * 1e9 : 0;
  
  const transactionType = TRANSACTION_TYPES[transactionDetails.type];
  const isMainnetEnv = isMainnet();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcceptRisks(false);
      setDoubleConfirmation(false);
      setCountdown(5);
      
      // Countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Format USDC amount
  const formatUSDC = (wei: bigint): string => {
    const usdc = Number(wei) / 1_000_000;
    return usdc.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  // Calculate gas cost in USD (approximate)
  const estimateGasCostUSD = (): string => {
    if (!gasPrice || !transactionDetails.estimatedGas) return 'Unknown';
    
    const gasCostETH = Number(formatEther(gasPrice * transactionDetails.estimatedGas));
    const ethPriceUSD = 3000; // Approximate ETH price - in production, fetch from API
    const gasCostUSD = gasCostETH * ethPriceUSD;
    
    return gasCostUSD.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle confirmation
  const handleConfirm = () => {
    const options: SafetyConfirmationOptions = {
      slippageTolerance: slippageTolerance[0],
      maxGasPrice: parseEther((maxGasPriceGwei[0] / 1e9).toString()),
      acceptRisks,
      doubleConfirmed: doubleConfirmation
    };
    
    onConfirm(options);
  };

  const canConfirm = acceptRisks && doubleConfirmation && countdown === 0 && !isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <transactionType.icon className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">{transactionType.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{transactionType.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mainnet Warning */}
          {isMainnetEnv && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>⚠️ REAL MONEY TRANSACTION</strong><br />
                You are about to spend real USDC on Base Mainnet. This transaction cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Details */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <div className="text-right">
                  <span className="text-lg font-bold">{formatUSDC(transactionDetails.amount)}</span>
                  <div className="text-xs text-gray-500">{CURRENT_USDC.SYMBOL}</div>
                </div>
              </div>

              {transactionDetails.recipient && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Recipient:</span>
                  <code className="text-sm bg-white px-2 py-1 rounded">
                    {transactionDetails.recipient.slice(0, 6)}...{transactionDetails.recipient.slice(-4)}
                  </code>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Estimated Gas:</span>
                <div className="text-right">
                  <span className="text-sm">{estimateGasCostUSD()}</span>
                  <div className="text-xs text-gray-500">~{currentGasGwei.toFixed(1)} gwei</div>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-600">Risk Level:</span>
                <Badge className={RISK_COLORS[transactionType.riskLevel]}>
                  {transactionType.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Price Impact Warning (for answers) */}
          {transactionDetails.type === 'submit_answer' && transactionDetails.additionalInfo?.newPrice && (
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Price Impact:</strong> The next answer price will be {formatUSDC(transactionDetails.additionalInfo.newPrice)}.
                This represents the minimum cost for the next trader.
              </AlertDescription>
            </Alert>
          )}

          {/* Advanced Settings */}
          {isMainnetEnv && (
            <div className="space-y-4">
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
              </button>

              {showAdvancedSettings && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 space-y-4">
                    {/* Slippage Tolerance */}
                    <div>
                      <Label className="text-sm font-medium">Slippage Tolerance: {slippageTolerance[0]}%</Label>
                      <Slider
                        value={slippageTolerance}
                        onValueChange={setSlippageTolerance}
                        max={10}
                        min={0.1}
                        step={0.1}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Maximum price change you&apos;re willing to accept
                      </div>
                    </div>

                    {/* Max Gas Price */}
                    <div>
                      <Label className="text-sm font-medium">Max Gas Price: {maxGasPriceGwei[0]} gwei</Label>
                      <Slider
                        value={maxGasPriceGwei}
                        onValueChange={setMaxGasPriceGwei}
                        max={20}
                        min={1}
                        step={0.5}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Transaction will fail if gas price exceeds this limit
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Risk Acknowledgment */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-risks"
                checked={acceptRisks}
                onCheckedChange={(checked) => setAcceptRisks(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="accept-risks" className="text-sm leading-5">
                I understand this is a {isMainnetEnv ? 'real money' : 'testnet'} transaction and acknowledge the risks:
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Transactions on blockchain are irreversible</li>
                  <li>Smart contract interactions may have unexpected outcomes</li>
                  <li>Gas fees will be charged even if the transaction fails</li>
                  {isMainnetEnv && <li>This will spend real USDC from my wallet</li>}
                </ul>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="double-confirm"
                checked={doubleConfirmation}
                onCheckedChange={(checked) => setDoubleConfirmation(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="double-confirm" className="text-sm">
                I have double-checked all transaction details and am ready to proceed
                {isMainnetEnv && ' with real money'}
              </Label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`flex-1 ${countdown > 0 ? 'bg-gray-400' : ''}`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                  </motion.div>
                  Processing...
                </>
              ) : countdown > 0 ? (
                `Confirm in ${countdown}s`
              ) : (
                `Confirm ${isMainnetEnv ? 'Real Money' : 'Testnet'} Transaction`
              )}
            </Button>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}

export default TransactionSafetyModal;