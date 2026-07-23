"use client";

import { motion } from "framer-motion";
import styles from "./participant.module.css";

type Props = {
  title?: string;
  message?: string;
};

export function WaitingScreen({
  title = "まもなく始まります",
  message = "スクリーンにご注目ください",
}: Props) {
  return (
    <section
      className={`${styles.contentCard} flex min-h-[430px] flex-col justify-between overflow-hidden p-5`}
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <span className={`${styles.sectionLabel} text-[9px] font-black`}>STAND BY</span>
        <span className="text-[10px] font-black tracking-[0.12em] text-slate-400">
          FIT OC 2026
        </span>
      </div>

      <div className="py-8">
        <motion.div
          animate={{ rotate: [0, 4, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
          className={`${styles.phaseStamp} mb-6 flex h-20 w-20 items-center justify-center rounded-[22px_22px_7px_22px] text-5xl font-black`}
          aria-hidden="true"
        >
          …
        </motion.div>
        <h2 className="max-w-[18rem] text-[30px] font-black leading-tight tracking-[-0.04em]">
          {title}
        </h2>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">{message}</p>
      </div>

      <div className={`${styles.softCard} flex items-center gap-3 p-3`}>
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-40" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent)]" />
        </span>
        <p className="text-xs font-black">画面は進行に合わせて自動で切り替わります</p>
      </div>
    </section>
  );
}
