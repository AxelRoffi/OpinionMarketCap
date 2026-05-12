import {
  BtnNav,
  BtnPrimary,
  BtnSecondary,
  CatChip,
  Halftone,
  Sticker,
  TakeCard,
  type TakeCardData,
} from '../_components';

const SAMPLE_TAKES: TakeCardData[] = [
  { cat: '🏀 SPORTS', q: 'GOAT BASKETBALL?', a: 'JORDAN.',      p: '$142', d: '+18%', bg: '#FF4D6B', fg: '#FFFFFF', tilt: -3 },
  { cat: '⚡ CRYPTO', q: 'BEST L2?',         a: 'BASE.',        p: '$312', d: '+9.6%', bg: '#4DFFE0', fg: '#15120D', tilt:  4 },
  { cat: '🎬 CINEMA', q: 'GOAT PIXAR?',      a: 'WALL-E.',      p: '$28',  d: 'NEW',   bg: '#FFFFFF', fg: '#15120D', tilt: -2 },
  { cat: '🎵 MUSIC',  q: 'GOAT album?',      a: 'OK COMPUTER',  p: '$96',  d: '+6%',   bg: '#FF4D6B', fg: '#FFFFFF', tilt: -1.5 },
];

const SWATCHES = [
  { name: 'canvas', hex: '#FFE94D' },
  { name: 'ink',    hex: '#15120D' },
  { name: 'pop',    hex: '#FF4D6B' },
  { name: 'cool',   hex: '#4DFFE0' },
  { name: 'paper',  hex: '#FFFFFF' },
] as const;

export default function DesignSystem() {
  return (
    <main className="poster-arcade-canvas poster-arcade-halftone relative min-h-screen px-6 py-10 md:px-16">
      <Halftone />

      <header className="relative z-10 mb-12 border-b-[2.5px] border-dashed border-ink pb-6">
        <div className="text-[11px] font-black uppercase tracking-[0.18em]">★ OMC · DESIGN SYSTEM ★</div>
        <h1 className="font-display text-5xl font-black tracking-[-0.04em] md:text-6xl">Poster Arcade.</h1>
        <p className="mt-2 max-w-xl text-sm font-semibold">Direction D3 — Sticker Confidence. Loud, confident, hard-shadow stickers on a yellow canvas.</p>
      </header>

      {/* COLOR */}
      <section className="relative z-10 mb-12">
        <h2 className="mb-4 font-display text-2xl font-black tracking-[-0.02em]">Color</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s.name} className="rounded-sticker border-[2.5px] border-ink bg-paper p-3 shadow-sticker">
              <div className="mb-2 h-20 rounded-md border-[2.5px] border-ink" style={{ background: s.hex }} />
              <div className="font-display text-sm font-black tracking-[-0.02em]">{s.name}</div>
              <div className="font-mono text-xs font-bold opacity-70">{s.hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="relative z-10 mb-12">
        <h2 className="mb-4 font-display text-2xl font-black tracking-[-0.02em]">Type</h2>
        <div className="space-y-4 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Display · Inter Tight 900 · -0.03em</div>
            <div className="font-display text-6xl font-black tracking-[-0.04em] leading-none">Take a stand.</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">H2 · Inter Tight 900</div>
            <div className="font-display text-3xl font-black tracking-[-0.02em]">🔥 Hot Wall · Today</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Body · Inter Tight 600</div>
            <p className="text-base font-semibold">Mint your hot take. Hold the floor. When someone outbids you, they pay you to leave.</p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mono · JetBrains Mono 800</div>
            <div className="font-mono text-lg font-extrabold">$142 · +18% · 847 takes · $284k vol</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Eyebrow · Inter Tight 900 · 0.18em</div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em]">★ EVERY OPINION HAS A PRICE ★</div>
          </div>
        </div>
      </section>

      {/* BUTTONS */}
      <section className="relative z-10 mb-12">
        <h2 className="mb-4 font-display text-2xl font-black tracking-[-0.02em]">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker">
          <BtnPrimary>★ MINT YOUR FIRST TAKE</BtnPrimary>
          <BtnSecondary>browse the floor →</BtnSecondary>
          <BtnNav>★ NEW TAKE</BtnNav>
        </div>
        <p className="mt-2 text-xs font-semibold opacity-70">Tap a button → press-down + shadow collapse, 100ms.</p>
      </section>

      {/* CHIPS */}
      <section className="relative z-10 mb-12">
        <h2 className="mb-4 font-display text-2xl font-black tracking-[-0.02em]">Category chips</h2>
        <div className="flex flex-wrap gap-3 rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker">
          <CatChip>🏀 SPORTS</CatChip>
          <CatChip bg="#FFE94D">🎬 CINEMA</CatChip>
          <CatChip bg="#15120D" fg="#4DFFE0">⚡ CRYPTO</CatChip>
          <CatChip bg="#FF4D6B" fg="#FFFFFF" border="#15120D">🎵 MUSIC</CatChip>
          <CatChip>🍕 FOOD</CatChip>
        </div>
      </section>

      {/* STICKER PRIMITIVE */}
      <section className="relative z-10 mb-12">
        <h2 className="mb-4 font-display text-2xl font-black tracking-[-0.02em]">Sticker primitive</h2>
        <div className="flex flex-wrap items-start gap-10 rounded-sticker border-[2.5px] border-ink bg-paper p-10 shadow-sticker">
          <Sticker bg="#FF4D6B" fg="#FFFFFF" tilt={-3} shadow={6} className="w-56">
            <div className="text-xs font-bold opacity-90">tilt -3 · shadow 6</div>
            <div className="font-display text-3xl font-black leading-none tracking-[-0.03em]">Pop bg.</div>
          </Sticker>
          <Sticker bg="#4DFFE0" fg="#15120D" tilt={4} shadow={5} className="w-56">
            <div className="text-xs font-bold opacity-90">tilt +4 · shadow 5</div>
            <div className="font-display text-3xl font-black leading-none tracking-[-0.03em]">Cool bg.</div>
          </Sticker>
          <Sticker bg="#FFFFFF" fg="#15120D" tilt={-1.5} shadow={4} className="w-56">
            <div className="text-xs font-bold opacity-90">tilt -1.5 · shadow 4</div>
            <div className="font-display text-3xl font-black leading-none tracking-[-0.03em]">Paper bg.</div>
          </Sticker>
        </div>
      </section>

      {/* TAKE CARDS */}
      <section className="relative z-10 mb-12">
        <h2 className="mb-4 font-display text-2xl font-black tracking-[-0.02em]">Take cards · wall size</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SAMPLE_TAKES.map((take, i) => (
            <TakeCard key={i} data={take} size="wall" />
          ))}
        </div>

        <h2 className="mt-10 mb-4 font-display text-2xl font-black tracking-[-0.02em]">Take cards · hero size</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SAMPLE_TAKES.slice(0, 3).map((take, i) => (
            <TakeCard key={i} data={take} size="hero" />
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t-[2.5px] border-dashed border-ink pt-6 text-xs font-bold opacity-70">
        <span>OMC · Poster Arcade · D3 — Sticker Confidence · v0.1</span>
      </footer>
    </main>
  );
}
