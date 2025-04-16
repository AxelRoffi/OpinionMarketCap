// components/ui/ConnectWalletButton.tsx
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useWalletState } from '@coinbase/onchainkit/wallet';

export default function ConnectWalletButton() {
  const { isConnected, address } = useWalletState();
  
  return (
    <div className="flex flex-col items-center">
      <ConnectWallet />
      {isConnected && (
        <p className="mt-2 text-sm text-gray-600">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      )}
    </div>
  );
}