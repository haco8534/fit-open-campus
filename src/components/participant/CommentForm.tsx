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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending || disabled) return;
    setSending(true);
    setError(null);
    const result = await onSend(text);
    setSending(false);
    if (result.ok) {
      setText("");
    } else {
      setError(result.reason);
    }
  };

  return (
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
          placeholder={
            disabled ? "コメント受付は停止中です" : "コメントを送る（30文字まで）"
          }
          disabled={disabled}
          className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-sky-500 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={disabled || sending || text.trim().length === 0}
          className="shrink-0 rounded-full bg-sky-600 px-5 py-3 font-bold text-white active:bg-sky-700 disabled:opacity-40"
        >
          送信
        </button>
      </div>
      <div className="flex justify-between px-2 text-xs">
        <span className="text-red-500">{error ?? ""}</span>
        <span className="text-slate-400">
          {text.length}/{COMMENT_MAX_LENGTH}
        </span>
      </div>
    </form>
  );
}
