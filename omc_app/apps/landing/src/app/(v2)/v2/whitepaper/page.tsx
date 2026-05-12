import {
  BtnPrimary,
  BtnSecondary,
  CatChip,
  Halftone,
  Nav,
  SiteFooter,
  Sticker,
} from '../../_components';

// ---------- Table helper ----------
type TableProps = { headers: string[]; rows: (string | number)[][]; highlight?: number };
function Table({ headers, rows, highlight }: TableProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-sticker border-[2.5px] border-ink bg-paper shadow-sticker">
      <table className="w-full border-collapse text-left font-mono text-xs">
        <thead className="bg-ink text-canvas">
          <tr>
            {headers.map((h) => (
              <th key={h} className="border-b-[2.5px] border-ink px-3 py-2 font-extrabold uppercase tracking-wider text-[10px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i === highlight ? 'bg-canvas font-extrabold' : 'odd:bg-paper even:bg-canvas/30'}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-dashed border-ink/30 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Chapter heading ----------
function Chapter({ n, title, lede }: { n: string; title: string; lede?: string }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-70">CHAPTER {n}</div>
      <h2 className="mt-1 font-display text-[28px] font-black leading-[0.95] tracking-[-0.03em] md:text-[44px]">{title}</h2>
      {lede && <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed md:text-lg">{lede}</p>}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-3 text-sm font-semibold leading-relaxed md:text-base">
          <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full border-2 border-ink bg-pop" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-10 font-display text-[20px] font-black tracking-[-0.02em] md:text-[24px]">{children}</h3>;
}

function P({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`mt-3 max-w-3xl text-sm font-semibold leading-relaxed md:text-base ${className}`}>{children}</p>;
}

// ---------- Page ----------

const TOC = [
  { n: '01', title: 'Motivation' },
  { n: '02', title: 'Introduction' },
  { n: '03', title: 'System Overview' },
  { n: '04', title: 'Economic Model · Dynamic Pricing' },
  { n: '05', title: 'V4 Exit Mechanics · Self-Exit & Vacant Reclaim' },
  { n: '06', title: 'Key Roles' },
  { n: '07', title: 'Technical Architecture' },
  { n: '08', title: 'Security' },
  { n: '09', title: 'Community Features' },
  { n: '10', title: 'Applications' },
  { n: '11', title: 'Deployed Contracts' },
];

const CONTRACTS = [
  { name: 'OpinionCoreV4',       addr: '0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1', role: 'Main markets · self-exit · reclaim'  },
  { name: 'PoolManagerV2',       addr: '0x34537a749F4b16E7542a59e5322338372A6a1E3c', role: 'Collaborative pools · stale-exit'    },
  { name: 'FeeManager',          addr: '0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA', role: 'Fee accumulation · royalty claims'    },
  { name: 'OpinionAdmin',        addr: '0x202Bc4E3aB50147212bee0506bF5f2B544333b5D', role: 'Parameter governance · moderation'    },
  { name: 'OpinionExtensionsV2', addr: '0x2eD0DC454043A768cB3FA7e480c41Be7b8954394', role: 'Categories · extension slots'         },
  { name: 'SelfExitLib',         addr: '0x30c465f5772dc86555d37fE1376218Cbf79a4D93', role: 'Library · exit logic (V4)'             },
  { name: 'PriceCalculator',     addr: '0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7', role: 'Library · dynamic price (V3)'          },
  { name: 'ValidationLibrary',   addr: '0x95a60C951BCB6E77644081f0501c9d2dDDfDb681', role: 'Library · input validation'            },
  { name: 'USDC (Base)',         addr: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', role: 'Trading currency'                     },
];

export default function Whitepaper() {
  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative flex min-h-screen flex-col">
      <Halftone />

      <Nav active="Whitepaper" />

      {/* ============================================================ HERO */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-[11px] font-black uppercase tracking-[0.18em]">★ WHITEPAPER ★</div>
          <h1 className="mt-3 font-display text-[36px] font-black leading-[0.95] tracking-[-0.04em] md:text-[72px]">
            OpinionMarketCap.<br />
            <span className="text-pop">A Hardened Marketplace<br/>for Opinions.</span>
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CatChip bg="#15120D" fg="#FFE94D">VERSION 3.0</CatChip>
            <CatChip>MAY 2026</CatChip>
            <CatChip bg="#FF4D6B" fg="#FFFFFF">BASE MAINNET · V4 + V2</CatChip>
          </div>

          {/* Abstract */}
          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-0.5} shadow={6} className="mt-8">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-widest opacity-70">ABSTRACT</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed md:text-base">
              OpinionMarketCap (OMC) is a decentralized marketplace that lets anyone mint a question
              and have its current answer continuously discovered by an on-chain market. Where free
              platforms surface the loudest take, OMC surfaces the one with the most money behind
              it. Where centralized search ranks by SEO and ads, OMC ranks by economic conviction.
            </p>
            <p className="mt-3 text-sm font-semibold leading-relaxed md:text-base">
              This paper describes the protocol as deployed on Base mainnet in <b>May 2026</b>: a
              modular 5-contract system, V3 dynamic pricing with market-regime simulation, and{' '}
              <b>V4 exit mechanics</b> (Self-Exit + Vacant Slot Reclaim) that prevent any participant
              from being permanently trapped in a stale position. Together they create a
              self-sustaining ecosystem where information providers — not intermediaries — capture
              the value they create.
            </p>
            <p className="mt-3 text-[11px] font-mono font-bold opacity-70">
              Supersedes v2.0 (Jan 2025) and v1.0 (Apr 2025). For the changelog see Chapter 07.
            </p>
          </Sticker>

          {/* TOC */}
          <div className="mt-8 rounded-sticker border-[2.5px] border-ink bg-ink p-6 text-canvas shadow-sticker">
            <div className="font-display text-lg font-black tracking-[-0.02em]">★ TABLE OF CONTENTS</div>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {TOC.map((t) => (
                <a
                  key={t.n}
                  href={`#ch-${t.n}`}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-canvas/30 py-1.5 text-sm font-bold underline-offset-4 hover:underline"
                >
                  <span>
                    <span className="font-mono opacity-70">{t.n}.</span> {t.title}
                  </span>
                  <span className="opacity-50">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ 01 · MOTIVATION */}
      <section id="ch-01" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="01"
            title="Motivation."
            lede="The internet's opinions are free. That's the problem. A free opinion is a noisy opinion — gameable by bots, SEO, engagement farming, and pure social pressure. OMC asks a simpler question: what does a market actually believe?"
          />

          <H3>The $20 bet</H3>
          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-0.5} shadow={6} className="mt-5">
            <div className="font-display text-[44px] leading-none opacity-40">&ldquo;</div>
            <p className="text-sm font-semibold italic leading-relaxed md:text-base">
              My kids couldn’t agree which Harry Potter book was best. The elder said:{' '}
              <b className="bg-canvas px-1.5 py-px not-italic">&lsquo;I’ll give you $20 if you agree with me.&rsquo;</b>{' '}
              The younger took the bill. The next day they both agreed on{' '}
              <i>Prisoner of Azkaban</i>. Money settled a debate facts never could. That was the
              spark.
            </p>
            <div className="mt-3 text-right font-mono text-xs font-bold">— Axel, OMC founder</div>
          </Sticker>

          <H3>From spark to protocol</H3>
          <Bullets items={[
            'A $1 economic commitment to an answer is more informative than 10,000 likes — because likes are free and money isn’t.',
            'A market for opinions doesn’t need oracles, judges, or moderation — the price IS the verdict.',
            'A perpetual market — one that never resolves — captures the way real arguments live. "Best CRM" gets re-litigated every year for a decade.',
            'A protocol with exit mechanics — V4 Self-Exit + Vacant Reclaim — ensures no participant is trapped if a market goes stale.',
          ]} />

          <P>
            OMC is the operationalisation of that insight: a question is a market, the current
            answer is its price, and the next person to disagree must pay for the privilege of
            being heard.
          </P>
        </div>
      </section>

      {/* ============================================================ 02 · INTRODUCTION */}
      <section id="ch-02" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="02"
            title="Introduction."
            lede="Existing platforms determine information quality through opaque algorithms, centralized moderation, or ad-driven incentives that prioritise engagement over accuracy."
          />

          <H3>Traditional limitations</H3>
          <Bullets items={[
            'Reliance on algorithmic interpretation of content quality',
            'Vulnerability to SEO manipulation and content farms',
            'Misaligned incentives: advertisers — not information providers — capture value',
            'Centralized control of ranking and visibility',
            'No mechanism to settle perpetual debates (best CRM, GOAT athlete, best pizza)',
          ]} />

          <H3>What OMC does differently</H3>
          <Bullets items={[
            'Information value is set directly by market forces (price = consensus)',
            'Question creators earn 3% royalty on every trade — forever',
            'Answer owners capture 95% of every flip',
            'Communities can pool funds to acquire high-value answers (PoolManagerV2)',
            'No platform extraction beyond a 2% fee',
            'Stuck positions can always exit — V4 introduces a hard guarantee',
          ]} />

          <Table
            headers={['Platform', 'Question', 'Answer', 'Ranking', 'Value Distribution']}
            highlight={1}
            rows={[
              ['Google', '"Best programming language 2025?"',     'Multiple SEO-driven results', 'Algorithm + Ads',     'Ad revenue to Google'],
              ['OMC',    '"Best programming language 2025?"',     '"Python (AI ecosystem)"',     'Market price · 35 USDC', '95% owner · 3% creator · 2% platform'],
            ]}
          />
        </div>
      </section>

      {/* ============================================================ 03 · SYSTEM OVERVIEW */}
      <section id="ch-03" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="03"
            title="System Overview."
            lede="OMC is built as a modular 5-contract system on Base. At its core are three primitives: Questions, Answers, and Pools."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Sticker bg="#FF4D6B" fg="#FFFFFF" tilt={-2} shadow={6}>
              <CatChip bg="#FFFFFF" fg="#15120D">3.1 · QUESTIONS</CatChip>
              <h4 className="mt-2 font-display text-lg font-black tracking-[-0.02em]">The market unit.</h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed">
                Each question has a unique ID, a creator who pays a flat <b>2 USDC spam fee</b> +
                locks an initial price (1–100 USDC) as recoverable stake, and a creator address
                that earns 3% royalty on every future trade — forever.
              </p>
              <p className="mt-2 text-xs font-mono font-bold opacity-80">
                60 chars question · 60 chars answer · 120 chars description · 1–3 categories
              </p>
            </Sticker>
            <Sticker bg="#4DFFE0" fg="#15120D" tilt={1.5} shadow={6}>
              <CatChip bg="#15120D" fg="#4DFFE0">3.2 · ANSWERS</CatChip>
              <h4 className="mt-2 font-display text-lg font-black tracking-[-0.02em]">The contested slot.</h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed">
                The current answer is the market-validated consensus. Ownership transfers via
                purchase at <b>NextPrice</b> — computed dynamically by PriceCalculator. Full
                history is on-chain. Ownership transfer (gifting) is free and supported.
              </p>
            </Sticker>
            <Sticker bg="#FFFFFF" fg="#15120D" tilt={-1} shadow={6}>
              <CatChip bg="#FFE94D">3.3 · POOLS (V2)</CatChip>
              <h4 className="mt-2 font-display text-lg font-black tracking-[-0.02em]">Collective conviction.</h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed">
                Multiple users co-fund the purchase of an expensive answer. Pool creators pay{' '}
                <b>5 USDC</b>; contributions are <b>free</b> (no per-contributor fee). Rewards
                distribute proportionally. V2 adds stale-exit dissolution (Ch. 05).
              </p>
            </Sticker>
          </div>

          <H3>Modular architecture</H3>
          <P>
            OMC is deployed as a 5-contract system + 3 linked libraries. Each contract is{' '}
            <b>UUPS upgradeable</b>, role-gated, and under the 24 KB Base bytecode limit.
          </P>
          <Table
            headers={['Component', 'Type', 'Role']}
            rows={[
              ['OpinionCoreV4',       'Contract', 'Markets · trades · self-exit · reclaim'],
              ['PoolManagerV2',       'Contract', 'Pool lifecycle · stale-exit dissolution'],
              ['FeeManager',          'Contract', 'Accumulated fees · creator royalties'],
              ['OpinionAdmin',        'Contract', 'Parameter governance · moderation'],
              ['OpinionExtensionsV2', 'Contract', '40 categories · extension slots'],
              ['SelfExitLib',         'Library',  'Exit math + state transitions (V4)'],
              ['PriceCalculator',     'Library',  'Market-regime price calculation (V3)'],
              ['ValidationLibrary',   'Library',  'Input bound checks'],
            ]}
          />
        </div>
      </section>

      {/* ============================================================ 04 · ECONOMIC MODEL */}
      <section id="ch-04" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="04"
            title="Economic Model · Dynamic Pricing."
            lede="V3 replaced the original fixed +10% pricing with a market-regime simulator. Each trade samples one of four regimes weighted by topic activity, producing realistic price moves that respond to demand."
          />

          <H3>4.1 · Market regimes</H3>
          <P>Each new trade calls <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">PriceCalculator.calculateNextPrice</code> which samples one of four regimes:</P>
          <Table
            headers={['Regime', 'Base prob.', 'Price move', 'Behavior']}
            rows={[
              ['CONSOLIDATION',      '25%', '−10% → +15%', 'Range trading, slight bullish bias'],
              ['BULLISH TRENDING',   '60%', '+5% → +40%',  'Steady gains, most common regime'],
              ['MILD CORRECTION',    '15%', '−20% → +5%',  'Limited pullbacks'],
              ['PARABOLIC',          '2%',  '+40% → +80%', 'Extreme moves on hot topics (capped at +80%)'],
            ]}
          />
          <P>Regime weights <b>adapt to topic activity</b>:</P>
          <Table
            headers={['Activity tier', 'Threshold', 'Adjusted weights']}
            rows={[
              ['COLD',   '< 5 trades',  '40% Consolidation · 45% Bullish · 2% Parabolic'],
              ['WARM',   '5–15 trades', 'Base weights (above)'],
              ['HOT',    '15+ trades',  '15% Consolidation · 62% Bullish · 10% Parabolic'],
            ]}
          />

          <H3>4.2 · Trading is unrestricted</H3>
          <P>
            OMC is built to <b>stimulate activity, not throttle it</b>. There are no per-block
            trade caps, no per-user rate limits, and no minimum trade size. Anyone can submit
            answers as fast as they want, as often as they want, with any price the contract
            accepts.
          </P>
          <P>
            What the protocol <i>does</i> protect is the integrity of the regime detector — so a
            single bot can’t fake "this market is HOT" by spraying tiny trades. The guards below
            apply <b>only</b> to how each trade is <i>weighted</i> in the COLD / WARM / HOT
            calculation; they never block a trade.
          </P>
          <Table
            headers={['Guard', 'Value', 'What it actually does']}
            rows={[
              ['MIN_ACTIVITY_VALUE',      '$10 USDC',  'Trades below $10 still execute — they just don’t count toward the activity tier'],
              ['MAX_USER_ACTIVITY_PER_DAY','3',         'Only the first 3 trades/user/day weight the activity score (more trades still execute)'],
              ['MAX_USER_ACTIVITY_SHARE', '40%',        'Any single user contributes at most 40% to a market’s activity score'],
              ['MIN_USERS_FOR_HOT',       '1',          'Even a 1-on-1 bidding war can trigger the HOT regime — no quorum gate'],
              ['absoluteMaxPriceChange',  'admin-tunable','Cap on per-trade price delta (admin-set)'],
              ['PARABOLIC_MAX_GAIN',      '+80%',       'Parabolic regime ceiling — prevents guaranteed-profit setups'],
            ]}
          />
          <P>
            <b>Entropy.</b> NextPrice mixes 14 sources (block.timestamp, prevrandao, opinionId,
            sender, balance, nonce, trade history…) — non-deterministic, non-replayable. This is
            why V4 disables the legacy V1 anti-MEV rate limit and the rapid-trade fee penalty: when
            the next price is unpredictable, there’s no profitable sandwich attack to defend
            against (Ch. 08).
          </P>

          <H3>4.3 · Fee distribution</H3>
          <P>On every trade, the buyer pays <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">price</code>. It splits 3 ways:</P>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { pct: '95%', label: 'Previous Owner',   bg: '#4DFFE0' },
              { pct: '3%',  label: 'Question Creator', bg: '#FF4D6B' },
              { pct: '2%',  label: 'Platform',         bg: '#FFFFFF' },
            ].map((f) => (
              <Sticker key={f.label} bg={f.bg} fg="#15120D" tilt={0} shadow={5}>
                <div className="text-center font-mono text-[36px] font-black leading-none">{f.pct}</div>
                <div className="mt-2 text-center font-display text-sm font-black tracking-[-0.02em]">{f.label}</div>
              </Sticker>
            ))}
          </div>
          <P><b>Worked example — $100 trade.</b> Buyer pays $100. Previous owner receives $95. Question creator gets $3 royalty (claimed via <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">FeeManager.claimAccumulatedFees</code>). Platform fee $2 accrues to treasury. <b>MEV penalty in V4: 0% (admin-tunable).</b></P>

          <H3>4.4 · Pool economics</H3>
          <Bullets items={[
            'Pool creation: 5 USDC fee (split: platform + question creator)',
            'Contribution: free (0 USDC fee)',
            'Target: NextPrice (set automatically by PriceCalculator at execution time)',
            'Max pool duration: 60 days',
            'Pool reward distribution: proportional to contribution at sale time (95% of resale)',
            'Early exit: 20% penalty (prevents pump-and-dump)',
          ]} />
        </div>
      </section>

      {/* ============================================================ 05 · V4 EXIT MECHANICS */}
      <section id="ch-05" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="05"
            title="V4 Exit Mechanics. Self-Exit & Vacant Reclaim."
            lede="V4 (May 2026) introduces two mechanisms that guarantee no participant is permanently trapped on a stale slot — and that a stale slot doesn't drag a market dead. Both are admin-toggled feature flags."
          />

          <H3>5.1 · Self-Exit (for the current king)</H3>
          <P>
            After the configurable cooldown (default <b>14 days</b> solo · 21 days pools · 35 days
            extended pools), the answer owner can call{' '}
            <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">selfExit(opinionId)</code>{' '}
            to walk away. Refund = <b>80% of the locked stake</b>; penalty 20% splits 50/50 between
            creator and platform.
          </P>
          <Sticker bg="#FFE94D" fg="#15120D" tilt={-0.5} shadow={5} className="mt-5">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-widest opacity-70">IMPORTANT — WHAT IS LOCKED?</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed">
              In V4, <code className="rounded bg-ink px-1 py-0.5 font-mono text-canvas">lockedStake</code> is the bootstrap amount the question
              creator set at mint (e.g. $5) and stays constant through normal trades — the math
              balances exactly. Self-Exit therefore refunds 80% of <i>that</i> bootstrap amount,
              not 80% of what the current owner paid. It’s a recovery floor — not a position
              refund. Reclaim (5.2) <i>does</i> reset the stake to ~95% of the reclaim price.
            </p>
          </Sticker>

          <H3>5.2 · Vacant Slot Reclaim (for the next bidder)</H3>
          <P>
            When the king exits, the slot becomes vacant with{' '}
            <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">currentAnswerOwner = address(0)</code>.
            The next claimant calls{' '}
            <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">reclaimVacantSlot(opinionId, …)</code>{' '}
            and pays the <b>reclaim price</b> = max(50% × lastPrice, <b>$2 floor</b>). 95% of that
            payment becomes the new <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">lockedStake</code> — so future
            Self-Exit refunds scale with the reclaim price.
          </P>

          <H3>5.3 · Pool stale-exit dissolution (V2)</H3>
          <P>
            PoolManagerV2 mirrors the same logic at the pool level. Large holders (≥10% contribution)
            can trigger a pool exit after 21 days; any contributor can trigger after 35 days. Pool
            funds redistribute proportionally with the same 20% penalty.
          </P>

          <H3>5.4 · Parameter table</H3>
          <Table
            headers={['Parameter', 'Default', 'Bounds']}
            rows={[
              ['soloCooldown',           '14 days',     '60s — 90 days (admin-tunable)'],
              ['poolCooldown',           '21 days',     '60s — 90 days'],
              ['poolExtendedCooldown',   '35 days',     '≥ poolCooldown · ≤ 90 days'],
              ['exitPenaltyBps',         '2000 (20%)',  '500 — 5000'],
              ['penaltyCreatorShareBps', '5000 (50/50)','0 — 10000'],
              ['reclaimDiscountBps',     '5000 (50%)',  '1000 — 9000'],
              ['largeHolderThresholdBps','1000 (10%)',  '1 — 5000 (pool-only)'],
              ['minReclaimPrice',        '2 USDC',      '> 0'],
              ['spamFee',                '2 USDC',      '≤ 100 USDC'],
            ]}
          />
          <P className="mt-3">
            <b>MIN_COOLDOWN = 60 seconds (constant)</b>, so admins can lower cooldowns for live
            testing without waiting weeks. Restore production cooldowns after testing.
          </P>
        </div>
      </section>

      {/* ============================================================ 06 · KEY ROLES */}
      <section id="ch-06" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter n="06" title="Key Roles." lede="Four participant roles, each capturing value in different ways." />

          <H3>6.1 · Question Creators</H3>
          <Bullets items={[
            'Earn 3% of every future trade on their question — forever',
            'Earn 50% of the 20% Self-Exit penalty (= 10% of locked stake) whenever a king exits their question',
            'Set initial framing through question + initial answer + initial price',
            'Can attach descriptions and external links (120 char description · URL)',
            'May enhance with extension content (V2 ExtensionsV2)',
          ]} />

          <H3>6.2 · Answer Owners</H3>
          <Bullets items={[
            'Hold the contested slot — and the narrative; every visitor reads YOUR take first',
            'Receive 95% of the next purchase price when their answer is bought',
            'Establish on-chain reputation through ownership history',
            'Can be EOAs, smart wallets, or pools',
            'Can Self-Exit after cooldown if the slot goes stale',
          ]} />

          <H3>6.3 · Pool Creators & Contributors</H3>
          <Bullets items={[
            'Coordinate collective conviction at price points individuals can’t reach',
            'Contributors pay no per-contribution fee (free entry)',
            'Rewards distribute by contribution percentage at sale time',
            'Stale pools dissolve through V2 mechanism (10% holder triggers @ 21d · any contributor @ 35d)',
          ]} />

          <H3>6.4 · Governance Roles</H3>
          <Bullets items={[
            'DEFAULT_ADMIN_ROLE — root authority. Rotatable via transferFullAdmin() across all 5 contracts in a single transaction.',
            'ADMIN_ROLE — parameter updates and contract upgrades (72-hour timelock on upgrades)',
            'MODERATOR_ROLE — opinion deactivation and answer moderation',
            'TREASURY_ROLE — treasury rotation (48-hour timelock + confirmation)',
            'CORE_CONTRACT_ROLE — fee-accrual gateway granted to OpinionCore by FeeManager',
          ]} />
        </div>
      </section>

      {/* ============================================================ 07 · TECHNICAL ARCHITECTURE */}
      <section id="ch-07" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="07"
            title="Technical Architecture."
            lede="The monolithic V1 contract (25.1 KB) exceeded the 24 KB Base bytecode limit. The May 2026 system splits responsibilities across 5 UUPS-upgradeable contracts and 3 linked libraries."
          />

          <H3>7.1 · Contract sizes</H3>
          <Table
            headers={['Contract', 'Size (KB)', 'UUPS upgradeable']}
            rows={[
              ['OpinionCoreV4',       '19.0', '✓'],
              ['PoolManagerV2',       '18.1', '✓'],
              ['OpinionExtensionsV2', '13.2', '✓'],
              ['FeeManager',          '10.5', '✓'],
              ['OpinionAdmin',        '9.6',  '✓'],
              ['ValidationLibrary',   '0.02', '— library'],
            ]}
          />

          <H3>7.2 · Version history</H3>
          <Table
            headers={['Version', 'Date', 'Changes']}
            rows={[
              ['V1',  'Jan 7, 2025',  'Initial deployment of modular system'],
              ['V2',  'Jan 12, 2025', 'Fixed fee-transfer bug; added pause/unpause + emergencyWithdraw'],
              ['V2.1','Jan 14, 2025', 'Empty-categories validation fix (ExtensionsV2)'],
              ['V3',  'Jan 15, 2025', 'Dynamic pricing — PriceCalculator with market regimes'],
              ['V4',  'May 6, 2026',  'Self-Exit + Vacant Reclaim; PoolManagerV2 stale-exit dissolution'],
            ]}
          />

          <H3>7.3 · Base Layer 2</H3>
          <Bullets items={[
            'Low transaction costs (sub-cent gas)',
            'High throughput (thousands of tx/s)',
            'Ethereum security guarantees via OP Stack fault proofs',
            'USDC-native; Coinbase on/off-ramp integration',
          ]} />
          <Table
            headers={['Chain', 'Tx (submit answer)', 'Gas units', 'Cost (May 2026)']}
            highlight={3}
            rows={[
              ['Ethereum', 'submitAnswer #567', '120,000', '$3.75'],
              ['Polygon',  'submitAnswer #567', '120,000', '$0.12'],
              ['Arbitrum', 'submitAnswer #567', '120,000', '$0.03'],
              ['Base',     'submitAnswer #567', '120,000', '$0.004'],
            ]}
          />
        </div>
      </section>

      {/* ============================================================ 08 · SECURITY */}
      <section id="ch-08" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="08"
            title="Security."
            lede="OMC ships with layered protections. V4 hardens against price manipulation, enforces non-custodial fund flows, and gives admins emergency control via pause + role separation."
          />

          <H3>8.1 · Price manipulation defenses</H3>
          <Bullets items={[
            '14 entropy sources for NextPrice — block.timestamp, prevrandao, opinionId, sender, balance, nonce, trade history, etc.',
            'Configurable max price-change (absoluteMaxPriceChange) prevents extreme single-trade moves',
            'Parabolic regime capped at +80%',
            'Minimum price floors prevent devaluation below 1 USDC',
          ]} />

          <H3>8.2 · Anti-MEV</H3>
          <P>
            Original V1 included a per-block trade limit and a rapid-trade fee penalty. <b>Both
            are disabled by default in V4</b> (maxTradesPerBlock = 0 = unlimited;
            mevPenaltyPercent = 0%) because V3 dynamic pricing — non-deterministic, non-replayable
            — already neutralizes the value of sandwich attacks. Both remain admin-tunable.
          </P>
          <Table
            headers={['Parameter', 'V1 (apr 2025)', 'V4 (may 2026)', 'Notes']}
            rows={[
              ['MAX_TRADES_PER_BLOCK', '3',            '0 (unlimited)', 'V3 entropy makes MEV unprofitable'],
              ['mevPenaltyPercent',    '20%',          '0%',            'Admin-tunable, retained for emergencies'],
              ['Cooldown (Self-Exit)', '—',            '14d / 21d / 35d', 'New in V4 — prevents rage-quit'],
            ]}
          />

          <H3>8.3 · Fund security</H3>
          <Bullets items={[
            'Non-custodial — contract holds only locked stakes and accumulated fees',
            'Pull pattern — creators withdraw fees via claimAccumulatedFees()',
            'ReentrancyGuard on every external state-mutating function',
            'Checks-Effects-Interactions on every transfer',
            'Emergency pause + emergencyWithdraw (admin-only, only when paused)',
            'SafeERC20 throughout (no naked transfer / transferFrom)',
          ]} />

          <H3>8.4 · Treasury & governance hardening</H3>
          <Bullets items={[
            'Treasury changes require 48-hour timelock + confirmation',
            'Contract upgrades require 72-hour timelock',
            'Role-based access via OpenZeppelin AccessControl',
            'transferFullAdmin() for single-call admin rotation across all 5 contracts',
          ]} />
        </div>
      </section>

      {/* ============================================================ 09 · COMMUNITY FEATURES */}
      <section id="ch-09" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter n="09" title="Community Features." lede="OMC is designed to make information communities legible, durable, and tradable." />

          <H3>9.1 · Pool coordination</H3>
          <Bullets items={[
            'Shared goals around specific answers',
            'Transparent contribution tracking on-chain',
            'Collective ownership of high-value slots',
            'Proportional reward distribution at resale',
            'Stale-exit dissolution (V2) — no pool stays trapped',
          ]} />

          <H3>9.2 · Information provenance</H3>
          <P>Every answer change writes a full history record on-chain: timestamp, owner address, price paid, answer text, description, link.</P>
          <Table
            headers={['#', 'Date', 'Answer', 'Owner', 'Price']}
            rows={[
              ['1', 'Jan 2025', '"Solidity with formal verification"',     'security_dev.base.eth',  '$1.00'],
              ['2', 'Feb 2025', '"Rust + Solana support"',                 'solana_builder.base.eth','$2.30'],
              ['3', 'Mar 2025', '"Vyper for EVM contracts"',               'vyper_expert.base.eth',  '$8.20'],
              ['4', 'Apr 2025', '"Move language (Sui / Aptos)"',           'move_advocate.base.eth', '$14.50'],
              ['5', 'May 2026', '"Solidity + AI auditing"',                 'current_owner.base.eth', '$32.10'],
            ]}
          />

          <H3>9.3 · Categories</H3>
          <P>
            40 categories shipped at launch — covering tech, sports, music, food, crypto, local
            knowledge, brands, and culture. New categories require ADMIN_ROLE via{' '}
            <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-canvas">addCategoryToCategories()</code>.
          </P>
        </div>
      </section>

      {/* ============================================================ 10 · APPLICATIONS */}
      <section id="ch-10" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="10"
            title="Applications."
            lede="A market for opinions is also a market for brand positioning, prediction-style consensus, expert reputation, and creator monetisation."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Sticker bg="#FF4D6B" fg="#FFFFFF" tilt={-2} shadow={6}>
              <CatChip bg="#FFFFFF" fg="#15120D">📊 INFORMATION MARKETS</CatChip>
              <Bullets items={[
                'Perpetual consensus on expert questions',
                'Real-time opinion aggregation',
                'Reputation through ownership history',
                'Crowd-sourced knowledge curation',
              ]} />
            </Sticker>
            <Sticker bg="#4DFFE0" fg="#15120D" tilt={1.5} shadow={6}>
              <CatChip bg="#15120D" fg="#4DFFE0">🎨 BRANDS</CatChip>
              <p className="mt-3 text-sm font-semibold leading-relaxed">
                Luxury houses competing for &ldquo;Most prestigious watch?&rdquo;. Advertising
                with built-in exit liquidity — a marketing spend becomes a potential investment.
              </p>
            </Sticker>
            <Sticker bg="#FFFFFF" fg="#15120D" tilt={-1} shadow={6}>
              <CatChip bg="#FFE94D">🤝 COMMUNITIES</CatChip>
              <p className="mt-3 text-sm font-semibold leading-relaxed">
                DAOs pooling capital on contested takes. Crypto Twitter backing positions with
                bags. Collective conviction priced and resolvable on-chain.
              </p>
            </Sticker>
            <Sticker bg="#FFE94D" fg="#15120D" tilt={2} shadow={6}>
              <CatChip>📝 CREATORS</CatChip>
              <p className="mt-3 text-sm font-semibold leading-relaxed">
                Mint questions. Earn royalties forever on every flip. Creator <i>ownership</i>{' '}
                economy — not just a creator economy.
              </p>
            </Sticker>
          </div>
        </div>
      </section>

      {/* ============================================================ 11 · DEPLOYED CONTRACTS */}
      <section id="ch-11" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Chapter
            n="11"
            title="Deployed Contracts."
            lede="Everything described in this paper is live on Base mainnet (chain ID 8453) and verified on BaseScan. Addresses below are proxies — readable storage and method ABIs included."
          />

          <div className="mt-10 space-y-3">
            {CONTRACTS.map((c) => (
              <div key={c.name} className="flex flex-col gap-3 rounded-sticker border-[2.5px] border-ink bg-paper p-4 shadow-sticker md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display text-base font-black tracking-[-0.02em]">{c.name}</h4>
                    <CatChip>{c.role}</CatChip>
                  </div>
                  <code className="mt-1 block break-all font-mono text-xs font-bold opacity-80">{c.addr}</code>
                </div>
                <a
                  href={`https://basescan.org/address/${c.addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 self-start rounded-full border-[2.5px] border-ink bg-pop px-3 py-1.5 text-xs font-extrabold text-white shadow-sticker-sm hover:translate-y-[-1px] md:self-auto"
                >
                  basescan ↗
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center font-mono text-xs font-bold opacity-70">
            Treasury: <code className="font-mono">0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9</code>{' '}
            · Admin: <code className="font-mono">0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C</code>
          </p>
        </div>
      </section>

      {/* ============================================================ FINAL CTA */}
      <section className="relative z-10 px-6 py-14 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[64px]">
            DON’T TRUST THE PAPER.<br />
            <span className="text-pop">READ THE CONTRACTS.</span>
          </h2>
          <p className="mt-5 text-lg font-semibold md:text-xl">
            Every claim in this paper is encoded in Solidity on Base mainnet — verified, audited,
            immutable. Verify yourself.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://basescan.org/address/0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>★ OPINIONCOREV4 ON BASESCAN ↗</BtnPrimary>
            </a>
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnSecondary>launch app →</BtnSecondary>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
