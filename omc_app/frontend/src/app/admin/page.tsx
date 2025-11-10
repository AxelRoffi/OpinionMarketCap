'use client'

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion } from 'framer-motion'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'sonner'
import { 
  Shield, 
  Settings, 
  Users, 
  DollarSign, 
  Pause, 
  Play, 
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Ban,
  UserCheck,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { AdminAccessChecker } from '@/components/AdminAccessChecker'
import { ExtensionErrorSuppressor } from '@/components/ExtensionErrorSuppressor'
import { AdminActions } from './components/AdminActions'

// Contract configuration - Updated to use environment-aware addresses
import { CURRENT_CONTRACTS } from '@/lib/environment'
const OPINION_CORE_ADDRESS = CURRENT_CONTRACTS.OPINION_CORE

// Contract ABI (minimal for admin functions)
const OPINION_CORE_ABI = [
  // Role constants
  {
    "inputs": [],
    "name": "ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MODERATOR_ROLE", 
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Role checking
  {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
    "name": "hasRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Role management
  {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable", 
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Moderation
  {
    "inputs": [{"internalType": "uint256", "name": "opinionId", "type": "uint256"}, {"internalType": "string", "name": "reason", "type": "string"}],
    "name": "moderateAnswer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Contract controls
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "togglePublicCreation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isPublicCreationEnabled",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Price settings
  {
    "inputs": [{"internalType": "uint96", "name": "_minimumPrice", "type": "uint96"}],
    "name": "setMinimumPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint96", "name": "_questionCreationFee", "type": "uint96"}],
    "name": "setQuestionCreationFee", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_absoluteMaxPriceChange", "type": "uint256"}],
    "name": "setMaxPriceChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Category management
  {
    "inputs": [{"internalType": "string", "name": "newCategory", "type": "string"}],
    "name": "addCategoryToCategories",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string[]", "name": "newCategories", "type": "string[]"}],
    "name": "addMultipleCategories",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Stats
  {
    "inputs": [],
    "name": "nextOpinionId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Timelock Functions
  {
    "inputs": [{"internalType": "address", "name": "newImplementation", "type": "address"}, {"internalType": "string", "name": "description", "type": "string"}],
    "name": "scheduleContractUpgrade",
    "outputs": [{"internalType": "bytes32", "name": "actionId", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "actionId", "type": "bytes32"}],
    "name": "executeScheduledUpgrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes4", "name": "functionSelector", "type": "bytes4"}, {"internalType": "bytes", "name": "params", "type": "bytes"}, {"internalType": "string", "name": "description", "type": "string"}],
    "name": "scheduleAdminParameterChange",
    "outputs": [{"internalType": "bytes32", "name": "actionId", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "actionId", "type": "bytes32"}],
    "name": "executeScheduledParameterChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "actionId", "type": "bytes32"}, {"internalType": "string", "name": "reason", "type": "string"}],
    "name": "cancelTimelockAction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Treasury Functions
  {
    "inputs": [{"internalType": "address", "name": "newTreasury", "type": "address"}],
    "name": "setTreasury",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confirmTreasuryChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Additional Admin Functions
  {
    "inputs": [{"internalType": "uint256", "name": "_maxTradesPerBlock", "type": "uint256"}],
    "name": "setMaxTradesPerBlock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxTradesPerBlock",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function AdminDashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  
  // State variables
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModerator, setIsModerator] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [contractStats, setContractStats] = useState({
    totalOpinions: 0,
    activeOpinions: 0,
    totalVolume: 0,
    isPaused: false,
    publicCreationEnabled: false,
  })
  
  // Form states for different admin actions
  const [moderationForm, setModerationForm] = useState({ opinionId: '', reason: '' })
  const [priceForm, setPriceForm] = useState({ minPrice: '', creationFee: '', maxChange: '', maxTradesPerBlock: '' })
  const [roleForm, setRoleForm] = useState({ address: '', role: 'moderator' })
  const [categoryForm, setCategoryForm] = useState({ newCategory: '', multipleCategories: '' })
  const [contractForm, setContractForm] = useState({ feeManagerAddress: '', poolManagerAddress: '', treasuryAddress: '' })
  
  // New timelock and treasury form states
  const [upgradeForm, setUpgradeForm] = useState({ newImplementation: '', description: '' })
  const [parameterForm, setParameterForm] = useState({ functionName: '', parameters: '', description: '' })
  const [timelockForm, setTimelockForm] = useState({ actionId: '', reason: '' })
  const [treasuryForm, setTreasuryForm] = useState({ newTreasuryAddress: '' })
  const [pendingActions, setPendingActions] = useState<Array<{id: string, type: string, description: string, executeTime: number}>>([])
  
  // Current settings
  const [currentSettings, setCurrentSettings] = useState({
    maxTradesPerBlock: 0,
    treasury: '',
    pendingTreasury: ''
  })

  // Contract read hooks - ALWAYS CALLED (no conditional rendering)
  const { data: adminRole } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'ADMIN_ROLE',
  })
  
  const { data: moderatorRole } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'MODERATOR_ROLE',
  })
  
  const { data: hasAdminRole } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'hasRole',
    args: adminRole && address ? [adminRole, address] : undefined,
  })
  
  const { data: hasModeratorRole } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'hasRole',
    args: moderatorRole && address ? [moderatorRole, address] : undefined,
  })
  
  const { data: isPaused } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'paused',
  })
  
  const { data: publicCreationEnabled } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'isPublicCreationEnabled',
  })
  
  const { data: nextOpinionId } = useReadContract({
    address: OPINION_CORE_ADDRESS,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  })

  // Contract write hooks - ALWAYS CALLED (no conditional rendering)
  const { writeContract: writeModerateAnswer } = useWriteContract()
  const { writeContract: writePause } = useWriteContract()
  const { writeContract: writeUnpause } = useWriteContract()
  const { writeContract: writeTogglePublicCreation } = useWriteContract()
  const { writeContract: writeSetMinimumPrice } = useWriteContract()
  const { writeContract: writeSetQuestionCreationFee } = useWriteContract()
  const { writeContract: writeSetMaxPriceChange } = useWriteContract()
  const { writeContract: writeSetMaxTradesPerBlock } = useWriteContract()
  const { writeContract: writeGrantRole } = useWriteContract()
  const { writeContract: writeRevokeRole } = useWriteContract()
  const { writeContract: writeAddCategory } = useWriteContract()
  
  // Timelock write hooks - ALWAYS CALLED (no conditional rendering)
  const { writeContract: writeScheduleContractUpgrade } = useWriteContract()
  const { writeContract: writeExecuteScheduledUpgrade } = useWriteContract()
  const { writeContract: writeScheduleAdminParameterChange } = useWriteContract()
  const { writeContract: writeExecuteScheduledParameterChange } = useWriteContract()
  const { writeContract: writeCancelTimelockAction } = useWriteContract()
  
  // Treasury write hooks - ALWAYS CALLED (no conditional rendering)
  const { writeContract: writeSetTreasury } = useWriteContract()
  const { writeContract: writeConfirmTreasuryChange } = useWriteContract()
  const { writeContract: writeAddMultipleCategories } = useWriteContract()

  // Update contract stats function
  const updateContractStats = () => {
    if (hasAdminRole || hasModeratorRole) {
      setContractStats({
        totalOpinions: Number(nextOpinionId) - 1 || 0,
        activeOpinions: Number(nextOpinionId) - 1 || 0,
        totalVolume: 0, // This would need additional contract calls to calculate
        isPaused: Boolean(isPaused),
        publicCreationEnabled: Boolean(publicCreationEnabled),
      })
    }
  }

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }

      try {
        setIsAdmin(Boolean(hasAdminRole))
        setIsModerator(Boolean(hasModeratorRole))
        updateContractStats()
      } catch (error) {
        console.error('Failed to check admin access:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAdminAccess()
  }, [hasAdminRole, hasModeratorRole, nextOpinionId, isPaused, publicCreationEnabled, isConnected, address])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 mx-auto animate-spin mb-4" />
          <p className="text-white">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">Please connect your wallet to access the admin dashboard</p>
          <Button onClick={() => router.push('/')} className="bg-emerald-600 hover:bg-emerald-700">
            Go to Home
          </Button>
        </Card>
      </div>
    )
  }

  if (!isAdmin && !isModerator) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-2">This dashboard is restricted to contract administrators.</p>
          <p className="text-gray-500 text-sm mb-4">Connected as: {address}</p>
          <p className="text-gray-500 text-xs mb-6">
            Debug Info:<br/>
            Admin Role: {hasAdminRole ? 'Yes' : 'No'}<br/>
            Moderator Role: {hasModeratorRole ? 'Yes' : 'No'}<br/>
            Contract: {OPINION_CORE_ADDRESS}
          </p>
          <Button onClick={() => router.push('/')} variant="outline">
            Return to Home
          </Button>
        </Card>
      </div>
    )
  }

  // Admin action handlers
  const handleModerateAnswer = async () => {
    if (!moderationForm.opinionId || !moderationForm.reason) {
      toast.error('Please provide opinion ID and reason')
      return
    }

    try {
      await writeModerateAnswer({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'moderateAnswer',
        args: [BigInt(moderationForm.opinionId), moderationForm.reason],
      })
      
      toast.success(`Answer moderated successfully! Opinion: ${moderationForm.opinionId}`)
      setModerationForm({ opinionId: '', reason: '' })
    } catch (error: any) {
      console.error('Moderation failed:', error)
      toast.error(`Moderation failed: ${error.message || 'Unknown error'}`)
    }
  }

  const handleTogglePause = async () => {
    try {
      if (contractStats.isPaused) {
        await writeUnpause({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'unpause',
        })
        toast.success('Contract unpaused successfully')
      } else {
        await writePause({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'pause',
        })
        toast.success('Contract paused successfully')
      }
    } catch (error: any) {
      console.error('Toggle pause failed:', error)
      toast.error(`Failed to toggle pause: ${error.message || 'Unknown error'}`)
    }
  }

  const handleTogglePublicCreation = async () => {
    try {
      await writeTogglePublicCreation({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'togglePublicCreation',
      })
      
      toast.success(`Public creation ${!contractStats.publicCreationEnabled ? 'enabled' : 'disabled'} successfully`)
    } catch (error: any) {
      console.error('Toggle public creation failed:', error)
      toast.error(`Failed to toggle public creation: ${error.message || 'Unknown error'}`)
    }
  }

  const handleUpdatePrices = async () => {
    try {
      const updates = []
      
      if (priceForm.minPrice) {
        await writeSetMinimumPrice({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'setMinimumPrice',
          args: [parseUnits(priceForm.minPrice, 6)], // USDC has 6 decimals
        })
        updates.push('minimum price')
      }
      
      if (priceForm.creationFee) {
        await writeSetQuestionCreationFee({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'setQuestionCreationFee',
          args: [parseUnits(priceForm.creationFee, 6)], // USDC has 6 decimals
        })
        updates.push('creation fee')
      }
      
      if (priceForm.maxChange) {
        await writeSetMaxPriceChange({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'setMaxPriceChange',
          args: [BigInt(priceForm.maxChange)],
        })
        updates.push('max price change')
      }
      
      if (updates.length > 0) {
        toast.success(`Updated: ${updates.join(', ')}`)
        setPriceForm({ minPrice: '', creationFee: '', maxChange: '', maxTradesPerBlock: '' })
      } else {
        toast.error('Please provide at least one value to update')
      }
    } catch (error: any) {
      console.error('Price update failed:', error)
      toast.error(`Failed to update prices: ${error.message || 'Unknown error'}`)
    }
  }

  const handleRoleManagement = async (action: 'grant' | 'revoke') => {
    if (!roleForm.address) {
      toast.error('Please provide an address')
      return
    }

    try {
      const role = roleForm.role === 'admin' ? adminRole : moderatorRole
      
      if (action === 'grant') {
        if (role) {
          await writeGrantRole({
            address: OPINION_CORE_ADDRESS,
            abi: OPINION_CORE_ABI,
            functionName: 'grantRole',
            args: [role, roleForm.address as `0x${string}`],
          })
        }
      } else {
        if (role) {
          await writeRevokeRole({
            address: OPINION_CORE_ADDRESS,
            abi: OPINION_CORE_ABI,
            functionName: 'revokeRole',
            args: [role, roleForm.address as `0x${string}`],
          })
        }
      }
      
      toast.success(`${roleForm.role} role ${action}ed successfully for ${roleForm.address}`)
      setRoleForm({ address: '', role: 'moderator' })
    } catch (error: any) {
      console.error(`Role ${action} failed:`, error)
      toast.error(`Failed to ${action} role: ${error.message || 'Unknown error'}`)
    }
  }

  const handleAddCategory = async (multiple = false) => {
    try {
      if (multiple) {
        if (!categoryForm.multipleCategories.trim()) {
          toast.error('Please provide categories to add')
          return
        }
        
        const categories = categoryForm.multipleCategories.split(',').map(c => c.trim()).filter(c => c.length > 0)
        
        if (categories.length === 0) {
          toast.error('Please provide valid categories')
          return
        }
        
        await writeAddMultipleCategories({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'addMultipleCategories',
          args: [categories],
        })
        
        toast.success(`Added ${categories.length} categories: ${categories.join(', ')}`)
      } else {
        if (!categoryForm.newCategory.trim()) {
          toast.error('Please provide a category name')
          return
        }
        
        await writeAddCategory({
          address: OPINION_CORE_ADDRESS,
          abi: OPINION_CORE_ABI,
          functionName: 'addCategoryToCategories',
          args: [categoryForm.newCategory.trim()],
        })
        
        toast.success(`Added category: ${categoryForm.newCategory}`)
      }
      
      setCategoryForm({ newCategory: '', multipleCategories: '' })
    } catch (error: any) {
      console.error('Add category failed:', error)
      toast.error(`Failed to add category: ${error.message || 'Unknown error'}`)
    }
  }

  // ===============================
  // TIMELOCK AND TREASURY HANDLERS
  // ===============================

  const handleScheduleUpgrade = async () => {
    if (!upgradeForm.newImplementation || !upgradeForm.description) {
      toast.error('Please provide new implementation address and description')
      return
    }

    try {
      await writeScheduleContractUpgrade({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'scheduleContractUpgrade',
        args: [upgradeForm.newImplementation as `0x${string}`, upgradeForm.description],
      })
      
      toast.success(`Contract upgrade scheduled with 72-hour delay`)
      setUpgradeForm({ newImplementation: '', description: '' })
    } catch (error: any) {
      console.error('Schedule upgrade failed:', error)
      toast.error(`Failed to schedule upgrade: ${error.message || 'Unknown error'}`)
    }
  }

  const handleExecuteUpgrade = async () => {
    if (!timelockForm.actionId) {
      toast.error('Please provide action ID to execute')
      return
    }

    try {
      await writeExecuteScheduledUpgrade({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'executeScheduledUpgrade',
        args: [timelockForm.actionId as `0x${string}`],
      })
      
      toast.success(`Contract upgrade executed successfully`)
      setTimelockForm({ actionId: '', reason: '' })
    } catch (error: any) {
      console.error('Execute upgrade failed:', error)
      toast.error(`Failed to execute upgrade: ${error.message || 'Unknown error'}`)
    }
  }

  const handleScheduleParameterChange = async () => {
    if (!parameterForm.functionName || !parameterForm.parameters || !parameterForm.description) {
      toast.error('Please provide function name, parameters, and description')
      return
    }

    try {
      // Convert function name to selector (first 4 bytes of keccak256 hash)
      // This is a simplified approach - in production you'd want proper ABI encoding
      const functionSelector = `0x${parameterForm.functionName}` as `0x${string}`
      
      await writeScheduleAdminParameterChange({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'scheduleAdminParameterChange',
        args: [functionSelector, parameterForm.parameters as `0x${string}`, parameterForm.description],
      })
      
      toast.success(`Parameter change scheduled with 24-hour delay`)
      setParameterForm({ functionName: '', parameters: '', description: '' })
    } catch (error: any) {
      console.error('Schedule parameter change failed:', error)
      toast.error(`Failed to schedule parameter change: ${error.message || 'Unknown error'}`)
    }
  }

  const handleExecuteParameterChange = async () => {
    if (!timelockForm.actionId) {
      toast.error('Please provide action ID to execute')
      return
    }

    try {
      await writeExecuteScheduledParameterChange({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'executeScheduledParameterChange',
        args: [timelockForm.actionId as `0x${string}`],
      })
      
      toast.success(`Parameter change executed successfully`)
      setTimelockForm({ actionId: '', reason: '' })
    } catch (error: any) {
      console.error('Execute parameter change failed:', error)
      toast.error(`Failed to execute parameter change: ${error.message || 'Unknown error'}`)
    }
  }

  const handleCancelTimelockAction = async () => {
    if (!timelockForm.actionId || !timelockForm.reason) {
      toast.error('Please provide action ID and reason for cancellation')
      return
    }

    try {
      await writeCancelTimelockAction({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'cancelTimelockAction',
        args: [timelockForm.actionId as `0x${string}`, timelockForm.reason],
      })
      
      toast.success(`Timelock action cancelled successfully`)
      setTimelockForm({ actionId: '', reason: '' })
    } catch (error: any) {
      console.error('Cancel timelock action failed:', error)
      toast.error(`Failed to cancel action: ${error.message || 'Unknown error'}`)
    }
  }

  const handleSetTreasury = async () => {
    if (!treasuryForm.newTreasuryAddress) {
      toast.error('Please provide new treasury address')
      return
    }

    try {
      await writeSetTreasury({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'setTreasury',
        args: [treasuryForm.newTreasuryAddress as `0x${string}`],
      })
      
      toast.success(`Treasury change scheduled with 48-hour delay`)
      setTreasuryForm({ newTreasuryAddress: '' })
    } catch (error: any) {
      console.error('Set treasury failed:', error)
      toast.error(`Failed to set treasury: ${error.message || 'Unknown error'}`)
    }
  }

  const handleConfirmTreasuryChange = async () => {
    try {
      await writeConfirmTreasuryChange({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'confirmTreasuryChange',
      })
      
      toast.success(`Treasury change confirmed successfully`)
    } catch (error: any) {
      console.error('Confirm treasury change failed:', error)
      toast.error(`Failed to confirm treasury change: ${error.message || 'Unknown error'}`)
    }
  }

  const handleSetMaxTradesPerBlock = async () => {
    if (!priceForm.maxTradesPerBlock) {
      toast.error('Please provide max trades per block value')
      return
    }

    try {
      await writeSetMaxTradesPerBlock({
        address: OPINION_CORE_ADDRESS,
        abi: OPINION_CORE_ABI,
        functionName: 'setMaxTradesPerBlock',
        args: [BigInt(priceForm.maxTradesPerBlock)],
      })
      
      toast.success(`Max trades per block updated to: ${priceForm.maxTradesPerBlock}`)
      setPriceForm(prev => ({ ...prev, maxTradesPerBlock: '' }))
    } catch (error: any) {
      console.error('Set max trades per block failed:', error)
      toast.error(`Failed to set max trades per block: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <>
      <ExtensionErrorSuppressor />
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">OpinionMarketCap Contract Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && <Badge className="bg-red-600 text-white">ADMIN</Badge>}
            {isModerator && <Badge className="bg-yellow-600 text-white">MODERATOR</Badge>}
            <div className="text-right">
              <p className="text-sm text-gray-400">Connected as:</p>
              <p className="text-sm text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mb-8">
          <AdminAccessChecker />
        </div>

        {/* Contract Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Opinions</p>
                  <p className="text-2xl font-bold text-white">{contractStats.totalOpinions}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Opinions</p>
                  <p className="text-2xl font-bold text-white">{contractStats.activeOpinions}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-white">${contractStats.totalVolume}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Contract Status</p>
                  <p className={`text-lg font-bold ${contractStats.isPaused ? 'text-red-400' : 'text-green-400'}`}>
                    {contractStats.isPaused ? 'Paused' : 'Active'}
                  </p>
                </div>
                {contractStats.isPaused ? 
                  <Pause className="w-8 h-8 text-red-500" /> : 
                  <Play className="w-8 h-8 text-green-500" />
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Functions */}
        <Tabs defaultValue="moderation" className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="timelock" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Timelock
            </TabsTrigger>
            <TabsTrigger value="treasury" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Treasury
            </TabsTrigger>
          </TabsList>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <AdminActions 
              contractStats={contractStats}
              onStatsUpdate={updateContractStats}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Controls */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Contract Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleTogglePause}
                    className={`w-full ${contractStats.isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {contractStats.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {contractStats.isPaused ? 'Unpause Contract' : 'Pause Contract'}
                  </Button>
                  
                  <Button 
                    onClick={handleTogglePublicCreation}
                    variant="outline"
                    className="w-full"
                  >
                    {contractStats.publicCreationEnabled ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                    {contractStats.publicCreationEnabled ? 'Disable Public Creation' : 'Enable Public Creation'}
                  </Button>
                </CardContent>
              </Card>

              {/* Price Settings */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Price Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Price (USDC)
                    </label>
                    <Input
                      value={priceForm.minPrice}
                      onChange={(e) => setPriceForm({ ...priceForm, minPrice: e.target.value })}
                      placeholder="1.00"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Creation Fee (USDC)
                    </label>
                    <Input
                      value={priceForm.creationFee}
                      onChange={(e) => setPriceForm({ ...priceForm, creationFee: e.target.value })}
                      placeholder="1.00"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Price Change (%)
                    </label>
                    <Input
                      value={priceForm.maxChange}
                      onChange={(e) => setPriceForm({ ...priceForm, maxChange: e.target.value })}
                      placeholder="200"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <Button onClick={handleUpdatePrices} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Update Prices
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-500" />
                  Role Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User Address
                    </label>
                    <Input
                      value={roleForm.address}
                      onChange={(e) => setRoleForm({ ...roleForm, address: e.target.value })}
                      placeholder="0x..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role Type
                    </label>
                    <select 
                      value={roleForm.role}
                      onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleRoleManagement('grant')}
                    disabled={!roleForm.address}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Grant Role
                  </Button>
                  <Button 
                    onClick={() => handleRoleManagement('revoke')}
                    disabled={!roleForm.address}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Revoke Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  Category Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add Single Category
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={categoryForm.newCategory}
                      onChange={(e) => setCategoryForm({ ...categoryForm, newCategory: e.target.value })}
                      placeholder="New category name"
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                    />
                    <Button 
                      onClick={() => handleAddCategory(false)}
                      disabled={!categoryForm.newCategory}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add Multiple Categories (comma separated)
                  </label>
                  <Textarea
                    value={categoryForm.multipleCategories}
                    onChange={(e) => setCategoryForm({ ...categoryForm, multipleCategories: e.target.value })}
                    placeholder="Category1, Category2, Category3"
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                  <Button 
                    onClick={() => handleAddCategory(true)}
                    disabled={!categoryForm.multipleCategories}
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Add Multiple
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-cyan-500" />
                  Contract Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fee Manager Address
                  </label>
                  <Input
                    value={contractForm.feeManagerAddress}
                    onChange={(e) => setContractForm({ ...contractForm, feeManagerAddress: e.target.value })}
                    placeholder="0x..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pool Manager Address
                  </label>
                  <Input
                    value={contractForm.poolManagerAddress}
                    onChange={(e) => setContractForm({ ...contractForm, poolManagerAddress: e.target.value })}
                    placeholder="0x..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Treasury Address
                  </label>
                  <Input
                    value={contractForm.treasuryAddress}
                    onChange={(e) => setContractForm({ ...contractForm, treasuryAddress: e.target.value })}
                    placeholder="0x..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Update Contract Addresses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timelock Tab */}
          <TabsContent value="timelock" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schedule Contract Upgrade */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-purple-500" />
                    Schedule Contract Upgrade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Implementation Address
                    </label>
                    <Input
                      value={upgradeForm.newImplementation}
                      onChange={(e) => setUpgradeForm({ ...upgradeForm, newImplementation: e.target.value })}
                      placeholder="0x..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upgrade Description
                    </label>
                    <Textarea
                      value={upgradeForm.description}
                      onChange={(e) => setUpgradeForm({ ...upgradeForm, description: e.target.value })}
                      placeholder="Describe the upgrade changes..."
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleScheduleUpgrade}
                    disabled={!upgradeForm.newImplementation || !upgradeForm.description}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Schedule Upgrade (72h delay)
                  </Button>
                </CardContent>
              </Card>

              {/* Schedule Parameter Change */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-500" />
                    Schedule Parameter Change
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Function Selector (hex)
                    </label>
                    <Input
                      value={parameterForm.functionName}
                      onChange={(e) => setParameterForm({ ...parameterForm, functionName: e.target.value })}
                      placeholder="0x12345678"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Encoded Parameters (hex)
                    </label>
                    <Input
                      value={parameterForm.parameters}
                      onChange={(e) => setParameterForm({ ...parameterForm, parameters: e.target.value })}
                      placeholder="0x..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Change Description
                    </label>
                    <Textarea
                      value={parameterForm.description}
                      onChange={(e) => setParameterForm({ ...parameterForm, description: e.target.value })}
                      placeholder="Describe the parameter changes..."
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleScheduleParameterChange}
                    disabled={!parameterForm.functionName || !parameterForm.parameters || !parameterForm.description}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Change (24h delay)
                  </Button>
                </CardContent>
              </Card>

              {/* Execute Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Execute Scheduled Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Action ID (bytes32)
                    </label>
                    <Input
                      value={timelockForm.actionId}
                      onChange={(e) => setTimelockForm({ ...timelockForm, actionId: e.target.value })}
                      placeholder="0x..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleExecuteUpgrade}
                      disabled={!timelockForm.actionId}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Execute Upgrade
                    </Button>
                    <Button 
                      onClick={handleExecuteParameterChange}
                      disabled={!timelockForm.actionId}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Execute Parameter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    Cancel Scheduled Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Action ID to Cancel
                    </label>
                    <Input
                      value={timelockForm.actionId}
                      onChange={(e) => setTimelockForm({ ...timelockForm, actionId: e.target.value })}
                      placeholder="0x..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cancellation Reason
                    </label>
                    <Textarea
                      value={timelockForm.reason}
                      onChange={(e) => setTimelockForm({ ...timelockForm, reason: e.target.value })}
                      placeholder="Reason for cancellation..."
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleCancelTimelockAction}
                    disabled={!timelockForm.actionId || !timelockForm.reason}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel Action
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pending Actions Display */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Pending Timelock Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingActions.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No pending actions</p>
                ) : (
                  <div className="space-y-2">
                    {pendingActions.map((action, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{action.type}</p>
                          <p className="text-gray-400 text-sm">{action.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 text-sm">Executes in</p>
                          <p className="text-white text-sm">{Math.max(0, Math.ceil((action.executeTime - Date.now()) / (1000 * 60 * 60)))}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Set Treasury */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Schedule Treasury Change
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Treasury Address
                    </label>
                    <Input
                      value={treasuryForm.newTreasuryAddress}
                      onChange={(e) => setTreasuryForm({ newTreasuryAddress: e.target.value })}
                      placeholder="0x..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <Button 
                    onClick={handleSetTreasury}
                    disabled={!treasuryForm.newTreasuryAddress}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Schedule Treasury Change (48h delay)
                  </Button>
                  
                  <div className="border-t border-gray-600 pt-4 mt-4">
                    <Button 
                      onClick={handleConfirmTreasuryChange}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Pending Treasury Change
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limiting Settings */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Rate Limiting Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Trades Per Block
                    </label>
                    <Input
                      type="number"
                      value={priceForm.maxTradesPerBlock}
                      onChange={(e) => setPriceForm({ ...priceForm, maxTradesPerBlock: e.target.value })}
                      placeholder="0 = unlimited"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-gray-400 text-xs mt-1">Current: {currentSettings.maxTradesPerBlock} (0 = disabled)</p>
                  </div>
                  <Button 
                    onClick={handleSetMaxTradesPerBlock}
                    disabled={!priceForm.maxTradesPerBlock}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Update Rate Limit
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Treasury Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Treasury Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Current Treasury</p>
                    <p className="text-white font-mono text-sm break-all">{currentSettings.treasury || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Pending Treasury</p>
                    <p className="text-white font-mono text-sm break-all">
                      {currentSettings.pendingTreasury ? currentSettings.pendingTreasury : 'None'}
                    </p>
                  </div>
                </div>
                {currentSettings.pendingTreasury && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Treasury change pending. You can confirm it after the 48-hour delay period.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </>
  )
}