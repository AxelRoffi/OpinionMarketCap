'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdminModerationPanelProps {
  isAdmin?: boolean // In real app, check admin role
}

interface ModerationRequest {
  opinionId: number
  question: string
  currentAnswer: string
  currentOwner: string
  creator: string
  reportedBy?: string
  reportReason?: string
}

export function AdminModerationPanel({ isAdmin = false }: AdminModerationPanelProps) {
  const [moderationRequests] = useState<ModerationRequest[]>([
    // Mock data for testing
    {
      opinionId: 123,
      question: "What will happen to crypto prices next year?",
      currentAnswer: "Inappropriate content that should be moderated",
      currentOwner: "0xabcd...5678",
      creator: "0x1234...abcd",
      reportedBy: "0x9876...4321",
      reportReason: "Contains offensive language"
    }
  ])

  const [selectedOpinion, setSelectedOpinion] = useState<number | null>(null)
  const [moderationReason, setModerationReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isAdmin) {
    return null // Only show to admins
  }

  const handleModerateAnswer = async (opinionId: number) => {
    if (!moderationReason.trim()) {
      alert('Please provide a moderation reason')
      return
    }

    setIsProcessing(true)
    
    try {
      // TODO: Call smart contract moderateAnswer function
      console.log('Moderating answer:', {
        opinionId,
        reason: moderationReason
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Answer moderated successfully!\nOpinion ID: ${opinionId}\nReason: ${moderationReason}`)
      
      // Reset form
      setSelectedOpinion(null)
      setModerationReason('')
      
    } catch (error) {
      console.error('Moderation failed:', error)
      alert('Failed to moderate answer. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 max-w-md"
    >
      <Card className="bg-gray-800/95 border-yellow-500/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Admin Moderation Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {moderationRequests.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No moderation requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-400">
                {moderationRequests.length} pending request{moderationRequests.length !== 1 ? 's' : ''}
              </div>
              
              {moderationRequests.map((request) => (
                <div
                  key={request.opinionId}
                  className="bg-gray-700/50 rounded p-3 border border-gray-600/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium text-sm">
                        Opinion #{request.opinionId}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/30">
                      Reported
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-400">Question:</span>
                      <p className="text-white line-clamp-2">{request.question}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Current Answer:</span>
                      <p className="text-red-300 line-clamp-2">{request.currentAnswer}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner: {request.currentOwner}</span>
                      <span className="text-gray-400">Creator: {request.creator}</span>
                    </div>
                    
                    {request.reportReason && (
                      <div>
                        <span className="text-gray-400">Report:</span>
                        <p className="text-yellow-300">{request.reportReason}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedOpinion === request.opinionId ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        placeholder="Reason for moderation..."
                        className="bg-gray-800 border-gray-600 text-white text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleModerateAnswer(request.opinionId)}
                          disabled={isProcessing || !moderationReason.trim()}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          {isProcessing ? 'Processing...' : 'Moderate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOpinion(null)
                            setModerationReason('')
                          }}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setSelectedOpinion(request.opinionId)}
                      className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs w-full"
                    >
                      Review & Moderate
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}