'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Share2, Gift, Users, Copy, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CONTRACTS, REFERRAL_MANAGER_ABI } from '@/lib/contracts';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [copied, setCopied] = useState(false);

  // Read user's referral stats from contract
  const { data: statsData, refetch: refetchStats } = useReadContract({
    address: CONTRACTS.REFERRAL_MANAGER,
    abi: REFERRAL_MANAGER_ABI,
    functionName: 'getReferralStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Parse stats from contract data
  const stats = statsData ? {
    totalReferrals: Number(statsData[0]),
    availableFreeMints: Number(statsData[1]),
    totalFreeMints: Number(statsData[2]),
    referralCode: statsData[3] ? statsData[3].toString() : '0',
    isReferred: statsData[4],
    referredBy: statsData[5]
  } : {
    totalReferrals: 0,
    availableFreeMints: 0,
    totalFreeMints: 0,
    referralCode: '0',
    isReferred: false,
    referredBy: '0x0000000000000000000000000000000000000000'
  };

  const hasReferralCode = stats.referralCode !== '0';

  // Generate referral code function
  const generateReferralCode = async () => {
    if (!address) return;

    try {
      await writeContract({
        address: CONTRACTS.REFERRAL_MANAGER,
        abi: REFERRAL_MANAGER_ABI,
        functionName: 'generateReferralCode',
        args: [address]
      });
      
      // Refetch stats after generating code
      setTimeout(() => refetchStats(), 2000);
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
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
    const shareText = `🚀 Join OpinionMarketCap and create your first opinion for FREE! Use my referral: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join OpinionMarketCap - Free Opinion Creation!',
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
            Connect your wallet to start earning rewards by inviting friends
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-300">Share your referral link</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-300">Friends create their first opinion FREE</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-300">You earn free opinion credits</p>
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
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Referral Program
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-xl text-gray-300">
            Invite friends and earn free opinion creations together
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-500/20 rounded-xl p-6 text-center"
          >
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
            <div className="text-sm text-purple-300">Successful Referrals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-500/20 rounded-xl p-6 text-center"
          >
            <Gift className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{stats.availableFreeMints}</div>
            <div className="text-sm text-green-300">Free Mints Available</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-500/20 rounded-xl p-6 text-center"
          >
            <span className="text-2xl font-bold text-blue-400 block mb-3">🎁</span>
            <div className="text-2xl font-bold text-white">{stats.totalFreeMints}</div>
            <div className="text-sm text-blue-300">Total Free Mints Earned</div>
          </motion.div>
        </div>

        {/* Available Rewards Notice */}
        {stats.availableFreeMints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-300">
                  🎉 You have {stats.availableFreeMints} free opinion creation{stats.availableFreeMints > 1 ? 's' : ''} available!
                </h3>
                <p className="text-green-200">Your next opinion creation will be completely free.</p>
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
                    <code className="flex-1 bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg font-mono text-lg text-green-400 text-center tracking-wider">
                      {stats.referralCode}
                    </code>
                    <Button
                      onClick={copyReferralLink}
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Generate your referral code to start earning free opinion creations!
                </p>
                <Button
                  onClick={generateReferralCode}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                >
                  Generate My Referral Code
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
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
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Your Link</h3>
              <p className="text-gray-400">Send your referral link to friends via social media, messaging, or email</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Friend Gets Free Opinion</h3>
              <p className="text-gray-400">When they create their first opinion using your link, it's completely <strong className="text-green-400">FREE</strong></p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">You Earn Rewards</h3>
              <p className="text-gray-400">Get 1 free opinion creation for each successful referral (up to 4 total)</p>
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
            <li>• Each referred user gets their first opinion creation completely free</li>
            <li>• You earn 1 free mint per successful referral (maximum 4 accumulated)</li>
            <li>• Referral rewards are one-time per unique wallet address</li>
            <li>• Self-referrals and duplicate accounts are not permitted</li>
            <li>• Free mints can be used for creating any opinion on the platform</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}