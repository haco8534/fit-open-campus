"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FIRST_SLIDE_ID,
  LAST_SLIDE_ID,
  getSlide,
  slides,
} from "@/config/slides";
import { DEFAULT_SESSION_ID } from "@/lib/session";
import { getPollOption } from "@/config/pollOptions";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { useConnectionCount } from "@/hooks/usePresence";
import { usePoll } from "@/hooks/usePoll";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { CommentLayer } from "@/components/display/CommentLayer";
import { ReactionLayer } from "@/components/display/ReactionLayer";
import { PollResult } from "@/components/display/PollResult";
import { QuestionOverlay } from "@/components/display/QuestionOverlay";
import { PersistentStatus } from "@/components/display/PersistentStatus";

export default function DisplayPage() {
  const sessionId = DEFAULT_SESSION_ID;
  const uid = useAnonymousAuth();
  const { state, connected, configured } = useSessionState(sessionId);
  const connectionCount = useConnectionCount(sessionId);
  const poll = usePoll(sessionId, uid);

  // 通信障害時のローカルフォールバック（左右キーで手動操作）。
  // 操作時点のリモートスライド番号を base として保持し、
  // 管理者がスライドを変えたら（base が変わったら）自動的に同期へ戻る。
  const [localOverride, setLocalOverride] = useState<{
    slide: number;
    base: number;
  } | null>(null);

  const remoteSlide = state.currentSlide;
  const effectiveSlide =
    localOverride && localOverride.base === remoteSlide
      ? localOverride.slide
      : remoteSlide;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setLocalOverride({
          slide: Math.min(LAST_SLIDE_ID, effectiveSlide + 1),
          base: remoteSlide,
        });
      } else if (e.key === "ArrowLeft") {
        setLocalOverride({
          slide: Math.max(FIRST_SLIDE_ID, effectiveSlide - 1),
          base: remoteSlide,
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [effectiveSlide, remoteSlide]);

  const slide = getSlide(effectiveSlide);

  // スライド画像の事前読み込み
  useEffect(() => {
    slides.forEach((s) => {
      const img = new window.Image();
      img.src = s.image;
    });
  }, []);

  const joinUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
    return `${base}/join/${sessionId}`;
  }, [sessionId]);

  const interactive = configured && state.sessionActive;
  const showComments =
    interactive && state.commentsEnabled && slide.showComments !== false;
  const showReactions =
    interactive && state.reactionsEnabled && slide.showReactions !== false;
  const showPoll =
    interactive && (state.mode === "poll" || slide.mode === "poll");
  const themeLabel = getPollOption(state.selectedTheme)?.label ?? null;

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
      <div className="relative aspect-video max-h-screen w-full max-w-[177.78vh]">
        {/* 1-2. スライド画像・動画 */}
        <SlideRenderer slide={slide} />

        {/* 3. 投票結果 */}
        {showPoll && (
          <PollResult
            tallies={poll.tallies}
            totalVotes={poll.totalVotes}
            status={poll.status}
            selectedTheme={state.selectedTheme}
          />
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
              ⚠ 通信が切断されています（←→キーでスライド操作できます）
            </div>
          </div>
        )}
        {!configured && (
          <div className="absolute inset-x-0 top-0 z-[60] flex justify-center">
            <div className="mt-[1%] rounded-full bg-amber-600/90 px-[1.5vw] py-[0.5vw] text-white" style={{ fontSize: "1.1vw" }}>
              Firebase未設定：ローカルスライドモード（←→キーで操作）
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
