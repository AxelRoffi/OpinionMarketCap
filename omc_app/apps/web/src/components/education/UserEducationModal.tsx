'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  DollarSign,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  X,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Calculator,
  Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { isMainnet, CURRENT_USDC } from '@/lib/environment';

/**
 * 📚 USER EDUCATION MODAL
 * 
 * Comprehensive education system for new users
 * Essential for mainnet safety and user understanding
 */

interface UserEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (completed: boolean) => void;
  variant?: 'first-time' | 'mainnet-warning' | 'trading-guide' | 'risk-disclosure';
}

interface LessonStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  quizQuestion?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  riskLevel?: 'low' | 'medium' | 'high';
}

const FIRST_TIME_LESSONS: LessonStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to OpinionMarketCap',
    icon: GraduationCap,
    content: (
      <div className="space-y-4">
        <p>OpinionMarketCap is a prediction market platform where you can:</p>
        <ul className="space-y-2 list-disc list-inside text-sm">
          <li>Create questions about future events</li>
          <li>Submit answers and predictions</li>
          <li>Trade question ownership</li>
          <li>Participate in collective funding pools</li>
        </ul>
        <Alert className="border-blue-200 bg-blue-50">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This tutorial will teach you the basics and safety considerations.
          </AlertDescription>
        </Alert>
      </div>
    )
  },
  {
    id: 'how-it-works',
    title: 'How Opinion Trading Works',
    icon: TrendingUp,
    content: (
      <div className="space-y-4">
        <p>Opinion trading follows these key principles:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Dynamic Pricing
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Prices increase with demand and trading activity
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold flex items-center">
              <Users className="w-4 h-4 mr-2 text-green-600" />
              Ownership Rewards
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Current answer owners earn from future trades
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold flex items-center">
              <Shield className="w-4 h-4 mr-2 text-purple-600" />
              Question Trading
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Questions can be bought/sold like assets
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold flex items-center">
              <Zap className="w-4 h-4 mr-2 text-orange-600" />
              Pool System
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Group funding for expensive predictions
            </p>
          </div>
        </div>
      </div>
    ),
    quizQuestion: {
      question: 'What happens to prices when more people trade an opinion?',
      options: [
        'Prices stay the same',
        'Prices decrease',
        'Prices increase',
        'Prices become random'
      ],
      correctAnswer: 2,
      explanation: 'Prices increase with demand and trading activity - this creates natural market dynamics.'
    }
  },
  {
    id: 'money-basics',
    title: 'Understanding Real Money',
    icon: DollarSign,
    riskLevel: 'high',
    content: (
      <div className="space-y-4">
        <p>All transactions use real USDC cryptocurrency:</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold flex items-center text-yellow-800">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Important Financial Facts
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            <li>• 1 USDC = $1 USD (stablecoin)</li>
            <li>• All transactions are irreversible</li>
            <li>• Gas fees apply for blockchain operations</li>
            <li>• You need both USDC and ETH in your wallet</li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded">
            <DollarSign className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <div className="text-sm font-medium">USDC</div>
            <div className="text-xs text-gray-600">For trading opinions</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <Zap className="w-6 h-6 mx-auto text-purple-600 mb-2" />
            <div className="text-sm font-medium">ETH</div>
            <div className="text-xs text-gray-600">For transaction fees</div>
          </div>
        </div>
      </div>
    ),
    quizQuestion: {
      question: 'What do you need in your wallet to trade on OpinionMarketCap?',
      options: [
        'Only USDC',
        'Only ETH',
        'Both USDC and ETH',
        'Any cryptocurrency'
      ],
      correctAnswer: 2,
      explanation: 'You need USDC for trading and ETH for gas fees to process blockchain transactions.'
    }
  },
  {
    id: 'risks',
    title: 'Understanding Risks',
    icon: AlertTriangle,
    riskLevel: 'high',
    content: (
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Trading involves significant risks</strong>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <div className="border border-orange-200 bg-orange-50 p-3 rounded">
            <h4 className="font-semibold text-orange-800">Financial Risks:</h4>
            <ul className="text-sm text-orange-700 mt-1 space-y-1">
              <li>• You can lose your entire investment</li>
              <li>• Prices can change rapidly</li>
              <li>• No guaranteed returns</li>
            </ul>
          </div>
          
          <div className="border border-blue-200 bg-blue-50 p-3 rounded">
            <h4 className="font-semibold text-blue-800">Technical Risks:</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Smart contract vulnerabilities</li>
              <li>• Network congestion and high fees</li>
              <li>• Irreversible transactions</li>
            </ul>
          </div>
          
          <div className="border border-purple-200 bg-purple-50 p-3 rounded">
            <h4 className="font-semibold text-purple-800">Market Risks:</h4>
            <ul className="text-sm text-purple-700 mt-1 space-y-1">
              <li>• Competition from other traders</li>
              <li>• Unpredictable opinion outcomes</li>
              <li>• Low liquidity periods</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    quizQuestion: {
      question: 'Which statement about trading risks is TRUE?',
      options: [
        'Profits are guaranteed if you wait long enough',
        'You can lose your entire investment',
        'Technical problems never affect trading',
        'All transactions can be reversed'
      ],
      correctAnswer: 1,
      explanation: 'Trading involves real financial risk - you can lose your entire investment. Never invest more than you can afford to lose.'
    }
  }
];

