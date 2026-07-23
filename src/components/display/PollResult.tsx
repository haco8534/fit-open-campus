"use client";

import { motion } from "framer-motion";
import type { PollTally, PollStatus } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";

type Props = {
  tallies: PollTally[];
  totalVotes: number;
  status: PollStatus;
  selectedTheme: string | null;
};

/** メインモニターに表示する投票結果（棒グラフ） */
export function PollResult({ tallies, totalVotes, status, selectedTheme }: Props) {
  const max = Math.max(1, ...tallies.map((t) => t.votes));
  const winner = getPollOption(selectedTheme);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[9%]">
      <div className="w-[72%] rounded-2xl bg-black/75 p-[1.6vw] backdrop-blur-sm">
        <div className="mb-[1vw] flex items-baseline justify-between">
          <h2 className="font-bold text-white" style={{ fontSize: "1.8vw" }}>
            {status === "open"
              ? "📊 どの話を一番聞きたい？（投票受付中）"
              : winner
                ? "🏆 決定！"
                : "📊 投票結果"}
          </h2>
          <span className="text-white/70" style={{ fontSize: "1.2vw" }}>
            {totalVotes} 票
          </span>
        </div>

        {status === "closed" && winner ? (
          <div className="py-[1vw] text-center">
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-bold text-yellow-300"
              style={{ fontSize: "2.6vw" }}
            >
              {winner.label}
            </motion.p>
          </div>
        ) : (
          <div className="flex flex-col gap-[0.8vw]">
            {tallies.map((t, i) => (
              <div key={t.id} className="flex items-center gap-[1vw]">
                <span
                  className="w-[55%] truncate text-white"
                  style={{ fontSize: "1.4vw" }}
                >
                  {i + 1}. {t.label}
                </span>
                <div className="h-[1.8vw] flex-1 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                    animate={{ width: `${(t.votes / max) * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <span
                  className="w-[3.5vw] text-right font-bold text-white"
                  style={{ fontSize: "1.6vw" }}
                >
                  {t.votes}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
