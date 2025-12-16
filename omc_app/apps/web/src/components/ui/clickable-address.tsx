'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ClickableAddressProps {
  address: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function ClickableAddress({ 
  address, 
  className, 
  children, 
  onClick 
}: ClickableAddressProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
    
    // Navigate to profile page with the address
    router.push(`/profile/${address}`);
  };

  return (
    <span
      onClick={handleClick}
      className={cn(
        "cursor-pointer hover:text-emerald-400 hover:underline transition-colors duration-200",
        className
      )}
      title={`View profile for ${address}`}
    >
      {children || address}
    </span>
  );
}

// Helper function to format address for display
export function formatClickableAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}