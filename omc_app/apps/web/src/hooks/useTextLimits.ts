'use client'

import { useReadContract } from 'wagmi'
import { CURRENT_CONTRACTS } from '@/lib/environment'

const TEXT_LIMITS_ABI = [
  {
    "inputs": [],
    "name": "maxQuestionLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxAnswerLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxLinkLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxIpfsHashLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxDescriptionLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxCategoriesPerOpinion",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export interface TextLimits {
  maxQuestionLength: number
  maxAnswerLength: number
  maxLinkLength: number
  maxIpfsHashLength: number
  maxDescriptionLength: number
  maxCategoriesPerOpinion: number
}

// Default fallback values (updated to match new contract limits)
const DEFAULT_LIMITS: TextLimits = {
  maxQuestionLength: 60,
  maxAnswerLength: 60,
  maxLinkLength: 260,
  maxIpfsHashLength: 68,
  maxDescriptionLength: 120, // Note: Contract bug - calls validateDescription() without maxLength param, defaults to 120
  maxCategoriesPerOpinion: 3
}

export function useTextLimits(): TextLimits {
  const { data: maxQuestionLength } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: TEXT_LIMITS_ABI,
    functionName: 'maxQuestionLength',
  })

  const { data: maxAnswerLength } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: TEXT_LIMITS_ABI,
    functionName: 'maxAnswerLength',
  })

  const { data: maxLinkLength } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: TEXT_LIMITS_ABI,
    functionName: 'maxLinkLength',
  })

  const { data: maxIpfsHashLength } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: TEXT_LIMITS_ABI,
    functionName: 'maxIpfsHashLength',
  })

  const { data: maxDescriptionLength } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: TEXT_LIMITS_ABI,
    functionName: 'maxDescriptionLength',
  })

  const { data: maxCategoriesPerOpinion } = useReadContract({
    address: CURRENT_CONTRACTS.OPINION_CORE,
    abi: TEXT_LIMITS_ABI,
    functionName: 'maxCategoriesPerOpinion',
  })

  return {
    maxQuestionLength: Number(maxQuestionLength) || DEFAULT_LIMITS.maxQuestionLength,
    maxAnswerLength: Number(maxAnswerLength) || DEFAULT_LIMITS.maxAnswerLength,
    maxLinkLength: Number(maxLinkLength) || DEFAULT_LIMITS.maxLinkLength,
    maxIpfsHashLength: Number(maxIpfsHashLength) || DEFAULT_LIMITS.maxIpfsHashLength,
    maxDescriptionLength: Number(maxDescriptionLength) || DEFAULT_LIMITS.maxDescriptionLength,
    maxCategoriesPerOpinion: Number(maxCategoriesPerOpinion) || DEFAULT_LIMITS.maxCategoriesPerOpinion
  }
}