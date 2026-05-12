import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type HalftoneProps = {
  /** Render as block wrapper with dot bg overlay (.pa-dots class). */
  as?: 'div' | 'section' | 'main';
  className?: string;
  children?: ReactNode;
};

/**
 * Dotted radial-gradient overlay at 7% opacity. Wrap a page section to add Poster Arcade texture.
 */
export function Halftone({ as: Tag = 'div', className, children }: HalftoneProps) {
  return <Tag className={cn('pa-dots', className)}>{children}</Tag>;
}
