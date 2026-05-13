'use client';

import { Target, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { EmptyPoolStateProps } from '../types/pool-types';

export function EmptyPoolState({ onCreateFirst, className = '' }: EmptyPoolStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-4 ${className}`}>
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative">
          <Target className="w-24 h-24 text-emerald-500" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-24 h-24 border-2 border-emerald-400 rounded-full"
          />
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          No pools yet - be the first! 🚀
        </h2>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          Collective pools allow users to fund opinion changes together. 
          Create the first pool and start the revolution!
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-3xl"
      >
        <div className="flex flex-col items-center p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-gray-700/40">
          <Users className="w-8 h-8 text-blue-400 mb-2" />
          <h3 className="font-semibold text-white mb-1">Collective Power</h3>
          <p className="text-sm text-gray-400 text-center">
            Pool funds with others to change expensive opinions
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-gray-700/40">
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
          <h3 className="font-semibold text-white mb-1">Smart Execution</h3>
          <p className="text-sm text-gray-400 text-center">
            Automatic execution when target price is reached
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-gray-700/40">
          <Target className="w-8 h-8 text-purple-400 mb-2" />
          <h3 className="font-semibold text-white mb-1">Fair Distribution</h3>
          <p className="text-sm text-gray-400 text-center">
            Rewards distributed based on contribution amounts
          </p>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        {/* Primary CTA */}
        <Button
          onClick={onCreateFirst}
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 group"
        >
          Create the First Pool
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Secondary CTA */}
        <Link href="/opinions">
          <Button
            variant="outline"
            size="lg"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3"
          >
            Browse Opinions
          </Button>
        </Link>
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center text-sm text-gray-400 max-w-2xl"
      >
        <p className="mb-2">
          <strong className="text-gray-300">How it works:</strong>
        </p>
        <p>
          Find an opinion you want to change → Click &quot;Create Pool&quot; → Set your proposed answer and deadline → 
          Others contribute → Pool automatically executes when target is reached! 
        </p>
      </motion.div>
    </div>
  );
}