# 🛠 技術スタック

## 📚 主要ライブラリの説明

### 基本的な開発ツール
- **TypeScript**：JavaScriptに「型」という概念を追加して、より安全にプログラミングができるようにする道具
- **pnpm**：プログラムの部品（パッケージ）を管理する道具。npm（Node Package Manager）の進化版で、より速く効率的
- **Biome**：コードの品質をチェックする道具。「ここはもっと分かりやすく書けるよ」とアドバイスをくれる

### フロントエンド（画面表示）関連
- **Next.js (Pages Router)**：ウェブアプリを作るための総合的な道具箱。クライアントサイドレンダリングを使用して、シンプルな構成で開発可能
- **React**：画面の部品（ボタンや入力欄など）を作るための道具。レゴブロックのように組み立てられる
- **TailwindCSS**：ウェブサイトをデザインするための「デジタルお絵かきセット」
- **Shadcn UI**：すぐに使える綺麗なボタンやフォームなどの部品セット
- **SWR**：サーバーからデータを取得して表示を更新する便利な道具

### AI・データ処理関連
- **Google Gemini API**：Googleが提供する賢いAI。ユーザーと会話したり、アイデアを出したりするのに使う
- **Vercel AI SDK**：AIとの会話をスムーズに行うための道具セット
- **LangChain**：AIへの指示（プロンプト）を管理する道具

### データ保存・管理関連
- **Vercel KV**：データを保存する「デジタル倉庫」
- **IndexedDB**：ブラウザ上でデータを保存できる「個人用の引き出し」
- **localStorage**：簡単な情報を一時的に保存できる「メモ帳」

### その他の便利ツール
- **Playwright**：アプリが正しく動くかテストする自動ロボット
- **Sentry**：アプリでエラーが起きたときに教えてくれる「見張り番」
- **PostHog**：どんな機能がよく使われているか分析する道具

## 🌟 Richパターン（フル機能実装）

### チャットボット
- **プラットフォーム**: LINE Messaging API
- **Webhook**: Vercel Edge Functions
- **メッセージング機能**:
  - リッチメニュー
  - Flex Messages
  - クイックリプライ
  - 画像/音声対応

### 管理画面（フロントエンド）
- **フレームワーク**: Next.js (Pages Router + CSR)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS + Shadcn UI
- **HTTP Client**: SWR
- **チャートと可視化**: Chart.js
- **データグリッド**: TanStack Table

### バックエンド
- **APIルーティング**: Next.js API Routes (Pages)
- **デプロイ**: Vercel
- **データストレージ**: 
  - KV: Vercel KV
  - Blob: Vercel Blob Storage
- **認証**: NextAuth.js + OAuth providers
- **キャッシュ**: Vercel Edge Cache

### AI/LLM統合
- **LLM統合**: Vercel AI SDK
- **API**: 
  - Google Gemini API (Primary)
  - OpenAI API (Secondary)
- **ストリーミング**: Server-Sent Events
- **プロンプト管理**: LangChain
- **ベクトルDB**: Vercel Postgres + pgvector

### 開発ツール
- **パッケージマネージャー**: pnpm
- **ビルドツール**: Vite
- **テスト**:
  - Unit: Vitest
  - E2E: Playwright
  - API: SuperTest
- **リンター**: Biome
- **Git管理**: GitHub
- **CI/CD**: GitHub Actions
- **モニタリング**: Sentry
- **アナリティクス**: PostHog

### データ管理
- **ストレージ**
  - Vercel KV (メインストレージ)
  - IndexedDB (ローカルストレージ)
  - localStorage (一時保存)
- **同期**
  - WebSocket (リアルタイム同期)
  - Background Sync API
  - Conflict Resolution

### セッション管理
- **自動保存**
  - Custom React Hooks
  - Web Workers
  - Service Workers
- **コンテキスト管理**
  - Context API
  - SWR for キャッシュ
  - Zustand for 状態管理

### オフライン対応
- **PWA**
  - next-pwa
  - Workbox
  - Cache API
- **同期**
  - IndexedDB
  - Background Sync
  - Push API

## 🟢 ミニマルパターン（最小工数実装）

### チャットボット
- **プラットフォーム**: LINE Messaging API
- **Webhook**: Vercel Edge Functions
- **メッセージング機能**:
  - リッチメニュー（基本的なメニュー）
  - テキストメッセージ
  - クイックリプライ

### 管理画面（フロントエンド）
- **フレームワーク**: Next.js (Pages Router + CSR)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **HTTP Client**: SWR
- **UIコンポーネント**: 最小限のカスタムコンポーネント

### バックエンド
- **APIルーティング**: Next.js API Routes
- **デプロイ**: Vercel
- **データストレージ**: Vercel KV
- **認証**: NextAuth.js (GitHub only)

### AI/LLM統合
- **LLM統合**: Vercel AI SDK
- **API**: Google Gemini API
- **ストリーミング**: Server-Sent Events

### 開発ツール
- **パッケージマネージャー**: pnpm
- **リンター**: Biome
- **Git管理**: GitHub 

### データ管理
- **ストレージ**
  - Vercel KV
  - localStorage
- **同期**
  - 基本的な HTTP ポーリング

### セッション管理
- **自動保存**
  - setInterval
  - Custom Hooks
- **コンテキスト管理**
  - Context API
  - localStorage

### オフライン対応
- **基本機能**
  - localStorage
  - エラーハンドリング
  - 再接続ロジック 