'use client';

import { DollarSign, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatUSDC, CONTRACTS } from '../hooks/use-user-profile';

interface ProfileFeeBannerProps {
  accumulatedFees: number;
  onClaimFees: () => void;
  isClaimingFees: boolean;
  claimSuccess: boolean;
  claimError: Error | null;
  transactionHash: string | null | undefined;
  isOwnProfile: boolean;
  targetAddress: string;
}

export function ProfileFeeBanner({
  accumulatedFees,
  onClaimFees,
  isClaimingFees,
  claimSuccess,
  claimError,
  transactionHash,
  isOwnProfile,
  targetAddress,
}: ProfileFeeBannerProps) {
  if (accumulatedFees <= 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <div className="w-14 h-14 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
          <DollarSign className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No Fees Available</h3>
        <p className="text-sm text-muted-foreground">Start trading and creating opinions to earn fees!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 overflow-hidden">
      <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Icon + Amount */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Fees Available to Claim</div>
            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text">
              ${accumulatedFees.toFixed(6)}
            </div>
            <div className="text-sm text-emerald-400 font-medium">USDC</div>
          </div>
        </div>

        {/* Claim Button */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cta-pulse"
              onClick={onClaimFees}
              disabled={isClaimingFees}
            >
              {isClaimingFees ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : claimSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Claimed!
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Claim {formatUSDC(accumulatedFees)}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {claimError && (
        <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{claimError.message || 'Transaction failed'}</span>
          </div>
        </div>
      )}

      {claimSuccess && transactionHash && (
        <div className="mx-6 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Transaction Successful!</span>
            </div>
            <a
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Collapsible Contract Info */}
      <details className="px-6 pb-4">
        <summary className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors">
          Contract Details
        </summary>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 font-mono">
          <div><span className="text-foreground/60">FeeManager:</span> {CONTRACTS.FEE_MANAGER}</div>
          <div><span className="text-foreground/60">Your Address:</span> {targetAddress}</div>
          <div><span className="text-foreground/60">Amount:</span> {accumulatedFees.toFixed(6)} USDC</div>
        </div>
      </details>
    </div>
  );
}
