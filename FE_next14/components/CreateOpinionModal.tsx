'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CreateOpinionForm } from '@/lib/types';
import { CONTRACTS, OPINION_CORE_ABI, MOCK_USDC_ABI } from '@/lib/contracts';
import { formatUSDC, parseUSDC, calculateCreationFee, isValidUrl, cn } from '@/lib/utils';

interface CreateOpinionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOpinionModal = ({ onClose, onSuccess }: CreateOpinionModalProps) => {
  const { address } = useAccount();
  const [form, setForm] = useState<CreateOpinionForm>({
    question: '',
    answer: '',
    description: '',
    initialPrice: '',
    categories: [],
    ipfsHash: '',
    link: '',
  });
  const [step, setStep] = useState<'form' | 'approve' | 'submit' | 'success'>('form');
  const [error, setError] = useState<string>('');
  const [useExtras, setUseExtras] = useState(false);

  // Read available categories
  const { data: availableCategories } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAvailableCategories',
  });

  // Read price limits
  const { data: minPrice } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'MIN_INITIAL_PRICE',
  });

  const { data: maxPrice } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'MAX_INITIAL_PRICE',
  });

  const { writeContract: approveUSDC, data: approveHash } = useWriteContract();
  const { writeContract: createOpinion, data: createHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isCreating } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  // Handle approval success
  if (approveHash && !isApproving && step === 'approve') {
    setStep('submit');
  }

  // Handle create success
  if (createHash && !isCreating && step === 'submit') {
    setStep('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  }

  const initialPriceBigInt = form.initialPrice ? parseUSDC(form.initialPrice) : 0n;
  const creationFee = calculateCreationFee(initialPriceBigInt);

  const validateForm = (): string | null => {
    if (!form.question.trim()) return 'Question is required';
    if (form.question.length > 52) return 'Question must be 52 characters or less';
    
    if (!form.answer.trim()) return 'Initial answer is required';
    if (form.answer.length > 52) return 'Answer must be 52 characters or less';
    
    if (form.description.length > 120) return 'Description must be 120 characters or less';
    
    if (!form.initialPrice) return 'Initial price is required';
    const price = parseFloat(form.initialPrice);
    if (isNaN(price) || price <= 0) return 'Initial price must be a positive number';
    
    if (minPrice && maxPrice) {
      const minUSDC = Number(minPrice) / 1_000_000;
      const maxUSDC = Number(maxPrice) / 1_000_000;
      if (price < minUSDC || price > maxUSDC) {
        return `Initial price must be between $${minUSDC} and $${maxUSDC}`;
      }
    }
    
    if (form.categories.length === 0) return 'At least one category is required';
    if (form.categories.length > 3) return 'Maximum 3 categories allowed';
    
    if (useExtras) {
      if (form.ipfsHash && form.ipfsHash.length > 68) {
        return 'IPFS hash must be 68 characters or less';
      }
      if (form.link && form.link.length > 260) {
        return 'Link must be 260 characters or less';
      }
      if (form.link && !isValidUrl(form.link)) {
        return 'Please enter a valid URL';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    try {
      // Step 1: Approve USDC spending
      setStep('approve');
      await approveUSDC({
        address: CONTRACTS.MOCK_USDC,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.OPINION_CORE, creationFee],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to approve USDC');
      setStep('form');
    }
  };

  const handleCreateOpinion = async () => {
    if (!address) return;

    try {
      const functionName = useExtras ? 'createOpinionWithExtras' : 'createOpinion';
      const args = useExtras 
        ? [form.question, form.answer, form.description, initialPriceBigInt, form.categories, form.ipfsHash || '', form.link || '']
        : [form.question, form.answer, form.description, initialPriceBigInt, form.categories];

      await createOpinion({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName,
        args,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create opinion');
      setStep('form');
    }
  };

  // Auto-create opinion after approval
  if (step === 'submit' && !isCreating && !createHash) {
    handleCreateOpinion();
  }

  const toggleCategory = (category: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : prev.categories.length < 3
        ? [...prev.categories, category]
        : prev.categories
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'success' ? 'Opinion Created!' : 'Create New Opinion'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isApproving || isCreating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'success' ? (
            <SuccessContent />
          ) : (
            <>
              {/* Fee Info */}
              {form.initialPrice && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Creation Fee Calculation</p>
                      <p className="text-blue-700">
                        Initial Price: {formatUSDC(initialPriceBigInt)} → 
                        Creation Fee: <span className="font-semibold">{formatUSDC(creationFee)}</span>
                      </p>
                      <p className="text-blue-600 text-xs mt-1">
                        Fee is 20% of initial price (minimum $5.00)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={(e) => setForm(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="e.g., Who will win the 2024 election?"
                    maxLength={52}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={step !== 'form'}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.question.length}/52 characters
                  </p>
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Answer *
                  </label>
                  <input
                    type="text"
                    value={form.answer}
                    onChange={(e) => setForm(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="e.g., Donald Trump"
                    maxLength={52}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={step !== 'form'}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.answer.length}/52 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional context or reasoning"
                    maxLength={120}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={step !== 'form'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.description.length}/120 characters
                  </p>
                </div>

                {/* Initial Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Price (USDC) *
                  </label>
                  <input
                    type="number"
                    value={form.initialPrice}
                    onChange={(e) => setForm(prev => ({ ...prev, initialPrice: e.target.value }))}
                    placeholder="1-100"
                    min={minPrice ? Number(minPrice) / 1_000_000 : 1}
                    max={maxPrice ? Number(maxPrice) / 1_000_000 : 100}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={step !== 'form'}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Range: $1.00 - $100.00
                  </p>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categories * (Select 1-3)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableCategories?.map((category: string) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        disabled={step !== 'form'}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          form.categories.includes(category)
                            ? "bg-primary-100 text-primary-700 border-2 border-primary-300"
                            : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {form.categories.length}/3
                  </p>
                </div>

                {/* Extras Toggle */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useExtras}
                      onChange={(e) => setUseExtras(e.target.checked)}
                      disabled={step !== 'form'}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Add image and external link (optional)
                    </span>
                  </label>
                </div>

                {/* Extras Fields */}
                {useExtras && (
                  <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IPFS Hash (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.ipfsHash}
                        onChange={(e) => setForm(prev => ({ ...prev, ipfsHash: e.target.value }))}
                        placeholder="QmXXXXXXXXXXXXXXXXXXXX"
                        maxLength={68}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step !== 'form'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        External Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={form.link}
                        onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                        placeholder="https://example.com"
                        maxLength={260}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step !== 'form'}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1"
                    disabled={isApproving || isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={!address || isApproving || isCreating || !form.question || !form.answer || !form.initialPrice || form.categories.length === 0}
                  >
                    {getButtonText(step, isApproving, isCreating)}
                  </button>
                </div>
              </form>

              {/* Transaction Steps */}
              {(step === 'approve' || step === 'submit') && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-3">
                    <TransactionStep
                      label="1. Approve USDC Spending"
                      status={step === 'approve' ? 'loading' : 'completed'}
                      isActive={step === 'approve'}
                    />
                    <TransactionStep
                      label="2. Create Opinion"
                      status={step === 'submit' ? 'loading' : step === 'form' ? 'pending' : 'completed'}
                      isActive={step === 'submit'}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SuccessContent = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Opinion Created Successfully!
    </h3>
    <p className="text-gray-600 mb-4">
      Your opinion is now live on the market and ready for trading.
    </p>
    <div className="animate-pulse text-sm text-gray-500">
      Refreshing data...
    </div>
  </div>
);

interface TransactionStepProps {
  label: string;
  status: 'pending' | 'loading' | 'completed';
  isActive: boolean;
}

const TransactionStep = ({ label, status, isActive }: TransactionStepProps) => (
  <div className={cn("flex items-center gap-3", isActive && "font-medium")}>
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
      status === 'completed' && "bg-green-100 text-green-600",
      status === 'loading' && "bg-blue-100 text-blue-600",
      status === 'pending' && "bg-gray-100 text-gray-400"
    )}>
      {status === 'completed' ? '✓' : status === 'loading' ? '...' : '○'}
    </div>
    <span className={cn(
      "text-sm",
      status === 'completed' && "text-green-700",
      status === 'loading' && "text-blue-700",
      status === 'pending' && "text-gray-500"
    )}>
      {label}
    </span>
  </div>
);

function getButtonText(step: string, isApproving: boolean, isCreating: boolean): string {
  if (step === 'approve' && isApproving) return 'Approving...';
  if (step === 'submit' && isCreating) return 'Creating...';
  return 'Create Opinion';
}

export default CreateOpinionModal;