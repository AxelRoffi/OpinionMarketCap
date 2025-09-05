'use client';

import { motion } from 'framer-motion';
import { 
  Target, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Pool } from '../types/pool-types';

interface PoolCardProps {
  pool: Pool;
  onClick?: () => void;
}

export function PoolCard({ pool, onClick }: PoolCardProps) {
  const formatDeadline = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days left`;
    } else {
      return 'Expired';
    }
  };

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1000000).toFixed(2);
  };

  const getStatusColor = (status: Pool['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'executed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-lg text-white truncate">
                {pool.name}
              </CardTitle>
            </div>
            <Badge className={`text-xs capitalize ${getStatusColor(pool.status)}`}>
              {pool.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Proposed Answer */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Proposed Answer</p>
            <p className="text-white font-medium truncate">
              "{pool.proposedAnswer}"
            </p>
          </div>

          {/* Pool Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Pool Size</span>
            </div>
            <span className="text-lg font-bold text-blue-400">
              ${formatAmount(pool.totalAmount)} USDC
            </span>
          </div>

          {/* Progress Bar (placeholder for now) */}
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progress</span>
              <span>{pool.progressPercentage?.toFixed(1) || 0}%</span>
            </div>
            <Progress 
              value={pool.progressPercentage || 0} 
              className="h-2 bg-gray-700"
            />
          </div>

          {/* Pool Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">Contributors:</span>
              <span className="text-white font-medium">{pool.contributorCount}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-gray-400">Deadline:</span>
              <span className="text-white font-medium">
                {formatDeadline(pool.deadline)}
              </span>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Created by:</span>
            <span className="text-white font-mono text-xs truncate">
              {pool.creator.slice(0, 6)}...{pool.creator.slice(-4)}
            </span>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Target className="w-4 h-4 mr-2" />
            View Pool Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}