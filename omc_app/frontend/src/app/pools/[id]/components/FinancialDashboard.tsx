'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  PieChart, 
  Calculator, 
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { DetailedPoolInfo } from '@/hooks/usePoolDetails';

interface FinancialDashboardProps {
  poolDetails: DetailedPoolInfo;
  className?: string;
}

export function FinancialDashboard({ poolDetails, className = "" }: FinancialDashboardProps) {
  // Financial calculations
  const currentAmount = parseFloat(poolDetails.currentAmount);
  const targetAmount = parseFloat(poolDetails.targetAmount);
  const remainingAmount = parseFloat(poolDetails.remainingAmount);
  
  // Additional calculations
  const avgContributionPerUser = poolDetails.contributorCount > 0 
    ? currentAmount / poolDetails.contributorCount 
    : 0;
  
  const completionRate = poolDetails.progressPercentage;
  const estimatedTimeToCompletion = poolDetails.timeRemaining;
  
  // Performance metrics
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 70) return 'text-blue-400';
    if (percentage >= 50) return 'text-purple-400';
    if (percentage >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getChangeIcon = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.9) return <ArrowUp className="w-4 h-4 text-emerald-400" />;
    if (ratio >= 0.5) return <Minus className="w-4 h-4 text-blue-400" />;
    return <ArrowDown className="w-4 h-4 text-orange-400" />;
  };

  const financialMetrics = [
    {
      title: 'Current Pool Value',
      value: `$${currentAmount.toFixed(2)}`,
      subtitle: 'Total contributions',
      icon: DollarSign,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Target Amount',
      value: `$${targetAmount.toFixed(2)}`,
      subtitle: 'Funding goal',
      icon: Target,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Remaining Needed',
      value: `$${remainingAmount.toFixed(2)}`,
      subtitle: `${(100 - completionRate).toFixed(1)}% to go`,
      icon: Calculator,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      title: 'Average Contribution',
      value: `$${avgContributionPerUser.toFixed(2)}`,
      subtitle: `Per contributor`,
      icon: PieChart,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  return (
    <div className={className}>
      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {financialMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bgColor} ${metric.borderColor} border rounded-lg p-4 hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              {metric.title === 'Current Pool Value' && getChangeIcon(currentAmount, targetAmount)}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-sm text-gray-400">{metric.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Financial Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Progress Analysis */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Pool Completion</span>
                <span className={`text-sm font-medium ${getPerformanceColor(completionRate)}`}>
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${
                    completionRate >= 90 ? 'from-emerald-500 to-green-400' :
                    completionRate >= 70 ? 'from-blue-500 to-emerald-400' :
                    completionRate >= 50 ? 'from-purple-500 to-blue-400' :
                    completionRate >= 25 ? 'from-orange-500 to-purple-400' :
                    'from-red-500 to-orange-400'
                  } h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Contributors:</span>
                <span className="text-white font-medium">{poolDetails.contributorCount} users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pool Status:</span>
                <span className={`font-medium capitalize ${
                  poolDetails.status === 'active' ? 'text-emerald-400' :
                  poolDetails.status === 'executed' ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {poolDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Remaining:</span>
                <span className="text-white font-medium">
                  {poolDetails.timeRemaining > 86400 
                    ? `${Math.floor(poolDetails.timeRemaining / 86400)} days`
                    : poolDetails.timeRemaining > 3600 
                    ? `${Math.floor(poolDetails.timeRemaining / 3600)} hours`
                    : poolDetails.timeRemaining > 0
                    ? `${Math.floor(poolDetails.timeRemaining / 60)} minutes`
                    : 'Expired'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Financial Summary */}
          <div className="space-y-4">
            <div className="bg-slate-600/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Cost Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Per contribution fee:</span>
                  <span className="text-white">1.00 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total fees collected:</span>
                  <span className="text-white">{poolDetails.contributorCount}.00 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Net pool value:</span>
                  <span className="text-emerald-400 font-medium">{currentAmount.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-600/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Projections</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Contributors needed:</span>
                  <span className="text-white">
                    {avgContributionPerUser > 0 
                      ? Math.ceil(remainingAmount / avgContributionPerUser)
                      : 'N/A'} more
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success probability:</span>
                  <span className={`font-medium ${
                    completionRate >= 80 ? 'text-emerald-400' :
                    completionRate >= 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {completionRate >= 80 ? 'Very High' :
                     completionRate >= 50 ? 'Moderate' :
                     'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}