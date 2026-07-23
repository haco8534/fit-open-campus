"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS, type ReactionType } from "@/config/reactions";
import styles from "./participant.module.css";

const COLORS: Record<ReactionType, string> = {
  like: "bg-[#b9e4ff]",
  laugh: "bg-[#ffe090]",
  hmm: "bg-[#e2d2ff]",
  more: "bg-[#c8f4d2]",
  wow: "bg-[#ffc7dc]",
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
  compact?: boolean;
};

export function ReactionPanel({
  onSend,
  disabled = false,
  title = "いまの気持ちをタップ",
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
        { key, emoji, x: 8 + Math.random() * 84 },
      ]);
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.key !== key));
      }, 1300);
    },
    [onSend, disabled]
  );

  return (
    <section className={`${styles.contentCard} relative p-4`} aria-labelledby="reaction-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <span className={`${styles.sectionLabel} text-[9px] font-black`}>REACTION</span>
          <h2 id="reaction-title" className="mt-2 text-lg font-black tracking-tight">
            {disabled ? "いまは受付を停止しています" : title}
          </h2>
        </div>
        {!disabled && (
          <span className="shrink-0 text-[10px] font-black text-slate-400">
            何度でもOK
          </span>
        )}
      </div>

      <div
        className="pointer-events-none absolute -top-24 left-0 right-0 z-20 h-28 overflow-hidden"
        aria-hidden="true"
      >
        <AnimatePresence>
          {floating.map((f) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 1, y: 60, scale: 0.5 }}
              animate={{ opacity: 0, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute bottom-0 flex h-14 w-14 items-center justify-center rounded-[18px_18px_5px_18px] border-2 border-[var(--ink)] bg-[var(--signal)] text-2xl shadow-[3px_3px_0_var(--ink)]"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={`grid grid-cols-6 ${compact ? "gap-1.5" : "gap-2"}`}>
        {REACTIONS.map((r, index) => (
          <motion.button
            key={r.type}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => handleTap(r.type, r.emoji)}
            disabled={disabled}
            aria-label={`${r.label}とリアクションする`}
            className={`${
              index < 3 ? "col-span-2" : "col-span-3"
            } flex min-h-[82px] flex-col items-center justify-center gap-1 rounded-[14px_14px_5px_14px] border-2 border-[var(--ink)] ${
              COLORS[r.type]
            } px-1.5 py-2 text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:translate-none disabled:bg-stone-200 disabled:opacity-55 disabled:shadow-none`}
          >
            <span className="text-2xl leading-none">{r.emoji}</span>
            <span className="text-[10px] font-black leading-tight">{r.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
