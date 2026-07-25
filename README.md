# 福岡工業大学オープンキャンパス 高校生参加型トークセッションWebアプリ

Canvaスライドの表示・リアクション・流れるコメント・テーマ投票・質問を統合した参加型Webアプリ。

- **/display** — 会場スクリーンに映すメインモニター画面（1920×1080想定）
- **/admin** — 登壇者用の操作画面（トップページにリンクは無い。URLを直接入力して開く／`noindex`）
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

> ⚠ **これは必須。** Firebaseコンソールが提示する「テストモード」ルール
> （`".read": "now < ..."` のようなもの）のまま公開すると、**誰でも認証なしで
> DBを読み書きでき、会場スクリーンに任意の文字列を表示できる**。
> リポジトリのルールが実際にデプロイされているかは、次のコマンドで確認できる。
>
> ```bash
> # Permission denied が返れば正しい。JSONが返ってきたら未デプロイ
> curl "https://<プロジェクト>-default-rtdb.firebaseio.com/sessions/open-campus-2026/state.json"
> ```

### 4. 管理者パスワードの設定

`/admin` はパスワード（IDなし）で入る。パスワードは Realtime Database の
`adminPasscode` に置き、**ルール側で照合する**。

Realtime Database に次の1件を追加する（**最初の1回だけ**）。

```json
{
  "adminPasscode": "任意のパスワード"
}
```

仕組み：

1. `/admin` で入力されたパスワードが `adminAuth/{匿名UID}` に書き込まれる
2. ルールが `adminAuth/{uid} === adminPasscode` を判定し、一致した端末だけが
   `state` / `poll` / `comments` などに書き込める
3. 一致しなければ管理操作はすべてサーバー側で拒否される

パスワードはアプリのバンドルに含まれないため、配信されたJSを読んでも分からない。
端末ごとのUID登録は不要で、どの端末でもパスワードだけで入れる。

パスワードを変えたいときは `adminPasscode` の値を書き換えるだけでよい。
`adminPasscode` は `.read: false` なので、アプリからは読み出せない。

> 旧方式の `admins/{uid}: true` 許可リストも予備として残してある。
> `adminPasscode` の設定を忘れた場合でも、登録済みのUIDからは操作できる。

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

パスワードを入れてログインすると操作画面が開く。ログイン状態はタブを閉じるまで保持される。

| キー | 動作 |
|---|---|
| ← / → | スライド移動（参加者画面のモードも合わせて切り替わる） |
| P | 投票開始 / 終了 |
| C | コメント受付 ON/OFF |
| R | リアクション受付 ON/OFF |
| Esc | 参加型表示の緊急停止 / 再開（確認ダイアログあり） |

Ctrl / Cmd / Alt を押しながらのキー入力は無視される（Ctrl+R での再読み込み、Ctrl+P での印刷が
ショートカットとして誤爆しないようにするため）。

**参加者画面のモードはスライドで決まる**

| スライド | 参加者画面 |
|---|---|
| 1〜6 | リアクション＋コメント |
| 7 | 投票（投票開始〜終了のあいだはスライドを動かしても投票画面のまま） |
| 8 | お礼＋質問フォーム＋リアクション＋コメント |

- スライド7（トークテーマ）に移動 →「投票開始」→ 参加者のスマホに投票画面が自動表示
- 「投票終了」で最多票のテーマが自動選択される（同票の場合は一覧のテーマをクリックして手動決定）
- 投票終了後は選ばれたテーマがスクリーン上部と参加者画面に表示される
- 質問一覧から「画面に表示」でメインモニターに質問カードを表示できる

### 通信障害時のフォールバック

- メインモニター画面（/display）は**キーボード操作を受け付けない**。
  会場PCで誤ってキーを押しても管理者画面と表示がずれないようにするため、
  スライドは管理者画面からの同期のみで動く
- Firebaseが切断されても、直前のスライドはそのまま表示され続ける
  （復帰すると自動で同期する）
- 通信が復旧しない場合に備えて、予備のCanva版 / PDF版スライドを
  ローカルPCに保存しておくこと

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
