'use client';

import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReferralsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Market
          </Button>
        </Link>
      </div>

      <div className="text-center py-16">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Referral System Coming Soon
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          We're working on an exciting referral system that will allow users to earn rewards for inviting friends to the platform.
        </p>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-white mb-4">What's Planned</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">📊</div>
              <p className="text-gray-300">Discount system for new users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">💰</div>
              <p className="text-gray-300">Cashback rewards for referrers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">🔗</div>
              <p className="text-gray-300">Easy sharing with referral links</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Explore Market
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}