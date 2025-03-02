# ユーザー体験フロー

## 1. 基本的な会話フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant B as LINE Bot
    participant C as コンテキストマネージャー

    U->>B: 会話を開始
    B->>C: コンテキスト確認
    C-->>B: コンテキストなし
    B->>U: 初期メニュー表示
    Note over U,B: リッチメニュー:<br/>・会話を始める<br/>・お酒レベル設定<br/>・ヘルプ

    U->>B: お酒レベル選択
    B->>C: コンテキスト更新
    B->>U: 話題選択メニュー表示
    U->>B: 話題選択
    B->>C: コンテキスト更新
    B->>U: 選択された話題で会話開始
```

## 2. コンテキスト期限切れと保存

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant B as LINE Bot
    participant C as コンテキストマネージャー

    Note over U,B: 30分間の会話後...
    C->>C: コンテキスト期限切れ検知
    C->>B: アーカイブ処理要求
    B->>U: セッション終了通知
    B->>U: Markdownファイル送信
    Note over U: ファイル内容:<br/>・セッション情報<br/>・会話ログ<br/>・コンテキストデータ
```

## 3. コンテキスト復元フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant B as LINE Bot
    participant C as コンテキストマネージャー

    U->>B: 保存したMDファイルを送信
    B->>C: メタデータ抽出
    C->>C: コンテキスト復元
    B->>U: 復元完了通知
    B->>U: 前回の話題と状態を表示
    Note over U,B: 会話を以前の<br/>コンテキストで継続
```

## 4. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> 初期状態
    初期状態 --> お酒レベル設定: 設定選択
    お酒レベル設定 --> 話題選択: レベル確定
    話題選択 --> 会話中: 話題確定
    
    state 会話中 {
        [*] --> 通常会話
        通常会話 --> 話題変更: 話題変更選択
        話題変更 --> 通常会話: 新話題選択
        通常会話 --> 深掘り: 深掘り選択
        深掘り --> 通常会話: 話題戻り
    }
    
    会話中 --> セッション終了: 30分経過
    会話中 --> セッション終了: 終了選択
    セッション終了 --> [*]: MDファイル保存
```

## 5. ユーザーインタラクション詳細

```mermaid
flowchart TD
    A[会話開始] --> B{初回?}
    B -->|Yes| C[お酒レベル設定]
    B -->|No| D[前回のコンテキスト確認]
    
    C --> E[話題選択]
    D -->|有効期限内| F[会話再開]
    D -->|期限切れ| G[MDファイル送信]
    
    E --> H[会話進行]
    F --> H
    
    H --> I{30分経過?}
    I -->|Yes| J[セッション終了処理]
    I -->|No| H
    
    J --> K[終了通知]
    K --> L[MDファイル生成]
    L --> M[ファイル送信]
    M --> N[新規セッション案内]
    
    subgraph 会話中の操作
    H --> O[話題変更]
    H --> P[深掘り]
    H --> Q[終了]
    O --> H
    P --> H
    Q --> J
    end
```

## 6. エラーハンドリングフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant B as LINE Bot
    participant C as コンテキストマネージャー

    U->>B: 無効なMDファイル送信
    B->>C: コンテキスト復元試行
    C-->>B: エラー発生
    B->>U: エラー通知
    B->>U: 新規セッション開始案内

    Note over U,B: その他のエラーパターン
    U->>B: 不正なコマンド
    B->>U: ヘルプメッセージ表示
    U->>B: タイムアウト
    B->>U: 再接続案内
