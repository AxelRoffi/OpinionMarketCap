'use client';

import React from 'react';
import { X, Gift, Sparkles } from 'lucide-react';

interface ReferralWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
}

export function ReferralWelcomeModal({ isOpen, onClose, referralCode }: ReferralWelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to OpinionMarketCap! 🎉</h2>
            <p className="text-purple-100">You've been referred by a friend</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-purple-900">Special Referral Offer</span>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-purple-800">
                Your <strong>first opinion creation</strong> is completely <strong>FREE</strong>!
              </p>
              <p className="text-xs text-purple-600 mt-1">
                ⚡ One-time referral bonus - create your first opinion at no cost
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Referral Code:</strong> <code className="bg-blue-100 px-2 py-1 rounded font-mono">{referralCode}</code>
              </p>
              <p className="text-xs text-blue-600">
                This code will be automatically applied when you create your first opinion.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">What happens next:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <p className="text-gray-700">Connect your wallet to get started</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <p className="text-gray-700">Create your first opinion for <strong>FREE</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <p className="text-gray-700">Both you and your referrer earn rewards!</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-6">
            <p className="text-xs text-amber-800">
              <strong>💡 Pro Tip:</strong> After creating your first opinion, you can generate your own referral code and earn free opinion creations by inviting friends!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Get Started - Create Free Opinion
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReferralWelcomeModal;