'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, Pause, Play, Lock, Unlock } from 'lucide-react';
import { CURRENT_CONTRACTS } from '@/lib/environment';

// Simplified ABI for admin actions
const ADMIN_ABI = [
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "togglePublicCreation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "opinionId", "type": "uint256"}, {"internalType": "string", "name": "reason", "type": "string"}],
    "name": "moderateAnswer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Read functions for validation
  {
    "inputs": [{"internalType": "uint256", "name": "opinionId", "type": "uint256"}],
    "name": "getOpinionDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "uint96", "name": "lastPrice", "type": "uint96" },
          { "internalType": "uint96", "name": "nextPrice", "type": "uint96" },
          { "internalType": "uint96", "name": "totalVolume", "type": "uint96" },
          { "internalType": "uint96", "name": "salePrice", "type": "uint96" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "address", "name": "questionOwner", "type": "address" },
          { "internalType": "address", "name": "currentAnswerOwner", "type": "address" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "string", "name": "question", "type": "string" },
          { "internalType": "string", "name": "currentAnswer", "type": "string" },
          { "internalType": "string", "name": "currentAnswerDescription", "type": "string" },
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "link", "type": "string" },
          { "internalType": "string[]", "name": "categories", "type": "string[]" },
        ],
        "internalType": "struct OpinionStructs.Opinion",
        "name": "",
        "type": "tuple",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  }
] as const;

interface AdminActionsProps {
  contractStats: {
    isPaused: boolean;
    publicCreationEnabled: boolean;
  };
  onStatsUpdate: () => void;
}

export function AdminActions({ contractStats, onStatsUpdate }: AdminActionsProps) {
  const [moderationForm, setModerationForm] = useState({ opinionId: '', reason: '' });
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Write contract hook
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction state
  const executeTransaction = async (
    action: string,
    contractCall: () => void,
    successMessage: string
  ) => {
    try {
      setIsLoading(action);
      contractCall();
      
      // Show pending toast
      toast.loading(`${action} transaction pending...`, {
        id: action
      });
      
    } catch (error: any) {
      console.error(`${action} failed:`, error);
      toast.error(`${action} failed: ${error.shortMessage || error.message || 'Unknown error'}`, {
        id: action
      });
      setIsLoading(null);
    }
  };

  // Watch for transaction confirmation
  if (isConfirmed && isLoading) {
    toast.success(`${isLoading} completed successfully!`, {
      id: isLoading
    });
    setIsLoading(null);
    onStatsUpdate();
  }

  if (error && isLoading) {
    toast.error(`${isLoading} failed: ${error.shortMessage || error.message || 'Unknown error'}`, {
      id: isLoading
    });
    setIsLoading(null);
  }

  const handleTogglePause = () => {
    const action = contractStats.isPaused ? 'Unpause' : 'Pause';
    const functionName = contractStats.isPaused ? 'unpause' : 'pause';
    
    executeTransaction(
      action,
      () => writeContract({
        address: CURRENT_CONTRACTS.OPINION_CORE,
        abi: ADMIN_ABI,
        functionName: functionName,
      }),
      `Contract ${action.toLowerCase()}d successfully`
    );
  };

  const handleTogglePublicCreation = () => {
    const action = contractStats.publicCreationEnabled ? 'Disable' : 'Enable';
    
    executeTransaction(
      `${action} Public Creation`,
      () => writeContract({
        address: CURRENT_CONTRACTS.OPINION_CORE,
        abi: ADMIN_ABI,
        functionName: 'togglePublicCreation',
      }),
      `Public creation ${action.toLowerCase()}d successfully`
    );
  };

  // Check if an opinion can be moderated
  const { data: opinionData } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: ADMIN_ABI,
    functionName: 'getOpinionDetails',
    args: moderationForm.opinionId ? [BigInt(moderationForm.opinionId)] : undefined,
    query: {
      enabled: !!moderationForm.opinionId && /^\d+$/.test(moderationForm.opinionId)
    }
  });

  const canModerate = opinionData && 
    opinionData.isActive && 
    opinionData.creator !== opinionData.currentAnswerOwner;

  const handleModerateAnswer = () => {
    if (!moderationForm.opinionId || !moderationForm.reason) {
      toast.error('Please provide opinion ID and reason');
      return;
    }

    if (!canModerate) {
      toast.error('This opinion cannot be moderated. Either it\'s inactive or the creator still owns the current answer.');
      return;
    }

    executeTransaction(
      'Moderate Answer',
      () => writeContract({
        address: CURRENT_CONTRACTS.OPINION_CORE,
        abi: ADMIN_ABI,
        functionName: 'moderateAnswer',
        args: [BigInt(moderationForm.opinionId), moderationForm.reason],
      }),
      `Answer moderated successfully for opinion ${moderationForm.opinionId}`
    );
    
    // Clear form on success
    if (!isPending) {
      setModerationForm({ opinionId: '', reason: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleTogglePause}
              disabled={isPending || isConfirming || isLoading === 'Pause' || isLoading === 'Unpause'}
              className={`w-full ${contractStats.isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {contractStats.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {contractStats.isPaused ? 'Unpause Contract' : 'Pause Contract'}
            </Button>
            
            <Button 
              onClick={handleTogglePublicCreation}
              disabled={isPending || isConfirming || isLoading === 'Enable Public Creation' || isLoading === 'Disable Public Creation'}
              variant="outline"
              className="w-full"
            >
              {contractStats.publicCreationEnabled ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
              {contractStats.publicCreationEnabled ? 'Disable Public Creation' : 'Enable Public Creation'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Moderation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            Content Moderation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opinion ID to Moderate
              </label>
              <Input
                type="number"
                value={moderationForm.opinionId}
                onChange={(e) => setModerationForm({ ...moderationForm, opinionId: e.target.value })}
                placeholder="Enter opinion ID"
                className={`bg-gray-700 border-gray-600 text-white ${
                  moderationForm.opinionId && opinionData && !canModerate ? 'border-red-500' : ''
                }`}
                disabled={isPending || isConfirming}
              />
              {moderationForm.opinionId && opinionData && (
                <div className="mt-2 text-sm">
                  {canModerate ? (
                    <p className="text-green-400">✅ Opinion can be moderated</p>
                  ) : (
                    <div className="text-red-400">
                      <p>❌ Cannot moderate:</p>
                      <p className="text-xs">
                        {!opinionData.isActive ? '• Opinion is inactive' : ''}
                        {opinionData.creator === opinionData.currentAnswerOwner ? '• Creator still owns current answer' : ''}
                      </p>
                    </div>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    Question: {opinionData.question}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Current Answer: {opinionData.currentAnswer}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moderation Reason
              </label>
              <Input
                value={moderationForm.reason}
                onChange={(e) => setModerationForm({ ...moderationForm, reason: e.target.value })}
                placeholder="e.g., Inappropriate content"
                className="bg-gray-700 border-gray-600 text-white"
                disabled={isPending || isConfirming}
              />
            </div>
          </div>
          <Button 
            onClick={handleModerateAnswer}
            disabled={!moderationForm.opinionId || !moderationForm.reason || isPending || isConfirming || isLoading === 'Moderate Answer'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Ban className="w-4 h-4 mr-2" />
            {isLoading === 'Moderate Answer' ? 'Moderating...' : 'Moderate Answer'}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              {isPending && <span>Transaction pending...</span>}
              {isConfirming && <span>Waiting for confirmation...</span>}
            </div>
            {hash && (
              <p className="text-blue-300 text-xs mt-2 font-mono">
                Transaction: {hash}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}