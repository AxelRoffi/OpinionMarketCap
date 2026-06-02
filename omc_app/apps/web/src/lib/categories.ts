/**
 * The 40 canonical categories enforced by OpinionExtensionsV2 on chain.
 * Single source of truth for: slug↔chain mapping, emoji, Poster-Arcade
 * color, and thematic group.
 *
 * The canonical name MUST match the on-chain string exactly (returned by
 * OpinionExtensionsV2.getAvailableCategories() at 0x2eD0DC454043A768cB3FA7e480c41Be7b8954394).
 * If the contract list ever changes, update CATEGORIES here in the same PR.
 */

export type CategoryColor = 'canvas' | 'cool' | 'pop' | 'paper';

export type CategoryGroup =
  | 'tech'        // Technology / Science / Discovery
  | 'power'       // Money / Power
  | 'entertainment'
  | 'lifestyle';

export interface CategoryMeta {
  /** Canonical chain string — must match exactly. */
  name: string;
  /** URL slug (lowercase, hyphenated, ASCII-only). */
  slug: string;
  /** Decorative only — does not enter on-chain comparisons. */
  emoji: string;
  /** Poster-Arcade background color for chips. */
  color: CategoryColor;
  /** Thematic grouping (drives color choice). */
  group: CategoryGroup;
}

/** The 40 chain categories in their canonical on-chain order. */
export const CATEGORIES: ReadonlyArray<CategoryMeta> = [
  { name: 'Technology',                   slug: 'technology',                 emoji: '💻', color: 'cool',   group: 'tech' },
  { name: 'AI & Robotics',                slug: 'ai-robotics',                emoji: '🤖', color: 'cool',   group: 'tech' },
  { name: 'Crypto & Web3',                slug: 'crypto-web3',                emoji: '🪙', color: 'cool',   group: 'tech' },
  { name: 'DeFi (Decentralized Finance)', slug: 'defi',                       emoji: '🏦', color: 'cool',   group: 'tech' },
  { name: 'Science',                      slug: 'science',                    emoji: '🔬', color: 'cool',   group: 'tech' },
  { name: 'Environment & Climate',        slug: 'environment-climate',        emoji: '🌍', color: 'cool',   group: 'tech' },
  { name: 'Business & Finance',           slug: 'business-finance',           emoji: '💼', color: 'canvas', group: 'power' },
  { name: 'Real Estate',                  slug: 'real-estate',                emoji: '🏠', color: 'canvas', group: 'power' },
  { name: 'Politics',                     slug: 'politics',                   emoji: '🏛️', color: 'canvas', group: 'power' },
  { name: 'Law & Legal',                  slug: 'law-legal',                  emoji: '⚖️', color: 'canvas', group: 'power' },
  { name: 'News',                         slug: 'news',                       emoji: '📰', color: 'canvas', group: 'power' },
  { name: 'Sports',                       slug: 'sports',                     emoji: '⚽', color: 'pop',    group: 'entertainment' },
  { name: 'Automotive',                   slug: 'automotive',                 emoji: '🏎️', color: 'cool',   group: 'tech' },
  { name: 'Gaming',                       slug: 'gaming',                     emoji: '🎮', color: 'pop',    group: 'entertainment' },
  { name: 'Movies',                       slug: 'movies',                     emoji: '🎬', color: 'pop',    group: 'entertainment' },
  { name: 'TV Shows',                     slug: 'tv-shows',                   emoji: '📺', color: 'pop',    group: 'entertainment' },
  { name: 'Music',                        slug: 'music',                      emoji: '🎵', color: 'pop',    group: 'entertainment' },
  { name: 'Podcasts',                     slug: 'podcasts',                   emoji: '🎙️', color: 'pop',    group: 'entertainment' },
  { name: 'Literature',                   slug: 'literature',                 emoji: '📚', color: 'pop',    group: 'entertainment' },
  { name: 'Art & Design',                 slug: 'art-design',                 emoji: '🎨', color: 'pop',    group: 'entertainment' },
  { name: 'Photography',                  slug: 'photography',                emoji: '📷', color: 'pop',    group: 'entertainment' },
  { name: 'Celebrities & Pop Culture',    slug: 'celebrities-pop-culture',    emoji: '⭐', color: 'pop',    group: 'entertainment' },
  { name: 'Social Media',                 slug: 'social-media',               emoji: '📱', color: 'pop',    group: 'entertainment' },
  { name: 'Humor & Memes',                slug: 'humor-memes',                emoji: '😂', color: 'pop',    group: 'entertainment' },
  { name: 'Fashion',                      slug: 'fashion',                    emoji: '👗', color: 'paper',  group: 'lifestyle' },
  { name: 'Beauty & Skincare',            slug: 'beauty-skincare',            emoji: '💄', color: 'paper',  group: 'lifestyle' },
  { name: 'Health & Fitness',             slug: 'health-fitness',             emoji: '💪', color: 'paper',  group: 'lifestyle' },
  { name: 'Food & Drink',                 slug: 'food-drink',                 emoji: '🍔', color: 'paper',  group: 'lifestyle' },
  { name: 'Travel',                       slug: 'travel',                     emoji: '✈️', color: 'paper',  group: 'lifestyle' },
  { name: 'History',                      slug: 'history',                    emoji: '🏺', color: 'cool',   group: 'tech' },
  { name: 'Philosophy',                   slug: 'philosophy',                 emoji: '🤔', color: 'paper',  group: 'lifestyle' },
  { name: 'Spirituality & Religion',      slug: 'spirituality-religion',      emoji: '🕉️', color: 'paper',  group: 'lifestyle' },
  { name: 'Education',                    slug: 'education',                  emoji: '🎓', color: 'canvas', group: 'power' },
  { name: 'Career & Workplace',           slug: 'career-workplace',           emoji: '💼', color: 'canvas', group: 'power' },
  { name: 'Relationships',                slug: 'relationships',              emoji: '💕', color: 'paper',  group: 'lifestyle' },
  { name: 'Parenting & Family',           slug: 'parenting-family',           emoji: '👨‍👩‍👧', color: 'paper', group: 'lifestyle' },
  { name: 'Pets & Animals',               slug: 'pets-animals',               emoji: '🐶', color: 'paper',  group: 'lifestyle' },
  { name: 'DIY & Home Improvement',       slug: 'diy-home',                   emoji: '🔨', color: 'paper',  group: 'lifestyle' },
  { name: 'True Crime',                   slug: 'true-crime',                 emoji: '🔪', color: 'pop',    group: 'entertainment' },
  { name: 'Adult (NSFW)',                 slug: 'adult-nsfw',                 emoji: '🔞', color: 'pop',    group: 'entertainment' },
];

