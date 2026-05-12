'use client';

import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

type WalletBtnProps = {
  /** Visual size. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Poster Arcade wallet connect — wraps RainbowKit's render-prop API so the
 * pill matches the rest of the system (ink border, hard offset shadow, pop-on-click).
 *
 * States:
 *  - not mounted (SSR / first paint) → invisible placeholder so layout doesn't shift
 *  - chain wrong → WRONG NETWORK pop pill (opens chain switcher)
 *  - disconnected → CONNECT pill (opens RainbowKit connect modal)
 *  - connected → shortened handle + small balance, opens account modal
 */
export function WalletBtn({ size = 'sm', className }: WalletBtnProps) {
  const sizing =
    size === 'sm'
      ? 'px-3 py-2 text-[11px]'
      : 'px-4 py-2.5 text-[12px]';

  const pillBase = cn(
    'inline-flex items-center justify-center gap-1.5',
    'rounded-pill border-[2.5px] border-ink',
    'font-display font-black tracking-[0.06em] uppercase',
    'transition-transform duration-100',
    'active:translate-x-[2px] active:translate-y-[2px]',
    sizing,
    className,
  );

  return (
    <RKConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        // Placeholder during SSR so the nav doesn't reflow when scripts hydrate.
        if (!ready) {
          return (
            <span
              aria-hidden
              className={cn(pillBase, 'bg-paper text-ink opacity-0 pointer-events-none')}
              style={{ visibility: 'hidden' }}
            >
              CONNECT
            </span>
          );
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={cn(pillBase, 'bg-paper text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--ink)]')}
            >
              <span aria-hidden>★</span>
              CONNECT
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={cn(pillBase, 'bg-pop text-paper shadow-[3px_3px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--ink)]')}
            >
              WRONG CHAIN
            </button>
          );
        }

        const handle = account.displayName ?? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`;

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className={cn(pillBase, 'bg-cool text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--ink)]')}
            title={account.address}
          >
            <span aria-hidden className="text-[12px]">★</span>
            <span className="font-mono">{handle}</span>
            {account.displayBalance && (
              <span className="hidden sm:inline font-mono opacity-70">
                · {account.displayBalance}
              </span>
            )}
          </button>
        );
      }}
    </RKConnectButton.Custom>
  );
}
