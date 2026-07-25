import {
  ref,
  remove,
  serverTimestamp,
  set,
  update,
  type Database,
} from "firebase/database";
import { getSlide, type SlideMode } from "@/config/slides";

export const DEFAULT_SESSION_ID =
  process.env.NEXT_PUBLIC_SESSION_ID ?? "open-campus-2026";

export type SessionMode = SlideMode;

export type FeaturedQuestion = {
  id: string;
  text: string;
};

export type SessionState = {
  currentSlide: number;
  /**
   * 参加者画面のフェーズ。常に表示中のスライドの mode と一致する
   * （進行役が別途モードを切り替える操作は持たない）。
   */
  mode: SessionMode;
  commentsEnabled: boolean;
  reactionsEnabled: boolean;
  sessionActive: boolean;
  /** メインモニターに表示中の質問 */
  featuredQuestion: FeaturedQuestion | null;
  updatedAt: number;
};

export const DEFAULT_STATE: SessionState = {
  currentSlide: 1,
  mode: "reaction",
  commentsEnabled: true,
  reactionsEnabled: true,
  sessionActive: true,
  featuredQuestion: null,
  updatedAt: 0,
};

export function sessionPath(sessionId: string, ...parts: string[]): string {
  return ["sessions", sessionId, ...parts].join("/");
}

export function statePath(sessionId: string): string {
  return sessionPath(sessionId, "state");
}

export async function updateState(
  db: Database,
  sessionId: string,
  patch: Partial<Omit<SessionState, "updatedAt">>
): Promise<void> {
  await update(ref(db, statePath(sessionId)), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * スライド移動。参加者画面のモードもスライドに合わせて切り替える。
 *
 * 投票スライドに入った瞬間が投票の開始タイミングであり、同時にリセットでもある
 * （進行役が開始／終了を操作することはない。投票は締め切らず、
 *   結果を見ながら話すあいだもずっと受け付け続ける）。
 *
 * 同じスライドへの移動は何も書き込まない。端のスライドで「次へ」を連打しても
 * 票が消えないようにするため。
 */
export async function goToSlide(
  db: Database,
  sessionId: string,
  slideId: number,
  options: { currentSlide?: number } = {}
): Promise<void> {
  const slide = getSlide(slideId);
  if (options.currentSlide === slide.id) return;

  if (slide.mode === "poll") {
    await remove(ref(db, sessionPath(sessionId, "poll", "voters")));
    await set(ref(db, sessionPath(sessionId, "poll", "status")), "open");
  }

  await updateState(db, sessionId, {
    currentSlide: slide.id,
    mode: slide.mode,
  });
}

export async function clearComments(
  db: Database,
  sessionId: string
): Promise<void> {
  await remove(ref(db, sessionPath(sessionId, "comments")));
}

export async function blockUser(
  db: Database,
  sessionId: string,
  uid: string
): Promise<void> {
  await set(ref(db, sessionPath(sessionId, "blockedUsers", uid)), true);
}

export async function setQuestionStatus(
  db: Database,
  sessionId: string,
  questionId: string,
  status: "pending" | "featured" | "answered"
): Promise<void> {
  await set(
    ref(db, sessionPath(sessionId, "questions", questionId, "status")),
    status
  );
}

export async function deleteQuestion(
  db: Database,
  sessionId: string,
  questionId: string
): Promise<void> {
  await remove(ref(db, sessionPath(sessionId, "questions", questionId)));
}

/** メインモニターに質問を表示する（null で非表示） */
export async function featureQuestion(
  db: Database,
  sessionId: string,
  question: FeaturedQuestion | null
): Promise<void> {
  await updateState(db, sessionId, { featuredQuestion: question });
}

/** 緊急停止・再開 */
export async function setSessionActive(
  db: Database,
  sessionId: string,
  active: boolean
): Promise<void> {
  await updateState(db, sessionId, { sessionActive: active });
}

/** セッション状態の初期化（コメント・リアクション・質問・投票をすべて消す） */
export async function resetSession(
  db: Database,
  sessionId: string
): Promise<void> {
  await Promise.all([
    remove(ref(db, sessionPath(sessionId, "comments"))),
    remove(ref(db, sessionPath(sessionId, "reactions"))),
    remove(ref(db, sessionPath(sessionId, "questions"))),
    remove(ref(db, sessionPath(sessionId, "poll", "voters"))),
    set(ref(db, sessionPath(sessionId, "poll", "status")), "closed"),
  ]);
  await set(ref(db, statePath(sessionId)), {
    ...DEFAULT_STATE,
    updatedAt: serverTimestamp(),
  });
}
