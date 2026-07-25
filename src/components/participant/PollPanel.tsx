"use client";

import type { PollResultData } from "@/hooks/usePoll";
import styles from "./participant.module.css";

type Props = {
  poll: PollResultData;
};

/**
 * 参加者の投票画面。
 * 投票は締め切らないので、いつでも選び直せる。
 * 集計結果は会場スクリーンを見てもらうため、ここには出さない。
 */
export function PollPanel({ poll }: Props) {
  return (
    <section className={`${styles.contentCard} p-4`} aria-labelledby="poll-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="poll-title" className="text-sm font-semibold">
          聞きたいテーマを選ぶ
        </h2>
        <span className="shrink-0 text-xs text-slate-500">1人1票</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        結果は会場のスクリーンにリアルタイムで出ます
      </p>

      <div
        className="mt-3 flex flex-col gap-2"
        role="radiogroup"
        aria-label="トークテーマ"
      >
        {poll.tallies.map((t) => {
          const isMyVote = poll.myVote === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => poll.vote(t.id)}
              role="radio"
              aria-checked={isMyVote}
              className={`${styles.choice} ${
                isMyVote ? styles.choiceSelected : ""
              } p-3 text-left`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isMyVote
                      ? "border-(--accent) bg-(--accent)"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {isMyVote && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className="flex-1 text-sm leading-snug">{t.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        {poll.myVote
          ? "気が変わったら選び直してOK"
          : "聞きたいテーマをタップしてください"}
      </p>
    </section>
  );
}
