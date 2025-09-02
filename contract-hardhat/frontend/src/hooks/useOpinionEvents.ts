import { useReadContract, usePublicClient } from 'wagmi';
import { useMemo, useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/contracts';

// Real event ABI from OpinionCore.sol - OpinionAction event
const OPINION_ACTION_EVENT = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'opinionId', type: 'uint256' },
    { indexed: false, name: 'actionType', type: 'uint8' },
    { indexed: false, name: 'content', type: 'string' },
    { indexed: true, name: 'actor', type: 'address' },
    { indexed: false, name: 'price', type: 'uint256' }
  ],
  name: 'OpinionAction',
  type: 'event'
} as const;

// ABI for getAnswerHistory to get complete trade counts
const GET_ANSWER_HISTORY_ABI = {
  inputs: [{ name: 'opinionId', type: 'uint256' }],
  name: 'getAnswerHistory',
  outputs: [
    {
      components: [
        { name: 'answer', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'price', type: 'uint96' },
        { name: 'timestamp', type: 'uint32' },
      ],
      type: 'tuple[]',
    },
  ],
  stateMutability: 'view',
  type: 'function',
} as const;

interface OpinionActionEvent {
  opinionId: number;
  actionType: number; // 0 = create, 1 = answer, 2 = deactivate, 3 = reactivate
  content: string; // question or answer
  actor: string; // address performing the action
  price: bigint;
  blockNumber: number;
  timestamp: number; // block timestamp
}

