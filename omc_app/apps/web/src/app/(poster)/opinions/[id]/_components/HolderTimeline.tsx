import { MonoNum } from '@/components/poster-arcade';
import { fmtUSD } from '../../../_data/mock-takes';
import { fmtSinceISO, type HolderRecord } from '../../../_data/take-detail';
import { AddressLink } from '../../../_components/AddressLink';

type HolderTimelineProps = {
  holders: HolderRecord[];
  /** Index of the current holder — gets a pop accent. Defaults to last. */
  currentIndex?: number;
};

export function HolderTimeline({ holders, currentIndex }: HolderTimelineProps) {
  const current = currentIndex ?? holders.length - 1;

  return (
    <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[4px_4px_0_var(--ink)] p-4 md:p-5">
      <div className="font-display font-black text-[16px] tracking-tight mb-3">
        WHO HELD THIS TAKE.
      </div>

      <ol className="relative pl-5">
        <span
          aria-hidden
          className="absolute left-[5px] top-1 bottom-1 border-l-2 border-dashed border-ink/40"
        />
        {holders.map((h, i) => {
          const isCurrent = i === current;
          return (
            <li key={`${h.addr}-${i}`} className="relative pb-3 last:pb-0">
              <span
                aria-hidden
                className={
                  'absolute -left-[16px] top-1 w-3 h-3 rounded-full border-2 border-ink ' +
                  (isCurrent ? 'bg-pop' : 'bg-paper')
                }
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-display font-extrabold text-[13px]">
                  {h.ownerAddress ? (
                    <AddressLink address={h.ownerAddress} className="font-mono text-ink" />
                  ) : (
                    <span className={h.addr === 'vacant' ? 'text-ink/45' : ''}>@{h.addr}</span>
                  )}
                  {isCurrent && (
                    <span className="ml-2 inline-block bg-pop text-paper border-2 border-ink rounded-pill px-1.5 py-[1px] font-display text-[9px] tracking-[0.08em]">
                      FLOOR
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 text-ink/70">
                  <MonoNum className="text-[13px] text-ink">{fmtUSD(h.price)}</MonoNum>
                  <span className="font-display text-[10px] font-extrabold tracking-[0.1em] uppercase">
                    {fmtSinceISO(h.date)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
