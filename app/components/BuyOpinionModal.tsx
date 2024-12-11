'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

interface BuyOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answer: string) => void;
  currentPrice: string;
  paymentToken: string;
}

export default function BuyOpinionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentPrice, 
  paymentToken 
}: BuyOpinionModalProps) {
  const [answer, setAnswer] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answer);
    setAnswer('');
    setCharCount(0);
    onClose();
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCharCount(text.length);
    if (text.length <= 40) {
      setAnswer(text);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 animate-fade-in" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-up">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Buy Opinion
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex gap-2">
                  <InfoCircledIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Answer Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Maximum 40 characters</li>
                      <li>Be clear and concise</li>
                      <li>Price may vary up to +100% or -20%</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                    Your Answer <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-sm ${charCount > 40 ? 'text-red-500' : 'text-gray-500'}`}>
                    {charCount}/40
                  </span>
                </div>

                <textarea
                  id="answer"
                  value={answer}
                  onChange={handleAnswerChange}
                  className={`w-full rounded-md border ${charCount > 40 ? 'border-red-300' : 'border-gray-300'} 
                    shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                  rows={2}
                  placeholder="Layer 2 with best throughput"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Price</span>
                  <span className="font-medium">{currentPrice} {paymentToken}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Max Price (+100%)</span>
                  <span className="font-medium">{parseFloat(currentPrice) * 2} {paymentToken}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Min Price (-20%)</span>
                  <span className="font-medium">{parseFloat(currentPrice) * 0.8} {paymentToken}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={charCount === 0 || charCount > 40}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                Buy Opinion
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