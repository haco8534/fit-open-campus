"use client";

import type { PollResultData } from "@/hooks/usePoll";

type Props = {
  poll: PollResultData;
};

/**
 * 投票の状況表示。操作ボタンは持たない。
 * 投票はスライド7に入った時点で自動的に開始（＆リセット）され、締め切らない。
 */
export function PollController({ poll }: Props) {
  const isOpen = poll.status === "open";
  const max = Math.max(1, ...poll.tallies.map((t) => t.votes));

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-bold text-slate-700">テーマ投票</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isOpen
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isOpen ? "受付中" : "停止中"}・{poll.totalVotes}票
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-400">
        スライド7に入ると自動で開始・リセットされます（締め切りはありません）
      </p>

      <div className="flex flex-col gap-1.5">
        {poll.tallies.map((t) => {
          const isLeader = poll.leaderId === t.id && poll.totalVotes > 0;
          return (
            <div
              key={t.id}
              className="relative overflow-hidden rounded-lg border border-slate-200 px-3 py-2"
            >
              <span
                className="absolute inset-y-0 left-0 bg-sky-100 transition-[width] duration-300"
                style={{ width: `${(t.votes / max) * 100}%` }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between gap-2 text-sm">
                <span className={`truncate ${isLeader ? "font-bold" : ""}`}>
                  {isLeader && "🔺 "}
                  {t.label}
                </span>
                <span className="shrink-0 font-bold tabular-nums text-slate-700">
                  {t.votes}票
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
