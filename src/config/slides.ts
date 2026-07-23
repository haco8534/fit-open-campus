// スライド定義
// Canvaから書き出した 1920x1080 の画像を /public/slides/ に置き、image のパスを差し替える。
// 開発用にプレースホルダーSVG (slide-01.svg など) を同梱している。
// 本番では slide-01.webp などに変更する。

export type SlideMode = "reaction" | "poll" | "talk" | "question" | "ending";

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

export type SlideConfig = {
  id: number;
  image: string;
  mode: SlideMode;
  title?: string;
  video?: SlideVideo;
  showQr?: boolean;
  showComments?: boolean;
  showReactions?: boolean;
};

export const slides: SlideConfig[] = [
  {
    id: 1,
    image: "/slides/1.png",
    mode: "reaction",
    title: "タイトル",
    showQr: true,
    showComments: true,
    showReactions: true,
  },
  {
    id: 2,
    image: "/slides/2.png",
    mode: "reaction",
    title: "登壇者の自己紹介",
    showQr: true,
    showComments: true,
    showReactions: true,
  },
  {
    id: 3,
    image: "/slides/3.png",
    mode: "reaction",
    title: "チーム紹介・ハッカソン",
    showQr: true,
    showComments: true,
    showReactions: true,
  },
  {
    id: 4,
    image: "/slides/4.png",
    mode: "reaction",
    title: "学習支援アプリ「ピークる」",
    showQr: true,
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
    id: 5,
    image: "/slides/5.png",
    mode: "reaction",
    title: "ハッカソンで得た経験",
    showQr: true,
    showComments: true,
    showReactions: true,
  },
  {
    id: 6,
    image: "/slides/6.png",
    mode: "reaction",
    title: "受賞・外部発表などの活動実績",
    showQr: true,
    showComments: true,
    showReactions: true,
  },
  {
    id: 7,
    image: "/slides/7.png",
    mode: "poll",
    title: "トークテーマ投票",
    showQr: true,
    showComments: false,
    showReactions: false,
  },
  {
    id: 8,
    image: "/slides/8.png",
    mode: "ending",
    title: "エンディング・質問受付",
    showQr: true,
    showComments: true,
    showReactions: true,
  },
];

export function getSlide(id: number): SlideConfig {
  return slides.find((s) => s.id === id) ?? slides[0];
}

export const FIRST_SLIDE_ID = slides[0].id;
export const LAST_SLIDE_ID = slides[slides.length - 1].id;
