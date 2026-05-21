'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { fmtUSD, type DisplayTake } from '../../../_data/mock-takes';

/**
 * One-click share buttons — X (Twitter), Farcaster (Warpcast), and a generic
 * copy/share fallback. Built to match Poster Arcade visual language:
 * 2.5px ink border, hard offset shadow, pill row, hover lift.
 *
 * Composes platform-native intent URLs (no API calls, no auth). Falls back to
 * navigator.share() on mobile, else copies the URL to clipboard.
 */
type ShareTakeProps = {
  take: DisplayTake;
  /** Optional explicit URL override (e.g. include slug for SEO). */
  url?: string;
  /** Visual size — sm for inline header, md for prominent CTA placement. */
  size?: 'sm' | 'md';
  /**
   * Copy variant.
   *  - 'default' → neutral "trade the take" framing for any viewer.
   *  - 'king'    → brag framing for the current answer owner ("come dethrone me").
   */
  variant?: 'default' | 'king';
  /** Stop click bubbling — needed when nested inside a parent <Link>. */
  stopPropagation?: boolean;
  className?: string;
};

const APP_URL = 'https://app.opinionmarketcap.xyz';
const TWITTER_HANDLE = 'OpinionMktCap';

export function ShareTake({
  take,
  url,
  size = 'sm',
  variant = 'default',
  stopPropagation = false,
  className,
}: ShareTakeProps) {
  const shareUrl = url ?? `${APP_URL}/opinions/${take.id}`;

  // Crafted to be short, opinionated, screen-readable. Twitter caps at 280 incl
  // URL (URL counts as 23). We keep the body well under ~250 chars.
  const { tweetText, castText, nativeText } = useMemo(() => {
    const q = take.question;
    const a = take.answer === 'UNANSWERED' ? 'no king yet' : take.answer;
    const price = fmtUSD(take.price);
    if (variant === 'king') {
      const tweet = `👑 I hold the floor on "${q}" → ${a}.\n\nCome dethrone me. Floor: ${price} on @${TWITTER_HANDLE}`;
      const cast  = `👑 I hold the floor on "${q}" → ${a}.\n\nCome dethrone me. Floor: ${price} on OMC`;
      const native = `I'm king of "${q}" → ${a}. Come dethrone me — ${shareUrl}`;
      return { tweetText: tweet, castText: cast, nativeText: native };
    }
    const tweet = `"${q}" → ${a}\n\nFloor: ${price} · Trade the take on @${TWITTER_HANDLE}`;
    const cast  = `"${q}" → ${a}\n\nFloor: ${price} · live opinion market on OMC`;
    const native = `${q} → ${a} on OMC — ${shareUrl}`;
    return { tweetText: tweet, castText: cast, nativeText: native };
  }, [take.question, take.answer, take.price, shareUrl, variant]);

  const twitterHref =
    `https://twitter.com/intent/tweet` +
    `?text=${encodeURIComponent(tweetText)}` +
    `&url=${encodeURIComponent(shareUrl)}`;

  // Farcaster (Warpcast was renamed to Farcaster app — farcaster.xyz is canonical).
  const farcasterHref =
    `https://farcaster.xyz/~/compose` +
    `?text=${encodeURIComponent(castText)}` +
    `&embeds[]=${encodeURIComponent(shareUrl)}`;

  const onShare = async (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: take.question, text: nativeText, url: shareUrl });
        return;
      } catch {
        // user canceled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('link copied', { description: shareUrl });
    } catch {
      toast.error('could not copy', { description: 'select the URL and copy it manually' });
    }
  };

  // When embedded inside a parent <Link>, intercept clicks on the social-intent
  // anchors so the parent's navigation doesn't fire alongside the new tab.
  const onAnchorClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
  };

  const btnBase =
    'inline-flex items-center justify-center border-[2.5px] border-ink rounded-pill ' +
    'bg-paper text-ink shadow-[3px_3px_0_var(--ink)] ' +
    'transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] ' +
    'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--ink)]';
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div
      className={
        'inline-flex items-center gap-1.5 ' + (className ?? '')
      }
      role="group"
      aria-label="Share this take"
    >
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onAnchorClick}
        aria-label="Share on X (Twitter)"
        title="Share on X"
        className={btnBase + ' ' + btnSize}
      >
        <XIcon size={iconSize} />
      </a>
      <a
        href={farcasterHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onAnchorClick}
        aria-label="Cast on Farcaster"
        title="Cast on Farcaster"
        className={btnBase + ' ' + btnSize}
      >
        <FarcasterIcon size={iconSize} />
      </a>
      <button
        type="button"
        onClick={onShare}
        aria-label="Copy link or share"
        title="Copy link"
        className={btnBase + ' ' + btnSize}
      >
        <LinkIcon size={iconSize} />
      </button>
    </div>
  );
}

/* ───────── inline brand SVGs — keep the bundle thin ───────── */

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2H21.5l-7.49 8.56L23 22h-6.81l-5.34-6.97L4.74 22H1.48l8.02-9.17L1 2h6.92l4.82 6.36L18.244 2Zm-1.195 18.06h1.84L7.05 3.86H5.08l11.97 16.2Z" />
    </svg>
  );
}

function FarcasterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 4h20v4h-2v2h-2v14h2v2h-6v-2h2V14a6 6 0 0 0-12 0v10h2v2H4v-2h2V10H4V8h2V4Z" />
    </svg>
  );
}

function LinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}
