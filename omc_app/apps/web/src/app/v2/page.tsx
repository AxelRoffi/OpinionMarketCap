'use client';

import Link from 'next/link';
import { Sticker, Btn, Chip, MonoNum } from '@/components/poster-arcade';
import { MOCK_TAKES } from './_data/mock-takes';

/* Background rotation for the sticker grid. Index-based, no random. */
const BG_CYCLE = ['pop', 'canvas', 'cool', 'paper'] as const;
const TILT_CYCLE = [-2, 1.5, -1.5, 2] as const;

export default function V2HotWallPage() {
  return (
    <>
      {/* ────────────────  HERO  ──────────────── */}
      <section className="relative px-4 py-10 md:px-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero copy */}
          <div className="lg:col-span-7">
            <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
              ★ Take a stand
            </p>
            <h1 className="font-display font-black tracking-[-0.04em] leading-[0.92] text-[44px] md:text-[64px] lg:text-[78px] mt-2 text-ink">
              Take a stand.
              <br />
              <span className="text-pop">Get paid</span> for it.
            </h1>
            <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-4 max-w-xl">
              Pick the answer. Pay the price. Take the floor.
              You keep <span className="font-mono font-extrabold">3%</span> of every flip — forever. Even after they take it from you.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              <Btn href="/v2/create" variant="pop" size="lg" star>
                Mint your first take
              </Btn>
              <Btn href="/v2/marketplace" variant="ghost" size="lg">
                Browse the floor →
              </Btn>
            </div>
          </div>

          {/* Floating sticker stack */}
          <div className="lg:col-span-5 relative h-[280px] md:h-[340px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute left-[8%] top-[10%]">
                <Sticker bg="cool" tilt={-3} shadow={5}>
                  <Chip bg="pop">⚡ CRYPTO</Chip>
                  <div className="mt-2 font-display text-[11px] font-bold opacity-85 italic">"Best L2?"</div>
                  <div className="mt-1 font-display font-black text-[28px] leading-none tracking-tighter">BASE.</div>
                  <div className="mt-2 flex justify-between"><MonoNum>$312</MonoNum><MonoNum className="text-pop">+9.6%</MonoNum></div>
                </Sticker>
              </div>
              <div className="absolute right-[6%] top-[2%]">
                <Sticker bg="pop" tilt={2.5} shadow={5}>
                  <Chip bg="paper">🤖 AI</Chip>
                  <div className="mt-2 font-display text-[11px] font-bold opacity-85 italic">"AGI by 2030?"</div>
                  <div className="mt-1 font-display font-black text-[28px] leading-none tracking-tighter">PARTIALLY.</div>
                  <div className="mt-2 flex justify-between"><MonoNum>$64</MonoNum><MonoNum>+34%</MonoNum></div>
                </Sticker>
              </div>
              <div className="absolute left-[26%] bottom-[2%]">
                <Sticker bg="canvas" tilt={-1} shadow={6}>
                  <Chip bg="ink">🏀 SPORTS</Chip>
                  <div className="mt-2 font-display text-[11px] font-bold opacity-85 italic">"GOAT?"</div>
                  <div className="mt-1 font-display font-black text-[28px] leading-none tracking-tighter">JORDAN.</div>
                  <div className="mt-2 flex justify-between"><MonoNum>$142</MonoNum><MonoNum>+18%</MonoNum></div>
                </Sticker>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────  HOT WALL  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        <header className="flex items-end justify-between flex-wrap gap-2 mb-5">
          <h2 className="font-display font-black text-[24px] md:text-[32px] tracking-[-0.03em] text-ink">
            🔥 HOT WALL · TODAY
          </h2>
          <div className="font-mono font-extrabold text-[12px] md:text-[13px] text-ink/70">
            <MonoNum>847</MonoNum> takes · <MonoNum>$284k</MonoNum> vol · <MonoNum>12</MonoNum> fresh
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MOCK_TAKES.map((take, i) => {
            const bg = BG_CYCLE[i % BG_CYCLE.length];
            const tilt = TILT_CYCLE[i % TILT_CYCLE.length];
            const chipBg = bg === 'paper' || bg === 'canvas' ? 'ink' : 'paper';
            const isLoss = take.delta.startsWith('-');

            return (
              <Link key={take.id} href={`/v2/opinions/${take.id}`} className="block">
                <Sticker bg={bg} tilt={tilt} tappable>
                  <div className="flex items-center justify-between">
                    <Chip bg={chipBg} sm>
                      {take.category.emoji} {take.category.label}
                    </Chip>
                    <span className="font-mono text-[10px] font-extrabold opacity-60">#{take.id}</span>
                  </div>
                  <div className="font-display text-[11px] font-bold mt-2 opacity-85 italic">"{take.question}"</div>
                  <div className="font-display font-black text-[28px] leading-none tracking-tighter mt-1">{take.answer}.</div>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <div className="font-display text-[9px] font-extrabold uppercase tracking-[0.12em] opacity-60">held</div>
                      <div className="font-display text-[11px] font-bold">@{take.heldBy}</div>
                    </div>
                    <div className="text-right">
                      <MonoNum className="text-[15px] block">{take.price}</MonoNum>
                      <MonoNum className={isLoss ? 'text-pop text-[11px]' : 'text-[11px]'}>{take.delta}</MonoNum>
                    </div>
                  </div>
                </Sticker>
              </Link>
            );
          })}
        </div>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/50 text-center mt-12">
          ★ Phase 1 visual smoke test · live on-chain data lands in Phase 2 ★
        </p>
      </section>
    </>
  );
}
