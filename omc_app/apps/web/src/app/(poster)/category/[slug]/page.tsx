'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sticker, Btn, MonoNum, Wobble } from '@/components/poster-arcade';
import { TakeCard } from '../../_components/TakeCard';
import { useTakes } from '../../_lib/chain-adapters';
import { fmtUSD } from '../../_data/mock-takes';
import { categoryBySlug } from '@/lib/categories';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const meta = categoryBySlug(slug);
  if (!meta) notFound();

  const { takes, isLoading } = useTakes();

  // Filter: opinion matches if its categories array contains the canonical
  // name (case-insensitive). Categorisation is many-to-one — an opinion
  // tagged [Sports, Humor & Memes] shows up on both /category/sports and
  // /category/humor-memes.
  const target = meta.name.toLowerCase();
  const matching = useMemo(
    () =>
      takes.filter((t) =>
        (t.categories ?? []).some((c) => c.toLowerCase() === target),
      ),
    [takes, target],
  );

  // Hot first within the category (by trades), then by id descending.
  const ordered = useMemo(
    () =>
      [...matching].sort((a, b) => {
        if (b.trades !== a.trades) return b.trades - a.trades;
        return b.id - a.id;
      }),
    [matching],
  );

  const totalVolume = matching.reduce(
    (a, t) => a + t.price * Math.max(1, t.trades),
    0,
  );

  return (
    <>
      {/* ────────────────  BREADCRUMB  ──────────────── */}
      <div className="px-4 md:px-10 pt-4 pb-1 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/marketplace"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← all takes
        </Link>
        <Link
          href="/"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          back to the wall
        </Link>
      </div>

      {/* ────────────────  CATEGORY HERO  ──────────────── */}
      <section className="px-4 md:px-10 py-6">
        <Sticker bg={meta.color} tilt={-1.5} shadow={6} className="p-6 md:p-8">
          <div className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase opacity-75">
            ★ category
          </div>
          <h1 className="font-display font-black text-[44px] md:text-[64px] tracking-[-0.04em] leading-[0.95] mt-1">
            {meta.emoji} {meta.name}
          </h1>
          <p className="font-display font-semibold text-[13px] md:text-[14px] opacity-80 mt-3 max-w-2xl">
            Every take tagged{' '}
            <span className="font-extrabold">{meta.name}</span> on chain. Hot
            first.
          </p>
          <div className="mt-5 flex flex-wrap items-baseline gap-4 font-mono font-extrabold text-[12px] md:text-[13px] opacity-85">
            <span>
              <MonoNum>{matching.length}</MonoNum> takes
            </span>
            <span>·</span>
            <span>
              <MonoNum>{fmtUSD(Math.round(totalVolume))}</MonoNum> vol
            </span>
          </div>
        </Sticker>
      </section>

      {/* ────────────────  GRID  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Wobble>loading takes…</Wobble>
          </div>
        ) : ordered.length === 0 ? (
          <div className="flex justify-center py-16">
            <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
              <div className="font-display font-black text-[22px] tracking-tight">
                NOTHING IN {meta.name.toUpperCase()} YET.
              </div>
              <div className="font-display text-[12px] font-semibold text-ink/70 mt-1">
                Be the first to mint a take in this category.
              </div>
              <div className="mt-4 flex justify-center">
                <Btn href="/create" variant="pop" size="sm" star>
                  MINT THE FIRST
                </Btn>
              </div>
            </Sticker>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ordered.map((take, i) => (
              <TakeCard key={take.id} take={take} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
