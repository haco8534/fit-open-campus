"use client";

import { useState, type FormEvent } from "react";
import { QUESTION_MAX_LENGTH } from "@/lib/moderation";
import type { SendResult } from "@/hooks/useComments";

type Props = {
  onSend: (text: string) => Promise<SendResult>;
};

/** 参加者用質問投稿フォーム */
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-center text-lg font-bold text-slate-800">
        質問してみよう
      </h2>
      <p className="text-center text-xs text-slate-500">
        匿名で送信されます。登壇者が確認して答えます。
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        maxLength={QUESTION_MAX_LENGTH}
        rows={3}
        placeholder="例：プログラミング未経験でも大丈夫ですか？"
        className="resize-none rounded-2xl border border-slate-300 bg-white p-4 text-base outline-none focus:border-sky-500"
      />
      <div className="flex justify-between px-2 text-xs">
        <span className="text-red-500">{error ?? ""}</span>
        <span className="text-slate-400">
          {text.length}/{QUESTION_MAX_LENGTH}
        </span>
      </div>
      <button
        type="submit"
        disabled={sending || text.trim().length === 0}
        className="rounded-full bg-sky-600 py-3 font-bold text-white active:bg-sky-700 disabled:opacity-40"
      >
        質問を送る
      </button>
      {sent && (
        <p className="text-center text-sm font-bold text-green-600">
          送信しました！ありがとうございます 🎉
        </p>
      )}
    </form>
  );
}
