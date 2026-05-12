import { Sticker } from './sticker';
import { CatChip } from './cat-chip';

export type TakeCardData = {
  cat: string;
  q: string;
  a: string;
  /** Locked price (e.g. "$142"). */
  p: string;
  /** Delta or status (e.g. "+18%", "NEW"). */
  d: string;
  bg: string;
  fg: string;
  tilt: number;
};

type TakeCardProps = {
  data: TakeCardData;
  /** Visual size. `hero` is bigger (used in hero collage). `wall` is the standard grid card. */
  size?: 'hero' | 'wall';
  className?: string;
  tappable?: boolean;
};

/** A single hot take rendered as a sticker. The canonical card used across the landing. */
export function TakeCard({ data, size = 'wall', className, tappable = true }: TakeCardProps) {
  const { cat, q, a, p, d, bg, fg, tilt } = data;
  const isCool = bg === '#4DFFE0';
  const isPaper = bg === '#FFFFFF';
  const isCanvas = bg === '#FFE94D';

  // CatChip color logic matches the original handoff:
  //  - on cool bg: ink chip with cool text
  //  - on paper bg: canvas chip
  //  - otherwise: white chip
  const chipBg = isCool ? '#15120D' : isPaper ? '#FFE94D' : isCanvas ? '#FFFFFF' : '#FFFFFF';
  const chipFg = isCool ? '#4DFFE0' : '#15120D';

  if (size === 'hero') {
    return (
      <Sticker bg={bg} fg={fg} tilt={tilt} shadow={6} className={className} tappable={tappable}>
        <CatChip bg={chipBg} fg={chipFg}>{cat}</CatChip>
        <div className="mt-1 text-[11px] font-bold opacity-90">&ldquo;{q}&rdquo;</div>
        <div className="mt-1 font-display text-[36px] font-black leading-[0.9] tracking-[-0.03em]">{a}</div>
        <div className="mt-1.5 font-mono text-sm font-extrabold">{p} · {d}</div>
      </Sticker>
    );
  }

  return (
    <Sticker bg={bg} fg={fg} tilt={tilt} shadow={5} className={className} tappable={tappable}>
      <CatChip bg={chipBg} fg={chipFg}>{cat}</CatChip>
      <div className="mt-1 text-[10px] font-bold opacity-85">&ldquo;{q}&rdquo;</div>
      <div className="mt-0.5 font-display text-[26px] font-black leading-[0.95] tracking-[-0.03em]">{a}</div>
      <div className="mt-1.5 flex justify-between font-mono text-xs font-extrabold">
        <span>{p}</span><span>{d}</span>
      </div>
    </Sticker>
  );
}
