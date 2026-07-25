"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const FIRST_RETRY_MS = 500;
const MAX_RETRY_MS = 15000;

export type AnonymousAuthResult = {
  /** 匿名ユーザーID。未確立のあいだは null */
  uid: string | null;
  /** サインインに失敗して再試行中か（参加者に案内を出すために使う） */
  failed: boolean;
};

/**
 * 匿名認証を行い、匿名ユーザーIDを返す。
 * 会場Wi-Fiの一時的な不調でサインインが落ちても指数バックオフで再試行し続ける。
 * （リトライしないと onAuthStateChanged が再発火せず uid が null のまま固定され、
 *   参加者は永久に「接続中…」から進めなくなる）
 */
export function useAnonymousAuth(): AnonymousAuthResult {
  const [uid, setUid] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    let cancelled = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const signIn = () => {
      if (cancelled) return;
      signInAnonymously(auth).catch((e) => {
        if (cancelled) return;
        console.error("匿名ログインに失敗しました", e);
        setFailed(true);
        const delay = Math.min(MAX_RETRY_MS, FIRST_RETRY_MS * 2 ** attempt);
        attempt += 1;
        timer = setTimeout(signIn, delay);
      });
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (cancelled) return;
      if (user) {
        attempt = 0;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        setFailed(false);
        setUid(user.uid);
      } else {
        setUid(null);
        signIn();
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { uid, failed };
}
