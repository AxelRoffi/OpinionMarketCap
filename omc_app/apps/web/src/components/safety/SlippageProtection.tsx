'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Info } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

import { isMainnet, CURRENT_USDC } from '@/lib/environment';

/**
 * 🛡️ SLIPPAGE PROTECTION COMPONENT
 * 
 * Provides price impact warnings and slippage tolerance controls
 * Critical for protecting users from unexpected price changes
 */

interface SlippageProtectionProps {
  expectedPrice: bigint;
  currentPrice: bigint;
  onSlippageChange: (tolerance: number) => void;
  onMaxPriceChange: (maxPrice: bigint) => void;
  className?: string;
  showAdvanced?: boolean;
}

interface PriceImpactAnalysis {
  percentageChange: number;
  impactLevel: 'low' | 'medium' | 'high' | 'extreme';
  recommendation: string;
  warningMessage?: string;
}

const IMPACT_THRESHOLDS = {
  low: 5,      // < 5%
  medium: 15,  // 5-15%
  high: 30,    // 15-30%
  extreme: 100 // > 30%
};

const IMPACT_COLORS = {
  low: 'bg-green-50 border-green-200 text-green-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  extreme: 'bg-red-50 border-red-200 text-red-800'
};

const IMPACT_ICONS = {
  low: Shield,
  medium: Info,
  high: AlertTriangle,
  extreme: AlertTriangle
};

