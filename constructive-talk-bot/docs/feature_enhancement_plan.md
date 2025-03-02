# LINE Bot機能拡張計画

## 1. コンテキスト管理の実装

### 現状の課題
- 会話が一問一答形式に限定
- ユーザーの過去の発言や状態が保持されない
- 文脈を考慮した応答ができない

### 解決策：データベースを使用したコンテキスト管理

1. データベース設計
```typescript
// コンテキストモデル
interface ConversationContext {
  userId: string;          // LINEユーザーID
  sessionId: string;      // セッション識別子
  context: {
    lastMessage: string;  // 最後のメッセージ
    timestamp: Date;      // タイムスタンプ
    alcoholLevel: number; // お酒レベル
    mood: string;        // 現在の気分
    topic: string;       // 現在の話題
    customData: Record<string, any>; // その他のコンテキストデータ
  };
  expiresAt: Date;       // コンテキスト有効期限
}
```

2. 実装計画
```typescript
// コンテキスト管理サービス
class ContextManager {
  // コンテキストの取得
  async getContext(userId: string): Promise<ConversationContext | null> {
    // DBからコンテキストを取得
  }

  // コンテキストの更新
  async updateContext(userId: string, updates: Partial<ConversationContext>): Promise<void> {
    // DBのコンテキストを更新
  }

  // コンテキストの有効期限管理
  async cleanupExpiredContexts(): Promise<void> {
    // 期限切れのコンテキストを削除
  }
}
```

3. データベース選択
   - **候補1: MongoDB**
     - 柔軟なスキーマ
     - スケーラビリティ
     - ドキュメント指向
   - **候補2: Redis**
     - 高速なアクセス
     - 有効期限管理が容易
     - メモリ効率
   - **候補3: Vercel KV（推奨）**
     - Vercelプラットフォームとのネイティブ統合
     - Redisベースの高速なKVストア
     - デプロイメントと同じ環境での運用
     - 自動スケーリング
     - 組み込みの有効期限管理

4. コンテキスト管理の方針
   - 有効期限: 30分
   - 定期的なクリーンアップ
   - コンテキストの自動マージ

### Vercel KVを使用した実装例
```typescript
import { kv } from '@vercel/kv';

class VercelKVContextManager implements ContextManager {
  private readonly CONTEXT_PREFIX = 'context:';
  private readonly DEFAULT_EXPIRY = 1800; // 30分

  // コンテキストの取得
  async getContext(userId: string): Promise<ConversationContext | null> {
    const key = this.CONTEXT_PREFIX + userId;
    return await kv.get(key);
  }

  // コンテキストの更新
  async updateContext(userId: string, updates: Partial<ConversationContext>): Promise<void> {
    const key = this.CONTEXT_PREFIX + userId;
    const currentContext = await this.getContext(userId);
    const newContext = {
      ...currentContext,
      ...updates,
      timestamp: new Date(),
    };
    
    // 30分の有効期限付きで保存
    await kv.set(key, newContext, { ex: this.DEFAULT_EXPIRY });
  }

  // コンテキストの削除
  async deleteContext(userId: string): Promise<void> {
    const key = this.CONTEXT_PREFIX + userId;
    await kv.del(key);
  }
}

// 使用例
const contextManager = new VercelKVContextManager();

// Webhookハンドラーでの使用
app.post('/webhook', middleware(middlewareConfig), async (req: Request, res: Response) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(events.map(async (event) => {
      // ユーザーのコンテキストを取得
      const context = await contextManager.getContext(event.source.userId);
      
      // コンテキストを考慮したメッセージ処理
      const response = await handleEventWithContext(event, context);
      
      // コンテキストを更新
      await contextManager.updateContext(event.source.userId, {
        lastMessage: event.message.text,
        timestamp: new Date(event.timestamp)
      });
    }));
    res.status(200).end();
  } catch (err) {
    console.error('[Webhook] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### Vercel KVの利点
1. 簡単な設定
   ```bash
   # Vercel KVの追加
   vercel kv create
   
   # 環境変数の自動設定
   vercel env pull
   ```

2. 高いパフォーマンス
   - エッジロケーションでの低レイテンシー
   - 自動的なキャッシュ管理
   - スケーラブルな構成

3. 運用の簡素化
   - インフラ管理が不要
   - Vercelダッシュボードでの監視
   - 自動バックアップ

4. コスト効率
   - 使用量ベースの課金
   - 無料枠の提供
   - スケールに応じた料金体系

### 移行計画の更新
フェーズ1のスケジュールを以下のように修正：

1. Vercel KVのセットアップ（1日）
2. コンテキストマネージャーの実装（3日）
3. 有効期限管理の実装（2日）
4. テストとデバッグ（2日）

これにより、当初の2週間から1週間程度に短縮が可能です。

## 2. セッション管理の改善

### 現状の課題
- 全てのユーザーが同じフローを強制される
- カスタマイズされた体験ができない
- セッションの状態管理が不十分

### 解決策：リッチメニューとボタンテンプレートの活用

1. リッチメニューの設計
```typescript
interface RichMenuConfig {
  name: string;
  chatBarText: string;
  size: {
    width: 2500;
    height: 1686;
  };
  selected: boolean;
  areas: {
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    action: {
      type: string;
      label: string;
      data: string;
    };
  }[];
}

