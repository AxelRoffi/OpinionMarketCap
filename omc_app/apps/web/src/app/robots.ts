import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo';

/**
 * Generate robots.txt for SEO
 * Controls which pages search engines can crawl
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',        // Admin panel - private
          '/api/',          // API routes - not for indexing
          '/debug/',        // Debug pages
          '/debug-inline/', // Debug pages
          '/test-wallet/',  // Test pages
          '/simple/',       // Development pages
          '/mint/',         // Internal mint page
          '/_next/',        // Next.js internals
          '/portfolio/',    // Requires auth
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],    // Block AI crawlers if desired
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
