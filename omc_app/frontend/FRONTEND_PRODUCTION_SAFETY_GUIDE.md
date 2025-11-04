# Frontend Production Safety Guide

## 🛡️ Overview

This guide documents the comprehensive production safety system implemented for OpinionMarketCap mainnet deployment. All components are designed to protect users from financial loss and provide clear warnings about real money transactions.

## 📋 Safety Component Checklist

### ✅ High Priority (Essential for Mainnet)
- [x] **TransactionSafetyModal** - Comprehensive confirmation for all real money transactions
- [x] **SlippageProtection** - Price impact warnings and tolerance controls  
- [x] **GasPriceWarning** - Real-time gas cost estimation and warnings
- [x] **TransactionErrorBoundary** - Recovery system for failed transactions
- [x] **Environment Detection** - Automatic testnet/mainnet switching with warnings
- [x] **UserEducationModal** - Mandatory education for new users and mainnet warnings

### ✅ Medium Priority (Highly Recommended)
- [x] **SystemStatus** - Network health monitoring and RPC failure detection
- [x] **TransactionHistory** - Complete transaction tracking and recovery
- [x] **Production Wagmi Config** - Environment-aware RPC configuration with fallbacks

### ✅ Low Priority (Nice to Have)  
- [x] **Safety Utilities** - Helper functions and validation
- [x] **Comprehensive Documentation** - Integration guides and best practices

## 🔧 Integration Instructions

### 1. Environment Configuration

First, ensure your environment is properly configured:

```typescript
// Update your .env files
// For testnet:
NEXT_PUBLIC_ENVIRONMENT=testnet
NEXT_PUBLIC_CHAIN_ID=84532

// For mainnet:
NEXT_PUBLIC_ENVIRONMENT=mainnet  
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_OPINION_CORE_ADDRESS=0x... // Set after deployment
NEXT_PUBLIC_FEE_MANAGER_ADDRESS=0x... // Set after deployment
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=0x... // Set after deployment
NEXT_PUBLIC_TREASURY_ADDRESS=0x... // Set after deployment
```

### 2. Wagmi Configuration

Replace your existing wagmi configuration:

```typescript
// lib/wagmi.ts - Replace with wagmi-production.ts
import { wagmiConfig } from './wagmi-production';

// This provides:
// - Environment-aware chain selection
// - RPC failover for reliability
// - Persistent wallet state with backup
// - Connection health monitoring
```

### 3. Root Layout Integration

Update your root layout to include safety providers:

```typescript
// app/layout.tsx
import { TransactionErrorBoundary } from '@/components/safety';
import { EnvironmentBanner } from '@/components/EnvironmentBanner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TransactionErrorBoundary>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider>
              <EnvironmentBanner />
              {children}
            </RainbowKitProvider>
          </WagmiProvider>
        </TransactionErrorBoundary>
      </body>
    </html>
  );
}
```

### 4. Transaction Modal Integration

Replace existing transaction modals with safety-enhanced versions:

```typescript
// Example: Enhanced Trading Modal
import { 
  TransactionSafetyModal, 
  SlippageProtection,
  GasPriceWarning,
  validateTransactionSafety 
} from '@/components/safety';

function TradingModal({ opinionId, opinionData }) {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  const handleSubmit = async (formData) => {
    // Prepare transaction details
    const details = {
      type: 'submit_answer' as const,
      amount: opinionData.nextPrice,
      description: `Submit answer: ${formData.answer}`,
      additionalInfo: {
        opinionId,
        newPrice: opinionData.nextPrice,
        oldPrice: opinionData.lastPrice
      }
    };

    // Validate safety
    const safety = await validateTransactionSafety(details);
    if (!safety.safe) {
      alert('Safety check failed: ' + safety.blockingIssues.join(', '));
      return;
    }

    setTransactionDetails(details);
    setShowSafetyModal(true);
  };

  const handleSafetyConfirm = (options) => {
    // Proceed with transaction using safety options
    executeTransaction(transactionDetails, options);
    setShowSafetyModal(false);
  };

  return (
    <>
      {/* Your existing modal UI */}
      <SlippageProtection 
        expectedPrice={opinionData.nextPrice}
        currentPrice={opinionData.lastPrice}
        onSlippageChange={setSlippageTolerance}
        onMaxPriceChange={setMaxPrice}
      />
      
      <GasPriceWarning 
        estimatedGas={BigInt(150000)}
        transactionType="Submit Answer"
      />

      <TransactionSafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onConfirm={handleSafetyConfirm}
        transactionDetails={transactionDetails}
      />
    </>
  );
}
```

### 5. User Education Integration

Add education checks to your main app:

```typescript
// app/page.tsx or providers.tsx
import { UserEducationModal, SafetyUtils } from '@/components/safety';

function App() {
  const [showEducation, setShowEducation] = useState(false);
  const { address } = useAccount();
  const isMainnetEnv = isMainnet();

  useEffect(() => {
    if (!address) return;

    // Check if education is needed
    const needsFirstTime = !SafetyUtils.hasCompletedEducation('first-time');
    const needsMainnet = isMainnetEnv && !SafetyUtils.hasCompletedEducation('mainnet-warning');
    const needsRefresh = SafetyUtils.needsEducationRefresh('mainnet-warning');

    if (needsFirstTime || needsMainnet || needsRefresh) {
      setShowEducation(true);
    }
  }, [address, isMainnetEnv]);

  return (
    <>
      <UserEducationModal
        isOpen={showEducation}
        onClose={() => setShowEducation(false)}
        onComplete={(completed) => {
          if (completed) {
            SafetyUtils.logSafetyEvent('education_completed');
          }
          setShowEducation(false);
        }}
        variant={isMainnetEnv ? 'mainnet-warning' : 'first-time'}
      />
      
      {/* Rest of your app */}
    </>
  );
}
```

