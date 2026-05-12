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

const PLATFORMS = [
  { name: 'Google',     icon: '🔍', verdict: '10 blue links ranked by an algorithm nobody understands.', flaw: 'Best SEO wins. Not the best answer.',           bg: '#FFFFFF', fg: '#15120D', tilt: -2,   winner: false },
  { name: 'Polymarket', icon: '📊', verdict: 'Yes/no bets that expire when the event ends.',           flaw: '~500 markets. Binary outcomes only.',           bg: '#FFE94D', fg: '#15120D', tilt:  1.5, winner: false },
  { name: 'OMC',        icon: '👑', verdict: 'Answers backed by real money. They never expire. They keep growing.', flaw: 'The answer with the most money behind it wins.', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1.5, winner: true  },
];

const ROLES = [
  { icon: '⚡', title: 'Question Creator', copy: 'Mint a question. Every time someone trades an answer, you get 3% royalty. Forever. Not a month. Not a year. Forever.',         bg: '#4DFFE0', fg: '#15120D', tilt: -2 },
  { icon: '💰', title: 'Answer Owner',     copy: 'You own the current answer. Someone disagrees? They pay you to take it. You keep 95%.',                                         bg: '#FF4D6B', fg: '#FFFFFF', tilt:  1.5 },
  { icon: '📈', title: 'The Trader',       copy: 'Buy answers cheap before they blow up. Sell when someone wants it more. Same game, new arena.',                                bg: '#FFFFFF', fg: '#15120D', tilt: -1.5 },
];

const MONEY_BARS = [
  { label: 'Previous Answer Owner', amount: 190, pct: 95, bg: '#4DFFE0' },
  { label: 'Question Creator',      amount:   6, pct:  3, bg: '#FF4D6B' },
  { label: 'Platform',              amount:   4, pct:  2, bg: '#FFFFFF' },
];

const TICKER = [
  { q: 'Best CRM for startups?',       p: '$342'   },
  { q: 'Top running shoes 2025?',      p: '$178'   },
  { q: 'Most iconic watch brand?',     p: '$1,240' },
  { q: 'Best pizza in Brooklyn?',      p: '$89'    },
  { q: 'Most effective skincare?',     p: '$456'   },
  { q: 'Best L2 blockchain?',          p: '$2,100' },
  { q: 'Top AI coding tool?',          p: '$670'   },
  { q: 'Best NC headphones?',          p: '$234'   },
  { q: 'Most undervalued NFT?',        p: '$890'   },
  { q: 'Best Manhattan coffee shop?',  p: '$67'    },
];

const ERAS = [
  { era: 'Web 1.0',  desc: 'Yahoo tells you what to read. Editors decide what matters.',                                bg: '#FFFFFF', fg: '#15120D', highlight: false, tilt: -1   },
  { era: 'Web 2.0',  desc: 'Google’s algorithm decides what’s "true." Whoever pays the most ad money is #1.',           bg: '#FFFFFF', fg: '#15120D', highlight: false, tilt:  1   },
  { era: 'AI Era',   desc: 'ChatGPT makes it up. Sounds confident. Often wrong. Can’t verify anything.',                bg: '#FFFFFF', fg: '#15120D', highlight: false, tilt: -1.5 },
  { era: 'OMC',      desc: 'The answer with the most money behind it wins. On-chain. Transparent. Verifiable.',         bg: '#FF4D6B', fg: '#FFFFFF', highlight: true,  tilt:  1.5 },
];

const PLAYERS = [
  { emoji: '🎨', title: 'Brands',      copy: 'Luxury houses fighting for "Most prestigious watch?" This is advertising with skin in the game.', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2   },
  { emoji: '🤝', title: 'Communities', copy: 'Crypto Twitter pooling money on "Best L2?" Put your bags where your mouth is.',                    bg: '#4DFFE0', fg: '#15120D', tilt:  1.5 },
  { emoji: '💬', title: 'Creators',    copy: 'Mint questions. Earn royalties every time someone trades an answer. Forever. The first question marketplace.', bg: '#FFFFFF', fg: '#15120D', tilt: -1   },
  { emoji: '🔥', title: 'Degens',      copy: 'Buy answers cheap. Wait for someone to disagree. Collect. You know the drill.',                     bg: '#FFE94D', fg: '#15120D', tilt:  2   },
];

// ---------- Page ----------

