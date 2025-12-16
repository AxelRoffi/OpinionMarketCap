'use client';

import { useEnsName, useEnsAvatar } from 'wagmi';

interface ENSProfile {
  ensName: string | null;
  ensAvatar: string | null;
  displayName: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to resolve ENS name and avatar for an Ethereum address
 * Provides fallback display name if ENS is not available
 */
export function useENSProfile(address: string | undefined): ENSProfile {
  // Resolve ENS name from address
  const { 
    data: ensName, 
    isLoading: nameLoading, 
    error: nameError 
  } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1, // Mainnet for ENS
  });

  // Resolve ENS avatar from name
  const { 
    data: ensAvatar, 
    isLoading: avatarLoading, 
    error: avatarError 
  } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1, // Mainnet for ENS
  });

  // Create display name with fallback
  const displayName = ensName || (address ? formatAddress(address) : 'Unknown');

  const isLoading = nameLoading || avatarLoading;
  const error = nameError || avatarError;

  return {
    ensName: ensName || null,
    ensAvatar: ensAvatar || null,
    displayName,
    isLoading,
    error,
  };
}

/**
 * Format Ethereum address for display
 */
function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Hook for resolving multiple ENS profiles at once (batch)
 * Note: This creates individual hooks for each address
 * In production, consider using a more efficient batch resolver
 */
export function useENSProfiles(addresses: string[]): Record<string, ENSProfile> {
  // Note: This approach violates rules of hooks in loops
  // For now, we'll return empty object - implement proper batch resolution later
  console.warn('useENSProfiles: Batch ENS resolution not yet implemented');
  
  return {};
}