export function SlippageProtection({
  expectedPrice,
  currentPrice,
  onSlippageChange,
  onMaxPriceChange,
  className = "",
  showAdvanced = false
}: SlippageProtectionProps) {
  const [slippageTolerance, setSlippageTolerance] = useState<number[]>([2.0]); // 2% default
  const [customTolerance, setCustomTolerance] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isMainnetEnv = isMainnet();
  const isIncrease = expectedPrice > currentPrice;

  // Calculate price impact
  const calculatePriceImpact = (): PriceImpactAnalysis => {
    const change = Number(expectedPrice - currentPrice);
    const percentageChange = (change / Number(currentPrice)) * 100;
    
    let impactLevel: PriceImpactAnalysis['impactLevel'] = 'low';
    let recommendation = '';
    let warningMessage = '';

    const absChange = Math.abs(percentageChange);

    if (absChange <= IMPACT_THRESHOLDS.low) {
      impactLevel = 'low';
      recommendation = 'Normal price movement. Safe to proceed.';
    } else if (absChange <= IMPACT_THRESHOLDS.medium) {
      impactLevel = 'medium';
      recommendation = 'Moderate price impact. Consider if this aligns with your expectations.';
    } else if (absChange <= IMPACT_THRESHOLDS.high) {
      impactLevel = 'high';
      recommendation = 'Significant price impact. Verify this is expected behavior.';
      warningMessage = 'Large price changes may indicate high competition or market volatility.';
    } else {
      impactLevel = 'extreme';
      recommendation = 'Extreme price impact detected. Consider waiting for better conditions.';
      warningMessage = 'Such large price movements are unusual and may indicate market manipulation or errors.';
    }

    return {
      percentageChange,
      impactLevel,
      recommendation,
      warningMessage
    };
  };

  const priceImpact = calculatePriceImpact();
  const ImpactIcon = IMPACT_ICONS[priceImpact.impactLevel];

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

  // Calculate maximum acceptable price based on tolerance
  const calculateMaxPrice = (tolerance: number): bigint => {
    const toleranceMultiplier = 1 + (tolerance / 100);
    return BigInt(Math.floor(Number(expectedPrice) * toleranceMultiplier));
  };

  // Handle slippage tolerance change
  const handleSlippageChange = (value: number[]) => {
    setSlippageTolerance(value);
    onSlippageChange(value[0]);
    onMaxPriceChange(calculateMaxPrice(value[0]));
  };

  // Preset tolerance options
  const presetTolerances = [0.5, 1.0, 2.0, 5.0];

  useEffect(() => {
    // Initialize with default tolerance
    onSlippageChange(slippageTolerance[0]);
    onMaxPriceChange(calculateMaxPrice(slippageTolerance[0]));
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Price Impact Analysis */}
      <Card className={`border-2 ${IMPACT_COLORS[priceImpact.impactLevel]}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <ImpactIcon className="w-4 h-4 mr-2" />
              Price Impact Analysis
            </CardTitle>
            <Badge className={IMPACT_COLORS[priceImpact.impactLevel]}>
              {priceImpact.impactLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Price Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Current Price</Label>
              <div className="text-sm font-semibold">{formatUSDC(currentPrice)}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Expected Price</Label>
              <div className={`text-sm font-semibold flex items-center ${
                isIncrease ? 'text-red-600' : 'text-green-600'
              }`}>
                {isIncrease ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {formatUSDC(expectedPrice)}
              </div>
            </div>
          </div>

          {/* Impact Percentage */}
          <div className="text-center py-2">
            <div className={`text-lg font-bold ${
              isIncrease ? 'text-red-600' : 'text-green-600'
            }`}>
              {isIncrease ? '+' : ''}{priceImpact.percentageChange.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">Price Change</div>
          </div>

          <Separator />

          {/* Recommendation */}
          <div className="text-sm">
            <div className="font-medium mb-1">Recommendation:</div>
            <div className="text-gray-700">{priceImpact.recommendation}</div>
            {priceImpact.warningMessage && (
              <Alert className="mt-2 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <AlertDescription className="text-xs text-orange-800">
                  {priceImpact.warningMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slippage Tolerance Controls */}
      {(showAdvanced || isMainnetEnv) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Slippage Protection</CardTitle>
            <p className="text-xs text-gray-500">
              Set maximum price increase you&apos;re willing to accept
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Buttons */}
            <div>
              <Label className="text-xs">Quick Settings</Label>
              <div className="flex space-x-2 mt-2">
                {presetTolerances.map(tolerance => (
                  <Button
                    key={tolerance}
                    variant={slippageTolerance[0] === tolerance ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSlippageChange([tolerance])}
                    className="text-xs px-3 py-1"
                  >
                    {tolerance}%
                  </Button>
                ))}
                <Button
                  variant={customTolerance ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCustomTolerance(!customTolerance)}
                  className="text-xs px-3 py-1"
                >
                  Custom
                </Button>
              </div>
            </div>

            {/* Custom Tolerance Slider */}
            {customTolerance && (
              <div>
                <Label className="text-xs">
                  Custom Tolerance: {slippageTolerance[0].toFixed(1)}%
                </Label>
                <Slider
                  value={slippageTolerance}
                  onValueChange={handleSlippageChange}
                  max={20}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  0.1% (very strict) to 20% (very flexible)
                </div>
              </div>
            )}

            {/* Maximum Price Display */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Maximum Price You&apos;ll Pay:</div>
              <div className="text-sm font-semibold">
                {formatUSDC(calculateMaxPrice(slippageTolerance[0]))}
              </div>
              <div className="text-xs text-gray-500">
                (+{slippageTolerance[0]}% tolerance from expected price)
              </div>
            </div>

            {/* Protection Details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showDetails ? 'Hide' : 'Show'} Protection Details
            </button>

            {showDetails && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="text-xs">
                  <div className="font-medium mb-2">How Slippage Protection Works:</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Your transaction will fail if the price exceeds your maximum</li>
                    <li>• You&apos;ll only pay gas fees, not the full transaction amount</li>
                    <li>• Lower tolerance = better price protection, higher failure risk</li>
                    <li>• Higher tolerance = more likely to succeed, less price protection</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mainnet Warning for High Impact */}
      {isMainnetEnv && priceImpact.impactLevel === 'extreme' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>⚠️ EXTREME PRICE IMPACT DETECTED</strong><br />
            This transaction will cause a {Math.abs(priceImpact.percentageChange).toFixed(1)}% price change.
            Consider whether this is expected before proceeding with real money.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default SlippageProtection;