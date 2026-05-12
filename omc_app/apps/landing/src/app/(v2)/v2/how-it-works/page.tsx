'use client';

import { useState } from 'react';
import {
  BtnPrimary,
  BtnSecondary,
  CatChip,
  Halftone,
  Nav,
  SiteFooter,
  Sticker,
} from '../../_components';

// ---------- Data ----------

type Step = {
  num: string;
  title: string;
  subtitle: string;
  copy: string;
  detail: string;
  example: { label: string; q: string; a: string; price: string };
  bg: string;
  fg: string;
  tilt: number;
};

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Ask a Question',
    subtitle: 'Mint it. Own it. Earn from it.',
    copy: 'Think of a question people argue about. "Best CRM for startups?" "Most overrated sneaker brand?" "Best pizza in New York?" Mint it on OMC. You just created a market.',
    detail:
      'Set your first answer and an initial price (1–100 USDC). You pay a flat 2 USDC spam fee + lock the initial price as your stake (recoverable if someone flips you, or via Self-Exit). Now you own the question — and you’ll earn 3% royalty on every single trade. Forever.',
    example: { label: 'You mint:', q: '"Best CRM for startups?"', a: 'Your answer: HubSpot', price: 'Starting price: $10 USDC' },
    bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2,
  },
  {
    num: '02',
    title: 'Someone Disagrees',
    subtitle: 'They pay you to prove it.',
    copy: 'Someone thinks "Salesforce" is better? They can\'t just tweet about it. They have to pay the NextPrice — set by an on-chain algorithm — to take ownership.',
    detail:
      'Prices move with the market: −15% to +99% per trade based on activity and 14 entropy sources. Not a fixed bump — a real market. When someone submits a new answer, 95% of what they pay lands in your wallet instantly.',
    example: { label: 'A trader pays:', q: 'New answer: Salesforce', a: 'They pay: $15 USDC', price: 'You receive: $14.25 (95%)' },
    bg: '#4DFFE0', fg: '#15120D', tilt: 1.5,
  },
  {
    num: '03',
    title: 'Everyone Gets Paid',
    subtitle: '98% stays in the community.',
    copy: 'Every trade distributes money instantly. No waiting. No middleman. Smart contracts handle everything on Base. 95% to the previous owner, 3% royalty to the question creator — that’s 98% to the community.',
    detail:
      'Late buyers pay more. Early buyers got in cheap. Either way, when the next person disagrees you keep 95% of their price. The creator keeps earning 3% on every flip. Forever.',
    example: { label: 'After 20 trades:', q: 'Creator earned: $18 royalties', a: 'Current price: $120 USDC', price: 'Total volume: $600 USDC' },
    bg: '#FFFFFF', fg: '#15120D', tilt: -1.5,
  },
];

type Stage = {
  label: string;
  q: string;
  a: string;
  price: number;
  owner: string;
  prevOwner: string | null;
  creator: string;
  action: string;
};

const QUESTION = 'Most overhyped tech CEO?';
const CREATOR  = 'alice.base.eth';

const STAGES: Stage[] = [
  { label: 'Question minted',  q: QUESTION, a: 'Elon Musk',      price: 10, owner: 'alice.base.eth', prevOwner: null,                  creator: CREATOR, action: 'Alice mints the question — locks $10' },
  { label: 'First flip',       q: QUESTION, a: 'Sam Altman',     price: 18, owner: 'bob.base.eth',   prevOwner: 'alice.base.eth',      creator: CREATOR, action: 'Bob disagrees — pays $18' },
  { label: 'Price climbs',     q: QUESTION, a: 'Mark Zuckerberg',price: 29, owner: 'carol.base.eth', prevOwner: 'bob.base.eth',        creator: CREATOR, action: 'Carol jumps in — pays $29' },
  { label: 'Big move',         q: QUESTION, a: 'Jensen Huang',   price: 52, owner: 'dave.base.eth',  prevOwner: 'carol.base.eth',      creator: CREATOR, action: 'Dave bets on Jensen — pays $52' },
];

const ROLES = [
  { icon: '👑', title: 'Question Creators', tagline: 'Mint once. Earn forever.', copy: 'You spot a question people will argue about. You mint it. Every single time someone trades an answer — this week, next year, a decade from now — you get 3%. Passive income on human disagreement.', stat: '3% royalty on every trade', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2 },
  { icon: '🛡',  title: 'Answer Owners',     tagline: 'Own the narrative. Get paid to be right.',     copy: 'You own the answer — which means you own the narrative. Every visitor to that question reads YOUR take first. Your external link is the first they click. Drive traffic to your site. Sell your product. Build authority. And when someone does disagree, they pay you 95% of the new price to dethrone you. You profit either way.',        stat: 'Influence + 95% on every flip',   bg: '#4DFFE0', fg: '#15120D', tilt: 1.5 },
  { icon: '📈', title: 'Traders',             tagline: 'Buy the dip. Sell conviction.', copy: 'You see an answer priced at $15 that should be at $100. You buy it. You wait. Someone with deeper conviction comes along and pays you to take it. Classic buy low, sell high.', stat: '95% profit on every flip',     bg: '#FFFFFF', fg: '#15120D', tilt: -1 },
  { icon: '🤝', title: 'Pool Members',        tagline: 'Team up. Split the wins.',  copy: 'Can\'t afford a $200 answer alone? Pool with others. Contribute what you can. If the pool hits its target, rewards get distributed based on your share. Collective conviction, individual profit.', stat: 'Proportional pool rewards', bg: '#FFE94D', fg: '#15120D', tilt: 2 },
];

