'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import confetti from 'canvas-confetti'

import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { parseTransactionError, validateAnswerInputs, type ParsedError } from '@/lib/errors'
import { validateAnswerForTrading } from '@/lib/contentFiltering'
import {
  useAnswerHistory,
  type RankedAnswer
} from '@/hooks/useAnswerHistory'

export interface TradingOpinionData {
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
  tradesCount?: number
}

interface FormData {
  answer: string
  description: string
  externalLink: string
  acceptedTerms: boolean
}

export interface UseTradingFlowReturn {
  // Form state
  formData: FormData
  updateFormField: (field: keyof FormData, value: string | boolean) => void
  errors: Record<string, string>
  contentWarning: string | null

  // Transaction state
  currentStep: 'form' | 'approve' | 'submit' | 'success' | 'error'
  isSubmitting: boolean
  errorState: ParsedError | null

  // Contract reads
  balance: bigint | undefined
  allowance: bigint | undefined
  hasBalance: boolean
  needsApproval: boolean

  // Revival
  revivalOptions: RankedAnswer[]
  allRevivalOptions: RankedAnswer[]
  totalUniqueAnswers: number
  isReviving: boolean
  isLoadingHistory: boolean
  hasMoreAnswers: boolean

  // UI toggles
  showContextFields: boolean
  setShowContextFields: (v: boolean) => void
  showAllAnswers: boolean
  setShowAllAnswers: (v: boolean) => void
  showFees: boolean
  setShowFees: (v: boolean) => void
  useInfiniteApproval: boolean
  setUseInfiniteApproval: (v: boolean) => void

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleRevivalSelect: (entry: RankedAnswer) => void
  handleNewAnswer: () => void
  resetForm: () => void
  retryFromError: () => void

  // Computed
  change: { percentage: number; isPositive: boolean }

  // Constants
  ANSWER_LIMIT: number
  DESCRIPTION_LIMIT: number

  // Utilities
  formatUSDC: (wei: bigint) => string
}

const DEFAULT_VISIBLE = 5
const ANSWER_LIMIT = 60
const DESCRIPTION_LIMIT = 120
const INFINITE_APPROVAL = BigInt('1000000000000') // 1M USDC

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
}

