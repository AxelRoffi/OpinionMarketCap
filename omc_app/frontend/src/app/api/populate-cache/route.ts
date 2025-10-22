import { NextResponse } from 'next/server';
import { indexingService, IndexedOpinion, IndexedEvent } from '@/lib/indexing-service';

// Manual cache population for testing (remove in production)
export async function POST() {
  try {
    // Create mock opinion data to test the cache
    const mockOpinion: IndexedOpinion = {
      id: 1,
      question: 'Will Bitcoin hit $100k in 2024?',
      currentAnswer: 'Yes, definitely happening this year!',
      currentAnswerOwner: '0x1234567890123456789012345678901234567890',
      creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      nextPrice: BigInt('2010000'), // $2.01
      lastPrice: BigInt('2000000'), // $2.00
      totalVolume: BigInt('10000000'), // $10.00
      categories: ['Crypto', 'Finance'],
      isActive: true,
      link: 'https://example.com/bitcoin-analysis',
      lastUpdated: Date.now()
    };

    // Create mock event
    const mockEvent: IndexedEvent = {
      opinionId: 1,
      eventType: 'answer_submitted',
      user: '0x1234567890123456789012345678901234567890',
      content: 'Yes, definitely happening this year!',
      price: BigInt('2010000'),
      timestamp: Date.now(),
      blockNumber: 12345678,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    };

    // Add to cache
    indexingService.updateOpinion(mockOpinion);
    indexingService.addEvent(mockEvent);

    const stats = indexingService.getStats();
    
    return NextResponse.json({
      success: true,
      message: 'Cache populated with test data',
      stats,
      mockData: {
        opinion: mockOpinion,
        event: mockEvent
      }
    });

  } catch (error) {
    console.error('Error populating cache:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if cache has data
export async function GET() {
  const stats = indexingService.getStats();
  const opinions = indexingService.getAllOpinions();
  
  return NextResponse.json({
    status: 'ready',
    stats,
    hasData: opinions.length > 0,
    sampleOpinion: opinions[0] || null
  });
}