// リッチメニューの定義
const richMenus = {
  default: {
    // メインメニュー
    areas: [
      { label: '会話を始める', data: 'start_conversation' },
      { label: 'お酒レベル設定', data: 'set_alcohol_level' },
      { label: '話題を変える', data: 'change_topic' },
      { label: 'ヘルプ', data: 'help' }
    ]
  },
  conversation: {
    // 会話中のメニュー
    areas: [
      { label: '話を深める', data: 'deep_dive' },
      { label: '話題を変える', data: 'change_topic' },
      { label: '会話を終える', data: 'end_conversation' }
    ]
  }
};
```

2. ボタンテンプレートの活用
```typescript
// ボタンテンプレートの定義
const buttonTemplates = {
  alcoholLevel: {
    title: 'お酒レベルを教えてください',
    buttons: [
      { label: '🍺 ちょっと飲んだ', data: 'alcohol_1' },
      { label: '🍺🍺 まあまあ飲んだ', data: 'alcohol_2' },
      { label: '🍺🍺🍺 かなり飲んだ', data: 'alcohol_3' }
    ]
  },
  topic: {
    title: '話したい話題を選んでください',
    buttons: [
      { label: '仕事の話', data: 'topic_work' },
      { label: '趣味の話', data: 'topic_hobby' },
      { label: '恋愛の話', data: 'topic_romance' }
    ]
  }
};
```

3. 状態管理の実装
```typescript
interface UserState {
  currentMenu: 'default' | 'conversation';
  conversationPhase: 'initial' | 'ongoing' | 'ending';
  alcoholLevel: number;
  selectedTopic?: string;
}

class StateManager {
  async updateUserState(userId: string, state: Partial<UserState>): Promise<void> {
    // ユーザー状態の更新
  }

  async switchRichMenu(userId: string, menuType: keyof typeof richMenus): Promise<void> {
    // リッチメニューの切り替え
  }
}
```

## 3. セッションアーカイブ機能

### 目的
- セッションの履歴をユーザー管理可能な形式で保存
- コンテキスト切れを適切に通知
- 過去のコンテキストの再利用を可能に

### 実装計画

1. セッションアーカイバーの実装
```typescript
interface SessionArchive {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  messages: {
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
  }[];
  context: {
    alcoholLevel: number;
    mood: string;
    topic: string;
    customData: Record<string, any>;
  };
}

