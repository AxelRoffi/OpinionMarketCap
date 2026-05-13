'use client';

import Link from 'next/link';
import { Btn, Sticker, MonoNum, Chip, CopyField } from '@/components/poster-arcade';
import { SectionTitle } from '../_components/SectionTitle';
import { StatStrip, type StatItem } from '../_components/StatStrip';
import { MOCK_TAKES, CAT_MAP, fmtUSD } from '../_data/mock-takes';
import { getReferralData, fmtDate, type ReferralFriend, type ReferralActivity } from '../_data/referrals';

export default function ReferralsPage() {
  const data = getReferralData();

  const stats: StatItem[] = [
    { label: 'invited',  value: String(data.invited) },
    { label: 'joined',   value: String(data.joined) },
    { label: 'earnings', value: `+${fmtUSD(data.earnings)}`, tone: 'gain' },
    { label: 'cut',      value: '1%', glyph: '🤝' },
  ];

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ viral loop
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[44px] md:text-[64px] text-ink mt-1">
          BRING YOUR CREW.
        </h1>
        <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-2 max-w-xl">
          You earn <span className="font-mono font-extrabold">1%</span> of every flip from anyone you bring. Forever.
        </p>
      </section>

      {/* ────────────────  LINK CARD  ──────────────── */}
      <section className="px-4 md:px-10 pb-4">
        <Sticker bg="paper" tilt={-1} shadow={5} className="p-5 md:p-7">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-display text-[11px] font-extrabold tracking-[0.16em] uppercase text-ink/60">
                your link
              </p>
              <p className="font-display font-black text-[18px] md:text-[22px] tracking-tight mt-1">
                Share. Earn. Repeat.
              </p>
            </div>
            <Chip bg="cool" sm>★ code · {data.shortCode}</Chip>
          </div>

          <div className="mt-4">
            <CopyField
              value={data.link}
              toastMessage="link copied · share it everywhere"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ShareButton href={twitterShareUrl(data.link)} label="share on x"     icon="𝕏" />
            <ShareButton href={farcasterShareUrl(data.link)} label="cast it"      icon="◆" />
            <ShareButton href={telegramShareUrl(data.link)} label="dm a friend"   icon="✈" />
          </div>
        </Sticker>
      </section>

      {/* ────────────────  STATS  ──────────────── */}
      <section className="px-4 md:px-10 pt-2">
        <StatStrip items={stats} />
      </section>

      {/* ────────────────  FRIENDS  ──────────────── */}
      <section className="px-4 md:px-10 pt-10 pb-16">
        <SectionTitle meta={<><MonoNum>{data.friends.length}</MonoNum> joined</>}>
          🤝 YOUR CREW
        </SectionTitle>

        {data.friends.length === 0 ? (
          <Sticker bg="paper" tilt={-1.5} className="text-center max-w-md mx-auto">
            <div className="font-display font-black text-[20px] tracking-tight">
              NO ONE YET.
            </div>
            <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
              Share the link. The minute they flip, you earn.
            </div>
          </Sticker>
        ) : (
          <div className="space-y-3">
            {data.friends.map((f) => (
              <FriendRow key={f.handle} friend={f} />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  FOOTER CTA  ──────────────── */}
      <section className="px-4 md:px-10 py-8 flex items-center justify-center">
        <Btn href="/portfolio" variant="cool" size="lg">
          back to your room →
        </Btn>
      </section>
    </>
  );
}

/* ─────────────────────────── FRIEND ROW ─────────────────────────── */

function FriendRow({ friend }: { friend: ReferralFriend }) {
  return (
    <article className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[4px_4px_0_var(--ink)] p-4 md:p-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden className="text-[22px]">{friend.avatar}</span>
          <Link
            href={`/profile/${encodeURIComponent(friend.handle)}`}
            className="font-display font-black text-[15px] md:text-[17px] tracking-tight hover:underline truncate"
          >
            @{friend.handle}
          </Link>
          <Chip bg="canvas" sm>joined {fmtDate(friend.joinedISO)}</Chip>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-[9px] font-extrabold tracking-[0.14em] uppercase text-ink/55">
            you earned
          </div>
          <MonoNum className="text-[16px] md:text-[18px] text-gain">
            +{fmtUSD(friend.totalEarnedByYou)}
          </MonoNum>
        </div>
      </header>

      {friend.activity.length > 0 && (
        <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3 space-y-2">
          {friend.activity.map((a, i) => (
            <ActivityLine key={i} a={a} />
          ))}
        </div>
      )}

      {friend.activity.length === 0 && (
        <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3 font-display text-[11px] font-bold text-ink/55">
          no activity yet. patience ★
        </div>
      )}
    </article>
  );
}

function ActivityLine({ a }: { a: ReferralActivity }) {
  const take = MOCK_TAKES.find((t) => t.id === a.takeId);
  const cat = take ? CAT_MAP[take.category] : null;

  return (
    <Link
      href={`/opinions/${a.takeId}`}
      className="flex items-center gap-2 justify-between text-[12px] hover:underline"
    >
      <span className="flex items-center gap-2 min-w-0">
        <span aria-hidden className="text-[14px]">{cat?.emoji ?? '·'}</span>
        <span className="font-display font-bold truncate">
          <span className="text-ink/55">{a.kind === 'mint' ? 'minted' : 'flipped'} </span>
          <span className="text-ink">{take?.answer ?? '—'}.</span>
        </span>
      </span>
      <span className="flex items-center gap-3 shrink-0">
        <span className="font-display text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/45">
          {fmtDate(a.date)}
        </span>
        {a.earnedByYou > 0 && (
          <MonoNum className="text-gain text-[12px]">+{fmtUSD(a.earnedByYou)}</MonoNum>
        )}
      </span>
    </Link>
  );
}

/* ─────────────────────────── SHARE BUTTONS ─────────────────────────── */

function ShareButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-pill border-2 border-ink bg-canvas text-ink font-display font-extrabold text-[11px] tracking-[0.06em] uppercase px-3 py-1.5 shadow-[2px_2px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_var(--ink)] transition-all"
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function twitterShareUrl(link: string) {
  const text = encodeURIComponent('I just minted a take on @OpinionMarketCap. Bring your friends — 1% of every flip, forever.');
  return `https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`;
}

function farcasterShareUrl(link: string) {
  const text = encodeURIComponent('mint a banger w/ me — 1% of every flip, forever');
  return `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(link)}`;
}

function telegramShareUrl(link: string) {
  const text = encodeURIComponent('come mint takes with me · 1% off every flip ★');
  return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
}
