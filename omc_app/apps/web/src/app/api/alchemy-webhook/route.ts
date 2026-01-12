import { NextRequest, NextResponse } from 'next/server';
import { Interface } from 'ethers';
import { indexingService, IndexedEvent } from '@/lib/indexing-service';
import { CONTRACTS } from '@/lib/contracts';

// Types pour les événements OMC
interface AlchemyWebhookPayload {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    network: string;
    activity: Array<{
      fromAddress: string;
      toAddress: string;
      blockNum: string;
      hash: string;
      rawContract: {
        rawValue: string;
        address: string;
        decimals: number;
      };
      log: {
        address: string;
        topics: string[];
        data: string;
        blockNumber: string;
        transactionHash: string;
        transactionIndex: string;
        blockHash: string;
        logIndex: string;
        removed: boolean;
      };
    }>;
  };
}

// ABI pour décoder les événements (ajuste selon ton contrat)
const OPINION_CORE_ABI = [
  "event OpinionAction(indexed uint256 opinionId, uint8 actionType, string content, indexed address user, uint256 price)",
  "event FeesAction(indexed uint256 opinionId, uint8 actionType, indexed address user, uint256 price, uint256 platformFee, uint256 creatorFee, uint256 ownerAmount)",
  "event QuestionSaleAction(indexed uint256 opinionId, uint8 actionType, indexed address seller, indexed address buyer, uint256 price)"
];

const contractInterface = new Interface(OPINION_CORE_ABI);

export async function POST(request: NextRequest) {
  console.log('🚀 POST request received at webhook:', new Date().toISOString());
  console.log('🚀 Request method:', request.method);
  console.log('🚀 Request URL:', request.url);
  console.log('🚀 Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const contentType = request.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    const payload: AlchemyWebhookPayload = await request.json();
    console.log('📦 Raw payload received:', JSON.stringify(payload, null, 2));
    
    console.log('🔔 Webhook received:', {
      type: payload.type,
      network: payload.event.network,
      activities: payload.event.activity.length,
      timestamp: new Date().toISOString()
    });

    // Traiter chaque activité (event)
    for (const activity of payload.event.activity) {
      const log = activity.log;
      
      // Vérifier que c'est bien notre contrat
      if (log.address.toLowerCase() !== CONTRACTS.OPINION_CORE.toLowerCase()) {
        continue;
      }

      try {
        // Décoder l'événement
        const decodedEvent = contractInterface.parseLog({
          topics: log.topics,
          data: log.data
        });

        if (decodedEvent) {
          console.log('📝 Event decoded:', {
            name: decodedEvent.name,
            args: decodedEvent.args,
            txHash: log.transactionHash,
            block: log.blockNumber
          });

          // Process event by type
          await processEvent(decodedEvent, log);
        } else {
          console.log('⚠️ Could not decode event');
        }

      } catch (decodeError) {
        console.error('❌ Erreur décodage événement:', decodeError);
      }
    }

    console.log('✅ Webhook processing completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      processed: payload.event.activity.length 
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

async function processEvent(decodedEvent: any, log: any) {
  const eventName = decodedEvent.name;
  
  switch (eventName) {
    case 'OpinionAction':
      await handleOpinionAction(decodedEvent.args, log);
      break;
      
    case 'FeesAction':
      await handleFeesAction(decodedEvent.args, log);
      break;
      
    case 'QuestionSaleAction':
      await handleQuestionSaleAction(decodedEvent.args, log);
      break;
      
    default:
      console.log('🤷 Événement non traité:', eventName);
  }
}

async function handleOpinionAction(args: any, log: any) {
  const opinionId = parseInt(args.opinionId.toString());
  const actionType = args.actionType;
  const content = args.content;
  const user = args.user;
  const price = BigInt(args.price.toString());
  
  console.log('💭 Opinion Action:', {
    opinionId,
    actionType: getActionTypeName(actionType),
    user,
    price: price.toString(),
    block: log.blockNumber
  });
  
  // Create indexed event
  const event: IndexedEvent = {
    opinionId,
    eventType: actionType === 1 ? 'answer_submitted' : 'opinion_created',
    user,
    content,
    price,
    timestamp: Date.now(),
    blockNumber: parseInt(log.blockNumber),
    transactionHash: log.transactionHash
  };
  
  // Add to indexing service
  indexingService.addEvent(event);
  
  console.log('📊 Event indexed:', event);
}

async function handleFeesAction(args: any, log: any) {
  const opinionId = parseInt(args.opinionId.toString());
  const user = args.user;
  const price = BigInt(args.price.toString());
  
  console.log('💰 Fees Action:', {
    opinionId,
    user,
    price: price.toString(),
    platformFee: args.platformFee.toString(),
    creatorFee: args.creatorFee.toString(),
    ownerAmount: args.ownerAmount.toString()
  });
  
  // Create indexed event for fees
  const event: IndexedEvent = {
    opinionId,
    eventType: 'fees_collected',
    user,
    price,
    timestamp: Date.now(),
    blockNumber: parseInt(log.blockNumber),
    transactionHash: log.transactionHash
  };
  
  indexingService.addEvent(event);
}

async function handleQuestionSaleAction(args: any, log: any) {
  const opinionId = parseInt(args.opinionId.toString());
  const seller = args.seller;
  const buyer = args.buyer;
  const price = BigInt(args.price.toString());
  
  console.log('🏷️ Question Sale:', {
    opinionId,
    seller,
    buyer,
    price: price.toString()
  });
  
  // Create indexed event for question sale
  const event: IndexedEvent = {
    opinionId,
    eventType: 'question_sale',
    user: buyer, // buyer is the new owner
    price,
    timestamp: Date.now(),
    blockNumber: parseInt(log.blockNumber),
    transactionHash: log.transactionHash
  };
  
  indexingService.addEvent(event);
}

function getActionTypeName(actionType: number): string {
  const types: { [key: number]: string } = {
    0: 'Question Created',
    1: 'Answer Submitted', 
    2: 'Opinion Deactivated',
    3: 'Opinion Reactivated',
    4: 'Answer Moderated'
  };
  return types[actionType] || `Unknown (${actionType})`;
}

// GET endpoint to check webhook status
export async function GET() {
  console.log('ℹ️ GET request to webhook endpoint');
  
  return NextResponse.json({
    status: 'active',
    contract: CONTRACTS.OPINION_CORE,
    network: 'base-mainnet',
    timestamp: new Date().toISOString(),
    message: 'Webhook is active and ready to receive POST requests from Alchemy'
  });
}

// Handle other HTTP methods with explicit error
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// Handle CORS preflight requests
export async function OPTIONS() {
  console.log('⚙️ OPTIONS request received - handling CORS preflight');
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}