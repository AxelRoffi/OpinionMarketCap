'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'

import { ErrorState, BalanceWarning, AllowanceInfo } from '@/components/transaction'
import { useTradingFlow, type TradingOpinionData } from '@/hooks/useTradingFlow'

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  opinionId: number
  opinionData: TradingOpinionData
}

export function TradingModal({ isOpen, onClose, opinionId, opinionData }: TradingModalProps) {
  const flow = useTradingFlow(opinionId, opinionData)

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen && flow.currentStep !== 'error') {
      flow.resetForm()
    }
  }, [isOpen])

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            >
              <div className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl">
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-foreground leading-tight break-words">
                        {opinionData.question}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {opinionData.categories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5">
                            {category}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">by {formatAddress(opinionData.creator)}</span>
                      </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Current answer */}
                  <div className="flex items-center gap-2 py-2.5 px-3 bg-muted/50 rounded-lg mb-4">
                    <span className="text-xs text-muted-foreground">Current answer:</span>
                    <span className="text-sm font-semibold text-foreground truncate">{opinionData.currentAnswer}</span>
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">by {formatAddress(opinionData.currentAnswerOwner)}</span>
                  </div>

                  {/* Price block */}
                  <div className="flex items-center justify-center gap-3 py-4 mb-4 border border-border/50 rounded-xl bg-muted/20">
                    <span className="text-3xl font-black text-foreground">{flow.formatUSDC(opinionData.nextPrice)}</span>
                    <span className="text-xs text-muted-foreground">USDC</span>
                    <span className={`${flow.change.isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                      {flow.change.isPositive ? '+' : '-'}{flow.change.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 space-y-4">
                  <BalanceWarning requiredAmount={opinionData.nextPrice} currentBalance={flow.balance} />

                  {flow.currentStep === 'form' && (
                    <form onSubmit={flow.handleSubmit} className="space-y-4">
                      {/* Revival chips */}
                      {flow.revivalOptions.length > 0 && !flow.isLoadingHistory && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick Revival</span>
                            {flow.totalUniqueAnswers > 1 && (
                              <span className="text-xs text-muted-foreground">{flow.totalUniqueAnswers - 1} past {flow.totalUniqueAnswers === 2 ? 'answer' : 'answers'}</span>
                            )}
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {flow.revivalOptions.map((entry, index) => {
                              const isSelected = flow.isReviving && flow.formData.answer === entry.answer
                              return (
                                <button key={index} type="button" onClick={() => flow.handleRevivalSelect(entry)}
                                  className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-muted/50 border-border text-foreground hover:border-emerald-500/30'}`}>
                                  {entry.answer}
                                  {entry.submissionCount > 1 && <span className="text-xs text-muted-foreground ml-1">({entry.submissionCount}x)</span>}
                                </button>
                              )
                            })}
                          </div>
                          {flow.hasMoreAnswers && (
                            <button type="button" onClick={() => flow.setShowAllAnswers(!flow.showAllAnswers)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                              {flow.showAllAnswers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {flow.showAllAnswers ? 'Show less' : `+${Math.min(flow.allRevivalOptions.length - 5, 10)} more`}
                            </button>
                          )}
                          {flow.isReviving && (
                            <div className="flex items-center justify-between py-2 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm">
                              <span className="text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Reviving: <strong>{flow.formData.answer}</strong>
                              </span>
                              <button type="button" onClick={flow.handleNewAnswer} className="text-xs text-muted-foreground hover:text-red-400">Clear</button>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 border-t border-border" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or submit new</span>
                            <div className="flex-1 border-t border-border" />
                          </div>
                        </div>
                      )}

                      {/* Answer input */}
                      <div className="space-y-1.5">
                        <Label htmlFor="answer" className="text-foreground font-medium text-sm">Your Answer</Label>
                        <Textarea id="answer" value={flow.formData.answer} onChange={(e) => flow.updateFormField('answer', e.target.value)}
                          placeholder="Enter your answer..." className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none" rows={2} maxLength={flow.ANSWER_LIMIT} />
                        <div className="flex justify-between text-xs">
                          <span className="text-red-400">{flow.errors.answer}</span>
                          <span className={`${flow.formData.answer.length > flow.ANSWER_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>{flow.formData.answer.length}/{flow.ANSWER_LIMIT}</span>
                        </div>
                      </div>

                      {/* Context fields */}
                      <div>
                        <button type="button" onClick={() => flow.setShowContextFields(!flow.showContextFields)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {flow.showContextFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>Add context (optional)</span>
                          {(flow.formData.description || flow.formData.externalLink) && !flow.showContextFields && <span className="text-emerald-400">•</span>}
                        </button>
                        <AnimatePresence>
                          {flow.showContextFields && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden space-y-3 mt-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-foreground font-medium text-sm">Description</Label>
                                <Textarea id="description" value={flow.formData.description} onChange={(e) => flow.updateFormField('description', e.target.value)}
                                  placeholder="Add context or explanation..." className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none" rows={2} maxLength={flow.DESCRIPTION_LIMIT} />
                                <div className="flex justify-between text-xs">
                                  <span className="text-red-400">{flow.errors.description}</span>
                                  <span className={`${flow.formData.description.length > flow.DESCRIPTION_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>{flow.formData.description.length}/{flow.DESCRIPTION_LIMIT}</span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="link" className="text-foreground font-medium text-sm">External Link</Label>
                                <Input id="link" type="url" value={flow.formData.externalLink} onChange={(e) => flow.updateFormField('externalLink', e.target.value)}
                                  placeholder="https://example.com" className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500" />
                                <span className="text-red-400 text-xs">{flow.errors.link}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Content warning */}
                      {flow.contentWarning && (
                        <Alert className="bg-yellow-900/20 border-yellow-500/50">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-400 text-sm">{flow.contentWarning}</AlertDescription>
                        </Alert>
                      )}

                      <AllowanceInfo requiredAmount={opinionData.nextPrice} currentAllowance={flow.allowance} useInfiniteApproval={flow.useInfiniteApproval} onApprovalTypeChange={flow.setUseInfiniteApproval} />

                      {/* Fee breakdown */}
                      <div>
                        <button type="button" onClick={() => flow.setShowFees(!flow.showFees)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                          <Info className="w-3.5 h-3.5" />
                          <span>Fees: 5% total (3% creator + 2% platform)</span>
                          {flow.showFees ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                        </button>
                        <AnimatePresence>
                          {flow.showFees && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                                <div className="flex justify-between"><span>Previous owner (95%)</span><span className="text-foreground font-medium">{flow.formatUSDC(opinionData.nextPrice * BigInt(95) / BigInt(100))}</span></div>
                                <div className="flex justify-between"><span>Creator royalty (3%)</span><span className="text-foreground font-medium">{flow.formatUSDC(opinionData.nextPrice * BigInt(3) / BigInt(100))}</span></div>
                                <div className="flex justify-between"><span>Platform fee (2%)</span><span className="text-foreground font-medium">{flow.formatUSDC(opinionData.nextPrice * BigInt(2) / BigInt(100))}</span></div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Button type="submit" disabled={!flow.hasBalance || flow.isSubmitting || !flow.formData.acceptedTerms}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-base disabled:opacity-50 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200">
                        {flow.needsApproval ? 'Approve & Trade' : 'Trade'}
                      </Button>

                      <div className="flex items-center justify-center gap-2">
                        <Checkbox id="terms" checked={flow.formData.acceptedTerms} onCheckedChange={(checked) => flow.updateFormField('acceptedTerms', checked as boolean)}
                          className="border-border data-[state=checked]:bg-emerald-500 w-3.5 h-3.5" />
                        <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                          I agree to the <a href="#" className="text-emerald-500 hover:text-emerald-400 underline">Terms of Use</a>
                        </label>
                      </div>
                      {flow.errors.terms && <span className="text-red-400 text-xs text-center block">{flow.errors.terms}</span>}
                    </form>
                  )}

                  {/* Transaction states */}
                  {['approve', 'submit'].includes(flow.currentStep) && (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{flow.currentStep === 'approve' ? 'Approve USDC' : 'Submitting Answer'}</h3>
                        <p className="text-muted-foreground text-sm">{flow.currentStep === 'approve' ? 'Please confirm the approval in your wallet' : 'Please confirm the transaction in your wallet'}</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />This may take 10-30 seconds
                      </div>
                    </div>
                  )}

                  {flow.currentStep === 'success' && (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Success!</h3>
                        <p className="text-muted-foreground mb-4 text-sm">Your answer has been submitted.</p>
                        <Button onClick={onClose} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-8">Done</Button>
                      </div>
                    </div>
                  )}

                  {flow.currentStep === 'error' && flow.errorState && (
                    <ErrorState error={flow.errorState} onRetry={flow.retryFromError} onBack={flow.retryFromError} onClose={onClose} showTechnicalDetails={true} />
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}
