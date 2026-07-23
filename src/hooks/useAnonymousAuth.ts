"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

/** 匿名認証を行い、匿名ユーザーIDを返す */
export function useAnonymousAuth(): string | null {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        signInAnonymously(auth).catch((e) => {
          console.error("匿名ログインに失敗しました", e);
        });
      }
    });
    return unsubscribe;
  }, []);

  return uid;
}