const BY_SLUG: ReadonlyMap<string, CategoryMeta> = new Map(
  CATEGORIES.map((c) => [c.slug, c]),
);
const BY_NAME: ReadonlyMap<string, CategoryMeta> = new Map(
  CATEGORIES.map((c) => [c.name, c]),
);
const BY_NAME_LOWER: ReadonlyMap<string, CategoryMeta> = new Map(
  CATEGORIES.map((c) => [c.name.toLowerCase(), c]),
);

/** Resolve a URL slug to a canonical category, or undefined if unknown. */
export function categoryBySlug(slug: string): CategoryMeta | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

/** Resolve a chain-string category name to its meta. Case-insensitive. */
export function categoryByName(name: string | undefined): CategoryMeta | undefined {
  if (!name) return undefined;
  return BY_NAME.get(name) ?? BY_NAME_LOWER.get(name.toLowerCase());
}

/**
 * Slug for a chain-string category. Returns a best-effort slug even if the
 * name isn't in our known list (defensive — the chain admin could add a new
 * category before we update this file).
 */
export function slugifyCategory(name: string | undefined): string {
  if (!name) return '';
  const known = categoryByName(name);
  if (known) return known.slug;
  return name
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Display props for any chip rendering a chain category. */
export interface CategoryDisplay {
  name: string;
  slug: string;
  emoji: string;
  color: CategoryColor;
}

/**
 * Look up display props for a chain category. Falls back to a neutral
 * display when the name is unknown (rare — chain admin could add new
 * categories between our releases).
 */
export function categoryDisplay(name: string | undefined): CategoryDisplay | undefined {
  if (!name) return undefined;
  const meta = categoryByName(name);
  if (meta) {
    return { name: meta.name, slug: meta.slug, emoji: meta.emoji, color: meta.color };
  }
  return {
    name,
    slug: slugifyCategory(name),
    emoji: '🏷️',
    color: 'paper',
  };
}
