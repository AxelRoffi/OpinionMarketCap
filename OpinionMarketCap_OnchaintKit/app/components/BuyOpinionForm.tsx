// components/BuyOpinionForm.tsx
"use client";

import { useState } from "react";
import { 
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract
} from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config";

// You need to update this with your actual USDC contract address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`; // Example - replace with actual
const USDC_ABI = [
  {
    type: "function",
    name: "allowance",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" }
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable"
  }
];

interface BuyOpinionFormProps {
  opinionId: number;
  currentPrice: bigint;
}

export default function BuyOpinionForm({ opinionId, currentPrice }: BuyOpinionFormProps) {
  const [newAnswer, setNewAnswer] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { address } = useAccount();

  // Check USDC allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS as `0x${string}`] : undefined,
  });

  // Approve USDC
  const { writeContractAsync: approveUsdc, isPending: isApprovePending } = useWriteContract();

  // Submit answer
  const { writeContractAsync: submitAnswer, isPending: isSubmitPending } = useWriteContract();

  // Determine if we have sufficient allowance
  const allowance = typeof allowanceData === 'bigint' ? allowanceData : BigInt(0);
  const hasEnoughAllowance = allowance >= currentPrice;

  const handleApprove = async () => {
    if (!address) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    setIsApproving(true);
    setErrorMessage("");

    try {
      const hash = await approveUsdc({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS as `0x${string}`, currentPrice],
      });

      // Add transaction tracking logic here if needed
      console.log("Approval transaction submitted:", hash);
      
      // Wait a bit and then refetch the allowance
      setTimeout(() => {
        refetchAllowance();
        setIsApproving(false);
      }, 5000);

    } catch (error) {
      console.error("Error approving USDC:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to approve USDC");
      setIsApproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setErrorMessage("Please connect your wallet first");
      return;
    }
    
    if (!newAnswer.trim()) {
      setErrorMessage("Please enter an answer");
      return;
    }

    if (!hasEnoughAllowance) {
      setErrorMessage("Please approve USDC first");
      return;
    }

    setErrorMessage("");

    try {
      const hash = await submitAnswer({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "submitAnswer",
        args: [BigInt(opinionId), newAnswer],
      });

      console.log("Answer submitted with transaction:", hash);
      
      // Reset the form after successful submission
      setNewAnswer("");
      
    } catch (error) {
      console.error("Error submitting answer:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit answer");
    }
  };

  // Determine loading state
  const isLoading = isApprovePending || isSubmitPending || isApproving;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="newAnswer" className="block text-sm font-medium text-gray-700 mb-1">
            Your Answer
          </label>
          <textarea
            id="newAnswer"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            maxLength={40}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Enter your answer (max 40 characters)"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {newAnswer.length}/40 characters
          </p>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-600">
            Price: <span className="font-medium">{formatUnits(currentPrice, 6)} USDC</span>
          </p>
          
          {address && (
            <p className="text-xs text-gray-500 mt-1">
              USDC Allowance: {formatUnits(allowance, 6)} USDC
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {!hasEnoughAllowance && address ? (
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isApprovePending || isApproving ? "Approving..." : "Approve USDC"}
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
            disabled={isLoading || !address || !newAnswer.trim() || !hasEnoughAllowance}
          >
            {isSubmitPending ? "Submitting..." : "Submit Answer"}
          </button>
        )}

        {!address && (
          <p className="text-sm text-center mt-2 text-gray-500">
            Please connect your wallet to submit an answer
          </p>
        )}
      </form>
    </div>
  );
}