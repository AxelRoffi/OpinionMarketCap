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

const PILLARS = [
  {
    n: '01',
    title: 'Mimetic Desire → Memetic Desire',
    thinker: 'René Girard',
    thinkerUrl: 'https://en.wikipedia.org/wiki/Ren%C3%A9_Girard',
    description: 'Girard argued we desire things not for their intrinsic value, but because others desire them. In the digital age, this has fused with the viral power of memes. OMC is the first platform to translate this fundamental human driver into a tradeable, on-chain asset.',
    punchline: "We don't want things. We want what others want. OMC makes that impulse tradeable.",
    bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2,
  },
  {
    n: '02',
    title: 'Reflexivity',
    thinker: 'George Soros',
    thinkerUrl: 'https://en.wikipedia.org/wiki/Reflexivity_(social_theory)',
    description: "Market participants' perceptions shape the fundamentals they're meant to reflect. In OMC, the \"fundamental value\" of an answer is nothing more than the market's perception of it. The price doesn't reflect value — the price is the value.",
    punchline: 'The answer with the most money behind it wins. Not the one with the best argument.',
    bg: '#4DFFE0', fg: '#15120D', tilt: 1.5,
  },
  {
    n: '03',
    title: 'Durex Codex, Sed Codex',
    thinker: 'Code is Law',
    thinkerUrl: 'https://basescan.org/address/0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1',
    description: '"The Code is Harsh, but it is The Code." The rules are encoded in smart contracts, enforced with absolute certainty. Not a promise — a verifiable reality. Transparent, auditable, immutable. Every trade, every fee, every transfer.',
    punchline: 'No middlemen. No moderation. No exceptions. The protocol decides.',
    bg: '#FFFFFF', fg: '#15120D', tilt: -1.5,
  },
];

const PIONEERS = [
  {
    name: 'This Artwork Is Always On Sale',
    url: 'https://thisartworkisalwaysonsale.com/',
    inspiration: 'Radical Markets',
    inspirationUrl: 'https://www.radicalxchange.org/media/papers/radical-markets.pdf',
    lesson: 'Proved Harberger-style economics could function in the wild. Self-assessed pricing creates fascinating market dynamics.',
    took: 'We made price discovery fully dynamic and market-driven. Not self-assessed — the crowd decides.',
    bg: '#FFE94D', fg: '#15120D', tilt: -2,
  },
  {
    name: 'Nouns DAO',
    url: 'https://nouns.wtf',
    inspiration: 'Perpetual auctions',
    lesson: 'Proved that a community can thrive around a "forever game." One NFT per day, auctioned forever. Simple mechanic, powerful community.',
    took: 'We applied the "forever game" concept not to a single asset, but to infinite user-generated markets of ideas.',
    bg: '#4DFFE0', fg: '#15120D', tilt: 1.5,
  },
  {
    name: "Satoshi's Place",
    url: 'https://satoshis.place/',
    inspiration: 'Competitive on-chain spaces',
    lesson: 'Demonstrated the raw human desire for competitive, on-chain social expression. Pay to paint pixels. Chaos ensues.',
    took: 'We added economic sophistication. Dynamic pricing ensures that as a narrative heats up, the cost to control it rises. Filters for true conviction.',
    bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1,
  },
];

const COMPARE = [
  { label: 'Prediction markets', desc: 'Binary Yes/No. Resolve once and die. ~500 markets total. Curated by platform. Need an oracle to settle.', bg: '#FFFFFF', fg: '#15120D', tilt: -1,   dim: true  },
  { label: 'Social media',       desc: 'Likes, upvotes, comments. Free. Gameable. Worthless signal.',                                                 bg: '#FFFFFF', fg: '#15120D', tilt:  1,   dim: true  },
  { label: 'OMC',                desc: 'Perpetual markets — never expire. 100M+ possible markets. Anyone mints in 60s. The price IS the answer.',     bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1.5, dim: false },
];

const DIFFERENTIATORS = [
  { icon: '⚙️', title: 'Self-Resolving', desc: 'No oracles. No external judges. The market resolves itself with every new answer. Truly decentralized.', bg: '#4DFFE0', fg: '#15120D', tilt: -1.5 },
  { icon: '🌐', title: 'Perpetual',       desc: 'Markets never close. "Best CRM?" trades today, tomorrow, and in 10 years. As long as people have opinions, the market lives.', bg: '#FFFFFF', fg: '#15120D', tilt:  1 },
  { icon: '📜', title: 'Ownership is Real', desc: 'Your answer is a blockchain asset. Immutable. Censorship-resistant. You own it until someone pays more.', bg: '#FFE94D', fg: '#15120D', tilt: -1 },
];

