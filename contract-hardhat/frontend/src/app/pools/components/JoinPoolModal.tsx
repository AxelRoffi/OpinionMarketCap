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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContributeToPool } from '../hooks/useContributeToPool';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Hooks
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
  
  // Real PoolManager rules - USDC fees required
  const CONTRIBUTION_FEE = 1; // 1 USDC per contribution
  const EARLY_WITHDRAWAL_PENALTY = 20; // 20% penalty
  
  // Pool data with safe defaults
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

  // Calculations
  const contributionAmount = parseFloat(amount) || 0;
  const totalRequired = contributionAmount + CONTRIBUTION_FEE;
  const remainingNeeded = Math.max(0, poolData.targetPrice - poolData.currentAmount);
  const maxContribution = Math.min(remainingNeeded, Math.max(0, usdcBalance - CONTRIBUTION_FEE));
  
  // Validations
  const isAmountValid = contributionAmount > 0 && contributionAmount <= maxContribution;
  const hasEnoughBalance = totalRequired <= usdcBalance;
  const canContribute = isAmountValid && hasEnoughBalance && !balanceLoading && !isContributing;

  // Handle amount input
  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue > maxContribution) {
      setAmount(maxContribution.toString());
    } else {
      setAmount(value);
    }
    setError(null);
  };

  // Quick amount buttons (removed 5 USDC as requested)
  const quickAmounts = [10, 25, 50].filter(amt => amt <= maxContribution);

  // Handle join pool
  const handleJoinPool = async () => {
    try {
      setError(null);
      await contributeToPool(poolData.id, contributionAmount);
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
          {/* Pool Summary Section */}
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
                    <p className="font-medium text-white">${formatNumber(poolData.currentAmount)}</p>
                    <p className="text-gray-400">of ${formatNumber(poolData.targetPrice)}</p>
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
                    <p className="font-medium text-white">{poolData.progress.toFixed(1)}%</p>
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
              </div>

              {/* Pool Progress Visualization - Right after input */}
              {contributionAmount > 0 && (
                <div className="space-y-3 p-3 bg-gray-700/30 border border-gray-600/40 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Pool Progress After Your Contribution</span>
                    <span className="text-sm text-white">
                      {(((poolData.currentAmount + contributionAmount) / poolData.targetPrice) * 100).toFixed(1)}%
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
                          width: `${Math.min((contributionAmount / poolData.targetPrice) * 100, 100 - (poolData.currentAmount / poolData.targetPrice) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Current: ${poolData.currentAmount.toFixed(2)}</span>
                      <span className="text-emerald-400">+${contributionAmount.toFixed(2)} (You)</span>
                      <span>Target: ${poolData.targetPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Your Pool Share - Fixed calculation */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-medium">Your Pool Share:</span>
                    <span className="text-emerald-300 font-bold">
                      {((contributionAmount / poolData.targetPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Quick amounts */}
              {quickAmounts.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
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
                  <span className="text-white font-medium">${contributionAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform fee:</span>
                  <span className="text-white">${CONTRIBUTION_FEE.toFixed(2)}</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-medium">
                  <span className="text-white">Total required:</span>
                  <span className="text-white">${totalRequired.toFixed(2)}</span>
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
              `Join Pool ($${totalRequired.toFixed(2)})`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}