/**
 * URL utilities for creating descriptive opinion URLs
 * Format: /opinions/[id]/[slug] where slug is derived from the question
 */

/**
 * Creates a URL-safe slug from question text
 * Examples:
 * "Goat of soccer ?" -> "goat-of-soccer"
 * "Who will win the 2024 election?" -> "who-will-win-the-2024-election"
 * "Best crypto to invest in?" -> "best-crypto-to-invest-in"
 */
export function createOpinionSlug(question: string): string {
  return question
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim() // Remove leading/trailing whitespace
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Creates a complete opinion URL with descriptive slug
 */
export function createOpinionUrl(id: number, question: string): string {
  const slug = createOpinionSlug(question);
  return `/opinions/${id}/${slug}`;
}

/**
 * Extracts opinion ID from URL parameters
 * Works with both old format (/opinions/1) and new format (/opinions/1/slug)
 */
export function extractOpinionId(params: { id: string; slug?: string }): number {
  return parseInt(params.id, 10);
}

/**
 * Creates a canonical URL for SEO (redirects from old format to new format)
 */
export function createCanonicalOpinionUrl(id: number, question: string): string {
  return createOpinionUrl(id, question);
}