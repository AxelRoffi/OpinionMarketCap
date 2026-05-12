import Link from 'next/link';

const PRODUCT = [
  { label: 'Mission',       href: '/mission' },
  { label: 'How it Works',  href: '/how-it-works' },
  { label: 'Tutorial',      href: '/tutorial' },
  { label: 'Influences',    href: '/influences' },
  { label: 'Whitepaper',    href: '/whitepaper' },
];

const COMMUNITY = [
  { label: 'Discord',     href: 'https://discord.gg/opinionmarketcap', external: true },
  { label: 'Twitter / X', href: 'https://twitter.com/OpinionMarketCap', external: true },
  { label: 'GitHub',      href: 'https://github.com/opinionmarketcap', external: true },
  { label: 'Launch App',  href: 'https://app.opinionmarketcap.xyz', external: true },
];

const RESOURCES = [
  { label: 'Documentation',  href: '/whitepaper' },
  { label: 'Smart Contract', href: 'https://basescan.org/address/0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1', external: true },
  { label: 'API (Soon)',     href: '#' },
  { label: 'Brand Kit',      href: '#' },
];

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const className =
    'inline-block py-0.5 text-sm font-semibold underline-offset-4 hover:underline';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return <Link href={href} className={className}>{label}</Link>;
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t-[2.5px] border-dashed border-ink">
      {/* Risk disclaimer band */}
      <div className="border-b-[2.5px] border-dashed border-ink px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl rounded-sticker border-[2.5px] border-ink bg-paper p-6 shadow-sticker">
          <div className="mb-3 inline-block rounded-full border-2 border-ink bg-canvas px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
            ⚠ RISK DISCLAIMER
          </div>
          <p className="text-sm font-semibold leading-relaxed">
            <b>Trading opinions involves significant risk.</b> The value of opinions can fluctuate rapidly and you may lose some or all of your investment. Past performance is not indicative of future results. OpinionMarketCap is a decentralized protocol on the Base blockchain — we do not hold custody of your funds. Always do your own research (DYOR) and never invest more than you can afford to lose.
          </p>
          <p className="mt-3 text-sm font-semibold leading-relaxed">
            <b>Not financial advice.</b> Nothing on this website constitutes investment advice. You should conduct your own research and consult independent advisors before making any investment decisions.
          </p>
          <p className="mt-3 text-sm font-semibold leading-relaxed">
            <b>Regulatory notice.</b> OMC may not be available in all jurisdictions. It is your responsibility to ensure compliance with your local laws and regulations.
          </p>
        </div>
      </div>

      {/* Link columns */}
      <div className="grid gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border-[2.5px] border-ink bg-pop text-sm font-black text-white shadow-sticker-sm"
              aria-hidden
            >
              ★
            </span>
            <span className="font-display text-[22px] font-black tracking-[-0.03em]">OMC</span>
          </div>
          <p className="text-sm font-semibold">Where opinions have price tags.</p>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-black tracking-[-0.02em] uppercase">Product</h4>
          <div className="flex flex-col gap-1">
            {PRODUCT.map((l) => <FooterLink key={l.label} {...l} />)}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-black tracking-[-0.02em] uppercase">Community</h4>
          <div className="flex flex-col gap-1">
            {COMMUNITY.map((l) => <FooterLink key={l.label} {...l} />)}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-black tracking-[-0.02em] uppercase">Resources</h4>
          <div className="flex flex-col gap-1">
            {RESOURCES.map((l) => <FooterLink key={l.label} {...l} />)}
          </div>
        </div>
      </div>

      {/* Bottom rail (ink) */}
      <div className="flex flex-col items-center justify-between gap-2 bg-ink px-6 py-4 text-center text-[12px] font-extrabold tracking-[0.04em] text-canvas md:flex-row md:px-10 md:text-left">
        <span>© 2025 OpinionMarketCap · Where opinions have price tags.</span>
        <div className="flex gap-5">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