class SessionArchiver {
  // セッションのアーカイブを作成してユーザーに送信
  async archiveAndSendSession(userId: string, context: ConversationContext): Promise<void> {
    const archive = this.createArchive(context);
    const markdown = this.generateMarkdown(archive);
    
    // Markdownファイルをユーザーに送信
    await this.sendMarkdownToUser(userId, markdown, archive);
  }

  // アーカイブオブジェクトの作成
  private createArchive(context: ConversationContext): SessionArchive {
    return {
      sessionId: context.sessionId,
      userId: context.userId,
      startTime: new Date(context.context.timestamp),
      endTime: new Date(),
      messages: context.context.messages || [],
      context: {
        alcoholLevel: context.context.alcoholLevel,
        mood: context.context.mood,
        topic: context.context.topic,
        customData: context.context.customData
      }
    };
  }

  // Markdownの生成
  private generateMarkdown(archive: SessionArchive): string {
    return `# 会話セッション記録
<!-- セッション復元用メタデータ (このコメントは削除しないでください) -->
<!--
session_metadata:
  sessionId: ${archive.sessionId}
  startTime: ${archive.startTime.toISOString()}
  endTime: ${archive.endTime.toISOString()}
  context:
    alcoholLevel: ${archive.context.alcoholLevel}
    mood: ${archive.context.mood}
    topic: ${archive.context.topic}
-->

## 基本情報
- セッションID: ${archive.sessionId}
- 開始時刻: ${format(archive.startTime, 'yyyy-MM-dd HH:mm:ss')}
- 終了時刻: ${format(archive.endTime, 'yyyy-MM-dd HH:mm:ss')}

## コンテキスト情報
- お酒レベル: ${archive.context.alcoholLevel}
- 気分: ${archive.context.mood}
- 話題: ${archive.context.topic}

## 会話ログ
${archive.messages.map(msg => `
### ${msg.role === 'user' ? 'ユーザー' : 'ボット'} (${format(msg.timestamp, 'HH:mm:ss')})
${msg.content}
`).join('\n')}
`;
  }

  // ユーザーへのファイル送信とガイダンス
  private async sendMarkdownToUser(userId: string, markdown: string, archive: SessionArchive): Promise<void> {
    const fileName = `session-${format(archive.endTime, 'yyyyMMdd-HHmmss')}.md`;
    const duration = differenceInMinutes(archive.endTime, archive.startTime);

    // Markdownファイルの送信
    await client.pushMessage(userId, {
      type: 'flex',
      altText: 'セッション終了のお知らせ',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🕒 セッション終了',
              weight: 'bold',
              size: 'xl'
            },
            {
              type: 'text',
              text: `${duration}分間の会話を終了します。\n会話の記録をお送りしますので保存してください。`,
              wrap: true,
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              contents: [
                {
                  type: 'text',
                  text: '📝 会話の記録',
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: `・${archive.messages.length}件のメッセージ\n・話題: ${archive.context.topic}\n・気分: ${archive.context.mood}`,
                  size: 'sm',
                  margin: 'sm',
                  wrap: true
                }
              ]
            },
            {
              type: 'text',
              text: '💡 このファイルを送信することで、この会話のコンテキストを再開できます',
              size: 'sm',
              margin: 'lg',
              color: '#666666',
              wrap: true
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '新しい会話を始める',
                data: 'start_new_session'
              },
              style: 'primary'
            }
          ]
        }
      }
    });

    // Markdownファイルの送信
    await client.pushMessage(userId, {
      type: 'file',
      fileName,
      content: Buffer.from(markdown)
    });
  }
}

// コンテキストマネージャーの拡張
class EnhancedContextManager extends VercelKVContextManager {
  private archiver: SessionArchiver;

  constructor() {
    super();
    this.archiver = new SessionArchiver();
  }

