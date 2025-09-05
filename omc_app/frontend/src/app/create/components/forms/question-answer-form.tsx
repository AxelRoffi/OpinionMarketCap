'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, DollarSign, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FormData {
  question: string
  answer: string
  category: string
  initialPrice: number
}

interface QuestionAnswerFormProps {
  formData: FormData
  onUpdate: (field: string, value: string | number) => void
  onNext: () => void
}

// Categories from smart contract (available-categories.json)
const CATEGORIES = [
  'Crypto',
  'Politics',
  'Science',
  'Technology',
  'Sports',
  'Entertainment',
  'Culture',
  'Web',
  'Social Media',
  'Other'
]

export function QuestionAnswerForm({ formData, onUpdate, onNext }: QuestionAnswerFormProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Question validation
    if (!formData.question?.trim()) {
      newErrors.question = 'Question is required'
    } else if (!formData.question.trim().endsWith('?')) {
      newErrors.question = 'Question must end with a question mark'
    } else if (formData.question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters'
    } else if (formData.question.trim().length > 120) {
      newErrors.question = 'Question must be 120 characters or less'
    }

    // Answer validation  
    if (!formData.answer?.trim()) {
      newErrors.answer = 'Answer is required'
    } else if (formData.answer.trim().length < 3) {
      newErrors.answer = 'Answer must be at least 3 characters'
    } else if (formData.answer.trim().length > 40) {
      newErrors.answer = 'Answer must be 40 characters or less'
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    // Price validation
    if (!formData.initialPrice || formData.initialPrice < 1) {
      newErrors.initialPrice = 'Price must be at least $1'
    } else if (formData.initialPrice > 100) {
      newErrors.initialPrice = 'Price must be $100 or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleFieldUpdate = (field: string, value: string | number) => {
    onUpdate(field, value)
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Correct fee calculation matching smart contract: 20% with 5 USDC minimum
  const calculatedFee = formData.initialPrice * 0.2
  const creationFee = calculatedFee < 5 ? 5 : calculatedFee

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Question & Answer</h2>
          <p className="text-gray-400">Create your opinion question and provide your initial answer</p>
        </div>
      </div>

      {/* Question Input */}
      <div className="space-y-2">
        <Label htmlFor="question" className="text-white font-medium">
          Question *
        </Label>
        <Textarea
          id="question"
          value={formData.question || ''}
          onChange={(e) => handleFieldUpdate('question', e.target.value)}
          placeholder="What do you think will happen? (must end with ?)"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 resize-none h-20"
          maxLength={120}
        />
        <div className="flex justify-between text-sm">
          <span className="text-red-400">{errors.question}</span>
          <span className={`${(formData.question?.length || 0) > 96 ? 'text-yellow-400' : 'text-gray-500'}`}>
            {formData.question?.length || 0}/120
          </span>
        </div>
        {formData.question && !formData.question.endsWith('?') && (
          <Alert className="bg-yellow-900/20 border-yellow-500/50">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Don&apos;t forget to end your question with a question mark!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Answer Input */}
      <div className="space-y-2">
        <Label htmlFor="answer" className="text-white font-medium">
          Your Initial Answer *
        </Label>
        <Input
          id="answer"
          value={formData.answer || ''}
          onChange={(e) => handleFieldUpdate('answer', e.target.value)}
          placeholder="Your answer (5-40 characters)"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500"
          maxLength={40}
        />
        <div className="flex justify-between text-sm">
          <span className="text-red-400">{errors.answer}</span>
          <span className={`${(formData.answer?.length || 0) > 32 ? 'text-yellow-400' : 'text-gray-500'}`}>
            {formData.answer?.length || 0}/40
          </span>
        </div>
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-white font-medium">
          Category *
        </Label>
        <Select value={formData.category || ''} onValueChange={(value) => handleFieldUpdate('category', value)}>
          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {CATEGORIES.map((category) => (
              <SelectItem 
                key={category} 
                value={category}
                className="text-white hover:bg-gray-700"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-red-400 text-sm">{errors.category}</span>
      </div>

      {/* Price Slider */}
      <div className="space-y-4">
        <Label className="text-white font-medium">
          Initial Price *
        </Label>
        <div className="space-y-4">
          <Slider
            value={[formData.initialPrice || 1]}
            onValueChange={(value) => handleFieldUpdate('initialPrice', value[0])}
            min={1}
            max={100}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>$1</span>
            <span className="text-white font-bold text-lg">
              ${(formData.initialPrice || 1).toFixed(2)}
            </span>
            <span>$100</span>
          </div>
        </div>
        <span className="text-red-400 text-sm">{errors.initialPrice}</span>
      </div>

      {/* Fee Preview */}
      {formData.initialPrice > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-yellow-900/20 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Creation Fee Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Initial Price:</span>
                <span className="text-white font-medium">${formData.initialPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Creation Fee {creationFee === 5 ? '(5 USDC Min)' : '(20%)'}:
                </span>
                <span className="text-yellow-400 font-medium">${creationFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">You Pay:</span>
                  <span className="text-emerald-400">${creationFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-400">Fee Structure:</p>
                <p>• 20% of initial price with 5 USDC minimum</p>
                <p>• Example: $3 → $5 fee, $50 → $10 fee</p>
                <p className="pt-1">
                  Users will pay ${formData.initialPrice.toFixed(2)} to take ownership of your answer.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-400">
            Please fix the errors above to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8"
        >
          Continue to Additional Info
        </Button>
      </div>
    </div>
  )
}