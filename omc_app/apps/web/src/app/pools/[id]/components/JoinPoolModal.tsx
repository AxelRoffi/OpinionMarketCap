'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, DollarSign, Users, Clock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useContributeToPool } from '@/app/pools/hooks/useContributeToPool';
import { DetailedPoolInfo } from '@/hooks/usePoolDetails';

interface JoinPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolDetails: DetailedPoolInfo;
  onSuccess?: () => void;
}

export function JoinPoolModal({ isOpen, onClose, poolDetails, onSuccess }: JoinPoolModalProps) {
  const [contributionAmount, setContributionAmount] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success'>('amount');
  
  const { contributeToPool, isContributing, error } = useContributeToPool();

  // Reset modal state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setContributionAmount('');
      setAgreedToTerms(false);
      setStep('amount');
    }
  }, [isOpen]);

  const contributionAmountFloat = parseFloat(contributionAmount) || 0;
  const remainingAmount = parseFloat(poolDetails.remainingAmount);
  const contributionFee = 0; // Free to contribute to pools
  const totalCost = contributionAmountFloat + contributionFee;

  // Validation
  const isValidAmount = contributionAmountFloat > 0 && contributionAmountFloat <= remainingAmount;
  const canProceed = isValidAmount && agreedToTerms;

  // Quick amount buttons
  const quickAmounts = [
    { label: 'Min', value: Math.min(5, remainingAmount) },
    { label: '25%', value: remainingAmount * 0.25 },
    { label: '50%', value: remainingAmount * 0.5 },
    { label: 'Max', value: remainingAmount }
  ].filter(item => item.value > 0);

  const handleContribute = async () => {
    if (!canProceed) return;

    setStep('processing');
    try {
      await contributeToPool(poolDetails.id, contributionAmountFloat);
      setStep('success');
      
      // Auto-close and refresh after success
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setStep('confirm'); // Go back to confirmation
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // Prevent closing during transaction
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={step !== 'processing' ? handleClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-xl border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Join Pool</h2>
                <p className="text-sm text-gray-400">{poolDetails.name}</p>
              </div>
            </div>
            {step !== 'processing' && (
              <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          <div className="p-6">
            {/* Pool Summary */}
            <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                  {poolDetails.opinionCategory}
                </Badge>
                <span className="text-xs text-gray-400">Opinion #{poolDetails.opinionId}</span>
              </div>
              <p className="text-white font-medium mb-2">{poolDetails.opinionQuestion}</p>
              <p className="text-sm text-gray-300 italic">Targeting: "{poolDetails.proposedAnswer}"</p>
            </div>

            {/* Step Content */}
            {step === 'amount' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contribution Amount (USDC)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white text-lg"
                      min="0"
                      max={remainingAmount}
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Available: ${remainingAmount.toFixed(2)} USDC</span>
                    <span>+ ${contributionFee} fee</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((quick) => (
                    <Button
                      key={quick.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setContributionAmount(quick.value.toFixed(2))}
                      className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      {quick.label}
                    </Button>
                  ))}
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Progress</div>
                    <div className="text-white font-bold">{poolDetails.progressPercentage.toFixed(1)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Contributors</div>
                    <div className="text-white font-bold">{poolDetails.contributorCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Time Left</div>
                    <div className="text-white font-bold">
                      {poolDetails.timeRemaining > 86400 ? 
                        `${Math.floor(poolDetails.timeRemaining / 86400)}d` : 
                        `${Math.floor(poolDetails.timeRemaining / 3600)}h`}
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I understand this is a prediction pool, contributions are non-refundable except in case of pool expiration, 
                    and there's a 1 USDC contribution fee.
                  </label>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1 border-slate-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setStep('confirm')} 
                    disabled={!canProceed}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Confirm Contribution</h3>
                  <p className="text-gray-400 text-sm">Please review your contribution details</p>
                </div>

                {/* Contribution Summary */}
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contribution Amount:</span>
                    <span className="text-white font-bold">${contributionAmountFloat.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee:</span>
                    <span className="text-white">$1.00 USDC</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Total Cost:</span>
                      <span className="text-emerald-400 font-bold text-lg">${totalCost.toFixed(2)} USDC</span>
                    </div>
                  </div>
                </div>

                {/* Pool Impact */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <h4 className="text-emerald-400 font-medium mb-2">Your Impact:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Pool progress: {poolDetails.progressPercentage.toFixed(1)}% → {((parseFloat(poolDetails.currentAmount) + contributionAmountFloat) / parseFloat(poolDetails.targetAmount) * 100).toFixed(1)}%</li>
                    <li>• You'll become contributor #{poolDetails.contributorCount + 1}</li>
                    <li>• Remaining after: ${(remainingAmount - contributionAmountFloat).toFixed(2)} USDC</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('amount')} className="flex-1 border-slate-600 text-gray-300">
                    Back
                  </Button>
                  <Button 
                    onClick={handleContribute}
                    disabled={isContributing}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isContributing ? 'Contributing...' : `Contribute $${totalCost.toFixed(2)}`}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-white mb-2">Processing Contribution</h3>
                <p className="text-gray-400 text-sm mb-4">Please confirm the transaction in your wallet</p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-xs">Do not close this window while the transaction is processing</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Contribution Successful! 🎉</h3>
                <p className="text-gray-400 text-sm mb-6">
                  You've successfully contributed ${contributionAmountFloat.toFixed(2)} USDC to the pool
                </p>
                
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                  <p className="text-emerald-400 text-sm">
                    You are now contributor #{poolDetails.contributorCount + 1} in this pool!
                  </p>
                </div>

                <Button onClick={handleClose} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Close
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}