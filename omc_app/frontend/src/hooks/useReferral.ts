'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

interface ReferralState {
  referralCode: string | null;
  isValidCode: boolean;
  referrerAddress: string | null;
  hasProcessedReferral: boolean;
}

interface ReferralData {
  referrer: string;
  discountedOpinionsUsed: number;
  hasReferralCode: boolean;
  referralCode: bigint;
  pendingCashback: bigint;
  totalReferrals: bigint;
}

export function useReferral() {
  // SSG-safe: Only use searchParams on client side
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const { address, isConnected } = useAccount();
  const [referralState, setReferralState] = useState<ReferralState>({
    referralCode: null,
    isValidCode: false,
    referrerAddress: null,
    hasProcessedReferral: false
  });
  const [showReferralWelcome, setShowReferralWelcome] = useState(false);

  // Get user's referral data from contract (with error handling)
  const { data: userReferralData, error: referralDataError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getReferralData',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      retry: false,
      refetchOnWindowFocus: false
    }
  }) as { data: ReferralData | undefined; error: any };

  // Validate referral code against contract (with error handling)
  const { data: referrerForCode, error: referrerCodeError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getUserFromReferralCode',
    args: referralState.referralCode ? [BigInt(referralState.referralCode)] : undefined,
    query: { 
      enabled: !!referralState.referralCode && referralState.isValidCode,
      retry: false,
      refetchOnWindowFocus: false
    }
  }) as { data: string | undefined; error: any };

  // Get referral eligibility (with error handling)
  const { data: eligibilityData, error: eligibilityError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getReferralEligibility',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      retry: false,
      refetchOnWindowFocus: false
    }
  }) as { data: [boolean, number] | undefined; error: any };

  // Initialize search params on client side only (SSG-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    
    const refParam = searchParams.get('ref');
    
    if (refParam) {
      // Validate referral code format (should be 6+ digits)
      const isValid = /^\d{6,}$/.test(refParam);
      
      setReferralState(prev => ({
        ...prev,
        referralCode: refParam,
        isValidCode: isValid,
        referrerAddress: referrerForCode || null
      }));

      // Show welcome message for valid referral codes that exist in contract
      if (isValid && referrerForCode && referrerForCode !== '0x0000000000000000000000000000000000000000') {
        if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(`referral_welcome_${refParam}`)) {
          setShowReferralWelcome(true);
          sessionStorage.setItem(`referral_welcome_${refParam}`, 'shown');
        }
      }
    }
  }, [searchParams, referrerForCode]);

  const dismissReferralWelcome = () => {
    setShowReferralWelcome(false);
  };

  const getReferralCodeForCreation = (): number => {
    return referralState.isValidCode && referralState.referralCode 
      ? parseInt(referralState.referralCode) 
      : 0;
  };

  const hasValidReferral = (): boolean => {
    return referralState.isValidCode && 
           referralState.referralCode !== null &&
           referrerForCode !== undefined &&
           referrerForCode !== '0x0000000000000000000000000000000000000000';
  };

  // Get user's own referral code for sharing (with error handling)
  const getMyReferralCode = (): string | null => {
    if (referralDataError) {
      console.warn('Referral data not available - contract may not support referral system');
      return null;
    }
    if (userReferralData?.hasReferralCode) {
      return userReferralData.referralCode.toString();
    }
    return null;
  };

  // Check if user is eligible for discounts (with error handling)
  const isEligibleForDiscount = (): boolean => {
    if (eligibilityError) {
      console.warn('Eligibility data not available - contract may not support referral system');
      return false;
    }
    return eligibilityData ? eligibilityData[0] : false;
  };

  const getRemainingDiscounts = (): number => {
    if (eligibilityError) {
      return 0;
    }
    return eligibilityData ? eligibilityData[1] : 0;
  };

  // Format pending cashback (with error handling)
  const getPendingCashback = (): string => {
    if (referralDataError || !userReferralData?.pendingCashback) return '0.00';
    const cashbackUSDC = Number(userReferralData.pendingCashback) / 1_000_000;
    return cashbackUSDC.toFixed(2);
  };

  return {
    referralCode: referralState.referralCode,
    isValidCode: referralState.isValidCode && hasValidReferral(),
    referrerAddress: referralState.referrerAddress,
    showReferralWelcome,
    dismissReferralWelcome,
    getReferralCodeForCreation,
    hasValidReferral,
    getMyReferralCode,
    isEligibleForDiscount,
    getRemainingDiscounts,
    getPendingCashback,
    userReferralData,
    totalReferrals: (!referralDataError && userReferralData) ? Number(userReferralData.totalReferrals) : 0,
    discountedOpinionsUsed: (!referralDataError && userReferralData?.discountedOpinionsUsed) || 0,
    hasReferralSystemSupport: !referralDataError
  };
}

// Updated hook for referral discounts instead of free mints
export function useReferralDiscounts() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);

  // Get referral eligibility
  const { data: eligibilityData } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getReferralEligibility',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  }) as { data: [boolean, number] | undefined };

  useEffect(() => {
    if (eligibilityData !== undefined) {
      setLoading(false);
    }
  }, [eligibilityData]);

  const canGetDiscount = eligibilityData ? eligibilityData[0] : false;
  const remainingDiscounts = eligibilityData ? eligibilityData[1] : 0;

  return {
    remainingDiscounts,
    canGetDiscount,
    loading
  };
}

export default useReferral;