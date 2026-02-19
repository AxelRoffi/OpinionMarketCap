'use client';

import { Coins, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface FeeBannerProps {
  accumulatedFees: number;
  onClaimFees: () => void;
  isClaimingFees: boolean;
  claimSuccess: boolean;
  claimError: Error | null;
  transactionHash?: string;
  isOwnProfile: boolean;
}

export function FeeBanner({
  accumulatedFees,
  onClaimFees,
  isClaimingFees,
  claimSuccess,
  claimError,
  transactionHash,
  isOwnProfile,
}: FeeBannerProps) {
  const animatedFees = useAnimatedCounter(accumulatedFees, 800);

  const formatAnimated = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!isOwnProfile || accumulatedFees === 0) return null;

  return (
    <div className={`rounded-xl border p-4 ${
      claimSuccess
        ? 'bg-green-500/5 border-green-500/30'
        : 'bg-primary/5 border-primary/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            claimSuccess ? 'bg-green-500/10' : 'bg-primary/10'
          }`}>
            {claimSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Coins className="w-5 h-5 text-primary animate-pulse" />
            )}
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {claimSuccess ? 'Fees Claimed Successfully!' : 'Claimable Creator Fees'}
            </div>
            <div className={`text-xl font-bold ${claimSuccess ? 'text-green-400' : 'text-primary'}`}>
              {formatAnimated(animatedFees)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transactionHash && claimSuccess && (
            <a
              href={`https://sepolia.basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
            >
              View TX
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {!claimSuccess && (
            <Button
              onClick={onClaimFees}
              disabled={isClaimingFees || accumulatedFees === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isClaimingFees ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Claim Fees
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {claimError && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          Error: {claimError.message}
        </div>
      )}
    </div>
  );
}
