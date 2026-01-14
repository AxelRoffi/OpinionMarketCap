import { NextResponse } from 'next/server';
import { indexingService } from '@/lib/indexing-service';

// Debug endpoint to check indexing status
export async function GET() {
  const stats = indexingService.getStats();
  const allOpinions = indexingService.getAllOpinions();
  
  return NextResponse.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    stats,
    recentOpinions: allOpinions.slice(0, 5).map(op => ({
      id: op.id,
      question: op.question.substring(0, 50) + '...',
      currentAnswer: op.currentAnswer,
      lastUpdated: new Date(op.lastUpdated).toISOString(),
      cacheAge: Date.now() - op.lastUpdated
    })),
    webhookUrl: 'https://app.opinionmarketcap.xyz/api/alchemy-webhook'
  });
}