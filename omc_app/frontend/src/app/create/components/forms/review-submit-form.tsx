'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  DollarSign,
  FileText,
  Link,
  Info,
  Lightbulb
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { ethers } from 'ethers'

interface ReviewSubmitFormProps {
  formData: {
    question: string
    answer: string
    category: string
    categories: string[]
    initialPrice: number
    description: string
    externalLink: string
    tags: string[]
  }
  onPrevious: () => void
  onSuccess: (opinionId?: number) => void
}

interface ErrorState {
  type: 'network' | 'contract' | 'wallet' | 'validation' | 'unknown'
  message: string
  retryable: boolean
  details?: string
}

export function ReviewSubmitForm({ formData, onPrevious, onSuccess }: ReviewSubmitFormProps) {
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'review' | 'approve' | 'submit' | 'success' | 'error'>('review')
  const [errorState, setErrorState] = useState<ErrorState | null>(null)
  const [useInfiniteApproval, setUseInfiniteApproval] = useState(true)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Correct fee calculation matching smart contract: 20% with 5 USDC minimum
  const calculatedFee = formData.initialPrice * 0.2
  const creationFee = calculatedFee < 5 ? 5 : calculatedFee
  const creationFeeWei = BigInt(Math.round(creationFee * 1_000_000)) // Convert to USDC wei (6 decimals)
  const initialPriceWei = BigInt(Math.round(formData.initialPrice * 1_000_000))

  // Conservative "infinite" approval amount - use a reasonable large number
  // Equivalent to 1 million USDC (6 decimals) - should be enough for any reasonable use
  const INFINITE_APPROVAL = BigInt('1000000000000') // 1 million USDC in wei (1M * 10^6)

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
  const { writeContract: approveUSDC, data: approveHash, error: approveError } = useWriteContract()
  const { writeContract: createOpinion, data: createHash, error: createError } = useWriteContract()

  // Transaction receipts
  const { isSuccess: isApproveSuccess, error: approveReceiptError } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: isCreateSuccess, error: createReceiptError } = useWaitForTransactionReceipt({ hash: createHash })

  // Format functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Error handling
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`❌ ${context}:`, error)
    console.error('Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      cause: (error as Record<string, unknown>)?.cause,
      code: (error as Record<string, unknown>)?.code,
      data: (error as Record<string, unknown>)?.data
    })
    
    let errorState: ErrorState
    const errorMessage = (error as Error)?.message || 'Unknown error'
    
    if ((error as Error)?.name === 'UserRejectedRequestError') {
      errorState = {
        type: 'wallet',
        message: 'Transaction rejected by wallet',
        retryable: true,
        details: 'Please approve the transaction in your wallet to continue.'
      }
    } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('exceeds balance')) {
      errorState = {
        type: 'wallet',
        message: 'Insufficient USDC balance',
        retryable: false,
        details: `You need ${formatUSDC(creationFeeWei)} USDC. You have ${balance ? formatUSDC(balance) : '$0.00'}.`
      }
    } else if (errorMessage.includes('execution reverted')) {
      // Extract revert reason if available
      const revertReason = errorMessage.match(/execution reverted: (.+)/)?.[1] || 'Unknown contract error'
      errorState = {
        type: 'contract',
        message: 'Smart contract error',
        retryable: true,
        details: `Contract error: ${revertReason}`
      }
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      errorState = {
        type: 'network',
        message: 'Network congestion detected',
        retryable: true,
        details: 'Please try again in a few moments.'
      }
    } else if (errorMessage.includes('UnauthorizedCreator')) {
      errorState = {
        type: 'validation',
        message: 'Not authorized to create opinions',
        retryable: false,
        details: 'Public opinion creation may be disabled.'
      }
    } else if (errorMessage.includes('InvalidInitialPrice')) {
      errorState = {
        type: 'validation',
        message: 'Invalid initial price',
        retryable: false,
        details: 'Initial price must be between 1 and 100 USDC.'
      }
    } else {
      errorState = {
        type: 'unknown',
        message: 'Transaction failed',
        retryable: true,
        details: `Error: ${errorMessage}`
      }
    }
    
    setErrorState(errorState)
    setCurrentStep('error')
    setIsSubmitting(false)
  }, [creationFeeWei, balance, formatUSDC])

  // Handle form submission
  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setErrorState({
        type: 'validation',
        message: 'Please accept the terms',
        retryable: false,
        details: 'You must accept the terms and conditions to continue.'
      })
      return
    }

    if (!address) {
      setErrorState({
        type: 'wallet',
        message: 'Wallet not connected',
        retryable: false,
        details: 'Please connect your wallet to continue.'
      })
      return
    }

    setIsSubmitting(true)
    setErrorState(null)
    
    try {
      // Check if approval is needed
      const needsApproval = !allowance || allowance < creationFeeWei
      
      if (needsApproval) {
        setCurrentStep('approve')
        const approvalAmount = useInfiniteApproval ? INFINITE_APPROVAL : creationFeeWei
        
        console.log('🔄 Attempting USDC approval...')
        console.log('USDC Address:', USDC_ADDRESS)
        console.log('Spender:', CONTRACTS.OPINION_CORE)
        console.log('Amount:', approvalAmount.toString())
        console.log('Amount (formatted):', (Number(approvalAmount) / 1_000_000).toLocaleString())
        
        try {
          await approveUSDC({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [CONTRACTS.OPINION_CORE, approvalAmount]
          })
        } catch (approvalError) {
          console.error('❌ Infinite approval failed, trying exact amount:', approvalError)
          
          // Fallback to exact amount if infinite approval fails
          if (useInfiniteApproval) {
            console.log('🔄 Retrying with exact amount...')
            await approveUSDC({
              address: USDC_ADDRESS,
              abi: USDC_ABI,
              functionName: 'approve',
              args: [CONTRACTS.OPINION_CORE, creationFeeWei]
            })
          } else {
            throw approvalError
          }
        }
      } else {
        setCurrentStep('submit')
        // Use createOpinion function (it accepts description parameter)
        await createOpinion({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'createOpinion',
          args: [
            formData.question,
            formData.answer,
            formData.description || '',
            initialPriceWei,
            formData.categories
          ]
        })
      }
    } catch (error) {
      handleError(error, 'Form submission')
    }
  }

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && currentStep === 'approve') {
      setCurrentStep('submit')
      try {
        // Use createOpinion function (it accepts description parameter)
        console.log('🔄 Starting createOpinion transaction...')
        console.log('Contract Address:', CONTRACTS.OPINION_CORE)
        console.log('Form Data:', formData)
        console.log('Initial Price Wei:', initialPriceWei.toString())
        console.log('Creation Fee Wei:', creationFeeWei.toString())
        console.log('User Balance:', balance ? (Number(balance) / 1_000_000).toFixed(6) : '0', 'USDC')
        console.log('User Allowance:', allowance ? (Number(allowance) / 1_000_000).toFixed(6) : '0', 'USDC')
        
        console.log('Using createOpinion function')
        console.log('Arguments:', [
          formData.question,
          formData.answer,
          formData.description || '',
          initialPriceWei.toString(),
          formData.categories
        ])
        
        createOpinion({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'createOpinion',
          args: [
            formData.question,
            formData.answer,
            formData.description || '',
            initialPriceWei,
            formData.categories
          ]
        })
      } catch (error) {
        console.error('❌ Error in createOpinion setup:', error)
        handleError(error, 'Create after approval')
      }
    }
  }, [isApproveSuccess, currentStep, createOpinion, formData, initialPriceWei, creationFeeWei, balance, allowance, handleError])

  // Handle create success
  useEffect(() => {
    if (isCreateSuccess && createData && currentStep === 'submit') {
      setCurrentStep('success')
      setIsSubmitting(false)
      
      // Extract opinion ID from transaction receipt
      const extractOpinionId = async () => {
        try {
          if (createData) {
            // The createData contains the transaction hash, we need the receipt to get events
            console.log('🔍 Transaction successful, extracting opinion ID from receipt...')
            console.log('Transaction hash:', createData)
            
            // Get transaction receipt to access events
            const receipt = await createData.wait?.()
            if (receipt && receipt.logs) {
              console.log('📋 Transaction receipt logs:', receipt.logs)
              
              // Look for OpinionAction event with actionType 0 (create)
              // The contract emits OpinionAction(opinionId, 0, question, creator, initialPrice)
              for (const log of receipt.logs) {
                try {
                  // Parse log as OpinionAction event
                  const interface_ = new ethers.Interface(OPINION_CORE_ABI)
                  const parsedLog = interface_.parseLog({ topics: log.topics, data: log.data })
                  
                  if (parsedLog && parsedLog.name === 'OpinionAction' && parsedLog.args.actionType === 0) {
                    const opinionId = Number(parsedLog.args.opinionId)
                    console.log('✅ Opinion created with ID:', opinionId)
                    
                    setTimeout(() => {
                      onSuccess(opinionId)
                    }, 2000)
                    return
                  }
                } catch (parseError) {
                  // Ignore parsing errors for other events
                }
              }
            }
          }
          
          // Fallback: call onSuccess without opinion ID
          console.log('⚠️ Could not extract opinion ID, proceeding without redirect')
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } catch (error) {
          console.error('❌ Error extracting opinion ID:', error)
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }
      }
      
      extractOpinionId()
    }
  }, [isCreateSuccess, createData, currentStep, onSuccess])

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      console.error('❌ Approval error:', approveError)
      handleError(approveError, 'USDC Approval')
    }
  }, [approveError, handleError])

  // Handle create transaction errors
  useEffect(() => {
    if (createError) {
      console.error('❌ Create transaction error:', createError)
      handleError(createError, 'Create Opinion Transaction')
    }
  }, [createError, handleError])

  // Handle approval receipt errors
  useEffect(() => {
    if (approveReceiptError) {
      console.error('❌ Approval receipt error:', approveReceiptError)
      handleError(approveReceiptError, 'Approval Transaction Receipt')
    }
  }, [approveReceiptError, handleError])

  // Handle create receipt errors
  useEffect(() => {
    if (createReceiptError) {
      console.error('❌ Create receipt error:', createReceiptError)
      handleError(createReceiptError, 'Create Opinion Transaction Receipt')
    }
  }, [createReceiptError, handleError])

  // Check balances - need enough for creation fee (not initial price)
  const hasBalance = balance ? balance >= creationFeeWei : false
  const needsApproval = !allowance || allowance < creationFeeWei

  if (currentStep === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Opinion Created!</h2>
          <p className="text-gray-400 text-lg mb-2">
            Your opinion has been successfully created and is now live on the platform.
          </p>
          <p className="text-blue-400 text-sm">
            🚀 Redirecting you to your new opinion page in 2 seconds...
          </p>
        </div>
        <Card className="bg-emerald-900/20 border-emerald-500/30">
          <CardContent className="p-6">
            <p className="text-emerald-400 font-medium">
              &ldquo;{formData.question}&rdquo;
            </p>
            <p className="text-white text-lg mt-2">
              Initial Answer: {formData.answer}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (['approve', 'submit'].includes(currentStep)) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {currentStep === 'approve' ? 'Approve USDC' : 'Creating Opinion'}
          </h3>
          <p className="text-gray-400">
            {currentStep === 'approve' 
              ? 'Please confirm the approval in your wallet' 
              : 'Please confirm the transaction in your wallet'
            }
          </p>
        </div>
        <p className="text-sm text-gray-500">This may take 10-30 seconds</p>
      </div>
    )
  }

  if (currentStep === 'error') {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {errorState?.message || 'Transaction Failed'}
          </h3>
          <p className="text-gray-400 mb-4">
            {errorState?.details || 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep('review')
                setErrorState(null)
                setIsSubmitting(false)
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Back to Review
            </Button>
            {errorState?.retryable && (
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Review & Submit</h2>
          <p className="text-gray-400">Review your opinion before submitting to the blockchain</p>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {/* Question & Answer */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-500" />
              Question & Answer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-400 mb-1">Question</p>
              <p className="text-white font-medium">{formData.question}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Your Answer</p>
              <p className="text-emerald-400 font-medium">{formData.answer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Categories</p>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-400">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price & Fee */}
        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Initial Price:</span>
              <span className="text-white font-medium">${formData.initialPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                Creation Fee {creationFee === 5 ? '(5 USDC Min)' : '(20%)'}:
              </span>
              <span className="text-yellow-400 font-medium">${creationFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">You Pay:</span>
                <span className="text-emerald-400">${creationFee.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info (if provided) */}
        {(formData.description || formData.externalLink) && (
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.description && (
                <div>
                  <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Description
                  </p>
                  <p className="text-white">{formData.description}</p>
                </div>
              )}
              {formData.externalLink && (
                <div>
                  <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    External Link (Note: Not stored on-chain)
                  </p>
                  <a 
                    href={formData.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all"
                  >
                    {formData.externalLink}
                  </a>
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ External links are not stored on the blockchain
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Balance Warning */}
      {!hasBalance && (
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-400">
            Insufficient USDC balance. You need ${creationFee.toFixed(2)} USDC to create this opinion. You have ${balance ? (Number(balance) / 1_000_000).toFixed(6) : '0'} USDC.
          </AlertDescription>
        </Alert>
      )}

      {/* USDC Approval Info */}
      {needsApproval && hasBalance && (
        <Card className="bg-yellow-900/20 border-yellow-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              USDC Approval Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <p>You need to approve USDC spending for opinion creation.</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="infinite-approval"
                checked={useInfiniteApproval}
                onCheckedChange={(checked) => setUseInfiniteApproval(checked as boolean)}
                className="border-gray-700 data-[state=checked]:bg-yellow-500"
              />
              <Label htmlFor="infinite-approval" className="text-sm text-gray-300">
                Large approval for future transactions (1M USDC)
              </Label>
            </div>
            {useInfiniteApproval ? (
              <p className="text-xs text-yellow-400">
                ✅ Recommended: Approve 1 million USDC for all future opinions and trades
              </p>
            ) : (
              <p className="text-xs text-yellow-500">
                ⚠️ You&apos;ll need to approve each transaction individually
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Terms & Conditions */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          className="border-gray-700 data-[state=checked]:bg-emerald-500 mt-1"
        />
        <Label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
          I accept the{' '}
          <a href="#" className="text-emerald-400 hover:text-emerald-300">
            terms and conditions
          </a>{' '}
          and understand that creating an opinion requires paying a creation fee (20% of initial price with 5 USDC minimum).
        </Label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Additional Info
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={!hasBalance || isSubmitting || !acceptedTerms}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 disabled:opacity-50"
        >
          {needsApproval 
            ? (useInfiniteApproval ? 'Approve Once & Create' : 'Approve & Create')
            : 'Create Opinion'
          }
        </Button>
      </div>
    </div>
  )
}