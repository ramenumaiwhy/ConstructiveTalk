# 開発手順書

このドキュメントは、ConstructiveTalkアプリの開発手順を詳細に説明します。以下のステップに従って、開発環境をセットアップし、プロジェクトを開始してください。

## 開発環境のセットアップ

### 1. 必要なツールのインストール
- Node.js 18.0.0以上
- pnpm 8.0.0以上
- Git
- VSCode（推奨エディタ）

### 2. リポジトリのセットアップ
```bash
# リポジトリのクローン
git clone https://github.com/ramenumaiwhy/constructive-talk.git
cd constructive-talk

# 依存パッケージのインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
```

### 3. 環境変数の設定
`.env.local`に以下の設定を追加：
- OPENAI_API_KEY
- NEXT_PUBLIC_APP_URL
- DATABASE_URL
- その他必要な環境変数

### 4. 開発環境の構築

#### フロントエンド開発環境
```bash
# TypeScriptの設定
pnpm add -D typescript @types/node @types/react

# UIライブラリのインストール
pnpm add @radix-ui/react-* @shadcn/ui

# スタイリングのセットアップ
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### バックエンド開発環境
```bash
# Honoのセットアップ
pnpm add hono @hono/node-server

# データベース関連
pnpm add @prisma/client
pnpm add -D prisma
```

#### AI/LLM開発環境
```bash
# Vercel AI SDKのセットアップ
pnpm add ai openai

# LangChainのセットアップ
pnpm add langchain
```

## フェーズ別開発手順

### フェーズ1（MVP）: 基本機能実装

1. **プロジェクト基盤の構築**
   - Next.js + TypeScriptプロジェクトの初期設定
   - TailwindCSSの設定
   - ESLint/Prettierの設定
   - GitHubリポジトリの設定

2. **APIルートの実装**
   - Honoを使用したAPIルートの設定
   - エラーハンドリングの実装
   - ミドルウェアの設定

3. **LLM対話機能の実装**
   - Vercel AI SDKの設定
   - ストリーミングレスポンスの実装
   - プロンプト管理システムの構築

4. **データ永続化の実装**
   - エッジストレージ（KV/D1）の設定
   - データモデルの設計
   - CRUD操作の実装

5. **UI/UXの実装**
   - コンポーネントの設計と実装
   - レスポンシブデザインの実装
   - アクセシビリティ対応

### フェーズ2: 機能拡張

1. **パフォーマンス最適化**
   - ストリーミングレスポンスの最適化
   - キャッシュ戦略の実装
   - バンドルサイズの最適化

2. **テスト自動化**
   - Vitestによるユニットテストの実装
   - Playwrightによるe2eテストの実装
   - CI/CDパイプラインの構築

3. **データ永続化の改善**
   - バックアップシステムの実装
   - データマイグレーション戦略の策定
   - パフォーマンスモニタリングの実装

### フェーズ3: 高度な機能実装

1. **AI機能の拡張**
   - 複数LLMの統合
   - プロンプトチェーンの最適化
   - コンテキスト管理の改善

2. **セキュリティ強化**
   - 認証システムの実装
   - データ暗号化の実装
   - セキュリティ監査の実施

3. **分析機能の実装**
   - アナリティクスの統合
   - ダッシュボードの実装
   - レポート機能の実装

## デプロイメントガイド

### 1. Vercel/Cloudflareへのデプロイ
```bash
# Vercelへのデプロイ
vercel

# 本番環境へのデプロイ
vercel --prod
```

### 2. CI/CDの設定
- GitHub Actionsの設定
- 自動テストの設定
- 自動デプロイの設定

## コーディング規約

### 1. 基本ルール
- ESLintとPrettierの設定に従う
- コンポーネントはアトミックデザインに基づいて構築
- 型安全性を重視したTypeScriptの使用

### 2. コミット規約
- Conventional Commitsに従う
- プルリクエストテンプレートの使用
- コードレビューのガイドライン

### 3. ドキュメント規約
- JSDoc形式でのコメント
- README.mdの更新
- 変更履歴の記録

## トラブルシューティング

### 1. 一般的な問題
- 依存関係の問題
- ビルドエラー
- デプロイメントの問題

### 2. 環境別の問題
- 開発環境
- ステージング環境
- 本番環境

## サポートとリソース

- GitHub Issues
- ドキュメント
- コミュニティサポート 