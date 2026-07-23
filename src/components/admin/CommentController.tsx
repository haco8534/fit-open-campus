"use client";

import type { CommentRecord } from "@/hooks/useComments";

type Props = {
  comments: CommentRecord[];
  commentsEnabled: boolean;
  reactionsEnabled: boolean;
  onToggleComments: () => void;
  onToggleReactions: () => void;
  onClearComments: () => void;
  onBlockUser: (uid: string) => void;
};

export function CommentController({
  comments,
  commentsEnabled,
  reactionsEnabled,
  onToggleComments,
  onToggleReactions,
  onClearComments,
  onBlockUser,
}: Props) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-bold text-slate-700">コメント・リアクション</h2>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          onClick={onToggleComments}
          className={`rounded-xl py-4 font-bold text-white ${
            commentsEnabled
              ? "bg-green-600 active:bg-green-700"
              : "bg-red-500 active:bg-red-600"
          }`}
        >
          コメント {commentsEnabled ? "ON" : "OFF"}
        </button>
        <button
          onClick={onToggleReactions}
          className={`rounded-xl py-4 font-bold text-white ${
            reactionsEnabled
              ? "bg-green-600 active:bg-green-700"
              : "bg-red-500 active:bg-red-600"
          }`}
        >
          リアクション {reactionsEnabled ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => {
            if (confirm("すべてのコメントを削除しますか？")) {
              onClearComments();
            }
          }}
          className="rounded-xl bg-slate-500 py-4 font-bold text-white active:bg-slate-600"
        >
          全削除
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
        {comments.length === 0 ? (
          <p className="p-3 text-sm text-slate-400">コメントはまだありません</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {comments.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{c.text}</span>
                <button
                  onClick={() => {
                    if (confirm("この端末をブロックしますか？")) {
                      onBlockUser(c.userId);
                    }
                  }}
                  className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                >
                  ブロック
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
