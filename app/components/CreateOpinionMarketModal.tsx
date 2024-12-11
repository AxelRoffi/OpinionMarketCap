'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opinion: string) => void;
}

export default function CreateOpinionMarketModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [opinion, setOpinion] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(opinion);
    setOpinion('');
    setCharCount(0);
    onClose();
  };

  const handleOpinionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCharCount(text.length);
    if (text.length <= 50) {
      setOpinion(text);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 animate-fade-in" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-up">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Create Opinion Market
          </Dialog.Title>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="opinion" className="block text-sm font-medium text-gray-700">
                  Opinion Topic <span className="text-red-500">*</span>
                </label>
                <span className={`text-sm ${charCount > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {charCount}/50
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
                      <li>"?" will be added automatically if missing</li>
                      <li>Keep it clear and specific</li>
                    </ul>
                  </div>
                </div>
              </div>

              <textarea
                id="opinion"
                value={opinion}
                onChange={handleOpinionChange}
                className={`w-full rounded-md border ${charCount > 50 ? 'border-red-300' : 'border-gray-300'} 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                rows={2}
                placeholder="Is Ethereum the best smart contract platform?"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={charCount === 0 || charCount > 50}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                Create Market
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}