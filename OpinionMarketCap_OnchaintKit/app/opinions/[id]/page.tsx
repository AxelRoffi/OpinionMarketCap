// app/opinions/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config";
import OpinionDetail from "../../components/OpinionDetail";
import BuyOpinionForm from "../../components/BuyOpinionForm";
import { OpinionDetail as OpinionDetailType } from "@/types";

export default function OpinionDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [opinion, setOpinion] = useState<OpinionDetailType | null>(null);

  // Fetch opinion data
  const { data: opinionData, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "opinions",
    args: [BigInt(id as string)],
  });

  // Fetch next price
  const { data: nextPriceData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "getNextPrice",
    args: [BigInt(id as string)],
  });

  // Fetch answer history
  const { data: historyData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "getAnswerHistory",
    args: [BigInt(id as string)],
  });

  useEffect(() => {
    if (opinionData && !isLoading) {
      // Type assertion for structured data
      const typedOpinionData = opinionData as [
        bigint,    // id
        string,    // question
        string,    // creator
        bigint,    // currentPrice
        bigint,    // nextPrice
        boolean,   // isActive
        string,    // currentAnswer
        string,    // currentAnswerOwner
        bigint     // totalVolume
      ];
      
      const totalVolume = typedOpinionData[8];
      
      // Calculate creator earnings (3% of total volume)
      const creatorEarnings = (totalVolume * BigInt(3)) / BigInt(100);
      
      // Calculate owner earnings (roughly 95% of total volume excluding the current price)
      const ownerEarnings = totalVolume > typedOpinionData[3]
        ? ((totalVolume - typedOpinionData[3]) * BigInt(95)) / BigInt(100)
        : BigInt(0);

      // Prepare opinion data
      const formattedOpinion: OpinionDetailType = {
        id: typedOpinionData[0],
        question: typedOpinionData[1],
        creator: typedOpinionData[2],
        currentPrice: typedOpinionData[3],
        nextPrice: (nextPriceData as bigint) || typedOpinionData[4],
        isActive: typedOpinionData[5],
        currentAnswer: typedOpinionData[6],
        currentAnswerOwner: typedOpinionData[7],
        totalVolume: totalVolume,
        formattedPrice: formatUnits(typedOpinionData[3], 6),
        formattedNextPrice: formatUnits((nextPriceData as bigint) || typedOpinionData[4], 6),
        formattedVolume: formatUnits(totalVolume, 6),
        creatorEarnings: creatorEarnings.toString(),
        ownerEarnings: ownerEarnings.toString(),
        formattedCreatorEarnings: formatUnits(creatorEarnings, 6),
        formattedOwnerEarnings: formatUnits(ownerEarnings, 6),
        // Add the formatted history if available
        // [...]
      };
      
      setOpinion(formattedOpinion);
      setLoading(false);
    }
  }, [opinionData, nextPriceData, historyData, isLoading, id]);

  if (loading || isLoading) {
    return <div className="flex justify-center p-8">Loading opinion details...</div>;
  }

  if (isError || !opinion) {
    return <div className="flex justify-center p-8">Error loading opinion details</div>;
  }

  // Format the owner address to show shortened version
  const formattedOwner = `${opinion.currentAnswerOwner.slice(0, 6)}...${opinion.currentAnswerOwner.slice(-4)}`;

  return (
    <>
      <OpinionDetail
        question={opinion.question}
        opinion={opinion.currentAnswer.toUpperCase()}
        owner={formattedOwner}
        currentPrice={opinion.formattedPrice}
        nextPrice={opinion.formattedNextPrice}
        volume={opinion.formattedVolume}
        creatorEarnings={opinion.formattedCreatorEarnings}
        ownerEarnings={opinion.formattedOwnerEarnings}
      />
      
      {/* Additional sections like history can go here */}
      <div className="container mx-auto px-4 py-8">
        {/* Answer History Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Answer History</h2>
          {/* Your history display implementation */}
        </div>
      </div>
    </>
  );
}