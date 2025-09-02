'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConnectButtonProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export default function ConnectButton({ 
  size = 'default', 
  variant = 'default',
  className = '' 
}: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  // Open address in BaseScan
  const openInBaseScan = () => {
    if (address) {
      window.open(`https://sepolia.basescan.org/address/${address}`, '_blank');
    }
  };

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Try to find MetaMask first (most common)
      const metaMask = connectors.find(c => c.name.toLowerCase().includes('metamask') || c.name.toLowerCase().includes('injected'));
      const walletConnect = connectors.find(c => c.name.toLowerCase().includes('walletconnect'));
      const coinbase = connectors.find(c => c.name.toLowerCase().includes('coinbase'));
      
      // Prioritize MetaMask if available, then WalletConnect, then any other
      const preferredConnector = metaMask || walletConnect || coinbase || connectors[0];
      
      if (preferredConnector) {
        console.log('🔗 Connecting with:', preferredConnector.name);
        await connect({ connector: preferredConnector });
        toast.success(`Connected with ${preferredConnector.name}!`, {
          description: 'Your wallet will stay connected across page navigation',
          duration: 4000,
        });
      } else {
        toast.error('No wallet connectors available');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('rejected')) {
        toast.error('Connection rejected', {
          description: 'You declined the connection request',
        });
      } else if (errorMessage.includes('already connected')) {
        toast.info('Wallet already connected');
      } else {
        toast.error('Failed to connect wallet', {
          description: errorMessage,
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    toast.info('Wallet disconnected');
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        size={size}
        variant={variant}
        className={`${className} flex items-center gap-2`}
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={variant}
          className={`${className} flex items-center gap-2`}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
        <DropdownMenuItem
          onClick={copyAddress}
          className="flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={openInBaseScan}
          className="flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          View on BaseScan
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-600" />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="flex items-center gap-2 text-red-400 hover:bg-gray-700 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}