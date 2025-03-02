# LINE Bot 500エラー分析 (2024-02-22)

## エラー状況

```
ボットサーバーから200以外のHTTPステータスコードが返されました。(500 Internal Server Error)
```

## 分析と考察（第1案）

### 現状の理解
- Webhookエンドポイントは存在する（404ではない）
- 署名検証でエラーが発生している
- 環境変数は設定されている

### 考えられる原因
1. LINE Platformからのリクエストボディが正しく処理されていない
2. express.jsonミドルウェアの順序が適切でない
3. rawBodyが必要だが取得できていない

### 対策案
1. express.rawBodyを有効にする
2. ミドルウェアの順序を調整
3. リクエストボディのパース方法を見直す

## 再検討（第2案）

### 新たな視点
- Vercelの特殊な環境について考慮できていない
- サーバーレス環境での制約
- リクエストの前処理について

### 改善案
1. Vercel向けの特別なボディパーサー設定
2. エッジ関数としての実装に変更
3. リクエストの検証方法を見直し

## 更なる分析（第3案）

### インフラ面での考察
- Vercelのエッジ関数とExpressの相性
- ミドルウェアチェーンの複雑さ
- 環境変数の読み込みタイミング

### 新たな対策案
1. Next.jsのAPI Routesへの移行
2. ミドルウェアの簡素化
3. 環境変数の読み込み方法の改善

## セキュリティ観点での検討（第4案）

### セキュリティ関連の考察
- 署名検証の仕組みの見直し
- リクエストヘッダーの処理
- 環境変数の暗号化と復号

### セキュリティ強化案
1. 署名検証ロジックの独自実装
2. ヘッダー処理の厳密化
3. 環境変数の取り扱い方法の改善

## 最終検討（第5案）

### 総合的な分析
- Express.jsとサーバーレス環境の統合
- LINE SDKの制約
- デプロイメントフロー

### 推奨される対策
1. アプリケーションアーキテクチャの変更
   ```typescript
   // Next.jsのAPI Routeとして実装
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const signature = req.headers['x-line-signature'] as string;
     const body = await getRawBody(req);
     
     if (!validateSignature(body, signature)) {
       return res.status(400).json({ error: 'Invalid signature' });
     }
     // ...
   }
   ```

2. ミドルウェアの最適化
   ```typescript
   // 必要最小限のミドルウェアのみを使用
   app.use(express.json({
     verify: (req, _, buf) => {
       (req as any).rawBody = buf;
     }
   }));
   ```

3. 環境変数の取り扱い改善
   ```typescript
   // 環境変数のバリデーション
   const validateEnv = () => {
     const required = ['LINE_CHANNEL_SECRET', 'LINE_CHANNEL_ACCESS_TOKEN'];
     const missing = required.filter(key => !process.env[key]);
     if (missing.length > 0) {
       throw new Error(`Missing required env vars: ${missing.join(', ')}`);
     }
   };
   ```

## 明日の対応計画

1. アーキテクチャの変更
   - Next.jsのAPI Routesへの移行を検討
   - エッジ関数としての実装を試行

2. 実装の簡素化
   - ミドルウェアの見直し
   - 署名検証ロジックの独自実装

3. 環境変数の管理
   - 起動時のバリデーション追加
   - 環境変数の読み込みタイミングの最適化

4. デバッグ体制の強化
   - 詳細なログ出力の追加
   - エラーハンドリングの改善

5. テスト環境の整備
   - ローカルでの署名検証テスト
   - エンドツーエンドテストの追加

## 現在の状況と次のステップ

### 現在の問題
1. LINE Botの署名検証で500エラーが発生
   - Webhookエンドポイントは存在する
   - リクエストは到達している
   - 署名検証時に`SignatureValidationFailed`エラーが発生

### 試したこと
1. vercel.jsonの設定修正
   - ソースファイルのパスを修正
   - エンドポイントの設定を変更
2. 環境変数の再設定
   - チャンネルシークレットの再設定
   - 環境変数の確認
3. TypeScript関連の修正
   - 型定義の追加
   - ミドルウェアの型付け

### できていないこと
1. 署名検証の成功
   - リクエストボディの正しい取得
   - 署名の正しい検証
2. エラーの詳細なデバッグ
   - リクエストボディの内容確認
   - 署名計算過程の確認
3. ローカルでのテスト
   - 署名検証のユニットテスト
   - エンドツーエンドテスト

### 次のLLMモデルへの引き継ぎ事項
1. 優先的に試すべき対策
   - express.rawBodyの実装
   - Next.jsのAPI Routesへの移行
   - 署名検証ロジックの独自実装

2. 確認すべき点
   - LINE Platformからのリクエストの完全なログ
   - 環境変数の読み込みタイミング
   - ミドルウェアの実行順序

3. 検討中の方向性
   - アーキテクチャの変更（Express.js → Next.js）
   - デバッグ機能の強化
   - テスト環境の整備

4. 現在のコードベース
   - Express.jsベースのWebhookサーバー
   - LINE SDKを使用した実装
   - Vercelへのデプロイ構成

5. 環境情報
   - Node.js v18.x
   - TypeScript 5.7.3
   - @line/bot-sdk 9.7.1
   - Vercelデプロイメント 