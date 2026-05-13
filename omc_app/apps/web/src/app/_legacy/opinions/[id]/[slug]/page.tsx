import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { extractOpinionId } from '@/lib/url-utils';
import { getOpinionForMeta } from '@/lib/opinion-server';
import { generateOpinionMeta, BASE_URL, DEFAULT_META, createSlug } from '@/lib/seo';
import OpinionPageClient from '../OpinionPageClient';

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

/**
 * Generate dynamic metadata for SEO
 * This is the primary URL format: /opinions/[id]/[slug]
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, slug } = await params;

  // Extract opinion ID from URL parameters
  const opinionId = extractOpinionId({ id, slug });

  // Validate that we have a valid opinion ID
  if (isNaN(opinionId) || opinionId < 1) {
    return {
      title: 'Opinion Not Found',
      description: 'The requested opinion could not be found.',
    };
  }

  // Fetch opinion data server-side
  const opinion = await getOpinionForMeta(opinionId);

  if (!opinion) {
    return {
      title: 'Opinion Not Found',
      description: 'The requested opinion could not be found.',
    };
  }

  // Generate SEO metadata
  const meta = generateOpinionMeta({
    id: opinion.id,
    question: opinion.question,
    currentAnswer: opinion.currentAnswer,
    nextPrice: opinion.nextPrice,
    totalVolume: opinion.totalVolume,
    categories: opinion.categories,
  });

  const correctSlug = createSlug(opinion.question);
  const canonicalUrl = `${BASE_URL}/opinions/${opinionId}/${correctSlug}`;

  return {
    title: opinion.question,
    description: meta.description,
    keywords: meta.keywords,

    // Canonical URL (always the correct slug version)
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph
    openGraph: {
      type: 'article',
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: DEFAULT_META.siteName,
      images: [
        {
          url: `${BASE_URL}/api/og/opinion/${opinionId}`,
          width: 1200,
          height: 630,
          alt: opinion.question,
        },
      ],
      publishedTime: new Date(Number(opinion.createdAt) * 1000).toISOString(),
      modifiedTime: new Date(Number(opinion.lastActivityAt) * 1000).toISOString(),
      authors: [opinion.creator],
      tags: opinion.categories,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_META.twitterHandle,
      title: meta.title,
      description: meta.description,
      images: [`${BASE_URL}/api/og/opinion/${opinionId}`],
    },

    // Robots
    robots: {
      index: opinion.isActive,
      follow: true,
    },
  };
}

/**
 * Descriptive URL format: /opinions/[id]/[slug]
 * Examples:
 * - /opinions/1/goat-of-soccer
 * - /opinions/2/who-will-win-the-2024-election
 */
export default async function DescriptiveOpinionPage({ params }: PageProps) {
  const { id, slug } = await params;

  // Extract opinion ID from URL parameters
  const opinionId = extractOpinionId({ id, slug });

  // Validate that we have a valid opinion ID
  if (isNaN(opinionId) || opinionId < 1) {
    notFound();
  }

  // Render the client component
  return <OpinionPageClient />;
}

// Revalidate metadata every 5 minutes
export const revalidate = 300;
