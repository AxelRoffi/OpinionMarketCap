import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { BASE_SEPOLIA, CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

const publicClient = createPublicClient({
  chain: BASE_SEPOLIA,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opinionId = parseInt(params.id);
    
    if (isNaN(opinionId) || opinionId < 1) {
      return NextResponse.json(
        { error: 'Invalid opinion ID' },
        { status: 400 }
      );
    }

    // Read answer history from contract
    const historyData = await publicClient.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'getAnswerHistory',
      args: [BigInt(opinionId)],
    });

    // Format the response
    const history = historyData.map((entry: any) => ({
      answer: entry.answer,
      description: entry.description,
      owner: entry.owner,
      price: entry.price,
      timestamp: Number(entry.timestamp),
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching answer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answer history' },
      { status: 500 }
    );
  }
}