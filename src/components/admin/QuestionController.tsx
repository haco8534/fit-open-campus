"use client";

import type { QuestionRecord } from "@/hooks/useQuestions";
import type { FeaturedQuestion } from "@/lib/session";

type Props = {
  questions: QuestionRecord[];
  featuredQuestion: FeaturedQuestion | null;
  onFeature: (q: QuestionRecord) => void;
  onUnfeature: () => void;
  onMarkAnswered: (q: QuestionRecord) => void;
  onDelete: (q: QuestionRecord) => void;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "未対応",
  featured: "表示中",
  answered: "回答済",
};

export function QuestionController({
  questions,
  featuredQuestion,
  onFeature,
  onUnfeature,
  onMarkAnswered,
  onDelete,
}: Props) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-700">質問一覧</h2>
        {featuredQuestion && (
          <button
            onClick={onUnfeature}
            className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-200"
          >
            表示中の質問を消す
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
        {questions.length === 0 ? (
          <p className="p-3 text-sm text-slate-400">質問はまだありません</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {questions.map((q) => {
              const isFeatured = featuredQuestion?.id === q.id;
              return (
                <li key={q.id} className="px-3 py-2">
                  <p className="mb-1.5 text-sm">{q.text}</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isFeatured
                          ? "bg-indigo-100 text-indigo-700"
                          : q.status === "answered"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isFeatured ? "表示中" : (STATUS_LABEL[q.status] ?? q.status)}
                    </span>
                    <button
                      onClick={() => (isFeatured ? onUnfeature() : onFeature(q))}
                      className="rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-100"
                    >
                      {isFeatured ? "非表示" : "画面に表示"}
                    </button>
                    <button
                      onClick={() => onMarkAnswered(q)}
                      className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-600 hover:bg-green-100"
                    >
                      回答済
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("この質問を削除しますか？")) onDelete(q);
                      }}
                      className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                    >
                      削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
