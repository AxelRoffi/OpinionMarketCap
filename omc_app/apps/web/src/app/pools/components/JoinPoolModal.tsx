'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  DollarSign, 
  Target, 
  Clock, 
  Users,
  Calculator,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContributeToPool } from '../hooks/useContributeToPool';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';
import usePoolCompletion from '@/hooks/usePoolCompletion';
import useCompletePool from '@/hooks/useCompletePool';
import { toast } from 'sonner';

interface JoinPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: any; // Pool object from the table
}

// Helper functions
const formatNumber = (amount: number) => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toString();
};

const formatTimeLeft = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = timestamp - now;
  
  if (timeLeft <= 0) return 'Expired';
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h left`;
  return `${hours}h ${minutes}m left`;
};

export default function JoinPoolModal({ isOpen, onClose, pool }: JoinPoolModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Pool data with safe defaults (MUST be before hooks)
  const poolData = pool || {
    id: 0,
    name: 'Unknown Pool',
    targetPrice: 0,
    currentAmount: 0,
    question: 'Unknown Question',
    opinionId: 'N/A',
    proposedAnswer: 'No answer provided',
    deadline: 0,
    contributorCount: 0,
    progress: 0
  };
  
  // Hooks (called after poolData is defined)
  const { 
    contributeToPool, 
    isContributing, 
    error: contributeError, 
    currentStep,
    approveTxHash,
    contributeTxHash,
    isContributeSuccess 
  } = useContributeToPool();
  const { balance: usdcBalance, loading: balanceLoading } = useUSDCBalance();
  
  // Pool completion hooks - RE-ENABLED with SIMPLE approach
  const { completionState } = usePoolCompletion(poolData.id);
  const { completePool, isCompletingPool } = useCompletePool();
  
  // DEBUG: Log completion state for troubleshooting
  console.log('🔍 POOL COMPLETION DEBUG:', {
    poolId: poolData.id,
    canUserComplete: completionState.canUserComplete,
    remainingAmount: completionState.remainingAmount?.toString(),
    completionCost: completionState.completionCost,
    userUSDCBalance: completionState.userUSDCBalance?.toString(),
    isCompletable: completionState.isCompletable,
    completionStateKeys: Object.keys(completionState)
  });
  
  const handleCompletePool = async () => {
    console.log('🎯 COMPLETE POOL BUTTON CLICKED!');
    console.log('🔍 Pre-check:', {
      canUserComplete: workingCompletionState.canUserComplete,
      remainingAmount: workingCompletionState.remainingAmount?.toString(),
      isCompletingPool
    });
    
    if (!workingCompletionState.canUserComplete) {
      console.warn('❌ Cannot complete pool - canUserComplete is false');
      toast.error('Cannot complete pool', {
        description: 'Pool completion requirements not met',
        duration: 3000,
      });
      return;
    }
    
    try {
      console.log('🚀 SIMPLE APPROACH: Completing pool with exact remaining amount:', {
        poolId: poolData.id,
        remainingAmount: workingCompletionState.remainingAmount.toString(),
        remainingAmountFormatted: workingCompletionState.completionCost
      });
      
      await completePool(poolData.id, workingCompletionState.remainingAmount);
      
      toast.success('🎉 Pool completed!', {
        description: 'Pool has been successfully completed and answer promoted!',
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Pool completion error:', error);
      toast.error('Failed to complete pool', {
        description: error.message || 'Unknown error occurred',
        duration: 5000,
      });
    }
  };
  
  // Real PoolManager rules - no contribution fee
  const CONTRIBUTION_FEE = 0; // Free to contribute to pools
  const EARLY_WITHDRAWAL_PENALTY = 20; // 20% penalty

  // Calculations
  const contributionAmount = parseFloat(amount) || 0;
  const totalRequired = contributionAmount + CONTRIBUTION_FEE;
  const remainingNeeded = Math.max(0, poolData.targetPrice - poolData.currentAmount);
  const maxContribution = Math.min(remainingNeeded, Math.max(0, usdcBalance - CONTRIBUTION_FEE));
  
  // Ensure contribution doesn't exceed what's actually needed
  const actualContribution = Math.min(contributionAmount, remainingNeeded);

  // 🚀 SIMPLE FIX: Use the WORKING data from button validation instead of broken usePoolCompletion
  const workingCompletionState = {
    canUserComplete: remainingNeeded > 0 && remainingNeeded <= (usdcBalance - CONTRIBUTION_FEE) && !balanceLoading,
    remainingAmount: BigInt(Math.round(remainingNeeded * 1_000_000)), // Convert to Wei (6 decimals)
    completionCost: remainingNeeded.toFixed(2),
    userUSDCBalance: BigInt(Math.round(usdcBalance * 1_000_000)),
    isCompletable: remainingNeeded > 0 && poolData.targetPrice > poolData.currentAmount,
  };
  
  console.log('🚀 WORKING COMPLETION STATE (using button validation data):', workingCompletionState);
  
  // Pool completion calculation
  const wouldCompletePool = (poolData.currentAmount + contributionAmount) >= poolData.targetPrice;
  
  // Validations with floating-point tolerance - use actualContribution for validation
  const FLOAT_TOLERANCE = 0.01; // Increased to 0.01 USDC tolerance for floating-point precision
  const actualTotalRequired = actualContribution + CONTRIBUTION_FEE;
  const isAmountValid = actualContribution > 0 && actualContribution <= (maxContribution + FLOAT_TOLERANCE);
  const hasEnoughBalance = actualTotalRequired <= (usdcBalance + FLOAT_TOLERANCE);
  const canContribute = isAmountValid && hasEnoughBalance && !balanceLoading && !isContributing;
  
  // Debug logging for troubleshooting
  console.log('Button validation debug:', {
    contributionAmount,
    actualContribution,
    maxContribution,
    remainingNeeded,
    totalRequired,
    actualTotalRequired,
    usdcBalance,
    isAmountValid,
    hasEnoughBalance,
    canContribute,
    balanceLoading,
    isContributing
  });

  // Handle amount input
  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    // Allow values up to maxContribution + small tolerance
    if (numValue > (maxContribution + FLOAT_TOLERANCE)) {
      setAmount(maxContribution.toFixed(2));
    } else {
      setAmount(value);
    }
    setError(null);
  };

  // Slider state for percentage
  const [sliderPercentage, setSliderPercentage] = useState(50);

  // Calculate amount from percentage
  const getAmountForPercentage = (pct: number) => {
    const amount = (remainingNeeded * pct) / 100;
    return Math.min(amount, maxContribution); // Cap at user's max contribution
  };

  // Update amount when slider changes
  const handleSliderChange = (value: number[]) => {
    const pct = value[0];
    setSliderPercentage(pct);
    const newAmount = getAmountForPercentage(pct);
    setAmount(newAmount.toFixed(2));
  };

  // Handle join pool
  const handleJoinPool = async () => {
    try {
      setError(null);
      console.log('🎯 Contributing exact amount needed:', {
        userInputAmount: contributionAmount,
        actualContribution: actualContribution,
        remainingNeeded: remainingNeeded
      });
      await contributeToPool(poolData.id, actualContribution);
    } catch (err: any) {
      console.error('Join pool error:', err);
      setError(err.message || 'Failed to join pool');
    }
  };

  // Handle success
  React.useEffect(() => {
    if (isContributeSuccess) {
      setSuccess(true);
      setAmount('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    }
  }, [isContributeSuccess, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Don't render if no real pool data
  if (!pool) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800/95 backdrop-blur-sm border border-gray-700/40 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Join Pool: {poolData.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Contribute to this collective funding pool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* COMPLETE POOL SECTION - High Priority */}
          {workingCompletionState.canUserComplete && (
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    🎯 You can complete this pool!
                  </h3>
                </div>
                
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Only <span className="font-bold">${workingCompletionState.completionCost}</span> needed to complete this pool.
                  <span className="block text-xs mt-1 opacity-75">
                    Any tiny overpayment becomes pool rewards ✨
                  </span>
                </p>
                
                <button
                  onClick={handleCompletePool}
                  disabled={isCompletingPool}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCompletingPool ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Completing Pool...</span>
                    </>
                  ) : (
                    `🚀 Complete Pool ($${workingCompletionState.completionCost})`
                  )}
                </button>
              </CardContent>
            </Card>
          )}
          
          {/* OR SEPARATOR - Show only if completion is available */}
          {workingCompletionState.canUserComplete && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">Or contribute any amount</span>
              </div>
            </div>
          )}
          {/* Pool Summary Section - Enhanced with real-time data */}
          <Card className="bg-gray-800/50 border-gray-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Pool Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-white text-base">{poolData.question}</h3>
                <p className="text-xs text-gray-400">Opinion #{poolData.opinionId}</p>
                <p className="text-sm text-white italic mt-1">"{poolData.proposedAnswer}"</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">
                      ${formatNumber(completionState.currentAmount ? Number(completionState.currentAmount) / 1e6 : poolData.currentAmount)}
                    </p>
                    <p className="text-gray-400">
                      of ${formatNumber(completionState.targetAmount ? Number(completionState.targetAmount) / 1e6 : poolData.targetPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="font-medium text-white">{poolData.deadline ? formatTimeLeft(poolData.deadline) : 'No deadline'}</p>
                    <p className="text-gray-400">Time remaining</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 w-4 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">{poolData.contributorCount}</p>
                    <p className="text-gray-400">Contributors</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-medium text-white">
                      {completionState.targetAmount > 0n ? 
                        ((Number(completionState.currentAmount) / Number(completionState.targetAmount)) * 100).toFixed(1) + '%' :
                        poolData.progress.toFixed(1) + '%'
                      }
                    </p>
                    <p className="text-gray-400">Complete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contribution Form */}
          <Card className="bg-gray-800/50 border-gray-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Your Contribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contribution" className="text-white">Amount (USDC)</Label>
                <Input
                  id="contribution"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  min="0.01"
                  max={maxContribution}
                  step="0.01"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Remaining needed: ${remainingNeeded.toFixed(2)}</span>
                  <span>Your balance: ${usdcBalance.toFixed(2)}</span>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAmount((maxContribution / 2).toFixed(2))}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-white transition-colors"
                  >
                    Half (${(maxContribution / 2).toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(maxContribution.toFixed(2))}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-white transition-colors"
                  >
                    Max (${maxContribution.toFixed(2)})
                  </button>
                  {workingCompletionState.canUserComplete && (
                    <button
                      type="button"
                      onClick={handleCompletePool}
                      disabled={isCompletingPool}
                      className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-md text-white transition-colors flex items-center gap-1"
                    >
                      {isCompletingPool ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          Completing...
                        </>
                      ) : (
                        `🚀 Complete Pool ($${workingCompletionState.completionCost})`
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Pool Completion Indicator */}
              {wouldCompletePool && contributionAmount > 0 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-medium text-sm">
                      🎉 This contribution will complete the pool!
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">
                    The pool will be executed and the answer will be promoted.
                  </div>
                </div>
              )}

              {/* Pool Progress Visualization - Right after input */}
              {contributionAmount > 0 && (
                <div className="space-y-3 p-3 bg-gray-700/30 border border-gray-600/40 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Pool Progress After Your Contribution</span>
                    <span className="text-sm text-white">
                      {(((poolData.currentAmount + actualContribution) / poolData.targetPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar with Your Contribution */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
                      {/* Current progress */}
                      <div 
                        className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((poolData.currentAmount / poolData.targetPrice) * 100, 100)}%` }}
                      />
                      {/* Your contribution overlay */}
                      <div 
                        className="absolute top-0 h-3 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ 
                          left: `${Math.min((poolData.currentAmount / poolData.targetPrice) * 100, 100)}%`,
                          width: `${Math.min((actualContribution / poolData.targetPrice) * 100, 100 - (poolData.currentAmount / poolData.targetPrice) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Current: ${poolData.currentAmount.toFixed(2)}</span>
                      <span className="text-emerald-400">+${actualContribution.toFixed(2)} (You)</span>
                      <span>Target: ${poolData.targetPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Your Pool Share - Fixed calculation */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-medium">Your Pool Share:</span>
                    <span className="text-emerald-300 font-bold">
                      {((actualContribution / poolData.targetPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Percentage Slider */}
              {remainingNeeded > 0 && (
                <div className="space-y-4 p-4 bg-gray-700/30 border border-gray-600/40 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-400">Choose contribution amount</Label>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-400">{sliderPercentage}%</span>
                      <span className="text-sm text-gray-400 ml-2">of remaining</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="py-2">
                    <Slider
                      value={[sliderPercentage]}
                      onValueChange={handleSliderChange}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Amount Display */}
                  <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-400">You will contribute</p>
                      <p className="text-xl font-bold text-white">${getAmountForPercentage(sliderPercentage).toFixed(2)} USDC</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Remaining after</p>
                      <p className="text-lg font-medium text-gray-300">
                        ${Math.max(0, remainingNeeded - getAmountForPercentage(sliderPercentage)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quick percentage buttons */}
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleSliderChange([pct])}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          sliderPercentage === pct
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🚨 CRITICAL: Smart Contract Rules Section */}
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <h4 className="font-semibold text-yellow-300">Smart Contract Rules</h4>
                  
                  {/* ⚠️ MANDATORY: Early Withdrawal Penalty */}
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="font-medium text-red-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      ⚠️ Early Withdrawal Penalty
                    </p>
                    <p className="text-red-300 text-sm mt-1">
                      {EARLY_WITHDRAWAL_PENALTY}% penalty if you withdraw before deadline.
                      You will only receive 80% of your contribution back.
                    </p>
                  </div>
                  
                  {/* Other contract rules */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Contribution fee: ${CONTRIBUTION_FEE} USDC</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Auto-execution when target reached</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Refund available if pool expires</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Share rewards if pool succeeds</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Pool Stats with Real-time Data */}
          <Card className="bg-gray-800/50 border-gray-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Pool Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target:</span>
                <span className="font-medium text-white">
                  {completionState.targetAmount > 0n ? 
                    `$${(Number(completionState.targetAmount) / 1e6).toFixed(2)}` :
                    `$${poolData.targetPrice.toFixed(2)}`
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current:</span>
                <span className="font-medium text-white">
                  {completionState.currentAmount > 0n ? 
                    `$${(Number(completionState.currentAmount) / 1e6).toFixed(2)}` :
                    `$${poolData.currentAmount.toFixed(2)}`
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Remaining:</span>
                <span className="font-medium text-green-600">
                  {completionState.remainingAmount > 0n ? 
                    `$${(Number(completionState.remainingAmount) / 1e6).toFixed(2)}` :
                    `$${remainingNeeded.toFixed(2)}`
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Balance:</span>
                <span className="font-medium text-white">
                  {completionState.userUSDCBalance > 0n ? 
                    `$${(Number(completionState.userUSDCBalance) / 1e6).toFixed(2)}` :
                    `$${usdcBalance.toFixed(2)}`
                  }
                </span>
              </div>
              {completionState.isExpired && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Status:</span>
                  <span className="font-medium text-red-400">Expired</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          {contributionAmount > 0 && (
            <Card className="bg-gray-800/50 border-gray-700/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Transaction Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your contribution:</span>
                  <span className="text-white font-medium">${actualContribution.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform fee:</span>
                  <span className="text-white">${CONTRIBUTION_FEE.toFixed(2)}</span>
                </div>
                {actualContribution !== contributionAmount && (
                  <div className="flex justify-between text-xs text-yellow-400">
                    <span>Amount adjusted:</span>
                    <span>Pool only needs ${actualContribution.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-gray-600" />
                <div className="flex justify-between font-medium">
                  <span className="text-white">Total required:</span>
                  <span className="text-white">${(actualContribution + CONTRIBUTION_FEE).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Status Display */}
          {currentStep !== 'idle' && (
            <Card className="bg-gray-800/50 border-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {currentStep === 'approving' && (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <p className="text-blue-400 font-medium">Approving USDC...</p>
                        <p className="text-xs text-gray-400">Please confirm in your wallet</p>
                      </div>
                    </>
                  )}
                  {currentStep === 'approved' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">USDC Approved!</p>
                        <p className="text-xs text-gray-400">Now contributing to pool...</p>
                      </div>
                    </>
                  )}
                  {currentStep === 'contributing' && (
                    <>
                      <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <p className="text-emerald-400 font-medium">Contributing to Pool...</p>
                        <p className="text-xs text-gray-400">Waiting for blockchain confirmation</p>
                      </div>
                    </>
                  )}
                  {currentStep === 'completed' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">Contribution Successful!</p>
                        <p className="text-xs text-gray-400">You've joined the pool</p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Transaction hashes */}
                {approveTxHash && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400">
                      Approval: 
                      <a 
                        href={`https://sepolia.basescan.org/tx/${approveTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 ml-1 underline"
                      >
                        View on BaseScan ↗
                      </a>
                    </p>
                  </div>
                )}
                {contributeTxHash && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">
                      Contribution: 
                      <a 
                        href={`https://sepolia.basescan.org/tx/${contributeTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 ml-1 underline"
                      >
                        View on BaseScan ↗
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {(error || contributeError) && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-300 text-sm">{error || contributeError}</p>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-300 text-sm">Successfully joined pool!</p>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-600">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isContributing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleJoinPool}
            disabled={!canContribute || isContributing}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
          >
            {isContributing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {currentStep === 'approving' && 'Approving...'}
                {currentStep === 'approved' && 'Approved!'}
                {currentStep === 'contributing' && 'Contributing...'}
                {currentStep === 'completed' && 'Success!'}
                {currentStep === 'idle' && 'Processing...'}
              </div>
            ) : (
              `Join Pool ($${(actualContribution + CONTRIBUTION_FEE).toFixed(2)})`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}