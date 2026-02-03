'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Tag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorState, BalanceWarning, AllowanceInfo } from '@/components/transaction';
import { useTradingFlow, type TradingOpinionData } from '@/hooks/useTradingFlow';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUSDC } from '../hooks/use-opinion-detail';

interface InlineTradingPanelProps {
  opinionId: number;
  opinionData: TradingOpinionData;
  onCreatePool: () => void;
  onListForSale: () => void;
  onCancelListing: () => void;
  canListForSale: boolean;
  canCancelListing: boolean;
  isForSale: boolean;
  salePrice: bigint;
}

export function InlineTradingPanel({
  opinionId,
  opinionData,
  onCreatePool,
  onListForSale,
  onCancelListing,
  canListForSale,
  canCancelListing,
  isForSale,
  salePrice,
}: InlineTradingPanelProps) {
  const { address } = useAccount();
  const flow = useTradingFlow(opinionId, opinionData);
  const animatedPrice = useAnimatedCounter(Number(opinionData.nextPrice) / 1_000_000, 800);

  if (!address) {
    return (
      <div className="bg-card rounded-lg border border-border p-5 text-center space-y-3">
        <Zap className="w-8 h-8 text-emerald-500 mx-auto" />
        <h3 className="text-base font-semibold text-foreground">Connect to Trade</h3>
        <p className="text-muted-foreground text-sm">Connect your wallet to submit answers and trade.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-emerald-500/5 shadow-lg">
      {/* Price Hero */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-black text-foreground">
            ${animatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`${flow.change.isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'} px-2.5 py-1 rounded-full text-xs font-semibold`}>
            {flow.change.isPositive ? '+' : '-'}{flow.change.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-1">USDC required to trade</div>
      </div>

      {/* Trading Content */}
      <div className="p-4 space-y-4">
        <BalanceWarning requiredAmount={opinionData.nextPrice} currentBalance={flow.balance} />

        {flow.currentStep === 'form' && (
          <form onSubmit={flow.handleSubmit} className="space-y-3">
            {/* Revival chips */}
            {flow.revivalOptions.length > 0 && !flow.isLoadingHistory && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick Revival</span>
                  {flow.totalUniqueAnswers > 1 && (
                    <span className="text-xs text-muted-foreground">{flow.totalUniqueAnswers - 1} past</span>
                  )}
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {flow.revivalOptions.map((entry, index) => {
                    const isSelected = flow.isReviving && flow.formData.answer === entry.answer;
                    return (
                      <button key={index} type="button" onClick={() => flow.handleRevivalSelect(entry)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all duration-150 ${
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
                {flow.hasMoreAnswers && (
                  <button type="button" onClick={() => flow.setShowAllAnswers(!flow.showAllAnswers)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                    {flow.showAllAnswers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {flow.showAllAnswers ? 'Less' : `+${Math.min(flow.allRevivalOptions.length - 5, 10)} more`}
                  </button>
                )}
                {flow.isReviving && (
                  <div className="flex items-center justify-between py-1.5 px-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <strong>{flow.formData.answer}</strong>
                    </span>
                    <button type="button" onClick={flow.handleNewAnswer} className="text-muted-foreground hover:text-red-400">Clear</button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or new</span>
                  <div className="flex-1 border-t border-border" />
                </div>
              </div>
            )}

            {/* Answer input */}
            <div className="space-y-1">
              <Label htmlFor="inline-answer" className="text-foreground font-medium text-xs">Your Answer</Label>
              <Textarea
                id="inline-answer"
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
                {(flow.formData.description || flow.formData.externalLink) && !flow.showContextFields && <span className="text-emerald-400">•</span>}
              </button>
              <AnimatePresence>
                {flow.showContextFields && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden space-y-2 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor="inline-desc" className="text-foreground font-medium text-xs">Description</Label>
                      <Textarea
                        id="inline-desc"
                        value={flow.formData.description}
                        onChange={(e) => flow.updateFormField('description', e.target.value)}
                        placeholder="Add context..."
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none text-sm"
                        rows={2}
                        maxLength={flow.DESCRIPTION_LIMIT}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-red-400">{flow.errors.description}</span>
                        <span className={`${flow.formData.description.length > flow.DESCRIPTION_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                          {flow.formData.description.length}/{flow.DESCRIPTION_LIMIT}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inline-link" className="text-foreground font-medium text-xs">External Link</Label>
                      <Input
                        id="inline-link"
                        type="url"
                        value={flow.formData.externalLink}
                        onChange={(e) => flow.updateFormField('externalLink', e.target.value)}
                        placeholder="https://..."
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 text-sm"
                      />
                      <span className="text-red-400 text-xs">{flow.errors.link}</span>
                    </div>
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

            <AllowanceInfo
              requiredAmount={opinionData.nextPrice}
              currentAllowance={flow.allowance}
              useInfiniteApproval={flow.useInfiniteApproval}
              onApprovalTypeChange={flow.setUseInfiniteApproval}
            />

            {/* Fee breakdown */}
            <div>
              <button type="button" onClick={() => flow.setShowFees(!flow.showFees)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                <Info className="w-3 h-3" />
                <span>Fees: 5% (3% creator + 2% platform)</span>
                {flow.showFees ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
              <AnimatePresence>
                {flow.showFees && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="mt-1.5 space-y-1 text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
                      <div className="flex justify-between"><span>Previous owner (95%)</span><span className="text-foreground font-medium">{flow.formatUSDC(opinionData.nextPrice * BigInt(95) / BigInt(100))}</span></div>
                      <div className="flex justify-between"><span>Creator royalty (3%)</span><span className="text-foreground font-medium">{flow.formatUSDC(opinionData.nextPrice * BigInt(3) / BigInt(100))}</span></div>
                      <div className="flex justify-between"><span>Platform fee (2%)</span><span className="text-foreground font-medium">{flow.formatUSDC(opinionData.nextPrice * BigInt(2) / BigInt(100))}</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trade button */}
            <Button
              type="submit"
              disabled={!flow.hasBalance || flow.isSubmitting || !flow.formData.acceptedTerms}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm disabled:opacity-50 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 cta-pulse"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              {flow.needsApproval ? 'Approve & Trade' : 'Trade'}
            </Button>

            {/* Terms */}
            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="inline-terms"
                checked={flow.formData.acceptedTerms}
                onCheckedChange={(checked) => flow.updateFormField('acceptedTerms', checked as boolean)}
                className="border-border data-[state=checked]:bg-emerald-500 w-3.5 h-3.5"
              />
              <label htmlFor="inline-terms" className="text-[11px] text-muted-foreground cursor-pointer">
                I agree to the <a href="#" className="text-emerald-500 hover:text-emerald-400 underline">Terms</a>
              </label>
            </div>
            {flow.errors.terms && <span className="text-red-400 text-xs text-center block">{flow.errors.terms}</span>}
          </form>
        )}

        {/* Transaction states */}
        {['approve', 'submit'].includes(flow.currentStep) && (
          <div className="text-center space-y-3 py-6">
            <div className="w-14 h-14 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">
                {flow.currentStep === 'approve' ? 'Approve USDC' : 'Submitting Answer'}
              </h3>
              <p className="text-muted-foreground text-xs">
                {flow.currentStep === 'approve' ? 'Confirm approval in your wallet' : 'Confirm the transaction'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />10-30 seconds
            </div>
          </div>
        )}

        {flow.currentStep === 'success' && (
          <div className="text-center space-y-3 py-6">
            <div className="w-14 h-14 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Success!</h3>
              <p className="text-muted-foreground text-xs mb-3">Your answer has been submitted.</p>
              <Button onClick={flow.resetForm} variant="outline" size="sm" className="text-xs">
                Trade Again
              </Button>
            </div>
          </div>
        )}

        {flow.currentStep === 'error' && flow.errorState && (
          <ErrorState error={flow.errorState} onRetry={flow.retryFromError} onBack={flow.retryFromError} showTechnicalDetails={true} />
        )}
      </div>

      {/* Divider + Secondary Actions */}
      <div className="border-t border-border p-4 space-y-2">
        {/* Pool creation */}
        {opinionData.nextPrice >= 100_000_000n ? (
          <Button
            onClick={onCreatePool}
            variant="outline"
            className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-medium text-sm h-9"
          >
            <Target className="w-4 h-4 mr-1.5" />
            Create Pool
          </Button>
        ) : (
          <div>
            <Button disabled variant="outline" className="w-full border-border text-muted-foreground cursor-not-allowed font-medium text-sm h-9">
              <Target className="w-4 h-4 mr-1.5" />
              Create Pool
            </Button>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              Requires price ≥ 100 USDC (current: {formatUSDC(opinionData.nextPrice)})
            </p>
          </div>
        )}

        {/* Sale status */}
        {isForSale && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs">
              <Tag className="w-3.5 h-3.5" />
              <span>Listed for sale at {formatUSDC(salePrice)}</span>
            </div>
          </div>
        )}

        {/* Marketplace actions */}
        {canListForSale && (
          <Button
            onClick={onListForSale}
            variant="outline"
            className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white font-medium text-sm h-9"
          >
            <Tag className="w-4 h-4 mr-1.5" />
            List for Sale
          </Button>
        )}
        {canCancelListing && (
          <Button
            onClick={onCancelListing}
            variant="outline"
            className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-medium text-sm h-9"
          >
            <Tag className="w-4 h-4 mr-1.5" />
            Cancel Listing
          </Button>
        )}
      </div>
    </div>
  );
}
