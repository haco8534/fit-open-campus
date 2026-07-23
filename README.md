# 福岡工業大学オープンキャンパス 高校生参加型トークセッションWebアプリ

Canvaスライドの表示・リアクション・流れるコメント・テーマ投票・質問を統合した参加型Webアプリ。

- **/display** — 会場スクリーンに映すメインモニター画面（1920×1080想定）
- **/admin** — 登壇者用の操作画面
- **/join/open-campus-2026** — 高校生がQRコードから開くスマホ画面

技術スタック：Next.js (App Router) / TypeScript / Tailwind CSS / Framer Motion / Firebase Realtime Database / Firebase Anonymous Auth / Vercel

## セットアップ

### 1. Firebase プロジェクトの準備

1. [Firebaseコンソール](https://console.firebase.google.com/)でプロジェクトを作成
2. **Realtime Database** を作成（ロケーションは asia-southeast1 など）
3. **Authentication > ログイン方法** で「匿名」を有効化
4. プロジェクトの設定からWebアプリを追加し、構成値を取得

### 2. 環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` にFirebaseの構成値を記入する。

### 3. セキュリティルールのデプロイ

`database.rules.json` をRealtime Databaseの「ルール」タブに貼り付けて公開する
（または `firebase deploy --only database`）。

### 4. 管理者の登録

管理者権限は Realtime Database の `admins/{uid}: true` 許可リストで管理している。

1. アプリを起動して `/admin` を開く
2. 画面上部に表示される「あなたのUID」をコピー
3. Realtime Database に手動で以下を追加

```json
{
  "admins": {
    "コピーしたUID": true
  }
}
```

⚠ 匿名認証のUIDは**ブラウザのサイトデータを消すと変わる**ので、本番当日に使う端末・ブラウザで登録すること。

### 5. 起動

```bash
npm install
npm run dev
```

## スライド画像の差し替え

現在は開発用プレースホルダーSVGが入っている。本番前に：

1. Canvaの全8ページを **1920×1080のPNGまたはWebP** で書き出す
2. `public/slides/slide-01.webp` 〜 `slide-08.webp` として配置
3. [src/config/slides.ts](src/config/slides.ts) の `image` パスを `.svg` → `.webp` に変更

スライド内の動画は `public/videos/` に配置し、`slides.ts` の `video` 設定（0〜1の比率で位置指定）を有効化する。自動再生には `muted: true` が必須。

## 当日の操作

### 管理者画面（/admin）

| キー | 動作 |
|---|---|
| ← / → | スライド移動（参加者画面のモードも自動で切り替わる） |
| P | 投票開始 / 終了 |
| C | コメント受付 ON/OFF |
| R | リアクション受付 ON/OFF |
| Esc | 参加型表示の緊急停止 / 再開 |

- スライド7（トークテーマ）に移動 →「投票開始」→ 参加者のスマホに投票画面が自動表示
- 「投票終了」で最多票のテーマが自動選択される（同票の場合は一覧のテーマをクリックして手動決定）
- 投票終了後「参加者画面モード」で「座談会」を押すと参加者画面がリアクション・コメントUIに戻り、選ばれたテーマが上部に表示される
- 質問一覧から「画面に表示」でメインモニターに質問カードを表示できる

### 通信障害時のフォールバック

- メインモニター画面（/display）は **←→キーでローカル操作**できる（Firebase切断中も表示継続）
- 管理者がスライドを変更すると自動的にリアルタイム同期に復帰する
- 予備としてCanva版 / PDF版スライドをローカルPCに保存しておくこと

## 制限・モデレーション

- コメント：30文字以内、5秒に1回、URL・メール・電話番号・NGワード・同文連投を拒否
- リアクション：1秒に1回
- 質問：80文字以内、10秒に1回
- 投票：1匿名ユーザー1票（投票中は変更可）
- 管理者からコメント全削除・端末ブロックが可能
- クライアント側制限に加えて `database.rules.json` でサーバー側でも文字数・種類・本人性を検証

NGワードは [src/lib/moderation.ts](src/lib/moderation.ts) の `NG_WORDS` に追加する。

## Vercelへのデプロイ

1. GitHubにpushしてVercelでインポート
2. 環境変数（`.env.local` と同じ内容）をVercelのプロジェクト設定に登録
3. デプロイ後のURLを `NEXT_PUBLIC_BASE_URL` に設定するとQRコードが本番URLになる

## ディレクトリ構成

```
src/
  app/
    display/        メインモニター画面
    admin/          管理者画面
    join/[sessionId]/  参加者画面
  components/
    slides/         スライド描画・動画オーバーレイ
    display/        コメント・リアクション・投票結果・QR等のレイヤー
    participant/    リアクション・コメント・投票・質問UI
    admin/          スライド・投票・コメント・質問・セッション操作
  hooks/            Firebase購読・送信フック
  lib/              Firebase初期化・セッション操作・モデレーション・レート制限
  config/           スライド定義・投票テーマ・リアクション種類
public/
  slides/           スライド画像（1920×1080）
  videos/           スライド内動画
database.rules.json Realtime Database セキュリティルール
```
