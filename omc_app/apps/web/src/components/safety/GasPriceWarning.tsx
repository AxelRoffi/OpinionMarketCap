'use client';

import React, { useState, useEffect } from 'react';
import { Fuel, AlertTriangle, TrendingUp, Clock, Activity, Zap } from 'lucide-react';
import { formatEther, formatGwei } from 'viem';
import { useGasPrice, useEstimateGas, useBlock } from 'wagmi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { isMainnet, CURRENT_FEATURES } from '@/lib/environment';

/**
 * ⛽ GAS PRICE WARNING COMPONENT
 * 
 * Provides real-time gas price monitoring and cost estimation
 * Critical for mainnet transactions to prevent overpaying
 */

interface GasPriceWarningProps {
  estimatedGas?: bigint;
  transactionType: string;
  onGasLimitChange?: (gasLimit: bigint) => void;
  className?: string;
}

interface GasPriceLevel {
  level: 'low' | 'normal' | 'high' | 'extreme';
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

interface GasEstimation {
  slow: number;    // gwei
  standard: number; // gwei  
  fast: number;    // gwei
  costUSDSlow: number;
  costUSDStandard: number;
  costUSDFast: number;
  waitTimeMinutes: {
    slow: number;
    standard: number;
    fast: number;
  };
}

const GAS_LEVELS: Record<string, GasPriceLevel> = {
  low: {
    level: 'low',
    label: 'Low',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Good time to transact - low network congestion'
  },
  normal: {
    level: 'normal',
    label: 'Normal',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Normal network conditions'
  },
  high: {
    level: 'high',
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'High network congestion - consider waiting'
  },
  extreme: {
    level: 'extreme',
    label: 'Extreme',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Extreme gas prices - strongly consider waiting'
  }
};

// Estimated ETH price in USD (in production, fetch from API)
const ETH_PRICE_USD = 3000;

export function GasPriceWarning({
  estimatedGas,
  transactionType,
  onGasLimitChange,
  className = ""
}: GasPriceWarningProps) {
  const [gasEstimation, setGasEstimation] = useState<GasEstimation | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [showDetails, setShowDetails] = useState(false);

  // Wagmi hooks
  const { data: gasPrice } = useGasPrice();
  const { data: latestBlock } = useBlock();

  const isMainnetEnv = isMainnet();
  const maxGasPriceGwei = CURRENT_FEATURES.MAX_GAS_PRICE_GWEI;

  // Determine gas price level
  const getGasPriceLevel = (gasPriceGwei: number): GasPriceLevel => {
    if (gasPriceGwei <= 2) return GAS_LEVELS.low;
    if (gasPriceGwei <= 5) return GAS_LEVELS.normal;
    if (gasPriceGwei <= 15) return GAS_LEVELS.high;
    return GAS_LEVELS.extreme;
  };

  // Calculate gas estimation
  useEffect(() => {
    if (!gasPrice) return;

    const currentGasPriceGwei = Number(formatGwei(gasPrice));
    
    // Estimate different speed options (simplified)
    const slowGwei = Math.max(1, currentGasPriceGwei * 0.8);
    const standardGwei = currentGasPriceGwei;
    const fastGwei = currentGasPriceGwei * 1.2;

    const gasAmount = estimatedGas ? Number(estimatedGas) : 150000; // Default estimate

    const estimation: GasEstimation = {
      slow: slowGwei,
      standard: standardGwei,
      fast: fastGwei,
      costUSDSlow: (slowGwei / 1e9) * gasAmount * ETH_PRICE_USD,
      costUSDStandard: (standardGwei / 1e9) * gasAmount * ETH_PRICE_USD,
      costUSDFast: (fastGwei / 1e9) * gasAmount * ETH_PRICE_USD,
      waitTimeMinutes: {
        slow: 5,      // Estimate
        standard: 2,   // Estimate
        fast: 1        // Estimate
      }
    };

    setGasEstimation(estimation);
  }, [gasPrice, estimatedGas]);

  if (!gasPrice || !gasEstimation) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 animate-pulse text-gray-400" />
              <span className="text-sm text-gray-500">Loading gas price data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentGasPriceGwei = Number(formatGwei(gasPrice));
  const gasPriceLevel = getGasPriceLevel(currentGasPriceGwei);
  const isHighGas = gasPriceLevel.level === 'high' || gasPriceLevel.level === 'extreme';
  const exceedsMax = currentGasPriceGwei > maxGasPriceGwei;

  // Calculate selected gas cost
  const selectedGasPrice = gasEstimation[selectedSpeed];
  const selectedCostUSD = gasEstimation[`costUSD${selectedSpeed.charAt(0).toUpperCase() + selectedSpeed.slice(1)}` as keyof GasEstimation] as number;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Gas Price Overview */}
      <Card className={gasPriceLevel.bgColor}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <Fuel className="w-4 h-4 mr-2" />
              Network Gas Price
            </CardTitle>
            <Badge className={gasPriceLevel.bgColor}>
              {gasPriceLevel.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{currentGasPriceGwei.toFixed(1)} gwei</div>
              <div className="text-xs text-gray-500">{gasPriceLevel.description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Block #{latestBlock?.number?.toString()}</div>
              <div className="text-xs text-gray-500">Latest block</div>
            </div>
          </div>

          {/* Gas Price Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low (1 gwei)</span>
              <span>Extreme (20+ gwei)</span>
            </div>
            <Progress 
              value={Math.min((currentGasPriceGwei / 20) * 100, 100)} 
              className="h-2"
            />
          </div>

          {gasPriceLevel.level !== 'low' && (
            <Alert className={gasPriceLevel.bgColor}>
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {gasPriceLevel.description}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Transaction Cost Estimation */}
      {estimatedGas && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transaction Cost Estimate</CardTitle>
            <p className="text-xs text-gray-500">Choose your transaction speed</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Speed Selection */}
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'standard', 'fast'] as const).map((speed) => (
                <Button
                  key={speed}
                  variant={selectedSpeed === speed ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpeed(speed)}
                  className="text-xs h-auto py-3 flex flex-col space-y-1"
                >
                  <div className="font-medium capitalize">{speed}</div>
                  <div className="text-[10px] opacity-75">
                    ~{gasEstimation.waitTimeMinutes[speed]}min
                  </div>
                </Button>
              ))}
            </div>

            {/* Selected Cost Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Gas Price</div>
                  <div className="font-medium">{selectedGasPrice.toFixed(1)} gwei</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Estimated Cost</div>
                  <div className="font-medium">
                    ${selectedCostUSD.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Gas Limit</div>
                  <div className="font-medium">{estimatedGas.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Wait Time</div>
                  <div className="font-medium">
                    ~{gasEstimation.waitTimeMinutes[selectedSpeed]} min
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Gas Warning */}
      {isMainnetEnv && isHighGas && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>High Gas Prices Detected</strong><br />
            Current gas prices are {gasPriceLevel.label.toLowerCase()}. 
            Consider waiting for lower prices to save on transaction costs.
          </AlertDescription>
        </Alert>
      )}

      {/* Max Gas Price Exceeded Warning */}
      {exceedsMax && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Gas Price Limit Exceeded</strong><br />
            Current gas price ({currentGasPriceGwei.toFixed(1)} gwei) exceeds your maximum 
            limit of {maxGasPriceGwei} gwei. Transaction may fail.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Information */}
      <div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showDetails ? 'Hide' : 'Show'} Gas Details
        </button>

        {showDetails && (
          <Card className="mt-3 bg-blue-50 border-blue-200">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs space-y-2">
                <div>
                  <div className="font-medium mb-1">Understanding Gas Prices:</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Gas is the fee paid to validators for processing transactions</li>
                    <li>• Higher gas prices = faster transaction processing</li>
                    <li>• You can set gas limits to control maximum costs</li>
                    <li>• Failed transactions still consume gas fees</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-1">Transaction Type: {transactionType}</div>
                  <div className="text-gray-600">
                    Estimated gas usage: {estimatedGas ? Number(estimatedGas).toLocaleString() : 'Unknown'} units
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-1">Cost Comparison:</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded p-2">
                      <div className="text-green-600 font-medium">Slow</div>
                      <div className="text-xs">${gasEstimation.costUSDSlow.toFixed(4)}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-blue-600 font-medium">Standard</div>
                      <div className="text-xs">${gasEstimation.costUSDStandard.toFixed(4)}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-red-600 font-medium">Fast</div>
                      <div className="text-xs">${gasEstimation.costUSDFast.toFixed(4)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default GasPriceWarning;