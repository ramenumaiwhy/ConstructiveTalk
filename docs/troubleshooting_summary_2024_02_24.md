# LINE Bot デプロイ問題の解決記録 (2024-02-24)

## 現在の問題点

### 1. 404エラーが継続中
- 関連ファイル:
  - `vercel.json` (`/Users/aiharataketo/projects/ConstructiveTalk/vercel.json`)
  - `src/index.ts` (`/Users/aiharataketo/projects/ConstructiveTalk/src/index.ts`)
- 症状: デプロイ後もエンドポイントにアクセスできない
- 試行中の対策:
  - `vercel.json`のルーティング設定の見直し
  - エンドポイントパスの整理

### 2. リッチメニューの表示問題
- 関連ファイル:
  - `src/services/RichMenuManager.ts` (`/Users/aiharataketo/projects/ConstructiveTalk/src/services/RichMenuManager.ts`)
  - `src/controllers/lineController.ts` (`/Users/aiharataketo/projects/ConstructiveTalk/src/controllers/lineController.ts`)
- 症状: フォローイベント後にリッチメニューが表示されない
- 現在の状態: 画像生成とメニュー設定の処理を確認中

### 3. Webhook検証エラー
- 関連ファイル:
  - `src/index.ts` (`/Users/aiharataketo/projects/ConstructiveTalk/src/index.ts`)
  - `src/config/line.ts` (`/Users/aiharataketo/projects/ConstructiveTalk/src/config/line.ts`)
- 症状: LINE Developersコンソールでのwebhook検証が失敗
- 確認中の項目: 
  - ミドルウェアの順序
  - 署名検証の処理

## これまでの問題と対策

## 1. 401 Unauthorized エラー

### 問題の概要
- LINE Platformからの署名検証が失敗
- Webhook URLの検証で401エラーが発生

### 原因
1. ミドルウェアの順序の問題
   - `express.json()`が署名検証の前に配置されていた
   - リクエストボディが複数回パースされていた

### 実施した対策
1. ミドルウェアの順序を修正
   ```typescript
   // リクエストロギングミドルウェア
   app.use(requestLogger);

   // Webhookエンドポイント
   app.post('/webhook', 
     middleware(middlewareConfig),
     async (req: Request, res: Response) => {
       // ...
     }
   );
   ```

2. `express.json()`ミドルウェアを削除
   - LINE SDKのミドルウェアにボディパースを一任
   - リクエストボディの重複パースを防止

## 2. 404 Not Found エラー

### 問題の概要
- Vercelでデプロイしたエンドポイントにアクセスできない
- ヘルスチェックとWebhookの両方で404エラー

### 原因
1. `vercel.json`のルーティング設定が不適切
   - パスの指定方法が誤っていた
   - ルートの優先順位が考慮されていなかった

### 実施した対策
1. `vercel.json`の設定を修正
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/health",
         "methods": ["GET"],
         "dest": "src/index.ts"
       },
       {
         "src": "/webhook",
         "methods": ["POST"],
         "dest": "src/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ]
   }
   ```

2. エンドポイントの設定を明確化
   - メソッド制約を追加（GET/POST）
   - 各ルートの`dest`を正しく設定

## 3. その他の最適化

### ログ出力の強化
1. リクエストロギングの改善
   ```typescript
   const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
     console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
     console.log('[Request] Headers:', req.headers);
     // ...
   };
   ```

2. ヘルスチェックの詳細化
   ```typescript
   const status = {
     status: 'ok',
     timestamp: new Date().toISOString(),
     environment: process.env.NODE_ENV || 'development',
     line: {
       hasChannelSecret: !!channelSecret,
       hasAccessToken: !!channelAccessToken,
       secretLength: channelSecret ? channelSecret.length : 0,
       tokenLength: channelAccessToken ? channelAccessToken.length : 0
     }
   };
   ```

## 追加の対策と試行（2024-02-24 23:45-24:00）

### 1. express.jsonミドルウェアの調整

#### 試行1: グローバルミドルウェアとして設定
```typescript
app.use(express.json());
```
結果: 401エラーが継続

#### 試行2: ルート固有のミドルウェアとして設定
```typescript
app.post('/webhook',
  express.json(),
  middleware(lineConfig),
  async (req: Request, res: Response) => {
    // ...
  }
);
```
結果: 401エラーが継続

#### 試行3: express.jsonミドルウェアの完全削除
```typescript
app.post('/webhook',
  middleware(lineConfig),
  async (req: Request, res: Response) => {
    const events: WebhookEvent[] = (req as any).body.events;
    // ...
  }
);
```
結果: 401エラーが継続

### 2. LINE設定の強化

#### 環境変数の厳格なチェック
```typescript
if (!process.env.LINE_CHANNEL_SECRET) {
  throw new Error('LINE_CHANNEL_SECRET is not set');
}

if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
  throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set');
}

export const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
```

### 3. Vercel設定の最適化

#### vercel.jsonの更新
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 10
      }
    }
  ],
  "routes": [
    {
      "src": "/webhook",
      "methods": ["POST"],
      "dest": "src/index.ts",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, x-line-signature"
      }
    }
  ]
}
```

## 現在の課題

1. 401 Unauthorized エラーの継続
   - LINE Platformからの署名検証が依然として失敗
   - 環境変数は正しく設定されているが、署名検証が通らない

2. 考えられる原因
   - リクエストボディの処理方法
   - ミドルウェアの順序
   - Vercelでのリクエスト処理方法

3. 次のステップ
   - 別のエディタでの実装試行
   - ローカル環境でのデバッグ
   - ngrokを使用したローカルテスト

## 学んだ教訓（追加）

1. Vercelでのデプロイ時の注意点
   - `functions`と`builds`は同時に使用不可
   - ヘッダー設定は明示的に行う必要がある

2. LINE Webhookの特性
   - 署名検証は非常にセンシティブ
   - リクエストボディの処理方法が重要

3. デバッグの重要性
   - 環境変数の検証
   - 詳細なログ出力
   - エラーの詳細な把握
