'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Share2, Gift, Users, Copy, Check, Sparkles, ArrowLeft, Percent, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReferralExplanation } from '@/components/referral/ReferralExplanation';
import { ReferralDashboard } from '@/components/referral/ReferralDashboard';
import useReferral from '@/hooks/useReferral';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  // Use new referral hook
  const {
    getMyReferralCode,
    getPendingCashback,
    totalReferrals,
    discountedOpinionsUsed,
    getRemainingDiscounts,
    hasReferralSystemSupport
  } = useReferral();

  // Get referral data from hook
  const myReferralCode = getMyReferralCode();
  const pendingCashback = getPendingCashback();
  const remainingDiscounts = getRemainingDiscounts();
  const hasReferralCode = !!myReferralCode;

  // Parse stats for display (now using new discount system)
  const stats = {
    totalReferrals,
    availableDiscounts: remainingDiscounts,
    totalDiscountsUsed: discountedOpinionsUsed,
    referralCode: myReferralCode || '0',
    pendingCashback: parseFloat(pendingCashback)
  };

  const copyReferralLink = () => {
    if (!hasReferralCode) return;
    
    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!hasReferralCode) return;

    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    const shareText = `🚀 Join OpinionMarketCap and get 25% OFF your first 3 opinions! Use my referral: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join OpinionMarketCap - 25% Discount!',
          text: shareText,
          url: referralLink
        });
      } catch (error) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <Gift className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Referral Program
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Connect your wallet to start earning cashback by inviting friends
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-300">Share your referral link</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-300">Friends get 25% OFF their first 3 opinions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-300">You earn 12% cashback in USDC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if referral system is not supported
  if (isConnected && !hasReferralSystemSupport) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Referral System Coming Soon
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            We're working on deploying the new referral system with 25% discounts and cashback rewards.
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">What's Coming</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-emerald-400" />
                <p className="text-gray-300">25% discount for new users (first 3 opinions)</p>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <p className="text-gray-300">12% cashback in USDC for referrers</p>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <p className="text-gray-300">Easy sharing with referral codes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Referral Program
            </h1>
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xl text-gray-300">
            Invite friends for 25% discounts and earn 12% cashback in USDC
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-500/20 rounded-xl p-6 text-center"
          >
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
            <div className="text-sm text-blue-300">Successful Referrals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border border-emerald-500/20 rounded-xl p-6 text-center"
          >
            <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">${stats.pendingCashback.toFixed(2)}</div>
            <div className="text-sm text-emerald-300">Pending Cashback</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border border-orange-500/20 rounded-xl p-6 text-center"
          >
            <Percent className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{stats.availableDiscounts}</div>
            <div className="text-sm text-orange-300">Remaining Discounts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-500/20 rounded-xl p-6 text-center"
          >
            <Gift className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{stats.totalDiscountsUsed}/3</div>
            <div className="text-sm text-purple-300">Discounts Used</div>
          </motion.div>
        </div>

        {/* Available Rewards Notice */}
        {stats.pendingCashback > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border border-emerald-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-semibold text-emerald-300">
                  💰 You have ${stats.pendingCashback.toFixed(2)} USDC ready to withdraw!
                </h3>
                <p className="text-emerald-200">Your referral cashback earnings are available in your portfolio.</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {stats.availableDiscounts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-orange-900/50 to-yellow-900/50 border border-orange-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <Percent className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold text-orange-300">
                  🎯 You have {stats.availableDiscounts} discount{stats.availableDiscounts > 1 ? 's' : ''} remaining!
                </h3>
                <p className="text-orange-200">Get 25% off your next opinion creation{stats.availableDiscounts > 1 ? 's' : ''}.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Share Your Referral Link</h2>
          
          <div className="space-y-6">
            {hasReferralCode ? (
              <>
                {/* Referral Code Display */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Your Referral Code
                  </label>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg font-mono text-lg text-emerald-400 text-center tracking-wider">
                      {stats.referralCode}
                    </code>
                    <Button
                      onClick={copyReferralLink}
                      className="bg-emerald-600 hover:bg-emerald-700 px-6"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Create your first opinion to get your referral code and start earning cashback!
                </p>
                <Button
                  onClick={() => window.location.href = '/create'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg"
                >
                  Create Opinion & Get Code
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {hasReferralCode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 h-12"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={shareReferralLink}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 h-12"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Your Link</h3>
              <p className="text-gray-400">Send your referral link to friends via social media, messaging, or email</p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Friends Get 25% Discount</h3>
              <p className="text-gray-400">They save <strong className="text-emerald-400">25% OFF</strong> their first 3 opinions using your code</p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">You Earn Cashback</h3>
              <p className="text-gray-400">Receive <strong className="text-blue-400">12% cashback</strong> in USDC for each of their discounted opinions</p>
            </div>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Terms & Conditions</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Each referred user gets 25% discount on their first 3 opinions</li>
            <li>• You earn 12% cashback in USDC for each discounted opinion they create</li>
            <li>• Cashback can be withdrawn anytime to your wallet</li>
            <li>• Self-referrals and duplicate accounts are not permitted</li>
            <li>• Referral codes are generated after creating your first paid opinion</li>
            <li>• Maximum 3 discounted opinions per user ensures fair use</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}