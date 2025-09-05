'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi'
import { 
  X, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info,
  DollarSign
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI } from '@/lib/contracts'
import { toast } from 'sonner'

interface OpinionData {
  id: number
  question: string
  salePrice: bigint
  questionOwner: string
  currentAnswer: string
  totalVolume: bigint
}

interface BuyQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  opinionData: OpinionData
  onSuccess?: () => void
}

export default function BuyQuestionModal({ 
  isOpen, 
  onClose, 
  opinionData, 
  onSuccess 
}: BuyQuestionModalProps) {
  const { address } = useAccount()
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<'confirm' | 'buying' | 'success' | 'error'>('confirm')

  const { writeContract: buyQuestion, data: buyHash } = useWriteContract()
  const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  const { isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyHash })
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })

  // Check current USDC allowance
  const { data: allowance } = useReadContract({
    address: CONTRACTS.USDC_TOKEN,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
  })

  // Check USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC_TOKEN,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Format functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleBuy = async () => {
    if (!address) {
      setError('Please connect your wallet')
      return
    }
    if (address.toLowerCase() === opinionData.questionOwner.toLowerCase()) {
      setError('You cannot buy your own question')
      return
    }
    if (!usdcBalance || usdcBalance < opinionData.salePrice) {
      setError('Insufficient USDC balance')
      return
    }

    try {
      setCurrentStep('buying')
      
      // Check if we need to approve USDC spending
      const currentAllowance = allowance || BigInt(0)
      if (currentAllowance < opinionData.salePrice) {
        // First approve USDC spending
        await approveUSDC({
          address: CONTRACTS.USDC_TOKEN,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.OPINION_CORE, opinionData.salePrice]
        })
        
        // Wait for approval to complete before proceeding
        return
      }

      // If we have enough allowance, proceed with purchase
      await buyQuestion({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'buyQuestion',
        args: [BigInt(opinionData.id)]
      })

    } catch (error: any) {
      console.error('Buy question error:', error)
      setCurrentStep('error')
      setError(error.message || 'Failed to buy question')
      
      toast.error('Purchase failed', {
        description: error.message || 'Failed to buy question',
        duration: 5000,
      })
    }
  }

  // Handle successful approval - proceed with purchase
  useEffect(() => {
    if (isApproveSuccess && currentStep === 'buying') {
      // Now proceed with the actual purchase
      const proceedWithPurchase = async () => {
        try {
          await buyQuestion({
            address: CONTRACTS.OPINION_CORE,
            abi: OPINION_CORE_ABI,
            functionName: 'buyQuestion',
            args: [BigInt(opinionData.id)]
          })
        } catch (error: any) {
          console.error('Buy question error:', error)
          setCurrentStep('error')
          setError(error.message || 'Failed to buy question')
        }
      }
      proceedWithPurchase()
    }
  }, [isApproveSuccess, currentStep, buyQuestion, opinionData.id])

  // Handle successful purchase
  useEffect(() => {
    if (isBuySuccess && currentStep === 'buying' && buyHash) {
      setCurrentStep('success')
      toast.success('Question purchased successfully!', {
        description: `Transaction confirmed. You now own this question and will receive future royalties.`,
        duration: 8000,
      })
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 3000)
    }
  }, [isBuySuccess, currentStep, onSuccess, onClose, buyHash])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      setCurrentStep('confirm')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Check if can buy
  const canBuy = address?.toLowerCase() !== opinionData.questionOwner.toLowerCase() && 
                 opinionData.salePrice > 0n

  const hasInsufficientBalance = usdcBalance && usdcBalance < opinionData.salePrice
  const platformFee = Number(opinionData.salePrice) * 0.1 / 1_000_000
  const sellerReceives = Number(opinionData.salePrice) * 0.9 / 1_000_000

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            Buy Question
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Details */}
        <Card className="bg-gray-800/50 border-gray-700/40 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-white text-sm font-medium">{opinionData.question}</p>
              <p className="text-gray-400 text-xs mt-1">Opinion #{opinionData.id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Current Answer</p>
                <p className="text-emerald-400 font-medium">{opinionData.currentAnswer}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Volume</p>
                <p className="text-white font-medium">{formatUSDC(opinionData.totalVolume)}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs">Seller</p>
              <p className="text-blue-400 font-medium text-sm">{formatAddress(opinionData.questionOwner)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Access control check */}
        {!canBuy && (
          <Alert className="mb-4 border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {address?.toLowerCase() === opinionData.questionOwner.toLowerCase() 
                ? 'You cannot buy your own question'
                : 'This question is not available for purchase'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Balance check */}
        {hasInsufficientBalance && (
          <Alert className="mb-4 border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              Insufficient USDC balance. You need {formatUSDC(opinionData.salePrice)} but only have {formatUSDC(usdcBalance || BigInt(0))}.
            </AlertDescription>
          </Alert>
        )}

        {/* Purchase Details */}
        {canBuy && currentStep === 'confirm' && (
          <div className="space-y-4">
            {/* Price Breakdown */}
            <Card className="bg-gray-800/50 border-gray-700/40">
              <CardContent className="p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Purchase Breakdown
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purchase Price:</span>
                    <span className="text-white font-semibold">{formatUSDC(opinionData.salePrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Platform Fee (10%):</span>
                    <span className="text-gray-400">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Seller Receives (90%):</span>
                    <span className="text-gray-400">${sellerReceives.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Alert className="border-purple-500/20 bg-purple-500/10">
              <Info className="h-4 w-4 text-purple-400" />
              <AlertDescription className="text-purple-300">
                <strong>What you'll get:</strong> Full ownership of this question and all future creator royalties from answer submissions.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="border-red-500/20 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBuy}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                disabled={!canBuy || hasInsufficientBalance}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Question
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {currentStep === 'buying' && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Processing Purchase...</h3>
            <p className="text-gray-400">Please confirm the transaction in your wallet</p>
          </div>
        )}

        {/* Success State */}
        {currentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Purchase Successful!</h3>
            <div className="space-y-2">
              <p className="text-gray-400">You now own this question and will receive future royalties</p>
              {buyHash && (
                <div className="text-xs text-gray-500">
                  <p>Transaction confirmed on blockchain</p>
                  <a 
                    href={`https://sepolia.basescan.org/tx/${buyHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View on BaseScan
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {currentStep === 'error' && (
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Purchase Failed</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => setCurrentStep('confirm')}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Try Again
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}