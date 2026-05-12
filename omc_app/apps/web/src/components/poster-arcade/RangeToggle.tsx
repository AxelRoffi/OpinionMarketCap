'use client';

import { Tabs, type Tab } from './Tabs';

export type RangeKey = '24h' | '7d' | '30d' | 'all';

type RangeToggleProps<T extends string = RangeKey> = {
  options?: Tab<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
};

const DEFAULT_RANGES: Tab<RangeKey>[] = [
  { value: '24h', label: '24H' },
  { value: '7d',  label: '7D' },
  { value: '30d', label: '30D' },
];

/**
 * Small segmented control for chart range. Thin wrapper over Tabs.
 */
export function RangeToggle<T extends string = RangeKey>({
  options,
  value,
  onChange,
  className,
}: RangeToggleProps<T>) {
  const opts = (options ?? DEFAULT_RANGES) as unknown as Tab<T>[];
  return <Tabs<T> tabs={opts} value={value} onChange={onChange} size="sm" className={className} />;
}
