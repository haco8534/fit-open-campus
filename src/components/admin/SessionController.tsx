"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  sessionActive: boolean;
  connectionCount: number;
  connected: boolean;
  onToggleActive: () => void;
  onResetSession: () => void;
};

const SESSION_SECONDS = 10 * 60;

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionController({
  sessionActive,
  connectionCount,
  connected,
  onToggleActive,
  onResetSession,
}: Props) {
  // 持ち時間10分のローカルタイマー
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-700">セッション管理</h2>
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500 animate-pulse"
            }`}
          />
          接続 {connectionCount} 人
        </span>
      </div>

      {/* タイマー */}
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-100 p-3">
        <span
          className={`font-mono text-4xl font-bold ${
            remaining <= 60 ? "text-red-600" : "text-slate-800"
          }`}
        >
          {formatTime(remaining)}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="rounded-lg bg-slate-700 px-4 py-2 font-bold text-white active:bg-slate-800"
          >
            {running ? "一時停止" : "スタート"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setRemaining(SESSION_SECONDS);
            }}
            className="rounded-lg bg-slate-400 px-4 py-2 font-bold text-white active:bg-slate-500"
          >
            リセット
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            const message = sessionActive
              ? "参加型表示をすべて停止します。よろしいですか？"
              : "参加型表示を再開しますか？";
            if (confirm(message)) onToggleActive();
          }}
          className={`rounded-xl py-4 font-bold text-white ${
            sessionActive
              ? "bg-red-600 active:bg-red-700"
              : "bg-green-600 active:bg-green-700"
          }`}
        >
          {sessionActive ? "🚨 緊急停止" : "▶ 再開"}
        </button>
        <button
          onClick={() => {
            if (
              confirm(
                "セッションを初期化します。コメント・リアクション・投票・質問がすべて削除されます。よろしいですか？"
              )
            ) {
              onResetSession();
            }
          }}
          className="rounded-xl bg-slate-600 py-4 font-bold text-white active:bg-slate-700"
        >
          初期化
        </button>
      </div>
    </section>
  );
}
