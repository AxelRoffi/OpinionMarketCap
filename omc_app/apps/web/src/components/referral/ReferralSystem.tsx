'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { Share2, Gift, Users, Copy, Check } from 'lucide-react';
import { CONTRACTS, REFERRAL_MANAGER_ABI } from '@/lib/contracts';

interface ReferralStats {
  totalReferrals: number;
  availableFreeMints: number;
  totalFreeMints: number;
  referralCode: string;
  isReferred: boolean;
  referredBy: string;
}

export function ReferralSystem() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  // Read user's referral stats
  const { data: statsData } = useReadContract({
    address: CONTRACTS.REFERRAL_MANAGER as `0x${string}`,
    abi: REFERRAL_MANAGER_ABI,
    functionName: 'getReferralStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  useEffect(() => {
    if (statsData) {
      setReferralStats({
        totalReferrals: Number(statsData[0]),
        availableFreeMints: Number(statsData[1]),
        totalFreeMints: Number(statsData[2]),
        referralCode: statsData[3].toString(),
        isReferred: statsData[4],
        referredBy: statsData[5]
      });
    }
  }, [statsData]);

  const generateReferralCode = async () => {
    if (!address) return;

    try {
      await writeContract({
        address: CONTRACTS.REFERRAL_MANAGER as `0x${string}`,
        abi: REFERRAL_MANAGER_ABI,
        functionName: 'generateReferralCode',
        args: [address]
      });
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const copyReferralLink = () => {
    if (!referralStats?.referralCode || referralStats.referralCode === '0') return;

    const referralLink = `${window.location.origin}?ref=${referralStats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!referralStats?.referralCode || referralStats.referralCode === '0') return;

    const referralLink = `${window.location.origin}?ref=${referralStats.referralCode}`;
    const shareText = `🎁 Join OpinionMarketCap and get a FREE opinion creation! Use my referral link: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join OpinionMarketCap - Get FREE Opinion Creation!',
          text: shareText,
          url: referralLink
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <div className="text-center">
          <Gift className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Referral System
          </h3>
          <p className="text-gray-600 mb-4">
            Connect your wallet to access the referral system and earn free opinion creations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats Dashboard */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Your Referral Stats
          </h3>
          {referralStats?.isReferred && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Referred User ✨
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">
              {referralStats?.availableFreeMints || 0}
            </div>
            <div className="text-sm text-gray-600">Free Mints Available</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-green-600">
              {referralStats?.totalReferrals || 0}
            </div>
            <div className="text-sm text-gray-600">Successful Referrals</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-blue-600">
              {referralStats?.totalFreeMints || 0}
            </div>
            <div className="text-sm text-gray-600">Total Free Mints Earned</div>
          </div>
        </div>

        {/* Free Mints Available Notice */}
        {referralStats && referralStats.availableFreeMints > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-800">
                You have {referralStats.availableFreeMints} free opinion creation{referralStats.availableFreeMints > 1 ? 's' : ''} available!
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your next opinion creation will be completely free.
            </p>
          </div>
        )}
      </div>

      {/* Referral Code Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-500" />
          Share & Earn
        </h3>

        {!referralStats?.referralCode || referralStats.referralCode === '0' ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Generate your referral code to start earning free opinion creations!
            </p>
            <button
              onClick={generateReferralCode}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate My Referral Code
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Referral Code
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 border rounded font-mono text-lg">
                  {referralStats.referralCode}
                </code>
                <button
                  onClick={copyReferralLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                  title="Copy referral link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyReferralLink}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button
                onClick={shareReferralLink}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Link
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share your referral link with friends</li>
                <li>• Their <strong>first opinion creation is FREE</strong> (one-time)</li>
                <li>• You earn 1 free mint per successful referral</li>
                <li>• Accumulate up to 4 free mints from referrals</li>
                <li>• No limits on how many people you can refer</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Referred By Section */}
      {referralStats?.isReferred && (
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Welcome, Referred User! 🎉
          </h3>
          <p className="text-green-800">
            You were referred by: <code className="bg-green-100 px-2 py-1 rounded font-mono">
              {referralStats.referredBy.slice(0, 6)}...{referralStats.referredBy.slice(-4)}
            </code>
          </p>
          <p className="text-sm text-green-700 mt-2">
            Your first opinion creation was free, and you can earn more free mints by referring others!
          </p>
        </div>
      )}
    </div>
  );
}

export default ReferralSystem;