'use client';

import { Btn, Chip, MonoNum, Sticker } from '@/components/poster-arcade';
import { SectionTitle } from '../_components/SectionTitle';

/* ──────────────────────────── DATA ──────────────────────────── */

const SETUP = [
  {
    n: '01',
    icon: '🪪',
    title: 'GET A WALLET',
    desc: "MetaMask, Coinbase Wallet, or any EVM wallet. Already have one? Skip.",
    bg: 'pop' as const,
  },
  {
    n: '02',
    icon: '⚡',
    title: 'GET ETH ON BASE',
    desc: 'You need a tiny amount of ETH for gas. ~$0.01 per trade. $5 lasts hundreds.',
    bg: 'cool' as const,
  },
  {
    n: '03',
    icon: '💵',
    title: 'GET USDC',
    desc: '1 USDC = $1. Always. That’s what you trade with on OMC. Start with $5.',
    bg: 'canvas' as const,
  },
];

const TRADE_STEPS = [
  {
    n: '01',
    title: 'Find a market',
    desc: "Browse the floor by category or search. Look for answers you think are wrong — that's where the money is.",
  },
  {
    n: '02',
    title: 'Check the floor price',
    desc: 'Every market shows the next-price — the USDC cost to replace the current answer. Dynamic pricing means it shifts with activity.',
  },
  {
    n: '03',
    title: 'Take the floor',
    desc: "Pay the floor, write your answer. You're now the answer owner. The previous holder gets 95% of what you paid. Instantly.",
  },
  {
    n: '04',
    title: 'Collect when someone disagrees',
    desc: 'Someone thinks you’re wrong? They pay to replace you. You keep 95%. The question creator gets 3%. The platform gets 2%.',
  },
];

const FEE_SPLIT = [
  { pct: '95%', label: 'PREVIOUS OWNER', sub: 'Instant payout', bg: 'cool' as const },
  { pct: '3%',  label: 'QUESTION CREATOR', sub: 'Forever royalty', bg: 'pop' as const },
  { pct: '2%',  label: 'OMC PLATFORM',     sub: 'Keeps the lights on', bg: 'paper' as const },
];

const MINT_FIELDS = [
  { name: 'Question',     example: '"Most overhyped tech CEO?"',  hint: 'Ask something people will fight about. Debate = volume = royalties.' },
  { name: 'Answer',       example: '"Elon Musk"',                  hint: 'Be specific. Name names.' },
  { name: 'Initial Price', example: '$1–$100 USDC',                hint: 'How much someone pays to replace your answer. Higher = more skin.' },
  { name: 'Category',     example: '40 chain categories',           hint: 'Pick 1–3 to help traders find your market.' },
  { name: 'Description',  example: '120 chars · optional',          hint: 'Argue your case. Why is your answer right?' },
  { name: 'Source Link',  example: 'https://x.com/… · optional',    hint: 'Add proof. Backs up your take, drives traffic.' },
];

/* ──────────────────────────── PAGE ──────────────────────────── */

