import { VercelRequest, VercelResponse } from '@vercel/node';
import { WebhookEvent, validateSignature } from '@line/bot-sdk';
import { lineConfig } from '../src/config/line';
import { handleEvent } from '../src/controllers/lineController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      // リクエストのログ
      console.log('[Webhook] Request received:', {
        headers: req.headers,
        body: req.body
      });

      // LINE署名の検証
      const signature = req.headers['x-line-signature'];
      if (!signature || typeof signature !== 'string') {
        console.error('[Webhook] No signature found or invalid signature type');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // 署名の検証
      const textBody = JSON.stringify(req.body);
      if (!lineConfig.channelSecret) {
        console.error('[Webhook] Channel secret not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const isValid = validateSignature(textBody, lineConfig.channelSecret, signature);

      if (!isValid) {
        console.error('[Webhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const events: WebhookEvent[] = req.body.events;
      console.log('[Webhook] Processing events:', events);

      if (!events || events.length === 0) {
        console.log('[Webhook] No events received');
        return res.status(200).end();
      }

      await Promise.all(
        events.map(async (event) => {
          try {
            console.log('[Webhook] Processing event:', event);
            await handleEvent(event);
            console.log('[Webhook] Event processed successfully');
          } catch (err) {
            console.error('[Webhook] Error handling event:', err);
            throw err;
          }
        })
      );

      console.log('[Webhook] All events processed successfully');
      return res.status(200).end();
    } catch (err) {
      console.error('[Webhook] Error:', err);
      return res.status(500).json({
        message: 'Internal server error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  } else if (req.method === 'OPTIONS') {
    // CORSプリフライトリクエストの処理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-line-signature');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 