'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, Zap, CheckCircle, Clock } from 'lucide-react';

interface PoolProgressBarProps {
  currentAmount: string;
  targetAmount: string;
  progressPercentage: number;
  status: 'active' | 'executed' | 'expired';
  timeRemaining: number;
  className?: string;
}

export function PoolProgressBar({ 
  currentAmount, 
  targetAmount, 
  progressPercentage, 
  status,
  timeRemaining,
  className = "" 
}: PoolProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // Show milestone celebrations
  useEffect(() => {
    if (progressPercentage >= 25 && progressPercentage < 26) {
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 2000);
    }
  }, [progressPercentage]);

  const getProgressGradient = (percentage: number) => {
    if (percentage >= 100) return 'from-emerald-400 via-emerald-500 to-green-500';
    if (percentage >= 90) return 'from-emerald-500 via-emerald-600 to-green-500';
    if (percentage >= 75) return 'from-blue-500 via-emerald-500 to-emerald-600';
    if (percentage >= 50) return 'from-purple-500 via-blue-500 to-emerald-500';
    if (percentage >= 25) return 'from-orange-500 via-purple-500 to-blue-500';
    return 'from-red-500 via-orange-500 to-purple-500';
  };

  const getProgressAnimation = () => {
    if (status !== 'active') return '';
    
    if (progressPercentage >= 95) {
      return 'animate-pulse'; // Critical - almost complete
    } else if (progressPercentage >= 75) {
      return 'animate-pulse'; // High momentum
    }
    return ''; // Normal state
  };

  const getMilestoneIcon = (percentage: number) => {
    if (percentage >= 100) return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (percentage >= 90) return <Zap className="w-5 h-5 text-emerald-400" />;
    if (percentage >= 75) return <TrendingUp className="w-5 h-5 text-blue-400" />;
    if (percentage >= 50) return <Target className="w-5 h-5 text-purple-400" />;
    if (percentage >= 25) return <Clock className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getMilestoneText = (percentage: number) => {
    if (percentage >= 100) return '🎉 Pool Complete!';
    if (percentage >= 90) return '⚡ Almost there!';
    if (percentage >= 75) return '🚀 Great progress!';
    if (percentage >= 50) return '🎯 Halfway mark!';
    if (percentage >= 25) return '📈 Building momentum!';
    return 'Just getting started';
  };

  const getUrgencyIndicator = () => {
    if (status !== 'active' || timeRemaining <= 0) return null;

    if (timeRemaining < 3600) { // < 1 hour
      return (
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -top-8 right-0 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 text-xs font-medium text-red-400"
        >
          🔥 URGENT
        </motion.div>
      );
    } else if (timeRemaining < 86400) { // < 24 hours
      return (
        <div className="absolute -top-8 right-0 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1 text-xs font-medium text-orange-400">
          ⏰ 24H LEFT
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Milestone Celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium z-10"
          >
            {getMilestoneText(progressPercentage)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgency Indicator */}
      {getUrgencyIndicator()}

      {/* Progress Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getMilestoneIcon(progressPercentage)}
          <span className="text-sm font-medium text-white">
            Pool Progress
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-white">
            {progressPercentage.toFixed(1)}%
          </span>
          <div className="text-xs text-gray-400">
            {progressPercentage >= 100 ? 'Complete' : 
             progressPercentage >= 75 ? 'Almost there' :
             progressPercentage >= 50 ? 'Halfway' :
             'In progress'}
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar Container */}
      <div className="relative">
        {/* Background Track */}
        <div className="w-full bg-slate-700/50 rounded-full h-6 overflow-hidden border border-slate-600/30">
          {/* Animated Progress Bar */}
          <motion.div
            className={`bg-gradient-to-r ${getProgressGradient(progressPercentage)} h-6 rounded-full relative ${getProgressAnimation()}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(animatedProgress, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Shimmer Effect for Active Pools */}
            {status === 'active' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            )}

            {/* Progress Texture */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10"></div>
            
            {/* Milestone Markers */}
            <div className="absolute inset-0 flex items-center">
              {[25, 50, 75, 90].map((milestone) => {
                const position = (milestone / 100) * 100;
                const isPassed = progressPercentage >= milestone;
                
                return (
                  <motion.div
                    key={milestone}
                    className={`absolute w-1 h-6 ${isPassed ? 'bg-white/40' : 'bg-white/20'}`}
                    style={{ left: `${position}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (milestone / 100) }}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Progress Labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>${parseFloat(currentAmount).toFixed(2)}</span>
          <span className="text-center">
            ${(parseFloat(targetAmount) * 0.5).toFixed(2)} halfway
          </span>
          <span className="text-center">
            ${(parseFloat(targetAmount) * 0.9).toFixed(2)} almost
          </span>
          <span>${parseFloat(targetAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
        <span>
          Raised: <span className="text-white font-medium">${parseFloat(currentAmount).toFixed(2)} USDC</span>
        </span>
        <span>
          Remaining: <span className="text-white font-medium">${(parseFloat(targetAmount) - parseFloat(currentAmount)).toFixed(2)} USDC</span>
        </span>
      </div>

      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}