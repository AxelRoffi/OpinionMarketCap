'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { OnboardingEvents } from '@/lib/analytics';

const STORAGE_KEY = 'omc.onboarding';

interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  lastStep: number;
  completedAt?: string;
  walletAddress?: string;
}

interface OnboardingContextType {
  isOpen: boolean;
  state: OnboardingState;
  isConnected: boolean;
  address: string | undefined;
  open: () => void;
  close: () => void;
  complete: () => void;
  skip: (atStep: number) => void;
  completeStep: (step: number, stepName: string) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    completed: false,
    skipped: false,
    lastStep: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch {
        // Invalid stored data, ignore
      }
    }
    setHasCheckedStorage(true);
  }, []);

  // Check if we should show onboarding for first-time users
  useEffect(() => {
    if (!hasCheckedStorage) return;

    // Don't show if already completed or skipped
    if (state.completed || state.skipped) {
      return;
    }

    // Show onboarding on first visit (with a small delay for better UX)
    const timer = setTimeout(() => {
      setIsOpen(true);
      setStartTime(Date.now());
      OnboardingEvents.started();
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasCheckedStorage, state.completed, state.skipped]);

  // Save state to localStorage
  const saveState = useCallback((newState: Partial<OnboardingState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Mark step completed
  const completeStep = useCallback((step: number, stepName: string) => {
    OnboardingEvents.stepCompleted(step, stepName);
    saveState({ lastStep: step });
  }, [saveState]);

  // Complete onboarding
  const complete = useCallback(() => {
    const totalTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    OnboardingEvents.completed(totalTime);
    saveState({
      completed: true,
      completedAt: new Date().toISOString(),
      walletAddress: address,
    });
    setIsOpen(false);
  }, [saveState, startTime, address]);

  // Skip onboarding
  const skip = useCallback((atStep: number) => {
    OnboardingEvents.skipped(atStep);
    saveState({ skipped: true, lastStep: atStep });
    setIsOpen(false);
  }, [saveState]);

  // Open onboarding manually (for Tutorial button)
  const open = useCallback(() => {
    setIsOpen(true);
    setStartTime(Date.now());
    OnboardingEvents.started();
  }, []);

  // Close without completing
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Reset onboarding (for testing)
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      completed: false,
      skipped: false,
      lastStep: 0,
    });
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        state,
        isConnected,
        address,
        open,
        close,
        complete,
        skip,
        completeStep,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}
