import express from 'express';
import { middleware, WebhookEvent, Client, MiddlewareConfig } from '@line/bot-sdk';
import { lineConfig, port } from './config/line';
import { handleEvent } from './controllers/lineController';

const app = express();
const client = new Client(lineConfig);

// リクエストロギングミドルウェア
const requestLogger: express.RequestHandler = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
};

// ミドルウェアの設定
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORSミドルウェア
const corsMiddleware: express.RequestHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-line-signature');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
};

app.use(corsMiddleware);

// LINE Botの設定
const middlewareConfig: MiddlewareConfig = {
  channelSecret: lineConfig.channelSecret || ''
};

// Webhookエンドポイント
app.post('/webhook', middleware(middlewareConfig), async (req: express.Request, res: express.Response) => {
  console.log('[Webhook] Request received:', {
    headers: req.headers,
    body: req.body
  });

  try {
    const events: WebhookEvent[] = req.body.events;
    console.log('[Webhook] Processing events:', events);

    if (!events || events.length === 0) {
      console.log('[Webhook] No events received');
      res.status(200).end();
      return;
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
    res.status(200).end();
  } catch (err) {
    console.error('[Webhook] Error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// ヘルスチェックエンドポイント
app.get('/health', (_, res) => {
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
app.get('/', (_, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LINE Bot server is running'
  });
});

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error] Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// サーバー起動
app.listen(port, () => {
  console.log(`[Server] Running on port ${port}`);
  console.log('[Server] LINE Config:', {
    hasAccessToken: !!lineConfig.channelAccessToken,
    hasSecret: !!lineConfig.channelSecret
  });
}); 