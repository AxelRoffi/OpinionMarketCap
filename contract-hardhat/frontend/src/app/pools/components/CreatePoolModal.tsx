'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Target, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Info,
  FileText,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CreatePoolForm, CreatePoolValidation } from '../types/pool-types';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  opinionId: number;
  opinionData: {
    id: number;
    question: string;
    currentAnswer: string;
    nextPrice: bigint;
    category: string;
  };
}

type Step = 'form' | 'approve' | 'submit' | 'success' | 'error';

interface ErrorState {
  type: 'network' | 'contract' | 'wallet' | 'validation' | 'unknown';
  message: string;
  retryable: boolean;
  details?: string;
}

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;
const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612' as `0x${string}`;

// Simplified ABI for USDC approve
const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'account', type: 'address' }
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// PoolManager ABI - createPool function
const POOL_MANAGER_ABI = [
  {
    inputs: [
      { name: 'opinionId', type: 'uint256' },
      { name: 'proposedAnswer', type: 'string' },
      { name: 'deadline', type: 'uint256' },
      { name: 'initialContribution', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'ipfsHash', type: 'string' }
    ],
    name: 'createPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export function CreatePoolModal({ 
  isOpen, 
  onClose, 
  opinionId, 
  opinionData 
}: CreatePoolModalProps) {
  const { address } = useAccount();
  
  // Form state
  const [formData, setFormData] = useState<CreatePoolForm>({
    proposedAnswer: '',
    poolName: '',
    initialContribution: 1.0, // 1 USDC minimum (contract requirement)
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (meets minimum)
    description: '',
    externalLink: ''
  });

  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CreatePoolValidation>>({});
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  // Smart contract reads
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: usdcAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, POOL_MANAGER_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  // Smart contract writes
  const { writeContract: approveUSDC, data: approveHash } = useWriteContract();
  const { writeContract: createPool, data: createHash } = useWriteContract();

  // Transaction receipts
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });
  const { isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ 
    hash: createHash 
  });

  // Convert form amount to wei (USDC has 6 decimals)
  const requiredAmount = BigInt(Math.floor(formData.initialContribution * 1000000));
  const userBalance = Number(usdcBalance || BigInt(0)) / 1000000;
  const allowanceAmount = Number(usdcAllowance || BigInt(0)) / 1000000;
  
  // Pool creation fees - correct breakdown
  const POOL_CREATION_FEE = 5; // 5 USDC goes to Treasury (anti-spam)
  const totalCost = formData.initialContribution + POOL_CREATION_FEE; // Total user pays

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('form');
      setIsSubmitting(false);
      setErrors({});
      setErrorState(null);
    }
  }, [isOpen]);

  // Handle transaction success
  useEffect(() => {
    if (isApproveSuccess && currentStep === 'approve') {
      handleCreatePool();
    }
  }, [isApproveSuccess, currentStep]);

  useEffect(() => {
    if (isCreateSuccess && currentStep === 'submit') {
      setCurrentStep('success');
      setIsSubmitting(false);
    }
  }, [isCreateSuccess, currentStep]);

  // Helper function for URL validation
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<CreatePoolValidation> = {};

    // Proposed answer validation
    if (!formData.proposedAnswer.trim()) {
      newErrors.proposedAnswer = {
        isValid: false,
        error: 'Proposed answer is required'
      };
    } else if (formData.proposedAnswer.length > 40) {
      newErrors.proposedAnswer = {
        isValid: false,
        error: 'Proposed answer must be 40 characters or less'
      };
    } else if (formData.proposedAnswer.trim() === opinionData.currentAnswer) {
      newErrors.proposedAnswer = {
        isValid: false,
        error: 'Proposed answer must be different from current answer'
      };
    }

    // Pool name validation
    if (!formData.poolName.trim()) {
      newErrors.poolName = {
        isValid: false,
        error: 'Pool name is required'
      };
    } else if (formData.poolName.length > 30) {
      newErrors.poolName = {
        isValid: false,
        error: 'Pool name must be 30 characters or less'
      };
    }

    // Pool creation validation - your original anti-spam design  
    const totalRequired = formData.initialContribution + POOL_CREATION_FEE;
    
    if (formData.initialContribution < 1) {
      newErrors.initialContribution = {
        isValid: false,
        error: 'Minimum contribution is 1 USDC (hardcoded in contract)'
      };
    } else if (totalRequired > userBalance) {
      newErrors.initialContribution = {
        isValid: false,
        error: `Insufficient balance. Need ${totalRequired.toFixed(2)} USDC (${formData.initialContribution} pool contribution + ${POOL_CREATION_FEE} creation fee), you have ${userBalance.toFixed(2)} USDC`
      };
    }

    // Deadline validation
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (formData.deadline < oneDayLater) {
      newErrors.deadline = {
        isValid: false,
        error: 'Deadline must be at least 1 day from now'
      };
    } else if (formData.deadline > thirtyDaysLater) {
      newErrors.deadline = {
        isValid: false,
        error: 'Deadline cannot be more than 30 days from now'
      };
    }

    // Description validation (optional)
    if (formData.description && formData.description.trim().length > 300) {
      newErrors.description = {
        isValid: false,
        error: 'Description must be 300 characters or less'
      };
    }

    // External link validation (optional)
    if (formData.externalLink && formData.externalLink.trim() && !isValidUrl(formData.externalLink.trim())) {
      newErrors.externalLink = {
        isValid: false,
        error: 'Please enter a valid URL (e.g., https://example.com)'
      };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update form field
  const updateFormField = <K extends keyof CreatePoolForm>(
    field: K, 
    value: CreatePoolForm[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Error handler
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`${context}:`, error);
    
    let errorState: ErrorState;
    const errorMessage = (error as Error)?.message || 'Unknown error occurred';

    if (errorMessage.includes('User rejected')) {
      errorState = {
        type: 'wallet',
        message: 'Transaction rejected',
        retryable: true,
        details: 'Please approve the transaction in your wallet to continue.'
      };
    } else if (errorMessage.includes('insufficient funds')) {
      errorState = {
        type: 'wallet',
        message: 'Insufficient funds',
        retryable: false,
        details: 'You need more USDC to create this pool.'
      };
    } else if (errorMessage.includes('network')) {
      errorState = {
        type: 'network',
        message: 'Network error',
        retryable: true,
        details: 'Please check your internet connection and try again.'
      };
    } else {
      errorState = {
        type: 'unknown',
        message: 'Transaction failed',
        retryable: true,
        details: errorMessage
      };
    }

    setErrorState(errorState);
    setCurrentStep('error');
    setIsSubmitting(false);
  }, []);

  // Handle USDC approval
  const handleApprove = async () => {
    try {
      setCurrentStep('approve');
      await approveUSDC({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [POOL_MANAGER_ADDRESS, BigInt(Math.floor(totalCost * 1000000 * 2))] // Approve 2x for future pools
      });
    } catch (error) {
      handleError(error, 'USDC approval');
    }
  };

  // Handle pool creation
  const handleCreatePool = async () => {
    try {
      setCurrentStep('submit');
      
      // Convert deadline to Unix timestamp
      const deadlineTimestamp = BigInt(Math.floor(formData.deadline.getTime() / 1000));
      
      // TODO: Implement actual pool creation with proper PoolManager ABI
      // This is a placeholder implementation - will be replaced with real smart contract call
      const poolCreationParams = {
        opinionId: BigInt(opinionId),
        proposedAnswer: formData.proposedAnswer,
        deadline: deadlineTimestamp,
        initialContribution: requiredAmount,
        name: formData.poolName,
        ipfsHash: '' // No IPFS for Phase 1
      };
      
      console.log('Pool creation params:', poolCreationParams);
      
      await createPool({
        address: POOL_MANAGER_ADDRESS,
        abi: POOL_MANAGER_ABI,
        functionName: 'createPool',
        args: [
          poolCreationParams.opinionId,
          poolCreationParams.proposedAnswer,
          poolCreationParams.deadline,
          poolCreationParams.initialContribution,
          poolCreationParams.name,
          poolCreationParams.ipfsHash
        ]
      });
      
      // Transaction will be handled by useWaitForTransactionReceipt
      console.log('Pool creation transaction submitted');
      setCurrentStep('submit');

    } catch (error) {
      handleError(error, 'Pool creation');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!address) return;

    setIsSubmitting(true);
    setErrorState(null);

    // Check if approval is needed
    const needsApproval = allowanceAmount < totalCost;

    if (needsApproval) {
      await handleApprove();
    } else {
      await handleCreatePool();
    }
  };

  // Calculate target price
  const targetPrice = Number(opinionData.nextPrice) / 1000000;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Pool</h2>
                    <p className="text-sm text-gray-400">Fund collective opinion change</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Form Step */}
                {currentStep === 'form' && (
                  <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    
                    {/* Opinion Context */}
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-gray-400">
                            Target Opinion
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            #{opinionId}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-white font-medium text-sm mb-1">
                            {opinionData.question}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Current Answer:</span>
                            <p className="text-white font-medium">
                              &quot;{opinionData.currentAnswer}&quot;
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Target Price:</span>
                            <p className="text-emerald-400 font-medium">
                              ${targetPrice.toFixed(2)} USDC
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pool Configuration */}
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Pool Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        
                        {/* Proposed Answer */}
                        <div>
                          <Label htmlFor="proposedAnswer" className="text-white font-medium">
                            Proposed Answer *
                          </Label>
                          <Input
                            id="proposedAnswer"
                            placeholder="Enter your proposed answer..."
                            value={formData.proposedAnswer}
                            onChange={(e) => updateFormField('proposedAnswer', e.target.value)}
                            maxLength={40}
                            className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                          />
                          {errors.proposedAnswer && (
                            <p className="text-red-400 text-xs mt-1">{errors.proposedAnswer.error}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {formData.proposedAnswer.length}/40 characters
                          </p>
                        </div>

                        {/* Pool Name */}
                        <div>
                          <Label htmlFor="poolName" className="text-white font-medium">
                            Pool Name *
                          </Label>
                          <Input
                            id="poolName"
                            placeholder="Give your pool a memorable name..."
                            value={formData.poolName}
                            onChange={(e) => updateFormField('poolName', e.target.value)}
                            maxLength={30}
                            className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                          />
                          {errors.poolName && (
                            <p className="text-red-400 text-xs mt-1">{errors.poolName.error}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {formData.poolName.length}/30 characters
                          </p>
                        </div>

                        {/* Initial Contribution */}
                        <div>
                          <Label htmlFor="contribution" className="text-white font-medium">
                            Initial Contribution *
                          </Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="contribution"
                              type="number"
                              min="1"
                              step="0.01"
                              value={formData.initialContribution}
                              onChange={(e) => updateFormField('initialContribution', parseFloat(e.target.value) || 0)}
                              className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                            />
                          </div>
                          {errors.initialContribution && (
                            <p className="text-red-400 text-xs mt-1">{errors.initialContribution.error}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Balance: {userBalance.toFixed(2)} USDC
                          </p>
                        </div>

                        {/* Deadline */}
                        <div>
                          <Label htmlFor="deadline" className="text-white font-medium">
                            Pool Deadline *
                          </Label>
                          <div className="relative mt-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="deadline"
                              type="datetime-local"
                              value={formData.deadline.toISOString().slice(0, 16)}
                              onChange={(e) => updateFormField('deadline', new Date(e.target.value))}
                              className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                            />
                          </div>
                          {errors.deadline && (
                            <p className="text-red-400 text-xs mt-1">{errors.deadline.error}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Pool will automatically execute if target is reached before deadline
                          </p>
                        </div>

                        {/* Description */}
                        <div>
                          <Label htmlFor="description" className="text-white font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Description (optional)
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => updateFormField('description', e.target.value)}
                            placeholder="Provide additional context, reasoning, or explanation for your pool..."
                            className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 resize-none h-24"
                            maxLength={300}
                          />
                          <div className="flex justify-between text-sm mt-1">
                            {errors.description && (
                              <span className="text-red-400 text-xs">{errors.description.error}</span>
                            )}
                            <span className={`ml-auto ${(formData.description?.length || 0) > 240 ? 'text-yellow-400' : 'text-gray-500'} text-xs`}>
                              {formData.description?.length || 0}/300
                            </span>
                          </div>
                        </div>

                        {/* External Link */}
                        <div>
                          <Label htmlFor="externalLink" className="text-white font-medium flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            External Link (optional)
                          </Label>
                          <Input
                            id="externalLink"
                            type="url"
                            value={formData.externalLink || ''}
                            onChange={(e) => updateFormField('externalLink', e.target.value)}
                            placeholder="https://example.com/source-or-reference"
                            className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                          />
                          {errors.externalLink && (
                            <p className="text-red-400 text-xs mt-1">{errors.externalLink.error}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Add a link to support your pool proposal (news article, research, etc.)
                          </p>
                        </div>

                      </CardContent>
                    </Card>

                    {/* Additional Information Display */}
                    {(formData.description || formData.externalLink) && (
                      <Card className="bg-gray-700/30 border-gray-600/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Additional Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {formData.description && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Description
                              </p>
                              <p className="text-white text-sm leading-relaxed">
                                {formData.description}
                              </p>
                            </div>
                          )}
                          {formData.externalLink && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                <Link className="w-3 h-3" />
                                External Link
                              </p>
                              <a 
                                href={formData.externalLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 break-all text-sm"
                              >
                                {formData.externalLink}
                              </a>
                              <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                                ⚠️ External link will be stored locally only (not on blockchain)
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Fee Breakdown */}
                    <Card className="bg-blue-500/10 border-blue-500/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Pool Creation Cost Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pool Creation Fee:</span>
                            <span className="text-white">${POOL_CREATION_FEE.toFixed(2)} USDC</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-4">→ Goes to Treasury (anti-spam protection)</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Initial Pool Contribution:</span>
                            <span className="text-white">${formData.initialContribution.toFixed(2)} USDC</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-4">→ Goes to the pool to fund opinion change</p>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
                          <span className="text-white">Total Cost:</span>
                          <span className="text-blue-400">
                            ${totalCost.toFixed(2)} USDC
                          </span>
                        </div>
                        
                        <div className="text-xs text-yellow-400 bg-yellow-400/10 rounded-md p-2 mt-2">
                          <strong>Note:</strong> The ${POOL_CREATION_FEE} creation fee prevents spam and supports the platform. Your ${formData.initialContribution.toFixed(2)} USDC contribution goes directly into the pool.
                        </div>
                      </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Target className="w-5 h-5 mr-2" />
                      )}
                      Create Pool
                    </Button>

                  </motion.form>
                )}

                {/* Loading States */}
                {['approve', 'submit'].includes(currentStep) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4 py-8"
                  >
                    <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {currentStep === 'approve' ? 'Approve USDC' : 'Creating Pool'}
                      </h3>
                      <p className="text-gray-400">
                        Please confirm the transaction in your wallet
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Success State */}
                {currentStep === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4 py-8"
                  >
                    <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Pool Created!</h3>
                      <p className="text-gray-400 mb-4">
                        Your pool &quot;{formData.poolName}&quot; has been created successfully.
                      </p>
                      <Button
                        onClick={onClose}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        View Pool
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Error State */}
                {currentStep === 'error' && errorState && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4 py-8"
                  >
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {errorState.message}
                      </h3>
                      {errorState.details && (
                        <p className="text-gray-400 mb-4">{errorState.details}</p>
                      )}
                      <div className="flex gap-3 justify-center">
                        {errorState.retryable && (
                          <Button
                            onClick={() => setCurrentStep('form')}
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            Try Again
                          </Button>
                        )}
                        <Button
                          onClick={onClose}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}