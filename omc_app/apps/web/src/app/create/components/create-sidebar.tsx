'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Info, DollarSign, Clock, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FormData {
  question?: string
  answer?: string
  category?: string
  categories?: string[]
  initialPrice: number
  description?: string
  externalLink?: string
}

interface CreateSidebarProps {
  currentStep: number
  formData: FormData
}

export function CreateSidebar({ currentStep, formData }: CreateSidebarProps) {
  const formatUSDC = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  // Correct fee calculation matching smart contract: 20% with 2 USDC minimum
  const calculatedFee = formData.initialPrice * 0.2
  const creationFee = calculatedFee < 2 ? 2 : calculatedFee

  return (
    <div className="space-y-6">
      {/* Step Information */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Step {currentStep} Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          {currentStep === 1 && (
            <>
              <p>• Create your opinion question ending with &ldquo;?&rdquo;</p>
              <p>• Provide your initial answer (2-60 characters)</p>
              <p>• Select a category for better discovery</p>
              <p>• Set initial price (1-100 USDC)</p>
            </>
          )}
          {currentStep === 2 && (
            <>
              <p>• Add external links for credibility (optional)</p>
              <p>• Provide additional context or description</p>
              <p>• All fields in this step are optional</p>
            </>
          )}
          {currentStep === 3 && (
            <>
              <p>• Review all your information carefully</p>
              <p>• Check the creation fee calculation</p>
              <p>• Submit when you&apos;re ready to create</p>
              <p>• Transaction will be processed on Base Sepolia</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fee Information */}
      {formData.initialPrice > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fee Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Initial Price:</span>
                <span className="text-white font-medium">{formatUSDC(formData.initialPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Creation Fee {creationFee === 2 ? '(2 USDC Min)' : '(20%)'}:
                </span>
                <span className="text-yellow-400 font-medium">{formatUSDC(creationFee)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">You Pay:</span>
                  <span className="text-emerald-400">{formatUSDC(creationFee)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-400">Fee Structure:</p>
                <p>• 20% of initial price with 2 USDC minimum</p>
                <p>• Example: $3 → $2 fee, $50 → $10 fee</p>
                <p className="pt-1 border-t border-gray-700">
                  The initial price is what users will pay to take ownership of your answer.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tips */}
      <Card className="glass-card border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <div className="space-y-2">
            <p>• <strong>Good questions</strong> are specific and debatable</p>
            <p>• <strong>Higher prices</strong> attract more serious participants</p>
            <p>• <strong>Categories</strong> help users discover your opinion</p>
            <p>• <strong>External links</strong> add credibility to your stance</p>
          </div>
          
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Est. time: 2-3 minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(formData.question || formData.answer) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-gray-600/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.question && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Question</p>
                  <p className="text-sm text-white font-medium">{formData.question}</p>
                </div>
              )}
              {formData.answer && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Answer</p>
                  <p className="text-sm text-emerald-400">{formData.answer}</p>
                </div>
              )}
              {formData.categories && formData.categories.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Categories ({formData.categories.length}/3)</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.categories.map(category => (
                      <Badge key={category} variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                        {category === 'Adult' ? '🔞 Adult' : category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}