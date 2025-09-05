'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ArrowLeft, Lightbulb, DollarSign, CheckCircle, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StepIndicator } from './components/ui/step-indicator'
import { CreateSidebar } from './components/create-sidebar'
import { QuestionAnswerForm } from './components/forms/question-answer-form'
import { AdditionalInfoForm } from './components/forms/additional-info-form'
import { ReviewSubmitForm } from './components/forms/review-submit-form'
import { useCreateForm } from './hooks/use-create-form'

export default function CreateOpinionPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const { formData, updateFormData, validateStep, resetForm } = useCreateForm()

  const steps = [
    { number: 1, title: "Question & Answer", icon: Lightbulb },
    { number: 2, title: "Additional Info", icon: DollarSign },
    { number: 3, title: "Review & Submit", icon: CheckCircle }
  ]

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleStepClick = (stepNumber: number) => {
    // Only allow going to previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Wallet Connection Alert */}
        {!isConnected && (
          <Alert className="mb-8 bg-yellow-900/20 border-yellow-500/50">
            <Wallet className="w-4 h-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Please connect your wallet to create an opinion. You&apos;ll need USDC for the creation fee.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CreateSidebar 
              currentStep={currentStep}
              formData={formData}
            />
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-3">
            {/* Step Indicator - aligned with main form card */}
            <div className="mb-6">
              <StepIndicator 
                steps={steps} 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
              />
            </div>
            <Card className="glass-card border-gradient">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuestionAnswerForm
                        formData={formData}
                        onUpdate={updateFormData}
                        onNext={handleNext}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AdditionalInfoForm
                        formData={formData}
                        onUpdate={updateFormData}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                      />
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ReviewSubmitForm
                        formData={formData}
                        onPrevious={handlePrevious}
                        onSuccess={() => {
                          resetForm()
                          router.push('/')
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}