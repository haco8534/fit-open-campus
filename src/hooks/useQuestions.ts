"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  limitToLast,
  onValue,
  push,
  query,
  ref,
  serverTimestamp,
} from "firebase/database";
import { getDb } from "@/lib/firebase";
import { sessionPath } from "@/lib/session";
import { validateQuestion } from "@/lib/moderation";
import { createRateLimiter, QUESTION_INTERVAL_MS } from "@/lib/rateLimit";
import type { SendResult } from "@/hooks/useComments";

export type QuestionStatus = "pending" | "featured" | "answered";

export type QuestionRecord = {
  id: string;
  text: string;
  userId: string;
  status: QuestionStatus;
  createdAt: number;
};

/** 管理者画面用：質問一覧（新しい順） */
export function useQuestions(sessionId: string, limit = 100): QuestionRecord[] {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    const q = query(
      ref(db, sessionPath(sessionId, "questions")),
      limitToLast(limit)
    );
    return onValue(q, (snap) => {
      const list: QuestionRecord[] = [];
      snap.forEach((child) => {
        const v = child.val();
        if (v && typeof v.text === "string") {
          list.push({
            id: child.key ?? "",
            text: v.text,
            userId: v.userId ?? "",
            status: (v.status as QuestionStatus) ?? "pending",
            createdAt: v.createdAt ?? 0,
          });
        }
      });
      list.reverse();
      setQuestions(list);
    });
  }, [sessionId, limit]);

  return questions;
}

/** 参加者用：質問送信 */
export function useSendQuestion(
  sessionId: string,
  uid: string | null
): (raw: string) => Promise<SendResult> {
  const limiterRef = useRef(createRateLimiter(QUESTION_INTERVAL_MS));

  return useCallback(
    async (raw: string): Promise<SendResult> => {
      const db = getDb();
      if (!db || !uid) {
        return { ok: false, reason: "接続中です。少し待ってください" };
      }
      const result = validateQuestion(raw);
      if (!result.ok) return result;
      if (!limiterRef.current.attempt()) {
        const sec = Math.ceil(limiterRef.current.remainingMs() / 1000);
        return { ok: false, reason: `送信間隔が短すぎます（あと${sec}秒）` };
      }
      try {
        await push(ref(db, sessionPath(sessionId, "questions")), {
          text: result.text,
          userId: uid,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        return { ok: true };
      } catch {
        return { ok: false, reason: "送信に失敗しました" };
      }
    },
    [sessionId, uid]
  );
}
