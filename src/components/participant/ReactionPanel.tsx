"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS, type ReactionType } from "@/config/reactions";

// リアクションごとの色（押したときの華やかさ用）
const COLORS: Record<ReactionType, string> = {
  like: "from-sky-400 to-blue-500",
  laugh: "from-amber-300 to-orange-500",
  hmm: "from-violet-400 to-purple-500",
  more: "from-emerald-400 to-teal-500",
  wow: "from-pink-400 to-rose-500",
};

type FloatingBubble = {
  key: number;
  emoji: string;
  x: number;
};

type Props = {
  onSend: (type: ReactionType) => boolean;
  disabled?: boolean;
  title?: string;
};

/** 参加者用リアクションボタン。押すとシャボン玉が手元でも浮かぶ */
export function ReactionPanel({
  onSend,
  disabled = false,
  title = "リアクションで盛り上げよう！",
}: Props) {
  const [floating, setFloating] = useState<FloatingBubble[]>([]);
  const nextKeyRef = useRef(1);

  const handleTap = useCallback(
    (type: ReactionType, emoji: string) => {
      if (disabled) return;
      const sent = onSend(type);
      if (!sent) return;
      const key = nextKeyRef.current++;
      setFloating((prev) => [
        ...prev.slice(-10),
        { key, emoji, x: 8 + Math.random() * 84 },
      ]);
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.key !== key));
      }, 1300);
    },
    [onSend, disabled]
  );

  return (
    <div className="relative rounded-3xl bg-white/95 p-4 shadow-lg">
      <p className="mb-3 text-center text-sm font-black text-slate-700">
        {disabled ? "リアクションは一時停止中です" : title}
      </p>

      {/* 手元フィードバックのシャボン玉 */}
      <div className="pointer-events-none absolute -top-28 left-0 right-0 h-28 overflow-hidden">
        <AnimatePresence>
          {floating.map((f) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 1, y: 60, scale: 0.5 }}
              animate={{ opacity: 0, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute bottom-0 flex h-14 w-14 items-center justify-center"
              style={{ left: `${f.x}%` }}
            >
              <span
                className="absolute inset-0 rounded-full border border-white/70"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.35) 45%, rgba(129,140,248,0.2) 100%)",
                  boxShadow: "inset 0 0 10px rgba(255,255,255,0.6)",
                }}
              />
              <span className="relative text-2xl">{f.emoji}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {REACTIONS.map((r) => (
          <motion.button
            key={r.type}
            whileTap={{ scale: 0.82 }}
            onClick={() => handleTap(r.type, r.emoji)}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b ${
              COLORS[r.type]
            } py-3 shadow-md transition disabled:from-slate-200 disabled:to-slate-300 disabled:opacity-60`}
          >
            <span className="text-3xl drop-shadow-sm">{r.emoji}</span>
            <span className="text-[10px] font-bold text-white/95">{r.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
