'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

// Target chain for the app
export const TARGET_CHAIN = baseSepolia;
export const TARGET_CHAIN_ID = baseSepolia.id; // 84532

export function useChainSwitch() {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();

  const isCorrectChain = chainId === TARGET_CHAIN_ID;

  const switchToTargetChain = () => {
    if (!isCorrectChain) {
      switchChain({ chainId: TARGET_CHAIN_ID });
    }
  };

  return {
    isCorrectChain,
    currentChainId: chainId,
    targetChainId: TARGET_CHAIN_ID,
    targetChainName: TARGET_CHAIN.name,
    switchToTargetChain,
    isSwitching: isPending,
    switchError: error,
  };
}
