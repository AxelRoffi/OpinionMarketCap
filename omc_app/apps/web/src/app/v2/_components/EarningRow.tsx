import Link from 'next/link';
import { MonoNum } from '@/components/poster-arcade';
import { CAT_MAP, fmtUSD } from '../_data/mock-takes';
import type { EarningRecord } from '../_data/room';

type EarningRowProps = {
  rec: EarningRecord;
  /** Show "your share" line — relevant on portfolio (royalty), suppressed on public profile. */
  showRoyalty?: boolean;
};

export function EarningRow({ rec, showRoyalty = true }: EarningRowProps) {
  const cat = CAT_MAP[rec.category];
  return (
    <Link
      href={`/v2/opinions/${rec.takeId}`}
      className="block bg-paper border-2 border-ink rounded-lg shadow-[3px_3px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--ink)] transition-all"
    >
      <div className="flex items-center gap-3 p-3 md:p-4">
        {/* Category badge */}
        <div
          aria-hidden
          className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-pill border-2 border-ink bg-canvas text-[20px]"
        >
          {cat.emoji}
        </div>

        {/* Question → answer */}
        <div className="min-w-0 flex-1">
          <div className="font-display text-[11px] font-bold italic text-ink/65 truncate">
            &ldquo;{rec.question}&rdquo;
          </div>
          <div className="font-display text-[14px] md:text-[15px] font-extrabold text-ink truncate">
            <span className="uppercase tracking-tight">{rec.answer}.</span>
            <span className="text-ink/40 font-bold"> taken by </span>
            <span className="text-ink">@{rec.takenBy}</span>
          </div>
        </div>

        {/* Royalty */}
        {showRoyalty && (
          <div className="text-right shrink-0">
            <div className="font-display text-[9px] font-extrabold tracking-[0.14em] uppercase text-ink/50">
              your share
            </div>
            <MonoNum className="text-[16px] text-gain block">+{fmtUSD(rec.royalty)}</MonoNum>
          </div>
        )}
      </div>
    </Link>
  );
}
