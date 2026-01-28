import { MetadataRoute } from 'next';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { BASE_URL, createSlug } from '@/lib/seo';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

/**
 * Generate dynamic sitemap for SEO
 * Includes all static pages and dynamically fetches all opinions
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages with priority and change frequency
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/create`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pools`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/watchlist`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/referrals`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // Fetch opinion pages dynamically
  let opinionPages: MetadataRoute.Sitemap = [];

  try {
    // Create viem client for Base mainnet
    const client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });

    // Get total number of opinions
    const nextOpinionId = await client.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'nextOpinionId',
    }) as bigint;

    const totalOpinions = Number(nextOpinionId) - 1;

    // Fetch opinion details for sitemap (batch for performance)
    // For larger sitemaps, consider paginating or caching
    const opinionPromises: Promise<{ id: number; question: string } | null>[] = [];

    for (let i = 1; i <= Math.min(totalOpinions, 1000); i++) {
      opinionPromises.push(
        client.readContract({
          address: CONTRACTS.OPINION_CORE,
          abi: [
            {
              inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
              name: 'getOpinion',
              outputs: [
                {
                  components: [
                    { name: 'question', type: 'string' },
                    { name: 'currentAnswer', type: 'string' },
                    { name: 'currentAnswerDescription', type: 'string' },
                    { name: 'creator', type: 'address' },
                    { name: 'questionOwner', type: 'address' },
                    { name: 'currentAnswerOwner', type: 'address' },
                    { name: 'nextPrice', type: 'uint96' },
                    { name: 'lastPrice', type: 'uint96' },
                    { name: 'totalVolume', type: 'uint96' },
                    { name: 'createdAt', type: 'uint64' },
                    { name: 'lastActivityAt', type: 'uint64' },
                    { name: 'isActive', type: 'bool' },
                    { name: 'salePrice', type: 'uint96' },
                  ],
                  name: '',
                  type: 'tuple'
                }
              ],
              stateMutability: 'view',
              type: 'function'
            }
          ],
          functionName: 'getOpinion',
          args: [BigInt(i)],
        }).then((opinion: unknown) => {
          const op = opinion as { question: string };
          return { id: i, question: op.question };
        }).catch(() => null)
      );
    }

    const opinions = await Promise.all(opinionPromises);

    opinionPages = opinions
      .filter((op): op is { id: number; question: string } => op !== null && op.question !== '')
      .map((opinion) => {
        const slug = createSlug(opinion.question);
        return {
          url: `${BASE_URL}/opinions/${opinion.id}/${slug}`,
          lastModified: now,
          changeFrequency: 'hourly' as const,
          priority: 0.7,
        };
      });

  } catch (error) {
    console.error('Error fetching opinions for sitemap:', error);
    // Continue with static pages if opinion fetch fails
  }

  return [...staticPages, ...opinionPages];
}

// Revalidate sitemap every hour
export const revalidate = 3600;
