// app/components/CreateOpinionModal.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract-config';

interface CreateOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (txHash: string) => void;
}

export default function CreateOpinionModal({ isOpen, onClose, onSuccess }: CreateOpinionModalProps) {
  const [question, setQuestion] = useState('');
  const [initialAnswer, setInitialAnswer] = useState('');
  const [questionCharCount, setQuestionCharCount] = useState(0);
  const [answerCharCount, setAnswerCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setQuestionCharCount(text.length);
    if (text.length <= 50) {
      setQuestion(text);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setAnswerCharCount(text.length);
    if (text.length <= 40) {
      setInitialAnswer(text);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setInitialAnswer('');
    setQuestionCharCount(0);
    setAnswerCharCount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question || !initialAnswer) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Ensure question ends with a question mark
      const formattedQuestion = question.endsWith('?') ? question : `${question}?`;
      
      // Request accounts from wallet
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('No wallet detected. Please install a Web3 wallet like MetaMask.');
      }
      
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }
      
      const walletAddress = accounts[0] as `0x${string}`;
      
      // Create wallet client
      const walletClient = createWalletClient({
        account: walletAddress,
        chain: baseSepolia,
        transport: custom((window as any).ethereum)
      });
      
      // Send createOpinion transaction
      const hash = await walletClient.writeContract({
        account: walletAddress,
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createOpinion',
        args: [formattedQuestion, initialAnswer]
      });
      
      console.log('Create opinion transaction hash:', hash);
      
      if (onSuccess) {
        onSuccess(hash);
      }
      
      alert('Opinion created successfully! Transaction hash: ' + hash);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating opinion:', error);
      alert('Failed to create opinion: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 animate-fade-in" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-up">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Create Opinion Market
          </Dialog.Title>
          
          <form onSubmit={handleSubmit}>
            {/* Question field */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                  Question <span className="text-red-500">*</span>
                </label>
                <span className={`text-sm ${questionCharCount > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {questionCharCount}/50
                </span>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex gap-2">
                  <InfoCircledIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Maximum 50 characters</li>
                      <li>Must be a question</li>
                      <li>&quot;?&quot; will be added automatically if missing</li>
                      <li>Keep it clear and specific</li>
                    </ul>
                  </div>
                </div>
              </div>

              <textarea
                id="question"
                value={question}
                onChange={handleQuestionChange}
                className={`w-full rounded-md border ${questionCharCount > 50 ? 'border-red-300' : 'border-gray-300'} 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                rows={2}
                placeholder="Is Ethereum the best smart contract platform?"
                required
              />
            </div>
            
            {/* Initial Answer field */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="initialAnswer" className="block text-sm font-medium text-gray-700">
                  Initial Answer <span className="text-red-500">*</span>
                </label>
                <span className={`text-sm ${answerCharCount > 40 ? 'text-red-500' : 'text-gray-500'}`}>
                  {answerCharCount}/40
                </span>
              </div>
              
              <textarea
                id="initialAnswer"
                value={initialAnswer}
                onChange={handleAnswerChange}
                className={`w-full rounded-md border ${answerCharCount > 40 ? 'border-red-300' : 'border-gray-300'} 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                rows={2}
                placeholder="Yes, because of its ecosystem and security"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  questionCharCount === 0 || 
                  questionCharCount > 50 ||
                  answerCharCount === 0 ||
                  answerCharCount > 40
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? 'Creating...' : 'Create Market'}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
              disabled={isSubmitting}
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}