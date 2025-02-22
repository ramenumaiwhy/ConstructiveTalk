# 🛠 技術スタック

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
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS + Shadcn UI
- **HTTP Client**: SWR
- **チャートと可視化**: Chart.js
- **データグリッド**: TanStack Table

### バックエンド
- **APIルーティング**: Next.js API Routes
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

## �� ミニマルパターン（最小工数実装）

### チャットボット
- **プラットフォーム**: LINE Messaging API
- **Webhook**: Vercel Edge Functions
- **メッセージング機能**:
  - リッチメニュー（基本的なメニュー）
  - テキストメッセージ
  - クイックリプライ

### 管理画面（フロントエンド）
- **フレームワーク**: Next.js (App Router)
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