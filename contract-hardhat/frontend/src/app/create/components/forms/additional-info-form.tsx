'use client'

import React, { useState } from 'react'
import { Info, Link, FileText, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FormData {
  description: string
  externalLink: string
  tags: string[]
}

interface AdditionalInfoFormProps {
  formData: FormData
  onUpdate: (field: string, value: string | string[]) => void
  onNext: () => void
  onPrevious: () => void
}

export function AdditionalInfoForm({ formData, onUpdate, onNext, onPrevious }: AdditionalInfoFormProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Description validation (optional but if provided, must be reasonable)
    if (formData.description && formData.description.trim().length > 300) {
      newErrors.description = 'Description must be 300 characters or less'
    }

    // External link validation (optional but if provided, must be valid URL)
    if (formData.externalLink && !isValidUrl(formData.externalLink)) {
      newErrors.externalLink = 'Please enter a valid URL (e.g., https://example.com)'
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

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleFieldUpdate = (field: string, value: string | string[]) => {
    onUpdate(field, value)
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Additional Information</h2>
          <p className="text-gray-400">Add context and credibility to your opinion (optional)</p>
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description (optional)
        </Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleFieldUpdate('description', e.target.value)}
          placeholder="Provide additional context, reasoning, or explanation for your opinion..."
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 resize-none h-24"
          maxLength={300}
        />
        <div className="flex justify-between text-sm">
          <span className="text-red-400">{errors.description}</span>
          <span className={`${(formData.description?.length || 0) > 240 ? 'text-yellow-400' : 'text-gray-500'}`}>
            {formData.description?.length || 0}/300
          </span>
        </div>
      </div>

      {/* External Link Input */}
      <div className="space-y-2">
        <Label htmlFor="externalLink" className="text-white font-medium flex items-center gap-2">
          <Link className="w-4 h-4" />
          External Link (optional)
        </Label>
        <Input
          id="externalLink"
          type="url"
          value={formData.externalLink || ''}
          onChange={(e) => handleFieldUpdate('externalLink', e.target.value)}
          placeholder="https://example.com/source-or-reference"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
        />
        <span className="text-red-400 text-sm">{errors.externalLink}</span>
        <p className="text-xs text-gray-500">
          Add a link to support your opinion (news article, research, etc.)
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-emerald-900/20 border-emerald-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Why Add Context?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <p>• Increases credibility of your opinion</p>
            <p>• Helps users understand your reasoning</p>
            <p>• Higher-quality opinions get more engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <p>• News articles or reports</p>
            <p>• Research papers or studies</p>
            <p>• Social media posts or announcements</p>
          </CardContent>
        </Card>
      </div>

      {/* Optional Notice */}
      <Alert className="bg-gray-900/50 border-gray-600/50">
        <Info className="w-4 h-4 text-gray-400" />
        <AlertDescription className="text-gray-400">
          All fields on this step are optional. You can skip to review if you prefer to keep it simple.
        </AlertDescription>
      </Alert>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Question
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 flex items-center gap-2"
        >
          Continue to Review
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}