export function useOpinionEvents() {
  const publicClient = usePublicClient();
  const [opinionActionEvents, setOpinionActionEvents] = useState<OpinionActionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current opinion count to determine range
  const { data: nextOpinionId } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: [{
      inputs: [],
      name: 'nextOpinionId',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    }],
    functionName: 'nextOpinionId',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!publicClient || !nextOpinionId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Try smaller block range first (last 1000 blocks) to avoid RPC timeout
        const currentBlock = await publicClient.getBlockNumber();
        let fromBlock = currentBlock - BigInt(1000);
        
        console.log('Current block:', currentBlock.toString());
        console.log('Searching from block:', fromBlock.toString());
        
        console.log('Fetching OpinionAction events from block:', fromBlock.toString());
        
        let actionLogs;
        try {
          // Try with smaller range first
          actionLogs = await publicClient.getLogs({
            address: CONTRACTS.OPINION_CORE,
            event: OPINION_ACTION_EVENT,
            fromBlock,
            toBlock: 'latest'
          });
          
          console.log('✅ Found events with 1000 block range:', actionLogs.length);
          
          // If we found some events but not many, try expanding the range
          if (actionLogs.length < 10) {
            console.log('Trying larger range (5000 blocks)...');
            fromBlock = currentBlock - BigInt(5000);
            
            const moreActionLogs = await publicClient.getLogs({
              address: CONTRACTS.OPINION_CORE,
              event: OPINION_ACTION_EVENT,
              fromBlock,
              toBlock: 'latest'
            });
            
            actionLogs = moreActionLogs;
            console.log('✅ Found events with 5000 block range:', actionLogs.length);
          }
        } catch (rpcError) {
          console.error('RPC Error details:', rpcError);
          throw new Error(`RPC endpoint failed: ${rpcError instanceof Error ? rpcError.message : 'Unknown RPC error'}`);
        }

        console.log('Found OpinionAction events:', actionLogs.length);
        
        // Get block timestamps for each event
        const actionEvents: OpinionActionEvent[] = [];
        for (const log of actionLogs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            actionEvents.push({
              opinionId: Number(log.args.opinionId),
              actionType: Number(log.args.actionType),
              content: log.args.content,
              actor: log.args.actor,
              price: log.args.price,
              blockNumber: Number(log.blockNumber),
              timestamp: Number(block.timestamp) * 1000 // Convert to milliseconds
            });
          } catch (blockError) {
            console.warn('Failed to get block timestamp for event:', log, blockError);
            // Fallback with estimated timestamp
            actionEvents.push({
              opinionId: Number(log.args.opinionId),
              actionType: Number(log.args.actionType),
              content: log.args.content,
              actor: log.args.actor,
              price: log.args.price,
              blockNumber: Number(log.blockNumber),
              timestamp: Date.now() - (actionLogs.length - actionEvents.length) * 60000 // Estimate
            });
          }
        }

        console.log('Processed OpinionAction events with timestamps:', actionEvents.length);
        setOpinionActionEvents(actionEvents);
        
      } catch (err) {
        console.error('Error fetching events:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
        console.log('🔄 Falling back to estimated data due to RPC issues');
        setError(errorMessage);
        
        // Set empty arrays so the fallback logic in the main component works
        setOpinionActionEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [publicClient, nextOpinionId]);

  // Separate creation and answer events from OpinionAction events
  const { creationEvents, answerEvents } = useMemo(() => {
    const creationEvents = opinionActionEvents.filter(event => event.actionType === 0); // Create
    const answerEvents = opinionActionEvents.filter(event => event.actionType === 1); // Answer
    
    console.log('Creation events:', creationEvents.length);
    console.log('Answer events:', answerEvents.length);
    
    return { creationEvents, answerEvents };
  }, [opinionActionEvents]);

  // Process events to extract useful data
  const processedData = useMemo(() => {
    // Create lookup maps for quick access
    const creationTimestamps = new Map<number, number>();
    const tradeCountsByOpinion = new Map<number, number>();
    const lastActivityByOpinion = new Map<number, number>();
    const volumeByOpinion24h = new Map<number, number>();
    
    // Process creation events (actionType = 0)
    creationEvents.forEach(event => {
      creationTimestamps.set(event.opinionId, event.timestamp);
    });

    // Process answer events (actionType = 1) for trade counts and activity
    const now = Date.now();
    const twentyFourHoursAgo = now - 86400000; // 24 hours in milliseconds
    
    answerEvents.forEach(event => {
      const opinionId = event.opinionId;
      const eventTimestamp = event.timestamp;
      
      // Count trades (answer submissions)
      const currentCount = tradeCountsByOpinion.get(opinionId) || 0;
      tradeCountsByOpinion.set(opinionId, currentCount + 1);
      
      // Track last activity
      const currentLastActivity = lastActivityByOpinion.get(opinionId) || 0;
      if (eventTimestamp > currentLastActivity) {
        lastActivityByOpinion.set(opinionId, eventTimestamp);
      }
      
      // Calculate 24h volume
      if (eventTimestamp > twentyFourHoursAgo) {
        const currentVolume = volumeByOpinion24h.get(opinionId) || 0;
        volumeByOpinion24h.set(opinionId, currentVolume + Number(event.price));
      }
    });

    // Calculate aggregated stats - get unique actors from all events
    const totalUniqueTraders = new Set([
      ...creationEvents.map(e => e.actor.toLowerCase()),
      ...answerEvents.map(e => e.actor.toLowerCase())
    ]).size;

    const total24hVolume = Array.from(volumeByOpinion24h.values()).reduce((sum, vol) => sum + vol, 0);
    
    return {
      creationTimestamps,
      tradeCountsByOpinion,
      lastActivityByOpinion,
      volumeByOpinion24h,
      totalUniqueTraders,
      total24hVolume,
      totalEvents: opinionActionEvents.length
    };
  }, [creationEvents, answerEvents, opinionActionEvents]);

  // Helper functions to get data for specific opinions
  const getCreationTimestamp = (opinionId: number): number | null => {
    return processedData.creationTimestamps.get(opinionId) || null;
  };

  const getTradeCount = (opinionId: number): number => {
    return processedData.tradeCountsByOpinion.get(opinionId) || 0;
  };

  const getLastActivity = (opinionId: number): number | null => {
    return processedData.lastActivityByOpinion.get(opinionId) || null;
  };

  const get24hVolume = (opinionId: number): number => {
    return processedData.volumeByOpinion24h.get(opinionId) || 0;
  };

  return {
    // Raw events
    opinionActionEvents,
    creationEvents,
    answerEvents,
    
    // Loading states
    isLoading,
    error,
    
    // Processed data
    totalUniqueTraders: processedData.totalUniqueTraders,
    total24hVolume: processedData.total24hVolume,
    totalEvents: processedData.totalEvents,
    
    // Helper functions
    getCreationTimestamp,
    getTradeCount,
    getLastActivity,
    get24hVolume,
    
    // Debug info
    debug: {
      totalActionEvents: opinionActionEvents.length,
      creationEvents: creationEvents.length,
      answerEvents: answerEvents.length,
      uniqueOpinions: new Set([...creationEvents.map(e => e.opinionId), ...answerEvents.map(e => e.opinionId)]).size
    },
    
    // Refresh function
    refresh: () => {
      // This will trigger useEffect to re-fetch events
      setIsLoading(true);
    }
  };
}