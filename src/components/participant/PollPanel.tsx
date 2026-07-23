"use client";

import { motion } from "framer-motion";
import type { PollResultData } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";

type Props = {
  poll: PollResultData;
  selectedTheme: string | null;
};

const ACCENTS = [
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-green-500",
  "from-amber-400 to-orange-500",
  "from-fuchsia-400 to-purple-500",
];

/** 参加者用テーマ投票画面 */
export function PollPanel({ poll, selectedTheme }: Props) {
  const winner = getPollOption(selectedTheme);
  const closed = poll.status === "closed";

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white/95 p-4 shadow-lg">
      <h2 className="text-center text-lg font-black text-slate-800">
        {closed
          ? winner
            ? "🏆 テーマが決まりました！"
            : "投票は締め切られました"
          : "🗳️ どの話を一番聞きたい？"}
      </h2>

      {closed && winner && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-gradient-to-r from-yellow-300 to-amber-400 p-4 text-center"
        >
          <p className="text-xs font-bold text-amber-800">選ばれたテーマ</p>
          <p className="mt-1 text-lg font-black text-amber-950">{winner.label}</p>
        </motion.div>
      )}

      <div className="flex flex-col gap-2.5">
        {poll.tallies.map((t, i) => {
          const isMyVote = poll.myVote === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={closed ? undefined : { scale: 0.97 }}
              onClick={() => poll.vote(t.id)}
              disabled={closed}
              className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-colors ${
                isMyVote
                  ? "border-fuchsia-500 bg-fuchsia-50"
                  : "border-slate-200 bg-white"
              } ${closed ? "opacity-80" : "active:bg-slate-50"}`}
            >
              <div className="relative flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                    ACCENTS[i % ACCENTS.length]
                  } text-base font-black text-white`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 font-bold leading-tight text-slate-800">
                  {t.label}
                </span>
                {isMyVote && (
                  <span className="shrink-0 rounded-full bg-fuchsia-500 px-2 py-0.5 text-[11px] font-black text-white">
                    ✓ 投票中
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-xs font-medium text-slate-400">
        {closed
          ? "投票ありがとうございました！"
          : poll.myVote
            ? "タップで変更できるよ"
            : "1人1票・気軽にタップ！"}
      </p>
    </div>
  );
}
