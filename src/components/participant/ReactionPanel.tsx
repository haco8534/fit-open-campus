"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS, type ReactionType } from "@/config/reactions";

type FloatingEmoji = {
  key: number;
  emoji: string;
  x: number;
};

type Props = {
  onSend: (type: ReactionType) => boolean;
  disabled?: boolean;
};

/** 参加者用リアクションボタン。押した瞬間に手元でも絵文字が浮かぶ */
export function ReactionPanel({ onSend, disabled = false }: Props) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const nextKeyRef = useRef(1);

  const handleTap = useCallback(
    (type: ReactionType, emoji: string) => {
      if (disabled) return;
      const sent = onSend(type);
      if (!sent) return;
      const key = nextKeyRef.current++;
      setFloating((prev) => [
        ...prev.slice(-8),
        { key, emoji, x: 20 + Math.random() * 60 },
      ]);
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.key !== key));
      }, 1200);
    },
    [onSend, disabled]
  );

  return (
    <div className="relative">
      {/* ローカルフィードバックの絵文字 */}
      <div className="pointer-events-none absolute -top-24 left-0 right-0 h-24 overflow-hidden">
        <AnimatePresence>
          {floating.map((f) => (
            <motion.span
              key={f.key}
              initial={{ opacity: 1, y: 40, scale: 0.8 }}
              animate={{ opacity: 0, y: -50, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute bottom-0 text-3xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {REACTIONS.map((r) => (
          <motion.button
            key={r.type}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleTap(r.type, r.emoji)}
            disabled={disabled}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:bg-sky-50 disabled:opacity-40"
          >
            <span className="text-3xl">{r.emoji}</span>
            <span className="text-[10px] font-medium text-slate-500">
              {r.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
