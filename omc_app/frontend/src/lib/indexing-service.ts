// Indexing service for fast opinion data access
// This service caches blockchain events and provides fast data access

export interface IndexedOpinion {
  id: number;
  question: string;
  currentAnswer: string;
  currentAnswerOwner: string;
  creator: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  categories: string[];
  isActive: boolean;
  link?: string;
  lastUpdated: number;
}

export interface IndexedEvent {
  opinionId: number;
  eventType: 'opinion_created' | 'answer_submitted' | 'question_sale' | 'fees_collected';
  user: string;
  content?: string;
  price?: bigint;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

// In-memory cache (upgrade to Redis/Vercel KV for production)
class IndexingService {
  private opinionCache = new Map<number, IndexedOpinion>();
  private eventCache = new Map<string, IndexedEvent>();
  private lastFetchTime = new Map<number, number>();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  // Get opinion with cache fallback
  async getOpinion(opinionId: number, fallbackFetch?: () => Promise<IndexedOpinion>): Promise<IndexedOpinion | null> {
    const cached = this.opinionCache.get(opinionId);
    const lastFetch = this.lastFetchTime.get(opinionId) || 0;
    const now = Date.now();

    // Return cached if fresh
    if (cached && (now - lastFetch) < this.CACHE_DURATION) {
      return cached;
    }

    // Fallback to contract call if cache miss
    if (fallbackFetch) {
      try {
        const fresh = await fallbackFetch();
        this.updateOpinion(fresh);
        return fresh;
      } catch (error) {
        console.error('Fallback fetch failed:', error);
        return cached || null;
      }
    }

    return cached || null;
  }

  // Update opinion cache from webhook events
  updateOpinion(opinion: IndexedOpinion): void {
    this.opinionCache.set(opinion.id, opinion);
    this.lastFetchTime.set(opinion.id, Date.now());
  }

  // Add event from webhook
  addEvent(event: IndexedEvent): void {
    const key = `${event.transactionHash}-${event.opinionId}`;
    this.eventCache.set(key, event);

    // Update opinion cache based on event
    this.updateOpinionFromEvent(event);
  }

  // Get recent events for an opinion
  getOpinionEvents(opinionId: number, limit = 10): IndexedEvent[] {
    return Array.from(this.eventCache.values())
      .filter(event => event.opinionId === opinionId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get all cached opinions (for homepage)
  getAllOpinions(): IndexedOpinion[] {
    return Array.from(this.opinionCache.values())
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  // Update opinion data based on events
  private updateOpinionFromEvent(event: IndexedEvent): void {
    const opinion = this.opinionCache.get(event.opinionId);
    if (!opinion) return;

    switch (event.eventType) {
      case 'answer_submitted':
        if (event.content) {
          opinion.currentAnswer = event.content;
          opinion.currentAnswerOwner = event.user;
        }
        if (event.price) {
          opinion.lastPrice = opinion.nextPrice;
          opinion.nextPrice = event.price;
        }
        break;

      case 'question_sale':
        if (event.price) {
          opinion.nextPrice = event.price;
        }
        break;

      case 'fees_collected':
        if (event.price) {
          opinion.totalVolume += event.price;
        }
        break;
    }

    opinion.lastUpdated = Date.now();
    this.opinionCache.set(opinion.id, opinion);
  }

  // Clear old cache entries
  cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [id, lastFetch] of this.lastFetchTime.entries()) {
      if (now - lastFetch > maxAge) {
        this.opinionCache.delete(id);
        this.lastFetchTime.delete(id);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      cachedOpinions: this.opinionCache.size,
      cachedEvents: this.eventCache.size,
      oldestCache: Math.min(...Array.from(this.lastFetchTime.values()))
    };
  }
}

// Singleton instance
export const indexingService = new IndexingService();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => indexingService.cleanup(), 5 * 60 * 1000);
}