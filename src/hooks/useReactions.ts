"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  limitToLast,
  onChildAdded,
  push,
  query,
  ref,
  serverTimestamp,
} from "firebase/database";
import { getDb } from "@/lib/firebase";
import { sessionPath } from "@/lib/session";
import { REACTION_TYPES, type ReactionType } from "@/config/reactions";
import { createRateLimiter, REACTION_INTERVAL_MS } from "@/lib/rateLimit";

export type ReactionEvent = {
  id: string;
  type: ReactionType;
  userId: string;
  createdAt: number;
};

/**
 * メインモニター用：購読開始以降のリアクションイベントをコールバックで受け取る
 */
export function useReactionStream(
  sessionId: string,
  enabled: boolean,
  onReaction: (event: ReactionEvent) => void
): void {
  const callbackRef = useRef(onReaction);
  useEffect(() => {
    callbackRef.current = onReaction;
  }, [onReaction]);

  useEffect(() => {
    if (!enabled) return;
    const db = getDb();
    if (!db) return;

    const mountedAt = Date.now();
    const q = query(
      ref(db, sessionPath(sessionId, "reactions")),
      limitToLast(50)
    );
    return onChildAdded(q, (snap) => {
      const v = snap.val();
      if (!v || !REACTION_TYPES.includes(v.type)) return;
      if ((v.createdAt ?? 0) < mountedAt - 5000) return;
      callbackRef.current({
        id: snap.key ?? "",
        type: v.type,
        userId: v.userId ?? "",
        createdAt: v.createdAt ?? 0,
      });
    });
  }, [sessionId, enabled]);
}

/** 参加者用：リアクション送信（1秒に1回まで） */
export function useSendReaction(
  sessionId: string,
  uid: string | null
): (type: ReactionType) => boolean {
  const limiterRef = useRef(createRateLimiter(REACTION_INTERVAL_MS));

  return useCallback(
    (type: ReactionType): boolean => {
      const db = getDb();
      if (!db || !uid) return false;
      if (!limiterRef.current.attempt()) return false;
      push(ref(db, sessionPath(sessionId, "reactions")), {
        type,
        userId: uid,
        createdAt: serverTimestamp(),
      }).catch(() => {});
      return true;
    },
    [sessionId, uid]
  );
}