export default function Mission() {
  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative flex min-h-screen flex-col">
      <Halftone />

      <Nav active="Mission" />

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.18em]">★ THE MISSION ★</div>
          <h1 className="mt-3 font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[78px]">
            The internet is full<br />
            of opinions.<br />
            <span className="text-pop">None of them cost anything.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold md:text-lg">
            Anyone can post &ldquo;Salesforce is the best CRM&rdquo; on Reddit.{' '}
            <b>Zero consequences if they’re wrong. Zero reward if they’re right.</b>
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-display text-lg font-black tracking-[-0.02em] md:text-2xl">
            We built OMC to change that. Back it with money — or don’t bother.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>★ LAUNCH APP →</BtnPrimary>
            </a>
            <a href="#the-insight"><BtnSecondary>how it works ↓</BtnSecondary></a>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE INSIGHT
          ============================================================ */}
      <section id="the-insight" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            GOOGLE GUESSES.<br />
            <span className="text-pop">WE PROVE.</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="relative">
                {p.winner && (
                  <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border-[2.5px] border-ink bg-ink px-3 py-1 font-mono text-[10px] font-extrabold tracking-[0.18em] text-canvas">
                    ★ WINNER
                  </div>
                )}
                <Sticker bg={p.bg} fg={p.fg} tilt={p.tilt} shadow={6}>
                  <div className="text-[36px] leading-none">{p.icon}</div>
                  <h3 className="mt-2 font-display text-[24px] font-black tracking-[-0.02em]">{p.name}</h3>
                  <p className="mt-3 text-sm font-semibold leading-relaxed">{p.verdict}</p>
                  <p className="mt-3 text-xs font-extrabold opacity-90 italic">{p.flaw}</p>
                </Sticker>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-lg font-semibold md:text-xl">
            Not the one with the best SEO. Not the one an algorithm picked.{' '}
            <b className="bg-pop px-2 py-px text-white">The one people put real money behind.</b>
          </p>
        </div>
      </section>

      {/* ============================================================
          MONEY FLOW
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            EVERYONE<br />
            <span className="text-pop">EATS.</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ROLES.map((r) => (
              <Sticker key={r.title} bg={r.bg} fg={r.fg} tilt={r.tilt} shadow={6} tappable>
                <div className="text-[32px] leading-none">{r.icon}</div>
                <h3 className="mt-2 font-display text-[20px] font-black tracking-[-0.02em]">{r.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed">{r.copy}</p>
              </Sticker>
            ))}
          </div>

          {/* Example trade bars */}
          <div className="mt-12 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker md:p-8">
            <CatChip>EXAMPLE TRADE</CatChip>
            <h3 className="mt-3 font-display text-xl font-black tracking-[-0.02em]">&ldquo;Best project management tool?&rdquo;</h3>
            <p className="mt-1 text-sm font-semibold">Someone pays <b className="bg-pop px-1.5 py-px text-white">$200</b> to change the answer to &ldquo;Notion&rdquo;.</p>

            <div className="mt-5 space-y-3">
              {MONEY_BARS.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between font-mono text-sm font-extrabold">
                    <span className="font-body font-bold">{b.label} ({b.pct}%)</span>
                    <span>${b.amount}</span>
                  </div>
                  <div className="mt-1 h-3 rounded-full border-2 border-ink bg-canvas">
                    <div className="h-full rounded-full border-r-2 border-ink" style={{ width: `${b.pct}%`, background: b.bg }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE SCALE
          ============================================================ */}
      <section className="relative z-10 overflow-hidden border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            100 MILLION MARKETS.<br />
            <span className="text-pop">DAY ONE.</span>
          </h2>

          <div className="mt-10 text-center">
            <div className="inline-block rounded-sticker border-[2.5px] border-ink bg-ink px-8 py-6 text-canvas shadow-sticker">
              <div className="font-mono text-[64px] font-black leading-none tracking-tight md:text-[96px]">100M+</div>
              <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-widest opacity-80">
                potential markets · from Google Ads keywords alone
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-3 text-center text-base font-semibold md:text-lg">
            <p>
              Google Ads has <b>100+ million</b> keywords businesses pay to rank for.{' '}
              Every. Single. One. is an OMC market waiting to happen.
            </p>
            <p className="font-display text-lg font-black tracking-[-0.02em] md:text-2xl">
              Polymarket has ~500 markets. <span className="text-pop">We have a hundred million.</span>
            </p>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative mt-10 -mx-6 overflow-hidden md:-mx-10">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-canvas to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-canvas to-transparent" />
          <div className="flex animate-[ticker_30s_linear_infinite] gap-3 whitespace-nowrap">
            {[...TICKER, ...TICKER].map((t, i) => (
              <div key={i} className="inline-flex shrink-0 items-center gap-3 rounded-full border-[2.5px] border-ink bg-paper px-4 py-2 shadow-sticker-sm">
                <span className="text-sm font-bold">{t.q}</span>
                <span className="font-mono text-sm font-extrabold text-pop">{t.p}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </section>

      {/* ============================================================
          THE VISION
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            SEARCH IS BROKEN.<br />
            <span className="text-pop">WE’RE FIXING IT.</span>
          </h2>

          <div className="mt-10 space-y-6">
            {ERAS.map((e, i) => (
              <div key={e.era} className="flex items-start gap-4">
                <div className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-paper font-mono text-base font-black shadow-sticker-sm md:flex">
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <Sticker bg={e.bg} fg={e.fg} tilt={e.tilt} shadow={e.highlight ? 6 : 5}>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-[22px] font-black tracking-[-0.02em]">{e.era}</h3>
                      {e.highlight && (
                        <span className="rounded-full border-2 border-paper bg-canvas px-2 py-px font-mono text-[10px] font-extrabold tracking-widest text-ink">
                          NOW
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-relaxed">{e.desc}</p>
                  </Sticker>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHO'S PLAYING
          ============================================================ */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            WHO’S ALREADY<br />
            <span className="text-pop">PLAYING?</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {PLAYERS.map((p) => (
              <Sticker key={p.title} bg={p.bg} fg={p.fg} tilt={p.tilt} shadow={6} tappable>
                <div className="text-[36px] leading-none">{p.emoji}</div>
                <h3 className="mt-3 font-display text-[22px] font-black tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed">{p.copy}</p>
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
            STOP TALKING.<br />
            <span className="text-pop">START TRADING.</span>
          </h2>
          <p className="mt-5 text-lg font-semibold md:text-xl">
            Your opinion is worthless until there’s money on it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://app.opinionmarketcap.xyz" target="_blank" rel="noopener noreferrer">
              <BtnPrimary>★ PUT YOUR MONEY WHERE YOUR MOUTH IS →</BtnPrimary>
            </a>
            <a href="/v2/whitepaper"><BtnSecondary>read the whitepaper</BtnSecondary></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
