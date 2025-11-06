'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ReferralState {
  referralCode: string | null;
  isValidCode: boolean;
  referrerAddress: string | null;
  hasProcessedReferral: boolean;
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
      // Validate referral code (should be 6+ digits)
      const isValid = /^\d{6,}$/.test(refParam);
      
      setReferralState(prev => ({
        ...prev,
        referralCode: refParam,
        isValidCode: isValid
      }));

      // Show welcome message for valid referral codes
      if (isValid && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(`referral_welcome_${refParam}`)) {
        setShowReferralWelcome(true);
        sessionStorage.setItem(`referral_welcome_${refParam}`, 'shown');
      }

      // TODO: Validate referral code with contract to get referrer address
      // This would require a contract call to getReferrerFromCode(refParam)
    }
  }, [searchParams]);

  const dismissReferralWelcome = () => {
    setShowReferralWelcome(false);
  };

  const getReferralCodeForCreation = (): number => {
    return referralState.isValidCode && referralState.referralCode 
      ? parseInt(referralState.referralCode) 
      : 0;
  };

  const hasValidReferral = (): boolean => {
    return referralState.isValidCode && referralState.referralCode !== null;
  };

  return {
    referralCode: referralState.referralCode,
    isValidCode: referralState.isValidCode,
    referrerAddress: referralState.referrerAddress,
    showReferralWelcome,
    dismissReferralWelcome,
    getReferralCodeForCreation,
    hasValidReferral
  };
}

// Hook for checking if user can create opinion for free
export function useFreeMints() {
  const { address } = useAccount();
  const [availableFreeMints, setAvailableFreeMints] = useState(0);
  const [loading, setLoading] = useState(true);

  // TODO: Add contract read for getAvailableFreeMints
  useEffect(() => {
    if (address) {
      // This would call the contract method
      // const freeMints = await readContract({
      //   address: CONTRACTS.REFERRAL_MANAGER,
      //   abi: REFERRAL_MANAGER_ABI,
      //   functionName: 'getAvailableFreeMints',
      //   args: [address]
      // });
      // setAvailableFreeMints(Number(freeMints));
      setLoading(false);
    }
  }, [address]);

  const canCreateForFree = availableFreeMints > 0;

  return {
    availableFreeMints,
    canCreateForFree,
    loading
  };
}

export default useReferral;