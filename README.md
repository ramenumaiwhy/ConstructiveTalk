# ConstructiveTalk (建設的会話を促すアプリ)

創造的な瞬間を捉え、評価懸念を軽減することに焦点を当てた、LLMとの対話を通じてアイデアを引き出すWebアプリケーションです。

## 🎯 MVP（最小実行製品）の範囲

### 基本機能
1. **LLMとの対話機能**
   - Vercel AI SDKを使用したストリーミング対話
   - コンテキストを考慮したプロンプト生成
   - 会話の継続性の維持

2. **コンテキスト記録**
   - アルコールレベル（0-5段階）
   - ムード（選択式）
   - 場所（自由入力）
   - 同日コンテキストの再利用オプション

3. **会話ログ管理**
   - エッジストレージでの永続化
   - 重要なポイントのマークとタグ付け
   - 5分間隔での自動保存機能

## 🚀 開発ガイド

### 開発環境のセットアップ

#### 必要条件
- Node.js 18.0.0以上
- pnpm 8.0.0以上
- Git
- VSCode（推奨エディタ）

#### 初期セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/ramenumaiwhy/constructive-talk.git
cd constructive-talk

# 依存パッケージのインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
```

#### 環境変数の設定
`.env.local`に以下を設定：
- OPENAI_API_KEY
- NEXT_PUBLIC_APP_URL
- DATABASE_URL

### 開発環境の構築

#### フロントエンド
```bash
# TypeScript設定
pnpm add -D typescript @types/node @types/react

# UIライブラリ
pnpm add @radix-ui/react-* @shadcn/ui

# スタイリング
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### バックエンド
```bash
# Honoセットアップ
pnpm add hono @hono/node-server

# データベース
pnpm add @prisma/client
pnpm add -D prisma
```

#### AI/LLM
```bash
# Vercel AI SDK
pnpm add ai openai

# LangChain
pnpm add langchain
```

### コーディング規約

1. **基本ルール**
   - ESLint/Prettier設定に従う
   - アトミックデザインベースのコンポーネント構築
   - 型安全性重視のTypeScript使用

2. **コミット規約**
   - Conventional Commits形式
   - PRテンプレート使用
   - コードレビューガイドライン遵守

3. **ドキュメント**
   - JSDoc形式のコメント
   - 変更履歴の記録
   - README.mdの定期的更新

### デプロイメント

```bash
# Vercelへのデプロイ
vercel

# 本番環境へのデプロイ
vercel --prod
```

## 🌟 主な機能

- LLMとの対話を通じたアイデア創出
- コンテキスト情報のトラッキング
- Markdown形式での会話ログ保存
- 会話内容の構造化分析
- ムードやコンテキスト情報のトラッキング
- 使い慣れたインターフェースのLINE Bot連携
- Markdown形式でのエクスポート機能
- GitHubと連携したデータバックアップ

## 💭 追加検討事項

### 機能面での検討ポイント
1. **会話の質向上機能**
   - 建設的な会話を促すプロンプトの自動生成
   - 会話が停滞した際のトピック提案機能
   - 議論の深堀りを促す質問の自動生成

2. **コンテキスト管理の拡張**
   - 場所、時間帯、参加者の関係性などの詳細なメタデータ記録
   - 過去の会話履歴との関連付け機能
   - タグやカテゴリによる整理機能

3. **アウトプット機能の強化**
   - 会話のサマリー自動生成
   - キーポイントの抽出と可視化
   - アイデアマップの自動生成

## 🛠 技術スタック

技術スタックの詳細については[TECHSTACK.md](TECH_STACK.md)を参照してください。

## 🔧 トラブルシューティング

### よくある問題と解決方法
1. **依存関係の問題**
   ```bash
   pnpm clean && pnpm install
   ```

2. **ビルドエラー**
   ```bash
   pnpm clean:build && pnpm build
   ```

3. **環境変数の問題**
   - .env.localの設定確認
   - 必要な環境変数の存在確認

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## 👥 開発者

- 初期開発 - [ramenumaiwhy]

## 🙏 謝辞

- Google - Gemini APIの提供
- Vercel - Vercel AI SDKの提供
- Cloudflare - エッジコンピューティング基盤の提供
- Honoチーム - 高速なAPIルーティングフレームワークの提供 