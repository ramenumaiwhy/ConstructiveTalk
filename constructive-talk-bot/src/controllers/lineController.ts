import { WebhookEvent, Client, TextMessage } from '@line/bot-sdk';
import { lineConfig } from '../config/line';
import { handleMessage } from '../services/messageHandler';

const client = new Client(lineConfig);

// 処理済みのWebhookイベントを保持するセット
const processedEvents = new Set<string>();
// イベントの有効期限（5分）
const EVENT_EXPIRY = 5 * 60 * 1000;

export async function handleEvent(event: WebhookEvent): Promise<void> {
  try {
    console.log('[LineController] Processing event:', {
      type: event.type,
      timestamp: event.timestamp,
      webhookEventId: event.webhookEventId,
      mode: event.mode,
      source: event.source
    });

    // イベントIDとタイムスタンプによる重複チェック
    const eventKey = `${event.webhookEventId}-${event.timestamp}`;
    
    // 既に処理済みのイベントはスキップ
    if (processedEvents.has(eventKey)) {
      console.log('[LineController] Duplicate event skipped:', eventKey);
      return;
    }

    // タイムスタンプの確認（5分以上古いイベントは処理しない）
    const now = Date.now();
    if (now - event.timestamp > EVENT_EXPIRY) {
      console.log('[LineController] Old event skipped:', {
        eventTimestamp: event.timestamp,
        currentTime: now,
        difference: now - event.timestamp
      });
      return;
    }

    // イベントを処理済みとしてマーク
    processedEvents.add(eventKey);
    
    // 5分後にイベントキーを削除（メモリ管理）
    setTimeout(() => {
      processedEvents.delete(eventKey);
    }, EVENT_EXPIRY);

    if (event.type !== 'message' || event.message.type !== 'text') {
      console.log('[LineController] Unsupported event type:', event.type);
      return;
    }

    console.log('[LineController] Processing text message:', {
      text: event.message.text,
      userId: event.source.userId,
      timestamp: event.timestamp
    });

    try {
      const response = await handleMessage(event.message.text);
      console.log('[LineController] Generated response:', response);
      
      const message: TextMessage = {
        type: 'text',
        text: response,
      };

      console.log('[LineController] Sending reply:', {
        replyToken: event.replyToken,
        message
      });

      await client.replyMessage(event.replyToken, message);
      console.log('[LineController] Reply sent successfully');
    } catch (error) {
      console.error('[LineController] Error handling message:', error);
      
      // エラー時のメッセージ
      const errorMessage: TextMessage = {
        type: 'text',
        text: '申し訳ありません。メッセージの処理中にエラーが発生しました。',
      };

      try {
        await client.replyMessage(event.replyToken, errorMessage);
        console.log('[LineController] Error message sent successfully');
      } catch (replyError) {
        console.error('[LineController] Failed to send error message:', replyError);
        throw replyError;
      }
    }
  } catch (error) {
    console.error('[LineController] Unhandled error:', error);
    throw error;
  }
} 