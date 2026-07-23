"use client";

import { useState, type FormEvent } from "react";
import { COMMENT_MAX_LENGTH } from "@/lib/moderation";
import type { SendResult } from "@/hooks/useComments";

type Props = {
  onSend: (text: string) => Promise<SendResult>;
  disabled?: boolean;
};

/** 参加者用コメント入力フォーム */
export function CommentForm({ onSend, disabled = false }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending || disabled) return;
    setSending(true);
    setError(null);
    const result = await onSend(text);
    setSending(false);
    if (result.ok) {
      setText("");
      setJustSent(true);
      setTimeout(() => setJustSent(false), 1500);
    } else {
      setError(result.reason);
    }
  };

  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-lg">
      <p className="mb-2 text-center text-sm font-black text-slate-700">
        {disabled ? "コメント受付は停止中です" : "💬 コメントを画面に流そう"}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder={disabled ? "いまは送れません" : "例：おもしろい！"}
            disabled={disabled}
            className="min-w-0 flex-1 rounded-full border-2 border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-fuchsia-400 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={disabled || sending || text.trim().length === 0}
            className="shrink-0 rounded-full bg-gradient-to-b from-fuchsia-500 to-purple-600 px-5 py-3 font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
          >
            {justSent ? "✓" : "送信"}
          </button>
        </div>
        <div className="flex justify-between px-2 text-xs">
          <span className="font-bold text-red-500">{error ?? ""}</span>
          <span className="text-slate-400">
            {text.length}/{COMMENT_MAX_LENGTH}
          </span>
        </div>
      </form>
    </div>
  );
}
