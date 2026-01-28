/**
 * SEO Utility Library for OpinionMarketCap
 * Contains keyword-optimized metadata generation
 */

// Primary keywords for the platform
export const PRIMARY_KEYWORDS = [
  'opinion trading',
  'crypto opinions',
  'social trading',
  'prediction market',
  'opinion market',
  'trade opinions',
  'USDC trading',
  'Base blockchain',
  'onchain opinions',
  'crypto predictions',
];

// Category-specific keywords
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Crypto': ['crypto trading', 'cryptocurrency opinions', 'bitcoin predictions', 'ethereum price', 'DeFi opinions'],
  'Sports': ['sports predictions', 'sports betting alternative', 'sports opinions trading', 'NFL predictions', 'NBA opinions'],
  'Politics': ['political predictions', 'election opinions', 'political trading', 'policy predictions'],
  'Technology': ['tech predictions', 'AI opinions', 'startup predictions', 'tech industry opinions'],
  'Entertainment': ['entertainment predictions', 'movie opinions', 'celebrity predictions', 'pop culture trading'],
  'Finance': ['financial predictions', 'stock opinions', 'market predictions', 'investment opinions'],
  'Gaming': ['gaming predictions', 'esports opinions', 'game predictions', 'gaming industry'],
  'Music': ['music predictions', 'artist opinions', 'album predictions', 'music industry'],
};

// Base URL for the application
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.opinionmarketcap.xyz';

// Default metadata values
export const DEFAULT_META = {
  siteName: 'OpinionMarketCap',
  title: 'OpinionMarketCap | Trade Opinions, Earn USDC',
  description: 'The first opinion trading platform on Base. Trade opinions on crypto, sports, politics & more. Pay USDC to change answers and earn when others trade after you.',
  keywords: PRIMARY_KEYWORDS.join(', '),
  author: 'OpinionMarketCap',
  twitterHandle: '@OpinionMktCap',
  locale: 'en_US',
};

// OG Image dimensions
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  alt: 'OpinionMarketCap - Trade Opinions on Base',
};

/**
 * Generate page-specific metadata
 */
export function generatePageMeta(options: {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}) {
  const {
    title,
    description = DEFAULT_META.description,
    keywords = [],
    path = '',
    image,
    type = 'website',
  } = options;

  const fullTitle = title
    ? `${title} | ${DEFAULT_META.siteName}`
    : DEFAULT_META.title;

  const url = `${BASE_URL}${path}`;
  const allKeywords = [...PRIMARY_KEYWORDS, ...keywords].join(', ');

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    url,
    type,
    image: image || `${BASE_URL}/og-image.png`,
  };
}

/**
 * Generate metadata for an opinion page
 */
export function generateOpinionMeta(opinion: {
  id: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint | number;
  totalVolume: bigint | number;
  categories: string[];
}) {
  const price = typeof opinion.nextPrice === 'bigint'
    ? Number(opinion.nextPrice) / 1_000_000
    : opinion.nextPrice / 1_000_000;

  const volume = typeof opinion.totalVolume === 'bigint'
    ? Number(opinion.totalVolume) / 1_000_000
    : opinion.totalVolume / 1_000_000;

  const categoryKeywords = opinion.categories
    .flatMap(cat => CATEGORY_KEYWORDS[cat] || [])
    .slice(0, 5);

  const slug = createSlug(opinion.question);
  const path = `/opinions/${opinion.id}/${slug}`;

  return {
    title: `${opinion.question} | OpinionMarketCap`,
    description: `Current answer: "${opinion.currentAnswer}" • Trade price: $${price.toFixed(2)} USDC • Volume: $${volume.toFixed(0)} • Trade this opinion on Base blockchain.`,
    keywords: [...PRIMARY_KEYWORDS, ...categoryKeywords, opinion.question.toLowerCase()].join(', '),
    url: `${BASE_URL}${path}`,
    type: 'article' as const,
    image: `${BASE_URL}/api/og/opinion/${opinion.id}`,
  };
}

/**
 * Generate metadata for a category page
 */
export function generateCategoryMeta(category: string, opinionCount: number) {
  const keywords = CATEGORY_KEYWORDS[category] || [];

  return {
    title: `${category} Opinions | OpinionMarketCap`,
    description: `Trade ${opinionCount}+ ${category.toLowerCase()} opinions on Base. Join the conversation and earn USDC by sharing your views on ${category.toLowerCase()} topics.`,
    keywords: [...PRIMARY_KEYWORDS, ...keywords].join(', '),
    url: `${BASE_URL}/category/${category.toLowerCase()}`,
    type: 'website' as const,
  };
}

/**
 * Generate metadata for a user profile
 */
export function generateProfileMeta(profile: {
  address: string;
  displayName?: string;
  totalTrades?: number;
  totalVolume?: number;
}) {
  const name = profile.displayName || `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`;

  return {
    title: `${name}'s Profile | OpinionMarketCap`,
    description: `View ${name}'s trading activity on OpinionMarketCap. ${profile.totalTrades || 0} trades • $${(profile.totalVolume || 0).toFixed(0)} volume.`,
    keywords: [...PRIMARY_KEYWORDS, 'trader profile', 'crypto trader'].join(', '),
    url: `${BASE_URL}/profile/${profile.address}`,
    type: 'website' as const,
  };
}

/**
 * Create URL-safe slug from text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '');
}

/**
 * Generate JSON-LD structured data for an opinion
 */
export function generateOpinionJsonLd(opinion: {
  id: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint | number;
  creator: string;
  createdAt?: Date;
}) {
  const price = typeof opinion.nextPrice === 'bigint'
    ? Number(opinion.nextPrice) / 1_000_000
    : opinion.nextPrice / 1_000_000;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opinion.question,
    description: `Current answer: ${opinion.currentAnswer}`,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    brand: {
      '@type': 'Brand',
      name: 'OpinionMarketCap',
    },
  };
}

/**
 * Generate JSON-LD breadcrumb for navigation
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD for the website
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_META.siteName,
    url: BASE_URL,
    description: DEFAULT_META.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
