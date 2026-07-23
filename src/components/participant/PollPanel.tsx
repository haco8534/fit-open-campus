"use client";

import { motion } from "framer-motion";
import type { PollResultData } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";

type Props = {
  poll: PollResultData;
  selectedTheme: string | null;
};

/** 参加者用テーマ投票画面 */
export function PollPanel({ poll, selectedTheme }: Props) {
  const winner = getPollOption(selectedTheme);
  const closed = poll.status === "closed";

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center text-lg font-bold text-slate-800">
        {closed
          ? winner
            ? "テーマが決まりました！"
            : "投票は締め切られました"
          : "どの話を一番聞きたい？"}
      </h2>

      {closed && winner && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-yellow-100 p-4 text-center"
        >
          <p className="text-sm text-yellow-700">🏆 選ばれたテーマ</p>
          <p className="mt-1 text-lg font-bold text-yellow-900">
            {winner.label}
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-2">
        {poll.tallies.map((t, i) => {
          const isMyVote = poll.myVote === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={closed ? undefined : { scale: 0.97 }}
              onClick={() => poll.vote(t.id)}
              disabled={closed}
              className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                isMyVote
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-white"
              } ${closed ? "opacity-70" : "active:bg-sky-50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800">
                  {i + 1}. {t.label}
                </span>
                {isMyVote && (
                  <span className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-xs font-bold text-white">
                    投票済み
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        {closed
          ? "たくさんの投票ありがとうございました！"
          : poll.myVote
            ? "投票中はタップで変更できます"
            : "1人1票・あとから変更できます"}
      </p>
    </div>
  );
}
