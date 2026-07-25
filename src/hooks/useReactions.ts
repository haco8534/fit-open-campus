"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  get,
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
 * メインモニター用：購読開始以降のリアクションイベントをコールバックで受け取る。
 * 既存分の判定は時刻ではなくキーで行う（端末時計のずれの影響を受けない）。
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

    const q = query(
      ref(db, sessionPath(sessionId, "reactions")),
      limitToLast(50)
    );
    const seen = new Set<string>();
    let cancelled = false;
    let detach: (() => void) | null = null;

    const attach = () => {
      if (cancelled) return;
      detach = onChildAdded(q, (snap) => {
        const key = snap.key;
        if (!key || seen.has(key)) return;
        seen.add(key);
        const v = snap.val();
        if (!v || !REACTION_TYPES.includes(v.type)) return;
        callbackRef.current({
          id: key,
          type: v.type,
          userId: v.userId ?? "",
          createdAt: v.createdAt ?? 0,
        });
      });
    };

    get(q)
      .then((snap) => {
        snap.forEach((child) => {
          if (child.key) seen.add(child.key);
        });
      })
      .catch(() => {})
      .finally(attach);

    return () => {
      cancelled = true;
      detach?.();
    };
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
