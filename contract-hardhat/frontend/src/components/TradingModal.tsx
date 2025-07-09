'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { 
  X, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
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
}

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  opinionId: number
  opinionData: OpinionData
}

export function TradingModal({ isOpen, onClose, opinionId, opinionData }: TradingModalProps) {
  const { address } = useAccount()
  
  // Form state
  const [answer, setAnswer] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [currentStep, setCurrentStep] = useState<'form' | 'approve' | 'submit' | 'success' | 'error'>('form')

  // Character limits
  const ANSWER_LIMIT = 40
  const DESCRIPTION_LIMIT = 120

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

  const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  const { writeContract: submitAnswer, data: submitHash } = useWriteContract()

  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({ hash: submitHash })

  // Format functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const calculateChange = (current: bigint, last: bigint) => {
    if (last === 0n) return { percentage: 0, isPositive: true }
    const diff = Number(current - last)
    const percentage = (diff / Number(last)) * 100
    return { percentage: Math.abs(percentage), isPositive: diff >= 0 }
  }

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!answer.trim()) {
      newErrors.answer = 'Answer is required'
    } else if (answer.length > ANSWER_LIMIT) {
      newErrors.answer = `Answer must be ${ANSWER_LIMIT} characters or less`
    }

    if (description.length > DESCRIPTION_LIMIT) {
      newErrors.description = `Description must be ${DESCRIPTION_LIMIT} characters or less`
    }

    if (link && !isValidUrl(link)) {
      newErrors.link = 'Please enter a valid URL'
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!address) return

    setIsSubmitting(true)
    
    try {
      // Check if approval is needed
      const needsApproval = !allowance || allowance < opinionData.nextPrice
      
      if (needsApproval) {
        setCurrentStep('approve')
        await approveUSDC({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.OPINION_CORE, opinionData.nextPrice]
        })
      } else {
        setCurrentStep('submit')
        await submitAnswer({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'submitAnswer',
          args: [BigInt(opinionId), answer.trim(), description.trim()]
        })
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setCurrentStep('error')
    }
  }

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && currentStep === 'approve') {
      setCurrentStep('submit')
      submitAnswer({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'submitAnswer',
        args: [BigInt(opinionId), answer.trim(), description.trim()]
      })
    }
  }, [isApproveSuccess, currentStep, submitAnswer, opinionId, answer, description])

  // Handle submit success
  useEffect(() => {
    if (isSubmitSuccess && currentStep === 'submit') {
      setCurrentStep('success')
      setIsSubmitting(false)
    }
  }, [isSubmitSuccess, currentStep])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnswer('')
      setDescription('')
      setLink('')
      setAcceptedTerms(false)
      setErrors({})
      setCurrentStep('form')
      setIsSubmitting(false)
    }
  }, [isOpen])

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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Submit Your Answer</h2>
                      <p className="text-sm text-gray-400">
                        Created by {formatAddress(opinionData.creator)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Question Section */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {opinionData.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-400">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {opinionData.question}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Current Answer: <span className="text-white font-medium">{opinionData.currentAnswer}</span>
                    </p>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-lg font-bold text-white">
                          {formatUSDC(opinionData.nextPrice)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
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

                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Total Volume
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-lg font-bold text-white">
                          {formatUSDC(opinionData.totalVolume)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Current Owner
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm font-bold text-white">
                          {formatAddress(opinionData.currentAnswerOwner)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Balance Warning */}
                  {!hasBalance && (
                    <Alert className="bg-red-900/20 border-red-500/50">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <AlertDescription className="text-red-400">
                        Insufficient USDC balance. You need {formatUSDC(opinionData.nextPrice)} to submit an answer.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Form or Transaction States */}
                  {currentStep === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Answer Input */}
                      <div className="space-y-2">
                        <Label htmlFor="answer" className="text-white font-medium">
                          Your Answer *
                        </Label>
                        <Textarea
                          id="answer"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Enter your answer..."
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-emerald-500 resize-none"
                          rows={3}
                          maxLength={ANSWER_LIMIT}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-red-400">{errors.answer}</span>
                          <span className={`${answer.length > ANSWER_LIMIT * 0.8 ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {answer.length}/{ANSWER_LIMIT}
                          </span>
                        </div>
                      </div>

                      {/* Description Input */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white font-medium">
                          Description (optional)
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add context or explanation..."
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-emerald-500 resize-none"
                          rows={2}
                          maxLength={DESCRIPTION_LIMIT}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-red-400">{errors.description}</span>
                          <span className={`${description.length > DESCRIPTION_LIMIT * 0.8 ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {description.length}/{DESCRIPTION_LIMIT}
                          </span>
                        </div>
                      </div>

                      {/* Link Input */}
                      <div className="space-y-2">
                        <Label htmlFor="link" className="text-white font-medium">
                          External Link (optional)
                        </Label>
                        <Input
                          id="link"
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://example.com"
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-emerald-500"
                        />
                        <span className="text-red-400 text-sm">{errors.link}</span>
                      </div>

                      {/* Trading Info */}
                      <Card className="bg-blue-900/20 border-blue-500/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            How Trading Works
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-300">
                          <p>• Submit your answer to become the new owner</p>
                          <p>• Pay {formatUSDC(opinionData.nextPrice)} to take ownership</p>
                          <p>• Previous owner receives the payment</p>
                          <p>• Price increases with each trade</p>
                        </CardContent>
                      </Card>

                      {/* Terms Checkbox */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          className="border-gray-700 data-[state=checked]:bg-emerald-500"
                        />
                        <Label htmlFor="terms" className="text-sm text-gray-400">
                          I accept the{' '}
                          <a href="#" className="text-emerald-400 hover:text-emerald-300">
                            terms and conditions
                          </a>
                        </Label>
                      </div>
                      {errors.terms && <span className="text-red-400 text-sm">{errors.terms}</span>}

                      {/* Submit Button */}
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={!hasBalance || isSubmitting}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium disabled:opacity-50"
                        >
                          {needsApproval ? 'Approve & Submit' : 'Submit & Trade'}
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
                        <h3 className="text-lg font-bold text-white mb-2">
                          {currentStep === 'approve' ? 'Approve USDC' : 'Submitting Answer'}
                        </h3>
                        <p className="text-gray-400">
                          {currentStep === 'approve' 
                            ? 'Please confirm the approval in your wallet' 
                            : 'Please confirm the transaction in your wallet'
                          }
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
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
                        <h3 className="text-lg font-bold text-white mb-2">Success!</h3>
                        <p className="text-gray-400 mb-4">
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

                  {/* Error State */}
                  {currentStep === 'error' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Transaction Failed</h3>
                        <p className="text-gray-400 mb-4">
                          Something went wrong. Please try again.
                        </p>
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => setCurrentStep('form')}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
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