"use client";

import type { PollResultData } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";

type Props = {
  poll: PollResultData;
  selectedTheme: string | null;
  onStart: () => void;
  onEnd: () => void;
  onReset: () => void;
  onPickTheme: (themeId: string) => void;
};

export function PollController({
  poll,
  selectedTheme,
  onStart,
  onEnd,
  onReset,
  onPickTheme,
}: Props) {
  const isOpen = poll.status === "open";
  const winner = getPollOption(selectedTheme);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
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

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          onClick={onStart}
          disabled={isOpen}
          className="rounded-xl bg-green-600 py-4 font-bold text-white active:bg-green-700 disabled:opacity-40"
        >
          投票開始
        </button>
        <button
          onClick={onEnd}
          disabled={!isOpen}
          className="rounded-xl bg-orange-500 py-4 font-bold text-white active:bg-orange-600 disabled:opacity-40"
        >
          投票終了
        </button>
        <button
          onClick={onReset}
          className="rounded-xl bg-slate-500 py-4 font-bold text-white active:bg-slate-600"
        >
          リセット
        </button>
      </div>

      {!isOpen && !winner && poll.totalVotes > 0 && poll.leaderId === null && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          同票です。下のボタンでテーマを選んでください。
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {poll.tallies.map((t) => {
          const isWinner = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPickTheme(t.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                isWinner
                  ? "border-yellow-400 bg-yellow-50 font-bold"
                  : "border-slate-200"
              }`}
              title="クリックでこのテーマに決定"
            >
              <span className="truncate">
                {isWinner && "🏆 "}
                {t.label}
              </span>
              <span className="ml-2 shrink-0 font-bold text-slate-700">
                {t.votes}票
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
