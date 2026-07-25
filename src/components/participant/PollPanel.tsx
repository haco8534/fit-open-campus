"use client";

import type { PollResultData } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";
import styles from "./participant.module.css";

type Props = {
  poll: PollResultData;
  selectedTheme: string | null;
};

export function PollPanel({ poll, selectedTheme }: Props) {
  const winner = getPollOption(selectedTheme);
  const closed = poll.status === "closed";

  return (
    <section
      className={`${styles.contentCard} p-4`}
      aria-labelledby="poll-title"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="poll-title" className="text-sm font-semibold">
          {closed
            ? winner
              ? "次のテーマが決まりました"
              : "投票を締め切りました"
            : "聞きたいテーマを選ぶ"}
        </h2>
        <span className="shrink-0 text-xs text-slate-500">
          {closed ? `${poll.totalVotes}票` : "1人1票"}
        </span>
      </div>

      {closed && winner && (
        <div className={`${styles.softCard} mt-3 p-3`}>
          <p className="text-xs text-slate-500">選ばれたテーマ</p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            {winner.label}
          </p>
        </div>
      )}

      <div
        className="mt-3 flex flex-col gap-2"
        role="radiogroup"
        aria-label="トークテーマ"
      >
        {poll.tallies.map((t) => {
          const isMyVote = poll.myVote === t.id;
          const percentage =
            poll.totalVotes > 0
              ? Math.round((t.votes / poll.totalVotes) * 100)
              : 0;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => poll.vote(t.id)}
              disabled={closed}
              role="radio"
              aria-checked={isMyVote}
              className={`${styles.choice} ${
                isMyVote ? styles.choiceSelected : ""
              } relative overflow-hidden p-3 text-left`}
            >
              {closed && (
                <span
                  className={`${styles.choiceBar} absolute inset-y-0 left-0`}
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isMyVote
                      ? "border-(--accent) bg-(--accent)"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {isMyVote && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="flex-1 text-sm leading-snug">{t.label}</span>
                {closed && (
                  <span className="shrink-0 text-xs text-slate-500">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        {closed
          ? "投票ありがとうございました"
          : poll.myVote
            ? "締め切りまでは何度でも変更できます"
            : "聞きたいテーマをタップしてください"}
      </p>
    </section>
  );
}
