'use client'

import { useState, useCallback } from 'react'

interface FormData {
  question: string
  answer: string
  category: string
  initialPrice: number
  description: string
  externalLink: string
}

interface UseCreateFormReturn {
  formData: FormData
  updateFormData: (field: string, value: string | number | string[]) => void
  validateStep: (step: number) => boolean
  resetForm: () => void
}

const initialFormData: FormData = {
  question: '',
  answer: '',
  category: '',
  initialPrice: 5, // Default price
  description: '',
  externalLink: ''
}

export function useCreateForm(): UseCreateFormReturn {
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const updateFormData = useCallback((field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Question & Answer step
        return !!(
          formData.question?.trim() &&
          formData.question.trim().endsWith('?') &&
          formData.question.trim().length >= 10 &&
          formData.question.trim().length <= 120 &&
          formData.answer?.trim() &&
          formData.answer.trim().length >= 3 &&
          formData.answer.trim().length <= 40 &&
          formData.category &&
          formData.initialPrice >= 1 &&
          formData.initialPrice <= 100
        )
      
      case 2: // Additional Info step (optional fields)
        // All fields are optional, so always valid
        // But validate format if provided
        if (formData.description && formData.description.length > 300) {
          return false
        }
        if (formData.externalLink && !isValidUrl(formData.externalLink)) {
          return false
        }
        return true
      
      case 3: // Review step (no additional validation needed)
        return true
      
      default:
        return false
    }
  }, [formData])

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
  }, [])

  return {
    formData,
    updateFormData,
    validateStep,
    resetForm
  }
}