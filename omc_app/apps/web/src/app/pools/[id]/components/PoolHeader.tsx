'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExternalLink, 
  User, 
  Calendar, 
  Target,
  TrendingUp,
  Trophy,
  Clock,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailedPoolInfo, getStatusColor, getStatusText, formatTimeRemaining } from '@/hooks/usePoolDetails';

interface PoolHeaderProps {
  poolDetails: DetailedPoolInfo;
}

export function PoolHeader({ poolDetails }: PoolHeaderProps) {
  const router = useRouter();

  const getProgressGradient = (percentage: number) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-400';
    if (percentage >= 75) return 'from-blue-500 to-emerald-400';
    if (percentage >= 50) return 'from-purple-500 to-blue-400';
    if (percentage >= 25) return 'from-orange-500 to-purple-400';
    return 'from-red-500 to-orange-400';
  };

  const getStatusIcon = (status: DetailedPoolInfo['status']) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />;
      case 'executed':
        return <Trophy className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getUrgencyLevel = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'expired';
    if (timeRemaining < 3600) return 'critical'; // < 1 hour
    if (timeRemaining < 86400) return 'urgent'; // < 24 hours
    if (timeRemaining < 259200) return 'moderate'; // < 3 days
    return 'normal';
  };

  const urgency = getUrgencyLevel(poolDetails.timeRemaining);

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-emerald-900/20 rounded-lg"></div>
      
      {/* Content */}
      <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-8">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {/* Pool ID & Category */}
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                Pool #{poolDetails.id}
              </Badge>
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                {poolDetails.opinionCategory}
              </Badge>
            </div>

            {/* Pool Name */}
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
              {poolDetails.name}
            </h1>

            {/* Proposed Answer */}
            <div className="flex items-start gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-400 mb-1">Proposed Answer:</div>
                <div className="text-xl text-white font-medium italic">
                  "{poolDetails.proposedAnswer}"
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-3">
            <Badge 
              className={`${getStatusColor(poolDetails.status)} text-white px-4 py-2 text-sm font-medium flex items-center gap-2`}
            >
              {getStatusIcon(poolDetails.status)}
              {getStatusText(poolDetails.status)}
            </Badge>

            {/* Urgency Indicator */}
            {poolDetails.status === 'active' && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                urgency === 'critical' ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                urgency === 'urgent' ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                urgency === 'moderate' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' :
                'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
              }`}>
                {urgency === 'critical' ? '⚡ ENDING SOON' :
                 urgency === 'urgent' ? '🔥 24H LEFT' :
                 urgency === 'moderate' ? '⏰ FEW DAYS' :
                 '✅ ACTIVE'}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Pool Completion</span>
            <span className="text-sm font-medium text-white">
              {poolDetails.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${getProgressGradient(poolDetails.progressPercentage)} h-4 rounded-full transition-all duration-1000 ease-out relative`}
              style={{ width: `${Math.min(poolDetails.progressPercentage, 100)}%` }}
            >
              {/* Shimmer effect for active pools */}
              {poolDetails.status === 'active' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>${parseFloat(poolDetails.currentAmount).toFixed(2)} raised</span>
            <span>Target: ${parseFloat(poolDetails.targetAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Middle Section - Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Progress */}
          <div className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400">Progress</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {poolDetails.progressPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {poolDetails.progressPercentage >= 100 ? 'Completed!' :
               poolDetails.progressPercentage >= 75 ? 'Almost there' :
               poolDetails.progressPercentage >= 50 ? 'Halfway' :
               'Getting started'}
            </div>
          </div>

          {/* Current Amount */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Raised</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${parseFloat(poolDetails.currentAmount).toFixed(2)}
            </div>
          </div>

          {/* Contributors */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Contributors</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {poolDetails.contributorCount}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">Time Left</span>
            </div>
            <div className={`text-2xl font-bold ${
              urgency === 'critical' ? 'text-red-400' :
              urgency === 'urgent' ? 'text-orange-400' :
              urgency === 'moderate' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {formatTimeRemaining(poolDetails.timeRemaining)}
            </div>
          </div>
        </div>

        {/* Bottom Section - Context & Creator */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          {/* Opinion Context */}
          <div className="flex items-center gap-4">
            <Button
              variant="link"
              onClick={() => router.push(`/?opinion=${poolDetails.opinionId}`)}
              className="text-emerald-400 hover:text-emerald-300 p-0 h-auto font-normal"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="text-sm">Related Opinion:</div>
                <div className="font-medium">{poolDetails.opinionQuestion}</div>
              </div>
            </Button>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-400">Created by</div>
              <div className="text-white font-medium font-mono text-sm">
                {poolDetails.creator.slice(0, 8)}...{poolDetails.creator.slice(-6)}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Additional Metadata (if available) */}
        {poolDetails.createdAt && (
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              Created {new Date(poolDetails.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}