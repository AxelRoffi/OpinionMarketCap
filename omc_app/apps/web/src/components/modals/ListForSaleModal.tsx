'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { 
  X, 
  DollarSign, 
  Tag, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts'
import { toast } from 'sonner'

interface OpinionData {
  id: number
  question: string
  currentAnswer: string
  nextPrice: bigint
  lastPrice: bigint
  totalVolume: bigint
  questionOwner: string
  salePrice: bigint
  isActive: boolean
  creator: string
}

interface ListForSaleModalProps {
  isOpen: boolean
  onClose: () => void
  opinionData: OpinionData
  onSuccess?: () => void
}

export default function ListForSaleModal({ 
  isOpen, 
  onClose, 
  opinionData, 
  onSuccess 
}: ListForSaleModalProps) {
  const { address } = useAccount()
  const [priceInput, setPriceInput] = useState('')
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<'form' | 'listing' | 'success' | 'error'>('form')

  const { writeContract: listQuestion, data: listHash } = useWriteContract()
  const { isSuccess: isListSuccess } = useWaitForTransactionReceipt({ hash: listHash })

  // Format functions
  const formatUSDC = (wei: bigint) => {
    const usdc = Number(wei) / 1_000_000
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Price validation
  const validatePrice = () => {
    const price = parseFloat(priceInput)
    if (!priceInput.trim()) {
      setError('Price is required')
      return false
    }
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number')
      return false
    }
    if (price < 1) {
      setError('Minimum price is 1.00 USDC')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePrice()) return
    if (!address) {
      setError('Please connect your wallet')
      return
    }
    if (address.toLowerCase() !== opinionData.questionOwner.toLowerCase()) {
      setError('Only the question owner can list for sale')
      return
    }

    try {
      setCurrentStep('listing')
      const priceWei = parseUnits(priceInput, 6) // USDC has 6 decimals

      await listQuestion({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'listQuestionForSale',
        args: [BigInt(opinionData.id), priceWei]
      })

    } catch (error: any) {
      console.error('List question error:', error)
      setCurrentStep('error')
      setError(error.message || 'Failed to list question for sale')
      
      toast.error('Listing failed', {
        description: error.message || 'Failed to list question for sale',
        duration: 5000,
      })
    }
  }

  // Handle successful listing
  useEffect(() => {
    if (isListSuccess && currentStep === 'listing') {
      setCurrentStep('success')
      toast.success('Question listed for sale!', {
        description: `Your question is now listed for ${priceInput} USDC`,
        duration: 5000,
      })
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    }
  }, [isListSuccess, currentStep, priceInput, onSuccess, onClose])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPriceInput('')
      setError('')
      setCurrentStep('form')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Check if can list
  const canListForSale = address?.toLowerCase() === opinionData.questionOwner.toLowerCase() && 
                         opinionData.salePrice === 0n

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
            <Tag className="w-5 h-5 text-emerald-400" />
            List Question for Sale
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Context */}
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
                <p className="text-gray-400">Current Answer Price</p>
                <p className="text-emerald-400 font-medium">{formatUSDC(opinionData.nextPrice)}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Volume</p>
                <p className="text-white font-medium">{formatUSDC(opinionData.totalVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access control check */}
        {!canListForSale && (
          <Alert className="mb-4 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {address?.toLowerCase() !== opinionData.questionOwner.toLowerCase() 
                ? 'Only the question owner can list this question for sale'
                : 'This question is already listed for sale'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        {canListForSale && currentStep === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="price" className="text-white">Sale Price (USDC)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  min="1.00"
                  step="0.01"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                <span>Minimum: $1.00</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            {priceInput && !error && (
              <Card className="bg-gray-800/50 border-gray-700/40">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Transaction Breakdown
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sale Price:</span>
                      <span className="text-white">${parseFloat(priceInput || '0').toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee (10%):</span>
                      <span className="text-red-400">${(parseFloat(priceInput || '0') * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-1">
                      <span className="text-gray-300 font-medium">You'll Receive:</span>
                      <span className="text-emerald-400 font-medium">${(parseFloat(priceInput || '0') * 0.9).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Context */}
            <Alert className="border-blue-500/20 bg-blue-500/10">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Note:</strong> The buyer will receive all future creator royalties from this question. 
                Price your question based on its earning potential.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
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
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                disabled={!priceInput || !!error}
              >
                List for Sale
              </Button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {currentStep === 'listing' && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Listing Question...</h3>
            <p className="text-gray-400">Please confirm the transaction in your wallet</p>
          </div>
        )}

        {/* Success State */}
        {currentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Question Listed!</h3>
            <p className="text-gray-400">Your question is now available in the marketplace</p>
          </div>
        )}

        {/* Error State */}
        {currentStep === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Listing Failed</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => setCurrentStep('form')}
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