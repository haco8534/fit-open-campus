"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactionStream, type ReactionEvent } from "@/hooks/useReactions";
import { getReaction } from "@/config/reactions";

const MAX_BUBBLES = 12;
/** この時間内に同種のリアクションが来たらまとめて「× n」表示にする */
const MERGE_WINDOW_MS = 1800;
const BUBBLE_LIFETIME_MS = 3200;

type Bubble = {
  key: number;
  emoji: string;
  count: number;
  x: number;
  bornAt: number;
  type: string;
};

/**
 * 参加者のリアクション絵文字を浮かび上がらせるレイヤー。
 * 表示を止めるときは親側でアンマウントする。
 */
export function ReactionLayer({ sessionId }: { sessionId: string }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextKeyRef = useRef(1);

  const handleReaction = useCallback((event: ReactionEvent) => {
    const def = getReaction(event.type);
    if (!def) return;
    setBubbles((prev) => {
      const now = Date.now();
      const alive = prev.filter((b) => now - b.bornAt < BUBBLE_LIFETIME_MS);
      const mergeIndex = alive.findIndex(
        (b) => b.type === event.type && now - b.bornAt < MERGE_WINDOW_MS
      );
      if (mergeIndex >= 0) {
        const copy = [...alive];
        copy[mergeIndex] = {
          ...copy[mergeIndex],
          count: copy[mergeIndex].count + 1,
        };
        return copy;
      }
      if (alive.length >= MAX_BUBBLES) return alive;
      return [
        ...alive,
        {
          key: nextKeyRef.current++,
          emoji: def.emoji,
          count: 1,
          x: 8 + Math.random() * 84,
          bornAt: now,
          type: event.type,
        },
      ];
    });
  }, []);

  useReactionStream(sessionId, true, handleReaction);

  // 寿命が切れたバブルを定期的に掃除する
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setBubbles((prev) => {
        const alive = prev.filter((b) => now - b.bornAt < BUBBLE_LIFETIME_MS);
        return alive.length === prev.length ? prev : alive;
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -220, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: BUBBLE_LIFETIME_MS / 1000, ease: "easeOut" }}
            className="absolute bottom-[10%] flex items-center gap-1"
            style={{ left: `${b.x}%` }}
          >
            <span style={{ fontSize: "3.2vw" }}>{b.emoji}</span>
            {b.count > 1 && (
              <span
                className="font-bold text-white"
                style={{
                  fontSize: "1.8vw",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                × {b.count}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
