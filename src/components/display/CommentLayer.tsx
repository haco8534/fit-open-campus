"use client";

import { useCallback, useRef, useState } from "react";
import { useCommentStream, type CommentRecord } from "@/hooks/useComments";

const LANE_COUNT = 6;
const MAX_ACTIVE = 10;
/** 同一レーンに次のコメントを流すまでの最短間隔（画面に入りきる時間） */
const LANE_COOLDOWN_MS = 2400;

type FlowingComment = {
  id: string;
  text: string;
  lane: number;
  duration: number;
};

/**
 * ニコニコ動画式に右から左へコメントを流すレイヤー。
 * 表示を止めるときは親側でアンマウントする（状態も自動的にリセットされる）。
 */
export function CommentLayer({ sessionId }: { sessionId: string }) {
  const [flowing, setFlowing] = useState<FlowingComment[]>([]);
  const queueRef = useRef<CommentRecord[]>([]);
  const laneBusyUntilRef = useRef<number[]>(Array(LANE_COUNT).fill(0));
  const activeCountRef = useRef(0);

  const spawn = useCallback((comment: CommentRecord) => {
    const now = Date.now();
    const lanes = laneBusyUntilRef.current;
    let lane = 0;
    let earliest = Infinity;
    lanes.forEach((busyUntil, i) => {
      if (busyUntil < earliest) {
        earliest = busyUntil;
        lane = i;
      }
    });
    lanes[lane] = Math.max(now, lanes[lane]) + LANE_COOLDOWN_MS;
    const duration = 8 + Math.min(4, comment.text.length * 0.12);
    activeCountRef.current += 1;
    setFlowing((prev) => [
      ...prev,
      { id: comment.id, text: comment.text, lane, duration },
    ]);
  }, []);

  const handleIncoming = useCallback(
    (comment: CommentRecord) => {
      if (activeCountRef.current >= MAX_ACTIVE) {
        queueRef.current.push(comment);
        // キューが溜まりすぎたら古いものから捨てる
        if (queueRef.current.length > 30) queueRef.current.shift();
      } else {
        spawn(comment);
      }
    },
    [spawn]
  );

  useCommentStream(sessionId, true, handleIncoming);

  const handleEnd = useCallback(
    (id: string) => {
      activeCountRef.current = Math.max(0, activeCountRef.current - 1);
      setFlowing((prev) => prev.filter((c) => c.id !== id));
      const next = queueRef.current.shift();
      if (next) spawn(next);
    },
    [spawn]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {flowing.map((c) => (
        <div
          key={c.id}
          className="absolute left-full whitespace-nowrap font-bold text-white"
          style={{
            top: `${6 + c.lane * 9}%`,
            fontSize: "2.4vw",
            textShadow:
              "2px 2px 4px rgba(0,0,0,0.85), -1px -1px 2px rgba(0,0,0,0.6)",
            animation: `comment-flow ${c.duration}s linear forwards`,
            willChange: "transform",
          }}
          onAnimationEnd={() => handleEnd(c.id)}
        >
          {c.text}
        </div>
      ))}
    </div>
  );
}
