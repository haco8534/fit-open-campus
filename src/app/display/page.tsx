"use client";

import { useEffect, useState } from "react";
import { getSlide, slides } from "@/config/slides";
import { DEFAULT_SESSION_ID } from "@/lib/session";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { usePoll } from "@/hooks/usePoll";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { CommentLayer } from "@/components/display/CommentLayer";
import { ReactionLayer } from "@/components/display/ReactionLayer";
import { PollBoard } from "@/components/display/PollBoard";
import { WaitingBoard } from "@/components/display/WaitingBoard";
import { QuestionOverlay } from "@/components/display/QuestionOverlay";
import { JoinQr } from "@/components/display/JoinQr";

export default function DisplayPage() {
  const sessionId = DEFAULT_SESSION_ID;
  const { uid } = useAnonymousAuth();
  const { state, connected, configured } = useSessionState(sessionId);
  const poll = usePoll(sessionId, uid);

  // スライドは管理者画面からの同期のみで動かす。
  // この画面でキーボード操作を受け付けると、会場PCで誤ってキーを押したときに
  // 管理者画面と表示がずれるため、キーハンドラは持たない。
  const slide = getSlide(state.currentSlide);

  // スライド画像の事前読み込み（画像を持たない画面はスキップ）
  useEffect(() => {
    slides.forEach((s) => {
      if (!s.image) return;
      const img = new window.Image();
      img.src = s.image;
    });
  }, []);

  // QRのURLは window に依存するため、マウント後にだけ設定する
  // （サーバー描画とクライアント初期描画を一致させ、ハイドレーション不一致を防ぐ）
  const [joinUrl, setJoinUrl] = useState("");
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
    // マウント後にクライアント専用の値を入れる（ハイドレーション不一致の回避）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJoinUrl(`${base}/join/${sessionId}`);
  }, [sessionId]);

  const interactive = configured && state.sessionActive;
  const showComments =
    interactive && state.commentsEnabled && slide.showComments !== false;
  const showReactions =
    interactive && state.reactionsEnabled && slide.showReactions !== false;
  const isPollScreen = state.mode === "poll" || slide.mode === "poll";
  const isWaitingScreen = slide.mode === "waiting";
  const showQr = configured && slide.showQr !== false && state.sessionActive;

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
      <div className="relative aspect-video max-h-screen w-full max-w-[177.78vh]">
        {/* 1-2. スライド画像・動画（待機・投票は専用画面に差し替え） */}
        {isWaitingScreen ? (
          <WaitingBoard joinUrl={joinUrl} />
        ) : isPollScreen ? (
          <PollBoard poll={poll} />
        ) : (
          <SlideRenderer slide={slide} />
        )}

        {/* 3. 質問カード */}
        {interactive && <QuestionOverlay question={state.featuredQuestion} />}

        {/* 4. 流れるコメント */}
        {showComments && <CommentLayer sessionId={sessionId} />}

        {/* 5. リアクション絵文字 */}
        {showReactions && <ReactionLayer sessionId={sessionId} />}

        {/* 6. 参加用QR */}
        {showQr && joinUrl && <JoinQr joinUrl={joinUrl} qr={slide.qr} />}

        {/* 7. 通信エラー表示 */}
        {configured && !connected && (
          <div className="absolute inset-x-0 top-0 z-[60] flex justify-center">
            <div className="mt-[1%] rounded-full bg-red-600/90 px-[1.5vw] py-[0.5vw] text-white" style={{ fontSize: "1.1vw" }}>
              ⚠ 通信が切断されています（再接続を試みています）
            </div>
          </div>
        )}
        {!configured && (
          <div className="absolute inset-x-0 top-0 z-[60] flex justify-center">
            <div className="mt-[1%] rounded-full bg-amber-600/90 px-[1.5vw] py-[0.5vw] text-white" style={{ fontSize: "1.1vw" }}>
              Firebase未設定：スライドのみ表示しています
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
