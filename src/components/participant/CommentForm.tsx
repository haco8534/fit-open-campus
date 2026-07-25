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
    <section
      className={`${styles.contentCard} p-4`}
      aria-labelledby="comment-title"
    >
      <h2 id="comment-title" className="text-sm font-semibold">
        {disabled ? "コメントの受付を停止しています" : "コメントを送る"}
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        匿名で会場のスクリーンに流れます
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
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
            placeholder={
              disabled ? "いまは送れません" : "例：その話、もっと聞きたいです"
            }
            disabled={disabled}
            aria-describedby="comment-meta"
            className={`${styles.field} min-h-11 min-w-0 flex-1 px-3 py-2 text-base`}
          />
          <button
            type="submit"
            disabled={disabled || sending || text.trim().length === 0}
            className={`${styles.accentButton} min-h-11 shrink-0 px-4 text-sm font-semibold`}
          >
            {sending ? "送信中" : justSent ? "送信済" : "送信"}
          </button>
        </div>
        <div
          id="comment-meta"
          className="flex min-h-4 justify-between gap-3 px-0.5 text-xs"
        >
          <span className="text-red-600" role="alert">
            {error ?? ""}
          </span>
          <span className="shrink-0 text-slate-400">
            {text.length}/{COMMENT_MAX_LENGTH}
          </span>
        </div>
      </form>
    </section>
  );
}