const VISION_CARDS = [
  { title: 'For Creators',     desc: 'Mint questions. Earn 3% royalty on every trade. Forever. This isn’t the creator economy — this is the creator ownership economy. You built the market. You own the revenue stream.', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -2 },
  { title: 'For Brands',       desc: 'The world’s first advertising platform with built-in exit liquidity. A marketing expense becomes a potential investment. Own the answer to "Best luxury watch?" and the market works for you.',         bg: '#FFE94D', fg: '#15120D', tilt:  1.5 },
  { title: 'For Communities',  desc: 'Pool money together. Back your tribe’s answer. Crypto Twitter arguing over the best L2? Put your bags where your mouth is. Pools make collective conviction tradeable.',                              bg: '#4DFFE0', fg: '#15120D', tilt: -1 },
  { title: 'For Traders',      desc: 'A new asset class. Buy answers cheap before they blow up. Sell when someone disagrees. Same game, new arena. Social arbitrage meets on-chain economics.',                                             bg: '#FFFFFF', fg: '#15120D', tilt:  2 },
];

const CONTRACTS = [
  { name: 'OpinionCoreV4', url: 'https://basescan.org/address/0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1' },
  { name: 'PoolManagerV2', url: 'https://basescan.org/address/0x34537a749F4b16E7542a59e5322338372A6a1E3c' },
  { name: 'FeeManager',    url: 'https://basescan.org/address/0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA' },
];

// ---------- Page ----------

