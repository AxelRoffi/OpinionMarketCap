'use client';

import { useParams, notFound } from 'next/navigation';
import { extractOpinionId } from '@/lib/url-utils';

// Import the existing opinion page content
import OpinionDetailPage from '../page';

/**
 * New descriptive URL format: /opinions/[id]/[slug]
 * Examples:
 * - /opinions/1/goat-of-soccer
 * - /opinions/2/who-will-win-the-2024-election
 * 
 * This route handles the new descriptive URL format while maintaining
 * backward compatibility with the old /opinions/[id] format.
 */
export default function DescriptiveOpinionPage() {
  const params = useParams();
  
  // Extract opinion ID from URL parameters
  const opinionId = extractOpinionId({
    id: params.id as string,
    slug: params.slug as string
  });

  // Validate that we have a valid opinion ID
  if (isNaN(opinionId) || opinionId < 1) {
    notFound();
  }

  // Render the same content as the original opinion page
  // The OpinionDetailPage component will handle fetching the opinion data
  // and can validate that the slug matches the actual question if needed
  return <OpinionDetailPage />;
}