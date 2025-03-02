import express from 'express';
import { middleware, WebhookEvent, MiddlewareConfig } from '@line/bot-sdk';
import { Request, Response, NextFunction } from 'express';
import { lineConfig, middlewareConfig, client } from './config/line';

const app = express();

// エラーハンドリングミドルウェア
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error]', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

// リクエストロギングミドルウェア（webhookエンドポイント以外）
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path !== '/webhook') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('[Request] Headers:', req.headers);
    if (req.method !== 'GET') {
      const bodyLog = req.body ? JSON.stringify(req.body, null, 2) : 'No body';
      console.log('[Request] Body:', bodyLog);
    }
  }
  next();
});

// ヘルスチェックエンドポイント
app.get('/health', (_: Request, res: Response) => {
  console.log('[Health] Health check requested');
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const defaultRichMenuId = process.env.DEFAULT_RICH_MENU_ID;

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    line: {
      hasChannelSecret: !!channelSecret,
      hasAccessToken: !!channelAccessToken,
      hasRichMenuId: !!defaultRichMenuId,
      secretLength: channelSecret ? channelSecret.length : 0,
      tokenLength: channelAccessToken ? channelAccessToken.length : 0
    }
  };

  console.log('[Health] Status:', JSON.stringify(status, null, 2));
  res.status(200).json(status);
});

// Webhookエンドポイント
app.post('/webhook',
  (req: Request, res: Response, next: NextFunction) => {
    // Webhookリクエストのログ（署名検証前）
    console.log(`[${new Date().toISOString()}] Webhook request received`);
    console.log('[Webhook] Headers:', JSON.stringify(req.headers, null, 2));
    const signature = req.headers['x-line-signature'];
    if (!signature) {
      console.error('[Webhook] No signature found in headers');
      res.status(401).json({
        status: 'error',
        message: 'No signature found',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next();
  },
  middleware(middlewareConfig),
  async (req: Request, res: Response) => {
    try {
      // 署名検証後のリクエストボディログ
      console.log('[Webhook] Request body:', JSON.stringify(req.body, null, 2));
      
      const events: WebhookEvent[] = req.body.events;
      
      if (!events || events.length === 0) {
        console.log('[Webhook] No events received');
        res.status(200).end();
        return;
      }

      console.log(`[Webhook] Processing ${events.length} events`);
      
      // イベント処理
      await Promise.all(
        events.map(async (event) => {
          try {
            console.log('[Webhook] Processing event:', JSON.stringify(event, null, 2));
            
            // フォローイベントの処理
            if (event.type === 'follow') {
              const userId = event.source.userId;
              if (!userId) {
                throw new Error('User ID not found in follow event');
              }
              
              const defaultRichMenuId = process.env.DEFAULT_RICH_MENU_ID;
              if (!defaultRichMenuId) {
                console.error('[RichMenu] DEFAULT_RICH_MENU_ID is not set');
                return;
              }
              
              // リッチメニューを設定
              try {
                await client.linkRichMenuToUser(userId, defaultRichMenuId);
                console.log(`[RichMenu] Successfully linked rich menu to user: ${userId}`);
              } catch (error) {
                console.error('[RichMenu] Error linking rich menu:', error);
                throw error;
              }
            }
            
          } catch (error) {
            console.error('[Webhook] Event processing error:', error);
            throw error;
          }
        })
      );

      res.status(200).end();
    } catch (error) {
      console.error('[Webhook] Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// エラーハンドリングミドルウェアを最後に追加
app.use(errorHandler);

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
