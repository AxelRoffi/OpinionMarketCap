'use client';

import { ConnectWallet } from "@thirdweb-dev/react";
import { useState } from 'react';
import OpinionTable from "./components/OpinionTable";
import CreateOpinionMarketModal from "./components/CreateOpinionMarketModal";

type Opinion = {
  id: number;
  question: string;
  answer: string;
  price: string;
  owner: string;
  priceChange: number;
  volume: string;
  lastPrice: string;
};

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opinions, setOpinions] = useState<Opinion[]>([]);

  const handleAddOpinion = (opinionText: string) => {
    const newOpinion: Opinion = {
      id: opinions.length + 1,
      question: opinionText,
      answer: "No answer yet",
      price: "0.1 ETH",
      lastPrice: "0.1 ETH",
      priceChange: 0,
      volume: "0 ETH",
      owner: "0x0000...0000"
    };
    setOpinions(prev => [...prev, newOpinion]);
    console.log('New opinion added:', newOpinion);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container">
        <header className="py-6 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            OpinionMarketCap
          </h1>
          <ConnectWallet
            modalTitle="Connect your wallet"
            className="!font-medium"
          />
        </header>

        <main className="py-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              The Web3 Opinion DEX!
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Create Opinion Market
            </button>
          </div>

          <OpinionTable />

          <CreateOpinionMarketModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddOpinion}
          />
        </main>
      </div>
    </div>
  );
}