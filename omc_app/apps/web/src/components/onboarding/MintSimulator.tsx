'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowRight,
  Sparkles,
  Info,
  MessageSquarePlus,
  PenLine,
  DollarSign,
  Coins,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingEvents } from '@/lib/analytics';

interface MintSimulatorProps {
  onComplete: () => void;
  isComplete: boolean;
}

type SimStep = 'intro' | 'question' | 'answer' | 'price' | 'confirm' | 'result';

export function MintSimulator({ onComplete, isComplete }: MintSimulatorProps) {
  const [step, setStep] = useState<SimStep>('intro');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [price, setPrice] = useState(20);

  // Calculate creation fee: Max(2 USDC, 20% of price)
  const creationFee = useMemo(() => {
    return Math.max(2, price * 0.2);
  }, [price]);

  const handleStartSimulation = () => {
    OnboardingEvents.simulationStarted();
    setStep('question');
  };

  const handleConfirmMint = () => {
    setStep('result');
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  if (isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <Check className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-emerald-300 font-medium">Mint Simulation Complete!</p>
            <p className="text-slate-400 text-sm">You know how to create opinions</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
          <h4 className="text-white font-medium text-sm">Key Takeaways:</h4>
          <ul className="space-y-1 text-slate-300 text-xs">
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>You set the question, initial answer & price</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>Creation fee = Max(2 USDC, 20% of price)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>You earn 3% on every future trade forever!</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-slate-300 text-sm">
              Let's create your first opinion market (no real money)!
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <MessageSquarePlus className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-medium">1. Create a question</p>
                  <p className="text-slate-400 text-xs">Ask something people will debate</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <PenLine className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-medium">2. Set initial answer</p>
                  <p className="text-slate-400 text-xs">Your opinion becomes the first answer</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-medium">3. Set the starting price</p>
                  <p className="text-slate-400 text-xs">This is what the next buyer pays</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Coins className="w-4 h-4 text-amber-400 mt-0.5" />
              <p className="text-amber-300 text-xs">
                <span className="font-medium">Minter reward:</span> You earn 3% on every trade forever!
              </p>
            </div>

            <Button
              onClick={handleStartSimulation}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create an Opinion
            </Button>
          </motion.div>
        )}

        {step === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquarePlus className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-medium">Step 1: Your Question</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., GOAT of Soccer?"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                maxLength={60}
              />
              <p className="text-slate-500 text-xs">Ask a debatable question (max 60 chars)</p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <p className="text-blue-300 text-xs">
                Good questions spark debate: "Best crypto for 2025?", "Most influential tech CEO?", "GOAT of basketball?"
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('intro')}
                className="flex-1 border-slate-600 text-slate-300"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('answer')}
                disabled={!question.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'answer' && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <PenLine className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">Step 2: Your Initial Answer</span>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-xs">Your question:</span>
              <p className="text-white text-sm font-medium mt-1">"{question}"</p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="e.g., Zidane"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                maxLength={60}
              />
              <p className="text-slate-500 text-xs">This will be the first answer (max 60 chars)</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('question')}
                className="flex-1 border-slate-600 text-slate-300"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('price')}
                disabled={!answer.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'price' && (
          <motion.div
            key="price"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-white text-sm font-medium">Step 3: Set Starting Price</span>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 space-y-1">
              <p className="text-white text-sm font-medium">"{question}"</p>
              <p className="text-slate-400 text-xs">Initial answer: <span className="text-blue-400">{answer}</span></p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Starting price:</span>
                <span className="text-white font-bold text-lg">{price} USDC</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 USDC</span>
                <span>100 USDC</span>
              </div>
            </div>

            {/* Creation fee calculation */}
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-xs font-medium">Creation fee:</span>
                <span className="text-white font-bold">{creationFee.toFixed(2)} USDC</span>
              </div>
              <p className="text-purple-300/70 text-xs">
                = Max(2 USDC, 20% of {price}) = Max(2, {(price * 0.2).toFixed(2)}) = {creationFee.toFixed(2)} USDC
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('answer')}
                className="flex-1 border-slate-600 text-slate-300"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Review
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-white font-medium text-sm mb-3">Mint Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Question</span>
                  <span className="text-white font-medium text-right max-w-[60%] truncate">"{question}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Initial Answer</span>
                  <span className="text-blue-400 font-medium">{answer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Starting Price</span>
                  <span className="text-white font-medium">{price.toFixed(2)} USDC</span>
                </div>

                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center p-2 bg-purple-500/10 rounded">
                    <span className="text-purple-300 text-xs">Creation Fee</span>
                    <span className="text-white font-bold">{creationFee.toFixed(2)} USDC</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-2 text-center">
                    You pay once to create the opinion market
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Coins className="w-4 h-4 text-amber-400 mt-0.5" />
              <p className="text-amber-300 text-xs">
                <span className="font-medium">Your reward:</span> You'll earn 3% ({(price * 0.03).toFixed(2)} USDC) on every future trade!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('price')}
                className="flex-1 border-slate-600 text-slate-300"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmMint}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              >
                Mint Opinion
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="text-center py-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <MessageSquarePlus className="w-7 h-7 text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white">Opinion Created!</h3>
              <p className="text-purple-400 text-sm mt-1 font-medium">
                "{question}"
              </p>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current Answer:</span>
                <span className="text-blue-400 font-medium">{answer}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Next Price:</span>
                <span className="text-white font-medium">{price.toFixed(2)} USDC</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <h4 className="text-emerald-300 font-medium text-xs mb-2">What happens now:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <DollarSign className="w-3 h-3 text-emerald-400 mt-0.5" />
                  <span>Anyone can submit their answer for {price.toFixed(2)} USDC</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="w-3 h-3 text-amber-400 mt-0.5" />
                  <span><strong>You earn 3%</strong> on every trade forever!</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
