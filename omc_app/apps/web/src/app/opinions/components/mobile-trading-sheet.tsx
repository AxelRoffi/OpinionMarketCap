'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorState, BalanceWarning, AllowanceInfo } from '@/components/transaction';
import { useTradingFlow, type TradingOpinionData } from '@/hooks/useTradingFlow';

interface MobileTradingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  opinionId: number;
  opinionData: TradingOpinionData;
}

export function MobileTradingSheet({ isOpen, onClose, opinionId, opinionData }: MobileTradingSheetProps) {
  const flow = useTradingFlow(opinionId, opinionData);

  useEffect(() => {
    if (!isOpen && flow.currentStep !== 'error') {
      flow.resetForm();
    }
  }, [isOpen]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-card rounded-t-2xl border-t border-border shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{flow.formatUSDC(opinionData.nextPrice)} USDC</h3>
                <span className={`text-xs font-medium ${flow.change.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {flow.change.isPositive ? '+' : '-'}{flow.change.percentage.toFixed(1)}%
                </span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-6 space-y-3">
              <BalanceWarning requiredAmount={opinionData.nextPrice} currentBalance={flow.balance} />

              {flow.currentStep === 'form' && (
                <form onSubmit={flow.handleSubmit} className="space-y-3">
                  {/* Revival chips */}
                  {flow.revivalOptions.length > 0 && !flow.isLoadingHistory && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick Revival</span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {flow.revivalOptions.map((entry, index) => {
                          const isSelected = flow.isReviving && flow.formData.answer === entry.answer;
                          return (
                            <button key={index} type="button" onClick={() => flow.handleRevivalSelect(entry)}
                              className={`flex-shrink-0 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                  : 'bg-muted/50 border-border text-foreground hover:border-emerald-500/30'
                              }`}>
                              {entry.answer}
                              {entry.submissionCount > 1 && <span className="text-muted-foreground ml-1">({entry.submissionCount}x)</span>}
                            </button>
                          );
                        })}
                      </div>
                      {flow.isReviving && (
                        <div className="flex items-center justify-between py-1.5 px-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <strong>{flow.formData.answer}</strong>
                          </span>
                          <button type="button" onClick={flow.handleNewAnswer} className="text-muted-foreground hover:text-red-400">Clear</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Answer input */}
                  <div className="space-y-1">
                    <Label htmlFor="mobile-answer" className="text-foreground font-medium text-xs">Your Answer</Label>
                    <Textarea
                      id="mobile-answer"
                      value={flow.formData.answer}
                      onChange={(e) => flow.updateFormField('answer', e.target.value)}
                      placeholder="Enter your answer..."
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none text-sm"
                      rows={2}
                      maxLength={flow.ANSWER_LIMIT}
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">{flow.errors.answer}</span>
                      <span className={`${flow.formData.answer.length > flow.ANSWER_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {flow.formData.answer.length}/{flow.ANSWER_LIMIT}
                      </span>
                    </div>
                  </div>

                  {/* Context fields */}
                  <div>
                    <button type="button" onClick={() => flow.setShowContextFields(!flow.showContextFields)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {flow.showContextFields ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span>Context (optional)</span>
                    </button>
                    <AnimatePresence>
                      {flow.showContextFields && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden space-y-2 mt-2">
                          <Textarea
                            value={flow.formData.description}
                            onChange={(e) => flow.updateFormField('description', e.target.value)}
                            placeholder="Description..."
                            className="bg-muted border-border text-foreground text-sm resize-none"
                            rows={2}
                            maxLength={flow.DESCRIPTION_LIMIT}
                          />
                          <Input
                            type="url"
                            value={flow.formData.externalLink}
                            onChange={(e) => flow.updateFormField('externalLink', e.target.value)}
                            placeholder="https://..."
                            className="bg-muted border-border text-foreground text-sm"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content warning */}
                  {flow.contentWarning && (
                    <Alert className="bg-yellow-900/20 border-yellow-500/50 py-2">
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                      <AlertDescription className="text-yellow-400 text-xs">{flow.contentWarning}</AlertDescription>
                    </Alert>
                  )}

                  {/* Fees */}
                  <div>
                    <button type="button" onClick={() => flow.setShowFees(!flow.showFees)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                      <Info className="w-3 h-3" />
                      <span>Fees: 5%</span>
                      {flow.showFees ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                    </button>
                    <AnimatePresence>
                      {flow.showFees && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                          <div className="mt-1.5 space-y-1 text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
                            <div className="flex justify-between"><span>Previous owner (95%)</span><span className="text-foreground">{flow.formatUSDC(opinionData.nextPrice * BigInt(95) / BigInt(100))}</span></div>
                            <div className="flex justify-between"><span>Creator (3%)</span><span className="text-foreground">{flow.formatUSDC(opinionData.nextPrice * BigInt(3) / BigInt(100))}</span></div>
                            <div className="flex justify-between"><span>Platform (2%)</span><span className="text-foreground">{flow.formatUSDC(opinionData.nextPrice * BigInt(2) / BigInt(100))}</span></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Terms */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mobile-terms"
                      checked={flow.formData.acceptedTerms}
                      onCheckedChange={(checked) => flow.updateFormField('acceptedTerms', checked as boolean)}
                      className="border-border data-[state=checked]:bg-emerald-500 w-3.5 h-3.5"
                    />
                    <label htmlFor="mobile-terms" className="text-[11px] text-muted-foreground cursor-pointer">
                      I agree to the <a href="#" className="text-emerald-500 underline">Terms</a>
                    </label>
                  </div>

                  {/* Trade button */}
                  <Button
                    type="submit"
                    disabled={!flow.hasBalance || flow.isSubmitting || !flow.formData.acceptedTerms}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-base disabled:opacity-50 rounded-xl"
                  >
                    <Zap className="w-5 h-5 mr-1.5" />
                    {flow.needsApproval ? 'Approve & Trade' : 'Trade'}
                  </Button>
                </form>
              )}

              {/* Transaction states */}
              {['approve', 'submit'].includes(flow.currentStep) && (
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{flow.currentStep === 'approve' ? 'Approve USDC' : 'Submitting...'}</h3>
                  <p className="text-muted-foreground text-xs">Confirm in your wallet</p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />10-30s
                  </div>
                </div>
              )}

              {flow.currentStep === 'success' && (
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Success!</h3>
                  <p className="text-muted-foreground text-xs mb-3">Answer submitted.</p>
                  <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8">Done</Button>
                </div>
              )}

              {flow.currentStep === 'error' && flow.errorState && (
                <ErrorState error={flow.errorState} onRetry={flow.retryFromError} onBack={flow.retryFromError} onClose={onClose} showTechnicalDetails={true} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
