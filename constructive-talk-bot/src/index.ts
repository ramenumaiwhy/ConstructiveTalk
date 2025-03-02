import express, { Request, Response, NextFunction } from 'express';
import { middleware, WebhookEvent, Client, MiddlewareConfig } from '@line/bot-sdk';
import { lineConfig, port } from './config/line';
import { handleEvent } from './controllers/lineController';
import { RichMenuManager } from './services/RichMenuManager';

const app = express();
const client = new Client(lineConfig);
const richMenuManager = new RichMenuManager(client);

// Express Request型の拡張
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// リクエストロギングミドルウェア
const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[Request] Headers:', req.headers);
  if (req.method !== 'GET') {
    const bodyLog = req.body ? JSON.stringify(req.body, null, 2) : 'No body';
    console.log('[Request] Body:', bodyLog);
  }
  next();
};

// ミドルウェアの設定
// 1. rawBodyを保持するミドルウェア
app.use(express.json({
  verify: (req: Request, _: Response, buf: Buffer) => {
    req.rawBody = buf;
  }
}));

// 2. リクエストロギング
app.use(requestLogger);

// LINE Botの設定
const middlewareConfig: MiddlewareConfig = {
  channelSecret: lineConfig.channelSecret || '',
};

// Webhookエンドポイント
app.post('/webhook', 
  middleware(middlewareConfig),
  async (req: Request, res: Response) => {
    try {
      const events: WebhookEvent[] = req.body.events;
      
      if (!events || events.length === 0) {
        console.log('[Webhook] No events received');
        res.status(200).end();
        return;
      }

      console.log(`[Webhook] Processing ${events.length} events`);
      
      await Promise.all(
        events.map(async (event) => {
          try {
            console.log('[Webhook] Event:', {
              type: event.type,
              timestamp: new Date(event.timestamp).toISOString(),
              userId: event.source.userId
            });
            
            await handleEvent(event);
          } catch (err) {
            console.error('[Webhook] Event handling error:', err);
            throw err;
          }
        })
      );

      console.log('[Webhook] All events processed successfully');
      res.status(200).end();
    } catch (err) {
      console.error('[Webhook] Error:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
);

// ヘルスチェックエンドポイント
app.get('/health', (_: Request, res: Response) => {
  console.log('[Health] Health check requested');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    config: {
      hasAccessToken: !!lineConfig.channelAccessToken,
      hasSecret: !!lineConfig.channelSecret
    }
  });
});

// デフォルトルート
app.get('/', (_: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'LINE Bot server is running'
  });
});

// エラーハンドリング
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error] Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// サーバー起動とリッチメニューのセットアップ
app.listen(port, async () => {
  console.log(`[Server] Running on port ${port}`);
  console.log('[Server] LINE Config:', {
    hasAccessToken: !!lineConfig.channelAccessToken,
    hasSecret: !!lineConfig.channelSecret
  });

  try {
    await richMenuManager.setupDefaultRichMenus();
    console.log('[Server] リッチメニューのセットアップが完了しました');
  } catch (error) {
    console.error('[Server] リッチメニューのセットアップに失敗しました:', error);
  }
});
