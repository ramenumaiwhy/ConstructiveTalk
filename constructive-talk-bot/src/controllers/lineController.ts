import { WebhookEvent, Client } from '@line/bot-sdk';
import { lineConfig } from '../config/line';
import { handleMessage } from '../services/messageHandler';
import { RichMenuManager } from '../services/RichMenuManager';

const client = new Client(lineConfig);
const richMenuManager = new RichMenuManager(client);

// 処理済みのWebhookイベントを保持するセット
const processedEvents = new Set<string>();
// イベントの有効期限（5分）
const EVENT_EXPIRY = 5 * 60 * 1000;

export async function handleEvent(event: WebhookEvent): Promise<void> {
  // 重複イベントの処理を防ぐ
  const eventId = `${event.source.userId}-${event.timestamp}`;
  if (processedEvents.has(eventId)) {
    console.log(`[Event] Skipping duplicate event: ${eventId}`);
    return;
  }

  // イベントを処理済みとしてマーク
  processedEvents.add(eventId);
  setTimeout(() => processedEvents.delete(eventId), EVENT_EXPIRY);

  try {
    switch (event.type) {
      case 'follow':
        await handleFollowEvent(event);
        break;
      case 'message':
        if (event.message.type === 'text') {
          console.log(`[Event] Processing message: ${event.message.text}`);
          await handleMessage(event.message.text, event.replyToken);
          console.log(`[Event] Message processed successfully`);
        } else {
          console.log(`[Event] Skipping non-text message event: ${event.message.type}`);
        }
        break;
      default:
        console.log(`[Event] Skipping unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('[Event] Error handling event:', error);
    if ('replyToken' in event) {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'すみません、エラーが発生しました。'
      });
    }
  }
}

async function handleFollowEvent(event: WebhookEvent): Promise<void> {
  if (event.type !== 'follow') return;
  
  const userId = event.source.userId;
  if (!userId) {
    console.error('[Follow] No user ID in follow event');
    return;
  }

  try {
    console.log(`[Follow] Setting up rich menu for user: ${userId}`);
    await richMenuManager.setupDefaultRichMenus();
    
    if ('replyToken' in event) {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'フォローありがとうございます！\n下のメニューから「会話を始める」を選んでください。'
      });
    }
    console.log(`[Follow] Rich menu setup completed for user: ${userId}`);
  } catch (error) {
    console.error('[Follow] Error setting up rich menu:', error);
    throw error;
  }
}