### 6. System Status Integration

Add system monitoring to your dashboard:

```typescript
// components/Dashboard.tsx
import { SystemStatus } from '@/components/safety';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Your existing dashboard content */}
      
      <div className="lg:col-span-1">
        <SystemStatus />
      </div>
    </div>
  );
}
```

### 7. Transaction History Integration

Add to user profile/dashboard:

```typescript
// app/profile/page.tsx
import { TransactionHistory } from '@/components/safety';

function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Other profile content */}
      
      <TransactionHistory 
        maxItems={50}
        showFilters={true}
      />
    </div>
  );
}
```

## 🚨 Mainnet Deployment Checklist

Before deploying to mainnet, ensure:

### Environment Variables
- [ ] `NEXT_PUBLIC_ENVIRONMENT=mainnet`
- [ ] `NEXT_PUBLIC_CHAIN_ID=8453`  
- [ ] All mainnet contract addresses configured
- [ ] WalletConnect project ID set
- [ ] Alchemy API key configured (optional but recommended)

### Safety Features
- [ ] TransactionSafetyModal integrated in all transaction flows
- [ ] UserEducationModal triggers on first mainnet use
- [ ] Environment warnings display correctly
- [ ] Gas price monitoring active
- [ ] Error boundaries catch and handle failures
- [ ] Transaction history tracks all operations

### Testing
- [ ] Test all transaction types with safety modals
- [ ] Verify environment switching works correctly
- [ ] Confirm gas price warnings display properly
- [ ] Test error recovery flows
- [ ] Validate education completion requirements

### Analytics & Monitoring  
- [ ] Safety events logged for analytics
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] User feedback collection enabled

## 🛠️ Component Reference

### TransactionSafetyModal
Comprehensive safety confirmation for all real money transactions.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `onConfirm: (options: SafetyConfirmationOptions) => void` - Confirmation handler
- `transactionDetails: TransactionDetails` - Transaction information
- `isLoading?: boolean` - Loading state
- `error?: string | null` - Error message

**Features:**
- Real money warnings for mainnet
- Slippage tolerance controls
- Gas price limits
- Risk acknowledgment required
- 5-second safety delay
- Transaction cost estimation

### SlippageProtection  
Price impact analysis and slippage tolerance controls.

**Props:**
- `expectedPrice: bigint` - Expected transaction price
- `currentPrice: bigint` - Current market price
- `onSlippageChange: (tolerance: number) => void` - Tolerance change handler
- `onMaxPriceChange: (maxPrice: bigint) => void` - Max price change handler

**Features:**
- Automatic price impact calculation
- Visual impact level indicators
- Preset tolerance options
- Custom tolerance slider
- Protection details explanation

### GasPriceWarning
Real-time gas price monitoring and cost estimation.

**Props:**
- `estimatedGas?: bigint` - Estimated gas usage
- `transactionType: string` - Type of transaction
- `onGasLimitChange?: (gasLimit: bigint) => void` - Gas limit change handler

**Features:**
- Real-time gas price monitoring
- Cost estimation in USD
- Speed/cost trade-off options
- High gas price warnings
- Network congestion indicators

### UserEducationModal
Comprehensive user education system.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler  
- `onComplete: (completed: boolean) => void` - Completion handler
- `variant?: 'first-time' | 'mainnet-warning'` - Education type

**Features:**
- Interactive lessons with quizzes
- Risk disclosure requirements
- Progress tracking
- Completion validation
- Mainnet-specific warnings

## 📊 Safety Metrics

Track these key safety metrics:

- **Education Completion Rate** - % of users completing required education
- **Safety Modal Abandonment** - Users who cancel at safety confirmation
- **Failed Transaction Recovery** - Success rate of retry attempts
- **Gas Price Warnings** - Frequency of high gas price alerts
- **Error Boundary Triggers** - Rate of error recovery activations

## 🔧 Troubleshooting

### Common Issues

1. **Environment Detection Not Working**
   - Check `NEXT_PUBLIC_ENVIRONMENT` variable
   - Verify build process includes environment variables
   - Clear localStorage to reset cached environment

2. **Safety Modals Not Appearing**
   - Verify `validateTransactionSafety` is called
   - Check education completion status
   - Ensure proper integration in transaction flows

3. **RPC Connection Issues**
   - Check Alchemy API key configuration
   - Verify fallback RPC endpoints
   - Monitor connection health status

4. **Transaction History Not Saving**
   - Check localStorage availability
   - Verify wallet address consistency
   - Monitor storage quota limits

## 🚀 Performance Considerations

- Safety components are optimized for minimal bundle impact
- Education modals lazy-load content
- Transaction history paginates large datasets
- System status checks cache results
- Error boundaries prevent cascade failures

## 🔒 Security Notes

- All user inputs are validated and sanitized
- Private keys never stored in components
- Transaction details logged securely
- Error information filtered for sensitive data
- Analytics data anonymized appropriately

This production safety system provides comprehensive protection for mainnet users while maintaining excellent user experience. All components work together to create multiple layers of safety validation and user education.