'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Check,
  ArrowRight,
  Sparkles,
  Info,
  Cpu,
  RefreshCw,
  PenLine,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingEvents } from '@/lib/analytics';

interface TradeSimulatorProps {
  onComplete: () => void;
  isComplete: boolean;
}

type SimStep = 'intro' | 'answer' | 'confirm' | 'result';

interface SimulatedOpinion {
  question: string;
  currentAnswer: string;
  currentOwner: string;
  price: number;
  change: number;
  trades: number;
}

const SAMPLE_OPINION: SimulatedOpinion = {
  question: 'Most powerful person in the world?',
  currentAnswer: 'Xi Jinping',
  currentOwner: '0x7a3...f92',
  price: 125.00,
  change: 15,
  trades: 154,
};

export function TradeSimulator({ onComplete, isComplete }: TradeSimulatorProps) {
  const [step, setStep] = useState<SimStep>('intro');
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleStartSimulation = () => {
    OnboardingEvents.simulationStarted();
    setStep('answer');
  };

  const handleSubmitAnswer = () => {
    if (userAnswer.trim()) {
      setStep('confirm');
    }
  };

  const handleConfirmTrade = () => {
    setStep('result');
    setShowResult(true);
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
            <p className="text-emerald-300 font-medium">Simulation Complete!</p>
            <p className="text-slate-400 text-sm">You understand how trading works</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
          <h4 className="text-white font-medium text-sm">Key Takeaways:</h4>
          <ul className="space-y-1 text-slate-300 text-xs">
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>You submit YOUR answer when buying</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>Your answer is always on sale - you earn when replaced</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>Prices are set by an onchain algorithm</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
              <span>Question minters earn 3% on every trade</span>
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
              Let's practice with no real money. Here's how it works:
            </p>

            {/* How it works explanation */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <PenLine className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-medium">1. Submit your answer</p>
                  <p className="text-slate-400 text-xs">Write what YOU think is the answer</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-medium">2. Your answer replaces the current one</p>
                  <p className="text-slate-400 text-xs">The previous owner gets paid automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <DollarSign className="w-4 h-4 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-medium">3. You earn when someone replaces yours</p>
                  <p className="text-slate-400 text-xs">Your answer is always on sale!</p>
                </div>
              </div>
            </div>

            {/* Price algorithm note */}
            <div className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Cpu className="w-4 h-4 text-purple-400 mt-0.5" />
              <p className="text-purple-300 text-xs">
                <span className="font-medium">Dynamic pricing:</span> The price is automatically calculated by an onchain algorithm based on trading activity. More trades = prices can go higher!
              </p>
            </div>

            <Button
              onClick={handleStartSimulation}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try It Now
            </Button>
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
            {/* Current state */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">Question</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                  +{SAMPLE_OPINION.change}%
                </Badge>
              </div>
              <p className="text-white text-sm font-medium mb-3">
                "{SAMPLE_OPINION.question}"
              </p>
              <div className="p-2 bg-slate-700/50 rounded border border-slate-600">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Current Answer:</span>
                  <span className="text-slate-500 font-mono">{SAMPLE_OPINION.currentOwner}</span>
                </div>
                <p className="text-amber-400 font-medium text-sm">"{SAMPLE_OPINION.currentAnswer}"</p>
              </div>
            </div>

            {/* Answer input */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium flex items-center gap-2">
                <PenLine className="w-4 h-4 text-blue-400" />
                Your Answer:
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="e.g., Elon Musk"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                maxLength={60}
              />
              <p className="text-slate-500 text-xs">Your answer will replace "{SAMPLE_OPINION.currentAnswer}"</p>
            </div>

            {/* Price info */}
            <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-xs">Algorithm-set price:</span>
              </div>
              <span className="text-white font-bold">{SAMPLE_OPINION.price.toFixed(2)} USDC</span>
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
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
              >
                Submit Answer
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
              <h4 className="text-white font-medium text-sm mb-3">Trade Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Your Answer</span>
                  <span className="text-emerald-400 font-medium">"{userAnswer}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Replaces</span>
                  <span className="text-slate-500">"{SAMPLE_OPINION.currentAnswer}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price (set by algorithm)</span>
                  <span className="text-white font-medium">{SAMPLE_OPINION.price.toFixed(2)} USDC</span>
                </div>

                {/* Money split section */}
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <p className="text-slate-400 text-xs mb-2">Where your money goes:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 text-xs">Previous owner</span>
                        <span className="text-slate-500 text-xs font-mono">({SAMPLE_OPINION.currentOwner})</span>
                      </div>
                      <span className="text-emerald-400 font-medium text-xs">{(SAMPLE_OPINION.price * 0.95).toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 px-2">
                      <span>Platform fee (2%)</span>
                      <span>{(SAMPLE_OPINION.price * 0.02).toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 px-2">
                      <span>Minter fee (3%)</span>
                      <span>{(SAMPLE_OPINION.price * 0.03).toFixed(2)} USDC</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-white">Total</span>
                    <span className="text-white">{SAMPLE_OPINION.price.toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Info className="w-4 h-4 text-amber-400 mt-0.5" />
              <p className="text-amber-300 text-xs">
                This is a simulation - no real money involved. Your answer will now be "on sale" and you'll earn when someone buys it!
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
                onClick={handleConfirmTrade}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Confirm Trade
                <ArrowRight className="w-4 h-4 ml-2" />
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
                className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Check className="w-7 h-7 text-emerald-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white">You're the Answer Owner!</h3>
              <p className="text-emerald-400 text-sm mt-1 font-medium">
                "{userAnswer}"
              </p>
            </div>

            {/* New price calculated */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 text-xs font-medium">Algorithm updated the price!</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                  +25%
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-400 text-xs">New next price:</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs line-through">125.00</span>
                  <span className="text-white font-bold">156.25 USDC</span>
                </div>
              </div>
              <p className="text-purple-300/70 text-xs mt-2">
                If someone buys now, you'll receive ~148.44 USDC (after fees)
              </p>
            </motion.div>

            <div className="p-3 bg-slate-800/50 rounded-lg space-y-2">
              <h4 className="text-white font-medium text-xs">What happens now:</h4>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                <li className="flex items-start gap-2">
                  <DollarSign className="w-3 h-3 text-emerald-400 mt-0.5" />
                  <span><strong>Your answer is on sale!</strong> You get paid when someone replaces it</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-purple-400 mt-0.5" />
                  <span>Hot topics with more trades see prices increase!</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