export default function TutorialPage() {
  return (
    <>
      {/* ────────────────  HERO  ──────────────── */}
      <section className="px-4 md:px-10 pt-10 md:pt-16 pb-6">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ TUTORIAL
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.92] text-[44px] md:text-[72px] mt-2 text-ink">
          Your first trade
          <br />
          <span className="text-pop">in under 30 seconds.</span>
        </h1>
        <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-4 max-w-2xl">
          OMC turns opinions into tradeable assets. You take a stand, collect
          royalties forever, and dethrone the takes you disagree with. Here&apos;s
          the whole game on one page.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Btn href="/create" variant="pop" size="lg" star>
            mint your first take
          </Btn>
          <Btn href="/marketplace" variant="ghost" size="lg">
            browse the floor →
          </Btn>
        </div>
      </section>

      {/* ────────────────  SETUP — 3 things  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-10">
        <SectionTitle>🪜 THREE THINGS. THAT&apos;S IT.</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SETUP.map((s, i) => (
            <Sticker key={s.n} bg={s.bg} tilt={i % 2 === 0 ? -2 : 1.5} shadow={5}>
              <div className="flex items-center justify-between">
                <Chip bg="ink" sm>STEP {s.n}</Chip>
                <span className="text-[36px] leading-none">{s.icon}</span>
              </div>
              <div className="mt-3 font-display font-black text-[18px] md:text-[22px] tracking-tight">
                {s.title}
              </div>
              <p className="mt-2 font-display text-[12px] font-semibold leading-snug opacity-80">
                {s.desc}
              </p>
            </Sticker>
          ))}
        </div>
      </section>

      {/* ────────────────  TRADE LOOP  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-10">
        <SectionTitle>⚡ HOW A TRADE WORKS</SectionTitle>
        <p className="font-display text-[13px] md:text-[14px] font-semibold text-ink/75 max-w-2xl mb-5">
          Every market has exactly one current answer. To replace it, you pay
          the floor price. 95% of that goes to the previous answer owner —
          instantly, on chain. You hold the floor until someone disagrees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {TRADE_STEPS.map((s, i) => (
            <Sticker
              key={s.n}
              bg={(['pop', 'canvas', 'cool', 'paper'] as const)[i]}
              tilt={i % 2 === 0 ? -1.5 : 1.5}
              shadow={5}
            >
              <Chip bg={i === 0 || i === 2 ? 'paper' : 'ink'} sm>STEP {s.n}</Chip>
              <div className="mt-3 font-display font-black text-[18px] tracking-tight">
                {s.title}
              </div>
              <p className="mt-2 font-display text-[12px] font-semibold leading-snug opacity-80">
                {s.desc}
              </p>
            </Sticker>
          ))}
        </div>
      </section>

      {/* ────────────────  FEE SPLIT  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-10">
        <SectionTitle>💵 WHERE EVERY DOLLAR GOES</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEE_SPLIT.map((f, i) => (
            <Sticker key={f.label} bg={f.bg} tilt={i === 1 ? 1.5 : -1.5} shadow={6} className="text-center">
              <div className="font-display font-black text-[56px] md:text-[64px] tracking-[-0.04em] leading-none">
                {f.pct}
              </div>
              <div className="font-display font-extrabold text-[12px] tracking-[0.14em] uppercase mt-3 opacity-80">
                {f.label}
              </div>
              <div className="font-display text-[11px] font-semibold opacity-65 mt-1">
                {f.sub}
              </div>
            </Sticker>
          ))}
        </div>
      </section>

      {/* ────────────────  CREATE A MARKET  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-10">
        <SectionTitle>🎨 CREATE A MARKET, EARN FOREVER</SectionTitle>
        <p className="font-display text-[13px] md:text-[14px] font-semibold text-ink/75 max-w-2xl mb-5">
          Mint a question and you become the <span className="font-extrabold">question owner</span>.
          You collect <span className="font-mono font-extrabold">3%</span> of every flip — forever.
          Even after you sell the question. Flat <MonoNum>$2</MonoNum> spam-fee + your
          chosen initial price.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MINT_FIELDS.map((f) => (
            <div
              key={f.name}
              className="bg-paper border-[2.5px] border-ink rounded-lg shadow-[3px_3px_0_var(--ink)] p-4"
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div className="font-display font-black text-[14px] tracking-tight uppercase">
                  {f.name}
                </div>
                <div className="font-mono font-extrabold text-[11px] text-ink/55">
                  {f.example}
                </div>
              </div>
              <p className="mt-2 font-display text-[12px] font-semibold text-ink/75 leading-snug">
                {f.hint}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────  POOLS  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-10">
        <SectionTitle>🌊 CAN&apos;T AFFORD IT ALONE? TEAM UP.</SectionTitle>
        <p className="font-display text-[13px] md:text-[14px] font-semibold text-ink/75 max-w-2xl mb-5">
          Pools let multiple wallets pool USDC to flip an expensive take.
          When the pool fills, the answer changes and every contributor
          shares the new royalty stream proportionally. If the pool expires
          unfilled, contributors get refunded.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Sticker bg="canvas" tilt={-1.5} shadow={5}>
            <Chip bg="ink" sm>OPEN A POOL</Chip>
            <ul className="mt-3 font-display text-[12px] font-semibold text-ink/80 space-y-1.5">
              <li>· Pick a take with floor ≥ <MonoNum>$100</MonoNum></li>
              <li>· Propose a new answer + name the pool</li>
              <li>· Set initial contribution (min <MonoNum>$1</MonoNum>) + deadline (2–60 days)</li>
              <li>· $5 pool creation fee · others can join until the pool fills</li>
            </ul>
            <div className="mt-4">
              <Btn href="/pools/new" variant="pop" size="sm" star>open a pool →</Btn>
            </div>
          </Sticker>
          <Sticker bg="paper" tilt={1.5} shadow={5}>
            <Chip bg="ink" sm>JOIN A POOL</Chip>
            <ul className="mt-3 font-display text-[12px] font-semibold text-ink/80 space-y-1.5">
              <li>· Browse <a className="underline" href="/pools">/pools</a> for active campaigns</li>
              <li>· Contribute any USDC amount</li>
              <li>· Share the royalty stream when the pool fills</li>
              <li>· Exit early with a 20% penalty if you change your mind</li>
            </ul>
            <div className="mt-4">
              <Btn href="/pools" variant="ghost" size="sm">browse pools →</Btn>
            </div>
          </Sticker>
        </div>
      </section>

      {/* ────────────────  QUESTION OWNERSHIP  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-10">
        <SectionTitle>👑 SELL THE QUESTION, KEEP THE 3%</SectionTitle>
        <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[5px_5px_0_var(--ink)] p-5 md:p-6">
          <p className="font-display text-[13px] md:text-[14px] font-semibold text-ink/80 leading-snug max-w-2xl">
            The question owner banks 3% of every flip <em>forever</em>. You can
            sell the question itself: list it at a fixed price, anyone buys it,
            ownership transfers — the buyer collects every flip&apos;s royalty
            from that moment on. Find listings on the{' '}
            <a href="/listings" className="underline font-extrabold">LISTINGS</a> tab.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Btn href="/listings" variant="pop" size="sm" star>browse listings →</Btn>
            <Btn href="/marketplace" variant="ghost" size="sm">marketplace →</Btn>
          </div>
        </div>
      </section>

      {/* ────────────────  CTA  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-20 text-center">
        <h2 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[40px] md:text-[72px] text-ink">
          STOP READING.
          <br />
          <span className="text-pop">START TRADING.</span>
        </h2>
        <p className="font-display font-semibold text-[13px] md:text-[15px] text-ink/75 mt-4 max-w-xl mx-auto">
          You learn faster doing. Mint your first take for <MonoNum>$2</MonoNum> + your initial price.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Btn href="/create" variant="pop" size="lg" star>
            mint your first take →
          </Btn>
          <Btn href="/marketplace" variant="ghost" size="lg">
            browse the floor →
          </Btn>
        </div>
      </section>
    </>
  );
}