const MAINNET_WARNING_CONTENT: LessonStep[] = [
  {
    id: 'mainnet-warning',
    title: 'You Are Using Real Money',
    icon: AlertTriangle,
    riskLevel: 'high',
    content: (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>⚠️ MAINNET MODE ACTIVE</strong><br />
            You are connected to Base Mainnet. All transactions use real USDC.
          </AlertDescription>
        </Alert>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4">Critical Information:</h3>
          
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">Real Money Transactions</h4>
                <p className="text-red-700 text-sm">Every USDC you spend is real money. There are no refunds or do-overs.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">Irreversible Actions</h4>
                <p className="text-red-700 text-sm">Blockchain transactions cannot be undone. Double-check everything.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calculator className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">Additional Fees Apply</h4>
                <p className="text-red-700 text-sm">Gas fees (in ETH) are required for all transactions, even failed ones.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Safety Recommendations:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✓ Start with small amounts to learn the system</li>
            <li>✓ Always verify transaction details before confirming</li>
            <li>✓ Keep some ETH for gas fees</li>
            <li>✓ Only invest what you can afford to lose</li>
            <li>✓ Monitor gas prices to avoid high fees</li>
          </ul>
        </div>
      </div>
    )
  }
];

export function UserEducationModal({
  isOpen,
  onClose,
  onComplete,
  variant = 'first-time'
}: UserEducationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResult, setShowQuizResult] = useState<Record<string, boolean>>({});
  const [acceptedRisks, setAcceptedRisks] = useState(false);
  const [completed, setCompleted] = useState(false);

  const isMainnetEnv = isMainnet();
  
  // Select lessons based on variant
  const lessons = variant === 'mainnet-warning' ? MAINNET_WARNING_CONTENT : FIRST_TIME_LESSONS;
  const currentLesson = lessons[currentStep];
  const progress = ((currentStep + 1) / lessons.length) * 100;

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    setShowQuizResult(prev => ({ ...prev, [questionId]: true }));
  };

  const isQuizCorrect = (lessonId: string): boolean => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson?.quizQuestion) return true;
    return quizAnswers[lessonId] === lesson.quizQuestion.correctAnswer;
  };

  const canProceed = (): boolean => {
    if (currentLesson.quizQuestion && !showQuizResult[currentLesson.id]) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < lessons.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleComplete = () => {
    if (variant === 'mainnet-warning' && !acceptedRisks) {
      alert('You must acknowledge the risks before proceeding.');
      return;
    }
    
    // Mark completion in localStorage
    localStorage.setItem(`opinionmarket.education.${variant}`, 'completed');
    localStorage.setItem(`opinionmarket.education.${variant}.timestamp`, Date.now().toString());
    
    onComplete(true);
    onClose();
  };

  const handleClose = () => {
    onComplete(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {variant === 'mainnet-warning' ? '🚨 Mainnet Safety Guide' : '📚 User Education'}
              </h2>
              <p className="text-blue-100 mt-1">
                {variant === 'mainnet-warning' 
                  ? 'Critical information for real money trading'
                  : 'Learn how to use OpinionMarketCap safely'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Step {currentStep + 1} of {lessons.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-blue-500" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Lesson Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-3 rounded-full ${
                  currentLesson.riskLevel === 'high' ? 'bg-red-100' :
                  currentLesson.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <currentLesson.icon className={`w-6 h-6 ${
                    currentLesson.riskLevel === 'high' ? 'text-red-600' :
                    currentLesson.riskLevel === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentLesson.title}</h3>
                  {currentLesson.riskLevel && (
                    <Badge 
                      className={`mt-1 ${
                        currentLesson.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        currentLesson.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {currentLesson.riskLevel.toUpperCase()} RISK
                    </Badge>
                  )}
                </div>
              </div>

              {/* Lesson Content */}
              <div className="mb-6">
                {currentLesson.content}
              </div>

              {/* Quiz Section */}
              {currentLesson.quizQuestion && (
                <Card className="bg-gray-50 border-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Knowledge Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-medium">{currentLesson.quizQuestion.question}</p>
                    
                    <div className="space-y-2">
                      {currentLesson.quizQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuizAnswer(currentLesson.id, index)}
                          disabled={showQuizResult[currentLesson.id]}
                          className={`w-full text-left p-3 rounded border transition-colors ${
                            showQuizResult[currentLesson.id]
                              ? index === currentLesson.quizQuestion!.correctAnswer
                                ? 'bg-green-100 border-green-300 text-green-800'
                                : index === quizAnswers[currentLesson.id]
                                ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-gray-100 border-gray-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
                            {option}
                            {showQuizResult[currentLesson.id] && index === currentLesson.quizQuestion!.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {showQuizResult[currentLesson.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded ${
                          isQuizCorrect(currentLesson.id) 
                            ? 'bg-green-100 border border-green-300' 
                            : 'bg-red-100 border border-red-300'
                        }`}
                      >
                        <p className={`text-sm ${
                          isQuizCorrect(currentLesson.id) ? 'text-green-800' : 'text-red-800'
                        }`}>
                          <strong>
                            {isQuizCorrect(currentLesson.id) ? '✓ Correct!' : '✗ Incorrect.'}
                          </strong>
                          {' '}{currentLesson.quizQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          {completed ? (
            <div className="space-y-4">
              {variant === 'mainnet-warning' && (
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="accept-risks"
                    checked={acceptedRisks}
                    onCheckedChange={(checked) => setAcceptedRisks(checked === true)}
                  />
                  <label htmlFor="accept-risks" className="text-sm leading-5">
                    <strong>I acknowledge that I understand:</strong>
                    <ul className="list-disc list-inside mt-1 text-gray-600">
                      <li>I am using real money (USDC) on Base Mainnet</li>
                      <li>All transactions are irreversible and final</li>
                      <li>I can lose my entire investment</li>
                      <li>Additional gas fees (ETH) apply to all transactions</li>
                    </ul>
                  </label>
                </div>
              )}
              
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Education Complete!</h3>
                <p className="text-gray-600 mb-4">
                  {variant === 'mainnet-warning' 
                    ? 'You understand the risks of real money trading.'
                    : 'You now understand how to use OpinionMarketCap safely.'
                  }
                </p>
                <Button 
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={variant === 'mainnet-warning' && !acceptedRisks}
                >
                  {variant === 'mainnet-warning' ? 'Proceed with Real Money Trading' : 'Start Trading'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : handleClose()}
              >
                {currentStep > 0 ? (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </>
                ) : (
                  'Skip Tutorial'
                )}
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === lessons.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default UserEducationModal;