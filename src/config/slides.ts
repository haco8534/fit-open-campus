// スライド定義
// Canvaから書き出した 1920x1080 の画像を /public/slides/ に置き、image のパスを差し替える。
//
// qr.position はスライド画像の余白を実際に見て決めている。
// 画像を差し替えたら、QRが図版や文字に被っていないか /display で必ず確認すること。

/**
 * 参加者画面のフェーズ。表示中のスライドがそのまま参加者画面を決める。
 * waiting は開始前の待機画面（参加者は何も送れない）。
 */
export type SlideMode =
  | "waiting"
  | "reaction"
  | "poll"
  | "talk"
  | "question"
  | "ending";

export type SlideVideo = {
  src: string;
  /** 1920x1080 を基準とした 0〜1 の比率 */
  left: number;
  top: number;
  width: number;
  height: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

/** QRコードを置く隅。スライドの中身と重ならない位置を選ぶ */
export type QrPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type SlideQr = {
  /** 既定は bottom-right */
  position?: QrPosition;
  /** large は導入スライド用の大きい表示 */
  size?: "normal" | "large";
};

export type SlideConfig = {
  id: number;
  /** スライド画像。waiting / poll のようにアプリ側で描画する画面は持たない */
  image?: string;
  mode: SlideMode;
  title?: string;
  video?: SlideVideo;
  showQr?: boolean;
  /** QRの位置・大きさ。スライド画像の余白に合わせて指定する */
  qr?: SlideQr;
  showComments?: boolean;
  showReactions?: boolean;
};

export const slides: SlideConfig[] = [
  {
    // 開始前の待機画面。画像ではなく WaitingBoard を描画する
    id: 1,
    mode: "waiting",
    title: "開始前（参加案内）",
    showQr: false, // 画面中央に大きく出すので隅のQRは出さない
    showComments: false,
    showReactions: false,
  },
  {
    id: 2,
    image: "/slides/1.png",
    mode: "reaction",
    title: "タイトル",
    showQr: true,
    // 左側が大きく空いているので、導入として大きめに出す
    qr: { position: "top-left", size: "large" },
    showComments: true,
    showReactions: true,
  },
  {
    id: 3,
    image: "/slides/2.png",
    mode: "reaction",
    title: "登壇者の自己紹介",
    showQr: true,
    // 右上（登壇者名の上）が空いている
    qr: { position: "top-right" },
    showComments: true,
    showReactions: true,
  },
  {
    id: 4,
    image: "/slides/3.png",
    mode: "reaction",
    title: "解決したい課題",
    showQr: true,
    // 右上（図版の右・FITロゴの上）が空いている
    qr: { position: "top-right" },
    showComments: true,
    showReactions: true,
  },
  {
    id: 5,
    image: "/slides/4.png",
    mode: "reaction",
    title: "学習支援アプリ「ピークる」",
    showQr: true,
    // 左上が完全に空いている
    qr: { position: "top-left" },
    showComments: true,
    showReactions: true,
    // デモ動画を重ねる場合は /public/videos/ に置いて以下を有効化する
    // video: {
    //   src: "/videos/peakuru-demo.mp4",
    //   left: 0.55,
    //   top: 0.18,
    //   width: 0.36,
    //   height: 0.62,
    //   autoplay: true,
    //   loop: true,
    //   muted: true,
    // },
  },
  {
    id: 6,
    image: "/slides/5.png",
    mode: "reaction",
    title: "ピークるとは？（BEFORE / AFTER）",
    showQr: true,
    // 右上（見出しの右・キラキラ装飾の上）が空いている
    qr: { position: "top-right" },
    showComments: true,
    showReactions: true,
  },
  {
    id: 7,
    image: "/slides/6.png",
    mode: "reaction",
    title: "ハッカソンで得たもの",
    showQr: true,
    // 右上（EXPERIENCEの上）が空いている
    qr: { position: "top-right" },
    showComments: true,
    showReactions: true,
  },
  {
    id: 8,
    image: "/slides/7.png",
    mode: "poll",
    title: "トークテーマ投票",
    // 投票画面（PollBoard）は四隅すべてを票数・見出しで使っているため、
    // どこに置いても数字か文字に被る。投票中は参加済みの人しか操作しないので出さない。
    showQr: false,
    showComments: false,
    showReactions: false,
  },
  {
    id: 9,
    image: "/slides/8.png",
    mode: "ending",
    title: "エンディング・質問受付",
    showQr: true,
    // 右上（タイトルの右）が空いている。既存のQRと離す
    qr: { position: "top-right" },
    showComments: true,
    showReactions: true,
  },
];

export function getSlide(id: number): SlideConfig {
  return slides.find((s) => s.id === id) ?? slides[0];
}

export const FIRST_SLIDE_ID = slides[0].id;
export const LAST_SLIDE_ID = slides[slides.length - 1].id;
