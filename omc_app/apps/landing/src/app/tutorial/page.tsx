'use client';

import { useState } from 'react';
import {
  BtnPrimary,
  BtnSecondary,
  CatChip,
  Halftone,
  HeroEyebrow,
  HeroLede,
  HeroTitle,
  SectionTitle,
  Nav,
  SiteFooter,
  Sticker,
} from '../_components';

// ---------- Data ----------

const SETUP = [
  { icon: '🪪', n: '01', title: 'Get a Wallet',     subtitle: 'Your crypto identity',                description: 'MetaMask, Coinbase Wallet, or any EVM wallet. If you have one, skip this.',                 action: 'Install MetaMask', url: 'https://metamask.io/download/', details: ['Install the browser extension or mobile app', 'Create a new wallet (save your seed phrase somewhere safe)', 'The wallet auto-connects to Base network'], bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2 },
  { icon: '⚡', n: '02', title: 'Get ETH on Base',  subtitle: 'For gas fees (~$0.01 per trade)',     description: "You need a tiny amount of ETH to pay transaction fees. We're talking pennies.",            action: 'Bridge to Base',   url: 'https://bridge.base.org/',     details: ['Buy ETH on Coinbase and send to Base', 'Or bridge from Ethereum using the Base Bridge', '$5 of ETH lasts hundreds of trades'], bg: '#4DFFE0', fg: '#15120D', tilt:  1.5 },
  { icon: '💵', n: '03', title: 'Get USDC',         subtitle: 'Your trading currency',               description: "USDC is the dollar of crypto. 1 USDC = $1. Always. That's what you trade with on OMC.",     action: 'Get USDC on Base', url: 'https://www.coinbase.com/',    details: ['Buy USDC directly on Coinbase', 'Or swap any token for USDC on a DEX', 'Start with as little as $5 — no minimum'], bg: '#FFFFFF', fg: '#15120D', tilt: -1.5 },
];

const FIELDS = [
  { name: 'Your Question',  required: true,  example: '"Most overhyped tech CEO?"',                                       tip: 'Ask something people will fight about. Debate = volume = money.',                          chars: '60 chars'   },
  { name: 'Your Answer',    required: true,  example: '"Elon Musk"',                                                       tip: "Be specific and name the target. 'Elon Musk' beats 'a few tech bros'.",                     chars: '60 chars'   },
  { name: 'Initial Price',  required: true,  example: '$50 USDC',                                                          tip: 'How much someone pays to replace your answer. Higher = more skin in the game.',           chars: '$1 – $100'  },
  { name: 'Category',       required: true,  example: 'Technology',                                                        tip: '40 categories. Pick the right one — it helps traders find your market.',                  chars: 'Pick 1–3'   },
  { name: 'Description',    required: false, example: '"Buys companies, breaks features, calls it innovation."',           tip: 'Argue your case. Why is your answer the right one?',                                       chars: '120 chars'  },
  { name: 'External Link',  required: false, example: 'https://x.com/elonmusk',                                            tip: 'Add proof. A link to back up your answer drives credibility — and traffic to your side.', chars: 'URL'        },
];

type TradeStep = { title: string; icon: string; desc: string; bg: string; fg: string };

const TRADE_STEPS: TradeStep[] = [
  { title: 'Find a market',                       icon: '🎯', desc: "Browse by category or search. Look for answers you think are wrong — that's where the money is.",                                                   bg: '#FF4D6B', fg: '#FFFFFF' },
  { title: 'Check the price',                     icon: '📈', desc: 'Every market shows the NextPrice — what it costs to replace the current answer. Dynamic pricing means it changes based on activity.',             bg: '#4DFFE0', fg: '#15120D' },
  { title: 'Submit your answer',                  icon: '⚡', desc: "Pay the NextPrice, write your answer. You're now the answer owner. The previous owner gets 95% of what you paid. Instantly.",                       bg: '#FFFFFF', fg: '#15120D' },
  { title: 'Collect when someone disagrees',      icon: '💵', desc: "Someone thinks you're wrong? They pay to replace you. You keep 95%. The question creator gets 3%. OMC gets 2%.",                                  bg: '#FFE94D', fg: '#15120D' },
];

