"use client";

import { useState, type FormEvent } from "react";
import { COMMENT_MAX_LENGTH } from "@/lib/moderation";
import type { SendResult } from "@/hooks/useComments";
import styles from "./participant.module.css";

type Props = {
  onSend: (text: string) => Promise<SendResult>;
  disabled?: boolean;
};

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
    <section className={`${styles.contentCard} p-4`} aria-labelledby="comment-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <span className={`${styles.sectionLabel} text-[9px] font-black`}>COMMENT</span>
          <h2 id="comment-title" className="mt-2 text-lg font-black tracking-tight">
            {disabled ? "コメント受付は停止中です" : "ひとこと、スクリーンへ。"}
          </h2>
        </div>
        <span className="shrink-0 text-[10px] font-black text-slate-400">匿名</span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="participant-comment" className="sr-only">
          コメント
        </label>
        <div className="flex gap-2">
          <input
            id="participant-comment"
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder={disabled ? "いまは送れません" : "例：その話、もっと聞きたい！"}
            disabled={disabled}
            aria-describedby="comment-meta"
            className={`${styles.field} min-h-12 min-w-0 flex-1 rounded-[12px_12px_4px_12px] px-3.5 py-2.5 text-base disabled:bg-stone-200`}
          />
          <button
            type="submit"
            disabled={disabled || sending || text.trim().length === 0}
            className={`${styles.accentButton} min-h-12 shrink-0 rounded-[12px_12px_4px_12px] px-4 text-sm font-black transition disabled:opacity-60`}
          >
            {sending ? "送信中" : justSent ? "送信済" : "送る"}
          </button>
        </div>
        <div id="comment-meta" className="flex min-h-4 justify-between px-1 text-[10px]">
          <span className="font-black text-red-600" role="alert">{error ?? ""}</span>
          <span className="font-bold text-slate-400">
            {text.length}/{COMMENT_MAX_LENGTH}
          </span>
        </div>
      </form>
    </section>
  );
}