  // コンテキストの取得時に有効期限をチェック
  async getContext(userId: string): Promise<ConversationContext | null> {
    const context = await super.getContext(userId);
    
    if (context && this.isExpired(context)) {
      // セッションをアーカイブしてユーザーに送信
      await this.archiver.archiveAndSendSession(userId, context);
      // コンテキストを削除
      await this.deleteContext(userId);
      return null;
    }
    
    return context;
  }

  // Markdownファイルからコンテキストを復元
  async restoreContextFromMarkdown(userId: string, markdown: string): Promise<ConversationContext | null> {
    const metadataMatch = markdown.match(/<!--\nsession_metadata:([\s\S]*?)-->/);
    if (!metadataMatch) return null;

    try {
      const metadata = yaml.parse(metadataMatch[1]);
      const context: ConversationContext = {
        userId,
        sessionId: metadata.sessionId,
        context: {
          ...metadata.context,
          timestamp: new Date(),
          messages: [] // 新しいメッセージ用の空配列
        },
        expiresAt: new Date(Date.now() + this.DEFAULT_EXPIRY * 1000)
      };

      // 新しいコンテキストとして保存
      await this.updateContext(userId, context);
      return context;
    } catch (err) {
      console.error('コンテキストの復元に失敗:', err);
      return null;
    }
  }

  private isExpired(context: ConversationContext): boolean {
    return new Date(context.expiresAt) <= new Date();
  }
}
```

### コンテキスト復元の使用例
```typescript
// Webhookハンドラーでの処理
app.post('/webhook', middleware(middlewareConfig), async (req: Request, res: Response) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'file') {
        // Markdownファイルが送信された場合
        if (event.message.fileName.endsWith('.md')) {
          const content = await downloadFile(event.message.id);
          const context = await contextManager.restoreContextFromMarkdown(event.source.userId, content);
          
          if (context) {
            await client.replyMessage(event.replyToken, {
              type: 'text',
              text: '🔄 前回の会話コンテキストを復元しました！\n続きの会話を始めましょう。'
            });
            return;
          }
        }
      }
      // 通常のメッセージ処理
      // ...
    }));
    res.status(200).end();
  } catch (err) {
    console.error('[Webhook] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### 利点
1. ストレージ効率
   - サーバー側でのストレージ使用を最小限に
   - ユーザー側で必要な履歴のみを保持

2. ユーザーコントロール
   - 会話履歴の完全な管理権限
   - 必要な時に任意のコンテキストを復元可能

3. プライバシー
   - センシティブな会話内容をサーバーに永続化しない
   - ユーザー側での適切な管理が可能

### 実装スケジュール
1. アーカイブ機能の実装（2日）
   - Markdown生成機能
   - ファイル送信機能
   - メタデータ埋め込み

2. コンテキスト復元機能の実装（2日）
   - Markdownパーサー
   - メタデータ抽出
   - コンテキスト再構築

3. テストとデバッグ（2日）
   - ファイル送受信テスト
   - コンテキスト復元テスト
   - エラーハンドリング

## 実装スケジュール

### フェーズ1: コンテキスト管理（2週間）
1. データベース選定と設定
2. コンテキストマネージャーの実装
3. 有効期限管理の実装
4. テストとデバッグ

### フェーズ2: UI実装（2週間）
1. リッチメニューのデザイン
2. ボタンテンプレートの実装
3. 状態管理システムの実装
4. UIフローのテスト

### フェーズ3: 統合とテスト（1週間）
1. コンテキストと状態管理の統合
2. エンドツーエンドテスト
3. パフォーマンステスト
4. ユーザーフィードバック収集

## 期待される効果

1. ユーザー体験の向上
   - 文脈を考慮した自然な会話
   - カスタマイズされた対話フロー
   - 直感的な操作性

2. 運用効率の改善
   - コンテキスト管理の自動化
   - セッション管理の効率化
   - エラー処理の改善

3. 拡張性の確保
   - 新機能の追加が容易
   - データ分析の基盤整備
   - A/Bテストの実施可能性 