import Link from 'next/link';
import { cn } from '@/lib/utils';

type NavLink = { label: string; href: string };

const LINKS: NavLink[] = [
  { label: 'Mission',      href: '/v2/mission' },
  { label: 'How it Works', href: '/v2/how-it-works' },
  { label: 'Tutorial',     href: '/v2/tutorial' },
  { label: 'Influences',   href: '/v2/influences' },
  { label: 'Whitepaper',   href: '/v2/whitepaper' },
];

type NavProps = {
  /** Which nav link to underline as active. */
  active?: 'Mission' | 'How it Works' | 'Tutorial' | 'Influences' | 'Whitepaper';
  /** Replace the right-side CTA. */
  ctaLabel?: string;
  /** External URL for CTA. Defaults to dapp. */
  ctaHref?: string;
};

export function Nav({
  active,
  ctaLabel = 'LAUNCH APP →',
  ctaHref = 'https://app.opinionmarketcap.xyz',
}: NavProps) {
  return (
    <nav
      className="relative z-10 flex items-center justify-between border-b-[2.5px] border-dashed border-ink px-6 py-4 md:px-10"
    >
      {/* Logo */}
      <Link href="/v2" className="flex items-center gap-2.5">
        <span
          className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border-[2.5px] border-ink bg-pop text-sm font-black text-white shadow-sticker-sm"
          aria-hidden
        >
          ★
        </span>
        <span className="font-display text-[22px] font-black tracking-[-0.03em]">OMC</span>
      </Link>

      {/* Nav links */}
      <ul className="hidden items-center gap-5 text-xs font-bold md:flex">
        {LINKS.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className={cn(
                'transition-opacity hover:opacity-80',
                l.label === active && 'border-b-2 border-ink pb-px',
              )}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-ink px-4 py-2 text-[12px] font-black uppercase tracking-[0.06em] text-canvas shadow-cta-pop transition-transform duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-sticker-press cursor-pointer"
      >
        {ctaLabel}
      </a>
    </nav>
  );
}
