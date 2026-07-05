'use client';

import { useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONTRACTS, USDC_ABI } from '@/lib/contracts';
import { Banknote, Loader2, ShieldAlert } from 'lucide-react';

// Minimal FeeManager ABI for the withdraw flow. withdrawPlatformFees moves
// everything in the contract EXCEPT the creator-claimable pot, so the
// available amount = USDC balance − totalAccumulatedFees.
const FEE_MANAGER_WITHDRAW_ABI = [
  {
    inputs: [],
    name: 'getTotalAccumulatedFees',
    outputs: [{ name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TREASURY_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'withdrawPlatformFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const fmt = (v: bigint | undefined) =>
  v === undefined ? '—' : (Number(v) / 1_000_000).toFixed(2);

export function PlatformFeesPanel() {
  const { address } = useAccount();

  const { data: fmBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.USDC_TOKEN,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [CONTRACTS.FEE_MANAGER],
    query: { refetchInterval: 30_000 },
  });

  const { data: creatorOwed, refetch: refetchOwed } = useReadContract({
    address: CONTRACTS.FEE_MANAGER,
    abi: FEE_MANAGER_WITHDRAW_ABI,
    functionName: 'getTotalAccumulatedFees',
    query: { refetchInterval: 30_000 },
  });

  const { data: treasuryAddr } = useReadContract({
    address: CONTRACTS.FEE_MANAGER,
    abi: FEE_MANAGER_WITHDRAW_ABI,
    functionName: 'treasury',
  });

  const { data: treasuryRole } = useReadContract({
    address: CONTRACTS.FEE_MANAGER,
    abi: FEE_MANAGER_WITHDRAW_ABI,
    functionName: 'TREASURY_ROLE',
  });

  const { data: canWithdraw } = useReadContract({
    address: CONTRACTS.FEE_MANAGER,
    abi: FEE_MANAGER_WITHDRAW_ABI,
    functionName: 'hasRole',
    args: treasuryRole && address ? [treasuryRole, address] : undefined,
    query: { enabled: !!treasuryRole && !!address },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const balance = (fmBalance as bigint | undefined) ?? undefined;
  const owed = (creatorOwed as bigint | undefined) ?? undefined;
  const available =
    balance !== undefined && owed !== undefined
      ? balance > owed
        ? balance - owed
        : 0n
      : undefined;

  useEffect(() => {
    if (isSuccess) {
      toast.success('Platform fees withdrawn to treasury');
      refetchBalance();
      refetchOwed();
    }
  }, [isSuccess, refetchBalance, refetchOwed]);

  useEffect(() => {
    if (error) {
      toast.error('Withdraw failed', {
        description: (error.message || '').split('\n')[0].slice(0, 160),
      });
    }
  }, [error]);

  const onWithdraw = () => {
    if (!treasuryAddr) return;
    writeContract({
      address: CONTRACTS.FEE_MANAGER,
      abi: FEE_MANAGER_WITHDRAW_ABI,
      functionName: 'withdrawPlatformFees',
      args: [CONTRACTS.USDC_TOKEN, treasuryAddr],
    });
  };

  const busy = isPending || isConfirming;
  const nothingToWithdraw = available !== undefined && available === 0n;

  return (
    <Card className="bg-paper border-ink/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-emerald-500" />
          Platform Fees (2%)
          {canWithdraw === false && (
            <Badge className="bg-red-600 ml-2 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> no TREASURY_ROLE
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-ink/60 mt-1">
          The 2% platform fee accumulates inside the FeeManager contract. It only
          moves when a TREASURY_ROLE holder withdraws it to the treasury.
          Creator royalties (claimable pot) are untouched by this action.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="FeeManager balance" value={`${fmt(balance)} USDC`} />
          <StatBox label="Owed to creators" value={`${fmt(owed)} USDC`} />
          <StatBox label="Withdrawable now" value={`${fmt(available)} USDC`} highlight />
        </div>

        <div className="text-xs font-mono text-ink/60 break-all">
          recipient (treasury): {treasuryAddr ?? '…'}
        </div>

        <Button
          onClick={onWithdraw}
          disabled={busy || !treasuryAddr || canWithdraw === false || nothingToWithdraw}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Withdrawing…
            </>
          ) : nothingToWithdraw ? (
            'Nothing to withdraw'
          ) : (
            `Withdraw ${fmt(available)} USDC to treasury`
          )}
        </Button>

        {canWithdraw === false && (
          <p className="text-xs text-red-600">
            Connected wallet lacks TREASURY_ROLE on the FeeManager — connect the
            admin wallet to withdraw.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        highlight ? 'border-emerald-600 bg-emerald-600/10' : 'border-ink/30 bg-canvas/40'
      }`}
    >
      <div className="text-[11px] uppercase tracking-wide text-ink/60">{label}</div>
      <div className="font-mono font-bold text-ink mt-0.5">{value}</div>
    </div>
  );
}
