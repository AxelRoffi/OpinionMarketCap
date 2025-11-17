'use client';

import React, { useState } from 'react';
import { DollarSign, Users, Gift, Share2, Copy, Wallet, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import useReferral from '@/hooks/useReferral';

export function ReferralDashboard() {
  const { address } = useAccount();
  const [copiedCode, setCopiedCode] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  
  const {
    getMyReferralCode,
    getPendingCashback,
    totalReferrals,
    discountedOpinionsUsed,
    getRemainingDiscounts,
    hasReferralSystemSupport
  } = useReferral();

  // Withdraw cashback contract interaction
  const { 
    writeContract: withdrawCashback,
    data: withdrawHash,
    isPending: isWithdrawPending
  } = useWriteContract();

  const { isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ 
    hash: withdrawHash 
  });

  const myReferralCode = getMyReferralCode();
  const pendingCashback = getPendingCashback();
  const pendingCashbackNum = parseFloat(pendingCashback);
  const remainingDiscounts = getRemainingDiscounts();

  // Generate referral URL
  const referralUrl = myReferralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://test.opinionmarketcap.xyz'}?ref=${myReferralCode}`
    : '';

  const handleCopyReferralCode = async () => {
    if (myReferralCode) {
      try {
        await navigator.clipboard.writeText(referralUrl);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error('Failed to copy referral URL:', err);
      }
    }
  };

  const handleWithdrawCashback = async () => {
    if (!address) return;
    
    try {
      const amountToWithdraw = withdrawAmount 
        ? Math.floor(parseFloat(withdrawAmount) * 1_000_000) // Convert to 6 decimal USDC
        : 0; // 0 means withdraw all
      
      await withdrawCashback({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'withdrawCashback',
        args: [BigInt(amountToWithdraw)]
      });
    } catch (error) {
      console.error('Failed to withdraw cashback:', error);
    }
  };

  const handleShareReferral = async () => {
    if (navigator.share && referralUrl) {
      try {
        await navigator.share({
          title: 'Join OpinionMarketCap with 25% Discount!',
          text: 'Get 25% off your first 3 opinions on OpinionMarketCap. Join the prediction market revolution!',
          url: referralUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
        // Fallback to copy
        handleCopyReferralCode();
      }
    } else {
      // Fallback to copy
      handleCopyReferralCode();
    }
  };

  if (!address) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Connect your wallet to view referral dashboard</p>
        </CardContent>
      </Card>
    );
  }

  // Show fallback if referral system is not supported by the current contract
  if (!hasReferralSystemSupport) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Referral System Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            The referral system with 25% discounts and cashback rewards is being deployed. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Cashback */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pending Cashback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-emerald-600">
              ${pendingCashback}
            </div>
            <div className="text-xs text-emerald-600 mt-1">
              USDC available to withdraw
            </div>
          </CardContent>
        </Card>

        {/* Total Referrals */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {totalReferrals}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Friends joined
            </div>
          </CardContent>
        </Card>

        {/* Discounts Used */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Discounts Used
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-600">
              {discountedOpinionsUsed}/3
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Discounted opinions
            </div>
          </CardContent>
        </Card>

        {/* Remaining Discounts */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Remaining Discounts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">
              {remainingDiscounts}
            </div>
            <div className="text-xs text-orange-600 mt-1">
              25% off available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Sharing */}
      {myReferralCode && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-lg">
                {myReferralCode}
              </div>
              <Button
                onClick={handleCopyReferralCode}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copiedCode ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Share this URL to give friends 25% discount:</strong>
              </p>
              <div className="p-2 bg-white rounded border text-xs font-mono break-all text-blue-600">
                {referralUrl}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleShareReferral}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <Button
                onClick={handleCopyReferralCode}
                size="sm"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cashback Withdrawal */}
      {pendingCashbackNum > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Withdraw Cashback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={pendingCashback}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Enter amount (max: $${pendingCashback})`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to withdraw all cashback
                </p>
              </div>
              <Button
                onClick={handleWithdrawCashback}
                disabled={isWithdrawPending || pendingCashbackNum === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isWithdrawPending ? 'Withdrawing...' : 'Withdraw'}
              </Button>
            </div>
            
            {isWithdrawSuccess && (
              <div className="p-3 bg-green-100 rounded-lg text-green-800 text-sm">
                ✅ Cashback withdrawn successfully!
              </div>
            )}

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Cashback is paid in USDC directly to your wallet. You can also use it to create more opinions!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Referral Code Yet */}
      {!myReferralCode && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create Your First Opinion to Get Started</h3>
            <p className="text-gray-600 mb-4">
              Once you create and pay for your first opinion, you'll automatically receive your unique referral code to start earning cashback!
            </p>
            <Button
              onClick={() => window.location.href = '/create'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Opinion Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ReferralDashboard;