const FEE_SPLIT = [
  { pct: '95%', label: 'Previous Owner',    sub: 'Instant payout',         bg: '#4DFFE0' },
  { pct: '3%',  label: 'Question Creator',  sub: 'Forever royalty',         bg: '#FF4D6B' },
  { pct: '2%',  label: 'OMC Platform',      sub: 'Keeps the lights on',     bg: '#FFFFFF' },
];

const POOL_CREATE = [
  'Pick any active opinion market',
  'Target price is set automatically (= NextPrice)',
  'Contribute your USDC + $5 pool creation fee',
  'Set expiration (1–60 days)',
  'Name it, propose an answer, market it',
  'Others join and add their money',
];

const POOL_JOIN = [
  'Browse active pools by category',
  'Check progress toward target price',
  'Contribute any amount (free, no fee)',
  'Share rewards proportional to your contribution',
  'Auto-executes when target is reached',
  'Full refund if pool expires without hitting target',
];

const POOL_OUTCOMES = [
  { icon: '✓', title: 'Target Hit',     desc: 'Everyone shares rewards proportionally. Pool becomes the answer owner.',                bg: '#4DFFE0', fg: '#15120D', tilt: -1.5 },
  { icon: '🛡', title: 'Pool Expires',  desc: 'Target not reached by deadline? Full refund to all contributors. No loss.',             bg: '#FFFFFF', fg: '#15120D', tilt:  1   },
  { icon: '⚠', title: 'Early Exit',    desc: 'Withdraw before expiry? 20% penalty. Prevents pump-and-dump manipulation.',             bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1   },
];

const PRO_TIPS = [
  { icon: '👑', role: 'Question Creator', bg: '#FFE94D', fg: '#15120D', tilt: -2, tips: [
    'Ask questions that spark endless debate — controversy = volume = royalties',
    "Timeless beats time-bound. 'Best CRM?' gets argued for years. 'Best meme this week?' still works — but the meta resets fast and you'll be re-minting it every cycle. Your call.",
    'Set realistic initial prices. $25 is a sweet spot — high enough to signal quality, low enough to attract first traders.',
    'You can sell your question on the marketplace. Create it. Build volume. Cash out.',
  ] },
  { icon: '📈', role: 'Answer Trader',    bg: '#4DFFE0', fg: '#15120D', tilt:  1.5, tips: [
    "Buy answers in your area of expertise. You know something the market doesn't? That's alpha.",
    'Watch for underpriced markets — low activity + strong opinion = opportunity.',
    "Hold positions in evergreen markets. 'Best programming language?' will trade for years.",
    'Track category trends. When a sector heats up, all its markets move.',
  ] },
  { icon: '🤝', role: 'Pool Strategist',  bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1, tips: [
    'Never put all your funds in one pool. Diversify across categories and timeframes.',
    'Check pool progress before joining. 80% funded = likely to hit. 10% funded with 2 days left = probably not.',
    "The 20% early exit penalty is real. Only join pools you're committed to.",
    'Create pools around events — product launches, elections, award shows. Timing is everything.',
  ] },
];

