import {
  AnimatedBar,
  AnimatedNumber,
  BtnPrimary,
  BtnSecondary,
  CatChip,
  Halftone,
  Nav,
  SiteFooter,
  Sticker,
  TakeCard,
  type TakeCardData,
} from '../_components';

// ---------- Data ----------

const HERO_COLLAGE: (TakeCardData & { pos: React.CSSProperties })[] = [
  { cat: '🏀 SPORTS', q: 'GOAT BASKETBALL?', a: 'JORDAN.',  p: '$78.50', d: '+18%', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -3, pos: { top: 10, left: 0    } },
  { cat: '⚡ CRYPTO', q: 'BEST L2?',          a: 'ARBITRUM.',p: '$45.20', d: '+9%',  bg: '#4DFFE0', fg: '#15120D', tilt:  4, pos: { top: 70, right: 0   } },
  { cat: '🍕 FOOD',   q: 'GOAT NYC PIZZA?',   a: 'DI FARA.',p: '$23.10', d: 'NEW',  bg: '#FFFFFF', fg: '#15120D', tilt: -2, pos: { bottom: 0, left: 60 } },
];

const TALK_IS_CHEAP = [
  'Crypto Twitter debates that go nowhere',
  'Reddit threads with 10,000 comments and zero stakes',
  'AI-generated hot takes with no skin in the game',
  'Influencers who shill without consequence',
];

const OMC_IS_PROOF = [
  'Your opinion has a price tag',
  'Disagree? Pay up.',
  '95% goes to the person you’re replacing',
  'The market decides who’s right',
];

const STEPS = [
  { num: '01', title: 'Mint a Question', body: 'Create any question. Set the first answer. Earn 3% royalties on every future trade. Forever.', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2 },
  { num: '02', title: 'Trade the Answer', body: 'See a wrong answer? Pay to replace it. If someone replaces yours, you get 95% of what they paid.', bg: '#4DFFE0', fg: '#15120D', tilt:  1.5 },
  { num: '03', title: 'Pool Your Power', body: 'Team up with others to collectively take over expensive answers. Split the rewards.', bg: '#FFFFFF', fg: '#15120D', tilt: -1.5 },
];

const MONEY_FLOW = [
  { label: 'Previous Answer Owner',         pct: 95, bg: '#4DFFE0' },
  { label: 'Question Creator (forever)',    pct:  3, bg: '#FF4D6B' },
  { label: 'Platform',                       pct:  2, bg: '#FFFFFF' },
];

const TRENDING: TakeCardData[] = [
  { cat: '⚡ CRYPTO',  q: 'Best Layer 2 for DeFi?',     a: 'ARBITRUM',        p: '$45.20', d: '23 trades · +', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1.5 },
  { cat: '🏀 SPORTS',  q: 'GOAT of Basketball?',         a: 'JORDAN',          p: '$78.50', d: '67 trades · +', bg: '#FFFFFF', fg: '#15120D', tilt:  1.5 },
  { cat: '🍕 FOOD',    q: 'Best Pizza in NYC?',          a: 'DI FARA',         p: '$23.10', d: '18 trades · −', bg: '#4DFFE0', fg: '#15120D', tilt: -2   },
  { cat: '📱 TECH',    q: 'Most Overrated Tech Co?',     a: 'APPLE',           p: '$52.80', d: '41 trades · +', bg: '#FF4D6B', fg: '#FFFFFF', tilt:  2   },
  { cat: '🎌 ANIME',   q: 'Best Anime of All Time?',     a: 'ATTACK ON TITAN', p: '$31.40', d: '34 trades · +', bg: '#FFE94D', fg: '#15120D', tilt: -1.5 },
];