export default function Influences() {
  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative flex min-h-screen flex-col">
      <Halftone />

      <Nav active="Influences" />

      {/* ============================================================ HERO */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <HeroEyebrow className="text-[11px] font-black uppercase tracking-[0.18em]">★ INFLUENCES ★</HeroEyebrow>
          <HeroTitle className="mt-3 font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[88px]">
            The Genesis<br />
            <span className="text-pop">of an Idea.</span>
          </HeroTitle>
          <HeroLede className="mx-auto mt-5 max-w-2xl text-base font-semibold md:text-lg">
            From a childhood bet to a new digital economy. The philosophy, influences,
            and on-chain pioneers behind OMC.
          </HeroLede>
          <div className="mt-8">
            <a href="#spark"><BtnPrimary>★ READ THE STORY ↓</BtnPrimary></a>
          </div>
        </div>
      </section>

      {/* ============================================================ SPARK — $20 STORY */}
      <section id="spark" className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            IT STARTED WITH A<br />
            <span className="bg-canvas px-2 ring-[2.5px] ring-ink">$20</span> <span className="text-pop">BILL.</span>
          </SectionTitle>

          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-0.5} shadow={6} className="mt-10">
            <div className="font-display text-[44px] leading-none opacity-40">&ldquo;</div>
            <p className="text-base font-semibold italic leading-relaxed md:text-lg">
              My kids were debating the Harry Potter series. The elder argued that{' '}
              <i>Prisoner of Azkaban</i> was the best. The younger was convinced it was{' '}
              <i>Goblet of Fire</i>. They couldn’t agree.
            </p>
            <p className="mt-3 text-base font-semibold italic leading-relaxed md:text-lg">
              Finally, the elder said:{' '}
              <b className="bg-canvas px-1.5 py-px not-italic">&lsquo;I’ll give you $20 if you agree with me.&rsquo;</b>
            </p>
            <p className="mt-3 text-base font-semibold italic leading-relaxed md:text-lg">
              The younger accepted. Pocketed the bill. The next day, they both agreed on{' '}
              <i>Prisoner of Azkaban</i>.
            </p>
            <p className="mt-4 text-lg font-black not-italic md:text-xl">
              Money had settled a debate that facts never could. That was the spark.
            </p>
            <div className="mt-4 text-right font-mono text-sm font-bold">— The founder of OMC</div>
          </Sticker>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            <Sticker bg="#FFE94D" fg="#15120D" tilt={-1.5} shadow={5}>
              <span className="text-[28px]">💡</span>
              <h3 className="mt-2 font-display text-[20px] font-black tracking-[-0.02em]">The Question.</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed">
                Could this mechanism be formalized? Could we create a system where the weight
                of an opinion is measured not by likes or upvotes — but by economic commitment?
              </p>
            </Sticker>
            <Sticker bg="#FF4D6B" fg="#FFFFFF" tilt={1.5} shadow={5}>
              <span className="text-[28px]">✨</span>
              <h3 className="mt-2 font-display text-[20px] font-black tracking-[-0.02em]">The Answer.</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed">
                OMC. Not a social platform. Not another DeFi protocol. An economic game built on
                one premise: <b>the financialization of narrative itself.</b>
              </p>
            </Sticker>
          </div>
        </div>
      </section>

      {/* ============================================================ PHILOSOPHY — 3 PILLARS */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            THE INTELLECTUAL<br />
            <span className="text-pop">FOUNDATIONS.</span>
          </SectionTitle>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            Three ideas that shaped how OMC works — and why it works.
          </p>

          <div className="mt-10 space-y-6">
            {PILLARS.map((p) => (
              <Sticker key={p.n} bg={p.bg} fg={p.fg} tilt={p.tilt} shadow={6}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 font-mono text-[44px] font-black leading-none opacity-40 md:text-[64px]">{p.n}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-[22px] font-black tracking-[-0.02em] md:text-[28px]">{p.title}</h3>
                    <a
                      href={p.thinkerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold opacity-80 underline-offset-4 hover:underline"
                    >
                      {p.thinker} ↗
                    </a>
                    <p className="mt-3 text-sm font-semibold leading-relaxed">{p.description}</p>
                    <p className="mt-3 font-display text-base font-black tracking-[-0.01em]">→ {p.punchline}</p>
                  </div>
                </div>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ PIONEERS */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            STANDING ON THE SHOULDERS<br />
            <span className="text-pop">OF GIANTS.</span>
          </SectionTitle>
          <p className="mt-4 max-w-2xl text-base font-semibold md:text-lg">
            We studied the on-chain experiments that came before us. Learned their lessons.
            Built on their innovation.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
            {PIONEERS.map((p) => (
              <Sticker key={p.name} bg={p.bg} fg={p.fg} tilt={p.tilt} shadow={6} tappable className="flex h-full flex-col">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-base font-black tracking-[-0.02em] underline-offset-4 hover:underline md:text-lg"
                >
                  {p.name} ↗
                </a>
                {'inspirationUrl' in p && p.inspirationUrl ? (
                  <a
                    href={p.inspirationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs font-bold opacity-80 underline-offset-4 hover:underline"
                  >
                    Inspired by: {p.inspiration} ↗
                  </a>
                ) : (
                  <span className="mt-1 text-xs font-bold opacity-80">Inspired by: {p.inspiration}</span>
                )}
                <p className="mt-3 flex-1 text-sm font-semibold leading-relaxed">{p.lesson}</p>
                <div className="mt-4 rounded-md border-[2.5px] border-ink bg-paper p-2.5 text-ink shadow-sticker-sm">
                  <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-70">WHAT WE TOOK</div>
                  <p className="mt-1 text-xs font-bold">{p.took}</p>
                </div>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ CORE INSIGHT */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            A MARKET FOR<br />
            <span className="text-pop">EVERY QUESTION.</span>
          </SectionTitle>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="space-y-4 text-base font-semibold leading-relaxed md:text-lg">
              <p>How do you settle endless debates like &ldquo;Who is the GOAT of soccer?&rdquo; or &ldquo;What’s the most beautiful city?&rdquo;</p>
              <p>
                We believe a <b>$1 economic commitment</b> to an answer is infinitely more powerful
                than 10,000 likes. Likes are free. Money isn’t.
              </p>
              <p>
                In OMC, <b>minting a question is creating a market.</b> Anyone can do it in 60 seconds.
                From that moment, anyone in the world can compete to claim the answer — as long as
                they’re willing to pay.
              </p>
            </div>

            <div className="space-y-4">
              {COMPARE.map((c) => (
                <div key={c.label} className={c.dim ? 'opacity-60' : ''}>
                  <Sticker bg={c.bg} fg={c.fg} tilt={c.tilt} shadow={c.dim ? 4 : 6}>
                    <h4 className="font-display text-base font-black tracking-[-0.02em]">{c.label}</h4>
                    <p className="mt-1 text-sm font-semibold">{c.desc}</p>
                  </Sticker>
                </div>
              ))}
            </div>
          </div>

          {/* Scale comparison — prediction markets vs OMC */}
          <div className="mt-12 rounded-sticker border-[2.5px] border-ink bg-ink p-6 text-canvas shadow-sticker md:p-8">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-70">PREDICTION MARKETS</div>
                <div className="mt-1 font-mono text-[44px] font-black leading-none md:text-[64px]">~500</div>
                <p className="mt-2 text-xs font-bold opacity-80">curated markets · binary outcomes · resolve once, then dead</p>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-pop">OMC</div>
                <div className="mt-1 font-mono text-[44px] font-black leading-none text-pop md:text-[64px]">100M+</div>
                <p className="mt-2 text-xs font-bold opacity-80">any question is a market · perpetual · never resolves</p>
              </div>
            </div>
            <p className="mt-6 border-t border-dashed border-canvas/30 pt-4 text-center font-display text-base font-black tracking-[-0.02em] md:text-lg">
              200,000× the addressable surface. <span className="text-pop">And ours never expire.</span>
            </p>
          </div>

          {/* Differentiators */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <Sticker key={d.title} bg={d.bg} fg={d.fg} tilt={d.tilt} shadow={5}>
                <span className="text-[28px]">{d.icon}</span>
                <h3 className="mt-2 font-display text-base font-black tracking-[-0.02em]">{d.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed">{d.desc}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ VISION — OCEAN OF LIBERTY */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            AN OCEAN<br />
            <span className="text-pop">OF LIBERTY.</span>
          </SectionTitle>

          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-0.5} shadow={6} className="mt-10">
            <p className="text-base font-semibold leading-relaxed md:text-lg">
              In an era dominated by centralized platforms that control what you see and what you
              can say, OMC offers something radical: <b>an open protocol for free expression
              backed by economics.</b>
            </p>
            <p className="mt-3 text-base font-semibold leading-relaxed md:text-lg">
              Every opinion is a blockchain asset. Your ownership is immutable. No algorithm can
              suppress it. No moderator can delete it. No corporation can monetize it without you
              getting paid.
            </p>
          </Sticker>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {VISION_CARDS.map((v) => (
              <Sticker key={v.title} bg={v.bg} fg={v.fg} tilt={v.tilt} shadow={6} tappable>
                <CatChip bg={v.bg === '#FF4D6B' ? '#FFFFFF' : '#15120D'} fg={v.bg === '#FF4D6B' ? '#15120D' : v.bg === '#FFFFFF' ? '#FFE94D' : '#FFE94D'}>
                  {v.title.toUpperCase()}
                </CatChip>
                <p className="mt-3 text-sm font-semibold leading-relaxed">{v.desc}</p>
              </Sticker>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ FUTURE */}
      <section className="relative z-10 border-b-[2.5px] border-dashed border-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <SectionTitle className="font-display text-[32px] font-black leading-[0.95] tracking-[-0.03em] md:text-[56px]">
            FROM OPINIONS<br />
            TO <span className="text-pop">EVERYTHING.</span>
          </SectionTitle>
          <p className="mt-4 text-base font-semibold md:text-lg">
            If we can create an efficient market for an opinion, what else can we do?
          </p>

          <Sticker bg="#4DFFE0" fg="#15120D" tilt={-0.5} shadow={6} className="mt-10">
            <p className="text-sm font-semibold leading-relaxed md:text-base">
              The same smart contracts that settle debates about the best CRM can enable merchants
              and consumers to transact directly — eliminating the 10–15% commissions extracted
              by intermediaries.
            </p>
            <p className="mt-3 text-sm font-semibold leading-relaxed md:text-base">
              Our oracle-less architecture doesn’t need external data feeds. The market is the
              oracle. This makes the system more robust, more decentralized, and infinitely more
              scalable than anything that came before.
            </p>
            <p className="mt-3 font-display text-lg font-black tracking-[-0.02em] md:text-xl">
              Today: a marketplace for opinions. Tomorrow: a new primitive for global commerce.
            </p>
          </Sticker>

          {/* On-chain verifiable */}
          <div className="mt-8 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider opacity-70">
              Everything is on-chain and verifiable
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CONTRACTS.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-canvas px-3 py-1.5 font-mono text-xs font-extrabold shadow-sticker-sm hover:translate-y-[-1px]"
                >
                  {c.name} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ FINAL CTA */}
      <section className="relative z-10 px-6 py-14 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle className="font-display text-[40px] font-black leading-[0.95] tracking-[-0.04em] md:text-[72px]">
            OWN THE NARRATIVE.<br />
            <span className="text-pop">EARN THE PROFIT.</span>
          </SectionTitle>
          <p className="mt-5 text-lg font-semibold md:text-xl">
            The future of opinions isn’t free. It’s on-chain, transparent, and yours to own.
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
