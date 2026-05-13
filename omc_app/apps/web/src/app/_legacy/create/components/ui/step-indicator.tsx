'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Step {
  number: number
  title: string
  icon: LucideIcon
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick: (stepNumber: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep
        const isClickable = step.number <= currentStep

        return (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <motion.button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300 transform hover:scale-105
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>

            {/* Step Title (Desktop only) */}
            <div className="hidden md:block ml-3 min-w-0">
              <p className={`text-sm font-medium ${
                isActive 
                  ? 'text-white' 
                  : isCompleted
                    ? 'text-emerald-400'
                    : 'text-gray-400'
              }`}>
                Step {step.number}
              </p>
              <p className={`text-xs ${
                isActive 
                  ? 'text-gray-300' 
                  : isCompleted
                    ? 'text-emerald-300'
                    : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="hidden md:block mx-4 w-8 h-0.5 bg-gray-700 relative">
                {isCompleted && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}