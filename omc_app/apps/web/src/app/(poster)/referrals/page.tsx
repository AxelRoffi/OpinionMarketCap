'use client';

import { Btn, Sticker } from '@/components/poster-arcade';

/**
 * Referrals is intentionally a "coming soon" placeholder. V4 has no
 * on-chain referral / invite tracking, so anything we render here would
 * be fabricated. We surface the intent of the feature without faking
 * numbers, friend lists, or activity rows.
 */
export default function ReferralsPage() {
  return (
    <>
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ invite + earn — roadmap
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[48px] md:text-[64px] text-ink mt-1">
          REFERRALS.
        </h1>
        <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-2 max-w-2xl">
          Share OMC, earn a slice of every flip your friends make. The
          referral contract isn&apos;t live yet on V4 — when it ships, this
          page becomes your invite link, your friends&apos; activity feed,
          and your referral revenue dashboard.
        </p>
      </section>

      <section className="px-4 md:px-10 pb-16">
        <Sticker bg="canvas" tilt={-1.5} shadow={6} className="max-w-2xl">
          <div className="font-display font-black text-[20px] tracking-tight">
            🚧 NOT WIRED YET.
          </div>
          <p className="font-display text-[12px] font-semibold text-ink/75 mt-2">
            We don&apos;t fabricate stats. Real referral data needs an
            on-chain referral registry — that&apos;s a future contract
            upgrade. For now: mint, trade, exit, reclaim. The rest follows.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Btn href="/create" variant="pop" size="sm" star>
              mint a take →
            </Btn>
            <Btn href="/marketplace" variant="ghost" size="sm">
              browse the floor →
            </Btn>
          </div>
        </Sticker>
      </section>
    </>
  );
}
