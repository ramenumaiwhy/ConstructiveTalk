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

## 💡 ミニマルパターン（最小工数実装）

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