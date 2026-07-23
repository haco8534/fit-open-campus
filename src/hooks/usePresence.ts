"use client";

import { useEffect, useState } from "react";
import {
  onDisconnect,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
} from "firebase/database";
import { getDb } from "@/lib/firebase";
import { sessionPath } from "@/lib/session";

/** 参加者端末の接続状態を presence に登録する */
export function usePresence(sessionId: string, uid: string | null): void {
  useEffect(() => {
    const db = getDb();
    if (!db || !uid) return;

    const meRef = ref(db, sessionPath(sessionId, "presence", uid));
    const unsub = onValue(ref(db, ".info/connected"), (snap) => {
      if (snap.val() === true) {
        onDisconnect(meRef).remove();
        set(meRef, { connected: true, lastSeen: serverTimestamp() }).catch(
          () => {}
        );
      }
    });
    return () => {
      unsub();
      remove(meRef).catch(() => {});
    };
  }, [sessionId, uid]);
}

/** 接続人数（presenceの件数） */
export function useConnectionCount(sessionId: string): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    return onValue(ref(db, sessionPath(sessionId, "presence")), (snap) => {
      const v = snap.val() as Record<string, unknown> | null;
      setCount(v ? Object.keys(v).length : 0);
    });
  }, [sessionId]);

  return count;
}
