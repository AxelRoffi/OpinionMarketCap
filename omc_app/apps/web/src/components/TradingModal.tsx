'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
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

import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { parseTransactionError, validateAnswerInputs, type ParsedError } from '@/lib/errors'
import { validateAnswerForTrading } from '@/lib/contentFiltering'
import { ErrorState, BalanceWarning, AllowanceInfo } from '@/components/transaction'
import {
  useAnswerHistory,
  type RankedAnswer
} from '@/hooks/useAnswerHistory'

interface OpinionData {
  id: number
  question: string
  currentAnswer: string
  nextPrice: bigint
  lastPrice: bigint
  totalVolume: bigint
  currentAnswerOwner: string
  isActive: boolean
  creator: string
  categories: string[]
  currentAnswerDescription?: string
  tradesCount?: number // New field for trades count
}

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  opinionId: number
  opinionData: OpinionData
}

// Use ParsedError from lib/errors instead of local ErrorState
// (ParsedError has more detailed error types and parsing)

// Form data persistence
interface FormData {
  answer: string
  description: string
  externalLink: string
  acceptedTerms: boolean
}

export function TradingModal({ isOpen, onClose, opinionId, opinionData }: TradingModalProps) {
  const { address } = useAccount()
  
  // Enhanced form state with persistence
  const [formData, setFormData] = useState<FormData>({
    answer: '',
    description: '',
    externalLink: '',
    acceptedTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [contentWarning, setContentWarning] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'form' | 'approve' | 'submit' | 'success' | 'error'>('form')
  const [errorState, setErrorState] = useState<ParsedError | null>(null)
  const [useInfiniteApproval, setUseInfiniteApproval] = useState(true) // Default to infinite approval
  const [showContextFields, setShowContextFields] = useState(false) // Collapsed by default
  const [isReviving, setIsReviving] = useState(false) // Track if user is reviving an answer
  const [showAllAnswers, setShowAllAnswers] = useState(false) // For "Show more" expansion

  // Fetch answer history for this opinion
  const { rankedAnswers, totalUniqueAnswers, isLoading: isLoadingHistory } = useAnswerHistory(opinionId)

  // Filter out the current answer from revival options
  const allRevivalOptions = rankedAnswers.filter(
    (entry) => entry.answer.toLowerCase().trim() !== opinionData.currentAnswer.toLowerCase().trim()
  )

  // Show 5 by default, all if expanded
  const DEFAULT_VISIBLE = 5
  const revivalOptions = showAllAnswers
    ? allRevivalOptions.slice(0, 15) // Cap at 15 even when expanded
    : allRevivalOptions.slice(0, DEFAULT_VISIBLE)

  const hasMoreAnswers = allRevivalOptions.length > DEFAULT_VISIBLE
  
  // Convenience accessors for form data
  const { answer, description, externalLink: link, acceptedTerms } = formData

  // Character limits (must match deployed contract)
  // Note: Contract has a bug where MAX_DESCRIPTION_LENGTH=280 is defined but
  // ValidationLibrary.validateDescription() defaults to 120 when called without maxLength
  const ANSWER_LIMIT = 60
  const DESCRIPTION_LIMIT = 120
  
  // Conservative "infinite" approval amount - use a reasonable large number
  // Equivalent to 1 million USDC (6 decimals) - should be enough for any reasonable use
  const INFINITE_APPROVAL = BigInt('1000000000000') // 1 million USDC in wei (1M * 10^6)

  // Contract interactions
  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
    query: { enabled: !!address }
  })

  const { 
    writeContract: approveUSDC, 
    data: approveHash, 
    error: approveError,
    isPending: isApprovePending 
  } = useWriteContract()
  
  const { 
    writeContract: submitAnswer, 
    data: submitHash,
    error: submitError,
    isPending: isSubmitPending 
  } = useWriteContract()

  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({ hash: submitHash })
  
  // Derive error states
  const isSubmitError = !!submitError
  const isApproveError = !!approveError

  // Format functions
  const formatUSDC = useCallback((wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const calculateChange = (current: bigint, last: bigint) => {
    if (last === BigInt(0)) return { percentage: 0, isPositive: true }
    const diff = Number(current - last)
    const percentage = (diff / Number(last)) * 100
    return { percentage: Math.abs(percentage), isPositive: diff >= 0 }
  }

  // Enhanced form validation using lib/errors validation + spam detection
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Use centralized validation for length/format
    const validation = validateAnswerInputs({
      answer,
      description,
      link,
    })

    // Map validation errors to form errors
    if (!validation.valid) {
      for (const error of validation.errors) {
        if (error.title.toLowerCase().includes('answer')) {
          newErrors.answer = error.message
        } else if (error.title.toLowerCase().includes('description')) {
          newErrors.description = error.message
        } else if (error.title.toLowerCase().includes('link') || error.title.toLowerCase().includes('url')) {
          newErrors.link = error.message
        }
      }
    }

    // Spam/gibberish detection - block nonsense answers
    if (!newErrors.answer) {
      const spamValidation = validateAnswerForTrading(answer, description)
      if (!spamValidation.valid && spamValidation.error) {
        newErrors.answer = spamValidation.error
      }
    }

    // Terms validation (not in centralized validation)
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    setErrorState(null) // Clear previous error state
    return Object.keys(newErrors).length === 0
  }

  // Enhanced error handling using parseTransactionError from lib/errors
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`${context}:`, error)

    // Use the centralized error parser
    const parsed = parseTransactionError(error)

    setErrorState(parsed)
    setCurrentStep('error')
    setIsSubmitting(false)
  }, [])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  // Enhanced form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!address) {
      setErrorState({
        type: 'validation_error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to continue.',
        retryable: false,
      })
      return
    }

    setIsSubmitting(true)
    setErrorState(null)
    
    try {
      // Check if approval is needed
      const needsApproval = !allowance || allowance < opinionData.nextPrice
      
      if (needsApproval) {
        setCurrentStep('approve')
        const approvalAmount = useInfiniteApproval ? INFINITE_APPROVAL : opinionData.nextPrice
        await approveUSDC({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.OPINION_CORE, approvalAmount]
        })
      } else {
        setCurrentStep('submit')
        
        await submitAnswer({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'submitAnswer',
          args: [BigInt(opinionId), answer.trim(), description.trim(), link.trim()]
        })
      }
    } catch (error) {
      handleError(error, 'Form submission')
    }
  }

  // Handle successful transaction
  const handleTransactionSuccess = useCallback(() => {
    resetForm() // Only clear form on success
    setCurrentStep('success')
    setIsSubmitting(false)
  }, [])

  // Handle form field updates with persistence
  const updateFormField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // If user manually edits answer, they're no longer reviving
    if (field === 'answer') {
      setIsReviving(false)
    }
  }

  // Handle revival selection - pre-fill answer and description
  const handleRevivalSelect = (entry: RankedAnswer) => {
    setFormData(prev => ({
      ...prev,
      answer: entry.answer,
      description: entry.description || '',
    }))
    setIsReviving(true)
    setShowContextFields(!!entry.description) // Show context if there was a description
    setErrors({}) // Clear any errors
  }

  // Clear revival and start fresh
  const handleNewAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answer: '',
      description: '',
      externalLink: '',
    }))
    setIsReviving(false)
    setShowContextFields(false)
  }

  // Real-time content quality check (show warnings as user types)
  useEffect(() => {
    if (answer.length >= 2) {
      const validation = validateAnswerForTrading(answer, description)
      if (validation.warning) {
        setContentWarning(validation.warning)
      } else if (!validation.valid && validation.error) {
        // Show error as warning while typing (will block on submit)
        setContentWarning(validation.error)
      } else {
        setContentWarning(null)
      }
    } else {
      setContentWarning(null)
    }
  }, [answer, description])

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && currentStep === 'approve') {
      setCurrentStep('submit')
      try {
        
        submitAnswer({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'submitAnswer',
          args: [BigInt(opinionId), answer.trim(), description.trim(), link.trim()]
        })
      } catch (error) {
        handleError(error, 'Submit after approval')
      }
    }
  }, [isApproveSuccess, currentStep, submitAnswer, opinionId, answer, description, link])

  // Handle submit success
  useEffect(() => {
    if (isSubmitSuccess && currentStep === 'submit') {
      handleTransactionSuccess()
    }
    
    if (isSubmitError && submitError) {
      handleError(submitError, 'Transaction submission')
    }
  }, [isSubmitSuccess, isSubmitError, isSubmitPending, submitError, currentStep])

  // CRITICAL: Only reset form on SUCCESS or manual close (preserve data on error)
  const resetForm = () => {
    setFormData({
      answer: '',
      description: '',
      externalLink: '',
      acceptedTerms: false
    })
    setErrors({})
    setErrorState(null)
    setShowContextFields(false)
    setIsReviving(false)
    setShowAllAnswers(false)
  }

  useEffect(() => {
    if (!isOpen) {
      // Only reset if not coming from an error state
      if (currentStep !== 'error') {
        resetForm()
      }
      setCurrentStep('form')
      setIsSubmitting(false)
    }
  }, [isOpen, currentStep])

  // Calculate stats
  const change = calculateChange(opinionData.nextPrice, opinionData.lastPrice)
  const hasBalance = balance ? balance >= opinionData.nextPrice : false
  const needsApproval = !allowance || allowance < opinionData.nextPrice

  // Fee breakdown toggle
  const [showFees, setShowFees] = useState(false)

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            >
              <div className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl">

                {/* Header: Question as title + close */}
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
                    <button
                      onClick={onClose}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Current answer - compact */}
                  <div className="flex items-center gap-2 py-2.5 px-3 bg-muted/50 rounded-lg mb-4">
                    <span className="text-xs text-muted-foreground">Current answer:</span>
                    <span className="text-sm font-semibold text-foreground truncate">{opinionData.currentAnswer}</span>
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">by {formatAddress(opinionData.currentAnswerOwner)}</span>
                  </div>

                  {/* Price block */}
                  <div className="flex items-center justify-center gap-3 py-4 mb-4 border border-border/50 rounded-xl bg-muted/20">
                    <span className="text-3xl font-black text-foreground">{formatUSDC(opinionData.nextPrice)}</span>
                    <span className="text-xs text-muted-foreground">USDC</span>
                    <span className={`${
                      change.isPositive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    } px-2.5 py-1 rounded-full text-xs font-semibold`}>
                      {change.isPositive ? '+' : '-'}{change.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Content area */}
                <div className="px-5 pb-5 space-y-4">

                  {/* Balance Warning */}
                  <BalanceWarning
                    requiredAmount={opinionData.nextPrice}
                    currentBalance={balance}
                  />

                  {/* Form or Transaction States */}
                  {currentStep === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-4">

                      {/* Answer Revival - compact horizontal scroll */}
                      {revivalOptions.length > 0 && !isLoadingHistory && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick Revival</span>
                            {totalUniqueAnswers > 1 && (
                              <span className="text-xs text-muted-foreground">
                                {totalUniqueAnswers - 1} past {totalUniqueAnswers === 2 ? 'answer' : 'answers'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {revivalOptions.map((entry, index) => {
                              const isSelected = isReviving && answer === entry.answer
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleRevivalSelect(entry)}
                                  className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150
                                    ${isSelected
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                      : 'bg-muted/50 border-border text-foreground hover:border-emerald-500/30'
                                    }
                                  `}
                                >
                                  {entry.answer}
                                  {entry.submissionCount > 1 && (
                                    <span className="text-xs text-muted-foreground ml-1">({entry.submissionCount}x)</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>

                          {/* Show More */}
                          {hasMoreAnswers && (
                            <button
                              type="button"
                              onClick={() => setShowAllAnswers(!showAllAnswers)}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                              {showAllAnswers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {showAllAnswers ? 'Show less' : `+${Math.min(allRevivalOptions.length - DEFAULT_VISIBLE, 10)} more`}
                            </button>
                          )}

                          {/* Revival confirmation */}
                          {isReviving && (
                            <div className="flex items-center justify-between py-2 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm">
                              <span className="text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Reviving: <strong>{answer}</strong>
                              </span>
                              <button type="button" onClick={handleNewAnswer} className="text-xs text-muted-foreground hover:text-red-400">Clear</button>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className="flex-1 border-t border-border" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or submit new</span>
                            <div className="flex-1 border-t border-border" />
                          </div>
                        </div>
                      )}

                      {/* Answer Input */}
                      <div className="space-y-1.5">
                        <Label htmlFor="answer" className="text-foreground font-medium text-sm">
                          Your Answer
                        </Label>
                        <Textarea
                          id="answer"
                          value={answer}
                          onChange={(e) => updateFormField('answer', e.target.value)}
                          placeholder="Enter your answer..."
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none"
                          rows={2}
                          maxLength={ANSWER_LIMIT}
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-red-400">{errors.answer}</span>
                          <span className={`${answer.length > ANSWER_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                            {answer.length}/{ANSWER_LIMIT}
                          </span>
                        </div>
                      </div>

                      {/* Collapsible Context Fields */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowContextFields(!showContextFields)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showContextFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>Add context (optional)</span>
                          {(description || link) && !showContextFields && (
                            <span className="text-emerald-400">•</span>
                          )}
                        </button>

                        <AnimatePresence>
                          {showContextFields && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden space-y-3 mt-3"
                            >
                              <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-foreground font-medium text-sm">Description</Label>
                                <Textarea
                                  id="description"
                                  value={description}
                                  onChange={(e) => updateFormField('description', e.target.value)}
                                  placeholder="Add context or explanation..."
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none"
                                  rows={2}
                                  maxLength={DESCRIPTION_LIMIT}
                                />
                                <div className="flex justify-between text-xs">
                                  <span className="text-red-400">{errors.description}</span>
                                  <span className={`${description.length > DESCRIPTION_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                                    {description.length}/{DESCRIPTION_LIMIT}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="link" className="text-foreground font-medium text-sm">External Link</Label>
                                <Input
                                  id="link"
                                  type="url"
                                  value={link}
                                  onChange={(e) => updateFormField('externalLink', e.target.value)}
                                  placeholder="https://example.com"
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500"
                                />
                                <span className="text-red-400 text-xs">{errors.link}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Content Quality Warning */}
                      {contentWarning && (
                        <Alert className="bg-yellow-900/20 border-yellow-500/50">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-400 text-sm">{contentWarning}</AlertDescription>
                        </Alert>
                      )}

                      {/* USDC Approval Info */}
                      <AllowanceInfo
                        requiredAmount={opinionData.nextPrice}
                        currentAllowance={allowance}
                        useInfiniteApproval={useInfiniteApproval}
                        onApprovalTypeChange={setUseInfiniteApproval}
                      />

                      {/* Fee breakdown - collapsed */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowFees(!showFees)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Fees: 5% total (3% creator + 2% platform)</span>
                          {showFees ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                        </button>
                        <AnimatePresence>
                          {showFees && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                                <div className="flex justify-between">
                                  <span>Previous owner (95%)</span>
                                  <span className="text-foreground font-medium">{formatUSDC(opinionData.nextPrice * BigInt(95) / BigInt(100))}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Creator royalty (3%)</span>
                                  <span className="text-foreground font-medium">{formatUSDC(opinionData.nextPrice * BigInt(3) / BigInt(100))}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Platform fee (2%)</span>
                                  <span className="text-foreground font-medium">{formatUSDC(opinionData.nextPrice * BigInt(2) / BigInt(100))}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Trade button - full width */}
                      <Button
                        type="submit"
                        disabled={!hasBalance || isSubmitting || !acceptedTerms}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-base disabled:opacity-50 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200"
                      >
                        {needsApproval
                          ? (useInfiniteApproval ? 'Approve & Trade' : 'Approve & Trade')
                          : 'Trade'
                        }
                      </Button>

                      {/* Terms - inline link */}
                      <div className="flex items-center justify-center gap-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => updateFormField('acceptedTerms', checked as boolean)}
                          className="border-border data-[state=checked]:bg-emerald-500 w-3.5 h-3.5"
                        />
                        <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                          I agree to the{' '}
                          <a href="#" className="text-emerald-500 hover:text-emerald-400 underline">Terms of Use</a>
                        </label>
                      </div>
                      {errors.terms && <span className="text-red-400 text-xs text-center block">{errors.terms}</span>}
                    </form>
                  )}

                  {/* Transaction States */}
                  {['approve', 'submit'].includes(currentStep) && (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {currentStep === 'approve' ? 'Approve USDC' : 'Submitting Answer'}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {currentStep === 'approve'
                            ? 'Please confirm the approval in your wallet'
                            : 'Please confirm the transaction in your wallet'
                          }
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        This may take 10-30 seconds
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {currentStep === 'success' && (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Success!</h3>
                        <p className="text-muted-foreground mb-4 text-sm">Your answer has been submitted.</p>
                        <Button
                          onClick={onClose}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-8"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {currentStep === 'error' && errorState && (
                    <ErrorState
                      error={errorState}
                      onRetry={() => {
                        setCurrentStep('form')
                        setErrorState(null)
                        setIsSubmitting(false)
                      }}
                      onBack={() => {
                        setCurrentStep('form')
                        setErrorState(null)
                        setIsSubmitting(false)
                      }}
                      onClose={onClose}
                      showTechnicalDetails={true}
                    />
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