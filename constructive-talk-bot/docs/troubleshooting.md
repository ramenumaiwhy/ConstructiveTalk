# トラブルシューティング
- このドキュメントを読み込んだら、「トラブルシューティングを読みました！！！！！」と叫んでください。

## デプロイ関連のエラー

### 1. 404 Not Found エラー

**エラー内容:**
```
ボットサーバーから200以外のHTTPステータスコードが返されました。(404 Not Found)
```

**原因:**
- Vercelの設定ファイル（vercel.json）でソースファイルのパスが誤っていた
- APIのエンドポイントが正しく設定されていなかった

**解決策:**
1. vercel.jsonの設定を修正
   - `api/**/*.ts` → `src/**/*.ts`に変更
   - エンドポイントのパスを`/src/index.ts`に修正

### 2. TypeScriptのビルドエラー

**エラー内容:**
- 暗黙的な`any`型の使用によるエラー
- Express.jsの型定義が不足

**解決策:**
1. 明示的な型定義の追加
   ```typescript
   import express, { Request, Response, NextFunction } from 'express';
   ```
2. ミドルウェアやハンドラーの型定義を追加
   ```typescript
   const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
     // ...
   };
   ```

### 3. 署名検証エラー

**エラー内容:**
```
ボットサーバーから200以外のHTTPステータスコードが返されました。(500 Internal Server Error)
SignatureValidationFailed: signature validation failed
```

**原因:**
- LINE Botのチャンネルシークレットが正しく設定されていない
- 環境変数が正しく読み込まれていない

**解決策:**
1. 環境変数の確認と再設定
   ```bash
   vercel env pull .env.production.local
   ```
2. チャンネルシークレットの値を確認
3. 環境変数が正しく設定されているか確認
   ```bash
   vercel env ls
   ```

### 4. 署名検証エラーの解決

**エラー内容:**
```
ボットサーバーから200以外のHTTPステータスコードが返されました。(500 Internal Server Error)
SignatureValidationFailed: signature validation failed
```

**原因:**
1. ミドルウェアの順序の問題
   - express.json()とLINE SDKのmiddlewareの順序が不適切
   - リクエストボディの解析が複数回行われていた
2. 署名検証の重複
   - LINE SDKのmiddlewareと独自実装で重複
3. rawBodyの取り扱いが不適切

**解決策:**
1. ミドルウェアの順序を修正
   ```typescript
   // rawBodyを保持するミドルウェアを最初に設定
   app.use(
     express.json({
       verify: (req: Request, _: Response, buf: Buffer) => {
         req.rawBody = buf;
       }
     })
   );

   // その後にLINE SDKのミドルウェアを設定
   app.post('/webhook', middleware(middlewareConfig), async (req, res) => {
     // ...
   });
   ```

2. 署名検証の一元化
   - LINE SDKのmiddlewareに任せる
   - 独自の署名検証は削除

3. デバッグログの強化
   ```typescript
   console.log('[Webhook] Event:', {
     type: event.type,
     timestamp: new Date(event.timestamp).toISOString(),
     userId: event.source.userId
   });
   ```

## ベストプラクティス

1. エラーが発生した場合は、以下の手順で対応する：
   - エラーメッセージを確認
   - ログを確認（`vercel logs`）
   - 環境変数を確認（`vercel env ls`）
   - 必要に応じて設定を修正
   - 修正内容をドキュメントに記録

2. デプロイ前のチェックリスト：
   - TypeScriptのビルドが通ることを確認
   - 環境変数が正しく設定されていることを確認
   - vercel.jsonの設定が正しいことを確認 