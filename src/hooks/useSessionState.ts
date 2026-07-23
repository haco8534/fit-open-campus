"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { firebaseConfigured, getDb } from "@/lib/firebase";
import { DEFAULT_STATE, statePath, type SessionState } from "@/lib/session";

export type SessionStateResult = {
  state: SessionState;
  /** Firebaseと接続できているか */
  connected: boolean;
  /** Firebase設定が存在するか */
  configured: boolean;
  /** stateを一度でも受信したか */
  loaded: boolean;
};

export function useSessionState(sessionId: string): SessionStateResult {
  const [state, setState] = useState<SessionState>(DEFAULT_STATE);
  const [connected, setConnected] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const unsubState = onValue(ref(db, statePath(sessionId)), (snap) => {
      const v = snap.val();
      if (v) {
        setState({ ...DEFAULT_STATE, ...v });
      }
      setLoaded(true);
    });
    const unsubConn = onValue(ref(db, ".info/connected"), (snap) => {
      setConnected(snap.val() === true);
    });
    return () => {
      unsubState();
      unsubConn();
    };
  }, [sessionId]);

  return { state, connected, configured: firebaseConfigured, loaded };
}