const TESTIMONIALS = [
  { quote: 'Someone paid $47 to disagree with my take on "Best Layer 2". I pocketed $44.65. Being wrong never felt so good.', author: '0x7d3...8f2a',  cat: 'CRYPTO', profit: '+$200',     bg: '#4DFFE0' },
  { quote: 'I minted "GOAT of Soccer?" for $5. It’s been flipped 67 times. I’ve earned $180 in royalties just from people arguing.', author: 'soccerfan.eth', cat: 'SPORTS', profit: '+$450', bg: '#FF4D6B' },
  { quote: 'Put $23 on "Best Pizza in NYC". Someone disagreed 2 hours later. I made $21.85 for having a pizza opinion.', author: 'foodie_nyc',    cat: 'FOOD',   profit: '+$180',     bg: '#FFFFFF' },
  { quote: 'Our pool of 8 people took over the "Best DEX" answer. When someone challenged us, we all split $320.', author: 'defi_maxi.eth', cat: 'DEFI', profit: '+$320', bg: '#FFE94D' },
  { quote: 'My "Best coffee in Austin" question generates $50/week in royalties. Turns out people really argue about coffee.', author: 'austin_local',  cat: 'LOCAL',  profit: '+$200/mo',  bg: '#4DFFE0' },
];

const CATEGORIES = [
  { icon: '🍕', name: 'Food & Culture',  example: '"Best Pizza in Brooklyn?"',        body: 'Restaurants, food bloggers, and locals will fight over this forever. You earn every time.',     bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2   },
  { icon: '⚽', name: 'Sports',           example: '"Who is the GOAT of Soccer?"',     body: 'Messi vs Ronaldo debates have been free for 20 years. Not anymore.',                              bg: '#4DFFE0', fg: '#15120D', tilt:  1.5 },
  { icon: '💻', name: 'Crypto & Tech',    example: '"Best Layer 2 for Gaming?"',       body: 'Blockchain projects and their communities will literally pay to be the answer.',                 bg: '#FFFFFF', fg: '#15120D', tilt: -1   },
  { icon: '🏙️', name: 'Local Knowledge',  example: '"Most reliable plumber in Miami?"', body: 'Real businesses will pay to be the top recommendation. You get royalties.',                     bg: '#FFE94D', fg: '#15120D', tilt:  2   },
];

const MATH_EXAMPLES = [
  { q: 'GOAT of Soccer?',          volume: 23400, royalty: 702 },
  { q: 'iPhone vs Android?',       volume: 31800, royalty: 954 },
  { q: 'Most Overrated TV Show?',  volume: 14200, royalty: 426 },
  { q: 'Best Pizza in Brooklyn?',  volume: 18700, royalty: 561 },
];

const BEST_CATEGORIES = [
  { name: 'Sports GOAT debates',         range: '$300-600/mo' },
  { name: 'Food & restaurant reviews',   range: '$200-400/mo' },
  { name: 'Tech comparisons',            range: '$250-500/mo' },
  { name: 'Local knowledge',             range: '$150-350/mo' },
];

const TRUST_BADGES = [
  { icon: '🎯', title: 'Verified on Base',   body: 'Smart contracts verified on BaseScan',  bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2 },
  { icon: '🛡', title: 'Anti-MEV',            body: 'Protected from front-running',           bg: '#FFFFFF', fg: '#15120D', tilt:  1.5 },
  { icon: '🤝', title: '98% to Community',    body: 'Only 2% platform fee',                   bg: '#4DFFE0', fg: '#15120D', tilt: -1 },
  { icon: '🌐', title: 'Open Source',         body: 'Transparent, auditable code',            bg: '#FFE94D', fg: '#15120D', tilt:  2 },
];

const LIVE_STATS = [
  { label: 'Active Opinions',  value: 47,    prefix: '',  suffix: ''      },
  { label: 'Total Volume',     value: 12847, prefix: '$', suffix: ''      },
  { label: 'Trades Today',     value: 156,   prefix: '',  suffix: ''      },
  { label: 'Active Traders',   value: 89,    prefix: '',  suffix: ''      },
];

// ---------- Page ----------

