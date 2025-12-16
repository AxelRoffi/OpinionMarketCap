'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AdultContentModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export function AdultContentModal({ isOpen, onAccept, onDecline }: AdultContentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div 
        className="bg-gray-800 border border-gray-600 p-6 rounded-lg max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">🔞 Adult Content</h2>
          <div className="space-y-3 text-gray-300 mb-6">
            <p>You are about to view or create adult content.</p>
            <p className="font-semibold text-white">You must be 18+ years old to continue.</p>
            <p className="text-sm text-gray-400">
              By clicking "I'm 18+", you confirm you are of legal age and consent to viewing adult content.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onDecline}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              I'm under 18
            </button>
            <button 
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              I'm 18+ - Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}