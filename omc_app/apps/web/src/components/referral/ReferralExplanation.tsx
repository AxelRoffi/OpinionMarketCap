'use client';

import React from 'react';
import { Users, Percent, DollarSign, Gift, Share, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReferralExplanationProps {
  showDetailed?: boolean;
}

export function ReferralExplanation({ showDetailed = true }: ReferralExplanationProps) {
  return (
    <div className="space-y-6">
      {/* How It Works - Step by Step */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500 rounded-full p-2">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">How OpinionMarketCap Referrals Work</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="text-center">
            <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create & Get Code</h4>
            <p className="text-sm text-gray-600">Create your first opinion and automatically get your unique referral code</p>
          </div>
          
          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Share & Earn</h4>
            <p className="text-sm text-gray-600">Share your code with friends. When they create opinions, you both benefit!</p>
          </div>
          
          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Withdraw Earnings</h4>
            <p className="text-sm text-gray-600">Withdraw your accumulated cashback anytime or use it for future opinions</p>
          </div>
        </div>
      </motion.div>

      {showDetailed && (
        <>
          {/* Benefits Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For New Users */}
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Percent className="w-5 h-5" />
                  For New Users (Using a Code)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">Discount</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    25% OFF
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">Valid For</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    First 3 Opinions
                  </Badge>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    <strong>Example:</strong> Instead of paying 5 USDC, you pay only 3.75 USDC per opinion!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* For Referrers */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <DollarSign className="w-5 h-5" />
                  For Referrers (Sharing Your Code)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">Cashback</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    12% Per Opinion
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">Earning Period</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    3 Opinions Each Friend
                  </Badge>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Example:</strong> Friend creates 3 opinions = You earn 1.8 USDC total cashback!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Economics Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500 rounded-full p-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real Example: What Everyone Gets</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-emerald-600 mb-2">3.75 USDC</div>
                <div className="text-sm text-gray-600 mb-1">New User Pays</div>
                <div className="text-xs text-emerald-600">Saves 1.25 USDC per opinion</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600 mb-2">0.60 USDC</div>
                <div className="text-sm text-gray-600 mb-1">Referrer Earns</div>
                <div className="text-xs text-blue-600">12% cashback per opinion</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-gray-600 mb-2">3.15 USDC</div>
                <div className="text-sm text-gray-600 mb-1">Platform Keeps</div>
                <div className="text-xs text-gray-600">Covers operational costs</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Win-Win-Win:</strong> New users save money, referrers earn cashback, platform stays sustainable
              </p>
            </div>
          </motion.div>

          {/* Important Notes */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <h4 className="font-semibold text-orange-800 mb-2">📋 Important Notes</h4>
            <ul className="text-sm text-orange-700 space-y-1 ml-4">
              <li>• No free mints - everyone pays something (ensures quality)</li>
              <li>• Discounts limited to 3 opinions per user (prevents abuse)</li>
              <li>• Cashback can be withdrawn anytime to your wallet</li>
              <li>• Referral codes are generated after your first paid opinion</li>
              <li>• Self-referrals and duplicate accounts don't work</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default ReferralExplanation;