'use client';

import React from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ReferralBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  referralCode: string;
}

export function ReferralBanner({ isVisible, onDismiss, referralCode }: ReferralBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-20 left-4 right-4 z-50 max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm border border-purple-400/20 rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">Welcome! 🎉</h3>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <p className="text-purple-100 text-sm">
                You've been referred! Your <strong>first opinion creation is FREE</strong> with code <code className="bg-white/20 px-2 py-1 rounded text-xs font-mono">{referralCode}</code>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs px-3 py-1 h-8"
              onClick={() => {
                // Navigate to create page
                window.location.href = '/create';
              }}
            >
              Create Free Opinion
            </Button>
            <button
              onClick={onDismiss}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ReferralBanner;