const REASONS = [
  { title: 'Skin in the game', copy: 'Anybody can post an opinion on Reddit for free. On OMC, your opinion costs money. That filter alone makes answers 10× more valuable.' },
  { title: "Prices don't lie",  copy: "The most-backed answer isn't the loudest — it's the one with the most money behind it. Markets are the best truth machines ever invented." },
  { title: 'Everyone profits',  copy: '98% of every dollar stays in the community. Question creators, answer owners, traders — everyone eats. The platform takes just 2%.' },
  { title: 'No expiration',     copy: 'Unlike prediction markets, OMC questions never resolve. "Best CRM" will be debated forever. Your royalties compound forever.' },
];

// ---------- Page ----------

export default function HowItWorks() {
  const [step, setStep] = useState(0);
  const current = STAGES[step];
  const moneyFlow = step > 0 ? {
    owner: +(current.price * 0.95).toFixed(2),
    creator: +(current.price * 0.03).toFixed(2),
    platform: +(current.price * 0.02).toFixed(2),
  } : null;

  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative flex min-h-screen flex-col">
      <Halftone />

      <Nav active="How it Works" />

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.18em]">★ HOW IT WORKS ★</div>
          <h1 className="mt-3 font-display text-[44px] font-black leading-[0.92] tracking-[-0.04em] md:text-[88px]">
            Three steps.<br />
            <span className="text-pop">That’s it.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold md:text-lg">
            Create a question. Own an answer. Get paid when someone disagrees.{' '}
            <b>No PhD in crypto required.</b>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#step-1"><BtnPrimary>★ show me ↓</BtnPrimary></a>
            <a href="/v2/tutorial"><BtnSecondary>take the tutorial</BtnSecondary></a>
          </div>
        </div>
      </section>

      {/* ============================================================
          STEPS
          ============================================================ */}
      <section id="step-1" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            HOW IT<br />
            ACTUALLY <span className="text-pop">WORKS.</span>
          </h2>

          <div className="mt-10 space-y-12">
            {STEPS.map((s, i) => (
              <div key={s.num} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
                {/* Copy side */}
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="font-mono text-[64px] font-black leading-none opacity-30 md:text-[88px]">{s.num}</div>
                  <h3 className="mt-2 font-display text-[28px] font-black tracking-[-0.03em] md:text-[40px]">{s.title}</h3>
                  <p className="mt-2 text-base font-bold text-pop">{s.subtitle}</p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed md:text-base">{s.copy}</p>
                  <p className="mt-3 text-xs font-semibold opacity-80 md:text-sm">{s.detail}</p>
                </div>

                {/* Example sticker side */}
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <Sticker bg={s.bg} fg={s.fg} tilt={s.tilt} shadow={6} tappable>
                    <CatChip bg={s.bg === '#FF4D6B' ? '#FFFFFF' : '#15120D'} fg={s.bg === '#FF4D6B' ? '#15120D' : '#FFE94D'}>{s.example.label}</CatChip>
                    <div className="mt-3 font-display text-[20px] font-black tracking-[-0.02em] leading-tight">{s.example.q}</div>
                    <div className="mt-2 text-sm font-bold">{s.example.a}</div>
                    <div className="mt-3 font-mono text-base font-extrabold">{s.example.price}</div>
                  </Sticker>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TRADE WALKTHROUGH (interactive)
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            WATCH A TRADE<br />
            <span className="text-pop">HAPPEN.</span>
          </h2>

          <div className="mt-8 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker md:p-8">
            <div className="mb-4 flex items-center justify-between font-mono text-xs font-bold">
              <span className="opacity-70">Step {step + 1} of {STAGES.length}</span>
              <span className="rounded-full border-2 border-ink bg-canvas px-2 py-0.5 font-extrabold uppercase tracking-wider">{current.label}</span>
            </div>

            <p className="text-xs font-bold opacity-70">{current.action}</p>
            <h3 className="mt-1 font-display text-xl font-black tracking-[-0.02em]">&ldquo;{current.q}&rdquo;</h3>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              <div className="rounded-md border-[2.5px] border-ink bg-canvas px-3 py-2 shadow-sticker-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Current Answer</div>
                <div className="font-display text-sm font-black tracking-[-0.01em]">{current.a}</div>
              </div>
              <div className="rounded-md border-[2.5px] border-ink bg-cool px-3 py-2 shadow-sticker-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Price</div>
                <div className="font-mono text-sm font-extrabold">${current.price} USDC</div>
              </div>
              <div className="rounded-md border-[2.5px] border-ink bg-paper px-3 py-2 shadow-sticker-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Owner</div>
                <div className="font-mono text-[11px] font-extrabold leading-tight">{current.owner}</div>
              </div>
              <div className="rounded-md border-[2.5px] border-ink bg-pop px-3 py-2 text-white shadow-sticker-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Creator</div>
                <div className="font-mono text-[11px] font-extrabold leading-tight">{current.creator}</div>
              </div>
            </div>

            {/* Money flow */}
            {moneyFlow && current.prevOwner && (
              <div className="mt-4 rounded-md border-[2.5px] border-ink bg-ink p-3 text-canvas shadow-sticker-sm">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-90">Money distributed instantly:</div>
                <ul className="mt-2 space-y-1 font-mono text-xs font-bold">
                  <li className="flex items-center justify-between gap-3">
                    <span className="opacity-90">→ Previous Owner <span className="opacity-70">({current.prevOwner})</span></span>
                    <span className="text-cool">${moneyFlow.owner}</span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="opacity-90">→ Question Creator <span className="opacity-70">({current.creator})</span></span>
                    <span className="text-pop">${moneyFlow.creator}</span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="opacity-90">→ Platform <span className="opacity-70">(OMC)</span></span>
                    <span className="opacity-80">${moneyFlow.platform}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Stage 1 — no distribution yet */}
            {!current.prevOwner && (
              <div className="mt-4 rounded-md border-[2.5px] border-dashed border-ink bg-canvas/60 p-3 shadow-sticker-sm">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-70">Mint event — no distribution yet</div>
                <p className="mt-1 text-xs font-bold">
                  Alice locks the $10 initial price as recoverable stake + pays a $2 spam fee.
                  Money flow starts at the first flip.
                </p>
              </div>
            )}

            {/* Price bar */}
            <div className="mt-5">
              <div className="flex justify-between font-mono text-[10px] font-bold opacity-70">
                <span>$10</span><span>$52</span>
              </div>
              <div className="mt-1 h-3 rounded-full border-2 border-ink bg-canvas">
                <div
                  className="h-full rounded-full border-r-2 border-ink bg-pop transition-all"
                  style={{ width: `${((current.price - 10) / 42) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stage selector */}
          <div className="mt-5 flex justify-center gap-3">
            {STAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={
                  'h-11 w-11 rounded-full border-[2.5px] border-ink font-mono text-sm font-black transition-all duration-150 ' +
                  (step === i
                    ? 'bg-pop text-white shadow-cta'
                    : 'bg-paper text-ink shadow-sticker-sm hover:translate-y-[-1px]')
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          ROLES
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            WHO MAKES<br />
            <span className="text-pop">MONEY?</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {ROLES.map((r) => (
              <Sticker key={r.title} bg={r.bg} fg={r.fg} tilt={r.tilt} shadow={6} tappable>
                <div className="flex items-start justify-between">
                  <span className="text-[36px] leading-none">{r.icon}</span>
                  <CatChip bg={r.bg === '#FF4D6B' || r.bg === '#FFE94D' ? '#FFFFFF' : '#FFE94D'}>{r.stat}</CatChip>
                </div>
                <h3 className="mt-3 font-display text-[22px] font-black tracking-[-0.02em]">{r.title}</h3>
                <p className="mt-1 text-sm font-bold opacity-90 italic">{r.tagline}</p>
                <p className="mt-3 text-sm font-semibold leading-relaxed">{r.copy}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHY IT WORKS
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            WHY THIS<br />
            <span className="text-pop">WORKS.</span>
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {REASONS.map((r, i) => (
              <Sticker
                key={r.title}
                bg={i % 2 === 0 ? '#FFFFFF' : '#4DFFE0'}
                fg="#15120D"
                tilt={i % 2 === 0 ? -1 : 1}
                shadow={5}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <h3 className="font-display text-lg font-black tracking-[-0.02em]">{r.title}</h3>
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed">{r.copy}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
          ============================================================ */}
      <section className="relative z-10 px-6 py-14 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[72px]">
            Simple<br />
            <span className="text-pop">enough?</span>
          </h2>
          <p className="mt-5 text-lg font-semibold md:text-xl">
            Create a question. Trade an answer. Get paid when someone disagrees.{' '}
            <b>That’s the whole game.</b>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>★ PUT YOUR MONEY WHERE YOUR MOUTH IS →</BtnPrimary>
            </a>
            <a href="/v2/tutorial"><BtnSecondary>take the tutorial</BtnSecondary></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
