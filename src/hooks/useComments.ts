"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  limitToLast,
  onChildAdded,
  onValue,
  push,
  query,
  ref,
  serverTimestamp,
} from "firebase/database";
import { getDb } from "@/lib/firebase";
import { sessionPath } from "@/lib/session";
import { validateComment } from "@/lib/moderation";
import { COMMENT_INTERVAL_MS, createRateLimiter } from "@/lib/rateLimit";

export type CommentRecord = {
  id: string;
  text: string;
  userId: string;
  status: string;
  createdAt: number;
};

/** 管理者画面用：最新コメント一覧（新しい順） */
export function useRecentComments(
  sessionId: string,
  limit = 50
): CommentRecord[] {
  const [comments, setComments] = useState<CommentRecord[]>([]);

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    const q = query(
      ref(db, sessionPath(sessionId, "comments")),
      limitToLast(limit)
    );
    return onValue(q, (snap) => {
      const list: CommentRecord[] = [];
      snap.forEach((child) => {
        const v = child.val();
        if (v && typeof v.text === "string") {
          list.push({
            id: child.key ?? "",
            text: v.text,
            userId: v.userId ?? "",
            status: v.status ?? "approved",
            createdAt: v.createdAt ?? 0,
          });
        }
      });
      list.reverse();
      setComments(list);
    });
  }, [sessionId, limit]);

  return comments;
}

/**
 * メインモニター用：購読開始以降に追加されたコメントをコールバックで受け取る。
 * 過去分は流さない（途中参加・リロード時に古いコメントが再生されるのを防ぐ）。
 */
export function useCommentStream(
  sessionId: string,
  enabled: boolean,
  onComment: (comment: CommentRecord) => void
): void {
  const callbackRef = useRef(onComment);
  useEffect(() => {
    callbackRef.current = onComment;
  }, [onComment]);

  useEffect(() => {
    if (!enabled) return;
    const db = getDb();
    if (!db) return;

    const mountedAt = Date.now();
    const q = query(
      ref(db, sessionPath(sessionId, "comments")),
      limitToLast(30)
    );
    return onChildAdded(q, (snap) => {
      const v = snap.val();
      if (!v || typeof v.text !== "string") return;
      // サーバー時刻とのずれを考慮して5秒の余裕を持たせる
      if ((v.createdAt ?? 0) < mountedAt - 5000) return;
      callbackRef.current({
        id: snap.key ?? "",
        text: v.text,
        userId: v.userId ?? "",
        status: v.status ?? "approved",
        createdAt: v.createdAt ?? 0,
      });
    });
  }, [sessionId, enabled]);
}

export type SendResult = { ok: true } | { ok: false; reason: string };

/** 参加者用：コメント送信（バリデーション・連投制限・同文連投禁止つき） */
export function useSendComment(
  sessionId: string,
  uid: string | null
): (raw: string) => Promise<SendResult> {
  const limiterRef = useRef(createRateLimiter(COMMENT_INTERVAL_MS));
  const lastTextRef = useRef<string>("");

  return useCallback(
    async (raw: string): Promise<SendResult> => {
      const db = getDb();
      if (!db || !uid) {
        return { ok: false, reason: "接続中です。少し待ってください" };
      }
      const result = validateComment(raw);
      if (!result.ok) return result;
      if (result.text === lastTextRef.current) {
        return { ok: false, reason: "同じコメントは連続で送れません" };
      }
      if (!limiterRef.current.attempt()) {
        const sec = Math.ceil(limiterRef.current.remainingMs() / 1000);
        return { ok: false, reason: `送信間隔が短すぎます（あと${sec}秒）` };
      }
      try {
        await push(ref(db, sessionPath(sessionId, "comments")), {
          text: result.text,
          userId: uid,
          status: "approved",
          createdAt: serverTimestamp(),
        });
        lastTextRef.current = result.text;
        return { ok: true };
      } catch {
        return { ok: false, reason: "送信に失敗しました" };
      }
    },
    [sessionId, uid]
  );
}
