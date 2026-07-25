"use client";

import { useState, type FormEvent } from "react";
import { QUESTION_MAX_LENGTH } from "@/lib/moderation";
import type { SendResult } from "@/hooks/useComments";
import styles from "./participant.module.css";

type Props = {
  onSend: (text: string) => Promise<SendResult>;
};

export function QuestionForm({ onSend }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    const result = await onSend(text);
    setSending(false);
    if (result.ok) {
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } else {
      setError(result.reason);
    }
  };

  return (
    <section
      className={`${styles.contentCard} p-4`}
      aria-labelledby="question-title"
    >
      <h2 id="question-title" className="text-sm font-semibold">
        質問を送る
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        名前は表示されません。登壇者が会場で回答します。
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <label htmlFor="participant-question" className="sr-only">
          質問内容
        </label>
        <textarea
          id="participant-question"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          maxLength={QUESTION_MAX_LENGTH}
          rows={4}
          placeholder="例：プログラミング未経験でも大丈夫ですか？"
          aria-describedby="question-meta"
          className={`${styles.field} min-h-24 resize-none p-3 text-base leading-relaxed`}
        />
        <div
          id="question-meta"
          className="flex min-h-4 justify-between gap-3 px-0.5 text-xs"
        >
          <span className="text-red-600" role="alert">
            {error ?? ""}
          </span>
          <span className="shrink-0 text-slate-400">
            {text.length}/{QUESTION_MAX_LENGTH}
          </span>
        </div>
        <button
          type="submit"
          disabled={sending || text.trim().length === 0}
          className={`${styles.accentButton} min-h-11 px-4 py-2.5 text-sm font-semibold`}
        >
          {sending ? "送信しています…" : "この質問を送る"}
        </button>
        {sent && (
          <p
            className={`${styles.softCard} px-3 py-2 text-center text-sm`}
            role="status"
          >
            送信しました。回答をお楽しみに！
          </p>
        )}
      </form>
    </section>
  );
}
