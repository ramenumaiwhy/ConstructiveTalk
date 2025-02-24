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
