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
    <section className={`${styles.contentCard} p-4`} aria-labelledby="question-title">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <span className={`${styles.sectionLabel} text-[9px] font-black`}>QUESTION</span>
          <h2 id="question-title" className="mt-2 text-xl font-black tracking-tight">
            聞いてみたいことは？
          </h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
            名前は表示されません。登壇者が会場で回答します。
          </p>
        </div>
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
          className={`${styles.field} min-h-28 resize-none rounded-[14px_14px_5px_14px] p-3.5 text-base leading-relaxed`}
        />
        <div id="question-meta" className="flex min-h-4 justify-between px-1 text-[10px]">
          <span className="font-black text-red-600" role="alert">{error ?? ""}</span>
          <span className="font-bold text-slate-400">
            {text.length}/{QUESTION_MAX_LENGTH}
          </span>
        </div>
        <button
          type="submit"
          disabled={sending || text.trim().length === 0}
          className={`${styles.accentButton} min-h-12 rounded-[12px_12px_4px_12px] px-4 py-3 text-sm font-black transition disabled:opacity-60`}
        >
          {sending ? "送信しています…" : "この質問を送る"}
        </button>
        {sent && (
          <p
            className={`${styles.softCard} px-3 py-2.5 text-center text-sm font-black text-[var(--ink)]`}
            role="status"
          >
            送信しました。回答をお楽しみに！
          </p>
        )}
      </form>
    </section>
  );
}
