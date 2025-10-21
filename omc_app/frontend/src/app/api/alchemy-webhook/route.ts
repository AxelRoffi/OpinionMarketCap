import { NextRequest, NextResponse } from 'next/server';
import { Interface } from 'ethers';

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
  try {
    const payload: AlchemyWebhookPayload = await request.json();
    
    console.log('🔔 Webhook reçu:', {
      type: payload.type,
      network: payload.event.network,
      activities: payload.event.activity.length
    });

    // Traiter chaque activité (event)
    for (const activity of payload.event.activity) {
      const log = activity.log;
      
      // Vérifier que c'est bien notre contrat
      if (log.address.toLowerCase() !== '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f'.toLowerCase()) {
        continue;
      }

      try {
        // Décoder l'événement
        const decodedEvent = contractInterface.parseLog({
          topics: log.topics,
          data: log.data
        });

        console.log('📝 Événement décodé:', {
          name: decodedEvent.name,
          args: decodedEvent.args,
          txHash: log.transactionHash,
          block: log.blockNumber
        });

        // Traitement selon le type d'événement
        await processEvent(decodedEvent, log);

      } catch (decodeError) {
        console.error('❌ Erreur décodage événement:', decodeError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: payload.event.activity.length 
    });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
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
  const opinionId = args.opinionId.toString();
  const actionType = args.actionType;
  const content = args.content;
  const user = args.user;
  const price = args.price.toString();
  
  console.log('💭 Opinion Action:', {
    opinionId,
    actionType: getActionTypeName(actionType),
    user,
    price,
    block: log.blockNumber
  });
  
  // TODO: Ici tu peux mettre à jour ton cache local, base de données, etc.
  // Par exemple, sauvegarder dans localStorage côté client via Server-Sent Events
  // Ou mettre à jour une base Vercel KV
}

async function handleFeesAction(args: any, log: any) {
  console.log('💰 Fees Action:', {
    opinionId: args.opinionId.toString(),
    user: args.user,
    price: args.price.toString(),
    platformFee: args.platformFee.toString(),
    creatorFee: args.creatorFee.toString(),
    ownerAmount: args.ownerAmount.toString()
  });
}

async function handleQuestionSaleAction(args: any, log: any) {
  console.log('🏷️ Question Sale:', {
    opinionId: args.opinionId.toString(),
    seller: args.seller,
    buyer: args.buyer,
    price: args.price.toString()
  });
}

function getActionTypeName(actionType: number): string {
  const types = {
    0: 'Question Created',
    1: 'Answer Submitted', 
    2: 'Opinion Deactivated',
    3: 'Opinion Reactivated',
    4: 'Answer Moderated'
  };
  return types[actionType] || `Unknown (${actionType})`;
}

// Endpoint GET pour vérifier que le webhook fonctionne
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    contract: '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f',
    network: 'base-sepolia',
    timestamp: new Date().toISOString()
  });
}