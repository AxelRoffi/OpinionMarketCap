'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Target,
  Users,
  Timer,
  DollarSign,
  Sparkles,
  PartyPopper,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DemoPoolCardProps {
  onClose?: () => void;
}

// Mock pool data for demo
const DEMO_POOL = {
  id: 999,
  name: 'Demo: Will Bitcoin reach $200K?',
  question: 'Will Bitcoin reach $200,000 by end of 2026?',
  opinionId: 42,
  proposedAnswer: 'Yes, Bitcoin will hit $200K driven by institutional adoption',
  category: 'Crypto',
  targetPrice: 150,
  currentAmount: 127.50,
  contributorCount: 12,
  deadline: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
  progress: 85,
};

// Quick contribute percentages
const QUICK_PERCENTAGES = [25, 50, 75, 100];

export function DemoPoolCard({ onClose }: DemoPoolCardProps) {
  const [pool, setPool] = useState(DEMO_POOL);
  const [isContributing, setIsContributing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastContribution, setLastContribution] = useState<number | null>(null);

  // Calculate remaining and progress
  const remaining = pool.targetPrice - pool.currentAmount;
  const progress = (pool.currentAmount / pool.targetPrice) * 100;
  const isNearCompletion = progress >= 85;
  const isVeryClose = progress >= 95;

  // Format time left
  const formatTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = pool.deadline - now;
    if (timeLeft <= 0) return 'Expired';
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h ${minutes}m left`;
  };

  // Trigger celebration confetti
  const triggerCelebration = () => {
    setShowCelebration(true);

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Big burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899']
      });
    }, 500);
  };

  // Simulate contribution
  const handleContribute = async (amount: number) => {
    setIsContributing(true);
    setLastContribution(amount);

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newAmount = Math.min(pool.currentAmount + amount, pool.targetPrice);
    const newProgress = (newAmount / pool.targetPrice) * 100;

    setPool(prev => ({
      ...prev,
      currentAmount: newAmount,
      progress: newProgress,
      contributorCount: prev.contributorCount + 1
    }));

    setIsContributing(false);

    // Check if pool completed
    if (newAmount >= pool.targetPrice) {
      triggerCelebration();
    }
  };

  // Reset demo
  const resetDemo = () => {
    setPool(DEMO_POOL);
    setShowCelebration(false);
    setLastContribution(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-t-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            Demo Mode - Preview Pool UX Improvements
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDemo}
            className="text-purple-300 hover:text-white text-xs"
          >
            Reset Demo
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-300 hover:text-white text-xs"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-gray-800/80 border-gray-700/40 border-t-0 rounded-t-none">
        <CardContent className="p-6 space-y-6">
          {/* Pool Header */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 mb-2">
                  {pool.category}
                </Badge>
                <h3 className="text-lg font-bold text-white">{pool.question}</h3>
                <p className="text-sm text-gray-400 mt-1">Opinion #{pool.opinionId}</p>
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">{formatTimeLeft()}</span>
              </div>
            </div>
            <p className="text-white italic mt-2">"{pool.proposedAnswer}"</p>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className={`font-bold ${isVeryClose ? 'text-emerald-400' : isNearCompletion ? 'text-orange-400' : 'text-white'}`}>
                {progress.toFixed(1)}%
              </span>
            </div>

            <div className="relative">
              {/* Background */}
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                {/* Progress fill with animation */}
                <motion.div
                  className={`h-4 rounded-full relative ${
                    isVeryClose
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : isNearCompletion
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-400'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {/* Glow effect when near completion */}
                  {isNearCompletion && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: isVeryClose
                          ? ['0 0 10px #10b981, 0 0 20px #10b981', '0 0 20px #10b981, 0 0 40px #10b981', '0 0 10px #10b981, 0 0 20px #10b981']
                          : ['0 0 5px #f59e0b', '0 0 15px #f59e0b', '0 0 5px #f59e0b']
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Milestone markers */}
              <div className="absolute top-0 left-0 w-full h-4 flex items-center pointer-events-none">
                <div className="absolute left-1/2 w-0.5 h-full bg-gray-500/50" />
                <div className="absolute left-3/4 w-0.5 h-full bg-gray-500/50" />
              </div>
            </div>

            {/* Amount display */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                <DollarSign className="w-3 h-3 inline" />
                {pool.currentAmount.toFixed(2)} raised
              </span>
              <span className="text-emerald-400 font-medium">
                ${remaining.toFixed(2)} to go
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-700/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400">
                <Target className="w-4 h-4" />
                <span className="font-bold">${pool.targetPrice}</span>
              </div>
              <span className="text-xs text-gray-400">Target</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400">
                <Users className="w-4 h-4" />
                <span className="font-bold">{pool.contributorCount}</span>
              </div>
              <span className="text-xs text-gray-400">Contributors</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">{((pool.currentAmount / pool.targetPrice) * 100).toFixed(0)}%</span>
              </div>
              <span className="text-xs text-gray-400">Funded</span>
            </div>
          </div>

          {/* One-Click Contribute Buttons (Percentage-based) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Quick Contribute (% of remaining)</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {QUICK_PERCENTAGES.map((pct) => {
                const pctAmount = (remaining * pct) / 100;
                const wouldComplete = pct === 100 || pctAmount >= remaining;

                return (
                  <motion.button
                    key={pct}
                    onClick={() => handleContribute(Math.min(pctAmount, remaining))}
                    disabled={isContributing}
                    className={`
                      relative py-3 px-2 rounded-lg font-bold text-sm transition-all flex flex-col items-center
                      ${wouldComplete
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                      }
                      disabled:opacity-50
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{pct}%</span>
                    <span className="text-xs opacity-75">${pctAmount.toFixed(2)}</span>
                    {wouldComplete && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Complete Pool Button - Always visible as a prominent action */}
            {remaining > 0 && (
              <motion.button
                onClick={() => handleContribute(remaining)}
                disabled={isContributing}
                className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  <PartyPopper className="w-5 h-5" />
                  Complete Pool - 100% (${remaining.toFixed(2)})
                </span>
              </motion.button>
            )}
          </div>

          {/* Contributing State */}
          <AnimatePresence>
            {isContributing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-blue-400 font-medium">Contributing ${lastContribution}...</p>
                    <p className="text-xs text-gray-400">Simulating transaction</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Celebration Overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg z-10"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    <PartyPopper className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pool Completed!</h3>
                  <p className="text-emerald-400 mb-4">The answer will be promoted!</p>
                  <Button onClick={resetDemo} className="bg-emerald-600 hover:bg-emerald-700">
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
