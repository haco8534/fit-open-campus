"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactionStream, type ReactionEvent } from "@/hooks/useReactions";
import { getReaction } from "@/config/reactions";

/** 同じ種類のリアクションを同時に表示する上限 */
const MAX_PER_TYPE = 6;
/** 全種類あわせた同時表示の上限（描画負荷対策） */
const MAX_TOTAL = 28;
const BUBBLE_LIFETIME_MS = 3600;

type Bubble = {
  key: number;
  emoji: string;
  type: string;
  x: number;
  drift: number;
  size: number;
  bornAt: number;
};

/**
 * 参加者のリアクションを「シャボン玉に包まれた絵文字」として浮かべるレイヤー。
 * まとめ表示（×n）はせず、押された数だけ1個ずつ表示する。
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
      // 同種は最大6個まで。全体上限にも達していたら無視する
      const sameType = alive.filter((b) => b.type === event.type).length;
      if (sameType >= MAX_PER_TYPE || alive.length >= MAX_TOTAL) return alive;
      return [
        ...alive,
        {
          key: nextKeyRef.current++,
          emoji: def.emoji,
          type: event.type,
          x: 6 + Math.random() * 88,
          drift: (Math.random() - 0.5) * 8,
          size: 3 + Math.random() * 1.2,
          bornAt: now,
        },
      ];
    });
  }, []);

  useReactionStream(sessionId, true, handleReaction);

  // 寿命切れのバブルを定期的に掃除する
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setBubbles((prev) => {
        const alive = prev.filter((b) => now - b.bornAt < BUBBLE_LIFETIME_MS);
        return alive.length === prev.length ? prev : alive;
      });
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 20, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -260,
              x: b.drift * 12,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: BUBBLE_LIFETIME_MS / 1000, ease: "easeOut" }}
            className="absolute bottom-[8%] flex items-center justify-center"
            style={{ left: `${b.x}%`, width: `${b.size}vw`, height: `${b.size}vw` }}
          >
            {/* シャボン玉 */}
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 18%, rgba(186,230,253,0.22) 45%, rgba(129,140,248,0.18) 70%, rgba(255,255,255,0.05) 100%)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow:
                  "inset 0 0 1.2vw rgba(255,255,255,0.5), 0 0 0.8vw rgba(255,255,255,0.25)",
                backdropFilter: "blur(1px)",
              }}
            />
            {/* ハイライト（光の反射） */}
            <span
              className="absolute rounded-full bg-white/80"
              style={{
                width: "22%",
                height: "22%",
                left: "24%",
                top: "20%",
                filter: "blur(0.5px)",
              }}
            />
            {/* 絵文字 */}
            <span
              className="relative"
              style={{ fontSize: `${b.size * 0.52}vw`, lineHeight: 1 }}
            >
              {b.emoji}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
