"use client";

import { useEffect, useState } from "react";
import { getSlide, slides } from "@/config/slides";
import { DEFAULT_SESSION_ID } from "@/lib/session";
import { getPollOption } from "@/config/pollOptions";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { useConnectionCount } from "@/hooks/usePresence";
import { usePoll } from "@/hooks/usePoll";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { CommentLayer } from "@/components/display/CommentLayer";
import { ReactionLayer } from "@/components/display/ReactionLayer";
import { PollBoard } from "@/components/display/PollBoard";
import { QuestionOverlay } from "@/components/display/QuestionOverlay";
import { PersistentStatus } from "@/components/display/PersistentStatus";

export default function DisplayPage() {
  const sessionId = DEFAULT_SESSION_ID;
  const { uid } = useAnonymousAuth();
  const { state, connected, configured } = useSessionState(sessionId);
  const connectionCount = useConnectionCount(sessionId);
  const poll = usePoll(sessionId, uid);

  // スライドは管理者画面からの同期のみで動かす。
  // この画面でキーボード操作を受け付けると、会場PCで誤ってキーを押したときに
  // 管理者画面と表示がずれるため、キーハンドラは持たない。
  const slide = getSlide(state.currentSlide);

  // スライド画像の事前読み込み
  useEffect(() => {
    slides.forEach((s) => {
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
  // 投票画面を出す条件。参加者画面が投票モードなら、どのスライドで
  // 「投票開始」を押してもスクリーン側が必ず追従する（以前はスライド7でしか出なかった）。
  // 投票スライドを表示中も出しっぱなしにして、投票終了後の座談会中に
  // 選ばれたテーマを掲示し続けられるようにする。
  const isPollScreen = state.mode === "poll" || slide.mode === "poll";
  const themeLabel = getPollOption(state.selectedTheme)?.label ?? null;

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
      <div className="relative aspect-video max-h-screen w-full max-w-[177.78vh]">
        {/* 1-2. スライド画像・動画（投票スライドは専用画面に差し替え） */}
        {isPollScreen ? (
          <PollBoard poll={poll} selectedTheme={state.selectedTheme} />
        ) : (
          <SlideRenderer slide={slide} />
        )}

        {/* 3. 質問カード */}
        {interactive && <QuestionOverlay question={state.featuredQuestion} />}

        {/* 4. 流れるコメント */}
        {showComments && <CommentLayer sessionId={sessionId} />}

        {/* 5. リアクション絵文字 */}
        {showReactions && <ReactionLayer sessionId={sessionId} />}

        {/* 6. 常設UI */}
        {configured && (
          <PersistentStatus
            joinUrl={joinUrl}
            showQr={slide.showQr !== false && state.sessionActive}
            connected={connected}
            connectionCount={connectionCount}
            themeLabel={themeLabel}
          />
        )}

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
