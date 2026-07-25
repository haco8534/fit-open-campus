"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS, type ReactionType } from "@/config/reactions";
import styles from "./participant.module.css";

type FloatingBubble = {
  key: number;
  emoji: string;
  x: number;
};

type Props = {
  onSend: (type: ReactionType) => boolean;
  disabled?: boolean;
  title?: string;
  compact?: boolean;
};

export function ReactionPanel({
  onSend,
  disabled = false,
  title = "リアクション",
  compact = false,
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
        { key, emoji, x: 12 + Math.random() * 76 },
      ]);
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.key !== key));
      }, 1200);
    },
    [onSend, disabled]
  );

  return (
    <section
      className={`${styles.contentCard} relative p-4`}
      aria-labelledby="reaction-title"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="reaction-title" className="text-sm font-semibold">
          {disabled ? "リアクションの受付を停止しています" : title}
        </h2>
        {!disabled && (
          <span className="shrink-0 text-xs text-slate-500">何度でもOK</span>
        )}
      </div>

      {/* 押したときに絵文字がふわっと上がる。カードの上にはみ出して表示する */}
      <div
        className="pointer-events-none absolute -top-16 left-0 right-0 h-16 overflow-hidden"
        aria-hidden="true"
      >
        <AnimatePresence>
          {floating.map((f) => (
            <motion.span
              key={f.key}
              initial={{ opacity: 0.9, y: 40, scale: 0.8 }}
              animate={{ opacity: 0, y: -8, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute bottom-0 text-2xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className={`grid grid-cols-6 ${compact ? "gap-1.5" : "gap-2"}`}>
        {REACTIONS.map((r, index) => (
          <button
            key={r.type}
            type="button"
            onClick={() => handleTap(r.type, r.emoji)}
            disabled={disabled}
            aria-label={`${r.label}とリアクションする`}
            className={`${styles.choice} ${styles.choiceMuted} ${
              index < 3 ? "col-span-2" : "col-span-3"
            } flex min-h-[68px] flex-col items-center justify-center gap-1 px-1.5 py-2`}
          >
            <span className="text-xl leading-none">{r.emoji}</span>
            <span className="text-xs leading-tight text-slate-600">
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
