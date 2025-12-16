import { NextResponse } from 'next/server';
import { indexingService, IndexedOpinion } from '@/lib/indexing-service';

// Manually sync cache with current contract state (for testing/debugging)
export async function POST() {
  try {
    // This endpoint manually fetches from contract and populates cache
    // In a real scenario, this would be called periodically or on demand
    
    // For now, let's simulate fetching real contract data
    // You would replace this with actual contract reads
    
    // Simulated data based on current contract state
    const contractOpinions = [
      {
        id: 1,
        question: 'Your Real Question from Contract',
        currentAnswer: 'Real Answer from Contract',
        currentAnswerOwner: '0xRealOwnerAddress',
        creator: '0xRealCreatorAddress', 
        nextPrice: BigInt('2000000'), // Real price from contract
        lastPrice: BigInt('1500000'),
        totalVolume: BigInt('5000000'),
        categories: ['Real', 'Categories'],
        isActive: true,
        link: 'https://real-link.com',
        lastUpdated: Date.now()
      }
    ];

    // Populate cache with contract data
    contractOpinions.forEach(opinion => {
      const indexedOpinion: IndexedOpinion = {
        id: opinion.id,
        question: opinion.question,
        currentAnswer: opinion.currentAnswer,
        currentAnswerOwner: opinion.currentAnswerOwner,
        creator: opinion.creator,
        nextPrice: opinion.nextPrice,
        lastPrice: opinion.lastPrice,
        totalVolume: opinion.totalVolume,
        categories: opinion.categories,
        isActive: opinion.isActive,
        link: opinion.link,
        lastUpdated: opinion.lastUpdated
      };
      
      indexingService.updateOpinion(indexedOpinion);
    });

    const stats = indexingService.getStats();
    
    return NextResponse.json({
      success: true,
      message: `Synced ${contractOpinions.length} opinions to cache`,
      stats,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing cache:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}