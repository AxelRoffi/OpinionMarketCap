import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CatChipProps = {
  bg?: string;
  fg?: string;
  border?: string;
  className?: string;
  children: ReactNode;
};

/** Inline category chip used inside stickers. 2px border, pill shape, 10px display-weight. */
export function CatChip({
  bg = '#FFFFFF',
  fg = '#15120D',
  border = '#15120D',
  className,
  children,
}: CatChipProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-px text-[10px] font-extrabold leading-tight',
        className,
      )}
      style={{ background: bg, color: fg, border: `2px solid ${border}` }}
    >
      {children}
    </span>
  );
}
