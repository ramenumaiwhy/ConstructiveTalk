import { WebhookEvent, Client, TextMessage } from '@line/bot-sdk';
import { lineConfig } from '../config/line';
import { handleMessage } from '../services/messageHandler';

const client = new Client(lineConfig);

// 処理済みのWebhookイベントを保持するセット
const processedEvents = new Set<string>();
// イベントの有効期限（5分）
const EVENT_EXPIRY = 5 * 60 * 1000;

export async function handleEvent(event: WebhookEvent): Promise<void> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  try {
    await handleMessage(event.message.text, event.replyToken);
  } catch (error) {
    console.error('Error handling event:', error);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'すみません、エラーが発生しました。'
    });
  }
} 