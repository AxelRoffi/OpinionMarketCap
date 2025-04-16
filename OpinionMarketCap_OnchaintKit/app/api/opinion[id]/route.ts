// app/api/opinion/[id]/route.ts
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract-config';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { NextResponse } from 'next/server';

// Define the structure we expect from the contract
type OpinionResponse = [
  bigint,           // id
  string,           // question
  string,           // creator
  bigint,           // currentPrice
  bigint,           // nextPrice
  boolean,          // isActive
  string,           // currentAnswer
  string,           // currentAnswerOwner
  bigint            // totalVolume
];

// Define the structure for history items
type HistoryItem = [string, string, bigint, bigint]; // [answer, owner, price, timestamp]
type HistoryResponse = HistoryItem[];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const url = new URL(request.url);
  const includeHistory = url.searchParams.get('includeHistory') === 'true';
  
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org')
  });

  try {
    // Fetch the opinion details
    const opinion = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'opinions',
      args: [BigInt(id)],
    }) as OpinionResponse;
    
    // Format the opinion data
    const formattedOpinion = {
      id: opinion[0],
      question: opinion[1],
      creator: opinion[2],
      currentPrice: opinion[3],
      nextPrice: opinion[4],
      isActive: opinion[5],
      currentAnswer: opinion[6],
      currentAnswerOwner: opinion[7],
      totalVolume: opinion[8]
    };

    // If history is requested, fetch it
    if (includeHistory) {
      try {
        const history = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getAnswerHistory',
          args: [BigInt(id)],
        }) as HistoryResponse;
        
        // Format the history data
        const formattedHistory = history.map((item) => ({
          answer: item[0],
          owner: item[1],
          price: item[2],
          timestamp: item[3]
        }));

        // Return both opinion and history data
        return NextResponse.json({
          ...formattedOpinion,
          history: formattedHistory
        });
      } catch (historyError) {
        console.error(`Error fetching history for opinion ${id}:`, historyError);
        // Return the opinion data even if history fetch fails
        return NextResponse.json({
          ...formattedOpinion,
          history: [],
          historyError: 'Failed to fetch history'
        });
      }
    }

    // Return just the opinion data if history is not requested
    return NextResponse.json(formattedOpinion);
  } catch (error) {
    console.error(`Error fetching opinion ${id}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch opinion ${id}` }, 
      { status: 500 }
    );
  }
}