# リッチメニューテストシナリオ

## 1. 初期セットアップテスト

### 1.1 サーバー起動時のセットアップ
- [ ] サーバーが正常に起動すること
- [ ] リッチメニューが正常に作成されること
- [ ] メインメニューがデフォルトメニューとして設定されること

### 1.2 画像の確認
- [ ] メインメニュー画像が正しく表示されること
  - サイズ: 2500x1686px
  - レイアウト: 2x2グリッド
  - ボタン配置:
    - 会話を始める（💭）
    - お酒レベル設定（🍺）
    - 話題を変える（🔄）
    - ヘルプ（❓）

- [ ] 会話メニュー画像が正しく表示されること
  - サイズ: 2500x1686px
  - レイアウト: 1x3グリッド
  - ボタン配置:
    - 話を深める（🔍）
    - 話題を変える（🔄）
    - 会話を終える（✋）

## 2. メニュー切り替えテスト

### 2.1 会話開始時の切り替え
- [ ] 「会話を始める」ボタンタップ時に会話メニューに切り替わること
- [ ] 切り替え時にエラーが発生しないこと
- [ ] ユーザーに紐づくメニューが正しく更新されること

### 2.2 会話終了時の切り替え
- [ ] 「会話を終える」ボタンタップ時にメインメニューに切り替わること
- [ ] 切り替え時にエラーが発生しないこと
- [ ] ユーザーに紐づくメニューが正しく更新されること

## 3. エラーケーステスト

### 3.1 ネットワークエラー
- [ ] 画像アップロード時のネットワークエラーが適切に処理されること
- [ ] メニュー切り替え時のネットワークエラーが適切に処理されること
- [ ] エラー発生時に適切なログが出力されること

### 3.2 不正なリクエスト
- [ ] 存在しないメニューIDへの切り替え要求が適切に処理されること
- [ ] 不正なユーザーIDでの切り替え要求が適切に処理されること

## 4. パフォーマンステスト

### 4.1 レスポンス時間
- [ ] メニュー切り替えのレスポンス時間が3秒以内であること
- [ ] 複数ユーザーからの同時リクエストが適切に処理されること

### 4.2 リソース使用
- [ ] メモリ使用量が適正範囲内であること
- [ ] CPU使用率が適正範囲内であること

## テスト実行手順

1. サーバー起動
```bash
npm run dev
```

2. ngrokでローカルサーバーを公開
```bash
ngrok http 3000
```

3. LINE Developersコンソールでwebhook URLを更新

4. LINEアプリでボットとの対話を開始

5. テストシナリオに従って各機能を確認

## テスト結果記録

### 実行日時
- 開始: [日時を記入]
- 終了: [日時を記入]

### 結果サマリー
- 合格: [数を記入]
- 不合格: [数を記入]
- 未実行: [数を記入]

### 発見された問題
1. [問題の詳細を記入]
2. [問題の詳細を記入]

### 改善提案
1. [提案の詳細を記入]
2. [提案の詳細を記入] 