/**
 * URL slug helper for take/opinion permalinks.
 *
 * Canonical URL format: /opinions/[id]/[slug]
 *   e.g. /opinions/1/most-powerful-person-in-the-world
 *
 * The slug is decorative — the page only needs `id` to resolve the take.
 * The slug exists so links survive question edits (catch-all route also
 * matches a bare /opinions/[id]) and read cleanly in shares / search.
 */

export function slugifyTake(text: string | undefined | null, maxLen = 80): string {
  if (!text) return 'take';
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')   // strip combining marks left by NFKD
    .replace(/['"`]/g, '')             // drop quotes; don't turn them into dashes
    .replace(/[^a-z0-9]+/g, '-')       // every non-alphanum run → one dash
    .replace(/^-+|-+$/g, '')           // trim leading/trailing dashes
    .slice(0, maxLen)
    .replace(/-+$/g, '');              // re-trim if slice landed mid-dash
  return slug || 'take';
}

/**
 * Build a canonical /opinions/[id]/[slug] href from a take's id + question.
 */
export function takeHref(id: number | string, question?: string): string {
  return `/opinions/${id}/${slugifyTake(question)}`;
}