const CONTRACTS = [
  { name: 'USDC Token',      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', purpose: 'Trading currency',                                  url: 'https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  { name: 'OpinionCoreV4',   address: '0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1', purpose: 'Main opinion markets (V4 — self-exit)',             url: 'https://basescan.org/address/0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1' },
  { name: 'PoolManagerV2',   address: '0x34537a749F4b16E7542a59e5322338372A6a1E3c', purpose: 'Collaborative pools (V2 — stale-exit dissolution)', url: 'https://basescan.org/address/0x34537a749F4b16E7542a59e5322338372A6a1E3c' },
  { name: 'FeeManager',      address: '0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA', purpose: 'Fee claims & royalties',                            url: 'https://basescan.org/address/0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA' },
];

const TROUBLESHOOTING = [
  { problem: 'Transaction failed',         fix: 'Check you have enough ETH for gas (~$0.01). Increase gas limit in wallet if needed.' },
  { problem: 'USDC approval required',     fix: "First trade requires approving USDC spending. It's a one-time transaction — confirm it in your wallet." },
  { problem: "Can't create question",      fix: 'Check character limits (60 chars question, 60 chars answer, 120 chars description). Verify USDC balance covers creation fee.' },
  { problem: "Can't claim creator fees",   fix: 'Go to the FeeManager contract on BaseScan and call claimAccumulatedFees(). UI claiming coming soon.' },
  { problem: 'Pool target seems high',     fix: "Target = NextPrice, set by the algorithm. If it's high, that means the market is hot. Team up bigger." },
];

// ---------- Page ----------

export default function Tutorial() {
  const [activeTradeStep, setActiveTradeStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const current = TRADE_STEPS[activeTradeStep];

  const copy = async (addr: string) => {
    await navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative flex min-h-screen flex-col">
      <Halftone />

      <Nav active="Tutorial" />

      {/* ============================================================ HERO */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <HeroEyebrow className="text-[11px] font-black uppercase tracking-[0.18em]">★ TUTORIAL ★</HeroEyebrow>
          <HeroTitle className="mt-3 font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[80px]">
            Your First Trade<br />
            <span className="text-pop">in Under 30 Seconds.</span>
          </HeroTitle>
          <HeroLede className="mx-auto mt-5 max-w-2xl text-base font-semibold md:text-lg">
            No PhD in crypto. No jargon. <b>Just money where your mouth is.</b>
          </HeroLede>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#setup"><BtnPrimary>★ LET’S GO ↓</BtnPrimary></a>
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnSecondary>skip to app →</BtnSecondary>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ SETUP */}
      <section id="setup" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            THREE THINGS.<br />
            <span className="text-pop">THAT’S IT.</span>
          </SectionTitle>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            Wallet. ETH. USDC. You probably have two of these already.
          </p>

          <div className="mt-10 space-y-6">
            {SETUP.map((s) => (
              <Sticker key={s.n} bg={s.bg} fg={s.fg} tilt={s.tilt} shadow={6}>
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <div className="flex items-center gap-3 md:flex-col md:items-start">
                    <span className="text-[36px] leading-none">{s.icon}</span>
                    <span className="font-mono text-[36px] font-black leading-none opacity-40 md:text-[48px]">{s.n}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-[22px] font-black tracking-[-0.02em] md:text-[28px]">{s.title}</h3>
                    <p className="mt-1 text-sm font-bold opacity-90">{s.subtitle}</p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed">{s.description}</p>
                    <ul className="mt-3 space-y-1.5 text-xs font-bold">
                      {s.details.map((d) => <li key={d}>✓ {d}</li>)}
                    </ul>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                      <BtnSecondary>{s.action} ↗</BtnSecondary>
                    </a>
                  </div>
                </div>
              </Sticker>
            ))}
          </div>
          <p className="mt-8 text-center text-sm font-bold opacity-70">
            Total time: ~3 minutes if you already have a wallet. Done? Let’s make money.
          </p>
        </div>
      </section>

      {/* ============================================================ MINT */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            CREATE A MARKET.<br />
            <span className="text-pop">EARN FOREVER.</span>
          </SectionTitle>
          <p className="mt-4 max-w-3xl text-base font-semibold md:text-lg">
            Mint a question. Every time someone trades an answer, you get{' '}
            <b className="bg-pop px-1.5 py-px text-white">3% royalty</b>. Not for a month. Not for a year. Forever.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {FIELDS.map((f, i) => (
              <Sticker
                key={f.name}
                bg={i % 2 === 0 ? '#FFFFFF' : '#FFE94D'}
                fg="#15120D"
                tilt={i % 2 === 0 ? -1 : 1}
                shadow={5}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-black tracking-[-0.02em]">{f.name}</h4>
                  <div className="flex gap-2">
                    <CatChip bg={f.required ? '#FF4D6B' : '#FFFFFF'} fg={f.required ? '#FFFFFF' : '#15120D'}>
                      {f.required ? 'REQUIRED' : 'OPTIONAL'}
                    </CatChip>
                    <CatChip>{f.chars}</CatChip>
                  </div>
                </div>
                <div className="mt-3 rounded-md border-[2.5px] border-ink bg-canvas px-3 py-2 font-mono text-sm font-extrabold shadow-sticker-sm">
                  {f.example}
                </div>
                <p className="mt-3 text-xs font-semibold">{f.tip}</p>
              </Sticker>
            ))}
          </div>

          {/* Fee formula */}
          <Sticker bg="#4DFFE0" fg="#15120D" tilt={-0.5} shadow={6} className="mt-10">
            <h3 className="font-display text-xl font-black tracking-[-0.02em] md:text-2xl">
              💵 Creation Cost — Skin in the Game
            </h3>
            <div className="mt-3 rounded-md border-[2.5px] border-ink bg-ink px-4 py-2 font-mono text-base font-extrabold text-canvas shadow-sticker-sm">
              initial price + 2 USDC spam fee
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border-[2.5px] border-ink bg-paper p-3 shadow-sticker-sm">
                <p className="text-xs font-bold opacity-70">Initial price</p>
                <p className="mt-0.5 text-sm font-extrabold">→ locked as your stake</p>
                <p className="mt-1 text-[11px] font-semibold opacity-70">recovered when someone flips you, or via Self-Exit</p>
              </div>
              <div className="rounded-md border-[2.5px] border-ink bg-paper p-3 shadow-sticker-sm">
                <p className="text-xs font-bold opacity-70">Spam fee — flat</p>
                <p className="mt-0.5 text-sm font-extrabold">→ 2 USDC to treasury</p>
                <p className="mt-1 text-[11px] font-semibold opacity-70">deters throwaway questions</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-bold">
              If you mint it, you mean it. Your initial price isn’t paid — it’s <b>locked</b>.
              You get it back the moment someone else takes the slot, or via Self-Exit after the cooldown.
            </p>
          </Sticker>
        </div>
      </section>

      {/* ============================================================ TRADE */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            SEE SOMETHING WRONG?<br />
            FIX IT. <span className="text-pop">GET PAID.</span>
          </SectionTitle>

          {/* Step selector */}
          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {TRADE_STEPS.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setActiveTradeStep(i)}
                className={
                  'rounded-sticker border-[2.5px] border-ink p-4 text-left transition-all duration-150 ' +
                  (activeTradeStep === i
                    ? 'shadow-cta'
                    : 'opacity-70 shadow-sticker-sm hover:opacity-100')
                }
                style={{ background: s.bg, color: s.fg }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold">{i + 1}</span>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <h4 className="mt-2 font-display text-sm font-black tracking-[-0.02em]">{s.title}</h4>
              </button>
            ))}
          </div>

          {/* Active step body */}
          <Sticker bg={current.bg} fg={current.fg} tilt={-0.5} shadow={6} className="mt-6">
            <div className="flex items-center gap-3">
              <span className="text-[28px]">{current.icon}</span>
              <h3 className="font-display text-xl font-black tracking-[-0.02em] md:text-2xl">{current.title}</h3>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed md:text-base">{current.desc}</p>
          </Sticker>

          {/* Where money goes */}
          <h3 className="mt-12 text-center font-display text-xl font-black tracking-[-0.02em]">
            WHERE YOUR MONEY GOES
          </h3>
          <div className="mt-5 grid grid-cols-3 gap-3 md:gap-5">
            {FEE_SPLIT.map((f) => (
              <Sticker key={f.label} bg={f.bg} fg="#15120D" tilt={0} shadow={5}>
                <div className="text-center font-mono text-[36px] font-black leading-none md:text-[48px]">{f.pct}</div>
                <div className="mt-2 text-center font-display text-sm font-black tracking-[-0.02em]">{f.label}</div>
                <div className="mt-1 text-center text-[10px] font-bold opacity-70">{f.sub}</div>
              </Sticker>
            ))}
          </div>

          {/* Anti-gaming note */}
          <Sticker bg="#FFE94D" fg="#15120D" tilt={1} shadow={5} className="mt-8">
            <div className="flex items-start gap-3">
              <span className="text-[24px]">🛡</span>
              <div>
                <h4 className="font-display text-base font-black tracking-[-0.02em]">Dynamic Pricing — No Gaming</h4>
                <p className="mt-1 text-xs font-semibold leading-relaxed">
                  NextPrice is calculated by an on-chain algorithm using market volume, trading
                  frequency, and 14 entropy sources. No fixed formula. No MEV extraction. No bots
                  predicting exact profit margins. Fair game.
                </p>
              </div>
            </div>
          </Sticker>
        </div>
      </section>

      {/* ============================================================ POOLS */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            CAN’T AFFORD IT ALONE?<br />
            <span className="text-pop">TEAM UP.</span>
          </SectionTitle>
          <p className="mt-4 max-w-3xl text-base font-semibold md:text-lg">
            Pools let you team up with other traders to collectively buy an answer. Split the cost.
            Share the rewards.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            <Sticker bg="#FF4D6B" fg="#FFFFFF" tilt={-2} shadow={6}>
              <CatChip bg="#FFFFFF" fg="#15120D">🎯 CREATE A POOL</CatChip>
              <ul className="mt-4 space-y-2 text-sm font-semibold">
                {POOL_CREATE.map((x) => <li key={x}>→ {x}</li>)}
              </ul>
            </Sticker>
            <Sticker bg="#4DFFE0" fg="#15120D" tilt={1.5} shadow={6}>
              <CatChip bg="#15120D" fg="#4DFFE0">🤝 JOIN A POOL</CatChip>
              <ul className="mt-4 space-y-2 text-sm font-semibold">
                {POOL_JOIN.map((x) => <li key={x}>→ {x}</li>)}
              </ul>
            </Sticker>
          </div>

          {/* Real example */}
          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-0.5} shadow={6} className="mt-10">
            <h3 className="font-display text-xl font-black tracking-[-0.02em]">REAL EXAMPLE</h3>
            <div className="mt-3 rounded-md border-[2.5px] border-ink bg-canvas p-3 shadow-sticker-sm">
              <p className="font-display text-sm font-black tracking-[-0.01em]">&ldquo;Most popular US female artist?&rdquo;</p>
              <p className="mt-1 text-xs font-semibold">Current answer: <b>Beyoncé</b> at <b>$4,500</b></p>
              <p className="mt-1 text-xs font-semibold">Pool target: <b className="text-pop">$6,000</b> for &ldquo;Taylor Swift&rdquo;</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { l: 'Pool target',  v: '$6,000',           bg: '#4DFFE0' },
                { l: 'Your share',   v: '$600 (10%)',       bg: '#FFE94D' },
                { l: 'Contributors', v: '20 people',        bg: '#FF4D6B', fg: '#FFFFFF' },
                { l: 'If it hits',   v: '10% of rewards',   bg: '#FFFFFF' },
              ].map((c) => (
                <div key={c.l} className="rounded-md border-[2.5px] border-ink p-3 shadow-sticker-sm" style={{ background: c.bg, color: c.fg ?? '#15120D' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{c.l}</p>
                  <p className="mt-0.5 font-mono text-sm font-extrabold">{c.v}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold opacity-80">
              Pool hits target → answer changes to &ldquo;Taylor Swift&rdquo; → pool becomes the answer owner →
              everyone earns proportional rewards when someone pays to replace the answer.
            </p>
          </Sticker>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {POOL_OUTCOMES.map((o) => (
              <Sticker key={o.title} bg={o.bg} fg={o.fg} tilt={o.tilt} shadow={5}>
                <span className="text-[28px]">{o.icon}</span>
                <h4 className="mt-2 font-display text-base font-black tracking-[-0.02em]">{o.title}</h4>
                <p className="mt-1 text-xs font-semibold leading-relaxed">{o.desc}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ PRO TIPS */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            PLAY <span className="text-pop">SMARTER.</span>
          </SectionTitle>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            You know the rules. Now learn how the smart money plays.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
            {PRO_TIPS.map((t) => (
              <Sticker key={t.role} bg={t.bg} fg={t.fg} tilt={t.tilt} shadow={6} tappable>
                <span className="text-[32px]">{t.icon}</span>
                <h3 className="mt-2 font-display text-[20px] font-black tracking-[-0.02em]">{t.role}</h3>
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed">
                  {t.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ CONTRACTS */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            ON-CHAIN. VERIFIED.<br />
            <span className="text-pop">TRANSPARENT.</span>
          </SectionTitle>
          <p className="mt-4 max-w-3xl text-base font-semibold md:text-lg">
            Every trade, every fee, every pool — it’s all on Base mainnet. Verified on BaseScan. No trust required.
          </p>

          <div className="mt-10 space-y-3">
            {CONTRACTS.map((c) => (
              <div key={c.name} className="flex flex-col gap-3 rounded-sticker border-[2.5px] border-ink bg-paper p-4 shadow-sticker md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display text-base font-black tracking-[-0.02em]">{c.name}</h4>
                    <CatChip>{c.purpose}</CatChip>
                  </div>
                  <code className="mt-1 block break-all font-mono text-xs font-bold opacity-80">{c.address}</code>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(c.address)}
                    className="inline-flex items-center gap-1 rounded-full border-[2.5px] border-ink bg-canvas px-3 py-1.5 text-xs font-extrabold shadow-sticker-sm hover:translate-y-[-1px]"
                  >
                    {copied === c.address ? '✓ copied' : 'copy'}
                  </button>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border-[2.5px] border-ink bg-pop px-3 py-1.5 text-xs font-extrabold text-white shadow-sticker-sm hover:translate-y-[-1px]"
                  >
                    basescan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center font-mono text-xs font-bold opacity-70">
            Base Mainnet · Chain ID 8453 · All contracts UUPS upgradeable
          </p>
        </div>
      </section>

      {/* ============================================================ TROUBLESHOOTING */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            SOMETHING<br />
            <span className="text-pop">BROKE?</span>
          </SectionTitle>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            Quick fixes for common issues. If it’s not here, hit us up on Discord.
          </p>

          <div className="mt-8 space-y-3">
            {TROUBLESHOOTING.map((t, i) => (
              <Sticker
                key={t.problem}
                bg={i % 2 === 0 ? '#FFFFFF' : '#FFE94D'}
                fg="#15120D"
                tilt={i % 2 === 0 ? -0.5 : 0.5}
                shadow={5}
              >
                <h4 className="flex items-center gap-2 font-display text-base font-black tracking-[-0.02em]">
                  <span className="text-pop">⚠</span> {t.problem}
                </h4>
                <p className="mt-1 text-sm font-semibold leading-relaxed">{t.fix}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ FINAL CTA */}
      <section className="relative z-10 px-6 py-14 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle className="font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[72px]">
            STOP READING.<br />
            <span className="text-pop">START TRADING.</span>
          </SectionTitle>
          <p className="mt-5 text-lg font-semibold md:text-xl">
            You’ve read the tutorial. You know how it works. Now go put your money where your mouth is.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>★ LAUNCH APP →</BtnPrimary>
            </a>
            <a href="/whitepaper"><BtnSecondary>read the whitepaper</BtnSecondary></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
