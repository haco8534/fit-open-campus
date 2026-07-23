"use client";

import { motion } from "framer-motion";
import type { PollResultData } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";
import styles from "./participant.module.css";

type Props = {
  poll: PollResultData;
  selectedTheme: string | null;
};

const OPTION_COLORS = [
  "bg-[#b9e4ff]",
  "bg-[#c8f4d2]",
  "bg-[#ffe090]",
  "bg-[#e2d2ff]",
];

export function PollPanel({ poll, selectedTheme }: Props) {
  const winner = getPollOption(selectedTheme);
  const closed = poll.status === "closed";

  return (
    <section
      className={`${styles.contentCard} flex flex-col gap-3 p-4`}
      aria-labelledby="poll-title"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className={`${styles.sectionLabel} text-[9px] font-black`}>VOTE</span>
          <h2 id="poll-title" className="mt-2 text-xl font-black tracking-tight">
            {closed
              ? winner
                ? "次のトークが決まりました"
                : "投票を締め切りました"
              : "どの話をいちばん聞きたい？"}
          </h2>
        </div>
        <span className="shrink-0 text-[10px] font-black text-slate-400">
          {closed ? `${poll.totalVotes}票` : "1人1票"}
        </span>
      </div>

      {closed && winner && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${styles.softCard} relative overflow-hidden p-4`}
        >
          <span
            className="absolute -right-3 -top-7 text-7xl font-black text-white/60"
            aria-hidden="true"
          >
            ✓
          </span>
          <p className="relative text-[9px] font-black tracking-[0.16em] text-[var(--accent)]">
            SELECTED TOPIC
          </p>
          <p className="relative mt-1 pr-8 text-base font-black leading-snug">
            {winner.label}
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="トークテーマ">
        {poll.tallies.map((t, index) => {
          const isMyVote = poll.myVote === t.id;
          const percentage =
            poll.totalVotes > 0
              ? Math.round((t.votes / poll.totalVotes) * 100)
              : 0;

          return (
            <motion.button
              key={t.id}
              type="button"
              whileTap={closed ? undefined : { scale: 0.98 }}
              onClick={() => poll.vote(t.id)}
              disabled={closed}
              role="radio"
              aria-checked={isMyVote}
              className={`relative min-h-[70px] overflow-hidden rounded-[14px_14px_5px_14px] border-2 p-3 text-left transition ${
                isMyVote
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[3px_3px_0_var(--ink)]"
                  : "border-[var(--ink)] bg-[#fffdf7]"
              } ${closed ? "cursor-default" : "hover:-translate-y-0.5 active:translate-y-0"}`}
            >
              {closed && (
                <span
                  className="absolute inset-y-0 left-0 bg-[var(--accent-soft)] transition-[width]"
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px_10px_3px_10px] border-2 border-[var(--ink)] ${
                    OPTION_COLORS[index % OPTION_COLORS.length]
                  } text-sm font-black`}
                >
                  0{index + 1}
                </span>
                <span className="flex-1 text-sm font-black leading-snug">
                  {t.label}
                </span>
                {isMyVote ? (
                  <span className="shrink-0 rounded-full bg-[var(--accent)] px-2 py-1 text-[9px] font-black text-white">
                    選択中
                  </span>
                ) : (
                  closed && (
                    <span className="shrink-0 text-xs font-black">
                      {percentage}%
                    </span>
                  )
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-[10px] font-black text-slate-400">
        {closed
          ? "投票ありがとうございました"
          : poll.myVote
            ? "締め切りまでは何度でも変更できます"
            : "選んだテーマをタップしてください"}
      </p>
    </section>
  );
}