export function useTradingFlow(
  opinionId: number,
  opinionData: TradingOpinionData
): UseTradingFlowReturn {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // Form state
  const [formData, setFormData] = useState<FormData>({
    answer: '',
    description: '',
    externalLink: '',
    acceptedTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentWarning, setContentWarning] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'form' | 'approve' | 'submit' | 'success' | 'error'>('form')
  const [errorState, setErrorState] = useState<ParsedError | null>(null)
  const [useInfiniteApproval, setUseInfiniteApproval] = useState(true)
  const [showContextFields, setShowContextFields] = useState(false)
  const [isReviving, setIsReviving] = useState(false)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [showFees, setShowFees] = useState(false)

  // Answer history
  const { rankedAnswers, totalUniqueAnswers, isLoading: isLoadingHistory } = useAnswerHistory(opinionId)

  const allRevivalOptions = rankedAnswers.filter(
    (entry) => entry.answer.toLowerCase().trim() !== opinionData.currentAnswer.toLowerCase().trim()
  )
  const revivalOptions = showAllAnswers
    ? allRevivalOptions.slice(0, 15)
    : allRevivalOptions.slice(0, DEFAULT_VISIBLE)
  const hasMoreAnswers = allRevivalOptions.length > DEFAULT_VISIBLE

  const { answer, description, externalLink: link, acceptedTerms } = formData

  // Contract reads
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

  // Contract writes
  const {
    writeContract: approveUSDC,
    data: approveHash,
    error: approveError,
  } = useWriteContract()

  const {
    writeContract: submitAnswer,
    data: submitHash,
    error: submitError,
  } = useWriteContract()

  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({ hash: submitHash })

  const isSubmitError = !!submitError

  // Utilities
  const formatUSDC = useCallback((wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [])

  const calculateChange = (current: bigint, last: bigint) => {
    if (last === BigInt(0)) return { percentage: 0, isPositive: true }
    const diff = Number(current - last)
    const percentage = (diff / Number(last)) * 100
    return { percentage: Math.abs(percentage), isPositive: diff >= 0 }
  }

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const validation = validateAnswerInputs({ answer, description, link })

    if (!validation.valid) {
      for (const error of validation.errors) {
        if (error.title.toLowerCase().includes('answer')) newErrors.answer = error.message
        else if (error.title.toLowerCase().includes('description')) newErrors.description = error.message
        else if (error.title.toLowerCase().includes('link') || error.title.toLowerCase().includes('url')) newErrors.link = error.message
      }
    }

    if (!newErrors.answer) {
      const spamValidation = validateAnswerForTrading(answer, description)
      if (!spamValidation.valid && spamValidation.error) newErrors.answer = spamValidation.error
    }

    if (!acceptedTerms) newErrors.terms = 'You must accept the terms and conditions'

    setErrors(newErrors)
    setErrorState(null)
    return Object.keys(newErrors).length === 0
  }

  // Error handler
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`${context}:`, error)
    const parsed = parseTransactionError(error)
    setErrorState(parsed)
    setCurrentStep('error')
    setIsSubmitting(false)
  }, [])

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!address) {
      setErrorState({ type: 'validation_error', title: 'Wallet Not Connected', message: 'Please connect your wallet to continue.', retryable: false })
      return
    }

    setIsSubmitting(true)
    setErrorState(null)

    try {
      const needsApprovalNow = !allowance || allowance < opinionData.nextPrice
      if (needsApprovalNow) {
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

  // Form field updates
  const updateFormField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    if (field === 'answer') setIsReviving(false)
  }

  // Revival
  const handleRevivalSelect = (entry: RankedAnswer) => {
    setFormData(prev => ({ ...prev, answer: entry.answer, description: entry.description || '' }))
    setIsReviving(true)
    setShowContextFields(!!entry.description)
    setErrors({})
  }

  const handleNewAnswer = () => {
    setFormData(prev => ({ ...prev, answer: '', description: '', externalLink: '' }))
    setIsReviving(false)
    setShowContextFields(false)
  }

  const resetForm = () => {
    setFormData({ answer: '', description: '', externalLink: '', acceptedTerms: false })
    setErrors({})
    setErrorState(null)
    setShowContextFields(false)
    setIsReviving(false)
    setShowAllAnswers(false)
  }

  const retryFromError = () => {
    setCurrentStep('form')
    setErrorState(null)
    setIsSubmitting(false)
  }

  // Content quality check
  useEffect(() => {
    if (answer.length >= 2) {
      const validation = validateAnswerForTrading(answer, description)
      if (validation.warning) setContentWarning(validation.warning)
      else if (!validation.valid && validation.error) setContentWarning(validation.error)
      else setContentWarning(null)
    } else {
      setContentWarning(null)
    }
  }, [answer, description])

  // Approval success -> submit
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
  }, [isApproveSuccess, currentStep, submitAnswer, opinionId, answer, description, link, handleError])

  // Submit success
  useEffect(() => {
    if (isSubmitSuccess && currentStep === 'submit') {
      // Invalidate answer history and opinion data queries to show new answer immediately
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[]
          // Invalidate getAnswerHistory and getOpinionDetails queries for this opinion
          if (key[0] === 'readContract') {
            const config = key[1] as { functionName?: string; args?: unknown[] } | undefined
            if (config?.functionName === 'getAnswerHistory' || config?.functionName === 'getOpinionDetails') {
              const args = config.args as [bigint] | undefined
              return args?.[0] === BigInt(opinionId)
            }
          }
          return false
        }
      })
      resetForm()
      setCurrentStep('success')
      setIsSubmitting(false)
      triggerConfetti()
    }
    if (isSubmitError && submitError) {
      handleError(submitError, 'Transaction submission')
    }
  }, [isSubmitSuccess, isSubmitError, submitError, currentStep, handleError, queryClient, opinionId])

  // Computed
  const change = calculateChange(opinionData.nextPrice, opinionData.lastPrice)
  const hasBalance = balance ? balance >= opinionData.nextPrice : false
  const needsApproval = !allowance || allowance < opinionData.nextPrice

  return {
    formData,
    updateFormField,
    errors,
    contentWarning,
    currentStep,
    isSubmitting,
    errorState,
    balance,
    allowance,
    hasBalance,
    needsApproval,
    revivalOptions,
    allRevivalOptions,
    totalUniqueAnswers,
    isReviving,
    isLoadingHistory,
    hasMoreAnswers,
    showContextFields,
    setShowContextFields,
    showAllAnswers,
    setShowAllAnswers,
    showFees,
    setShowFees,
    useInfiniteApproval,
    setUseInfiniteApproval,
    handleSubmit,
    handleRevivalSelect,
    handleNewAnswer,
    resetForm,
    retryFromError,
    change,
    ANSWER_LIMIT,
    DESCRIPTION_LIMIT,
    formatUSDC,
  }
}
