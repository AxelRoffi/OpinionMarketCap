// app/api/opinions/route.ts
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

export async function GET() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org')
  });

  try {
    // Get the total number of opinions
    const nextId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'nextOpinionId',
    }) as bigint;

    // Fetch all opinions
    const opinionPromises = [];
    for (let i = 1; i < Number(nextId); i++) {
      opinionPromises.push(
        client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'opinions',
          args: [BigInt(i)],
        })
      );
    }

    const fetchedOpinions = await Promise.all(opinionPromises) as OpinionResponse[];
    
    // Filter active opinions and format them
    const activeOpinions = fetchedOpinions
      .filter(opinion => opinion[5]) // isActive is at index 5
      .map(opinion => ({
        id: opinion[0],
        question: opinion[1],
        creator: opinion[2],
        currentPrice: opinion[3],
        nextPrice: opinion[4],
        isActive: opinion[5],
        currentAnswer: opinion[6],
        currentAnswerOwner: opinion[7],
        totalVolume: opinion[8]
      }));

    return NextResponse.json(activeOpinions);
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return NextResponse.json({ error: 'Failed to fetch opinions' }, { status: 500 });
  }
}