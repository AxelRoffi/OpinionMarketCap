'use client';

import React from 'react';
import { useENSProfile } from '@/hooks/useENSProfile';

/**
 * Simple ENS name display component with fallback
 */
export function ENSName({ address, className = "" }: { address: string; className?: string }) {
  const { displayName, isLoading } = useENSProfile(address);
  
  if (isLoading) {
    return <span className={`animate-pulse ${className}`}>Loading...</span>;
  }
  
  return <span className={className}>{displayName}</span>;
}

/**
 * ENS Avatar component with fallback
 */
export function ENSAvatar({ 
  address, 
  size = 40, 
  className = "" 
}: { 
  address: string; 
  size?: number; 
  className?: string;
}) {
  const { ensAvatar, displayName, isLoading } = useENSProfile(address);

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-gray-700 rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (ensAvatar) {
    return (
      <img
        src={ensAvatar}
        alt={displayName}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }

  // Fallback gradient avatar
  return (
    <div
      className={`rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-medium" style={{ fontSize: size * 0.4 }}>
        {displayName.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}