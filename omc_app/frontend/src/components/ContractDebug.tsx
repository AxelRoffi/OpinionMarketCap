'use client'

import { useReadContract } from 'wagmi'
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts'

export function ContractDebug() {
  // Test nextOpinionId
  const { data: nextOpinionId, isLoading: nextIdLoading, error: nextIdError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  })

  // Test opinion 1
  const { data: opinion1, isLoading: opinion1Loading, error: opinion1Error } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(1)],
  })

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white space-y-4">
      <h3 className="text-lg font-bold">Contract Debug Info</h3>
      
      <div>
        <h4 className="font-medium">Next Opinion ID:</h4>
        <p>Loading: {nextIdLoading ? 'Yes' : 'No'}</p>
        <p>Error: {nextIdError ? String(nextIdError) : 'None'}</p>
        <p>Data: {nextOpinionId ? String(nextOpinionId) : 'None'}</p>
      </div>

      <div>
        <h4 className="font-medium">Opinion 1:</h4>
        <p>Loading: {opinion1Loading ? 'Yes' : 'No'}</p>
        <p>Error: {opinion1Error ? String(opinion1Error) : 'None'}</p>
        <p>Has Data: {opinion1 ? 'Yes' : 'No'}</p>
        {opinion1 && (
          <div className="ml-4 space-y-1">
            <p>Question: {opinion1.question}</p>
            <p>Current Answer: {opinion1.currentAnswer}</p>
            <p>Next Price: {String(opinion1.nextPrice)}</p>
            <p>Creator: {opinion1.creator}</p>
          </div>
        )}
      </div>
    </div>
  )
}