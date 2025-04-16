// app/page.tsx
'use client';

import React, { useState } from 'react';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import OpinionTable from './components/OpinionTable';
import CreateOpinionModal from './components/CreateOpinionModal';

export default function Home() {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">OpinionMarketCap</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Buy the right to answer questions in a decentralized opinion marketplace.
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Create Opinion
          </button>
        </div>
        
        <OpinionTable />
      </div>
      
      {/* Modal for creating opinions */}
      <CreateOpinionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(txHash) => {
          console.log('Opinion created:', txHash);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}