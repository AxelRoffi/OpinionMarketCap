'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, X, ExternalLink } from 'lucide-react'
import { useAccount } from 'wagmi'

interface ModeratedAnswer {
  opinionId: number
  reason: string
  moderatedAt: number
  opinionQuestion: string
}

export function ModeratedAnswersNotification() {
  const { address } = useAccount()
  const [moderatedAnswers, setModeratedAnswers] = useState<ModeratedAnswer[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Mock data for now - in real implementation, this would fetch from blockchain events
  useEffect(() => {
    if (!address) return
    
    // TODO: Replace with real blockchain event listening
    // This would listen for AnswerModerated events where moderatedUser === address
    const mockModeratedAnswers: ModeratedAnswer[] = [
      // Uncomment to test the UI
      // {
      //   opinionId: 123,
      //   reason: "Inappropriate content",
      //   moderatedAt: Date.now() - 86400000, // 1 day ago
      //   opinionQuestion: "What will happen to crypto prices next year?"
      // }
    ]
    
    setModeratedAnswers(mockModeratedAnswers)
    setIsVisible(mockModeratedAnswers.length > 0)
  }, [address])

  const dismissNotification = (opinionId: number) => {
    setModeratedAnswers(prev => prev.filter(item => item.opinionId !== opinionId))
    if (moderatedAnswers.length <= 1) {
      setIsVisible(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor(diff / 3600000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Recently'
  }

  if (!isVisible || moderatedAnswers.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <div className="bg-yellow-900/90 border border-yellow-600/50 rounded-lg shadow-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-yellow-100 font-medium">
            Moderated Answers ({moderatedAnswers.length})
          </h3>
        </div>
        
        <div className="space-y-2">
          {moderatedAnswers.map((item) => (
            <motion.div
              key={item.opinionId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-yellow-800/50 rounded p-3 relative"
            >
              <button
                onClick={() => dismissNotification(item.opinionId)}
                className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-200 text-sm font-medium">
                    Opinion #{item.opinionId}
                  </span>
                  <button
                    onClick={() => window.location.href = `/opinions/${item.opinionId}`}
                    className="text-yellow-300 hover:text-yellow-100 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                
                <p className="text-yellow-100 text-sm mb-2 line-clamp-2">
                  {item.opinionQuestion}
                </p>
                
                <div className="text-xs text-yellow-300">
                  <p className="mb-1">
                    <span className="font-medium">Reason:</span> {item.reason}
                  </p>
                  <p className="opacity-75">
                    {formatTimeAgo(item.moderatedAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-xs text-yellow-300/75 border-t border-yellow-600/30 pt-2">
          Your answer ownership was transferred back to the question creator
        </div>
      </div>
    </motion.div>
  )
}