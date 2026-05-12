'use client';

import { cn } from '@/lib/utils';
import { useId } from 'react';

type Marker = { value: number; label: string };

type PriceSliderProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  markers?: Marker[];
  className?: string;
};

const DEFAULT_MARKERS: Marker[] = [
  { value: 1,   label: '$1 chump' },
  { value: 25,  label: '$25 brave' },
  { value: 100, label: '$100 unhinged' },
];

/**
 * Pill range slider — ink track with pop-filled progress, ink-bordered thumb.
 * Markers row underneath labels critical price points.
 */
export function PriceSlider({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  markers = DEFAULT_MARKERS,
  className,
}: PriceSliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-9 flex items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-2 rounded-pill border-2 border-ink bg-paper overflow-hidden">
          <div
            aria-hidden
            className="h-full bg-pop"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Native range — z-above for proper input handling */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pa-slider absolute inset-0 w-full h-9 appearance-none bg-transparent cursor-pointer"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      <div className="flex justify-between mt-3 pointer-events-none">
        {markers.map((m) => {
          const reached = value >= m.value;
          return (
            <div
              key={m.value}
              className={cn(
                'font-display font-extrabold text-[10px] tracking-[0.06em] uppercase',
                reached ? 'text-ink' : 'text-ink/45',
              )}
            >
              {m.label}
            </div>
          );
        })}
      </div>

      {/* Thumb styles live in apps/web/src/app/globals.css → .pa-slider rules */}
    </div>
  );
}
