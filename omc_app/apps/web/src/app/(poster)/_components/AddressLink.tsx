import Link from 'next/link';
import { shortAddress } from '../_lib/chain-adapters';

interface AddressLinkProps {
  address: string | undefined | null;
  /** Optional className passthrough so the link blends with surrounding type. */
  className?: string;
  /** When true the link shows just the short form without the @ prefix. */
  noPrefix?: boolean;
  /** Fallback display when address is missing (e.g. mock take). */
  fallback?: string;
}

/**
 * Renders a wallet address as a short, clickable link to its public profile.
 * Centralizes the @-prefix + short-format pattern so the @ + linking
 * behavior stays consistent across cards, hero stickers, leaderboard rows,
 * and pool / question ownership panels.
 */
export function AddressLink({
  address,
  className,
  noPrefix = false,
  fallback = '—',
}: AddressLinkProps) {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return <span className={className}>{fallback}</span>;
  }
  const label = shortAddress(address);
  return (
    <Link
      href={`/profile/${address}`}
      className={(className ?? '') + ' hover:underline'}
      title={address}
    >
      {noPrefix ? label : `@${label}`}
    </Link>
  );
}
