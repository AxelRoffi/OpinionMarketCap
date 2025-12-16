'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { 
  X, 
  AlertTriangle, 
  Loader2,
  CheckCircle,
  Tag
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts'
import { toast } from 'sonner'

interface OpinionData {
  id: number
  question: string
  salePrice: bigint
  questionOwner: string
}

interface CancelListingModalProps {
  isOpen: boolean
  onClose: () => void
  opinionData: OpinionData
  onSuccess?: () => void
}

export default function CancelListingModal({ 
  isOpen, 
  onClose, 
  opinionData, 
  onSuccess 
}: CancelListingModalProps) {
  const { address } = useAccount()
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<'confirm' | 'canceling' | 'success' | 'error'>('confirm')

  const { writeContract: cancelListing, data: cancelHash } = useWriteContract()
  const { isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash })

  // Format functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleCancel = async () => {
    if (!address) {
      setError('Please connect your wallet')
      return
    }
    if (address.toLowerCase() !== opinionData.questionOwner.toLowerCase()) {
      setError('Only the question owner can cancel the listing')
      return
    }

    try {
      setCurrentStep('canceling')
      
      await cancelListing({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'cancelQuestionSale',
        args: [BigInt(opinionData.id)]
      })

    } catch (error: any) {
      console.error('Cancel listing error:', error)
      setCurrentStep('error')
      setError(error.message || 'Failed to cancel listing')
      
      toast.error('Cancel failed', {
        description: error.message || 'Failed to cancel listing',
        duration: 5000,
      })
    }
  }

  // Handle successful cancel
  useEffect(() => {
    if (isCancelSuccess && currentStep === 'canceling') {
      setCurrentStep('success')
      toast.success('Listing canceled!', {
        description: 'Your question has been removed from the marketplace',
        duration: 5000,
      })
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    }
  }, [isCancelSuccess, currentStep, onSuccess, onClose])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      setCurrentStep('confirm')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Check if can cancel
  const canCancel = address?.toLowerCase() === opinionData.questionOwner.toLowerCase() && 
                    opinionData.salePrice > 0

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
            <Tag className="w-5 h-5 text-red-400" />
            Cancel Listing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Details */}
        <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700/40 rounded-lg">
          <h3 className="text-white font-medium mb-2">{opinionData.question}</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Currently listed for:</span>
            <span className="text-emerald-400 font-semibold">{formatUSDC(opinionData.salePrice)}</span>
          </div>
        </div>

        {/* Access control check */}
        {!canCancel && (
          <Alert className="mb-4 border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {address?.toLowerCase() !== opinionData.questionOwner.toLowerCase() 
                ? 'Only the question owner can cancel this listing'
                : 'This question is not currently listed for sale'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation Step */}
        {canCancel && currentStep === 'confirm' && (
          <div className="space-y-4">
            <Alert className="border-orange-500/20 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                This will remove your question from the marketplace. You can list it again later if you change your mind.
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
                Keep Listed
              </Button>
              <Button 
                onClick={handleCancel}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                Cancel Listing
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {currentStep === 'canceling' && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Canceling Listing...</h3>
            <p className="text-gray-400">Please confirm the transaction in your wallet</p>
          </div>
        )}

        {/* Success State */}
        {currentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Listing Canceled!</h3>
            <p className="text-gray-400">Your question has been removed from the marketplace</p>
          </div>
        )}

        {/* Error State */}
        {currentStep === 'error' && (
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Cancel Failed</h3>
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