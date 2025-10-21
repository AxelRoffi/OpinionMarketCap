'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestWallet() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Connection Test</h1>
        
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            
            <div className="space-y-2">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              {address && <p><strong>Address:</strong> <code className="bg-gray-700 px-2 py-1 rounded">{address}</code></p>}
              {chain && <p><strong>Chain:</strong> {chain.name} ({chain.id})</p>}
            </div>
            
            {isConnected && (
              <Button 
                onClick={() => disconnect()}
                variant="outline"
                className="w-full mt-4"
              >
                Disconnect
              </Button>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/admin'}
            disabled={!isConnected}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}