export default function PosterArcadeLanding() {
  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative flex min-h-screen flex-col">
      <Halftone />

      <Nav />

      {/* ============================================================
          1 · HERO
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-10 md:px-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-10">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em]">
              ★ OPINIONS ARE FREE. YOURS ISN’T. ★
            </div>

            <h1 className="mt-3 font-display text-[44px] font-black leading-[0.92] tracking-[-0.04em] md:text-[80px]">
              OPINION<br />
              <span className="text-pop">MARKET</span><br />
              CAP.
            </h1>

            <p className="mt-4 max-w-[460px] text-base font-semibold md:text-lg">
              Back your opinion with real money on Base.{' '}
              <b>Get paid when someone disagrees.</b>
            </p>

            {/* Live stats — ticking counters on viewport entry */}
            <div className="mt-5 grid grid-cols-2 gap-2 md:max-w-[480px] md:grid-cols-4">
              {LIVE_STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-sticker border-[2.5px] border-ink bg-paper px-2.5 py-2 shadow-sticker-sm"
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">{s.label}</div>
                  <div className="font-mono text-sm font-extrabold leading-tight">
                    <AnimatedNumber value={s.value} prefix={s.prefix} suffix={s.suffix} duration={1600} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
                <BtnPrimary>★ PUT YOUR MONEY WHERE YOUR MOUTH IS</BtnPrimary>
              </a>
              <a href="#how-it-works">
                <BtnSecondary>see how it works →</BtnSecondary>
              </a>
            </div>

            <div className="mt-6 inline-block rounded-full border-[2.5px] border-ink bg-ink px-4 py-1.5 font-mono text-[11px] font-extrabold tracking-[0.18em] text-canvas">
              ▲ OMC IS BASE BASED
            </div>
          </div>

          {/* Sticker collage */}
          <div className="relative h-[300px] md:h-[320px]">
            {HERO_COLLAGE.map((c, i) => (
              <div key={i} className="absolute w-[210px] md:w-[230px]" style={c.pos}>
                <TakeCard data={c} size="hero" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          2 · THE DARE
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            EVERYONE HAS OPINIONS.<br />
            <span className="text-pop">FEW BACK THEM UP.</span>
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Talk is cheap */}
            <Sticker bg="#FFFFFF" fg="#15120D" tilt={-1.5} shadow={6}>
              <CatChip bg="#FF4D6B" fg="#FFFFFF">✗ TALK IS CHEAP</CatChip>
              <ul className="mt-4 space-y-3">
                {TALK_IS_CHEAP.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-base font-semibold">
                    <span className="mt-px font-black text-pop">✗</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Sticker>

            {/* OMC is proof */}
            <Sticker bg="#4DFFE0" fg="#15120D" tilt={1.5} shadow={6}>
              <CatChip bg="#15120D" fg="#4DFFE0">✓ OMC IS PROOF</CatChip>
              <ul className="mt-4 space-y-3">
                {OMC_IS_PROOF.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-base font-semibold">
                    <span className="mt-px font-black">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Sticker>
          </div>
        </div>
      </section>

      {/* ============================================================
          3 · HOW IT WORKS
          ============================================================ */}
      <section id="how-it-works" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            THREE WAYS<br />
            TO <span className="text-pop">PROFIT.</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
            {STEPS.map((s) => (
              <Sticker key={s.num} bg={s.bg} fg={s.fg} tilt={s.tilt} shadow={6} tappable>
                <div className="font-mono text-[36px] font-black leading-none opacity-50">{s.num}</div>
                <h3 className="mt-2 font-display text-[22px] font-black tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 text-sm font-semibold">{s.body}</p>
              </Sticker>
            ))}
          </div>

          {/* Money flow */}
          <div className="mt-12 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker md:p-8">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl font-black tracking-[-0.02em]">PER $100 TRADE</h3>
              <span className="font-mono text-xs font-bold opacity-70">distribution</span>
            </div>
            <div className="mt-4 space-y-3">
              {MONEY_FLOW.map((row, i) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between font-mono text-sm font-extrabold">
                    <span className="font-body font-bold">{row.label}</span>
                    <span>
                      $<AnimatedNumber value={row.pct} duration={1100} />
                    </span>
                  </div>
                  <AnimatedBar pct={row.pct} bg={row.bg} className="mt-1" delayMs={120 * i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3.5 · SELF-EXIT (V4)
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="inline-block rounded-full border-[2.5px] border-ink bg-ink px-3 py-1 font-mono text-[10px] font-extrabold tracking-[0.18em] text-canvas">
            ✨ NEW · V4
          </div>
          <h2 className="mt-3 font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            YOU CAN ALWAYS<br />
            <span className="text-pop">WALK AWAY.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            Held an answer too long and the wave never came? Self-Exit pulls the trap-door —
            you recover the locked stake floor and the slot opens for the next bidder at half the
            previous price. <b>Two winners, no hostages.</b>
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {/* ────────── Self-Exit card ────────── */}
            <Sticker bg="#FF4D6B" fg="#FFFFFF" tilt={-2} shadow={6}>
              <div className="flex items-start justify-between">
                <CatChip bg="#FFFFFF" fg="#15120D">↩ FOR THE KING</CatChip>
                <span className="text-2xl">↪</span>
              </div>
              <h3 className="mt-4 font-display text-[28px] font-black tracking-[-0.03em]">Self-Exit.</h3>

              <p className="mt-2 text-sm font-semibold leading-relaxed">
                Stuck owning a slot nobody flips? After a short cooldown pull back{' '}
                <b className="bg-paper px-1.5 py-px text-ink">80% of the locked stake</b>.
                The 20% penalty splits 50/50 between creator and platform.
              </p>

              {/* Explainer */}
              <div className="mt-3 rounded-md border-2 border-paper/50 bg-paper/10 p-2.5">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                  What’s the locked stake?
                </div>
                <p className="mt-1 text-[12px] font-semibold leading-snug">
                  The bootstrap amount the <b>creator</b> set when minting the question — a fixed
                  recovery floor that travels with the answer. It doesn’t scale with what you paid:
                  Self-Exit is a safety net, not a full position refund. The real cash-out is
                  getting flipped (you keep <b>~95%</b> of the next buyer’s price).
                </p>
              </div>

              {/* Worked example */}
              <div className="mt-3 rounded-md border-[2.5px] border-ink bg-paper p-3 text-ink shadow-sticker-sm">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-70">
                  Example · $100 initial price
                </div>
                <ul className="mt-1.5 space-y-1 font-mono text-[12px] font-bold">
                  <li className="flex justify-between"><span>Creator <i>(Alice)</i> mints @</span><span>$100</span></li>
                  <li className="flex justify-between"><span>Locked stake</span><span>$100</span></li>

                  <li className="mt-1 flex justify-between border-t border-dashed border-ink/30 pt-1"><span>You buy the answer for</span><span>$120</span></li>
                  <li className="flex justify-between opacity-80"><span>· 95% → Alice <i>(previous owner)</i></span><span>$114</span></li>
                  <li className="flex justify-between opacity-80"><span>· 3% → Alice <i>(creator royalty)</i></span><span>$3.60</span></li>
                  <li className="flex justify-between opacity-80"><span>· 2% → platform</span><span>$2.40</span></li>
                  <li className="flex justify-between bg-canvas/60 px-1"><span><b>Alice received in total</b></span><span><b>$117.60</b></span></li>
                  <li className="flex justify-between opacity-80"><span>Locked stake (unchanged)</span><span>$100</span></li>

                  <li className="mt-1 flex justify-between border-t border-dashed border-ink/30 pt-1 text-pop"><span>You self-exit · refund</span><span>$80</span></li>
                  <li className="flex justify-between opacity-80"><span>· to creator (50% of penalty)</span><span>$10</span></li>
                  <li className="flex justify-between opacity-80"><span>· to platform (50% of penalty)</span><span>$10</span></li>
                </ul>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs font-bold">
                <li>✓ Always exit — never trapped in a dead opinion</li>
                <li>✓ Cooldown protects against rage-quits</li>
                <li>✓ One click in the dapp, no negotiation</li>
              </ul>
            </Sticker>

            {/* ────────── Vacant slot card ────────── */}
            <Sticker bg="#4DFFE0" fg="#15120D" tilt={2} shadow={6}>
              <div className="flex items-start justify-between">
                <CatChip bg="#15120D" fg="#4DFFE0">↩ NEXT BIDDER</CatChip>
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="mt-4 font-display text-[28px] font-black tracking-[-0.03em]">
                Reclaim the<br />Vacant Slot.
              </h3>

              <p className="mt-2 text-sm font-semibold leading-relaxed">
                When the king walks, the answer goes <b>vacant</b>. The next person to claim it pays{' '}
                <b className="bg-ink px-1.5 py-px text-cool">50% of the previous price</b>{' '}
                — a discounted entry into a market that’s already warmed up.
              </p>

              {/* Explainer */}
              <div className="mt-3 rounded-md border-2 border-ink/40 bg-ink/5 p-2.5">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                  Why bother reclaiming?
                </div>
                <p className="mt-1 text-[12px] font-semibold leading-snug">
                  You skip the bidding war. You inherit the question’s existing audience, volume
                  and creator royalty engine. And — unlike the original king — <b>your locked stake
                  resets to ~95% of what you paid</b>, so your own self-exit floor is meaningful
                  if you ever need it. Floor price: <b>$2</b>.
                </p>
              </div>

              {/* Worked example */}
              <div className="mt-3 rounded-md border-[2.5px] border-ink bg-paper p-3 text-ink shadow-sticker-sm">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-70">
                  Example · last price $120
                </div>
                <ul className="mt-1.5 space-y-1 font-mono text-[12px] font-bold">
                  <li className="flex justify-between"><span>Previous last price</span><span>$120</span></li>
                  <li className="flex justify-between text-pop"><span>You reclaim @ 50%</span><span>$60</span></li>
                  <li className="flex justify-between opacity-80"><span>· fees (5%)</span><span>$3</span></li>
                  <li className="flex justify-between"><span>Your new locked stake</span><span>$57</span></li>
                  <li className="flex justify-between opacity-80"><span>If you self-exit later · refund</span><span>$45.60</span></li>
                </ul>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs font-bold">
                <li>✓ Half-price entry on a proven question</li>
                <li>✓ Real recovery floor — locked stake resets to your buy-in</li>
                <li>✓ One transaction, no auction</li>
              </ul>
            </Sticker>
          </div>

          <p className="mt-8 text-center font-mono text-xs font-bold opacity-70">
            on-chain · permissionless · audited · every parameter visible on Basescan
          </p>
        </div>
      </section>

      {/* ============================================================
          4 · TRENDING (Live Opinions)
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-baseline">
            <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
              🔥 LIVE OPINIONS.<br />
              <span className="text-pop">REAL MONEY.</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-pulse rounded-full border-2 border-ink bg-pop" />
              <span className="font-mono text-xs font-extrabold tracking-widest">LIVE NOW</span>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-base font-semibold">
            These takes are being traded right now.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TRENDING.map((t, i) => (
              <TakeCard key={i} data={t} size="wall" />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>view all opinions →</BtnPrimary>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          5 · TESTIMONIALS
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            WHAT HAPPENS WHEN YOU<br />
            <span className="text-pop">BACK YOUR OPINION.</span>
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Sticker
                key={i}
                bg={t.bg}
                fg={t.bg === '#FF4D6B' ? '#FFFFFF' : '#15120D'}
                tilt={i % 2 === 0 ? -1.5 : 1.5}
                shadow={5}
              >
                <div className="flex items-center justify-between">
                  <CatChip bg={t.bg === '#FFFFFF' ? '#FFE94D' : '#FFFFFF'}>{t.cat}</CatChip>
                  <span className="font-mono text-base font-black">{t.profit}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-3 font-mono text-[11px] font-bold opacity-80">— {t.author}</div>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          6 · USE CASES
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            EVERY ARGUMENT IS AN<br />
            <span className="text-pop">OPPORTUNITY.</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Sticker key={c.name} bg={c.bg} fg={c.fg} tilt={c.tilt} shadow={6} tappable>
                <div className="text-[44px] leading-none">{c.icon}</div>
                <h3 className="mt-3 font-display text-[20px] font-black tracking-[-0.02em]">{c.name}</h3>
                <p className="mt-2 text-sm font-bold italic">{c.example}</p>
                <p className="mt-2 text-xs font-semibold opacity-90">{c.body}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          7 · THE MATH
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            THE MATH<br />
            <span className="text-pop">DOESN’T LIE.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            Mint once. Earn 3% royalties. <b>Forever.</b>
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {MATH_EXAMPLES.map((m, i) => (
              <Sticker
                key={m.q}
                bg={i % 2 === 0 ? '#FFFFFF' : '#4DFFE0'}
                fg="#15120D"
                tilt={i % 2 === 0 ? -1.5 : 1.5}
                shadow={5}
              >
                <h4 className="font-display text-base font-black tracking-[-0.01em]">&ldquo;{m.q}&rdquo;</h4>
                <div className="mt-3 grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Volume</div>
                    <div className="text-lg font-extrabold">${m.volume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Your 3% royalties</div>
                    <div className="text-lg font-extrabold text-pop">${m.royalty.toLocaleString()}</div>
                  </div>
                </div>
              </Sticker>
            ))}
          </div>

          <p className="mt-10 text-center text-base font-semibold md:text-lg">
            Questions don’t expire. Sports, food, tech — people will argue forever.{' '}
            <b className="bg-pop px-1.5 py-px text-white">Your royalties compound.</b>
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-sticker border-[2.5px] border-ink bg-ink p-6 text-canvas shadow-sticker">
            <h3 className="font-display text-lg font-black tracking-[-0.02em]">★ BEST PERFORMING CATEGORIES</h3>
            <div className="mt-4 space-y-2">
              {BEST_CATEGORIES.map((c) => (
                <div key={c.name} className="flex justify-between border-b border-dashed border-canvas/30 pb-1.5 text-sm font-bold last:border-0">
                  <span>{c.name}</span>
                  <span className="font-mono">{c.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          8 · ORIGIN STORY
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            HOW A <span className="bg-canvas px-2 ring-[2.5px] ring-ink">$20</span> BET<br />
            STARTED <span className="text-pop">EVERYTHING.</span>
          </h2>

          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-0.5} shadow={6} className="mt-10">
            <div className="font-display text-[44px] leading-none opacity-40">&ldquo;</div>
            <p className="mt-2 text-base font-semibold italic leading-relaxed md:text-lg">
              Once, I was listening to my kids debating over the Harry Potter series. The elder,
              whose favorite was <i>Prisoner of Azkaban</i>, argued its supremacy with passion.
              The younger was convinced <i>Goblet of Fire</i> was the best. They couldn’t agree.
              Finally, the elder said, &lsquo;I’ll give you{' '}
              <b className="bg-canvas px-1.5 py-px not-italic">$20</b>{' '}
              if you agree with me.&rsquo; The younger, after a moment’s thought, accepted the
              deal and pocketed the bill. The next day, when I asked which was the best novel,
              they both agreed on <i>Prisoner of Azkaban</i>.
            </p>
            <div className="mt-4 text-right font-mono text-sm font-bold">— Axel, OMC Founder</div>
          </Sticker>

          <p className="mt-8 text-center text-lg font-semibold md:text-xl">
            That was the spark. Money settles debates that facts never could.{' '}
            <b className="text-pop">OMC puts that on-chain.</b>
          </p>
        </div>
      </section>

      {/* ============================================================
          9 · TRUST
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            BATTLE-TESTED.<br />
            <span className="text-pop">COMMUNITY-OWNED.</span>
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <Sticker key={b.title} bg={b.bg} fg={b.fg} tilt={b.tilt} shadow={5}>
                <div className="text-[36px] leading-none">{b.icon}</div>
                <h4 className="mt-3 font-display text-base font-black tracking-[-0.02em]">{b.title}</h4>
                <p className="mt-1 text-xs font-bold opacity-90">{b.body}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          10 · FINAL CTA
          ============================================================ */}
      <section className="relative z-10 px-6 py-14 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[72px]">
            READY TO PUT YOUR MONEY<br />
            <span className="text-pop">WHERE YOUR MOUTH IS?</span>
          </h2>
          <p className="mt-5 text-lg font-semibold md:text-xl">
            Create a question. Trade an answer. Get paid when someone disagrees.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>★ LAUNCH APP →</BtnPrimary>
            </a>
            <a href="https://docs.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnSecondary>read the docs</BtnSecondary>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
