import type { Metadata } from 'next';
import { getOpinionForMeta } from '@/lib/opinion-server';
import { BASE_URL, DEFAULT_META, createSlug } from '@/lib/seo';

type LayoutProps = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

/**
 * Server-side metadata for /opinions/[id]/* — drives X/Twitter cards, Farcaster
 * frame unfurls, and search-engine previews. The actual OG image is rendered
 * by the colocated `opengraph-image.tsx` route, which Next.js auto-discovers
 * and wires into both `og:image` and `twitter:image` for every child route.
 */
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const opinionId = Number.parseInt(id, 10);

  if (Number.isNaN(opinionId) || opinionId < 1) {
    return {
      title: 'Opinion not found · OpinionMarketCap',
      description: DEFAULT_META.description,
    };
  }

  const opinion = await getOpinionForMeta(opinionId);
  if (!opinion) {
    return {
      title: 'Opinion not found · OpinionMarketCap',
      description: DEFAULT_META.description,
    };
  }

  const price = Number(opinion.nextPrice) / 1_000_000;
  const answer = opinion.currentAnswer?.trim() || 'no king yet';
  const slug = createSlug(opinion.question);
  const canonicalUrl = `${BASE_URL}/opinions/${opinionId}/${slug}`;
  const title = `"${opinion.question}" → ${answer}`;
  const description = `Floor: $${price.toFixed(2)} USDC · Trade the take on OpinionMarketCap. Pay the next price to overwrite the answer and become king.`;

  // Force the dynamic per-opinion OG image into BOTH og:image and twitter:image.
  // Next.js auto-discovery of opengraph-image.tsx only wires og:image; without
  // an explicit twitter.images here, the parent root layout's static
  // /og-image.png leaks through (Twitter prefers twitter:image when present).
  const ogImage = {
    url: `${BASE_URL}/opinions/${opinionId}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${opinion.question} → ${answer}`,
  };

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: DEFAULT_META.siteName,
      tags: opinion.categories,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_META.twitterHandle,
      title,
      description,
      images: [ogImage.url],
    },
    robots: {
      index: opinion.isActive,
      follow: true,
    },
  };
}

export default function OpinionDetailLayout({ children }: LayoutProps) {
  return children;
}
