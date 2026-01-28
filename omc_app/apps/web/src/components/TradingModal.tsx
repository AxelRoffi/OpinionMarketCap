'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { 
  X, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'

import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { parseTransactionError, validateAnswerInputs, type ParsedError } from '@/lib/errors'
import { validateAnswerForTrading } from '@/lib/contentFiltering'
import { ErrorState, BalanceWarning, AllowanceInfo } from '@/components/transaction'

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
              <div className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card rounded-lg sm:rounded-2xl border border-border shadow-2xl">
                
                {/* Header - UPDATED: Removed "Created by" */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Submit Your Answer</h2>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Question Section - NEW HIERARCHY */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-4">
                    {/* Question Section */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">question</p>
                      <div className="mb-3">
                        <span className="text-base sm:text-lg font-bold text-foreground break-words">{opinionData.question}</span>
                        <span className="text-muted-foreground text-sm sm:text-lg block sm:inline"> created by {formatAddress(opinionData.creator)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        {opinionData.categories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-400">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Answer Section */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">answer</p>
                      <div className="mb-4">
                        <span className="text-base sm:text-lg font-bold text-foreground break-words">{opinionData.currentAnswer}</span>
                        <span className="text-muted-foreground text-sm sm:text-lg block sm:inline"> owned by {formatAddress(opinionData.currentAnswerOwner)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="bg-muted/50 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-lg font-bold text-foreground">
                          {formatUSDC(opinionData.nextPrice)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          24h Change
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className={`text-lg font-bold ${change.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {change.isPositive ? '+' : '-'}{change.percentage.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Total Volume
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-lg font-bold text-foreground">
                          {formatUSDC(opinionData.totalVolume)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Trades
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-lg font-bold text-foreground">
                          {opinionData.tradesCount || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Balance Warning - Using new component */}
                  <BalanceWarning
                    requiredAmount={opinionData.nextPrice}
                    currentBalance={balance}
                  />

                  {/* Form or Transaction States */}
                  {currentStep === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Answer Input */}
                      <div className="space-y-2">
                        <Label htmlFor="answer" className="text-foreground font-medium">
                          Your Answer *
                        </Label>
                        <Textarea
                          id="answer"
                          value={answer}
                          onChange={(e) => updateFormField('answer', e.target.value)}
                          placeholder="Enter your answer..."
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none"
                          rows={3}
                          maxLength={ANSWER_LIMIT}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-red-400">{errors.answer}</span>
                          <span className={`${answer.length > ANSWER_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                            {answer.length}/{ANSWER_LIMIT}
                          </span>
                        </div>
                      </div>

                      {/* Description Input */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground font-medium">
                          Description (optional)
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => updateFormField('description', e.target.value)}
                          placeholder="Add context or explanation..."
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500 resize-none"
                          rows={2}
                          maxLength={DESCRIPTION_LIMIT}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-red-400">{errors.description}</span>
                          <span className={`${description.length > DESCRIPTION_LIMIT * 0.8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                            {description.length}/{DESCRIPTION_LIMIT}
                          </span>
                        </div>
                      </div>

                      {/* Link Input */}
                      <div className="space-y-2">
                        <Label htmlFor="link" className="text-foreground font-medium">
                          External Link (optional)
                        </Label>
                        <Input
                          id="link"
                          type="url"
                          value={link}
                          onChange={(e) => updateFormField('externalLink', e.target.value)}
                          placeholder="https://example.com"
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500"
                        />
                        <span className="text-red-400 text-sm">{errors.link}</span>
                      </div>

                      {/* Content Quality Warning */}
                      {contentWarning && (
                        <Alert className="bg-yellow-900/20 border-yellow-500/50">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-400">
                            {contentWarning}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* USDC Approval Info - Using new component */}
                      <AllowanceInfo
                        requiredAmount={opinionData.nextPrice}
                        currentAllowance={allowance}
                        useInfiniteApproval={useInfiniteApproval}
                        onApprovalTypeChange={setUseInfiniteApproval}
                      />

                      {/* Trading Info - Fee Breakdown */}
                      <Card className="bg-blue-soft border-blue-500/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-blue-soft-foreground flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Payment Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                          <p>You pay <span className="text-foreground font-semibold">{formatUSDC(opinionData.nextPrice)}</span> to submit your answer:</p>

                          <div className="bg-emerald-soft rounded-lg p-3 border border-emerald-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-emerald-soft-foreground font-medium">Previous Owner</span>
                              <span className="text-emerald-soft-foreground font-semibold">{formatUSDC(opinionData.nextPrice * BigInt(95) / BigInt(100))} (95%)</span>
                            </div>
                            <p className="text-xs text-emerald-soft-foreground/70">Sent directly to their wallet instantly</p>
                          </div>

                          <div className="bg-purple-soft rounded-lg p-3 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-purple-soft-foreground font-medium">Creator Royalty</span>
                              <span className="text-purple-soft-foreground font-semibold">{formatUSDC(opinionData.nextPrice * BigInt(3) / BigInt(100))} (3%)</span>
                            </div>
                            <p className="text-xs text-purple-soft-foreground/70">Accumulated in contract, creator can claim anytime</p>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-3 border border-border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-muted-foreground font-medium">Platform Fee</span>
                              <span className="text-muted-foreground font-semibold">{formatUSDC(opinionData.nextPrice * BigInt(2) / BigInt(100))} (2%)</span>
                            </div>
                            <p className="text-xs text-muted-foreground/70">Goes to OMC treasury</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Terms Checkbox */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => updateFormField('acceptedTerms', checked as boolean)}
                          className="border-border data-[state=checked]:bg-emerald-500"
                        />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground">
                          I accept the{' '}
                          <a href="#" className="text-emerald-500 hover:text-emerald-400">
                            terms and conditions
                          </a>
                        </Label>
                      </div>
                      {errors.terms && <span className="text-red-400 text-sm">{errors.terms}</span>}

                      {/* Submit Button - Mobile-Optimized */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          className="w-full sm:flex-1 h-12 sm:h-10 border-border text-muted-foreground hover:bg-muted text-base"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={!hasBalance || isSubmitting}
                          className="w-full sm:flex-1 h-12 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium disabled:opacity-50 text-base"
                        >
                          {needsApproval
                            ? (useInfiniteApproval ? 'Approve Once & Submit' : 'Approve & Submit')
                            : 'Submit & Trade'
                          }
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Transaction States */}
                  {['approve', 'submit'].includes(currentStep) && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {currentStep === 'approve' ? 'Approve USDC' : 'Submitting Answer'}
                        </h3>
                        <p className="text-muted-foreground">
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
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Success!</h3>
                        <p className="text-muted-foreground mb-4">
                          Your answer has been submitted successfully!
                        </p>
                        <Button
                          onClick={onClose}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Error State - Using new ErrorState component */}
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