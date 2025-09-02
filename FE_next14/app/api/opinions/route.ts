import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { BASE_SEPOLIA, CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

const publicClient = createPublicClient({
  chain: BASE_SEPOLIA,
  transport: http(),
});

export async function GET(request: NextRequest) {
  try {
    // Get total number of opinions
    const nextOpinionId = await publicClient.readContract({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'nextOpinionId',
    });

    const totalOpinions = Number(nextOpinionId) - 1;

    if (totalOpinions <= 0) {
      return NextResponse.json([]);
    }

    // Fetch all opinions
    const opinionPromises = [];
    for (let i = 1; i <= totalOpinions; i++) {
      opinionPromises.push(
        publicClient.readContract({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'getOpinionDetails',
          args: [BigInt(i)],
        }).then(async (data: any) => {
          // Also get next price
          const nextPrice = await publicClient.readContract({
            address: CONTRACTS.OPINION_CORE,
            abi: OPINION_CORE_ABI,
            functionName: 'getNextPrice',
            args: [BigInt(i)],
          });

          return {
            id: i,
            creator: data.creator,
            questionOwner: data.questionOwner,
            lastPrice: data.lastPrice,
            nextPrice: nextPrice,
            salePrice: data.salePrice,
            isActive: data.isActive,
            question: data.question,
            currentAnswer: data.currentAnswer,
            currentAnswerDescription: data.currentAnswerDescription,
            currentAnswerOwner: data.currentAnswerOwner,
            totalVolume: data.totalVolume,
            ipfsHash: data.ipfsHash,
            link: data.link,
            categories: data.categories,
          };
        })
      );
    }

    const opinions = await Promise.all(opinionPromises);
    
    // Filter out inactive opinions and sort by volume
    const activeOpinions = opinions
      .filter(opinion => opinion.isActive)
      .sort((a, b) => Number(b.totalVolume) - Number(a.totalVolume));

    return NextResponse.json(activeOpinions);
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opinions' },
      { status: 500 }
    );
  }
}