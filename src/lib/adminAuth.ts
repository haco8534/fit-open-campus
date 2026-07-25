import { ref, serverTimestamp, set, update, type Database } from "firebase/database";
import { statePath } from "./session";

const UNLOCK_KEY = "fit-oc-admin-unlocked";

/**
 * 管理者パスワードによるログイン。
 *
 * パスワードそのものはアプリに埋め込まない。入力値を adminAuth/{uid} に書き、
 * Realtime Database のルール側で adminPasscode と突き合わせて検証する。
 * つまり配信されたJSを読んでもパスワードは分からず、合っているかどうかは
 * サーバー（ルール）が判定する。
 *
 * Firebaseコンソールでの準備（最初の1回だけ）:
 *   adminPasscode: "任意のパスワード"
 */
export async function signInAdmin(
  db: Database,
  sessionId: string,
  uid: string,
  passcode: string
): Promise<boolean> {
  try {
    await set(ref(db, `adminAuth/${uid}`), passcode);
  } catch {
    return false;
  }

  try {
    // 管理者しか書けない場所に書けるかどうかで判定する。
    // updatedAt を更新するだけなので進行中の表示には影響しない。
    await update(ref(db, statePath(sessionId)), { updatedAt: serverTimestamp() });
  } catch {
    return false;
  }

  markAdminUnlocked();
  return true;
}

/** タブを開いているあいだはパスワードの再入力を省く */
export function isAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function markAdminUnlocked(): void {
  try {
    window.sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    // プライベートブラウズ等で保存できなくても動作に支障はない
  }
}
