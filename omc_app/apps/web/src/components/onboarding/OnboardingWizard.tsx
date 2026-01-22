'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Target,
  Zap,
  Shield,
  Coins,
  MessageSquarePlus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOnboardingContext } from './OnboardingContext';
import { TradeSimulator } from './TradeSimulator';
import { MintSimulator } from './MintSimulator';
import { OnboardingEvents } from '@/lib/analytics';

interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'welcome',
    title: 'Welcome to OMC',
    subtitle: 'Mint/Trade opinions, earn rewards, own the narrative',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'connect',
    title: 'Connect Your Wallet',
    subtitle: 'Your gateway to trading',
    icon: Wallet,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'explore',
    title: 'Discover Opinions',
    subtitle: 'Browse trending topics',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'mint',
    title: 'Create an Opinion',
    subtitle: 'Mint your own market',
    icon: MessageSquarePlus,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'simulate',
    title: 'Try a Trade',
    subtitle: 'Risk-free simulation',
    icon: PlayCircle,
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    subtitle: 'Start earning with opinions',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-600',
  },
];

export function OnboardingWizard() {
  const { isOpen, close, complete, skip, completeStep } = useOnboardingContext();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [mintSimulationComplete, setMintSimulationComplete] = useState(false);
  const [tradeSimulationComplete, setTradeSimulationComplete] = useState(false);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = useCallback(() => {
    completeStep(currentStep, step.id);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      complete();
    }
  }, [currentStep, step.id, completeStep, complete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    skip(currentStep);
  }, [skip, currentStep]);

  const handleMintSimulationComplete = useCallback(() => {
    setMintSimulationComplete(true);
  }, []);

  const handleTradeSimulationComplete = useCallback(() => {
    setTradeSimulationComplete(true);
    OnboardingEvents.simulationCompleted();
  }, []);

  const canProceed = useCallback(() => {
    switch (step.id) {
      case 'connect':
        return isConnected;
      case 'mint':
        return mintSimulationComplete;
      case 'simulate':
        return tradeSimulationComplete;
      default:
        return true;
    }
  }, [step.id, isConnected, mintSimulationComplete, tradeSimulationComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700"
      >
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${step.color} p-6 relative`}>
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Icon and title */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <step.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{step.title}</h2>
              <p className="text-white/80 text-sm">{step.subtitle}</p>
            </div>
          </div>

          {/* Progress text */}
          <div className="mt-4 flex justify-between text-sm text-white/70">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step.id === 'welcome' && <WelcomeStep />}
              {step.id === 'connect' && (
                <ConnectStep
                  isConnected={isConnected}
                  address={address}
                  onConnect={() => openConnectModal?.()}
                />
              )}
              {step.id === 'explore' && <ExploreStep />}
              {step.id === 'mint' && (
                <MintSimulator
                  onComplete={handleMintSimulationComplete}
                  isComplete={mintSimulationComplete}
                />
              )}
              {step.id === 'simulate' && (
                <TradeSimulator
                  onComplete={handleTradeSimulationComplete}
                  isComplete={tradeSimulationComplete}
                />
              )}
              {step.id === 'complete' && <CompleteStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? handleSkip : handlePrev}
            className="text-slate-400 hover:text-white"
          >
            {currentStep === 0 ? (
              'Skip tutorial'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`bg-gradient-to-r ${step.color} hover:opacity-90 text-white`}
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                Start Trading
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Step Components

function WelcomeStep() {
  const features = [
    {
      icon: MessageSquarePlus,
      title: 'Mint Opinions',
      description: 'Mint questions and earn creator fees',
      color: 'text-purple-400',
    },
    {
      icon: TrendingUp,
      title: 'Trade Answers',
      description: 'Buy opinion, sell them on any topics',
      color: 'text-emerald-400',
    },
    {
      icon: Coins,
      title: 'Earn USDC',
      description: 'Real rewards for your insight',
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-300 text-sm">
        OMC is an opinion market where you trade opinions for real USDC rewards.
      </p>

      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg"
          >
            <feature.icon className={`w-5 h-5 ${feature.color} mt-0.5`} />
            <div>
              <h4 className="font-medium text-white text-sm">{feature.title}</h4>
              <p className="text-slate-400 text-xs">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-300 text-xs">
          This quick tutorial will show you how to get started in under 60 seconds.
        </p>
      </div>
    </div>
  );
}

interface ConnectStepProps {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
}

function ConnectStep({ isConnected, address, onConnect }: ConnectStepProps) {
  return (
    <div className="space-y-4">
      {/* Base Network Badge */}
      <div className="flex items-center justify-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>
        <span className="text-blue-300 text-sm font-medium">OMC runs on Base Network</span>
      </div>

      {isConnected ? (
        <>
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-emerald-300 font-medium">Wallet Connected!</p>
              <p className="text-slate-400 text-sm font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-300 text-sm">To trade on Base, you'll need:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <DollarSign className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-white text-sm font-medium">USDC</p>
                <p className="text-slate-400 text-xs">On Base network</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-white text-sm font-medium">Base ETH</p>
                <p className="text-slate-400 text-xs">For gas fees</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-slate-300 text-sm">
            Connect your wallet to start trading opinions. We support MetaMask, Coinbase Wallet, and other popular wallets.
          </p>

          <Button
            onClick={onConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>

          <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
            <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-slate-400 text-xs">
              Your wallet is your account. We never have access to your funds - you're always in control.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ExploreStep() {
  return (
    <div className="space-y-3">
      <p className="text-slate-300 text-sm">
        Browse 40+ categories or mint your own opinion market!
      </p>

      {/* Sample existing opinion */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400 text-xs">Trade existing</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
            +15%
          </Badge>
        </div>
        <p className="text-white text-sm font-medium">
          "Most powerful person in the world?"
        </p>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-slate-400">Current: <span className="text-amber-400">Xi Jinping</span></span>
          <span className="text-white font-medium">Next: 125.00 USDC</span>
        </div>
      </div>

      {/* Mint your own - NEW */}
      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquarePlus className="w-3 h-3 text-purple-400" />
          <span className="text-purple-300 text-xs font-medium">Or mint your own!</span>
        </div>
        <p className="text-white text-sm font-medium">
          "GOAT of Soccer?"
        </p>
        <div className="text-xs mt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Your initial answer:</span>
            <span className="text-purple-300">Zidane</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Initial price you set:</span>
            <span className="text-white">20.00 USDC</span>
          </div>
        </div>

        {/* Creation fee explanation */}
        <div className="mt-3 pt-2 border-t border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">Creation fee:</span>
            <span className="text-purple-300 font-medium text-xs">4.00 USDC</span>
          </div>
          <p className="text-purple-300/60 text-xs mt-1">
            = Max(2 USDC, 20% of price) → Max(2, 4) = 4 USDC
          </p>
        </div>
      </div>

      {/* Minter benefit */}
      <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <Coins className="w-3 h-3 text-amber-400 mt-0.5" />
        <p className="text-amber-300 text-xs">
          <span className="font-medium">Minter reward:</span> You earn 3% on every future trade forever!
        </p>
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-emerald-400" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">You're all set!</h3>
        <p className="text-slate-400 text-sm mt-1">
          You now know the basics of trading opinions.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-slate-400 text-xs">Browse</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-slate-400 text-xs">Create</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-slate-400 text-xs">Earn</p>
        </div>
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-amber-300 text-xs">
          Remember: Only trade what you can afford to lose. Start small and learn the market dynamics.
        </p>
      </div>
    </div>
  );
}