```

## 主要な状態とトリガー

1. **初期状態**
   - トリガー: ボットとの初回対話
   - 表示: 初期リッチメニュー
   - オプション: お酒レベル設定、ヘルプ

2. **お酒レベル設定状態**
   - トリガー: レベル設定選択
   - 表示: お酒レベル選択ボタン
   - オプション: 3段階のレベル

3. **話題選択状態**
   - トリガー: お酒レベル確定
   - 表示: 話題選択メニュー
   - オプション: 仕事、趣味、恋愛など

4. **会話進行状態**
   - トリガー: 話題確定
   - 表示: 会話用リッチメニュー
   - オプション: 深掘り、話題変更、終了

5. **セッション終了状態**
   - トリガー: 30分経過または終了選択
   - 表示: 終了通知とファイル
   - オプション: 新規セッション開始、ファイル保存

## ユーザー体験のポイント

1. **シームレスな状態遷移**
   - 直感的なメニュー操作
   - コンテキストに応じた適切な選択肢
   - スムーズな話題の展開

2. **コンテキスト管理の透明性**
   - セッション終了の明確な通知
   - 会話履歴の可視化
   - 簡単なコンテキスト復元

3. **エラー時の親切な誘導**
   - 明確なエラーメッセージ
   - 復旧手順の提示
   - 代替オプションの提案

## コンテキストの詳細構造

```mermaid
classDiagram
    class ConversationContext {
        +string userId
        +string sessionId
        +Context context
        +Date expiresAt
    }
    
    class Context {
        +string lastMessage
        +Date timestamp
        +number alcoholLevel
        +string mood
        +string topic
        +Message[] messages
        +CustomData customData
    }
    
    class Message {
        +string role
        +string content
        +Date timestamp
        +Sentiment sentiment
    }
    
    class CustomData {
        +string[] recentTopics
        +number interactionCount
        +object aiAnalysis
    }

    ConversationContext --> Context
    Context --> Message
    Context --> CustomData
```

### コンテキストに含まれる情報

1. **基本情報**
   - ユーザーID
   - セッションID
   - 有効期限

2. **会話履歴**
   - 全ての会話メッセージ
   - 各メッセージの送信時刻
   - 発言者（ユーザー/ボット）
   - 感情分析結果

3. **状態情報**
   - 現在のお酒レベル
   - ユーザーの気分
   - 現在の話題
   - 最後のメッセージ

4. **分析データ**
   - 話題の変遷履歴
   - インタラクション回数
   - AIによる会話分析結果

### コンテキストの保存例（MDファイル）

```markdown
# 会話セッション記録
<!-- セッション復元用メタデータ -->
<!--
session_metadata:
  sessionId: "session_20240224_123456"
  startTime: "2024-02-24T12:34:56Z"
  endTime: "2024-02-24T13:04:56Z"
  context:
    alcoholLevel: 2
    mood: "楽しい"
    topic: "仕事"
    messages:
      - role: "user"
        content: "今日は大変な一日だった"
        timestamp: "2024-02-24T12:34:56Z"
        sentiment: "negative"
      - role: "bot"
        content: "お疲れ様でした。仕事で何かありましたか？"
        timestamp: "2024-02-24T12:34:57Z"
      - role: "user"
        content: "プロジェクトの締め切りが厳しくて..."
        timestamp: "2024-02-24T12:35:10Z"
        sentiment: "stressed"
    customData:
      recentTopics: ["仕事", "ストレス", "締め切り"]
      interactionCount: 15
      aiAnalysis:
        userConcerns: ["仕事のプレッシャー", "時間管理"]
        recommendedTopics: ["リラックス方法", "タイムマネジメント"]
-->

## 基本情報
- セッションID: session_20240224_123456
- 開始時刻: 2024-02-24 12:34:56
- 終了時刻: 2024-02-24 13:04:56

## コンテキスト情報
- お酒レベル: 🍺🍺 まあまあ飲んだ
- 気分: 楽しい
- 話題: 仕事

## 会話ログ
### ユーザー (12:34:56)
今日は大変な一日だった

### ボット (12:34:57)
お疲れ様でした。仕事で何かありましたか？

### ユーザー (12:35:10)
プロジェクトの締め切りが厳しくて...

[... 以降の会話ログ ...]
``` 