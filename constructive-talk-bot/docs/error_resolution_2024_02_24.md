# LINE Bot署名検証エラーの解決 (2024-02-24)

## 問題の概要

LINE Botのwebhookエンドポイントで500エラー（Internal Server Error）が発生し、以下のエラーメッセージが表示されていた：

```
ボットサーバーから200以外のHTTPステータスコードが返されました。(500 Internal Server Error)
SignatureValidationFailed: signature validation failed
```


## 原因分析

1. ミドルウェアの順序の問題
   - express.raw()とexpress.json()の両方が使用されていた
   - LINE SDKのmiddlewareの後にexpress.json()が配置されていた
   - リクエストボディの解析が複数回行われていた

2. 署名検証の重複
   - LINE SDKのmiddlewareで一度
   - lineController.tsで再度実施
   - これにより、リクエストボディの形式が途中で変更され、署名検証が失敗

3. rawBodyの取り扱い
   - 署名検証に必要なrawBodyが適切に保持されていなかった
   - express.json()の設定が不適切だった

## 実施した修正

1. lineController.tsの改善
   ```typescript
   // 署名検証をLINE SDKのmiddlewareに一元化
   // イベント重複処理の実装
   export async function handleEvent(event: WebhookEvent): Promise<void> {
     const eventId = `${event.source.userId}-${event.timestamp}`;
     if (processedEvents.has(eventId)) {
       console.log(`[Event] Skipping duplicate event: ${eventId}`);
       return;
     }
     // ...
   }
   ```

2. index.tsのミドルウェア順序の最適化
   ```typescript
   // rawBodyを保持するミドルウェアを最初に設定
   app.use(
     express.json({
       verify: (req: Request, _: Response, buf: Buffer) => {
         req.rawBody = buf;
       }
     })
   );
   
   // LINE SDKのミドルウェアを設定
   app.post('/webhook', 
     middleware(middlewareConfig),
     async (req: Request, res: Response) => {
       // ...
     }
   );
   ```

3. ログ出力の強化
   ```typescript
   console.log('[Webhook] Event:', {
     type: event.type,
     timestamp: new Date(event.timestamp).toISOString(),
     userId: event.source.userId
   });
   ```

## 結果

1. 署名検証エラーが解消
   - LINE Platformからのリクエストが正常に処理されるようになった
   - 500エラーが発生しなくなった

2. パフォーマンスの改善
   - リクエストボディの解析が1回のみに最適化
   - 不要な署名検証の重複を排除

3. デバッグ性の向上
   - 詳細なログ出力により問題の特定が容易に
   - イベントの重複処理により安定性が向上

## 教訓

1. ミドルウェアの順序は重要
   - リクエストボディの解析と署名検証の順序に注意
   - 複数のミドルウェアの相互作用を考慮

2. 署名検証は一元化
   - LINE SDKの提供する機能を活用
   - 独自実装は避け、信頼できるライブラリに任せる

3. 適切なログ出力
   - デバッグに必要な情報を適切なタイミングで出力
   - エラー発生時の状況把握を容易に

## 今後の改善点

1. エラーハンドリングの強化
   - より詳細なエラーメッセージ
   - エラー発生時の適切なフォールバック処理

2. モニタリングの強化
   - 重要なメトリクスの収集
   - アラートの設定

3. テストの充実
   - 署名検証のユニットテスト
   - エンドツーエンドテストの追加
# リッチメニュー画像生成問題の解決記録

## 発生した問題
リッチメニュー用の画像を自動生成するスクリプトの実行時に以下のエラーが発生：
```
Error: Cannot find module '../build/Release/canvas.node'
```

## 問題の原因
1. Node.jsのバージョンの不一致（v23.7.0が使用されていたが、要件は18.x）
2. canvasモジュールのビルドが正しく行われていない
3. node-gypの設定が不完全

## 解決策
1. Node.jsのバージョンを18.xに変更
2. node-gypを再インストール
3. canvasパッケージを`--build-from-source`オプションを使用して再インストール

## 実施した対応

### 1. Node.jsバージョンの変更
```bash
# nodebrewのインストールと設定
brew install nodebrew
nodebrew setup
nodebrew install-binary 18.19.1
nodebrew use 18.19.1

# 環境変数の設定
export PATH=$HOME/.nodebrew/current/bin:$PATH
```

### 2. 依存関係の確認と更新
```bash
# 必要な依存関係の確認
brew list | grep -E "pkg-config|cairo|pango|libpng|jpeg|giflib|librsvg"

# node-gypのグローバルインストール
npm install -g node-gyp
```

### 3. canvasパッケージの再インストール
```bash
# canvasパッケージの削除と再インストール
npm uninstall canvas
npm install canvas --build-from-source
```

## 結果
- メインメニューとコンバセーションメニューの画像が正常に生成
- 生成された画像ファイル：
  - assets/main_menu.png (54KB)
  - assets/conversation_menu.png (38KB)

## 今後の対策
1. Node.jsのバージョン管理を徹底
2. 開発環境のセットアップ手順にcanvasの依存関係のインストール手順を追加
3. パッケージのインストール時に`--build-from-source`オプションの使用を検討
