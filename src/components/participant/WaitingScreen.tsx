"use client";

import { motion } from "framer-motion";

type Props = {
  title?: string;
  message?: string;
};

/** セッション停止中や接続待ちの画面 */
export function WaitingScreen({
  title = "まもなく始まります",
  message = "スクリーンにご注目ください",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/95 py-14 text-center shadow-lg">
      <motion.span
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="text-5xl"
      >
        🎤
      </motion.span>
      <h2 className="text-lg font-black text-slate-700">{title}</h2>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
