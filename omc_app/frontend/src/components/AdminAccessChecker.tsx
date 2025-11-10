'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CURRENT_CONTRACTS } from '@/lib/environment';

const ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';
const MODERATOR_ROLE = '0x71f3d55856e4058ed06ee057d79ada615f65cdf5f9ee88181b914225088f834f';

const SIMPLE_ABI = [
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"}, 
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "hasRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function AdminAccessChecker() {
  const { address, isConnected } = useAccount();
  
  const { data: hasAdminRole } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: SIMPLE_ABI,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  const { data: hasModeratorRole } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: SIMPLE_ABI,
    functionName: 'hasRole',
    args: [MODERATOR_ROLE, address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  });

  if (!isConnected || !address) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Admin Access Debug</h3>
        <p className="text-red-400">Not connected to wallet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Admin Access Debug</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Address:</span>
          <span className="text-white font-mono">{address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Contract:</span>
          <span className="text-white font-mono">{CURRENT_CONTRACTS.OPINION_CORE}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Admin Role:</span>
          <span className={`font-semibold ${hasAdminRole ? 'text-green-400' : 'text-red-400'}`}>
            {hasAdminRole ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Moderator Role:</span>
          <span className={`font-semibold ${hasModeratorRole ? 'text-green-400' : 'text-red-400'}`}>
            {hasModeratorRole ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </div>
  );
}